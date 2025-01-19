import React, { useState } from "react";
import { useRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";
import { formState } from "../../state/formState";
import SignupStep0 from "../../components/Login/SignupStep0";
import SignupStep1 from "../../components/Login/SignupStep1";
import SignupStep2 from "../../components/Login/SignupStep2";
import SignupStep3 from "../../components/Login/SignupStep3";
import { useResetRecoilState } from "recoil";
import { useEffect } from "react";

function Signup() {
  const [step, setStep] = useState(0); // 현재 단계
  const navigate = useNavigate();
  const [formData, setFormData] = useRecoilState(formState);
  const resetFormState = useResetRecoilState(formState);

  useEffect(() => {
    // 컴포넌트가 언마운트될 때 formState 초기화
    return () => {
      resetFormState();
    };
  }, [resetFormState]);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    if (!formData.emailVerified) {
      alert("이메일 인증이 필요합니다.");
      return;
    }

    if (!formData.member_type) {
      alert("회원 유형을 선택해 주세요.");
      return;
    }

    const endpoint =
      formData.member_type === "user"
        ? "http://localhost:3000/register"
        : "http://localhost:3000/register/expert";

    const payload = {
      ...formData[formData.member_type], // 선택된 회원 유형의 데이터만 포함
      email: formData.email,
      password: formData.password,
      role: formData.member_type, // 백엔드에서 role을 명확하게 전달하기 위해 추가
    };

    console.log("Payload being sent:", payload);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Response received:", data);

      if (response.ok) {
        alert(data.message || "회원가입 성공");
        navigate("/");
      } else {
        alert(data.message || "회원가입 실패");
      }
    } catch (error) {
      console.error("Error during signup:", error.message);
      alert("회원가입 요청 중 오류가 발생했습니다.");
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
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      {renderStep()}
    </div>
  );
}

export default Signup;
