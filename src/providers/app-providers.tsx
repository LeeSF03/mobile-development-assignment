import type { PropsWithChildren } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { HeroUINativeProviderRaw } from "heroui-native/provider-raw";

import { ConvexAuthProvider } from "@/providers/convex-better-auth";
import { RNThemeProvider } from "./theme";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ConvexAuthProvider>
        <HeroUINativeProviderRaw>
          <RNThemeProvider>{children}</RNThemeProvider>
        </HeroUINativeProviderRaw>
      </ConvexAuthProvider>
    </GestureHandlerRootView>
  );
}
