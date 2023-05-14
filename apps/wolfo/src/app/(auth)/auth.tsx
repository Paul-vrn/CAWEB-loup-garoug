import { Tab, TabView } from "@ui-kitten/components";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Login } from "../../components/auth/login";
import { Register } from "../../components/auth/register";
import useFont from "../../utils/hooks/useFont";

// import imgHome from "../../../assets/images/homepage.png";

const Auth = () => {
  const fontsLoaded = useFont();
  const [tabIndex, setTabIndex] = useState<number>(0);

  if (!fontsLoaded) {
    return null;
  }
  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Wolfo</Text>
      <View style={styles.tabViewWrapper}>
        <TabView selectedIndex={tabIndex} onSelect={setTabIndex} style={styles.tabView}>
          <Tab title="Login" style={styles.title}>
            <Login />
          </Tab>
          <Tab title="Register">
            <Register />
          </Tab>
        </TabView>
      </View>
      {/* <Image source={imgHome} style={styles.image} /> */}
    </View>
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
  h1: {
    fontFamily: "Voyage",
    fontSize: 80,
    color: "#C38100",
    textAlign: "center",
    marginBottom: "15%",
  },
  image: {
    width: 250,
    height: 225,
    alignSelf: "center",
    marginTop: "15%",
  },
  tabViewWrapper: {
    width: "70%",
    alignSelf: "center",
    borderTopStartRadius: 12,
    borderTopEndRadius: 12,
    overflow: "hidden",
  },
  tabView: {
    overflow: "hidden",
  },
  title: {
    paddingVertical: 5,
  },
  textButton: {
    fontFamily: "MontserratBold",
    color: "#141313",
  },
  text: {
    fontFamily: "Montserrat",
    color: "#C38100",
  },
});

export default Auth;
