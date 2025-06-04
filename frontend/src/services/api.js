import axios from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import { API_BASE } from "../config";

const client = axios.create({
    baseURL: API_BASE
});


client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const refreshAuthLogic = async (failedRequest) => {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) {
    // No refresh token: force logout
    localStorage.removeItem("access_token");
    window.location.href = "/login";
    return Promise.reject("No refresh token available");
  }

  try {
    const response = await axios.post(
      `${API_BASE}/api/auth/refresh`,
      {},
      {
        headers: { Authorization: `Bearer ${refreshToken}` },
      }
    );
    const newAccessToken = response.data.access_token;
    localStorage.setItem("access_token", newAccessToken);
    // Retry the original request with the new access token
    failedRequest.response.config.headers[
      "Authorization"
    ] = `Bearer ${newAccessToken}`;
    return Promise.resolve();
  } catch (err) {
    // Refresh failed: clear tokens and redirect to login
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
    return Promise.reject(err);
  }
};

createAuthRefreshInterceptor(client, refreshAuthLogic);

export async function signup(username, password) {
  return client.post("/auth/signup", { username, password });
}

export async function login(username, password) {
  return client.post("/auth/login", { username, password });
}

export async function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "/login";
}

export function chat(m) {
    return client.post("/gymbro/chat", { message: m })
}

export default client;