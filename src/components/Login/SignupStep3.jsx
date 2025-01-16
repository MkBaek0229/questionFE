import React, { useState, useEffect } from "react";

function SignupStep3({ formData, setFormData, prevStep, handleSubmit }) {
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // role이 없거나 초기화되지 않았을 경우 기본값 설정
  useEffect(() => {
    if (!formData.role) {
      console.error("SignupStep3: formData.role이 설정되지 않았습니다!");
    }
    if (!formData.user) {
      setFormData((prev) => ({ ...prev, user: {} }));
    }
    if (!formData.expert) {
      setFormData((prev) => ({ ...prev, expert: {} }));
    }
  }, [formData, setFormData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (!formData.role) return; // role이 없으면 return

    setFormData((prevData) => ({
      ...prevData,
      [formData.role]: {
        ...prevData[formData.role],
        [name]: value,
      },
    }));
  };

  const handlePasswordConfirmChange = (e) => {
    setPasswordConfirm(e.target.value);
    setPasswordError(
      formData.password !== e.target.value
        ? "비밀번호가 일치하지 않습니다."
        : ""
    );
  };

  const validateInputs = () => {
    const userFields = [
      "institution_name",
      "institution_address",
      "representative_name",
      "phone",
      "password",
    ];
    const expertFields = [
      "name",
      "institution_name",
      "ofcps",
      "phone_number",
      "major_carrea",
      "password",
    ];

    const requiredFields = formData.role === "user" ? userFields : expertFields;
    const currentData = formData[formData.role] || {}; // undefined 방지

    for (const field of requiredFields) {
      if (!currentData[field]) {
        setErrorMessage("모든 필드를 입력해 주세요.");
        return false;
      }
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
      handleSubmit();
    }
  };

  // 현재 role에 맞는 데이터 가져오기
  const currentData = formData[formData.role] || {}; // undefined 방지

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-3/4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6">
        {formData.role === "user" ? "기관회원 가입" : "전문가 회원가입"}
      </h1>

      <div className="space-y-6">
        {formData.role === "user" ? (
          <>
            <InputField
              label="기관명"
              name="institution_name"
              value={currentData.institution_name}
              onChange={handleChange}
              placeholder="기관명을 입력해 주세요"
            />
            <InputField
              label="기관 주소"
              name="institution_address"
              value={currentData.institution_address}
              onChange={handleChange}
              placeholder="기관 주소를 입력해 주세요"
            />
            <InputField
              label="대표 사용자"
              name="representative_name"
              value={currentData.representative_name}
              onChange={handleChange}
              placeholder="대표 사용자를 입력해 주세요"
            />
            <InputField
              label="전화번호"
              name="phone"
              value={currentData.phone}
              onChange={handleChange}
              placeholder="전화번호를 입력해 주세요"
            />
          </>
        ) : (
          <>
            <InputField
              label="성명"
              name="name"
              value={currentData.name}
              onChange={handleChange}
              placeholder="성명을 입력해 주세요"
            />
            <InputField
              label="소속"
              name="institution_name"
              value={currentData.institution_name}
              onChange={handleChange}
              placeholder="소속을 입력해 주세요"
            />
            <InputField
              label="직위(직급)"
              name="ofcps"
              value={currentData.ofcps}
              onChange={handleChange}
              placeholder="직위를 입력해 주세요"
            />
            <InputField
              label="전화번호"
              name="phone_number"
              value={currentData.phone_number}
              onChange={handleChange}
              placeholder="전화번호를 입력해 주세요"
            />
            <InputField
              label="주요 경력"
              name="major_carrea"
              value={currentData.major_carrea}
              onChange={handleChange}
              placeholder="주요 경력을 입력해 주세요"
            />
          </>
        )}

        {/* 비밀번호 입력 */}
        <InputField
          label="비밀번호"
          name="password"
          type="password"
          value={formData.password || ""}
          onChange={handleChange}
          placeholder="영문자, 숫자, 특수문자 포함 8~20자"
        />
        <InputField
          label="비밀번호 확인"
          type="password"
          value={passwordConfirm}
          onChange={handlePasswordConfirmChange}
          placeholder="비밀번호를 확인해 주세요"
        />
        {passwordError && (
          <p className="text-red-500 text-sm mt-2">{passwordError}</p>
        )}
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

// 공통 입력 필드 컴포넌트
const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
}) => (
  <div>
    <label className="block text-sm font-medium">{label}</label>
    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full p-2 border border-gray-300 rounded-md"
    />
  </div>
);

export default SignupStep3;
