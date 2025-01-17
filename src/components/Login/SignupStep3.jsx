import React, { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import { formState } from "../../state/formState";

function SignupStep3({ prevStep, handleSubmit }) {
  const [formData, setFormData] = useRecoilState(formState);
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    console.log("formData updated:", formData);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Updating field: ${name}, Value: ${value}`); // 디버깅 로그 추가
    setFormData((prevFormData) => ({
      ...prevFormData,
      [formData.role]: {
        ...prevFormData[formData.role],
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
      "password",
      "phone",
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

    for (const field of requiredFields) {
      if (!formData[formData.role][field]) {
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
              value={formData.user.institution_name}
              onChange={handleChange}
            />
            <InputField
              label="기관 주소"
              name="institution_address"
              value={formData.user.institution_address}
              onChange={handleChange}
            />
            <InputField
              label="대표 사용자"
              name="representative_name"
              value={formData.user.representative_name}
              onChange={handleChange}
            />
          </>
        ) : (
          <>
            <InputField
              label="성명"
              name="name"
              value={formData.expert.name}
              onChange={handleChange}
            />
            <InputField
              label="소속"
              name="institution_name"
              value={formData.expert.institution_name}
              onChange={handleChange}
            />
            <InputField
              label="직위(직급)"
              name="ofcps"
              value={formData.expert.ofcps}
              onChange={handleChange}
            />
            <InputField
              label="주요 경력"
              name="major_carrea"
              value={formData.expert.major_carrea}
              onChange={handleChange}
            />
          </>
        )}

        <InputField
          label="비밀번호"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
        />
        <InputField
          label="비밀번호 확인"
          type="password"
          value={passwordConfirm}
          onChange={handlePasswordConfirmChange}
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

const InputField = ({ label, name, type = "text", value, onChange }) => (
  <div>
    <label className="block text-sm font-medium">{label}</label>
    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      className="w-full p-2 border border-gray-300 rounded-md"
    />
  </div>
);

export default SignupStep3;
