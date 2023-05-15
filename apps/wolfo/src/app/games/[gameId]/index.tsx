import { useQuery } from "@tanstack/react-query";
import { Button, Text } from "@ui-kitten/components";
import { Stack, useRouter, useSearchParams } from "expo-router";
import { useContext, useState } from "react";
import React, { Image, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Game, Player, Power, Role, StateGame, StatePlayer } from "types";
import { AuthContext } from "../../../components/context/tokenContext";
import Loading from "../../../components/loading";
import { getPermissions } from "../../../utils/api/chat";
import { getGame } from "../../../utils/api/game";
import { getPlayer } from "../../../utils/api/player";
import useFont from "../../../utils/hooks/useFont";

import villagerIcon from "../../../../assets/Player/villager.png";
import wolfIcon from "../../../../assets/Player/wolf.png";
import contaminatorIcon from "../../../../assets/Powers/contaminator.png";
import eyeIcon from "../../../../assets/Powers/eye.png";
import seerIcon from "../../../../assets/Powers/seer.png";
import spiritIcon from "../../../../assets/Powers/spirit.png";
import aliveIcon from "../../../../assets/UI/alive.png";
import dayIcon from "../../../../assets/UI/day.png";
import deadIcon from "../../../../assets/UI/dead.png";
import nightIcon from "../../../../assets/UI/night.png";
import ModalPlayers from "../../../components/modals/modalPlayers";
import End from "./end";

const powerIcons = {
  INSOMNIAC: eyeIcon,
  SEER: seerIcon,
  CONTAMINATOR: contaminatorIcon,
  SPIRIT: spiritIcon,
  NONE: null,
};

