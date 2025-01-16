import React, { useState } from "react";

function SignupStep2({ formData, setFormData, prevStep, nextStep }) {
  const [email, setEmail] = useState(formData.email || ""); // 이메일 상태
  const [verificationCode, setVerificationCode] = useState(""); // 인증코드 상태
  const [verificationMessage, setVerificationMessage] = useState(""); // 메시지
  const [isVerified, setIsVerified] = useState(false); // 인증 여부

  // 이메일 입력 핸들러
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setVerificationMessage("");
    setIsVerified(false);
  };

  // 이메일 인증코드 요청
  const handleEmailVerification = async () => {
    if (!email.trim()) {
      setVerificationMessage("이메일을 입력해 주세요.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/email/send-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setVerificationMessage(data.msg); // 서버 응답 메시지
      } else {
        setVerificationMessage(data.msg || "인증코드 요청에 실패했습니다.");
      }
    } catch (error) {
      setVerificationMessage("인증코드 요청 중 오류가 발생했습니다.");
    }
  };

  // 인증코드 입력 핸들러
  const handleVerificationCodeChange = (e) => {
    setVerificationCode(e.target.value);
  };

  // 인증코드 확인
  const handleVerificationCodeCheck = async () => {
    if (!verificationCode.trim()) {
      setVerificationMessage("인증코드를 입력해 주세요.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/email/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          clientCode: verificationCode,
        }),
      });

      const data = await response.json();

      if (response.ok && data.resultCode === "S-1") {
        setIsVerified(true);
        setVerificationMessage("인증 성공!");
        setFormData({ ...formData, email, emailVerified: true }); // 인증 상태 저장
      } else {
        setVerificationMessage(data.msg || "인증코드 확인에 실패했습니다.");
      }
    } catch (error) {
      setVerificationMessage("인증코드 확인 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-3/4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">회원가입</h1>
      <div className="mb-6">
        <label>이메일</label>
        <input
          type="text"
          value={email}
          onChange={handleEmailChange}
          className="w-full p-3 border rounded-md"
        />
        <button
          onClick={handleEmailVerification}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          인증코드 요청
        </button>
      </div>
      <div className="mb-6">
        <label>인증코드</label>
        <input
          type="text"
          value={verificationCode}
          onChange={handleVerificationCodeChange}
          className="w-full p-3 border rounded-md"
        />
        <button
          onClick={handleVerificationCodeCheck}
          className="mt-2 px-4 py-2 bg-gray-600 text-white rounded-md"
        >
          확인
        </button>
      </div>
      {verificationMessage && <p>{verificationMessage}</p>}
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
