import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Text } from "@ui-kitten/components";
import { useRouter, useSearchParams } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Game, Player } from "types";
import { AuthContext } from "../../../../components/context/tokenContext";
import Loading from "../../../../components/loading";
import { addDeadToChatroom } from "../../../../utils/api/chat";
import { getGame } from "../../../../utils/api/game";
import { getPlayer, updatePlayer } from "../../../../utils/api/player";

import dayIcon from "../../../../../assets/UI/day.png";
import nightIcon from "../../../../../assets/UI/night.png";
import useFont from "../../../../utils/hooks/useFont";

const SpiritView = () => {
  const router = useRouter();
  const fontsLoaded = useFont();

  const { gameId } = useSearchParams();
  const { id: userId } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [usedPower, setUsedPower] = useState<boolean>(false);
  const [selectedDeadPlayer, setSelectedDeadPlayer] = useState<Player | undefined>();
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);

  // get game data
  const {
    data: game,
    isLoading,
    isError,
  } = useQuery<Game, Error>({
    enabled: !isNaN(Number(gameId)),
    queryKey: ["mygames", gameId],
    queryFn: () => getGame(Number(gameId)),
    staleTime: 1000 * 60 * 60 * 24, // 1 day
  });

  // get player data
  const {
    data: currentPlayer,
    isLoading: isLoadingPlayer,
    isError: isErrorPlayer,
  } = useQuery<Player, Error>({
    enabled: !isNaN(Number(gameId)) && Boolean(userId),
    queryKey: ["player", userId],
    queryFn: () => getPlayer(Number(gameId), String(userId)),
  });

  const { mutate: updateQuery } = useMutation<any, Error, Player>({
    mutationFn: playerUpdated => {
      return updatePlayer(playerUpdated);
    },
    onSuccess: async () => {
      setUsedPower(true);
      await queryClient.invalidateQueries(["role", "power", "usedPower"]);
    },
    onError: (error: Error) => {
      console.error("Error while updating power of user", error);
    },
  });

  useEffect(() => {
    setUsedPower(currentPlayer!.usedPower);
  }, [currentPlayer]);

  if (!fontsLoaded) {
    return null;
  }

  const handlePlayerClick = async (player: Player) => {
    setSelectedDeadPlayer(player);
    setIsButtonDisabled(true);
    const updatedSpirit: Player = {
      ...currentPlayer!,
      usedPower: true,
    };

    const spiritChatId = game?.spiritChatRoomId;
    if (spiritChatId && player?.userId && gameId) {
      console.log("addDeadToChatroom", spiritChatId, player.userId, Number(gameId));
      addDeadToChatroom(spiritChatId, player.userId, Number(gameId));
      updateQuery(updatedSpirit);
    }
  };

  const redirectChat = () => {
    if (!gameId) return;
    const spiritChatId = game?.spiritChatRoomId;
    return router.push({
      pathname: `/games/${gameId}/chatroom/${spiritChatId}`,
      params: { gameId: gameId, userId },
    });
  };

  if (isLoading || isLoadingPlayer) {
    return <Loading title="Power loading" message={"Loading..."} />;
  }
  if (isError || isErrorPlayer) {
    return router.back();
  }

  return (
    <SafeAreaView style={styles.background}>
      <View style={styles.centeredView}>
        <View style={styles.wrapper}>
          <Text style={styles.title}>Spirit Power</Text>
        </View>

        <View style={styles.wrapperTitle}>
          <Text style={[styles.text]}>
            The Spirit can summon a departed player to a special chat under the cover of night,
            enabling secretive conversations until the break of dawn.
          </Text>
        </View>

        <View style={styles.mainWrapper}>
          <Text style={styles.h2}>Summon a dead</Text>
          {game.state === "DAY" ? (
            <>
              <Image
                source={game.state === "DAY" ? dayIcon : nightIcon}
                style={styles.icon}
                resizeMode="contain"
              />
              <Text style={styles.text}>It's day, you can't use your power</Text>
            </>
          ) : usedPower ? (
            <>
              <Text style={styles.text}>You invoked a dead player..</Text>
              <Button onPress={redirectChat} style={styles.chatButton}>
                {evaProps => (
                  <Text {...evaProps} style={styles.buttonText}>
                    Go to chat
                  </Text>
                )}
              </Button>
            </>
          ) : (
            <>
              {game.players &&
                game.players
                  .filter((player: Player) => player.state === "DEAD")
                  .map((player: Player) => (
                    <Button
                      key={player.userId}
                      onPress={() => handlePlayerClick(player)}
                      disabled={isButtonDisabled}
                      style={styles.playerButton}
                    >
                      {evaProps => (
                        <Text {...evaProps} style={styles.buttonText}>
                          {player.user?.name}
                        </Text>
                      )}
                    </Button>
                  ))}
              {selectedDeadPlayer ? (
                <Text
                  style={styles.text}
                >{`You are invoking ${selectedDeadPlayer.user?.name} ...`}</Text>
              ) : (
                <Text style={styles.text}>No player summoned for the moment</Text>
              )}
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#141313",
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  wrapper: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    marginVertical: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  chatButton: {
    width: "70%",
    alignSelf: "center",
    borderRadius: 24,
    marginVertical: 20,
    backgroundColor: "#69140E",
    borderColor: "#69140E",
  },
  playerButton: {
    width: "70%",
    alignSelf: "center",
    borderRadius: 24,
    backgroundColor: "#C38100",
    marginBottom: 16,
  },
  text: {
    fontSize: 14,
    fontFamily: "Montserrat",
    textAlign: "center",
    color: "#C38100",
  },
  title: {
    marginBottom: "10%",
    fontFamily: "Voyage",
    fontSize: 45,
    color: "#C38100",
  },
  mainWrapper: {
    borderColor: "#C38100",
    borderWidth: 1,
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 10,
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
  wrapperTitle: {
    width: "85%",
    alignItems: "center",
    marginBottom: "15%",
    borderColor: "#C38100",
    borderWidth: 1,
    paddingVertical: 24,
    paddingHorizontal: 35,
  },
  disabledButtonText: {
    color: "#141313",
  },
  icon: {
    width: 20,
    height: 20,
    marginBottom: 7,
    marginTop: 18,
  },
});

export default SpiritView;
