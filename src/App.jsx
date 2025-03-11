import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import { useRecoilState } from "recoil";
import { useEffect } from "react";
import axios from "../src/axiosConfig"; // ✅ axiosConfig 불러오기
import {
  authState,
  expertAuthState,
  superUserAuthState, // ✅ 슈퍼유저 상태 추가
} from "./state/authState";

import Login from "./components/Login/Login";
import Signup from "./pages/Login/Signup";
import SystemManagement from "./pages/manager/SystemManagement";
import MainPage from "./pages/MainPage";
import SelfTestStart from "./pages/SelfTest/SelfTestStart";
import DiagnosisPage from "./pages/SelfTest/DiagnosisPage";
import QualitativeSurvey from "./pages/SelfTest/QualitativeSurvey";
import SignupComplete from "./components/Login/SignupComplete";
import Dashboard from "./pages/SelfTest/Dashboard";
import CompletionPage from "./pages/SelfTest/CompletionPage";
import SystemRegistration from "./components/System/SystemRegistration";
import MatchExperts from "./pages/superuser/MatchExperts";
import DiagnosisfeedbackPage from "./pages/feedback/DiagnosisfeedbackPage";
import QualitativeSurveyfeedback from "./pages/feedback/QualitativeSurveyfeedback";
import DiagnosisView from "./pages/SelfTest/DiagnosisView";
import SuperDashboard from "./pages/superuser/SuperDashboard";
import ViewSystems from "./pages/superuser/ViewSystems";
import SuperManageQuestions from "./pages/superuser/SuperManageQuestions";
import SuperManageUsers from "./pages/superuser/SuperManageUsers";
import SuperDiagnosisView from "./pages/superuser/SuperDiagnosisView";
import FindAccountSelectPage from "./components/Login/FindAccountSelectPage";
import FindAccountPage from "./components/Login/FindAccountPage";
import ResetPasswordPage from "./components/Login/ResetPasswordPage";
import MobileRestriction from "./components/MobileRestriction"; // ✅ 모바일 접근 제한 컴포넌트 추가
import useMediaQuery from "./hooks/useMediaQuery"; // ✅ useMediaQuery 훅 추가

function App() {
  const [auth, setAuthState] = useRecoilState(
    authState || { isLoggedIn: false, user: null }
  );

  const [expertAuth, setExpertAuthState] = useRecoilState(
    expertAuthState || { isLoggedIn: false, user: null }
  );
  const [superUserAuth, setSuperUserAuthState] = useRecoilState(
    superUserAuthState || { isLoggedIn: false, user: null }
  );

  const isMobile = useMediaQuery("(max-width: 425px)"); // ✅ 모바일 화면 감지

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // ✅ 슈퍼유저 인증 먼저 체크
        const superUserResponse = await axios.get(
          "http://localhost:3000/superuser/info", // ✅ API 엔드포인트 수정
          { withCredentials: true }
        );

        if (superUserResponse.data.superuser) {
          const { id, member_type, ...userData } =
            superUserResponse.data.superuser;
          setSuperUserAuthState({
            isLoggedIn: true,
            user: { id, ...userData },
          });

          sessionStorage.setItem(
            "superUserData",
            JSON.stringify({ id, ...userData })
          );
          return;
        }
      } catch (error) {
        console.warn("🚨 슈퍼유저 정보 없음, 기관회원 체크 진행");
        setSuperUserAuthState({ isLoggedIn: false, user: null });
      }

      try {
        // ✅ 기관회원 체크
        const userResponse = await axios.get("http://localhost:3000/user", {
          withCredentials: true,
        });

        if (userResponse.data.user) {
          const { id, member_type, ...userData } = userResponse.data.user;
          setAuthState({ isLoggedIn: true, user: { id, ...userData } });

          sessionStorage.setItem(
            "userData",
            JSON.stringify({ id, ...userData })
          );
          return;
        }
      } catch (error) {
        console.warn("🚨 기관회원 정보 없음, 전문가 체크 진행");
      }

      try {
        // ✅ 전문가 체크
        const expertResponse = await axios.get("http://localhost:3000/expert", {
          withCredentials: true,
        });

        if (expertResponse.data.expert) {
          const { id, member_type, ...userData } = expertResponse.data.expert;
          setExpertAuthState({ isLoggedIn: true, user: { id, ...userData } });

          sessionStorage.setItem(
            "expertUser",
            JSON.stringify({ id, ...userData })
          );
          return;
        }
      } catch (error) {
        console.warn("🚨 전문가회원 정보 없음, 로그아웃 처리");
      }

      // ✅ 로그인 상태 초기화
      setAuthState({ isLoggedIn: false, user: null });
      setExpertAuthState({ isLoggedIn: false, user: null });
      setSuperUserAuthState({ isLoggedIn: false, user: null });

      sessionStorage.removeItem("userData");
      sessionStorage.removeItem("expertUser");
      sessionStorage.removeItem("superUserData");
    };

    fetchUserData();
  }, [setAuthState, setExpertAuthState, setSuperUserAuthState]);

  if (isMobile) {
    return <MobileRestriction />; // ✅ 모바일 접근 제한 메시지 렌더링
  }

  return (
    <BrowserRouter>
      <Layout isExpertLoggedIn={expertAuth.isLoggedIn}>
        <Routes>
          <Route
            path="/"
            element={
              superUserAuth.isLoggedIn ? (
                <Navigate to="/SuperDashboard" replace />
              ) : expertAuth.isLoggedIn ? (
                <Navigate to="/system-management" replace />
              ) : auth.isLoggedIn ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <MainPage isExpertLoggedIn={expertAuth.isLoggedIn} />
              )
            }
          />
          <Route path="/SelfTestStart" element={<SelfTestStart />} />
          <Route path="/DiagnosisPage" element={<DiagnosisPage />} />
          <Route path="/qualitative-survey" element={<QualitativeSurvey />} />
          <Route path="/Login" element={<Login />} />
          <Route
            path="/find-account/select"
            element={<FindAccountSelectPage />}
          />
          <Route path="/find-account/:userType" element={<FindAccountPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/Signup" element={<Signup />} />
          <Route path="/signup-complete" element={<SignupComplete />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/system-register" element={<SystemRegistration />} />
          <Route path="/completion" element={<CompletionPage />} />
          <Route path="/system-management" element={<SystemManagement />} />
          <Route path="/MatchExperts" element={<MatchExperts />} />
          <Route
            path="/DiagnosisfeedbackPage"
            element={<DiagnosisfeedbackPage />}
          />
          <Route
            path="/QualitativeSurveyfeedback"
            element={<QualitativeSurveyfeedback />}
          />
          <Route path="/DiagnosisView" element={<DiagnosisView />} />
          <Route path="/SuperDashboard" element={<SuperDashboard />} />
          <Route path="/ViewSystems" element={<ViewSystems />} />
          <Route
            path="/SuperManageQuestions"
            element={<SuperManageQuestions />}
          />
          <Route path="/SuperManageUsers" element={<SuperManageUsers />} />
          <Route path="/SuperDiagnosisView" element={<SuperDiagnosisView />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
