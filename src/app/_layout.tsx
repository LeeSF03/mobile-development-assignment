import { Stack } from "expo-router";
import "@/global.css";
import { authClient } from "@/lib/auth-client";
import { AuthLoadingScreen } from "@/features/auth/components/auth-loading-screen";
import { AppProviders } from "@/providers/app-providers";

function RootNavigator() {
  const { data: session, isPending } = authClient.useSession();
  const isAuthenticated = Boolean(session?.session);

  if (isPending) {
    return <AuthLoadingScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(public)" />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