const GameView = () => {
  const router = useRouter();
  const { gameId } = useSearchParams(); // idGame
  const { id: userId } = useContext(AuthContext);

  const fontsLoaded = useFont();

  const [modalVisible, setModalVisible] = useState(false); // Etat pour contrôler l'affichage du modal

  // get game data
  const {
    data: game,
    isLoading,
    isError,
  } = useQuery<Game, Error>({
    enabled: !isNaN(Number(gameId)),
    queryKey: ["mygames", gameId],
    queryFn: () => getGame(Number(gameId)),
    staleTime: 1000 * 60 * 5,
    cacheTime: 0,
  });
  // get player data
  const {
    data: player,
    isLoading: isLoadingPlayer,
    isError: isErrorPlayer,
  } = useQuery<Player, Error>({
    enabled: Boolean(game),
    queryKey: ["player", userId],
    queryFn: () => getPlayer(game?.id!, userId),
    staleTime: 1000 * 60 * 5,
  });

  // get permissions
  const { data: spiritPerm } = useQuery({
    enabled: !isNaN(Number(game?.spiritChatRoomId)),
    queryKey: ["permissions", Number(game?.spiritChatRoomId), userId],
    queryFn: () => getPermissions(Number(game?.spiritChatRoomId)),
  });

  if (!fontsLoaded) {
    return null;
  }

  if (isLoading || isLoadingPlayer) {
    return <Loading title="Game loading" message={"Game " + String(gameId) + "is loading"} />;
  }
  if (isError || isErrorPlayer || !game || !player) {
    return <Loading title="Game error" message="oui" />;
  }
  const redirectChat = () => {
    const chatId = game.state === StateGame.DAY ? game.dayChatRoomId : game.nightChatRoomId;
    return router.push({
      pathname: `/games/${gameId}/chatroom/${chatId}`,
      params: { gameId, userId },
    });
  };

  const redirectPower = () => {
    switch (player?.power) {
      case Power.SEER:
        router.push({ pathname: `/games/${gameId}/power/seer`, params: { userId } });
        break;
      case Power.SPIRIT:
        router.push({ pathname: `/games/${gameId}/power/spirit`, params: { userId } });
        break;
      case Power.INSOMNIAC:
        router.push({ pathname: `/games/${gameId}/power/insomniac`, params: { userId } });
        break;
      case Power.CONTAMINATOR:
        router.push({
          pathname: `/games/${gameId}/power/contaminator`,
          params: { userId },
        });
        break;
    }
    return;
  };

  const redirectVote = () => {
    router.push({ pathname: `/games/${gameId}/vote`, params: { userId } });
    return;
  };

  const handleSeePlayer = () => {
    setModalVisible(true);
  };
  if (game.state === StateGame.END) {
    return <End />;
  }
  return (
    <ScrollView>
      <Stack.Screen options={{ title: game.name, headerRight: () => null }} />
      <SafeAreaView style={styles.container}>
        <View style={styles.wrapper}>
          <View style={styles.line}>
            <Text>{""}</Text>
          </View>
          <Text style={[styles.title, styles.h2]}>{game.name}</Text>
        </View>
        <View style={styles.wrapperTitle}>
          <Image
            source={game.state === StateGame.DAY ? dayIcon : nightIcon}
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={[styles.text]}>
            It's {game.state === StateGame.DAY ? "day" : "night"} time
          </Text>
          <Image
            source={player.state === "ALIVE" ? aliveIcon : deadIcon}
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={styles.text}> {player.state === "ALIVE" ? "Alive" : "Dead"}</Text>
          <Image
            source={player.role === Role.VILLAGER ? villagerIcon : wolfIcon}
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={styles.text}>{`You are a ${player.role}`}</Text>
          {player.power !== null && (
            <Image source={powerIcons[player.power!]} style={styles.icon} resizeMode="contain" />
          )}

          {(player.power !== null && (
            <Text style={styles.text}>{`Your power is ${player.power}`}</Text>
          )) || <Text style={styles.text}>{`You don't have any power`}</Text>}
        </View>
        {/* display all informations on the game after fetching data from backend*/}
        <View style={styles.mainWrapper}>
          <Text style={styles.h2}>What to do?</Text>
          <View style={styles.wrapper}>
            <Button
              onPress={redirectVote}
              disabled={
                !game.curElecId ||
                (game.state === StateGame.NIGHT && player.role !== Role.WOLF) ||
                player.state === StatePlayer.DEAD
              }
              style={
                !game.curElecId ||
                (game.state === StateGame.NIGHT && player.role !== Role.WOLF) ||
                player.state === StatePlayer.DEAD
                  ? [styles.button, styles.disabledButton]
                  : styles.button
              }
            >
              {evaProps => (
                // style depending on disabled or not
                <Text
                  {...evaProps}
                  style={
                    !game.curElecId ||
                    (game.state === StateGame.NIGHT && player.role !== Role.WOLF) ||
                    player.state === StatePlayer.DEAD
                      ? [styles.buttonText, styles.disabledButtonText]
                      : styles.buttonText
                  }
                >
                  Vote
                </Text>
              )}
            </Button>
          </View>
          <View style={styles.wrapper}>
            <Button
              style={styles.button}
              onPress={redirectPower}
              disabled={player.power === Power.NONE || player.usedPower}
            >
              {evaProps => (
                <Text {...evaProps} style={styles.buttonText}>
                  Power
                </Text>
              )}
            </Button>
          </View>

          <View style={styles.wrapper}>
            <Button style={styles.button} onPress={handleSeePlayer}>
              {evaProps => (
                <Text {...evaProps} style={styles.buttonText}>
                  See Player
                </Text>
              )}
            </Button>
          </View>

          <ModalPlayers game={game} modalVisible={modalVisible} setModalVisible={setModalVisible} />

          <View style={styles.wrapper}>
            <Button
              style={
                game.state === StateGame.NIGHT && player.role !== Role.WOLF
                  ? [styles.button, styles.disabledButton]
                  : styles.button
              }
              onPress={redirectChat}
              disabled={game.state === StateGame.NIGHT && player.role !== Role.WOLF}
            >
              {evaProps => (
                <Text
                  {...evaProps}
                  style={
                    game.state === StateGame.NIGHT && player.role !== Role.WOLF
                      ? [styles.buttonText, styles.disabledButtonText]
                      : styles.buttonText
                  }
                >
                  Chat
                </Text>
              )}
            </Button>
          </View>

          <View style={styles.wrapper}>
            {spiritPerm?.write === true && player.state === "DEAD" && (
              <Button
                style={styles.button}
                onPress={() =>
                  router.push({
                    pathname: `/games/${gameId}/chatroom/${game.spiritChatRoomId}`,
                    params: { gameId, userId },
                  })
                }
              >
                {evaProps => (
                  <Text {...evaProps} style={styles.buttonText}>
                    Spirit Chat
                  </Text>
                )}
              </Button>
            )}
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#141313",
    paddingBottom: 25,
  },
  // wrapper: {
  //   flexDirection: "row",
  //   justifyContent: "space-around",
  //   alignItems: "center",
  //   width: "100%",
  //   marginVertical: 10,
  // },
  wrapper: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: "5%",
    marginBottom: 40,
  },
  line: {
    position: "relative",
    borderColor: "#C38100",
    height: 0,
    borderBottomWidth: 2,
    width: "80%",
    zIndex: -1,
  },
  mainWrapper: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "80%",
    borderColor: "#C38100",
    borderWidth: 1,
    paddingHorizontal: 25,
    paddingTop: 10,
    paddingBottom: 0,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  iconWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  text: {
    fontSize: 14,
    fontFamily: "Montserrat",
    textAlign: "center",
    color: "#C38100",
  },
  wrapperTitle: {
    alignItems: "center",
    marginBottom: "15%",
    borderColor: "#C38100",
    borderWidth: 1,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  title: {
    marginBottom: "7%",
    fontFamily: "Voyage",
    fontSize: 45,
    color: "#C38100",
  },
  h2: {
    backgroundColor: "#141313",
    fontFamily: "Voyage",
    fontSize: 37,
    color: "#C38100",
    marginTop: -28,
    marginBottom: 25,
    paddingHorizontal: 10,
    zIndex: 1,
  },
  smallText: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: -10,
  },
  button: {
    marginVertical: 5,
    width: 150,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 24,
    boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.15)",
  },
  disabledButton: {
    backgroundColor: "#2c2b2b",
    borderColor: "#C38100",
    borderWidth: 1,
    opacity: 0.9,
  },
  buttonText: {
    fontSize: 15,
    color: "#141313",
    fontFamily: "MontserratBold",
  },
  disabledButtonText: {
    color: "#6b4c0c",
  },
  icon: {
    width: 20,
    height: 20,
    marginBottom: 0,
    marginTop: 22,
  },
});

export default GameView;
