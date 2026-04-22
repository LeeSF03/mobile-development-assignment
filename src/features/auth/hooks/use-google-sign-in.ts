import { useState } from "react";

import { authClient } from "@/lib/auth-client";

export function useGoogleSignIn() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const signInWithGoogle = async () => {
    setErrorMessage(null);
    setIsPending(true);

    const { error } = await authClient.signIn.social({
      callbackURL: "/",
      provider: "google",
    });

    if (error) {
      setErrorMessage(error.message ?? "Google sign-in failed.");
    }

    setIsPending(false);
  };

  return {
    errorMessage,
    isPending,
    signInWithGoogle,
  };
}
