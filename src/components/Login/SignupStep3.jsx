import React, { useState, useEffect } from "react";

function SignupStep3({ formData, setFormData, prevStep, handleSubmit }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  useEffect(() => {
    console.log("formData updated:", formData);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Updating field: ${name}, Value: ${value}`); // 디버깅 로그 추가
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handlePasswordConfirmChange = (e) => {
    setPasswordConfirm(e.target.value);

    if (formData.password !== e.target.value) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
    } else {
      setPasswordError("");
    }
  };

  const validateInputs = () => {
    if (
      !formData.institution_name ||
      !formData.institution_address ||
      !formData.representative_name ||
      !formData.password ||
      !formData.phone
    ) {
      setErrorMessage("모든 필드를 입력해 주세요.");
      return false;
    }

    if (formData.password !== passwordConfirm) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
      return false;
    }

    setErrorMessage("");
    return true;
  };

  const handleSignupSubmit = () => {
    if (validateInputs()) {
      handleSubmit(); // 부모에서 정의된 서버 요청 함수 호출
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-3/4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6">회원가입</h1>
      <div className="border-b border-gray-300 mb-6 pb-2 flex justify-between">
        <button
          className="text-blue-600 font-medium"
          onClick={() => alert("개인정보 약관동의 내용")}
        >
          개인정보 약관동의
        </button>
        <button className="text-blue-600 font-medium">이메일 인증</button>
      </div>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium">기관명</label>
          <input
            type="text"
            name="institution_name"
            value={formData.institution_name || ""}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="기관명을 입력해 주세요"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">기관 주소</label>
          <input
            type="text"
            name="institution_address"
            value={formData.institution_address || ""}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="기관 주소를 입력해 주세요"
          />
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md"
            onClick={() => alert("기관 확인 API 호출")}
          >
            기관 확인
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium">대표 사용자</label>
          <input
            type="text"
            name="representative_name"
            value={formData.representative_name || ""}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="대표사용자를 입력해 주세요"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">비밀번호</label>
          <input
            type="password"
            name="password"
            value={formData.password || ""}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="영문자, 숫자, 특수문자 포함 8~20자"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">비밀번호 확인</label>
          <input
            type="password"
            value={passwordConfirm}
            onChange={handlePasswordConfirmChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="비밀번호를 다시 입력해 주세요"
          />
          {passwordError && (
            <p className="text-red-500 text-sm mt-2">{passwordError}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium">전화번호</label>
          <input
            type="text"
            name="phone"
            value={formData.phone || ""}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="전화번호를 입력해 주세요"
          />
        </div>
      </div>
      {errorMessage && (
        <div className="mt-4 text-red-500 text-center">{errorMessage}</div>
      )}
      <div className="flex justify-between mt-8">
        <button
          className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md"
          onClick={prevStep}
        >
          이전
        </button>
        <button
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={handleSignupSubmit}
        >
          완료
        </button>
      </div>
    </div>
  );
}

export default SignupStep3;
