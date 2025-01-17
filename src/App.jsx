import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import { useRecoilState } from "recoil";
import { useEffect } from "react";
import axios from "axios";
import { authState } from "./state/authState";

import Login from "./components/Login/Login";
import Signup from "./pages/Login/Signup";
import SystemManagement from "./pages/manager/SystemManagement";
import MainPage from "./pages/mainpage";
import SelfTestStart from "./pages/SelfTest/SelfTestStart";
import DiagnosisPage from "./pages/SelfTest/DiagnosisPage";
import QualitativeSurvey from "./pages/SelfTest/QualitativeSurvey";
import SignupComplete from "./components/Login/SignupComplete";
import Dashboard from "./pages/SelfTest/Dashboard";
import CompletionPage from "./pages/SelfTest/CompletionPage";
import SystemRegistration from "./components/System/SystemRegistration";

function App() {
  const [auth, setAuthState] = useRecoilState(authState);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get("http://localhost:3000/user", {
          withCredentials: true,
        });
        const { id, role, ...userData } = response.data.user;

        // Recoil 상태 업데이트
        setAuthState({
          isLoggedIn: true,
          isExpertLoggedIn: role === "expert",
          user: { id, role, ...userData }, // 사용자 정보 저장
        });
      } catch (error) {
        console.error("Failed to fetch user info:", error);
        setAuthState({
          isLoggedIn: false,
          isExpertLoggedIn: false,
          user: null,
        });
      }
    };

    fetchUserInfo();
  }, [setAuthState]);

  return (
    <BrowserRouter>
      <Layout isExpertLoggedIn={auth.isExpertLoggedIn}>
        <Routes>
          <Route
            path="/"
            element={
              auth.isLoggedIn ? (
                auth.isExpertLoggedIn ? (
                  <Navigate to="/system-management" replace />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              ) : (
                <MainPage isExpertLoggedIn={auth.isExpertLoggedIn} />
              )
            }
          />
          <Route path="/SelfTestStart" element={<SelfTestStart />} />
          <Route path="/DiagnosisPage" element={<DiagnosisPage />} />
          <Route path="/qualitative-survey" element={<QualitativeSurvey />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Signup" element={<Signup />} />
          <Route path="/signup-complete" element={<SignupComplete />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/system-register" element={<SystemRegistration />} />
          <Route path="/completion" element={<CompletionPage />} />
          <Route path="/system-management" element={<SystemManagement />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
