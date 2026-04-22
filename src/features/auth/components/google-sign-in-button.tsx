import { Ionicons } from "@expo/vector-icons";
import { Button } from "heroui-native/button";

type GoogleSignInButtonProps = {
  isPending: boolean;
  onPress: () => void;
};

export function GoogleSignInButton({
  isPending,
  onPress,
}: GoogleSignInButtonProps) {
  return (
    <Button
      className="w-full"
      isDisabled={isPending}
      onPress={onPress}
      size="lg"
      variant="secondary"
    >
      <Ionicons name="logo-google" size={18} />
      <Button.Label>
        {isPending ? "Opening Google..." : "Continue with Google"}
      </Button.Label>
    </Button>
  );
}
