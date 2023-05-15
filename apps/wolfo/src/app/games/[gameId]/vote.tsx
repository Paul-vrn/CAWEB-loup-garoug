import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack, useRouter, useSearchParams } from "expo-router";
import React, { useContext, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { Game, Player, Role, StateGame, StatePlayer, Vote as VoteType } from "types";
import { AuthContext } from "../../../components/context/tokenContext";
import Loading from "../../../components/loading";
import { ModalConfirmChoice } from "../../../components/modals/modalConfirm";
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
  const [modalVisible, setModalVisible] = useState<boolean>(false);
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
      {/* <View style={styles.voteCount}>
        <Text style={styles.text}>{nbVotes}</Text>
      </View> */}
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
        <Text style={[styles.text, styles.smallText]}>{nbVotes} Votes</Text>
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
              setModalVisible(true);
            }
          }}
        >
          <Text
            style={[
              styles.text,
              styles.buttonText,
              choicePlayer.userId === currentVote?.targetId ? styles.buttonCancelText : {},
            ]}
          >
            {choicePlayer.userId === currentVote?.targetId ? "Cancel" : "Vote"}
          </Text>
        </Pressable>
      ) : (
        <></>
      )}
      <ModalConfirmChoice
        title={"Voting against " + choicePlayer.user?.name!}
        description={`Do you confirm your vote?`}
        visible={modalVisible}
        setVisible={setModalVisible}
        confirmFunction={confirmHandle}
      />
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
    return <Text>An error occured. Please try again in a little</Text>;
  }
  if (!game.curElecId) {
    router.back();
    return;
  }
  const renderItem = ({ item: player, index: i }: { item: Player; index: number }) => {
    if (
      currentPlayer.userId !== player.userId &&
      (game.state === StateGame.DAY ||
        (currentPlayer.role === Role.WOLF && player.role !== Role.WOLF))
    ) {
      return (
        <Choice
          key={player.userId}
          choicePlayer={player}
          currentPlayer={currentPlayer as Player}
          nbVotes={votes[i].length}
          electionId={game?.curElecId!}
          currentVote={currentVote}
        />
      );
    } else {
      return null;
    }
  };

  return (
    <SafeAreaView style={styles.background}>
      <Stack.Screen
        options={{
          title: (game.state === StateGame.DAY ? "Villager" : "Werewolf") + " vote",
          headerRight: () => null,
        }}
      />
      {game.state === StateGame.NIGHT && currentPlayer.role !== Role.WOLF ? (
        <Text style={[styles.text, styles.title]}>
          Can't vote at night. Come back in the morning!
        </Text>
      ) : (
        <View style={styles.wrapperTitle}>
          <View style={styles.line} />
          <Text style={styles.h2}>Vote</Text>
        </View>
      )}
      <View style={styles.mainView}>
        <FlatList
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          data={game?.players}
          renderItem={renderItem}
          keyExtractor={player => player.userId}
        />
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  wrapperTitle: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: "10%",
    marginBottom: 40,
  },
  separator: {
    position: "relative",
    borderColor: "#C38100",
    height: 0,
    borderBottomWidth: 1,
    width: "100%",
  },
  line: {
    position: "relative",
    borderColor: "#C38100",
    height: 0,
    borderBottomWidth: 2,
    width: "80%",
  },
  image: {
    width: 200,
    height: 200,
  },
  h2: {
    backgroundColor: "#141313",
    fontFamily: "Voyage",
    fontSize: 37,
    color: "#C38100",
    zIndex: 1,
    marginTop: -30,
    paddingHorizontal: 10,
  },
  background: {
    display: "flex",
    backgroundColor: "#141313",
    flexGrow: 1,
  },
  mainView: {
    // marginTop: "40%",
    marginBottom: "50%",
    // flexDirection: "column",
    justifyContent: "flex-start",
    position: "relative",
    borderWidth: 2,
    flexGrow: 1,
    flexShrink: 1,
    display: "flex",
    width: "80%",
    left: "10%",
    borderColor: "#C38100",
    overflow: "hidden",
  },
  text: {
    color: "#C38100",
    fontWeight: "bold",
    textAlign: "center",
    overflow: "visible",
  },
  smallText: {
    fontWeight: "normal",
    marginBottom: 10,
  },
  name: {
    marginTop: 10,
    fontSize: 24,
  },
  title: {
    fontSize: 28,
  },
  container: {
    position: "relative",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "nowrap",
    paddingRight: 30,
    // borderTopWidth: 2,
    // borderBottomWidth: 2,
    // borderColor: "transparent",
    // borderStyle: "solid",
    // borderBottomColor: "#C38100",
    // borderTopColor: "#C38100",
    overflow: "visible",
    // borderRadius: 25,
    gap: 30,
  },
  buttonConfirm: {
    // borderRadius: 25,
    // backgroundColor: "green",
  },
  buttonCancel: {
    // borderRadius: 25,
    backgroundColor: "#141313",
    borderColor: "#C38100",
    borderWidth: 1,
    borderStyle: "solid",
  },
  buttonCancelText: {
    color: "#C38100",
  },
  buttonContent: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    position: "relative",
    display: "flex",
    justifyContent: "center",
    backgroundColor: "#C38100",
    borderRadius: 20,
  },
  buttonText: {
    color: "#141313",
  },
  buttonView: {
    flexGrow: 1,
    borderStyle: "solid",
    borderColor: "#C38100",
    borderTopColor: "transparent",
    position: "relative",
    display: "flex",
    textAlign: "center",
    justifyContent: "center",
  },
  deadPlayer: {
    borderColor: "rgb(59, 54, 54)",
    backgroundColor: "gray",
  },
  selected: {
    // borderColor: "rgb(135, 113, 5)",
    // backgroundColor: "rgb(235, 212, 99)",
    // textDecorationLine: "underline",
    // textDecorationColor: "#C38100",
    fontStyle: "italic",
  },
});

export default Vote;
