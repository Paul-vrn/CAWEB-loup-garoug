import * as eva from "@eva-design/eva";
import { light as lightTheme } from "@eva-design/eva";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApplicationProvider } from "@ui-kitten/components";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { Image, Platform, StyleSheet, TouchableOpacity, View } from "react-native";

import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../components/context/tokenContext";

import { StatusBar } from "expo-status-bar";
import BellIcon from "../../assets/UI/bell.png";
import UserIcon from "../../assets/UI/min_player.png";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  },
});

const theme = {
  ...lightTheme,
  "color-primary-100": "#ffdab3",
  "color-primary-200": "#ffc781",
  "color-primary-300": "#ffba4d",
  "color-primary-400": "#ffb320",
  "color-primary-500": "#C38100",
  "color-primary-600": "#a36f00",
  "color-primary-700": "#865c00",
  "color-primary-800": "#6a4900",
  "color-primary-900": "#4d3500",
  "color-black": "#141313",
};

const HomeLayout = () => {
  const router = useRouter();
  return (
    <ApplicationProvider {...eva} theme={theme}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SafeAreaProvider>
            <StatusBar style="light" />
            <View style={styles.background}>
              <Stack
                screenOptions={{
                  headerStyle: { backgroundColor: "#141313" },
                  headerTintColor: "#C38100",
                  headerShadowVisible: false,
                  headerRight: () => (
                    <TouchableOpacity testID="settings-button" onPress={() => router.push("/user")}>
                      <Image source={UserIcon} style={styles.image} />
                    </TouchableOpacity>
                  ),
                }}
              >
                <Stack.Screen
                  name="(auth)/auth"
                  options={{
                    title: "Authentification",
                    header: () => null,
                    headerRight: () => null,
                    headerLeft: () => null,
                  }}
                />
                <Stack.Screen
                  name="index"
                  options={{
                    title: "Wolfo",
                    headerLeft: () => (
                      <TouchableOpacity
                        testID="ios-notifications-outline"
                        onPress={() => router.push("/notifications")}
                      >
                        <Image source={BellIcon} style={styles.image} />
                      </TouchableOpacity>
                    ),
                  }}
                />
                <Stack.Screen
                  name="games/new"
                  options={{
                    title: "New game",
                  }}
                />
                <Stack.Screen
                  name="user/index"
                  options={{
                    title: "User settings",
                    headerRight: () => null,
                  }}
                />
              </Stack>
            </View>
          </SafeAreaProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ApplicationProvider>
  );
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: "#000000",
    flex: 1,
  },
  image: {
    width: 30,
    height: 30,
    marginHorizontal: Platform.OS === "web" ? 30 : 0,
  },
});

export default HomeLayout;
