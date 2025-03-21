import React from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { authState, superUserAuthState } from "../../state/authState";

function Header() {
  const navigate = useNavigate();
  const { isLoggedIn, isExpertLoggedIn, user } = useRecoilValue(authState);
  const { isLoggedIn: isSuperUserLoggedIn, user: superUser } =
    useRecoilValue(superUserAuthState);

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <header className="bg-blue-600 text-white py-5 shadow-md drop-shadow">
      <div className="max-w-[1000px] mx-auto flex justify-between items-center px-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center  w-10 h-10 rounded-full overflow-hidden bg-white">
            <img
              src="src/assets/logo/MainLogo.png"
              alt="마틴랩 로고"
              className="w-3/4 h-3/4 object-contain cursor-pointer"
              onClick={handleLogoClick}
            />
          </div>
          <span
            className="text-lg font-bold cursor-pointer"
            onClick={handleLogoClick}
          >
            개인정보 컴플라이언스 강화 플랫폼
          </span>
        </div>
        <nav className="flex space-x-4">
          {/* 비로그인 상태 */}
          {!isLoggedIn && !isSuperUserLoggedIn && (
            <>{/* 아무것도 표시하지 않음 */}</>
          )}

          {/* 일반 사용자 로그인 상태 */}
          {isLoggedIn && !isExpertLoggedIn && !isSuperUserLoggedIn && <></>}

          {/* 관리자 로그인 상태 */}
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

export default Header;
