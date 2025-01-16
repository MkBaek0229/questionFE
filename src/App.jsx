import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import SelfTestStart from "./pages/SelfTestStart";
import DiagnosisPage from "./pages/DiagnosisPage";
import QualitativeSurvey from "./pages/QualitativeSurvey";
import Login from "./components/Login/Login";
import Signup from "./pages/Signup";
import SystemManagement from "./pages/manager/SystemManagement";
import MainPage from "./pages/mainpage";
import Nav from "./components/Layout/Nav";
import { useState } from "react";

function App() {
  const [isExpertLoggedIn, setIsExpertLoggedIn] = useState(false); // 로그인 상태 관리

  return (
    <BrowserRouter>
      <Layout isExpertLoggedIn={isExpertLoggedIn}>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/SelfTestStart" element={<SelfTestStart />} />
          <Route path="/DiagnosisPage" element={<DiagnosisPage />} />
          <Route path="/qualitative-survey" element={<QualitativeSurvey />} />
          <Route
            path="/Login"
            element={<Login setIsExpertLoggedIn={setIsExpertLoggedIn} />}
          />
          <Route path="/Signup" element={<Signup />} />
          <Route path="/system-management" element={<SystemManagement />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
