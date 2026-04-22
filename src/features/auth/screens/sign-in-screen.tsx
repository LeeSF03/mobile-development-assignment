import { Ionicons } from "@expo/vector-icons";
import { Card } from "heroui-native/card";
import { LinkButton } from "heroui-native/link-button";
import { Text, View } from "react-native";

import { GoogleSignInButton } from "@/features/auth/components/google-sign-in-button";
import { useGoogleSignIn } from "@/features/auth/hooks/use-google-sign-in";

export function SignInScreen() {
  const { errorMessage, isPending, signInWithGoogle } = useGoogleSignIn();

  return (
    <View className="flex-1 bg-background px-6 py-10">
      <View className="flex-1 items-center justify-center">
        <View className="w-full max-w-md gap-6">
          <View className="gap-4">
            <View className="size-16 items-center justify-center self-start rounded-3xl bg-primary/10">
              <Ionicons name="document-text-outline" size={28} />
            </View>

            <View className="gap-2">
              <Text className="text-4xl font-semibold text-foreground">
                Sign in first.
              </Text>
              <Text className="text-base leading-6 text-muted-foreground">
                Use your Google account to unlock the form and later connect your
                sheet in Google Drive.
              </Text>
            </View>
          </View>

          <Card className="w-full">
            <Card.Body className="gap-5">
              <View className="gap-1">
                <Card.Title>Google only</Card.Title>
                <Card.Description>
                  This app currently uses Google OAuth as the only sign-in
                  method.
                </Card.Description>
              </View>

              <GoogleSignInButton
                isPending={isPending}
                onPress={signInWithGoogle}
              />

              {errorMessage ? (
                <Text className="text-sm leading-5 text-danger">
                  {errorMessage}
                </Text>
              ) : null}
            </Card.Body>
          </Card>

          <LinkButton
            className="self-start"
            onPress={() => {
              setTimeout(() => {
                signInWithGoogle().catch(() => {});
              }, 0);
            }}
            size="sm"
          >
            <LinkButton.Label>Retry if the browser did not open</LinkButton.Label>
          </LinkButton>
        </View>
      </View>
    </View>
  );
}
