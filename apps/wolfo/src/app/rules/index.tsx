import React, { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import useFont from "../../utils/hooks/useFont";

const Rules = () => {
  const fontsLoaded = useFont();

  if (!fontsLoaded) {
    return null;
  }
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Rules</Text>

        <View style={styles.wrapperParagraph}>
          <Text style={styles.h2}>Introduction</Text>
          <Text style={styles.paragraph}>
            Welcome to the mystical world Wolfo, a quaint village embroiled in a secret war of
            survival. You are its inhabitant, veiled under the cloak of a human or a werewolf. The
            roles are cast by fate's hand, and kept hidden from prying eyes. Under the watchful gaze
            of the moon and sun, the battle unfolds, day and night.
          </Text>
        </View>

        <View style={styles.wrapperParagraph}>
          <Text style={styles.h2}>The Struggle</Text>
          <Text style={styles.paragraph}>
            As dawn breaks, the villagers come together, suspicions hang in the air like a dense
            fog. They vote to banish one amongst them, believed to harbor a beastly secret. All
            living souls participate in this tense discourse. As dusk falls, the werewolves emerge,
            selecting their prey under the cover of darkness, their sinister deliberations heard
            only by their own kind.
          </Text>
        </View>

        <View style={styles.wrapperParagraph}>
          <Text style={styles.h2}>The Powers</Text>
          <Text style={styles.paragraph}>
            Beyond the veil of mortal guise, some possess uncanny powers, only to be stirred under
            the moon's glow: {"\n"}
            <Text style={styles.bulletPoint}>
              • Werewolves may spread their curse, transforming an unsuspecting villager into one of
              their own.{"\n"}
            </Text>
            <Text style={styles.bulletPoint}>
              • Insomniacs, those restless human souls, may eavesdrop on the werewolves' nocturnal
              discourse.{"\n"}
            </Text>
            <Text style={styles.bulletPoint}>
              • Seers may glimpse into the true nature and power of one, shrouded in mystery.{"\n"}
            </Text>
            <Text style={styles.bulletPoint}>
              • Spirits may converse with the dead, drawing wisdom from beyond the grave.{"\n"}
            </Text>
            In death, your voice is silenced, your actions stilled, but your ghostly presence may
            linger, spectating the game's progress, and perhaps whispering to a spirit.
          </Text>
        </View>

        <View style={styles.wrapperParagraph}>
          <Text style={styles.h2}>The End</Text>
          <Text style={styles.paragraph}>
            The game finds its end when only the echoes of the werewolves' howls or the villagers'
            chatter remain. Steeped in this mystical struggle, may luck be your faithful companion
            and guide you to victory!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#141313",
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignContent: "center",
    overflow: "hidden",
    paddingHorizontal: "7%",
    paddingBottom: "5%",
  },
  bulletPoint: {
    marginLeft: 10,
  },
  h2: {
    fontSize: 22,
    color: "#C38100",
    fontFamily: "MontserratBold",
  },
  title: {
    paddingVertical: "5%",
    fontFamily: "Voyage",
    fontSize: 45,
    color: "#C38100",
    textAlign: "center",
  },
  paragraph: {
    fontSize: 16,
    color: "#C38100",
    textAlign: "justify",
    fontFamily: "Montserrat",
  },
  wrapperParagraph: {
    marginVertical: "4%",
    marginHorizontal: "7%",
  },
});

export default Rules;
