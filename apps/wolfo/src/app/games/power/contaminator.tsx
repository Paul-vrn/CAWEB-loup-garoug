import { Text } from "@ui-kitten/components";
import { useRouter, useSearchParams } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
const ContaminatorView = () => {
  const router = useRouter();
  const { userId } = useSearchParams();
  if (!userId) {
    router.back();
  }

  return (
    <SafeAreaView>
      <Text>Spirit | {userId as string}</Text>
    </SafeAreaView>
  );
};

export default ContaminatorView;
