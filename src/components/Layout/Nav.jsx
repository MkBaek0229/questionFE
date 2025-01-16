import React from "react";
import { useNavigate } from "react-router-dom";

function Nav({ isExpertLoggedIn }) {
  const navigate = useNavigate();

  return (
    <header className="bg-blue-600 text-white py-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-lg font-bold">
          <a href="/">개인정보 컴플라이언스 강화 플랫폼</a>
        </div>
        <nav className="flex space-x-4">
          {!isExpertLoggedIn && (
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
