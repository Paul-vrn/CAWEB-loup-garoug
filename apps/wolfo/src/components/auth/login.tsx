import { FontAwesome5 } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Input, Text } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import { StyleSheet, TouchableWithoutFeedback } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Error, NewUser } from "types";
import { setTokenApi } from "../../utils/api/api";
import { login } from "../../utils/api/user";
import { AuthContext } from "../context/tokenContext";

export const Login = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { handleSetToken } = useContext(AuthContext);
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(true);
  const { mutate, isError, error } = useMutation<any, Error, NewUser>({
    mutationFn: user => login(user),
    onSuccess: async data => {
      setTokenApi(data.token);
      handleSetToken(data.token);
      await queryClient.invalidateQueries(["token"]);
      router.replace("/");
    },
  });
  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };
  const renderIcon = (
    <TouchableWithoutFeedback onPress={toggleSecureEntry}>
      <FontAwesome5
        name={secureTextEntry ? "eye-slash" : "eye"}
        size={18}
        color={secureTextEntry ? "rgb(166, 176, 191)" : "rgb(83, 86, 89)"}
      />
    </TouchableWithoutFeedback>
  );

  const handleLogin = () => {
    const user: NewUser = {
      name,
      password,
    };
    mutate(user);
  };
  return (
    <SafeAreaView style={styles.container}>
      <Input
        placeholder="Username"
        onChangeText={setName}
        testID="username-input"
        style={styles.username}
      />
      <Input
        placeholder="Password"
        onChangeText={setPassword}
        testID="password-login-input"
        secureTextEntry={secureTextEntry}
        style={styles.password}
        accessoryRight={renderIcon}
      />
      <Button onPress={handleLogin} style={styles.button} testID="login-button">
        Login
      </Button>
      {isError && <Text style={styles.errorMessage}>{error.message}</Text>}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 0,
  },
  password: {
    borderTopEndRadius: 0,
    borderTopStartRadius: 0,
    borderBottomEndRadius: 14,
    borderBottomStartRadius: 14,
  },
  button: {
    marginTop: 30,
    borderRadius: 24,
  },
  username: {
    borderTopEndRadius: 2,
    borderTopStartRadius: 2,
    borderBottomEndRadius: 0,
    borderBottomStartRadius: 0,
  },
  errorMessage: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
});
