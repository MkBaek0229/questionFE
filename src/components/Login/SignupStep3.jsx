import React, { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import { formState } from "../../state/formState";
import useMediaQuery from "../../hooks/useMediaQuery";
import DaumPostcode from "react-daum-postcode";

function SignupStep3({ prevStep, handleSubmit }) {
  const [formData, setFormData] = useRecoilState(formState);
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 425px)");

  useEffect(() => {
    console.log("formData updated:", formData);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "password" ? value : prev[name],
      [prev.member_type]: {
        ...prev[prev.member_type],
        [name]: name !== "password" ? value : prev[prev.member_type][name],
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
    const requiredFields =
      formData.member_type === "user"
        ? [
            "institution_name",
            "institution_address",
            "representative_name",
            "password",
            "phone_number",
          ]
        : [
            "name",
            "institution_name",
            "ofcps",
            "phone_number",
            "major_carrea",
            "password",
          ];

    for (const field of requiredFields) {
      if (!formData[formData.member_type][field] && field !== "password") {
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

  const handleAddressSelect = (data) => {
    // 주소 선택 시 formData에 저장
    setFormData((prev) => ({
      ...prev,
      [prev.member_type]: {
        ...prev[prev.member_type],
        institution_address: data.address,
      },
    }));
    setIsPostcodeOpen(false); // 주소 검색창 닫기
  };

  const renderFields = () => {
    const fields =
      formData.member_type === "user"
        ? [
            { label: "기관명", name: "institution_name" },
            { label: "기관 주소", name: "institution_address" },
            { label: "대표 사용자", name: "representative_name" },
            { label: "전화번호", name: "phone_number" },
          ]
        : [
            { label: "성명", name: "name" },
            { label: "소속", name: "institution_name" },
            { label: "직위(직급)", name: "ofcps" },
            { label: "전화번호", name: "phone_number" },
            { label: "주요 경력", name: "major_carrea" },
          ];

    return fields.map((field) =>
      field.name === "institution_address" ? (
        <div key={field.name}>
          <label className="block text-sm font-medium">{field.label}</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              name={field.name}
              value={formData[formData.member_type][field.name] || ""}
              onChange={handleChange}
              className="flex-1 p-2 border border-gray-300 rounded-md"
              readOnly
            />
            <button
              type="button"
              onClick={() => setIsPostcodeOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 font-bold"
            >
              주소 검색
            </button>
          </div>
          {isPostcodeOpen && (
            <div className="mt-2">
              <DaumPostcode
                onComplete={handleAddressSelect}
                autoClose={false}
                style={{ height: "400px" }}
              />
            </div>
          )}
        </div>
      ) : (
        <InputField
          key={field.name}
          label={field.label}
          name={field.name}
          value={formData[formData.member_type][field.name]}
          onChange={handleChange}
        />
      )
    );
  };
  // 모바일 전용 디자인
  if (isMobile) {
    return (
      <>
        {/* 모바일 진행 바 */}
        <div className="flex items-center justify-center w-full py-4">
          <div className="flex justify-between w-full px-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 flex items-center justify-center border-2 border-blue-500 bg-blue-500 text-white rounded-full text-sm">
                1
              </div>
              <span className="text-blue-600 text-xs mt-1">약관동의</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 flex items-center justify-center border-2 border-blue-500 bg-blue-500 text-white rounded-full text-sm">
                2
              </div>
              <span className="text-blue-600 text-xs mt-1">이메일 인증</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 flex items-center justify-center border-2 border-blue-500 bg-blue-500 text-white rounded-full text-sm">
                3
              </div>
              <span className="text-blue-600 text-xs mt-1">회원정보 입력</span>
            </div>
          </div>
        </div>

        {/* 모바일 폼 컨테이너 */}
        <div className="bg-white p-4 rounded-md shadow-sm w-full max-w-sm mx-auto">
          <h1 className="text-xl font-bold text-center mb-4">
            {formData.member_type === "user"
              ? "기관회원 가입"
              : "전문가 회원가입"}
          </h1>

          <div className="space-y-4">
            {renderFields()}
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
              <p className="text-red-500 text-xs mt-1">{passwordError}</p>
            )}
          </div>

          {errorMessage && (
            <div className="mt-3 text-red-500 text-center text-xs">
              {errorMessage}
            </div>
          )}

          <div className="flex justify-between mt-4">
            <button
              className="px-3 py-2 bg-gray-300 text-gray-700 rounded text-xs"
              onClick={prevStep}
            >
              이전
            </button>
            <button
              className="px-3 py-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
              onClick={handleSignupSubmit}
            >
              완료
            </button>
          </div>
        </div>
      </>
    );
  }

  // 데스크탑 전용 디자인 (기존 코드)
  return (
    <>
      {/* 📌 진행 바 UI */}
      <div className="flex items-center justify-center w-full py-8">
        <div className="flex items-center w-4/5 max-w-2xl relative justify-between">
          <div className="relative flex flex-col items-center w-1/4">
            <div className="w-[75px] h-[75px] flex items-center justify-center border-4 border-blue-500 bg-blue-500 text-white rounded-full text-3xl z-10">
              {" "}
              ✓
            </div>
            <span className="text-blue-600 text-xl font-bold mt-3">
              약관동의
            </span>
          </div>

          <div className="relative flex flex-col items-center w-1/4">
            <div className="w-[75px] h-[75px] flex items-center justify-center border-4 border-blue-500 bg-blue-500 text-white rounded-full text-3xl z-10">
              {" "}
              ✓
            </div>
            <span className="text-blue-600 text-xl font-bold mt-3">
              이메일 인증
            </span>
          </div>

          <div className="relative flex flex-col items-center w-1/4">
            <div className="w-[75px] h-[75px] flex items-center justify-center border-4 border-blue-500 bg-blue-500 text-white rounded-full text-3xl z-10">
              {" "}
              ✓
            </div>
            <span className="text-blue-600 text-xl font-bold mt-3">
              회원 정보 입력
            </span>
          </div>
        </div>
      </div>
      <div className="bg-white p-8 rounded-lg shadow-md w-3/4 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">
          {formData.member_type === "user"
            ? "기관회원 가입"
            : "전문가 회원가입"}
        </h1>
        <div className="space-y-6">
          {renderFields()}
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
    </>
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
