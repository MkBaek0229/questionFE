import React from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { authState } from "../../state/authState";

function Nav() {
  const navigate = useNavigate();
  const { isLoggedIn, isExpertLoggedIn, user } = useRecoilValue(authState);
  console.log(user);
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
          {isLoggedIn && !isExpertLoggedIn && <></>}
          {isExpertLoggedIn && (
            <button
              className="hover:underline"
              onClick={() => navigate("/system-management")}
            >
              피드백
            </button>
          )}
          {isLoggedIn && user && (
            <span className="ml-4">환영합니다, {user.name}님!</span>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Nav;
