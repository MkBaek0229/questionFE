import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCheck,
  faUserPlus,
  faShieldAlt,
  faClipboardCheck,
  faFileSignature,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";

function MainPage({ isExpertLoggedIn }) {
  const navigate = useNavigate();

  useEffect(() => {
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
    <div className="flex flex-col items-center min-h-screen bg-gray-100 justify-evenly">
      {/* 설명 섹션 */}
      <div className="text-center mt-6 px-4 ">
        <h2 className="text-2xl 2xl:text-7xl lg:text-5xl md:text-4xl sm:text-3xl  font-extrabold text-gray-800 mb-6">
          공공기관의 개인정보 보호 역량 향상
        </h2>
        <p className="text-2xl 2xl:text-4xl lg:text-2xl md:text-xl sm:text-lg text-base text-gray-600 mt-1">
          공공기관의 개인정보 관리 현황, 취약 점 등 파악 및 개선점 도출을 위한
          플랫폼
        </p>
      </div>

      {/* 버튼 영역 */}
      <div className="flex flex-col lg:flex-row items-center justify-center max-w-[800px] space-y-4 lg:space-y-0 lg:space-x-4 xl:space-x-8 mt-8">
        {/* 로그인 버튼 */}
        <button
          className="flex flex-col items-center justify-center w-[200px] h-[200px] 2xl:w-[350px] 2xl:h-[350px] md:w-[250px] md:h-[250px] sm:w-[200px] sm:h-[200px]  bg-blue-600 text-white shadow-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-xl"
          onClick={handleLoginClick}
        >
          <FontAwesomeIcon
            icon={faUserCheck}
            size="3x"
            className="mb-10 md:mb-8 sm:mb-6 mb-4"
          />
          <span className="text-2xl 2xl:text md:text-3xl text-base font-bold tracking-wide">
            로그인
          </span>
        </button>
        {/* 회원가입 버튼 */}
        <button
          className="flex flex-col items-center justify-center w-[200px] h-[200px] 2xl:w-[350px] 2xl:h-[350px] md:w-[250px] md:h-[250px] sm:w-[200px] sm:h-[200px] bg-red-500 text-white shadow-md hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-300 rounded-xl"
          onClick={handleSignupClick}
        >
          <FontAwesomeIcon
            icon={faUserPlus}
            size="3x"
            className="mb-10 md:mb-8 sm:mb-6 mb-4"
          />
          <span className="text-2xl 2xl:text md:text-3xl text-base font-bold tracking-wide">
            회원가입
          </span>
        </button>
      </div>

      {/* 서비스 특징 아이콘 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10 text-gray-700">
        <div className="flex flex-col items-center">
          <div className=" sm:w-24 sm:h-24 w-20 h-20 flex items-center justify-center bg-blue-100 rounded-full shadow-sm">
            <FontAwesomeIcon
              icon={faShieldAlt}
              size="2x"
              className="text-blue-600  sm:text-4xl text-1x"
            />
          </div>
          <p className="mt-3 font-medium text-lg md:text-base sm:text-md text-2xl">
            개인정보 보호 역량 향상
          </p>
        </div>
        <div className="flex flex-col items-center">
          <div className=" sm:w-24 sm:h-24 w-20 h-20 flex items-center justify-center bg-green-100 rounded-full shadow-sm">
            <FontAwesomeIcon
              icon={faClipboardCheck}
              size="2x"
              className="text-green-600 sm:text-4xl text-1x"
            />
          </div>
          <p className="mt-3 font-medium text-lg md:text-base sm:text-md text-2xl">
            지표별 자가진단
          </p>
        </div>
        <div className="flex flex-col items-center">
          <div className=" sm:w-24 sm:h-24 w-20 h-20 flex items-center justify-center bg-red-100 rounded-full shadow-sm">
            <FontAwesomeIcon
              icon={faFileSignature}
              size="2x"
              className="text-red-600  sm:text-4xl text-1x"
            />
          </div>
          <p className="mt-3 font-medium text-lg md:text-base sm:text-md text-2xl">
            전문가 리포트 제공
          </p>
        </div>
      </div>
    </div>
  );
}

export default MainPage;
