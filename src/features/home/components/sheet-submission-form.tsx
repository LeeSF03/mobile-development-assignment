import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "convex/react";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { Description } from "heroui-native/description";
import { FieldError } from "heroui-native/field-error";
import { Input } from "heroui-native/input";
import { Label } from "heroui-native/label";
import { TextField } from "heroui-native/text-field";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";

import { useGoogleDriveAccess } from "@/features/home/hooks/use-google-drive-access";
import {
  sheetSubmissionFormSchema,
  type SheetSubmissionFormValues,
} from "@/features/home/lib/sheet-submission-form-schema";
import { api } from "@/lib/convex-api";

type SheetSubmissionFormProps = {
  connection:
    | {
        spreadsheetName: string;
        spreadsheetUrl: string;
      }
    | null
    | undefined;
  userEmail: string;
};

export function SheetSubmissionForm({
  connection,
  userEmail,
}: SheetSubmissionFormProps) {
  const submitFormToGoogleSheet = useAction(
    api.googleSheets.submitFormToGoogleSheet,
  );
  const {
    errorMessage: driveAccessError,
    isPending: isRequestingDriveAccess,
    requestGoogleDriveAccess,
  } = useGoogleDriveAccess();
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showDriveAccessPrompt, setShowDriveAccessPrompt] = useState(false);
  const form = useForm<SheetSubmissionFormValues>({
    defaultValues: {
      name: "",
      role: "",
    },
    resolver: zodResolver(sheetSubmissionFormSchema),
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    setSubmitFeedback(null);

    try {
      const result = await submitFormToGoogleSheet(values);

      if (!result.ok) {
        setSubmitError(result.message);
        setShowDriveAccessPrompt(result.code === "GOOGLE_DRIVE_SCOPE_REQUIRED");
        return;
      }

      setShowDriveAccessPrompt(false);
      setSubmitFeedback(
        result.createdSpreadsheet
          ? "Spreadsheet created and row added successfully."
          : "Row added to your spreadsheet successfully.",
      );
      form.reset();
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Submitting to Google Sheets failed.",
      );
    }
  });

  return (
    <View className="gap-6">
      <Card className="w-full">
        <Card.Body className="gap-5">
          <View className="gap-1">
            <Card.Title>Submit to Google Sheets</Card.Title>
            <Card.Description>
              The form data is written to a spreadsheet in your Google Drive.
            </Card.Description>
          </View>

          <View className="gap-4">
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <TextField isInvalid={fieldState.invalid} isRequired>
                  <Label>Name</Label>
                  <Input
                    autoCapitalize="words"
                    onBlur={field.onBlur}
                    onChangeText={field.onChange}
                    placeholder="Jane Doe"
                    returnKeyType="next"
                    value={field.value}
                  />
                  <Description>
                    Use the name you want recorded in the sheet.
                  </Description>
                  {fieldState.error ? (
                    <FieldError>{fieldState.error.message}</FieldError>
                  ) : null}
                </TextField>
              )}
            />

            <Controller
              control={form.control}
              name="role"
              render={({ field, fieldState }) => (
                <TextField isInvalid={fieldState.invalid} isRequired>
                  <Label>Role</Label>
                  <Input
                    autoCapitalize="words"
                    onBlur={field.onBlur}
                    onChangeText={field.onChange}
                    placeholder="Product Designer"
                    returnKeyType="done"
                    value={field.value}
                  />
                  <Description>
                    Keep it short. This becomes the second column.
                  </Description>
                  {fieldState.error ? (
                    <FieldError>{fieldState.error.message}</FieldError>
                  ) : null}
                </TextField>
              )}
            />
          </View>

          <Button
            isDisabled={form.formState.isSubmitting || isRequestingDriveAccess}
            onPress={() => {
              handleSubmit().catch(() => {});
            }}
          >
            {form.formState.isSubmitting ? "Sending..." : "Submit to Sheet"}
          </Button>

          {showDriveAccessPrompt || !connection ? (
            <View className="gap-3 rounded-2xl border border-border bg-muted/40 p-4">
              <View className="gap-1">
                <Text className="text-sm font-medium text-foreground">
                  Google Drive access
                </Text>
                <Text className="text-sm leading-5 text-muted-foreground">
                  Grant `drive.file` access so the app can create and update
                  your spreadsheet.
                </Text>
              </View>

              <Button
                isDisabled={
                  form.formState.isSubmitting || isRequestingDriveAccess
                }
                onPress={() => {
                  requestGoogleDriveAccess().catch(() => {});
                }}
                variant="secondary"
              >
                {isRequestingDriveAccess
                  ? "Opening Google..."
                  : "Grant Google Drive Access"}
              </Button>

              {driveAccessError ? (
                <Text className="text-sm leading-5 text-danger">
                  {driveAccessError}
                </Text>
              ) : null}
            </View>
          ) : null}

          {submitFeedback ? (
            <Text className="text-sm leading-5 text-success">
              {submitFeedback}
            </Text>
          ) : null}

          {submitError ? (
            <Text className="text-sm leading-5 text-danger">{submitError}</Text>
          ) : null}
        </Card.Body>
      </Card>

      <Card className="w-full">
        <Card.Body className="gap-4">
          <View className="gap-1">
            <Card.Title>Sheet status</Card.Title>
            <Card.Description>{userEmail}</Card.Description>
          </View>

          {connection === undefined ? (
            <Text className="text-sm leading-5 text-muted-foreground">
              Loading sheet connection...
            </Text>
          ) : connection ? (
            <View className="gap-2">
              <Text className="text-sm leading-5 text-foreground">
                Connected sheet: {connection.spreadsheetName}
              </Text>
              <Text className="text-xs leading-5 text-muted-foreground">
                {connection.spreadsheetUrl}
              </Text>
            </View>
          ) : (
            <Text className="text-sm leading-5 text-muted-foreground">
              No spreadsheet has been created for this account yet.
            </Text>
          )}
        </Card.Body>
      </Card>
    </View>
  );
}
