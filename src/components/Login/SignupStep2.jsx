import React, { useState, useEffect } from "react";
import axiosInstance from "../../../axiosInstance";
import { useRecoilState } from "recoil";
import { formState } from "../../state/formState";

// ✅ CSRF 토큰 가져오는 함수
const getCsrfToken = async () => {
  try {
    const response = await axiosInstance.get(
      "http://localhost:3000/csrf-token",
      {
        withCredentials: true, // ✅ 세션 쿠키 포함 (중요)
      }
    );
    return response.data.csrfToken;
  } catch (error) {
    console.error("❌ CSRF 토큰 가져오기 실패:", error);
    return null;
  }
};

function SignupStep2({ prevStep, nextStep }) {
  const [formData, setFormData] = useRecoilState(formState);
  const [email, setEmail] = useState(formData.email || "");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(60);
  const [requestCount, setRequestCount] = useState(0);

  // ⏳ **쿨다운 타이머 업데이트**
  useEffect(() => {
    if (isCooldown) {
      const timer = setInterval(() => {
        setCooldownTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsCooldown(false);
            setRequestCount(0);
            return 60;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isCooldown]);

  const handleEmailChange = (e) => {
    setEmail(e.target.value.toLowerCase()); // 자동 소문자 변환
    setVerificationMessage("");
    setIsVerified(false);
    setErrorMessage("");
  };

  // ✅ 이메일 인증 코드 요청 (CSRF 보호 추가)
  const handleSendVerificationCode = async () => {
    if (isCooldown || requestCount >= 3) {
      alert("1분 내 요청 횟수를 초과했습니다. 잠시 후 다시 시도하세요.");
      return;
    }

    try {
      console.log("🚀 [이메일 인증] CSRF 토큰 가져오는 중...");
      const csrfToken = await getCsrfToken(); // 🔥 CSRF 토큰 가져오기

      if (!csrfToken) {
        setErrorMessage("CSRF 토큰을 가져오는 데 실패했습니다.");
        return;
      }

      const response = await axiosInstance.post(
        "http://localhost:3000/email/send-verification-code",
        { email },
        {
          withCredentials: true,
          headers: { "X-CSRF-Token": csrfToken }, // ✅ CSRF 토큰 추가
        }
      );

      setVerificationMessage(response.data.message);
      setErrorMessage("");
      setVerificationSent(true);
      setRequestCount(requestCount + 1);

      if (requestCount + 1 >= 3) {
        setIsCooldown(true);
        setCooldownTime(60); // 타이머 초기화
      }
    } catch (error) {
      if (error.response?.status === 429) {
        setErrorMessage("너무 많은 요청입니다. 1분 후 다시 시도하세요.");
      }
      setErrorMessage(error.response?.data?.message || "인증 코드 전송 실패");
    }
  };

  // ✅ 인증 코드 확인 (CSRF 보호 추가)
  const handleVerificationCodeCheck = async () => {
    try {
      console.log("🚀 [인증 코드 확인] CSRF 토큰 가져오는 중...");
      const csrfToken = await getCsrfToken(); // 🔥 CSRF 토큰 가져오기

      if (!csrfToken) {
        setErrorMessage("CSRF 토큰을 가져오는 데 실패했습니다.");
        return;
      }

      const response = await axiosInstance.post(
        "http://localhost:3000/email/verify-code",
        { email, code: verificationCode },
        {
          withCredentials: true,
          headers: { "X-CSRF-Token": csrfToken }, // ✅ CSRF 토큰 추가
        }
      );

      if (response.status === 200) {
        setFormData((prev) => ({ ...prev, email, emailVerified: true }));
        setIsVerified(true);
        setVerificationMessage("이메일 인증 성공!");
        setErrorMessage("");
      }
    } catch (error) {
      setVerificationMessage(
        error.response?.data?.message || "인증 코드가 유효하지 않습니다."
      );
    }
  };

  return (
    <>
      {/* 📌 진행 바 UI */}
      <div className="flex items-center justify-center w-full py-8">
        <div className="flex items-center w-4/5 max-w-2xl relative justify-between">
          {/* STEP 1 */}
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
            <div className="w-[75px] h-[75px] flex items-center justify-center border-4 border-blue-500 bg-blue-500 text-white rounded-full text-3xl z-10">
              ✓
            </div>
            <span className="text-blue-600 text-xl font-bold mt-3">
              이메일 인증
            </span>
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

      <div className="bg-white p-6 rounded-lg shadow-md w-3/4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">
          {formData.member_type === "user"
            ? "기관회원 회원가입"
            : "전문가 회원가입"}
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
            className={`mt-2 px-4 py-2 rounded-md ${
              isCooldown
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            disabled={isCooldown}
          >
            {isCooldown
              ? `다시 요청 가능 (${cooldownTime}s)`
              : "인증 코드 전송"}
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
        {errorMessage && <p className="text-red-600">{errorMessage}</p>}
        <div className="flex justify-between mt-6">
          <button
            onClick={prevStep}
            className="px-4 py-2 bg-gray-600 text-white rounded-md"
          >
            이전
          </button>
          <button
            onClick={nextStep}
            className={`px-4 py-2 rounded-md ${
              !isVerified
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            disabled={!isVerified}
          >
            다음
          </button>
        </div>
      </div>
    </>
  );
}

export default SignupStep2;
