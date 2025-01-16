import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";

import Login from "./components/Login/Login";
import Signup from "./pages/Login/Signup";
import SystemManagement from "./pages/manager/SystemManagement";
import MainPage from "./pages/mainpage";
import { useState } from "react";
import SelfTestStart from "./pages/SelfTest/SelfTestStart";
import DiagnosisPage from "./pages/SelfTest/DiagnosisPage";
import QualitativeSurvey from "./pages/SelfTest/QualitativeSurvey";
import SignupComplete from "./components/Login/SignupComplete";
import Dashboard from "./pages/SelfTest/Dashboard";
import CompletionPage from "./pages/SelfTest/CompletionPage";
import SystemRegistration from "./components/System/SystemRegistration";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isExpertLoggedIn, setIsExpertLoggedIn] = useState(false); // 로그인 상태 관리

  return (
    <BrowserRouter>
      <Layout isExpertLoggedIn={isExpertLoggedIn}>
        <Routes>
          <Route
            path="/"
            element={<MainPage isExpertLoggedIn={isExpertLoggedIn} />}
          />
          <Route path="/SelfTestStart" element={<SelfTestStart />} />
          <Route path="/DiagnosisPage" element={<DiagnosisPage />} />
          <Route path="/qualitative-survey" element={<QualitativeSurvey />} />
          <Route
            path="/Login"
            element={<Login setIsExpertLoggedIn={setIsExpertLoggedIn} />}
          />
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
