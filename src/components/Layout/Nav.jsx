import React from "react";
import { useNavigate } from "react-router-dom";

function Nav({ isLoggedIn, isExpertLoggedIn }) {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <header className="bg-blue-600 text-white py-5 shadow-md drop-shadow">
      <div className="container mx-auto flex items-center justify-between">
        <div
          className="text-lg font-bold cursor-pointer"
          onClick={handleLogoClick}
        >
          개인정보 컴플라이언스 강화 플랫폼
        </div>
        <nav className="flex space-x-4">
          {!isLoggedIn && (
            <>{/* 로그인이 아예 되지 않은 유저는 nav에 a가 아예 없음 */}</>
          )}
          {isLoggedIn && !isExpertLoggedIn && (
            <>
              <a href="/SelfTestStart" className="hover:underline">
                자가진단
              </a>
              <a href="/Signup" className="hover:underline">
                회원가입
              </a>
              <a href="/Login" className="hover:underline">
                로그인
              </a>
            </>
          )}
          {isExpertLoggedIn && (
            <button
              className="hover:underline"
              onClick={() => navigate("/system-management")}
            >
              피드백
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Nav;
