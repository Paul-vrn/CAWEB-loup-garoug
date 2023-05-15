import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Text } from "@ui-kitten/components";
import { Stack, useRouter, useSearchParams } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Game, Player } from "types";

import Loading from "../../../../components/loading";
import { getGame } from "../../../../utils/api/game";
import { getPlayer, updatePlayer } from "../../../../utils/api/player";

const ContaminatorView = () => {
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

  const handlePlayerClick = async (contaminatedPlayer: Player) => {
    setSelectedPlayer(contaminatedPlayer);
    setIsButtonDisabled(true);

    // Update the contaminated player's role and power
    const updatedContaminated: Player = {
      ...contaminatedPlayer,
      role: "WOLF",
      power: "NONE",
    };
    delete updatedContaminated?.user;
    updateQuery(updatedContaminated);

    // Update the contaminator's power usage
    const updatedContaminator: Player = {
      ...currentPlayer!,
      usedPower: true,
    };

    delete updatedContaminator?.user;
    updateQuery(updatedContaminator);
  };

  if (isError || isErrorPlayer || isErrorUpdate) {
    router.back();
    console.log("erreur");
  }

  if (isLoading || isLoadingPlayer) {
    return <Loading title="Power loading" message={"Loading..."} />;
  }

  return (
    <SafeAreaView style={styles.background}>
      <Stack.Screen options={{ title: "Contaminator", headerRight: () => null }} />
      <ScrollView>
        <View style={styles.centeredView}>
          <View style={styles.wrapper}>
            <Text style={styles.title}>Contaminator Power</Text>
          </View>
          <View style={styles.wrapperTitle}>
            <Text style={[styles.text]}>
              The Contaminator possesses a sinister ability to corrupt the innocent villagers,
              turning them into bloodthirsty wolves
            </Text>
          </View>

          <View style={styles.mainWrapper}>
            <Text style={styles.h2}>Unleash viruses</Text>
            {game?.players &&
              game.players
                .filter((player: Player) => player.role === "VILLAGER")
                .map((player: Player) => (
                  <Button
                    key={player.userId}
                    onPress={async () => {
                      handlePlayerClick(player);
                    }}
                    style={styles.playerButton}
                    disabled={isButtonDisabled}
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
                {selectedPlayer.user?.name!}
                {` is now a wolf...`}
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

export default ContaminatorView;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#141313",
  },
  playerButton: {
    width: 150,
    alignSelf: "center",
    borderRadius: 24,
    backgroundColor: "#C38100",
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 15,
    color: "#141313",
    fontFamily: "MontserratBold",
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
  title: {
    marginBottom: "10%",
    fontFamily: "Voyage",
    fontSize: 40,
    color: "#C38100",
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
    marginBottom: "5%",
  },
  text: {
    fontSize: 14,
    fontFamily: "Montserrat",
    textAlign: "center",
    color: "#C38100",
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
    fontSize: 37,
    color: "#C38100",
    marginTop: -50,
    marginBottom: 30,
  },
});
