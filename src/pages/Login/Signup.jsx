import React, { useState } from "react";
import { useRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";
import { formState } from "../../state/formState";
import SignupStep0 from "../../components/Login/SignupStep0";
import SignupStep1 from "../../components/Login/SignupStep1";
import SignupStep2 from "../../components/Login/SignupStep2";
import SignupStep3 from "../../components/Login/SignupStep3";

function Signup() {
  const [step, setStep] = useState(0); // 현재 단계
  const navigate = useNavigate();
  const [formData, setFormData] = useRecoilState(formState);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    if (!formData.emailVerified) {
      alert("이메일 인증이 필요합니다.");
      return;
    }

    // Define the endpoint based on the member type
    const endpoint =
      formData.member_type === "User"
        ? "http://localhost:3000/register"
        : "http://localhost:3000/register/expert";

    try {
      // Prepare the payload
      const payload =
        formData.member_type === "User"
          ? {
              ...formData.user,
              email: formData.email,
              password: formData.password,
              member_type: formData.member_type,
            }
          : {
              ...formData.expert,
              email: formData.email,
              password: formData.password,
              member_type: formData.member_type,
            };

      console.log("Payload being sent:", payload); // Debugging log

      // Make the fetch request
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Response received:", data); // Debugging log

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

  if (step === 0) {
    return (
      <SignupStep0
        formData={formData}
        setFormData={setFormData}
        nextStep={nextStep}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      {step === 1 && (
        <SignupStep1
          formData={formData}
          setFormData={setFormData}
          nextStep={nextStep}
        />
      )}
      {step === 2 && (
        <SignupStep2
          formData={formData}
          setFormData={setFormData}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      )}
      {step === 3 && formData.member_type === "User" && (
        <SignupStep3
          formData={formData.user} // 일반 회원 데이터만 전달
          setFormData={(userData) =>
            setFormData({ ...formData, user: { ...userData } })
          }
          prevStep={prevStep}
          handleSubmit={handleSubmit}
        />
      )}
      {step === 3 && formData.member_type === "expert" && (
        <SignupStep3_expert
          formData={formData.expert} // 전문가 데이터 전달
          setFormData={(expertData) =>
            setFormData({
              ...formData,
              expert: { ...expertData },
              password: expertData.password, // 비밀번호 동기화
            })
          }
          prevStep={prevStep}
          handleSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

export default Signup;
