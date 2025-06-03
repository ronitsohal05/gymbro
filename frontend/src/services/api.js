import axios from "axios";
import { API_BASE } from "../config"

const client = axios.create({
    baseURL: API_BASE
});

export function ping() {
    return client.get("/pong");
}