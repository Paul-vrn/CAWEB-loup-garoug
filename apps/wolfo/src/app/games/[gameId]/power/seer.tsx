import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Text } from "@ui-kitten/components";
import { useRouter, useSearchParams } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Game, Player } from "types";
import Loading from "../../../../components/loading";
import { getGame } from "../../../../utils/api/game";
import { getPlayer, updatePlayer } from "../../../../utils/api/player";

const SeerView = () => {
  const router = useRouter();
  const { gameId, userId } = useSearchParams();
  const queryClient = useQueryClient();
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
      delete playerUpdated?.user;
      return updatePlayer(playerUpdated);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(["role", "power", "usedPower"]);
    },
    onError: (error: Error) => {
      setErrorMessageUpdate(error.message);
    },
  });

  const [selectedPlayer, setSelectedPlayer] = useState<Player | undefined>();
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isErrorUpdate, setErrorMessageUpdate] = useState<string>("");

  const handlePlayerClick = async (player: Player) => {
    setSelectedPlayer(player);
    setIsButtonDisabled(true);
    // Update the seer's power usage
    const updatedSeer: Player = {
      ...currentPlayer!,
      usedPower: true,
    };
    delete updatedSeer?.user;
    updateQuery(updatedSeer);
  };

  if (isLoading || isLoadingPlayer) {
    return <Loading title="Power loading" message={"Loading..."} />;
  }
  if (isError || isErrorPlayer || isErrorUpdate) {
    // queryClient.invalidateQueries(["players", gameId]);
    return router.back();
  }

  return (
    <SafeAreaView style={styles.background}>
      <ScrollView>
        <View style={styles.centeredView}>
          <View style={styles.wrapper}>
            <Text style={styles.title}>Seer Power</Text>
          </View>

          <View style={styles.wrapperTitle}>
            <Text style={[styles.text]}>
              Powers of the Seer allows them to delve into the secrets of the night, gazing into the
              abyss to uncover the true nature of a chosen player.
            </Text>
          </View>

          <View style={styles.mainWrapper}>
            <Text style={styles.h2}>Unveil the truth</Text>
            {game.players &&
              game.players
                .filter((player: Player) => player.userId !== userId)
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
            <Text style={styles.smallText}>Selected player:</Text>
            {selectedPlayer ? (
              <Text style={styles.textPlayer}>
                {`${selectedPlayer.user?.name} is a `}
                {selectedPlayer.role !== undefined ? selectedPlayer.role : ""}
                {selectedPlayer.power !== "NONE" ? `, ${selectedPlayer.power}` : ""}
              </Text>
            ) : (
              <Text style={styles.textPlayer}>No player selected</Text>
            )}
          </View>
        </View>
      </ScrollView>
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
  },
  playerButton: {
    width: 150,
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
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
  h2: {
    backgroundColor: "#141313",
    fontFamily: "Voyage",
    paddingHorizontal: 5,
    fontSize: 37,
    color: "#C38100",
    marginTop: -50,
    marginBottom: 30,
  },
  smallText: {
    fontSize: 14,
    fontFamily: "Montserrat",
    textAlign: "center",
    color: "#C38100",
  },
  textPlayer: {
    fontSize: 16,
    fontFamily: "MontserratBold",
    textAlign: "center",
    color: "#69140E",
    paddingTop: 10,
    marginBottom: 24,
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

export default SeerView;
