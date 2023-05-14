import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "expo-router";
import React, { useContext, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { Game, Player, Role, StateGame, StatePlayer, Vote as VoteType } from "types";
import { AuthContext } from "../../../components/context/tokenContext";
import Loading from "../../../components/loading";
import { getGame } from "../../../utils/api/game";
import { getPlayer } from "../../../utils/api/player";
import voteApi from "../../../utils/api/vote";

interface ChoiceProps {
  choicePlayer: Player;
  currentPlayer: Player;
  electionId: number;
  nbVotes: number;
  currentVote: VoteType | undefined;
}
const Choice = ({ choicePlayer, currentPlayer, electionId, nbVotes, currentVote }: ChoiceProps) => {
  const queryClient = useQueryClient();

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
          queryClient.invalidateQueries({ queryKey: ["vote"] });
        })
        .catch(_ => console.log("An error occurred"));
    } else if (currentVote?.targetId !== choicePlayer.userId) {
      await voteApi
        .updateVote(currentPlayer, electionId, vote)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["vote"] });
        })
        .catch(_ => console.log("An error occurred"));
    }
  };
  const cancelHandle = async () => {
    if (currentVote?.targetId === choicePlayer.userId) {
      await voteApi.deleteVote(currentPlayer, electionId).then(() => {
        queryClient.invalidateQueries({ queryKey: ["vote"] });
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.voteCount}>
        <Text style={styles.text}>{nbVotes}</Text>
      </View>
      <View
        style={[
          styles.buttonView,
          choicePlayer.state === StatePlayer.DEAD ? styles.deadPlayer : {},
        ]}
      >
        <Text
          style={[
            styles.text,
            styles.name,
            choicePlayer.userId === currentVote?.targetId ? styles.selected : {},
          ]}
        >
          {choicePlayer?.user!.name}
        </Text>
      </View>
      {choicePlayer.state === StatePlayer.ALIVE && currentPlayer.state === StatePlayer.ALIVE ? (
        <Pressable
          style={[
            styles.buttonContent,
            choicePlayer.userId === currentVote?.targetId
              ? styles.buttonCancel
              : styles.buttonConfirm,
          ]}
          onPress={() => {
            if (choicePlayer.userId === currentVote?.targetId) {
              cancelHandle();
            } else {
              confirmHandle();
            }
          }}
        >
          <Text style={[styles.text, styles.buttonText]}>
            {choicePlayer.userId === currentVote?.targetId ? "Cancel" : "Vote"}
          </Text>
        </Pressable>
      ) : (
        <></>
      )}
    </View>
  );
};

const Vote = () => {
  const { gameId, userId } = useSearchParams();
  const { token } = useContext(AuthContext);
  const router = useRouter();
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
  const {
    data: votes,
    isLoading: areVotesLoading,
    isError: isErrorVotes,
  } = useQuery<VoteType[][], Error>({
    queryKey: ["vote", "votes"],
    enabled: Boolean(currentPlayer) && Boolean(game?.curElecId) && Boolean(game?.players),
    queryFn: () => {
      return voteApi.getVotes(game?.players, currentPlayer!, game?.curElecId!);
    },
    refetchOnMount: true,
  });
  const {
    data: currentVote,
    isLoading: isLoadingVote,
    isError: isErrorVote,
    isSuccess: isSuccessVote,
  } = useQuery<VoteType, Error>({
    enabled: Boolean(currentPlayer) && Boolean(game?.curElecId),
    queryKey: ["vote"],
    queryFn: () => {
      return voteApi.getVote(currentPlayer!, game?.curElecId!);
    },
    refetchOnMount: true,
  });

  const activeVote = useRef<VoteType | undefined>(undefined);
  if (isLoading || areVotesLoading || isLoadingPlayer || isLoadingVote) {
    return <Loading title="Vote Loading" message={"Loading..."} />;
  }
  if (isSuccessVote) {
    activeVote.current = currentVote;
  }
  if (
    isErrorPlayer ||
    isErrorVotes ||
    isErrorVote ||
    isError ||
    !game ||
    !votes ||
    !currentPlayer
  ) {
    console.log(game);
    console.log(isErrorVote);
    return <Text>An error occured. Please try again in a little</Text>;
  }
  if (!game.curElecId) {
    router.back();
    return;
  }
  return (
    <SafeAreaView style={styles.background}>
      <ScrollView>
        {game.state === StateGame.NIGHT && currentPlayer.role !== Role.WOLF ? (
          <Text style={[styles.text, styles.title]}>
            Can't vote at night. Come back in the morning!
          </Text>
        ) : (
          <Text style={[styles.text, styles.title]}>It's time to vote!</Text>
        )}
        <View style={styles.mainView}>
          {game?.players.map(
            (player: Player, i: number) =>
              currentPlayer.userId !== player.userId &&
              (game.state === StateGame.DAY ||
                (currentPlayer.role === Role.WOLF && player.role !== Role.WOLF)) && (
                <Choice
                  key={player.userId}
                  choicePlayer={player}
                  currentPlayer={currentPlayer as Player}
                  nbVotes={votes[i].length}
                  electionId={game?.curElecId!}
                  currentVote={currentVote}
                />
              )
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  background: {
    display: "flex",
    backgroundColor: "#141313",
    flex: 1,
  },
  mainView: {
    marginTop: "10%",
    marginBottom: "10%",
    flexDirection: "column",
    justifyContent: "center",
    position: "relative",
    borderWidth: 2,
    display: "flex",
    flex: 1,
    width: "80%",
    left: "10%",
    borderBottomWidth: 0,
    borderColor: "#C38100",
    backgroundColor: "#141313",
  },
  text: {
    color: "#C38100",
    fontWeight: "bold",
    textAlign: "center",
    overflow: "visible",
  },
  name: {
    fontSize: 18,
  },
  title: {
    fontSize: 28,
  },
  containerBorder: {
    borderStyle: "solid",
    borderColor: "black",

    borderWidth: 1,
  },
  container: {
    position: "relative",
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    height: 60,
    // width: "80%",
    borderBottomWidth: 2,
    borderColor: "transparent",
    borderStyle: "solid",
    borderBottomColor: "#C38100",
    overflow: "hidden",
    // borderRadius: 25,
  },
  buttonConfirm: {
    // borderRadius: 25,
    // backgroundColor: "green",
  },
  buttonCancel: {
    // borderRadius: 25,
    // backgroundColor: "red",
  },
  buttonContent: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: "transparent",
    backgroundColor: "#C38100",
    height: "100%",
    width: "15%",
  },
  buttonText: {
    color: "#141313",
  },
  buttonView: {
    paddingVertical: "3%",
    flexGrow: 1,
    flexShrink: 1,
    borderLeftWidth: 3,
    borderRightWidth: 2,
    borderStyle: "solid",
    borderColor: "#C38100",
    borderTopColor: "transparent",
    position: "relative",
    display: "flex",
    textAlign: "center",
    height: "100%",
    justifyContent: "center",
  },
  deadPlayer: {
    borderColor: "rgb(59, 54, 54)",
    backgroundColor: "gray",
  },
  selected: {
    // borderColor: "rgb(135, 113, 5)",
    // backgroundColor: "rgb(235, 212, 99)",
    textDecorationLine: "underline",
    textDecorationColor: "#C38100",
    fontStyle: "italic",
  },
  voteCount: {
    borderColor: "transparent",
    height: "100%",
    aspectRatio: 1,
    display: "flex",
    justifyContent: "center",
    textAlign: "center",
  },
});

export default Vote;
