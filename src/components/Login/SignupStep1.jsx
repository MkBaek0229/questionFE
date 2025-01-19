import React from "react";
import { useRecoilState } from "recoil";
import { formState } from "../../state/formState";

function SignupStep1({ nextStep }) {
  const [formData, setFormData] = useRecoilState(formState);

  const handleAgreementChange = (e) => {
    setFormData({ ...formData, agreement: e.target.checked });
  };

  return (
    <>
      {/* 📌 진행 바 UI */}
      <div className="flex items-center justify-center w-full py-8">
        <div className="flex items-center w-4/5 max-w-2xl relative justify-between">
          {/* STEP 1  */}
          <div className="relative flex flex-col items-center w-1/4">
            <div className="w-[75px] h-[75px] flex items-center justify-center border-4 border-blue-500 bg-blue-500 text-white rounded-full text-3xl z-10">
              ✓
            </div>
            <span className="text-blue-600 text-xl font-bold mt-3">
              약관동의
            </span>
          </div>

          {/* STEP 2 */}
          <div className="relative flex flex-col items-center w-1/4">
            <div className="w-[75px] h-[75px] flex items-center justify-center border-4 border-gray-600 bg-gray-600 text-gray-400 rounded-full text-3xl z-10">
              ✓
            </div>
            <span className="text-gray-400 text-xl mt-3">이메일 인증</span>
          </div>

          {/* STEP 3 */}
          <div className="relative flex flex-col items-center w-1/4">
            <div className="w-[75px] h-[75px] flex items-center justify-center border-4 border-gray-600 bg-gray-600 text-gray-400 rounded-full text-3xl z-10">
              ✓
            </div>
            <span className="text-gray-400 text-xl mt-3">회원 정보 입력</span>
          </div>
        </div>
      </div>

      {/* 폼 UI */}
      <div className="bg-white p-6 rounded-lg shadow-md w-3/4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">
          {formData.member_type === "user"
            ? "기관회원 회원가입"
            : "전문가 회원가입"}
        </h1>

        {/* Agreement Section */}
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.agreement || false}
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
            disabled={!formData.agreement}
          >
            다음
          </button>
        </div>
      </div>
    </>
  );
}

export default SignupStep1;
