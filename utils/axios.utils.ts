"use client";

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { BASEURL } from "./constant.utils";

let api: AxiosInstance | null = null;
let isRefreshing = false;
let failedQueue: any[] = [];

/**
 * 🔥 ADDED: Cross-tab logout trigger (no existing code removed)
 */
export const triggerLogout = () => {
  // Notify other tabs BEFORE clearing (storage event fires on other tabs only)
  localStorage.setItem("logout", Date.now().toString());
  localStorage.clear();
};

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

export const instance = (): AxiosInstance => {
  if (api) return api;

  api = axios.create({
    baseURL: BASEURL,
  });

  // Request interceptor
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      const accessToken = localStorage.getItem("token");
      if (accessToken && config.headers) {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  // Response interceptor
  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError | any) => {
      const originalRequest: any = error.config;

      console.log("error", error);

      if (
        error.response?.data?.error === "invalid or expired token" &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        const refreshToken = localStorage.getItem("refresh");

        /**
         * ❌ UPDATED (minimal): replaced logout logic
         */
        if (!refreshToken) {
          triggerLogout();
          window.location.href = "/";
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (token: string) => {
                originalRequest.headers["Authorization"] =
                  "Bearer " + token;
                resolve(api(originalRequest));
              },
              reject: (err: any) => reject(err),
            });
          });
        }

        isRefreshing = true;

        return new Promise(async (resolve, reject) => {
          try {
            const response = await axios.post(
              `${BASEURL}authentication/refresh-token/`,
              {
                refresh: refreshToken,
              }
            );

            const { access, refresh } = response.data;
            localStorage.setItem("token", access);
            localStorage.setItem("refresh", refresh);

            api!.defaults.headers.common["Authorization"] =
              "Bearer " + access;
            originalRequest.headers["Authorization"] =
              "Bearer " + access;

            processQueue(null, access);
            resolve(api!(originalRequest));
          } catch (err) {
            processQueue(err, null);

            /**
             * ❌ UPDATED (minimal): replaced logout logic
             */
            triggerLogout();
            window.location.href = "/";

            reject(err);
          } finally {
            isRefreshing = false;
          }
        });
      }

      return Promise.reject(error);
    }
  );

  return api;
};

export default instance;