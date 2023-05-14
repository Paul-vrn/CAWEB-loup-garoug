import { View, Text, StyleSheet } from "react-native";
import React, { useContext } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "react-native";
import image from "../../../../assets/images/sun_asset.png";
import { useSearchParams } from "expo-router";
import { AuthContext } from "../../../components/context/tokenContext";
import { useQuery } from "@tanstack/react-query";
import { getGame } from "../../../utils/api/game";
import { Game, Player, Role, StatePlayer } from "types";
import { getPlayer } from "../../../utils/api/player";
import Loading from "../../../components/loading";
const messages = {
  victoryVillager: "The Villagers won! Every wolf was lynched, and the village was safely guarded",
  lossVillager: "Defeat! The village falls silent as darkness engulfs its once vibrant streets.",
  victoryWolf:
    "Triumph! The howls of the wolves echo through the night as they assert their dominance over the land.",
  lossWolf:
    "Devastation! The wolves' menacing presence wanes, their legacy fading into the annals of forgotten tales.",
};

const End = () => {
  const { gameId } = useSearchParams();
  const { token } = useContext(AuthContext);
  const { id: userId } = useContext(AuthContext);

  console.log("TOKEN " + userId);
  const {
    data: game,
    isLoading,
    isError,
  } = useQuery<Game, Error>({
    enabled: Boolean(gameId) && Boolean(token),
    queryKey: ["mygames", gameId],
    queryFn: () => getGame(Number(gameId)),
  });

  const {
    data: currentPlayer,
    isLoading: isLoadingPlayer,
    isError: isErrorPlayer,
  } = useQuery<Player, Error>({
    enabled: Boolean(game) && Boolean(userId) && Boolean(token),
    queryKey: ["player", userId],
    queryFn: () => getPlayer(game?.id!, Array.isArray(userId) ? userId[0] : userId!),
  });
  console.log(isLoadingPlayer);
  if (isLoading || isLoadingPlayer) {
    return <Loading title="Vote Loading" message={"Loading..."} />;
  }
  if (isErrorPlayer || isError || !game || !currentPlayer) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>An error occured. Please try again in a little</Text>;
      </SafeAreaView>
    );
  }
  // what about ties
  // could check for ties later if everyone dead or both still alive (error managemeng)
  // todo
  const winningRole: Role = Array.from(game?.players as Player[]).every(
    p => p.state !== StatePlayer.ALIVE || p.role === Role.WOLF
  )
    ? Role.WOLF
    : Role.VILLAGER;
  const messageFiltred =
    winningRole === Role.WOLF
      ? [messages.victoryWolf, messages.lossVillager]
      : [messages.victoryVillager, messages.lossWolf];
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.frame}>
        <>
          <Text style={[styles.text, styles.title]}>
            {currentPlayer.role === winningRole ? "Victory" : "Defeat"}
          </Text>
          <Text style={[styles.text]}>
            {currentPlayer.role === winningRole ? messageFiltred[0] : messageFiltred[1]}
          </Text>
        </>
      </View>
      <Image source={image} style={styles.image} />
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#141313",
    position: "relative",
    height: "100%",
    display: "flex",
    alignItems: "center",
  },
  frame: {
    marginTop: 100,
    position: "relative",
    width: "80%",
    border: "1px solid orange",
    paddingBottom: 35,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  image: {
    margin: "auto",
    resizeMode: "contain",
    width: "65%",
    aspectRatio: 1,
  },
  text: {
    fontSize: 17,
    fontFamily: "Montserrat",
    color: "#C38100",
    textAlign: "center",
  },
  title: {
    backgroundColor: "#141313",
    fontFamily: "Voyage",
    fontSize: 37,
    color: "#C38100",
    marginTop: -30,
    textAlign: "center",
    marginHorizontal: "auto",
    marginBottom: 25,
  },
});
export default End;
