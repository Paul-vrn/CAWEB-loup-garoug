import { Button, Input, Tab, TabView, Text } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ListGamesLobby, ListMyGames } from "../components/game/gameList";
import useFont from "../utils/hooks/useFont";

import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {
  const router = useRouter();
  const [search, setSearch] = React.useState<string>("");
  const [tabIndex, setTabIndex] = React.useState<number>(0);
  const fontsLoaded = useFont();

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centeredView}>
        {/*<Image source={imageHome} style={styles.image} />*/}
        <View style={styles.mainWrapper}>
          <Text> </Text>
        </View>
        <Text style={styles.h2}>Home</Text>
        <Button
          onPress={() => {
            router.push("/rules");
          }}
          style={[styles.button, styles.rules]}
          status="primary"
          testID="rule-button"
        >
          {evaProps => (
            <Text {...evaProps} style={(styles.buttonText, styles.ruleText)}>
              Rules
            </Text>
          )}
        </Button>
        <Button
          onPress={() => router.push("/games/new")}
          style={styles.button}
          status="primary"
          testID="new-game-button"
        >
          {evaProps => (
            <Text {...evaProps} style={styles.buttonText}>
              New Game
            </Text>
          )}
        </Button>
        <Input
          placeholder="Search a game"
          onChangeText={setSearch}
          value={search}
          style={styles.searchInput}
          testID="search-game-input"
        />
        <View style={styles.tabViewWrapper}>
          <TabView
            selectedIndex={tabIndex}
            onSelect={index => {
              if (isNaN(index)) {
                return;
              }
              setTabIndex(index);
            }}
            style={styles.tabView}
          >
            <Tab title="Games joined">
              <View style={styles.tab}>
                <ListMyGames search={search} />
              </View>
            </Tab>
            <Tab title="Games not joined">
              <View style={styles.tab}>
                <ListGamesLobby search={search} />
              </View>
            </Tab>
          </TabView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignContent: "center",
    overflow: "hidden",
    backgroundColor: "#141313",
  },
  centeredView: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: "5%",
    paddingBottom: "2%",
  },
  searchInput: {
    width: "70%",
    opacity: 0.95,
    marginBottom: 20,
    borderRadius: 24,
    boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.15)",
  },
  tabViewWrapper: {
    width: "70%",
    alignSelf: "center",
    borderRadius: 24,
    overflow: "hidden",
    paddingBottom: 40,
  },
  tabView: {
    borderRadius: 0,
  },
  tab: {
    maxHeight: 200,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: "hidden",
  },
  title: {
    paddingVertical: 5,
    fontFamily: "Voyage",
  },
  button: {
    width: "70%",
    height: 50,
    borderRadius: 24,
    marginBottom: 20,
    boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.15)",
  },
  rules: {
    backgroundColor: "#141313",
    borderColor: "#C38100",
    marginBottom: 40,
  },
  buttonText: {
    fontFamily: "MontserratBold",
    color: "#141313",
    fontSize: 16,
  },
  text: {
    fontFamily: "Montserrat",
    color: "#C38100",
  },
  ruleText: {
    fontFamily: "MontserratBold",
    fontSize: 16,
    color: "#C38100",
  },
  h2: {
    backgroundColor: "#141313",
    fontFamily: "Voyage",
    fontSize: 37,
    color: "#C38100",
    marginTop: -28,
    marginBottom: "15%",
    paddingHorizontal: 10,
    zIndex: 1,
  },
  mainWrapper: {
    borderColor: "#C38100",
    width: "80%",
    borderWidth: 1,
    height: 1,
  },
  image: {
    width: 300,
    height: 150,
    marginBottom: "20%",
  },
});

export default Home;
