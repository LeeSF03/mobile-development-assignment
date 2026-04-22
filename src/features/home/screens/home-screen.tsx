import { Card } from "heroui-native/card";
import { Text, View } from "react-native";

import { authClient } from "@/lib/auth-client";

export function HomeScreen() {
  const { data: session } = authClient.useSession();

  return (
    <View className="flex-1 bg-background px-6 py-10">
      <View className="flex-1 items-center justify-center">
        <View className="w-full max-w-md gap-6">
          <View className="gap-2">
            <Text className="text-4xl font-semibold text-foreground">
              Signed in.
            </Text>
            <Text className="text-base leading-6 text-muted-foreground">
              Auth is working. The next step is the profile form and the Google
              Sheets write flow.
            </Text>
          </View>

          <Card className="w-full">
            <Card.Body className="gap-2">
              <Card.Title>{session?.user.name ?? "Google account"}</Card.Title>
              <Card.Description>
                {session?.user.email ?? "No email returned"}
              </Card.Description>
            </Card.Body>
          </Card>
        </View>
      </View>
    </View>
  );
}
