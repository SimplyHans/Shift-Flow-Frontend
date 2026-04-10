import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const rawBaseUrl = process.env.baseURL ?? process.env.EXPO_PUBLIC_baseURL ?? "192.168.18.20:9090/api";
const baseURL = rawBaseUrl.startsWith("http") ? rawBaseUrl : `http://${rawBaseUrl}`;

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
export { baseURL };

