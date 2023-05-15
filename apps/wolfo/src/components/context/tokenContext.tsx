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

  // fonction qui est trigger sur toutes les routes et qui permet de vérifier si l'utilisateur est connecté
  const useProtectedRoute = (tok: string | null) => {
    const segments = useSegments();
    const router = useRouter();

    React.useEffect(() => {
      const inAuthGroup = segments[0] === "(auth)";
      if (
        // Si l'utilisateur n'est pas connecté et que le segment initial n'est pas dans le groupe d'authentification.
        !tok &&
        !inAuthGroup
      ) {
        // On va chercher le token depuis le storage.
        tokenFromStorage().then(t => {
          // si le token est null, on redirige vers la page d'authentification
          if (!t) {
            // Redirect to the sign-in page.
            router.replace("/auth");
          } else {
            // sinon on set le token dans le contexte et on le set dans l'api
            setTokenApi(t);
            handleSetToken(t);
            // on reset la route à la racine parce que quand on reload,
            // ça refresh useRouter et ça bug les boutons "back"
            router.replace("/");
          }
        });
      } else if (tok && inAuthGroup) {
        // redirect to the home page
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
