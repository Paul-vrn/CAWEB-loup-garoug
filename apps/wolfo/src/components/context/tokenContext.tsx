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
  if (Platform.OS === "web") {
    return await localStorage.getItem("token");
  } else {
    return await SecureStore.getItemAsync("token");
  }
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
          console.log("token from storage", t);
          if (!t) {
            // Redirect to the sign-in page.
            router.replace("/auth");
          } else {
            // Redirect away from the sign-in page.
            setTokenApi(t);
            handleSetToken(t);
            if (inAuthGroup) router.replace("/");
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
