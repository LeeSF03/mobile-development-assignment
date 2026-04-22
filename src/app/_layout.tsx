import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme } from "react-native";
import { HeroUINativeProviderRaw } from "heroui-native/provider-raw";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";
import { ConvexAuthProvider } from "@/providers/convex-better-auth";
import "@/global.css";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ConvexAuthProvider>
        <HeroUINativeProviderRaw>
          <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <AnimatedSplashOverlay />
            <AppTabs />
          </ThemeProvider>
        </HeroUINativeProviderRaw>
      </ConvexAuthProvider>
    </GestureHandlerRootView>
  );
}
