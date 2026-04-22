import { useQuery } from "convex/react";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { ScrollView, Text, View } from "react-native";

import { SheetSubmissionForm } from "@/features/home/components/sheet-submission-form";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/convex-api";

export function HomeScreen() {
  const { data: session } = authClient.useSession();
  const connection = useQuery(api.googleSheets.getSheetConnection, {});

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-6 py-10"
    >
      <View className="mx-auto w-full max-w-md gap-6">
        <View className="gap-4">
          <View className="gap-2">
            <Text className="text-4xl font-semibold text-foreground">
              Form upload
            </Text>
            <Text className="text-base leading-6 text-muted-foreground">
              Submit a row to Google Sheets after granting Drive access to this
              app.
            </Text>
          </View>

          <Card className="w-full">
            <Card.Body className="gap-4">
              <Card.Title>{session?.user.name ?? "Google account"}</Card.Title>
              <Card.Description>
                {session?.user.email ?? "No email returned"}
              </Card.Description>

              <View className="flex-row items-center gap-3">
                <Button
                  onPress={() => {
                    authClient.signOut().catch(() => {});
                  }}
                  size="sm"
                  variant="outline"
                >
                  Sign out
                </Button>
              </View>
            </Card.Body>
          </Card>
        </View>

        <SheetSubmissionForm
          connection={
            connection
              ? {
                  spreadsheetName: connection.spreadsheetName,
                  spreadsheetUrl: connection.spreadsheetUrl,
                }
              : connection
          }
          userEmail={session?.user.email ?? "No email returned"}
        />
      </View>
    </ScrollView>
  );
}
