import React from "react";

function SignupStep1({ formData, setFormData, nextStep }) {
  const handleAgreementChange = (e) => {
    setFormData({ ...formData, agreement: e.target.checked });
  };

  console.log(formData);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-3/4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">회원가입</h1>
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
      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.agreement}
            onChange={handleAgreementChange}
            className="mr-3"
          />
          <span>이용 약관에 동의합니다.</span>
        </label>
      </div>
      <div className="flex justify-end">
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-md"
          onClick={nextStep}
          disabled={!formData.agreement}
        >
          다음
        </button>
      </div>
    </div>
  );
}

export default SignupStep1;
