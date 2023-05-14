import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Input, Text } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Error, User } from "types";
import { AuthContext } from "../../components/context/tokenContext";
import { ModalConfirmChoice } from "../../components/modals/modalConfirm";
import { setTokenApi } from "../../utils/api/api";
import { deleteUser, updateUser } from "../../utils/api/user";

const Settings = () => {
  const { name: defaultName, id, handleSetToken } = useContext(AuthContext);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
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
      setIsError(true);
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
          <View style={styles.line}>
            <Text>{""}</Text>
          </View>
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
            <Text {...evaProps} style={styles.modifyText}>
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

        {isError && <Text style={styles.errorText}>{errorMessage}</Text>}
      </View>
      <ModalConfirmChoice
        title="Confirm modification"
        description="Do you want to modify your information?"
        visible={visibleModify}
        setVisible={setVisibleModify}
        confirmFunction={handleModify}
      />

      <ModalConfirmChoice
        title="Delete your account"
        description="Do you wish to delete your account?"
        visible={visibleDelete}
        setVisible={setVisibleDelete}
        confirmFunction={deleteQuery}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    backgroundColor: "#141313",
    alignItems: "center",
    height: "100%",
  },
  centeredView: {
    alignItems: "center",
    justifyContent: "center",
    width: "70%",
    paddingTop: "5%",
    paddingBottom: "5%",
  },
  button: {
    width: "100%",
    marginVertical: 10,
    borderRadius: 24,
    boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.15)",
  },
  logout: {
    marginBottom: "20%",
  },
  input: {
    width: "100%",
    marginVertical: 5,
    borderRadius: 24,
    boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.15)",
  },
  modifyButton: {
    marginBottom: "10%",
    backgroundColor: "#141313",
    borderColor: "#C38100",
  },
  wrapperTitle: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: "10%",
    marginBottom: 40,
  },
  line: {
    position: "relative",
    borderColor: "#C38100",
    height: 0,
    borderBottomWidth: 2,
    width: "100%",
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
    fontFamily: "MontserratBold",
    color: "#141313",
  },
  modifyText: {
    fontSize: 17,
    fontFamily: "MontserratBold",
    color: "#C38100",
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
