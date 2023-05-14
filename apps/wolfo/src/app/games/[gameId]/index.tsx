import { useQuery } from "@tanstack/react-query";
import { Button, Text } from "@ui-kitten/components";
import { Stack, useRouter, useSearchParams } from "expo-router";
import { useContext, useState } from "react";
import React, { Image, Modal, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Game, Player, Power, Role, StateGame } from "types";
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

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: game.name, headerRight: () => null }} />
      <View style={styles.wrapper}>
        <Text style={styles.title}>{game.name}</Text>
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
        <Text style={styles.h2}>What will you do?</Text>
        <View style={styles.wrapper}>
          <Button onPress={redirectVote} style={styles.button} disabled={false}>
            {evaProps => (
              <Text {...evaProps} style={styles.buttonText}>
                Vote
              </Text>
            )}
          </Button>
        </View>
        <View style={styles.wrapper}>
          <Button
            style={styles.button}
            onPress={redirectPower}
            disabled={
              player.usedPower && player.power !== Power.SPIRIT && player.power !== Power.NONE
            }
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

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>{game.players.length} players in game</Text>
              <View style={styles.iconWrapper}>
                <Image source={aliveIcon} style={styles.icon} />
                <Text style={styles.text}>Alive players :</Text>
              </View>
              <Text style={styles.modalText}>
                {game.players
                  .filter((p: Player) => p.state === "ALIVE")
                  .map((p: Player) => p.user?.name)
                  .join(", ")}
              </Text>
              <View style={styles.iconWrapper}>
                <Image source={deadIcon} style={styles.icon} />
                <Text style={styles.text}>Dead players :</Text>
              </View>
              <Text style={styles.modalText}>
                {game.players
                  .filter((p: Player) => p.state === "DEAD")
                  .map((p: Player) => p.user?.name)
                  .join(", ")}
              </Text>

              <Button onPress={() => setModalVisible(!modalVisible)}>
                {evaProps => (
                  <Text {...evaProps} style={styles.smallText}>
                    Close
                  </Text>
                )}
              </Button>
            </View>
          </View>
        </Modal>

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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#141313",
  },
  wrapper: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    marginVertical: 10,
  },
  mainWrapper: {
    borderColor: "#C38100",
    borderWidth: 1,
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "70%",
  },
  iconWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
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
    marginBottom: "10%",
    fontFamily: "Voyage",
    fontSize: 45,
    color: "#C38100",
  },
  h2: {
    backgroundColor: "#141313",
    fontFamily: "Voyage",
    fontSize: 37,
    color: "#C38100",
    marginTop: -50,
    marginBottom: 30,
  },
  smallText: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: -10,
  },
  button: {
    marginVertical: 5,
    width: 150,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 24,
    boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.15)",
  },
  disabledButton: {
    backgroundColor: "#ceccbd",
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 15,
    color: "#141313",
    fontFamily: "MontserratBold",
  },
  disabledButtonText: {
    color: "#141313",
  },
  icon: {
    width: 24,
    height: 24,
    marginBottom: 8,
    marginTop: 20,
  },
});

export default GameView;
