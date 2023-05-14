// ici on utilise axios et react query pour faire des requêtes http
import axios from "axios";
const api = axios.create({
  //baseURL: "http://localhost:3000/api",
  baseURL: "https://wolfo-backend.osc-fr1.scalingo.io/api",
  headers: {
    "Content-type": "application/json",
  },
});
let token: string | null = null;

export const setTokenApi = (newToken: string | null) => {
  token = newToken;
};
export const getTokenApi = () => token;

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
    console.error(error, error.config.url);
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
