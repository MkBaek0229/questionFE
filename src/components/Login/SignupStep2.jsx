import React, { useState } from "react";
import axios from "axios";
import { useRecoilState } from "recoil";
import { formState } from "../../state/formState";

function SignupStep2({ prevStep, nextStep }) {
  const [formData, setFormData] = useRecoilState(formState);
  const [email, setEmail] = useState(formData.email || "");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setVerificationMessage("");
    setIsVerified(false);
  };

  const handleSendVerificationCode = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/email/send-verification-code",
        { email }
      );
      alert(response.data.message); // 성공 메시지
    } catch (error) {
      console.error("인증 코드 전송 실패:", error);
      setVerificationMessage(
        error.response?.data?.message || "인증 코드 전송 실패"
      );
    }
  };

  const handleVerificationCodeCheck = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/email/verify-code",
        { email, code: verificationCode }
      );
      if (response.status === 200) {
        // 이메일 인증 성공 시 formData 업데이트
        setFormData((prev) => ({ ...prev, email, emailVerified: true }));
        setIsVerified(true);
        setVerificationMessage("이메일 인증 성공!");
      }
    } catch (error) {
      console.error("인증 실패:", error);
      setVerificationMessage(
        error.response?.data?.message || "인증 코드가 유효하지 않습니다."
      );
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-3/4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">
        {formData.role === "user" ? "기관회원 회원가입" : "전문가 회원가입"}
      </h1>
      <div className="mb-6">
        <label>이메일</label>
        <input
          type="email"
          value={email}
          onChange={handleEmailChange}
          className="w-full p-3 border rounded-md"
          placeholder="이메일을 입력하세요"
        />
        <button
          onClick={handleSendVerificationCode}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          인증 코드 전송
        </button>
      </div>
      <div className="mb-6">
        <label>인증 코드</label>
        <input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          className="w-full p-3 border rounded-md"
          placeholder="인증 코드를 입력하세요"
        />
        <button
          onClick={handleVerificationCodeCheck}
          className="mt-2 px-4 py-2 bg-gray-600 text-white rounded-md"
        >
          확인
        </button>
      </div>
      {verificationMessage && (
        <p className="text-green-600">{verificationMessage}</p>
      )}
      <div className="flex justify-between mt-4">
        <button onClick={prevStep} className="px-4 py-2 bg-gray-300 rounded-md">
          이전
        </button>
        <button
          onClick={nextStep}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
          disabled={!isVerified}
        >
          다음
        </button>
      </div>
    </div>
  );
}

export default SignupStep2;
