import axios from "axios";

const rawBaseUrl = process.env.baseURL ?? process.env.EXPO_PUBLIC_baseURL ?? "localhost:9090/api";
const baseURL = rawBaseUrl.startsWith("http") ? rawBaseUrl : `http://${rawBaseUrl}`;

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

export default api;export { baseURL };

