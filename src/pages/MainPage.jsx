import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCheck, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";

function MainPage({ isExpertLoggedIn }) {
  const navigate = useNavigate();

  useEffect(() => {
    console.log(isExpertLoggedIn);
    if (isExpertLoggedIn) {
      navigate("/system-management");
    }
  }, [isExpertLoggedIn, navigate]);

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleSignupClick = () => {
    navigate("/Signup");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      {/* 중간 컨테이너 */}
      <div className="flex items-center justify-center max-w-[900px] space-x-[50px] ">
        {/* 로그인 버튼 */}
        <button
          className="flex flex-col items-center justify-center w-[300px] h-[300px] bg-blue-600 text-white shadow-lg hover:bg-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-300 rounded-xl"
          onClick={handleLoginClick}
        >
          <div className="flex flex-col items-center">
            <FontAwesomeIcon
              icon={faUserCheck}
              size="4x"
              className="mb-6" // 아이콘과 텍스트 간격 조정
            />
            <span className="text-4xl font-bold tracking-wide">로그인</span>
          </div>
        </button>

        {/* 회원가입 버튼 */}
        <button
          className="flex flex-col items-center justify-center w-[300px] h-[300px] bg-red-500 text-white  shadow-lg hover:bg-red-900 focus:outline-none focus:ring-4 focus:ring-red-300 rounded-xl"
          onClick={handleSignupClick}
        >
          <div className="flex flex-col items-center">
            <FontAwesomeIcon
              icon={faUserPlus}
              size="4x"
              className="mb-6" // 아이콘과 텍스트 간격 조정
            />
            <span className="text-4xl font-bold tracking-wide">회원가입</span>
          </div>
        </button>
      </div>
    </div>
  );
}

export default MainPage;
