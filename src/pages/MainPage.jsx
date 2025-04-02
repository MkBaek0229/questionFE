import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <main className="flex flex-col items-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* 헤더 배너 섹션 */}
      <section className="relative w-full py-16 md:py-24 flex items-center justify-center">
        <div className="container px-4 md:px-6">
          <motion.div
            className="text-center space-y-6"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                공공기관의 개인정보 보호 역량 향상
              </h1>
              <h2 className="text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                개인정보 컴플라이언스 강화 플랫폼
              </h2>
            </div>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-600">
              공공기관의 개인정보 관리 현황, 취약점 파악 및 개선점 도출을 위한
              자가진단 서비스입니다.
            </p>

            {/* 버튼 그룹 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <button
                className="w-full sm:w-auto px-8 py-4 text-lg font-bold rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-all"
                onClick={handleLoginClick}
              >
                로그인
              </button>
              <button
                className="w-full sm:w-auto px-8 py-4 text-lg font-bold rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all"
                onClick={handleSignupClick}
              >
                회원가입
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 서비스 특징 섹션 */}
      <section className="w-full py-20 md:py-28 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
        {/* 배경 요소 */}
        <div className="absolute inset-0 overflow-hidden opacity-5">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-blue-600"></div>
          <div className="absolute -left-40 top-1/4 w-96 h-96 rounded-full bg-indigo-600"></div>
          <div className="absolute right-10 bottom-10 w-60 h-60 rounded-full bg-red-500"></div>
        </div>

        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <motion.div
            className="text-center space-y-6 mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block px-6 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-full mb-4">
              <span className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                주요 기능
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
              컴플라이언스 강화 플랫폼의{" "}
              <span className="text-blue-600">핵심 기능</span>
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-slate-600">
              개인정보 보호규칙 준수를 위한 완벽한 솔루션을 제공합니다.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 시스템 등록 카드 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              whileHover={{ translateY: -8 }}
              className="bg-white rounded-2xl overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] transition-all duration-500 border border-slate-100"
            >
              <div className="h-2 bg-gradient-to-r from-red-500 to-red-600"></div>
              <div className="p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center mb-6 border-4 border-white shadow-md">
                    <img
                      src={ShieldIcon}
                      alt="Shield"
                      className="w-16 h-16 hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">
                    시스템 등록
                  </h3>
                  <div className="h-1 w-16 bg-red-500 rounded-full mb-4"></div>
                  <p className="text-lg font-semibold text-slate-900 mb-2">
                    개인정보 보호 역량 향상
                  </p>
                  <p className="text-slate-600">
                    다양한 시스템을 등록하고 각각에 대한 자가진단을 실시할 수
                    있습니다.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 자가진단 카드 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              whileHover={{ translateY: -8 }}
              className="bg-white rounded-2xl overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] transition-all duration-500 border border-slate-100"
            >
              <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              <div className="p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mb-6 border-4 border-white shadow-md">
                    <img
                      src={SelfAssessmentIcon}
                      alt="Self Assessment"
                      className="w-16 h-16 hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">
                    자가진단
                  </h3>
                  <div className="h-1 w-16 bg-blue-500 rounded-full mb-4"></div>
                  <p className="text-lg font-semibold text-slate-900 mb-2">
                    지표별 자가진단
                  </p>
                  <p className="text-slate-600">
                    체계적인 문항을 통해 개인정보 보호규칙 준수 수준을
                    평가합니다.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 전문가 피드백 카드 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.5 }}
              whileHover={{ translateY: -8 }}
              className="bg-white rounded-2xl overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] transition-all duration-500 border border-slate-100"
            >
              <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
              <div className="p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center mb-6 border-4 border-white shadow-md">
                    <img
                      src={FeedbackIcon}
                      alt="Feedback"
                      className="w-16 h-16 hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">
                    전문가 피드백
                  </h3>
                  <div className="h-1 w-16 bg-indigo-500 rounded-full mb-4"></div>
                  <p className="text-lg font-semibold text-slate-900 mb-2">
                    전문가 리포트 제공
                  </p>
                  <p className="text-slate-600">
                    전문가가 자가진단 결과를 검토하고 개선을 위한 피드백을
                    제공합니다.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 (새로 추가) */}
      <section className="w-full py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container px-4 md:px-6 mx-auto">
          <motion.div
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              지금 바로 시작하세요
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-blue-100">
              개인정보 보호 역량을 강화하고 컴플라이언스 수준을 높이는 첫 걸음을
              내딛으세요.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
              <button
                className="w-full sm:w-auto px-8 py-4 text-lg font-bold rounded-full bg-white text-blue-600 hover:bg-blue-50 transition-all"
                onClick={handleSignupClick}
              >
                무료로 시작하기
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

export default MainPage;
