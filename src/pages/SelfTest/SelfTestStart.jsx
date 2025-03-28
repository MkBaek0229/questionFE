import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axiosInstance from "../../../axiosInstance";
import { useRecoilState, useRecoilValue } from "recoil";
import { selfTestFormState } from "../../state/selfTestState";
import { authState } from "../../state/authState";

const getCsrfToken = async () => {
  try {
    const response = await axiosInstance.get(
      "http://localhost:3000/csrf-token",
      {
        withCredentials: true, // ✅ 세션 쿠키 포함
      }
    );
    return response.data.csrfToken;
  } catch (error) {
    console.error("❌ CSRF 토큰 가져오기 실패:", error);
    return null;
  }
};
function SelfTestStart() {
  const { systemId } = useParams(); // URL에서 systemId 가져오기

  const navigate = useNavigate();
  const location = useLocation();

  const diagnosisRound = location.state?.diagnosisRound || 1; // 기본값 1
  const auth = useRecoilValue(authState); // 이 라인 추가

  const [formData, setFormData] = useRecoilState(selfTestFormState); // 전역 상태 관리

  const [csrfToken, setCsrfToken] = useState("");
  useEffect(() => {
    const fetchCsrfToken = async () => {
      const token = await getCsrfToken();
      setCsrfToken(token);
    };
    fetchCsrfToken();
  }, []);

  useEffect(() => {
    if (!systemId) {
      console.error("시스템 정보가 누락되었습니다.");
    }
  }, [systemId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleButtonClick = (name, value) => {
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const validateForm = () => {
    for (const [key, value] of Object.entries(formData)) {
      if (!value) {
        console.error(`${key}을(를) 선택해주세요.`);
        return false;
      }
    }
    if (!systemId) {
      console.error("시스템 정보가 누락되었습니다. 다시 선택해주세요.");
      return false;
    }

    return true;
  };

  const handleDiagnosisClick = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // 여기에 userId 체크 추가 (선택사항)
    if (!auth.user?.id) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }
    try {
      const response = await axiosInstance.post(
        "http://localhost:3000/selftest/self-assessment",
        { ...formData, systemId, diagnosisRound },
        { withCredentials: true, headers: { "X-CSRF-Token": csrfToken } }
      );

      console.log("서버 응답:", response.data);
      const nextRound = response.data.diagnosisRound;

      navigate("/DiagnosisPage", {
        state: { systemId, userId: auth.user.id, diagnosisRound: nextRound },
      });
    } catch (error) {
      console.error("서버 저장 실패:", error.response?.data || error.message);
    }
  };

  return (
    <div className="h-full flex flex-col justify-center items-center bg-white p-6">
      <div className="w-full max-w-[600px] py-8 gap-10">
        <h1 className="text-[24px] font-black text-gray-800 mb-4">
          자가진단 입력
        </h1>

        <form className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label
                htmlFor="organization"
                className="block text-sm font-medium text-gray-700"
              >
                공공기관 분류
              </label>
              <select
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={handleInputChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="교육기관">교육기관</option>
                <option value="공공기관">공공기관</option>
                <option value="국가기관">국가기관</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="userGroup"
                className="block text-sm font-medium text-gray-700"
              >
                이용자 구분
              </label>
              <select
                id="userGroup"
                name="userGroup"
                value={formData.userGroup}
                onChange={handleInputChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1~4명">1~4명</option>
                <option value="5~10명">5~10명</option>
                <option value="10명 이상">10명 이상</option>
              </select>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { label: "개인정보보호 시스템", name: "personalInfoSystem" },
              { label: "회원정보 홈페이지 여부", name: "memberInfoHomepage" },
              { label: "외부정보 제공 여부", name: "externalDataProvision" },
              {
                label: "CCTV 운영 여부",
                name: "cctvOperation",
                options: ["운영", "미운영"],
              },
              { label: "업무 위탁 여부", name: "taskOutsourcing" },
              { label: "개인정보 폐기 여부", name: "personalInfoDisposal" },
            ].map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between"
              >
                <span className="text-gray-700 font-medium">{item.label}</span>
                <div className="space-x-4">
                  {(item.options || ["있음", "없음"]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`px-4 py-2 rounded-md ${
                        formData[item.name] === option
                          ? "bg-blue-500 text-white"
                          : "bg-gray-300 text-gray-700"
                      }`}
                      onClick={() => handleButtonClick(item.name, option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </form>
        <button
          onClick={handleDiagnosisClick}
          className="w-[100%] h-[50px] text-[22px] bg-blue-600 text-white font-bold rounded-md mb-4"
        >
          자가진단 시작
        </button>
        <button
          onClick={() => navigate("/Dashboard")}
          className="w-[100%] h-[50px] text-[22px] font-bold rounded-md"
        >
          대시보드로 이동
        </button>
      </div>
    </div>
  );
}

export default SelfTestStart;
