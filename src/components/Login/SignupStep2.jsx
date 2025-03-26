import React, { useState } from "react";
import axiosInstance from "../../../axiosInstance";
import { useRecoilState } from "recoil";
import { formState } from "../../state/formState";
import { toast } from "react-toastify";

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
  const [emailVerification, setEmailVerification] = useState(false); // 이메일 요청 여부
  const [emailInput, setEmailInput] = useState("");
  const [verificationCode, setVerificationCode] = useState();
  const [isVerified, setIsVerified] = useState(false);

  // 이메일 검증 함수
  const EmailCheckMachine = (email) => {
    const email_regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;

    if (!email) {
      toast.error("이메일을 입력해주세요.");
      setEmailVerification(false);
      return false;
    }

    if (!email.match(email_regex)) {
      toast.error("유효하지 않은 이메일 형식입니다.");
      setEmailVerification(false);
      return false;
    }

    setEmailVerification(true);
    return true;
  };

  // 인증번호 요청 함수
  const handleSendVerificationCode = async () => {
    const isEmailValid = EmailCheckMachine(emailInput);
    if (!isEmailValid) return;

    try {
      const csrfToken = await getCsrfToken();
      if (!csrfToken) {
        toast.error("CSRF 토큰을 가져오는 데 실패했습니다.");
        return;
      }

      await axiosInstance.post(
        "http://localhost:3000/email/send-verification-code",
        {
          email: emailInput,
          member_type: "user",
        },
        {
          withCredentials: true,
          headers: {
            "X-CSRF-Token": csrfToken,
          },
        }
      );

      toast.success("인증코드가 이메일로 전송되었습니다.");
      setEmailVerification(true);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage);

      setEmailVerification(false);
    }
  };

  // 이메일 인증 코드 검증을 위한 함수
  const verifyEmailCode = async (email, code) => {
    try {
      const csrfToken = await getCsrfToken();

      // POST 요청 전송: URL, 요청 데이터, 헤더 설정
      const response = await axiosInstance.post(
        "http://localhost:3000/email/verify-code",
        {
          email: email,
          code: code,
        },
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          // 필요한 경우 쿠키를 함께 보내려면 withCredentials 옵션을 활성화합니다.
          withCredentials: true,
        }
      );

      // 요청 성공 시 결과 반환
      if (response.status === 200) {
        toast.success("인증 성공");
        setFormData({ ...formData, email: email, emailVerified: true });
        setIsVerified(true);
      }
    } catch (error) {
      // 에러 처리: 콘솔에 출력하고 예외를 던집니다.
      toast.error("인증 실패");
      throw error;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg w-3/4 max-w-2xl">
      {!emailVerification ? (
        // 이메일 입력 및 인증번호 요청 UI
        <div>
          <h1 className="flex text-[32px] font-bold justify-center gap-2">
            당신의 <p className="text-blue-500">이메일 주소는?</p>
          </h1>
          <div className="flex flex-col justify-between mt-6 mb-8">
            <input
              type="email"
              placeholder="이메일을 입력해주세요"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full p-6 h-12 border-2 border-blue-60 rounded-3xl mx-auto text-[24px]"
            />
          </div>

          <div className="flex justify-center">
            {emailInput && (
              <button
                onClick={handleSendVerificationCode}
                className="bg-green-500 text-white rounded-full w-full max-w-md py-3 text-lg font-semibold"
              >
                인증번호 발송
              </button>
            )}
          </div>
        </div>
      ) : (
        // 인증번호 입력 UI
        <div>
          <h1 className="flex text-[32px] font-bold justify-center gap-2 ">
            인증코드를 입력해주세요
          </h1>
          <input
            type="tel"
            maxLength={6}
            autoComplete="off"
            placeholder="인증코드를 입력해주세요"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="w-full p-6 h-12 border-2 border-blue-60 rounded-3xl mx-auto text-[24px] mt-6 mb-12"
          />
          <div className="flex justify-center mb-8">
            <button
              onClick={() => verifyEmailCode(emailInput, verificationCode)}
              className="bg-blue-500 text-white rounded-full w-full max-w-md py-3 text-lg font-semibold"
            >
              인증코드 확인
            </button>
          </div>
        </div>
      )}

      <button
        onClick={prevStep}
        className="w-[100%] h-[50px] text-[22px] font-bold rounded-md"
      >
        이전
      </button>

      {isVerified && (
        <button
          className={`w-[100%] h-[50px] text-[22px] font-bold rounded-md ${
            formData.agreement
              ? "bg-blue-500 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-700 cursor-not-allowed"
          }`}
          onClick={nextStep}
          disabled={!formData.agreement}
        >
          다음
        </button>
      )}
    </div>
  );
}

export default SignupStep2;
