import { useState } from "react";

import { authClient } from "@/lib/auth-client";

const DRIVE_FILE_SCOPE = "https://www.googleapis.com/auth/drive.file";

export function useGoogleDriveAccess() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const requestGoogleDriveAccess = async () => {
    setErrorMessage(null);
    setIsPending(true);

    const { error } = await authClient.linkSocial({
      callbackURL: "/",
      provider: "google",
      scopes: [DRIVE_FILE_SCOPE],
    });

    if (error) {
      setErrorMessage(error.message ?? "Google Drive access request failed.");
      setIsPending(false);
      return false;
    }

    setIsPending(false);
    return true;
  };

  return {
    errorMessage,
    isPending,
    requestGoogleDriveAccess,
  };
}
