import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserSecret, faUserTie } from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";
import { formState } from "../../state/formState";
import { toast } from "react-toastify";

function SignupStep0({ nextStep }) {
  const [formData, setFormData] = useRecoilState(formState);

  const handleMemberTypeSelection = (type) => {
    if (!type) {
      toast.error("회원 유형을 선택해주세요."); // 오류 메시지 설정
      return;
    }
    setFormData({ ...formData, member_type: type }); // 선택한 회원 유형(member_type)을 저장
    nextStep(); // 다음 단계로 이동
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {/* 제목 */}
      <div className="text-center">
        <h1 className="text-4xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500 mb-2">
          회원 유형 선택
        </h1>
        <p className="text-2xl text-gray-400 mt-2 font-medium">
          회원 유형을 선택하고 다음 단계로 진행하세요.
        </p>
      </div>

      {/* 버튼 영역 */}
      <div className="w-full max-w-[500px] space-y-4 mt-10">
        {/* 전문가 버튼 */}
        <button
          className="flex flex-col rounded-[10px]  items-center justify-center w-full h-[250px] p-6 bg-green-500 text-white font-bold  shadow-lg hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-300 transition duration-200 transform hover:scale-105"
          onClick={() => handleMemberTypeSelection("expert")}
        >
          <div className="flex items-center justify-center w-24 h-24 bg-white rounded-full mb-6">
            <FontAwesomeIcon
              icon={faUserSecret}
              size="4x"
              className="text-green-500"
            />
          </div>
          <div className="text-center">
            <span className="text-4xl block">전문가</span>
            <span className="text-lg block text-green-100 mt-4">
              피드백 전문가를 위한 회원 유형
            </span>
          </div>
        </button>

        {/* 기관회원 버튼 */}
        <button
          className="flex flex-col rounded-[10px]  items-center justify-center w-full h-[250px] p-6 bg-blue-600 text-white font-bold  shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-200 transform hover:scale-105"
          onClick={() => handleMemberTypeSelection("user")}
        >
          <div className="flex items-center justify-center w-24 h-24 bg-white rounded-full mb-6">
            <FontAwesomeIcon
              icon={faUserTie}
              size="4x"
              className="text-blue-600"
            />
          </div>
          <div className="text-center">
            <span className="text-4xl block">기관회원</span>
            <span className="text-lg block text-blue-100 mt-4">
              자가진단 평가를 받기 위한 회원 유형
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}

export default SignupStep0;
