import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import { useRecoilState } from "recoil";
import { useEffect } from "react";
import axios from "axios";
import { authState, expertAuthState } from "./state/authState";

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
import SystemDetails from "./pages/manager/SystemDetails"; // SystemDetails 컴포넌트 추가
import SuperUserPage from "./pages/superuser/SuperuserPage";

function App() {
  const [auth, setAuthState] = useRecoilState(authState);
  const [expertAuth, setExpertAuthState] = useRecoilState(expertAuthState);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 1. 기관회원 데이터 먼저 확인
        const userResponse = await axios.get("http://localhost:3000/user", {
          withCredentials: true,
        });

        if (userResponse.data.user) {
          const { id, member_type, ...userData } = userResponse.data.user;
          setAuthState({
            isLoggedIn: true,
            user: { id, member_type, ...userData },
          });
          return; // 여기서 끝내고 전문가 체크 X
        }
      } catch (error) {
        console.warn("기관회원 정보 없음, 전문가 체크 진행");
      }

      // 2. 기관회원이 없으면 전문가회원 확인
      try {
        const expertResponse = await axios.get("http://localhost:3000/expert", {
          withCredentials: true,
        });

        if (expertResponse.data.expert) {
          const { id, member_type, ...userData } = expertResponse.data.expert;
          setExpertAuthState({
            isLoggedIn: true,
            user: { id, member_type, ...userData },
          });
          return;
        }
      } catch (error) {
        console.warn("전문가회원 정보 없음, 로그아웃 처리");
      }

      // 3. 두 경우 다 아니면 로그아웃 상태로 설정
      setAuthState({
        isLoggedIn: false,
        user: null,
      });
      setExpertAuthState({
        isLoggedIn: false,
        user: null,
      });
    };

    fetchUserData();
  }, [setAuthState, setExpertAuthState]);

  return (
    <BrowserRouter>
      <Layout isExpertLoggedIn={expertAuth.isLoggedIn}>
        <Routes>
          <Route
            path="/"
            element={
              auth.isLoggedIn ? (
                expertAuth.isLoggedIn ? (
                  <Navigate to="/system-management" replace />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              ) : (
                <MainPage isExpertLoggedIn={expertAuth.isLoggedIn} />
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
          <Route
            path="/system-details/:systemId"
            element={<SystemDetails />}
          />{" "}
          <Route path="/superuserpage" element={<SuperUserPage />} />
          {/* 추가된 라우트 */}
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
