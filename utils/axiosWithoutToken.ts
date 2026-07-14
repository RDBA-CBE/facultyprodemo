import axios, { AxiosInstance, AxiosError } from "axios";
import { BASEURL } from "./constant.utils";

let apiWithoutToken: AxiosInstance | null = null;

export const axiosWithoutToken = (): AxiosInstance => {
  if (apiWithoutToken) return apiWithoutToken;

  apiWithoutToken = axios.create({
    baseURL: BASEURL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // OPTIONAL: basic response error handling (NO auth logic)
  apiWithoutToken.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      return Promise.reject(error.response?.data || error);
    }
  );

  return apiWithoutToken;
};

export default axiosWithoutToken;
