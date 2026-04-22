import { Spinner } from "heroui-native/spinner";
import { View } from "react-native";

export function AuthLoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <Spinner isLoading size="lg" />
    </View>
  );
}
