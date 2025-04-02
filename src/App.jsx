import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import { useRecoilState } from "recoil";
import { useEffect, useState } from "react";
import {
  authState,
  expertAuthState,
  superUserAuthState, // ✅ 슈퍼유저 상태 추가
} from "./state/authState";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./components/Login/Login";
import Signup from "./pages/Login/Signup";
import MainPage from "./pages/MainPage";
import SelfTestStart from "./pages/SelfTest/SelfTestStart";
import DiagnosisPage from "./pages/SelfTest/DiagnosisPage";
import QualitativeSurvey from "./pages/SelfTest/QualitativeSurvey";
import SignupComplete from "./components/Login/SignupComplete";
import Dashboard from "../src/pages/SelfTest/Dashboard"; // 명시적 경로

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
import ProtectedRoute from "./components/ProtectedRoute"; // ✅ ProtectedRoute 추가
import ExpertDashboard from "./pages/expert/SystemManagement";
import SystemManagement from "./components/System/SystemManagement";
import axiosInstance from "../axiosInstance";

function App() {
  const [auth, setAuthState] = useRecoilState(authState);
  const [expertAuth, setExpertAuthState] = useRecoilState(expertAuthState);
  const [superUserAuth, setSuperUserAuthState] =
    useRecoilState(superUserAuthState);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const checkLoginStatus = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get(
          "http://localhost:3000/session/check",
          { withCredentials: true }
        );

        if (data.isLoggedIn) {
          switch (data.userType) {
            case "user":
              setAuthState({ isLoggedIn: true, user: data.userData });
              setExpertAuthState({ isLoggedIn: false, user: null });
              setSuperUserAuthState({ isLoggedIn: false, user: null });
              break;
            case "expert":
              setAuthState({ isLoggedIn: false, user: null });
              setExpertAuthState({ isLoggedIn: true, user: data.userData });
              setSuperUserAuthState({ isLoggedIn: false, user: null });
              break;
            case "superuser":
              setAuthState({ isLoggedIn: false, user: null });
              setExpertAuthState({ isLoggedIn: false, user: null });
              setSuperUserAuthState({ isLoggedIn: true, user: data.userData });
              break;
          }
        } else {
          // 로그인 안됨
          setAuthState({ isLoggedIn: false, user: null });
          setExpertAuthState({ isLoggedIn: false, user: null });
          setSuperUserAuthState({ isLoggedIn: false, user: null });
        }
      } catch (error) {
        console.error("로그인 상태 확인 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, [setAuthState, setExpertAuthState, setSuperUserAuthState]);

  if (loading) {
    return <div>로딩 중...</div>;
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            superUserAuth.isLoggedIn ? (
              <Navigate to="/SuperDashboard" replace />
            ) : expertAuth.isLoggedIn ? (
              <Navigate to="/expert-dashboard" replace />
            ) : auth.isLoggedIn ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <MainPage isExpertLoggedIn={expertAuth.isLoggedIn} />
            )
          }
        />
        <Route
          path="/selftest/start/:systemId"
          element={<ProtectedRoute component={SelfTestStart} />}
        />
        <Route
          path="/DiagnosisPage"
          element={<ProtectedRoute component={DiagnosisPage} />}
        />
        <Route
          path="/qualitative-survey"
          element={<ProtectedRoute component={QualitativeSurvey} />}
        />
        <Route path="/Login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/signup-complete" element={<SignupComplete />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute component={Dashboard} />}
        />
        <Route path="/system-management" element={<SystemManagement />} />

        <Route
          path="/system-register"
          element={<ProtectedRoute component={SystemRegistration} />}
        />
        <Route
          path="/completion"
          element={<ProtectedRoute component={CompletionPage} />}
        />
        <Route
          path="/expert-dashboard"
          element={<ProtectedRoute component={ExpertDashboard} />}
        />
        <Route
          path="/MatchExperts"
          element={<ProtectedRoute component={MatchExperts} />}
        />
        <Route
          path="/DiagnosisfeedbackPage"
          element={<ProtectedRoute component={DiagnosisfeedbackPage} />}
        />
        <Route
          path="/QualitativeSurveyfeedback"
          element={<ProtectedRoute component={QualitativeSurveyfeedback} />}
        />
        <Route
          path="/DiagnosisView"
          element={<ProtectedRoute component={DiagnosisView} />}
        />
        <Route
          path="/SuperDashboard"
          element={<ProtectedRoute component={SuperDashboard} />}
        />
        <Route
          path="/ViewSystems"
          element={<ProtectedRoute component={ViewSystems} />}
        />
        <Route
          path="/SuperManageQuestions"
          element={<ProtectedRoute component={SuperManageQuestions} />}
        />
        <Route
          path="/SuperManageUsers"
          element={<ProtectedRoute component={SuperManageUsers} />}
        />
        <Route
          path="/SuperDiagnosisView"
          element={<ProtectedRoute component={SuperDiagnosisView} />}
        />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
