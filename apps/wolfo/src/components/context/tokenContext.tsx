import { useRouter, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import jwtDecode from "jwt-decode";
import React, { createContext, useState } from "react";
import { Platform } from "react-native";
import { setTokenApi } from "../../utils/api/api";
interface AuthContextType {
  token: string | null;
  name: string;
  id: string;
  handleSetToken: (token: string | null) => void;
}
export const AuthContext = createContext<AuthContextType>({
  token: "",
  name: "",
  id: "",
  handleSetToken: () => {},
});
interface AuthProviderProps {
  children: React.ReactNode;
}

const tokenFromStorage = async () => {
  let token = null;
  if (Platform.OS === "web") {
    token = await localStorage.getItem("token");
  } else {
    token = await SecureStore.getItemAsync("token");
  }

  if (token !== null) {
    const decodedToken: any = jwtDecode(token);
    const expTimestamp = decodedToken.exp;
    const expDate = new Date(expTimestamp * 1000);
    if (expDate <= new Date()) {
      return null;
    }
  }
  return token;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [id, setId] = useState<string>("");

  const useProtectedRoute = (tok: string | null) => {
    const segments = useSegments();
    const router = useRouter();

    React.useEffect(() => {
      const inAuthGroup = segments[0] === "(auth)";
      if (
        // If the user is not signed in and the initial segment is not anything in the auth group.
        !tok &&
        !inAuthGroup
      ) {
        tokenFromStorage().then(t => {
          if (!t) {
            // Redirect to the sign-in page.
            router.replace("/auth");
          } else {
            // Redirect away from the sign-in page.
            setTokenApi(t);
            handleSetToken(t);
            // on reset la route parce qu'au reload le router a été perdu donc les boutons "back" ne fonctionnent plus
            router.replace("/");
          }
        });
      } else if (tok && inAuthGroup) {
        // Redirect away from the sign-in page.
        router.replace("/");
      }
    }, [tok, router, segments]);
  };
  const handleSetToken = (newToken: string | null) => {
    if (!newToken) {
      if (Platform.OS === "web") {
        localStorage.removeItem("token");
      } else {
        SecureStore.deleteItemAsync("token");
      }
      setToken(null);
      setName("");
      setId("");
      return;
    }
    setToken(newToken);
    const decodedToken: any = jwtDecode(newToken);
    setName(decodedToken.name);
    setId(decodedToken.id);
    if (Platform.OS === "web") {
      localStorage.setItem("token", newToken);
    } else {
      SecureStore.setItemAsync("token", newToken);
    }
  };
  useProtectedRoute(token);
  return (
    <AuthContext.Provider value={{ token, name, id, handleSetToken }}>
      {children}
    </AuthContext.Provider>
  );
};
