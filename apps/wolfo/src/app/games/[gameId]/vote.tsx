import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@ui-kitten/components";
import { useSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { Game, Player, Role, StateGame, StatePlayer, Vote as VoteType } from "types";
import Loading from "../../../components/loading";
import { getGame } from "../../../utils/api/game";
import { getPlayer } from "../../../utils/api/player";
import voteApi from "../../../utils/api/vote";

interface ChoiceProps {
  choicePlayer: Player;
  activePlayer: Player | null;
  setActivePlayer: React.Dispatch<React.SetStateAction<Player | null>>;
  currentPlayer: Player;
  electionId: number;
  currentVote: VoteType | undefined;
}
const Choice = ({
  choicePlayer,
  activePlayer,
  setActivePlayer,
  currentPlayer,
  electionId,
  currentVote,
}: ChoiceProps) => {
  const queryClient = useQueryClient();
  const [Width, setWidth] = useState(0);
  const shiftAnim = useRef(new Animated.Value(0)).current;
  /* Style animation */
  const buttonContentShifted = {
    right: shiftAnim,
  };
  const confirmHandle = async () => {
    const vote: VoteType = {
      voterId: currentPlayer.userId,
      targetId: choicePlayer.userId,
      gameId: choicePlayer.gameId,
      electionId: electionId,
    };
    if (currentVote === null) {
      await voteApi
        .createVote(currentPlayer, electionId, vote)
        .then(() => {
          queryClient.invalidateQueries(["vote"]);
        })
        .catch(_ => console.log("An error occurred"));
    } else if (currentVote?.targetId !== choicePlayer.userId) {
      console.log("here");
      await voteApi
        .updateVote(currentPlayer, electionId, vote)
        .then(() => {
          queryClient.invalidateQueries(["vote"]);
        })
        .catch(_ => console.log("An error occurred"));
    }
    setActivePlayer(null);
    stopAnimation();
  };
  const cancelHandle = async () => {
    if (currentVote?.targetId === choicePlayer.userId) {
      console.log("deleted");
      await voteApi.deleteVote(currentPlayer, electionId).then(() => {
        queryClient.invalidateQueries(["vote"]);
      });
    }
    setActivePlayer(null);
    stopAnimation();
  };
  const stopAnimation = () => {
    Animated.timing(shiftAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };
  if (choicePlayer !== activePlayer) {
    stopAnimation();
  }
  return (
    <View
      style={
        (styles.container, choicePlayer.userId === currentVote?.targetId ? styles.selected : {})
      }
    >
      {choicePlayer.state === StatePlayer.ALIVE ? (
        <Animated.View style={[styles.buttonContent, buttonContentShifted]}>
          <Pressable
            style={styles.pressableView}
            onPress={() => {
              if (choicePlayer === activePlayer) {
                return;
              }
              setActivePlayer(choicePlayer);
              Animated.timing(shiftAnim, {
                toValue: Width,
                duration: 1000,
                useNativeDriver: true,
              }).start();
            }}
          >
            <View
              style={[styles.buttonViewLeft]}
              onLayout={event => {
                const { width } = event.nativeEvent.layout;
                setWidth(width);
              }}
            >
              <Text style={styles.text}>{choicePlayer?.user!.name}</Text>
            </View>
          </Pressable>

          <View style={[styles.buttonViewRight]}>
            <Button onPress={confirmHandle} style={styles.buttonConfirm}>
              Confirm
            </Button>
            <Button onPress={cancelHandle} style={styles.buttonCancel}>
              Cancel
            </Button>
          </View>
        </Animated.View>
      ) : (
        <View
          style={[styles.buttonViewLeft, styles.deadPlayer]}
          onLayout={event => {
            const { width } = event.nativeEvent.layout;
            setWidth(width);
          }}
        >
          <Text style={styles.text}>{choicePlayer?.user!.name}</Text>
        </View>
      )}
    </View>
  );
};

const Vote = () => {
  const { gameId, userId } = useSearchParams();
  const {
    data: game,
    isLoading,
    isError,
  } = useQuery<Game, Error>({
    enabled: Boolean(gameId),
    queryKey: ["mygames", gameId],
    queryFn: () => getGame(Number(gameId)),
  });
  const {
    data: currentPlayer,
    isLoading: isLoadingPlayer,
    isError: isErrorPlayer,
  } = useQuery<Player, Error>({
    enabled: Boolean(game) && Boolean(userId),
    queryKey: ["player", userId],
    queryFn: () => getPlayer(game?.id!, Array.isArray(userId) ? userId[0] : userId!),
  });
  const {
    data: currentVote,
    isLoading: isLoadingVote,
    isError: isErrorVote,
    isSuccess: isSuccessVote,
  } = useQuery<VoteType, Error>({
    enabled: Boolean(currentPlayer) && Boolean(game?.curElecId),
    queryKey: ["vote", userId],
    queryFn: () => {
      return voteApi.getVote(currentPlayer!, game?.curElecId!);
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const [activePlayer, setActivePlayer] = useState<Player | null>(null);
  const activeVote = useRef<VoteType | undefined>(undefined);
  console.log(currentVote);
  if (isLoading || isLoadingPlayer || isLoadingVote) {
    return <Loading title="Vote Loading" message={"Loading..."} />;
  }
  if (isSuccessVote) {
    console.log(currentVote);
    activeVote.current = currentVote;
  }
  if (isErrorPlayer || isErrorVote || isError || !game || !currentPlayer || !game.curElecId) {
    console.log(game);
    console.log(isErrorVote);
    return <Text>An error occured. Please try again in a little</Text>;
  }

  return (
    <SafeAreaView>
      <ScrollView>
        {game.state === StateGame.NIGHT && currentPlayer.role !== Role.WOLF && (
          <Text>Can't vote at night. Come back in the morning!</Text>
        )}
        {game?.players.map(
          (player: Player) =>
            (game.state === StateGame.DAY ||
              (currentPlayer.role === Role.WOLF && player.role !== Role.WOLF)) && (
              <Choice
                choicePlayer={player}
                activePlayer={activePlayer}
                setActivePlayer={setActivePlayer}
                currentPlayer={currentPlayer as Player}
                electionId={game?.curElecId!}
                currentVote={currentVote}
              />
            )
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  text: {
    fontWeight: "bold",
  },
  containerBorder: {
    borderStyle: "solid",
    borderColor: "black",

    borderWidth: 1,
  },
  container: {
    width: "80%",
    left: "10%",
    height: 80,
    overflow: "hidden",
    borderRadius: 20,
  },
  buttonConfirm: {
    backgroundColor: "green",
  },
  buttonCancel: {
    backgroundColor: "red",
  },
  buttonContent: {
    position: "relative",
    width: "200%",
    height: "100%",
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    // backgroundColor: "red",
  },
  pressableView: {
    width: "50%",
  },
  buttonViewLeft: {
    backgroundColor: "brown",
    display: "flex",
    textAlign: "center",
    width: "100%",
    height: "100%",
    justifyContent: "center",
  },
  deadPlayer: {
    backgroundColor: "gray",
  },
  selected: {
    borderColor: "gold",
    borderWidth: 3,
    borderStyle: "solid",
  },
  buttonViewRight: {
    padding: 20,
    textAlign: "center",
    width: "50%",
    height: "100%",
    backgroundColor: "#8F4401",
    display: "flex",
    justifyContent: "space-around",
    flexDirection: "row",
    alignItems: "center",
  },
});

export default Vote;
