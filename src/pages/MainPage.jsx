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
    <main className="flex flex-col items-center min-h-screen">
      {/* 배너 섹션 */}
      <section className="relative w-full h-[300px]  flex items-center justify-center">
        {/* 텍스트 콘텐츠 */}
        <div className="relative text-center px-6">
          <div className="flex flex-col  items-center font-bold">
            <h1 className="leading-tight mb-4 text-3xl">
              공공기관의 개인정보 보호 역량 향상
            </h1>
            <span className="text-blue-600 font-extrabold text-6xl">
              개인정보 컴플라이언스 강화 플랫폼
            </span>
          </div>
          <p className="text-2xl text-gray-500 leading-relaxed mt-4 font-light">
            공공기관의 개인정보 관리 현황,취약점 파악 및 개선점 도출을 위한
            자가진단 서비스입니다.
          </p>
        </div>
      </section>

      {/* 버튼 섹션 */}
      <section className="flex flex-col w-full lg:flex-row items-center justify-center gap-[20px]">
        {/* 로그인 버튼 */}
        <button
          className="group flex flex-col items-center justify-center w-[200px] h-[70px] rounded-[50px] shadow-md bg-blue-400 hover:bg-blue-600 hover:text-white"
          onClick={handleLoginClick}
        >
          <span className="text-lg md:text-xl font-black tracking-wide">
            로그인
          </span>
        </button>

        {/* 회원가입 버튼 */}
        <button
          className="group flex flex-col items-center justify-center w-[200px] h-[70px] rounded-[50px] shadow-md bg-red-400 hover:bg-red-600 hover:text-white"
          onClick={handleSignupClick}
        >
          <span className="text-lg md:text-xl font-black  tracking-wide">
            회원가입
          </span>
        </button>
      </section>

      {/* 서비스 특징 섹션 */}
      {/* 서비스 특징 섹션 (레퍼런스 구조 반영) */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6 mx-auto">
          {/* 헤더 영역 */}
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              {/* 레이블 */}
              <div className="inline-block rounded-lg bg-gray-200 px-3 py-1 text-sm font-bold">
                주요 기능
              </div>
              {/* 제목 */}
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                컴플라이언스 강화 플랫폼의 핵심 기능
              </h2>
              {/* 설명 */}
              <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                개인정보 보호규칙 준수를 위한 완벽한 솔루션을 제공합니다.
              </p>
            </div>
          </div>

          {/* 그리드 아이템들 */}
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12">
            {/* 1번 카드 */}
            <div className="flex items-center justify-center text-center">
              <div
                className="w-[500px] h-[300px] flex flex-col items-center justify-center bg-red-600 text-white
                        rounded-[10px] shadow-[rgba(99,99,99,0.2)_0px_2px_8px_0px]"
              >
                <h2 className="text-[28px] font-black">시스템 등록</h2>
                <img src={ShieldIcon} className="w-[150px]" alt="Shield Icon" />
                <p className="mt-4 text-[22px] font-bold">
                  개인정보 보호 역량 향상
                </p>
                <p className="mt-2 text-[16px] font-light">
                  다양한 시스템을 등록하고 각각에 대한 자가진단을 실시할 수
                  있습니다.
                </p>
              </div>
            </div>
            {/* 2번 카드 */}
            <div className="flex items-center justify-center text-center">
              <div
                className="w-[500px] h-[300px] flex flex-col items-center justify-center bg-blue-600 text-white
                        rounded-[10px] shadow-[rgba(99,99,99,0.2)_0px_2px_8px_0px]"
              >
                <h2 className="text-[28px]  font-black ">자가진단</h2>

                <img
                  src={SelfAssessmentIcon}
                  className="w-[150px]"
                  alt="Self Assessment Icon"
                />
                <p className="mt-4 text-[22px] font-bold">지표별 자가진단</p>
                <p className="mt-2 text-[16px] font-light">
                  체계적인 문항을 통해 개인정보 보호규칙 준수 수준을 평가합니다.
                </p>
              </div>
            </div>
            {/* 3번 카드 */}
            <div className="flex items-center justify-center text-center">
              <div
                className="w-[500px] h-[300px] flex flex-col items-center justify-center bg-blue-400 text-white
                        rounded-[10px] shadow-[rgba(99,99,99,0.2)_0px_2px_8px_0px]"
              >
                <h2 className="text-[28px]  font-black">전문가 피드백</h2>

                <img
                  src={FeedbackIcon}
                  className="w-[150px]"
                  alt="Feedback Icon"
                />
                <p className="mt-4 text-[22px] font-bold">전문가 리포트 제공</p>
                <p className="mt-2 text-[16px] font-light">
                  전문가가 자가진단 결과를 검토하고 개선을 위한 피드백을
                  제공합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default MainPage;
