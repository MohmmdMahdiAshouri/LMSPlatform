import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(token!);
        }
    });
    failedQueue = [];
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = "accessToken"; // useAuthStore.getState().accessToken; // اینجا باید accessToken واقعی از store گرفته شود
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response.data,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        if (originalRequest.url === "/auth/refresh-token") {
            // useAuthStore.getState().logout();
            window.location.href = "/login";
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return apiClient(originalRequest);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
                {},
                { withCredentials: true },
            );

            const { accessToken } = response.data;
            // useAuthStore.getState().setAccessToken(accessToken);

            processQueue(null, accessToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return apiClient(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            // useAuthStore.getState().logout();
            window.location.href = "/login";
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    },
);
