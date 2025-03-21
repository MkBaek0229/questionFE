import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api", // 기본 URL 설정
  withCredentials: true, // 쿠키를 포함한 요청을 보낼 때 필요
});

export default axiosInstance;
