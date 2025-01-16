import React from "react";
import { useNavigate } from "react-router-dom";

function SelfTestStart() {
  const navigate = useNavigate();

  const handleDiagnosisClick = (e) => {
    e.preventDefault();
    navigate("/DiagnosisPage");
  };

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center items-center">
      <div className="container mx-auto max-w-5xl p-6 bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">자가진단 입력</h1>
        </div>

        {/* Form Section */}
        <form>
          {/* 기관 분류와 이용자 구분 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label
                htmlFor="organization"
                className="block text-sm font-medium text-gray-700"
              >
                공공기관 분류
              </label>
              <select
                id="organization"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option>교육기관</option>
                <option>공공기관</option>
                <option>국가기관</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="user-group"
                className="block text-sm font-medium text-gray-700"
              >
                이용자 구분
              </label>
              <select
                id="user-group"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option>1~4명</option>
                <option>5~10명</option>
                <option>10명 이상</option>
              </select>
            </div>
          </div>

          {/* 진단 항목 */}
          <div className="space-y-4">
            {/* 개인정보보호 시스템 */}
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">
                개인정보보호 시스템
              </span>
              <div className="space-x-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  인증
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  미흡
                </button>
              </div>
            </div>

            {/* 홈페이지 개인정보 처리 */}
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">
                홈페이지 개인정보 처리
              </span>
              <div className="space-x-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  있음
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  없음
                </button>
              </div>
            </div>

            {/* CCTV 설치현황 */}
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">CCTV 설치현황</span>
              <div className="space-x-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  운영
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  미운영
                </button>
              </div>
            </div>

            {/* 업무 위탁현황 */}
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">업무 위탁현황</span>
              <div className="space-x-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  있음
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  없음
                </button>
              </div>
            </div>

            {/* 가명정보 처리 */}
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">가명정보 처리</span>
              <div className="space-x-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  있음
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  없음
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 text-center">
            <button
              onClick={handleDiagnosisClick}
              className="px-6 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
            >
              자가진단하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SelfTestStart;
