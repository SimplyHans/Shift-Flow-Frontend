import axios from "axios"
const api = axios.create( {
    baseURL: `${process.env.baseURL}`,
    headers: {"Content-Type":"application/json"},
});

export default api;