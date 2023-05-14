import { useQuery } from "@tanstack/react-query";
import { Divider, List, ListItem } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Notification } from "types";
import Loading from "../../components/loading";
import { getNotifications } from "../../utils/api/notification";

const Auth = () => {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });

  if (isLoading) {
    return <Loading title="Loading notifications" message="oui" />;
  }
  if (isError) {
    return router.back();
  }
  const listNotification = ({ item }: { item: Notification; index: number }) => (
    <ListItem
      key={item.id}
      title={item.title}
      description={item.content}
      onPress={() => router.push(item.link)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.h2}>Notifications</Text>
      <View style={styles.mainWrapper}>
        <List
          data={data}
          renderItem={listNotification}
          ItemSeparatorComponent={Divider}
          onRefresh={refetch}
          refreshing={isLoading}
          style={styles.list}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141313",
    alignItems: "center",
  },
  list: {
    width: "100%",
  },
  mainWrapper: {
    borderColor: "#C38100",
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 10,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    width: "80%",
    backgroundColor: "white",
  },
  h2: {
    backgroundColor: "#141313",
    fontFamily: "Voyage",
    fontSize: 37,
    color: "#C38100",
    marginBottom: 20,
  },
});

export default Auth;
