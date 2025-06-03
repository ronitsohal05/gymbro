import axios from "axios";
import { API_BASE } from "../config";

const client = axios.create({
    baseURL: API_BASE
});


export function chat(m) {
    return client.post("/gymbro/chat", { message: m })
}