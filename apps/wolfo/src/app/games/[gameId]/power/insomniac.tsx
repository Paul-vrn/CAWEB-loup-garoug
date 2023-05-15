import { Text } from "@ui-kitten/components";
import { Stack, useRouter, useSearchParams } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
const InsomniacView = () => {
  const router = useRouter();
  const { userId } = useSearchParams();
  if (!userId) {
    router.back();
  }

  return (
    <SafeAreaView>
      <Stack.Screen options={{ title: "Insomniac", headerRight: () => null }} />
      <Text>Spirit | {userId as string}</Text>
    </SafeAreaView>
  );
};

export default InsomniacView;
