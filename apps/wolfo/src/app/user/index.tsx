import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Input, Text } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Error, User } from "types";
import { AuthContext } from "../../components/context/tokenContext";
import { ModalConfirmChoice } from "../../components/modals/modalConfirm";
import { setTokenApi } from "../../utils/api/api";
import { deleteUser, updateUser } from "../../utils/api/user";

import sunSeer from "../../../assets/images/sun_asset.png";

const Settings = () => {
  const { name: defaultName, id, handleSetToken } = useContext(AuthContext);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [name, setName] = useState<string>(defaultName);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [visibleDelete, setVisibleDelete] = useState<boolean>(false);
  const [visibleModify, setVisibleModify] = useState<boolean>(false);

  const { mutate: updateQuery } = useMutation<any, Error, User>({
    mutationFn: userUpdated => updateUser(userUpdated),
    onSuccess: data => {
      handleSetToken(data.token);
      setErrorMessage("");
    },
    onError: (error: Error) => {
      setErrorMessage(error.message);
    },
  });
  const { mutate: deleteQuery } = useMutation<any, Error>({
    mutationFn: deleteUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      handleSetToken(null);
      setTokenApi(null);
      router.back();
    },
  });
  const logout = async () => {
    await queryClient.invalidateQueries();
    handleSetToken(null);
    setTokenApi(null);
    router.back();
  };
  const handleModify = async () => {
    if (password !== confirmPassword) {
      setErrorMessage("Passwords don't match");
      return;
    }
    await queryClient.invalidateQueries(["token"]);
    updateQuery({ id, name, password });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centeredView}>
        <View style={styles.wrapperTitle}>
          <View style={styles.line}>{""}</View>
          <Text style={styles.h2}>Settings</Text>
          <Text style={styles.textName}>{name}</Text>
        </View>
        <Input
          placeholder="Username"
          onChangeText={setName}
          testID="update-username-input"
          style={styles.input}
        />
        <Input
          placeholder="Password"
          onChangeText={setPassword}
          testID="update-password-input"
          style={styles.input}
        />
        <Input
          placeholder="Confirm password"
          onChangeText={setConfirmPassword}
          testID="confirm-update-password-input"
          style={styles.input}
        />

        <Button
          onPress={() => setVisibleModify(true)}
          testID="update-account-button"
          style={[styles.button, styles.modifyButton]}
        >
          {evaProps => (
            <Text {...evaProps} style={styles.buttonText}>
              Modify account
            </Text>
          )}
        </Button>
        <Button
          onPress={() => setVisibleDelete(true)}
          testID="delete-account-button"
          style={styles.button}
        >
          {evaProps => (
            <Text {...evaProps} style={styles.buttonText}>
              Delete account
            </Text>
          )}
        </Button>
        <Button
          onPress={() => logout()}
          testID="logout-button"
          style={[styles.button, styles.logout]}
        >
          {evaProps => (
            <Text {...evaProps} style={styles.buttonText}>
              Logout
            </Text>
          )}
        </Button>

        <Image source={sunSeer} style={styles.image} />

        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      </View>
      <ModalConfirmChoice
        title="Confirm modification"
        description="Voulez vous modifier vos informations?"
        visible={visibleModify}
        setVisible={setVisibleModify}
        confirmFunction={handleModify}
      />

      <ModalConfirmChoice
        title="Delete your account"
        description="Voulez vous supprimer votre compte?"
        visible={visibleDelete}
        setVisible={setVisibleDelete}
        confirmFunction={deleteQuery}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#141313",
    alignItems: "center",
  },
  centeredView: {
    alignItems: "center",
    justifyContent: "center",
    width: "70%",
    paddingTop: "10%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  button: {
    width: "100%",
    marginVertical: 10,
    borderRadius: 20,
    boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.15)",
  },
  logout: {
    marginBottom: "20%",
  },
  input: {
    width: "100%",
    marginVertical: 5,
    borderRadius: 20,
    boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.15)",
  },
  modifyButton: {
    marginBottom: "10%",
    backgroundColor: "#FFBCB5",
    borderColor: "#FFBCB5",
  },
  wrapperTitle: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "10%",
    marginBottom: 40,
  },
  line: {
    borderColor: "#C38100",
    borderWidth: 1,
    width: "150%",
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
  buttonText: {
    fontSize: 17,
    // fontWeight: "bold",
    fontFamily: "MontserratBold",
    color: "#141313",
  },
  errorText: {
    fontSize: 17,
    fontFamily: "MontserratBold",
    color: "#FFBCB5",
    marginTop: 10,
  },
  textName: {
    fontSize: 20,
    fontFamily: "MontserratBold",
    color: "#C38100",
  },
});

export default Settings;
