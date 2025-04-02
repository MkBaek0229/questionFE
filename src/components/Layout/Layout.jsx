import React from "react";
import { useLocation } from "react-router-dom";
import Footer from "./Footer";

function Layout({ children, isExpertLoggedIn }) {
  const location = useLocation();

  // 헤더와 푸터를 숨길 경로 목록
  const hideHeaderFooterPaths = [
    "/",
    "/login",
    "/Signup",
    "/signup-complete",
    "/find-account/select",
    "/find-account/institution",
    "/find-account/expert",
    "/reset-password",
  ];

  // 현재 경로가 숨길 경로 목록에 포함되어 있는지 확인
  const shouldHideHeaderFooter = hideHeaderFooterPaths.includes(
    location.pathname
  );

  return (
    <div className="flex flex-col min-h-screen">
      <div className={`flex-1`}>{children}</div>
      {!shouldHideHeaderFooter && <Footer />}
    </div>
  );
}

export default Layout;
