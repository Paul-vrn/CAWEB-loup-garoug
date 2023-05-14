import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { ListItem, Text } from "@ui-kitten/components";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Game, StateGame } from "types";
import { parseDeadline } from "../../utils/services/parsedate";

import { Image } from "react-native";
import DayIcon from "../../../assets/UI/day.png";
import HourglassIcon from "../../../assets/UI/hourglass.png";
import NightIcon from "../../../assets/UI/night.png";

interface GameItemProps {
  game: Game;
  handleFunction: (id: number) => void;
}
export const GameItemLobby = ({ game, handleFunction }: GameItemProps) => {
  return (
    <ListItem
      title={game.name}
      description={"Start : " + parseDeadline(game.deadline, game.startDay)}
      accessoryLeft={() => <FontAwesome name="hourglass-o" size={24} color="black" />}
      accessoryRight={() => {
        return (
          <View style={styles.containerRight}>
            <Text>
              {game.players.length}/{game.maxPlayer}
            </Text>
            <Text style={styles.players}>players</Text>
            <Ionicons
              name="exit-outline"
              size={24}
              color="red"
              onPress={() => handleFunction(game.id)}
            />
          </View>
        );
      }}
    />
  );
};

export const GameItemInGame = ({ game, handleFunction }: GameItemProps) => {
  return (
    <ListItem
      onPress={() => handleFunction(game.id)}
      title={game.name}
      description={"In game"}
      accessoryLeft={() =>
        game.state === StateGame.DAY ? (
          <Image source={DayIcon} style={styles.icon} />
        ) : (
          <Image source={NightIcon} style={styles.icon} />
        )
      }
    />
  );
};

export const GameItemNotJoined = ({ game, handleFunction }: GameItemProps) => {
  return (
    <ListItem
      title={game.name}
      description={"Début : " + parseDeadline(game.deadline, game.startDay)}
      accessoryLeft={() => <Image source={HourglassIcon} style={styles.icon} />}
      accessoryRight={() => {
        return (
          <View style={styles.containerRight}>
            <Text>
              {game.players.length}/{game.maxPlayer}
            </Text>
            <Text style={styles.players}>players</Text>
            <Ionicons
              name="enter-outline"
              size={24}
              color="green"
              onPress={() => handleFunction(game.id)}
            />
          </View>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  players: {
    marginRight: 30,
    fontSize: 10,
  },
  containerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 19,
    height: 24,
  },
});
