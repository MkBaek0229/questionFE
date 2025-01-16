import { useState } from "react";

function SignupStep3_expert({ formData, setFormData, prevStep, handleSubmit }) {
  const [errorMessage, setErrorMessage] = useState(""); // 일반적인 에러 메시지
  const [passwordError, setPasswordError] = useState(""); // 비밀번호 확인 에러 메시지
  const [passwordConfirm, setPasswordConfirm] = useState(""); // 비밀번호 확인 필드

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Updating field: ${name}, Value: ${value}`); // 디버깅 로그 추가
    setFormData({ ...formData, [name]: value });
  };

  const handlePasswordConfirmChange = (e) => {
    setPasswordConfirm(e.target.value);

    // 비밀번호와 비밀번호 확인이 일치하지 않으면 에러 메시지 설정
    if (formData.password !== e.target.value) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
    } else {
      setPasswordError(""); // 일치하면 에러 메시지 제거
    }
  };

  const validateInputs = () => {
    // 모든 필수 입력값 검증
    if (
      !formData.name ||
      !formData.institution_name ||
      !formData.ofcps ||
      !formData.phone_number ||
      !formData.major_carrea ||
      !formData.password
    ) {
      setErrorMessage("모든 필드를 입력해 주세요.");
      return false;
    }

    // 비밀번호와 비밀번호 확인 검증
    if (formData.password !== passwordConfirm) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
      return false;
    }

    setErrorMessage(""); // 모든 검증 통과 시 에러 메시지 초기화
    return true;
  };

  const handleSignupSubmit = () => {
    if (validateInputs()) {
      handleSubmit(); // 부모에서 정의된 서버 요청 함수 호출
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-3/4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">전문가 회원가입</h1>
      <div className="space-y-6">
        <div>
          <label className="block text-gray-700 font-medium">성명</label>
          <input
            type="text"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md"
            placeholder="성명을 입력해 주세요"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">소속</label>
          <input
            type="text"
            name="institution_name"
            value={formData.institution_name || ""}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md"
            placeholder="소속을 입력해 주세요"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">직위(직급)</label>
          <input
            type="text"
            name="ofcps"
            value={formData.ofcps || ""}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md"
            placeholder="직위를 입력해 주세요"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">
            휴대전화번호
          </label>
          <input
            type="text"
            name="phone_number"
            value={formData.phone_number || ""}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md"
            placeholder="휴대전화번호를 입력해 주세요"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">주요 경력</label>
          <textarea
            name="major_carrea"
            value={formData.major_carrea || ""}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md"
            placeholder="주요 경력을 3가지 이상 작성해 주세요"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">비밀번호</label>
          <input
            type="password"
            name="password"
            value={formData.password || ""}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md"
            placeholder="비밀번호를 입력해 주세요"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">
            비밀번호 확인
          </label>
          <input
            type="password"
            value={passwordConfirm}
            onChange={handlePasswordConfirmChange}
            className="w-full p-3 border border-gray-300 rounded-md"
            placeholder="비밀번호를 다시 입력해 주세요"
          />
          {passwordError && (
            <p className="text-red-500 text-sm mt-2">{passwordError}</p>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="mt-4 text-red-500 text-center">{errorMessage}</div>
      )}

      <div className="flex justify-between mt-8">
        <button
          className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md"
          onClick={prevStep}
        >
          이전
        </button>
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={handleSignupSubmit}
        >
          완료
        </button>
      </div>
    </div>
  );
}

export default SignupStep3_expert;
