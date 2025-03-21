import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import ShieldIcon from "../assets/sheild-front-color.svg";
import SelfAssessmentIcon from "../assets/chat-text-iso-color.svg";
import FeedbackIcon from "../assets/computer-iso-color.svg";
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
    <div className="flex flex-col items-center min-h-screen">
      {/* 배너 섹션 */}
      <section className="relative w-full h-[300px] flex items-center justify-center">
        {/* 텍스트 콘텐츠 */}
        <div className="relative text-center px-6">
          <div className="flex flex-col text-6xl items-center font-bold">
            <h1 className=" leading-tight mb-4 ">
              공공기관의 개인정보 보호 역량 향상
            </h1>
            <span className="text-blue-600 font-extrabold">
              개인정보 컴플라이언스 강화 플랫폼
            </span>
          </div>
          <p className="text-2xl text-gray-500 leading-relaxed mt-4 font-light">
            공공기관의 개인정보 관리 현황,취약점 파악 및 개선점 도출을 위한
            자가진단 서비스
          </p>
        </div>
      </section>

      {/* 버튼 섹션 */}
      <div className="flex flex-col lg:flex-row items-center justify-center max-w-[1200px] gap-[20px]">
        {/* 로그인 버튼 */}
        <button
          className="group flex flex-col items-center justify-center w-[200px] h-[70px] rounded-[50px] shadow-md bg-blue-400 hover:bg-blue-600"
          onClick={handleLoginClick}
        >
          <span className="text-lg md:text-xl font-bold tracking-wide">
            로그인
          </span>
        </button>

        {/* 회원가입 버튼 */}
        <button
          className="group flex flex-col items-center justify-center w-[200px] h-[70px] rounded-[50px] shadow-md bg-red-400 hover:bg-red-600"
          onClick={handleSignupClick}
        >
          <span className="text-lg md:text-xl font-bold tracking-wide">
            회원가입
          </span>
        </button>
      </div>

      {/* 서비스 특징 섹션 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-16 px-4 max-w-[1200px]">
        <div className="flex items-center text-center">
          <div className="w-[300px] h-[300px]  flex items-center flex-col justify-center  bg-blue-50 rounded-[50px] shadow-[rgba(99,99,99,0.2)_0px_2px_8px_0px] ">
            <img src={ShieldIcon} className="w-[150px]" />{" "}
            <p className="mt-4 text-[24px] font-bold">
              개인정보 보호 역량 향상
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-[300px] h-[300px]  flex items-center flex-col  justify-center bg-blue-50 rounded-[50px] shadow-[rgba(99,99,99,0.2)_0px_2px_8px_0px]">
            <img src={SelfAssessmentIcon} className="w-[150px]" />
            <p className="mt-4 text-[24px] font-bold ">지표별 자가진단</p>
          </div>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-[300px] h-[300px]   flex items-center flex-col  justify-center bg-blue-50 rounded-[50px] shadow-[rgba(99,99,99,0.2)_0px_2px_8px_0px]">
            <img src={FeedbackIcon} className="w-[150px]" />
            <p className="mt-4 text-[24px] font-bold">전문가 리포트 제공</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;
