import { Button, Text } from "@ui-kitten/components";
import React from "react";
import { Image, Modal, StyleSheet, View } from "react-native";
import { Game, Player } from "types";
import aliveIcon from "../../../assets/UI/alive.png";
import deadIcon from "../../../assets/UI/dead.png";

interface ModalPlayersProps {
  game: Game;
  modalVisible: boolean;
  setModalVisible: (value: boolean) => void;
}

export const ModalPlayers = ({ game, modalVisible, setModalVisible }: ModalPlayersProps) => {
  return (
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
            <Text style={styles.h2}>Alive players :</Text>
          </View>
          <Text style={styles.modalText}>
            {game.players
              .filter((p: Player) => p.state === "ALIVE")
              .map((p: Player) => p.user?.name)
              .join(", ")}
          </Text>
          <View style={styles.iconWrapper}>
            <Image source={deadIcon} style={styles.icon} />
            <Text style={styles.h2}>Dead players :</Text>
          </View>
          <Text style={styles.modalText}>
            {game.players
              .filter((p: Player) => p.state === "DEAD")
              .map((p: Player) => p.user?.name)
              .join(", ")}
          </Text>

          <Button onPress={() => setModalVisible(!modalVisible)} style={styles.button}>
            {evaProps => (
              <Text {...evaProps} style={styles.textClose}>
                Close
              </Text>
            )}
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "#141313",
    borderColor: "#C38100",
    borderWidth: 2,
    borderRadius: 24,
    paddingHorizontal: 35,
    paddingVertical: 20,
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
  button: {
    justifyContent: "center",
    marginTop: 10,
    paddingHorizontal: 30,
    alignItems: "center",
    borderRadius: 24,
    boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.15)",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "MontserratBold",
    marginBottom: 15,
    textAlign: "center",
    color: "#C38100",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    color: "#C38100",
    fontFamily: "Montserrat",
  },
  text: {
    fontSize: 14,
    fontFamily: "Montserrat",
    textAlign: "center",
    color: "#C38100",
  },
  h2: {
    fontSize: 14,
    fontFamily: "MontserratBold",
    textAlign: "center",
    color: "#C38100",
  },
  textClose: {
    fontSize: 14,
    fontFamily: "MontserratBold",
    textAlign: "center",
    color: "#141313",
  },
  iconWrapper: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  icon: {
    width: 24,
    height: 24,
    marginBottom: 8,
    marginTop: 20,
  },
});

export default ModalPlayers;
