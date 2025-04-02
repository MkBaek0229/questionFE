import React, { useState, useEffect } from "react";
import { useRecoilState, useResetRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../axiosInstance";
import { formState } from "../../state/formState";
import SignupStep0 from "../../components/Login/SignupStep0";
import SignupStep1 from "../../components/Login/SignupStep1";
import SignupStep2 from "../../components/Login/SignupStep2";
import SignupStep3 from "../../components/Login/SignupStep3";
import { toast } from "react-toastify";
import StepProgressBar from "./StepProgressBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

function Signup() {
  const [step, setStep] = useState(0); // 현재 단계
  const navigate = useNavigate();
  const [formData, setFormData] = useRecoilState(formState);
  const resetFormState = useResetRecoilState(formState);

  useEffect(() => {
    return () => {
      resetFormState(); // 컴포넌트 언마운트 시 formState 초기화
    };
  }, [resetFormState]);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const getCsrfToken = async () => {
    try {
      const { data } = await axiosInstance.get(
        "http://localhost:3000/csrf-token",
        {
          withCredentials: true, // ✅ 쿠키 포함
        }
      );
      return data.csrfToken;
    } catch (error) {
      console.error("❌ CSRF 토큰 가져오기 실패:", error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!formData.emailVerified) {
      toast.error("이메일 인증이 필요합니다.");
      return;
    }

    if (!formData.member_type) {
      toast.error("회원 유형을 선택해 주세요.");
      return;
    }

    // ✅ CSRF 토큰 가져오기
    const csrfToken = await getCsrfToken();
    if (!csrfToken) {
      toast.error("CSRF 토큰을 가져올 수 없습니다.");
      return;
    }

    const endpoint =
      formData.member_type === "user"
        ? "http://localhost:3000/auth/register"
        : "http://localhost:3000/expert/register";

    const payload = {
      ...formData[formData.member_type], // 선택된 회원 유형의 데이터만 포함
      email: formData.email,
      password: formData.password,
      role: formData.member_type, // 백엔드에서 role을 명확하게 전달하기 위해 추가
    };

    console.log("📩 회원가입 요청 데이터:", payload);

    try {
      const { data } = await axiosInstance.post(endpoint, payload, {
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken, // ✅ CSRF 토큰 추가
        },
        withCredentials: true, // ✅ 쿠키 포함
      });

      toast.success(data.message || "회원가입 성공");
      navigate("/");
    } catch (error) {
      console.error("❌ 회원가입 오류:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message || "회원가입 요청 중 오류가 발생했습니다."
      );
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <SignupStep0 nextStep={nextStep} />;
      case 1:
        return <SignupStep1 prevStep={prevStep} nextStep={nextStep} />;
      case 2:
        return <SignupStep2 nextStep={nextStep} prevStep={prevStep} />;
      case 3:
        return <SignupStep3 prevStep={prevStep} handleSubmit={handleSubmit} />;
      default:
        return null;
    }
  };

  const steps = ["회원유형 선택", "약관동의", "이메일 인증", "회원정보 입력"];

  return (
    <div className="h-full flex flex-col justify-center items-center bg-white p-6">
      {/* 메인으로 돌아가기 버튼 추가 */}
      <div className="w-full  mb-4 flex justify-start">
        <button
          onClick={() => navigate("/")}
          className="flex items-center text-slate-600 hover:text-slate-900 transition-colors py-2 px-3 rounded-md hover:bg-slate-100"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-4 w-4" />
          메인으로 돌아가기
        </button>
      </div>
      {/* 진행 바 UI */}
      <StepProgressBar steps={steps} currentStep={step} />
      {renderStep()}
    </div>
  );
}

export default Signup;
