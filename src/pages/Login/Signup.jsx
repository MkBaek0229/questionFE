import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignupStep0 from "../../components/Login/SignupStep0";
import SignupStep1 from "../../components/Login/SignupStep1";
import SignupStep2 from "../../components/Login/SignupStep2";
import SignupStep3 from "../../components/Login/SignupStep3"; // 통합된 컴포넌트
import axios from "axios";

function Signup() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    agreement: false,
    role: "", // "user" 또는 "expert"
    email: "",
    password: "",
    emailVerified: false, // 이메일 인증 여부
    user: {
      institution_name: "",
      institution_address: "",
      representative_name: "",
      phone: "",
    },
    expert: {
      name: "",
      institution_name: "",
      ofcps: "", // 직위(직급)
      phone_number: "",
      major_carrea: "", // 주요 경력
    },
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    if (!formData.emailVerified) {
      alert("이메일 인증이 필요합니다.");
      return;
    }

    const endpoint =
      formData.role === "user"
        ? "http://localhost:3000/register"
        : "http://localhost:3000/register/expert";

    try {
      console.log("Submitting data:", formData);

      const payload = {
        email: formData.email,
        password: formData.password,
        ...formData[formData.role], // role에 해당하는 객체(user 또는 expert)만 전송
      };

      const response = await axios.post(endpoint, payload);
      alert(response.data.message || "회원가입 성공!");
      navigate("/");
    } catch (error) {
      console.error("Error during signup:", error.response || error);
      alert(error.response?.data?.message || "회원가입 실패");
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
      {step === 3 && (
        <SignupStep3
          formData={formData[formData.role]} // 선택된 역할(user 또는 expert)에 맞는 데이터 전달
          setFormData={(data) =>
            setFormData({
              ...formData,
              [formData.role]: data,
              password: data.password, // 비밀번호 동기화
            })
          }
          prevStep={prevStep}
          handleSubmit={handleSubmit}
          role={formData.role} // role을 전달하여 조건부 렌더링 가능
        />
      )}
    </div>
  );
}

export default Signup;
