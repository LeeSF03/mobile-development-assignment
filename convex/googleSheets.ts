import { ConvexError, v } from "convex/values";

import { internal } from "./_generated/api";
import {
  action,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { authComponent, createAuth } from "./betterAuth/config";

const DRIVE_FILE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const SHEET_NAME = "Form Responses";
const SPREADSHEET_TITLE = "Mobile Development Form Responses";
const HEADER_RANGE = `${SHEET_NAME}!A1:D1`;
const APPEND_RANGE = `${SHEET_NAME}!A:D`;

type SubmissionErrorCode =
  | "GOOGLE_ACCOUNT_NOT_LINKED"
  | "GOOGLE_DRIVE_SCOPE_REQUIRED"
  | "GOOGLE_ACCESS_TOKEN_UNAVAILABLE"
  | "INVALID_INPUT";

type SubmissionFailure = {
  code: SubmissionErrorCode;
  message: string;
  ok: false;
};

type SubmissionSuccess = {
  createdSpreadsheet: boolean;
  ok: true;
  spreadsheetId: string;
  spreadsheetUrl: string;
};

function invalidInput(message: string): SubmissionFailure {
  return {
    code: "INVALID_INPUT",
    message,
    ok: false,
  };
}

function normalizeField(value: string, label: string) {
  const normalized = value.trim();

  if (normalized.length < 2) {
    return invalidInput(`${label} must be at least 2 characters.`);
  }

  if (normalized.length > 80) {
    return invalidInput(`${label} must be at most 80 characters.`);
  }

  return normalized;
}

async function fetchGoogleJson<T>(
  url: string,
  accessToken: string,
  init: RequestInit,
) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();

    throw new ConvexError({
      body: errorBody,
      message: "Google Sheets request failed.",
      status: response.status,
    });
  }

  return (await response.json()) as T;
}

async function createSpreadsheet(accessToken: string) {
  const spreadsheet = await fetchGoogleJson<{
    spreadsheetId: string;
    spreadsheetUrl: string;
  }>("https://sheets.googleapis.com/v4/spreadsheets", accessToken, {
    body: JSON.stringify({
      properties: {
        title: SPREADSHEET_TITLE,
      },
      sheets: [
        {
          properties: {
            title: SHEET_NAME,
          },
        },
      ],
    }),
    method: "POST",
  });

  await fetchGoogleJson(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet.spreadsheetId}/values/${encodeURIComponent(HEADER_RANGE)}?valueInputOption=RAW`,
    accessToken,
    {
      body: JSON.stringify({
        values: [["Submitted At", "Name", "Role", "Email"]],
      }),
      method: "PUT",
    },
  );

  return {
    spreadsheetId: spreadsheet.spreadsheetId,
    spreadsheetName: SPREADSHEET_TITLE,
    spreadsheetUrl: spreadsheet.spreadsheetUrl,
  };
}

async function appendSubmissionRow(args: {
  accessToken: string;
  email: string;
  name: string;
  role: string;
  spreadsheetId: string;
}) {
  await fetchGoogleJson(
    `https://sheets.googleapis.com/v4/spreadsheets/${args.spreadsheetId}/values/${encodeURIComponent(APPEND_RANGE)}:append?insertDataOption=INSERT_ROWS&valueInputOption=USER_ENTERED`,
    args.accessToken,
    {
      body: JSON.stringify({
        values: [[new Date().toISOString(), args.name, args.role, args.email]],
      }),
      method: "POST",
    },
  );
}

export const getSheetConnection = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);

    return await ctx.db
      .query("googleSheetConnections")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
  },
});

export const getConnectionByUserId = internalQuery({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("googleSheetConnections")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const upsertConnection = internalMutation({
  args: {
    spreadsheetId: v.string(),
    spreadsheetName: v.string(),
    spreadsheetUrl: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("googleSheetConnections")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        spreadsheetId: args.spreadsheetId,
        spreadsheetName: args.spreadsheetName,
        spreadsheetUrl: args.spreadsheetUrl,
        updatedAt: now,
      });
      return;
    }

    await ctx.db.insert("googleSheetConnections", {
      createdAt: now,
      spreadsheetId: args.spreadsheetId,
      spreadsheetName: args.spreadsheetName,
      spreadsheetUrl: args.spreadsheetUrl,
      updatedAt: now,
      userId: args.userId,
    });
  },
});

export const submitFormToGoogleSheet = action({
  args: {
    name: v.string(),
    role: v.string(),
  },
  handler: async (
    ctx,
    args,
  ): Promise<SubmissionFailure | SubmissionSuccess> => {
    const name = normalizeField(args.name, "Name");
    if (typeof name !== "string") {
      return name;
    }

    const role = normalizeField(args.role, "Role");
    if (typeof role !== "string") {
      return role;
    }

    const user = await authComponent.getAuthUser(ctx);
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    const accounts = await auth.api.listUserAccounts({
      headers,
    });
    const googleAccount = accounts.find(
      (account) => account.providerId === "google",
    );

    if (!googleAccount) {
      return {
        code: "GOOGLE_ACCOUNT_NOT_LINKED",
        message: "Your Google account is not linked to this session.",
        ok: false,
      };
    }

    if (!googleAccount.scopes.includes(DRIVE_FILE_SCOPE)) {
      return {
        code: "GOOGLE_DRIVE_SCOPE_REQUIRED",
        message: "Grant Google Drive access before sending form data.",
        ok: false,
      };
    }

    const token = await auth.api.getAccessToken({
      body: {
        accountId: googleAccount.accountId,
        providerId: "google",
      },
      headers,
    });

    if (!token?.accessToken) {
      return {
        code: "GOOGLE_ACCESS_TOKEN_UNAVAILABLE",
        message: "Google access token is unavailable for this account.",
        ok: false,
      };
    }

    const connection = await ctx.runQuery(
      internal.googleSheets.getConnectionByUserId,
      {
        userId: user._id,
      },
    );
    let createdSpreadsheet = false;
    let targetSheet = connection
      ? {
          spreadsheetId: connection.spreadsheetId,
          spreadsheetUrl: connection.spreadsheetUrl,
        }
      : null;

    if (!targetSheet) {
      const spreadsheet = await createSpreadsheet(token.accessToken);
      createdSpreadsheet = true;

      await ctx.runMutation(internal.googleSheets.upsertConnection, {
        spreadsheetId: spreadsheet.spreadsheetId,
        spreadsheetName: spreadsheet.spreadsheetName,
        spreadsheetUrl: spreadsheet.spreadsheetUrl,
        userId: user._id,
      });

      targetSheet = {
        spreadsheetId: spreadsheet.spreadsheetId,
        spreadsheetUrl: spreadsheet.spreadsheetUrl,
      };
    }

    await appendSubmissionRow({
      accessToken: token.accessToken,
      email: user.email,
      name,
      role,
      spreadsheetId: targetSheet.spreadsheetId,
    });

    return {
      createdSpreadsheet,
      ok: true,
      spreadsheetId: targetSheet.spreadsheetId,
      spreadsheetUrl: targetSheet.spreadsheetUrl,
    };
  },
});
