import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function SignupComplete() {
  const location = useLocation(); // navigate를 통해 전달된 state 접근
  const navigate = useNavigate();

  // 전달된 formData(state) 또는 기본값 설정
  const formData = location.state || {
    representative_name: "",
    institution_name: "",
    email: "",
    password: "",
    member_type: "",
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-3/4 max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">회원 가입 완료</h1>
        <h2 className="text-lg font-semibold mb-4 text-center">
          회원 정보 확인
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">
              대표 사용자
            </label>
            <div className="p-3 border border-gray-300 rounded-md">
              {formData.representative_name || "정보 없음"}
            </div>
          </div>
          <div>
            <label className="block text-gray-700 font-medium">기관명</label>
            <div className="p-3 border border-gray-300 rounded-md">
              {formData.institution_name || "정보 없음"}
            </div>
          </div>
          <div>
            <label className="block text-gray-700 font-medium">이메일</label>
            <div className="p-3 border border-gray-300 rounded-md">
              {formData.email || "정보 없음"}
            </div>
          </div>
          <div>
            <label className="block text-gray-700 font-medium">비밀번호</label>
            <div className="p-3 border border-gray-300 rounded-md">
              {formData.password || "정보 없음"}
            </div>
          </div>
          <div>
            <label className="block text-gray-700 font-medium">회원 유형</label>
            <div className="p-3 border border-gray-300 rounded-md">
              {formData.member_type || "정보 없음"}
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate("/login")}
          className="mt-6 w-full px-4 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700"
        >
          로그인 페이지로 이동
        </button>
      </div>
    </div>
  );
}

export default SignupComplete;
