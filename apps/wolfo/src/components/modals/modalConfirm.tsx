import { Button, Card, Modal, Text } from "@ui-kitten/components";
import React from "react";
import { StyleSheet, View } from "react-native";
import useFont from "../../utils/hooks/useFont";

interface ModalConfirmChoiceProps {
  title: string;
  description: string;
  visible: boolean;
  setVisible: (value: boolean) => void;
  confirmFunction: () => void;
}
export const ModalConfirmChoice = ({
  title,
  description,
  visible,
  setVisible,
  confirmFunction,
}: ModalConfirmChoiceProps) => {
  const fontsLoaded = useFont();
  if (!fontsLoaded) {
    return null;
  }

  return (
    <Modal visible={visible} onBackdropPress={() => setVisible(false)} animationType="slide">
      <Card style={styles.modalView}>
        <Text style={styles.modalTitle}>{title}</Text>
        <Text style={styles.modalText}>{description}</Text>
        <View style={styles.buttonContainer}>
          <Button
            onPress={() => {
              setVisible(false);
              confirmFunction();
            }}
            style={styles.button}
            testID="modal-confirm"
          >
            {evaProps => (
              <Text {...evaProps} style={[styles.buttonText, styles.confirmText]}>
                Confirm
              </Text>
            )}
          </Button>
          <Button
            onPress={() => setVisible(false)}
            style={{ ...styles.button, ...styles.cancelButton }}
            testID="modal-cancel"
          >
            {evaProps => (
              <Text {...evaProps} style={[styles.buttonText, styles.cancelText]}>
                Cancel
              </Text>
            )}
          </Button>
        </View>
      </Card>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalView: {
    margin: 20,
    backgroundColor: "#141313",
    borderColor: "#C38100",
    borderWidth: 2,
    borderRadius: 24,
    paddingHorizontal: 5,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "MontserratBold",
    marginBottom: 15,
    textAlign: "center",
    color: "#C38100",
  },
  modalText: {
    paddingHorizontal: 15,
    marginBottom: 15,
    textAlign: "center",
    color: "#C38100",
    fontSize: 18,
    fontFamily: "Montserrat",
  },
  button: {
    justifyContent: "center",
    marginHorizontal: 10,
    marginTop: 10,
    alignItems: "center",
    borderRadius: 24,
    boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.15)",
  },
  cancelButton: {
    backgroundColor: "#141313",
    borderColor: "#C38100",
  },
  buttonText: {
    paddingHorizontal: 15,
    fontWeight: "bold",
  },
  cancelText: {
    color: "#C38100",
  },
  confirmText: {
    color: "#141313",
  },
  buttonContainer: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
