import { AntDesign } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Divider, List, Text } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { Game, StateGame } from "types";
import { getGamesLobby, getMyGames, joinGame, leaveGame } from "../../utils/api/game";
import { AuthContext } from "../context/tokenContext";
import Loading from "../loading";
import { ModalConfirmChoice } from "../modals/modalConfirm";
import { GameItemInGame, GameItemLobby, GameItemNotJoined } from "./gameItem";

interface ListProps {
  search: string;
}

export const ListGamesLobby: React.FC<ListProps> = ({ search }) => {
  const queryClient = useQueryClient();
  const [visible, setVisible] = useState<boolean>(false);
  const [selectedGame, setSelectedGame] = useState<number>(0);
  const { token } = useContext(AuthContext);
  const toggleVisible = () => setVisible(!visible);
  const {
    data: games,
    isLoading,
    refetch,
  } = useQuery<Game[]>({
    enabled: Boolean(token),
    queryKey: ["games"],
    queryFn: getGamesLobby,
    refetchOnMount: true,
    cacheTime: 0,
  });
  const { mutate } = useMutation<any, Error, number>({
    mutationFn: (gameId: number) => joinGame(gameId),
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries(["mygames"]);
    },
  });
  const handleJoin = (gameId: number) => {
    setSelectedGame(gameId);
    toggleVisible();
  };
  if (isLoading) {
    return <Loading title="Loading games" message="loading list of games" />;
  }
  const filteredGames = games?.filter((game: Game) =>
    game.name.toLowerCase().includes(search.toLowerCase())
  );

  const listGame = ({ item }: { item: Game; index: number }) => (
    <GameItemNotJoined key={item.id} game={item} handleFunction={handleJoin} />
  );
  return (
    <SafeAreaView style={styles.listContainer}>
      {games ? (
        // si web le scrollview intégré à list marche pas donc on bidouille un scrollview + reload button
        Platform.OS === "web" ? (
          <ScrollView>
            <List
              nestedScrollEnabled
              data={filteredGames}
              renderItem={listGame}
              ItemSeparatorComponent={Divider}
              onRefresh={refetch}
              refreshing={isLoading}
            />
            <Button onPress={() => refetch()}>
              <AntDesign name="reload1" size={10} color="black" />
            </Button>
          </ScrollView>
        ) : (
          <List
            nestedScrollEnabled
            data={filteredGames}
            renderItem={listGame}
            ItemSeparatorComponent={Divider}
            onRefresh={refetch}
            refreshing={isLoading}
          />
        )
      ) : (
        <Button onPress={() => refetch()}>
          <AntDesign name="reload1" size={10} color="black" />
        </Button>
      )}
      <ModalConfirmChoice
        title="Join game"
        description="Do you want to join this game ?"
        visible={visible}
        setVisible={setVisible}
        confirmFunction={() => {
          mutate(selectedGame);
        }}
      />
    </SafeAreaView>
  );
};

export const ListMyGames: React.FC<ListProps> = ({ search }) => {
  const queryClient = useQueryClient();
  const [visible, setVisible] = useState<boolean>(false);
  const [selectedGame, setSelectedGame] = useState<number>(0);
  const { token } = useContext(AuthContext);

  const toggleVisible = () => setVisible(!visible);
  const router = useRouter();
  const {
    data: games,
    isLoading,
    isError,
    refetch,
  } = useQuery<Game[]>({
    enabled: Boolean(token),
    queryKey: ["mygames"],
    queryFn: getMyGames,
    refetchOnMount: true,
    cacheTime: 0,
  });
  const { mutate } = useMutation<any, Error, number>({
    mutationFn: (gameId: number) => leaveGame(gameId),
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries(["games"]);
    },
  });
  if (isLoading) {
    return <Loading title="Loading mygames" message="loading list of games" />;
  }
  const handleLeave = (gameId: number) => {
    setSelectedGame(gameId);
    toggleVisible();
  };
  const filteredGames = games?.filter((game: Game) =>
    game.name.toLowerCase().includes(search.toLowerCase())
  );
  const listGame = ({ item }: { item: Game; index: number }) => {
    return item.state === StateGame.LOBBY ? (
      <GameItemLobby game={item} handleFunction={handleLeave} />
    ) : (
      <GameItemInGame game={item} handleFunction={() => router.push(`/games/${item.id}`)} />
    );
  };
  return (
    <SafeAreaView style={styles.listContainer}>
      {!isError && games.length !== 0 ? (
        // si web le scrollview intégré à list marche pas donc on bidouille un scrollview + reload button
        Platform.OS === "web" ? (
          <ScrollView>
            <List
              nestedScrollEnabled
              data={filteredGames}
              renderItem={listGame}
              ItemSeparatorComponent={Divider}
              onRefresh={refetch}
              refreshing={isLoading}
            />
            <Button onPress={() => refetch()}>
              <AntDesign name="reload1" size={10} color="black" />
            </Button>
          </ScrollView>
        ) : (
          <List
            nestedScrollEnabled
            data={filteredGames}
            renderItem={listGame}
            ItemSeparatorComponent={Divider}
            onRefresh={refetch}
            refreshing={isLoading}
          />
        )
      ) : (
        <View style={styles.view}>
          {isError && <Text style={styles.text}>An error occured. Please try refreshing.</Text>}
          <Button onPress={async () => await refetch()}>
            <AntDesign name="reload1" size={10} color="black" />
          </Button>
        </View>
      )}
      <ModalConfirmChoice
        title="Leave game"
        description="Are you sure you want to leave the game ?"
        visible={visible}
        setVisible={setVisible}
        confirmFunction={() => {
          mutate(selectedGame);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    flex: Platform.OS === "web" ? 1 : undefined,
  },
  view: {
    borderRadius: 24,
  },
  text: {
    padding: "1em",
  },
  icon: {
    width: 24,
    height: 24,
  },
});
