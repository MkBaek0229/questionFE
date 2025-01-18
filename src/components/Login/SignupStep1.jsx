import React from "react";
import { useRecoilState } from "recoil";
import { formState } from "../../state/formState";

function SignupStep1({ nextStep }) {
  const [formData, setFormData] = useRecoilState(formState);

  const handleAgreementChange = (e) => {
    setFormData({ ...formData, agreement: e.target.checked });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-3/4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">
        {formData.member_type === "user"
          ? "기관회원 회원가입"
          : "전문가 회원가입"}
      </h1>
      {/* Progress Bar */}
      <div className="flex border-b-2 border-gray-200 mb-6">
        <button className="px-4 py-2 text-blue-600 font-semibold border-b-4 border-blue-600">
          개인정보 약관동의
        </button>
        <button className="px-4 py-2 text-gray-500" disabled>
          전화번호 인증
        </button>
        <button className="px-4 py-2 text-gray-500" disabled>
          회원 정보
        </button>
      </div>
      {/* Agreement Section */}
      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.agreement || false} // undefined 방지
            onChange={handleAgreementChange}
            className="mr-3"
          />
          <span>이용 약관에 동의합니다.</span>
        </label>
      </div>
      {/* Next Button */}
      <div className="flex justify-end">
        <button
          className={`px-6 py-3 rounded-md ${
            formData.agreement
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-700 cursor-not-allowed"
          }`}
          onClick={nextStep}
          disabled={!formData.agreement} // 동의하지 않으면 비활성화
        >
          다음
        </button>
      </div>
    </div>
  );
}

export default SignupStep1;
