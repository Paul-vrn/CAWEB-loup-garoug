// ici on utilise axios et react query pour faire des requêtes http
import axios from "axios";
const api = axios.create({
  baseURL: "http://192.168.1.13:3000/api",
  headers: {
    "Content-type": "application/json",
  },
});
let token: string | null = null;

export const setToken = (newToken: string | null) => {
  token = newToken;
};
export const getToken = () => token;
api.interceptors.request.use(
  async config => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.log(error);
    return Promise.reject(error);
  }
);

// On intercepte les erreurs pour ne pas avoir à les gérer à chaque fois
api.interceptors.response.use(
  response => response,
  error => {
    console.error(error);
    //console.error(JSON.stringify(error));
    if (error.data === "Endpoint not found") {
      return Promise.reject({ message: "Endpoint not found at " + error.config.url });
    } else if (error.message === "Network Error") {
      return Promise.reject({ message: "Network Error" });
    } else if (error.response === undefined) {
      return Promise.reject(error);
    } else {
      return Promise.reject(error.response.data);
    }
  }
);

export default api;
