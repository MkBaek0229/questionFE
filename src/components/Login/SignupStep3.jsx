import React, { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import { formState } from "../../state/formState";
import useMediaQuery from "../../hooks/useMediaQuery";
import DaumPostcode from "react-daum-postcode";
import { toast } from "react-toastify";

function SignupStep3({ prevStep, handleSubmit }) {
  const [formData, setFormData] = useRecoilState(formState);
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false,
  });
  useEffect(() => {
    console.log("formData updated:", formData);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "password") {
      validatePasswordRequirements(value);
    }

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

  const handleformatPhoneNumber = (e) => {
    const formattedValue = e.target.value
      .replace(/[^0-9]/g, "") // 숫자를 제외한 모든 문자 제거
      .replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, `$1-$2-$3`);

    setFormData((prev) => ({
      ...prev,
      [prev.member_type]: {
        ...prev[prev.member_type],
        phone_number: formattedValue, // 전화번호 필드 업데이트
      },
    }));
  };

  // 비밀번호 요구사항 검증 함수
  const validatePasswordRequirements = (password) => {
    setPasswordRequirements({
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password),
    });
  };

  const validatePassword = (password) => {
    const isValid =
      password.length >= 8 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[@$!%*?&]/.test(password);

    if (!isValid) {
      setPasswordError("비밀번호가 요구사항을 충족하지 않습니다.");
      return false;
    }
    setPasswordError("");
    return true;
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
          <label className="block text-sm font-bold mb-2">{field.label}</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              name={field.name}
              value={formData[formData.member_type][field.name] || ""}
              onChange={handleChange}
              className="flex-1 p-2 border border-black-100 rounded-md"
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
          onChange={
            field.name === "phone_number"
              ? handleformatPhoneNumber
              : handleChange
          }
        />
      )
    );
  };

  // 데스크탑 전용 디자인 (기존 코드)
  return (
    <>
      <div className="bg-white p-8 rounded-lg w-3/4 max-w-xl mx-auto">
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
          <div className="mt-2 text-sm">
            <p className="font-medium mb-1">비밀번호 요구사항:</p>
            <ul className="pl-2 space-y-1">
              <li
                className={`flex items-center ${
                  passwordRequirements.length
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                <span className="mr-1">
                  {passwordRequirements.length ? "✓" : "○"}
                </span>
                최소 8자 이상
              </li>
              <li
                className={`flex items-center ${
                  passwordRequirements.lowercase
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                <span className="mr-1">
                  {passwordRequirements.lowercase ? "✓" : "○"}
                </span>
                소문자 포함
              </li>
              <li
                className={`flex items-center ${
                  passwordRequirements.uppercase
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                <span className="mr-1">
                  {passwordRequirements.uppercase ? "✓" : "○"}
                </span>
                대문자 포함
              </li>
              <li
                className={`flex items-center ${
                  passwordRequirements.number
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                <span className="mr-1">
                  {passwordRequirements.number ? "✓" : "○"}
                </span>
                숫자 포함
              </li>
              <li
                className={`flex items-center ${
                  passwordRequirements.special
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                <span className="mr-1">
                  {passwordRequirements.special ? "✓" : "○"}
                </span>
                특수문자 포함 (@, $, !, %, *, ?, &)
              </li>
            </ul>
          </div>
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

        <div className="mt-8">
          <button
            className="w-[100%] h-[50px] text-[22px] font-bold rounded-md"
            onClick={prevStep}
          >
            이전
          </button>

          <button
            className={`w-[100%] h-[50px] text-[22px] font-bold rounded-md ${
              formData.agreement
                ? "bg-blue-500 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-700 cursor-not-allowed"
            }`}
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
    <label className="block text-sm font-bold mb-2">{label}</label>
    <input
      type={type}
      name={name}
      placeholder={label}
      value={value || ""}
      onChange={onChange}
      className="w-full p-2 border border-black-200 rounded-md"
    />
  </div>
);

export default SignupStep3;
