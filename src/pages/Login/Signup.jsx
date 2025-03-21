import React, { useState, useEffect } from "react";
import { useRecoilState, useResetRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../axiosInstance";
import { formState } from "../../state/formState";
import SignupStep0 from "../../components/Login/SignupStep0";
import SignupStep1 from "../../components/Login/SignupStep1";
import SignupStep2 from "../../components/Login/SignupStep2";
import SignupStep3 from "../../components/Login/SignupStep3";

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
      alert("이메일 인증이 필요합니다.");
      return;
    }

    if (!formData.member_type) {
      alert("회원 유형을 선택해 주세요.");
      return;
    }

    // ✅ CSRF 토큰 가져오기
    const csrfToken = await getCsrfToken();
    if (!csrfToken) {
      alert("CSRF 토큰을 가져올 수 없습니다.");
      return;
    }

    const endpoint =
      formData.member_type === "user"
        ? "http://localhost:3000/auth/register"
        : "http://localhost:3000/register/expert";

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

      alert(data.message || "회원가입 성공");
      navigate("/");
    } catch (error) {
      console.error("❌ 회원가입 오류:", error.response?.data || error.message);
      alert(
        error.response?.data?.message || "회원가입 요청 중 오류가 발생했습니다."
      );
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <SignupStep0 nextStep={nextStep} />;
      case 1:
        return <SignupStep1 nextStep={nextStep} />;
      case 2:
        return <SignupStep2 nextStep={nextStep} prevStep={prevStep} />;
      case 3:
        return <SignupStep3 prevStep={prevStep} handleSubmit={handleSubmit} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-6">
      {renderStep()}
    </div>
  );
}

export default Signup;
