import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useRecoilState, useRecoilValue } from "recoil";
import { authState } from "../../state/authState";
import { selfTestFormState } from "../../state/selftestFormState";

function SelfTestStart() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedSystems } = location.state || {};
  const [formData, setFormData] = useRecoilState(selfTestFormState); // 전역 상태 관리
  const auth = useRecoilValue(authState); // 사용자 정보 가져오기

  const systemId =
    selectedSystems && selectedSystems.length > 0 ? selectedSystems[0] : null;

  const userId = auth.user?.id || null;

  useEffect(() => {
    console.log("📌 페이지 로드 - 전달된 시스템 ID:", systemId);
    console.log("📌 location.state:", location.state);

    if (!systemId) {
      alert("시스템 정보가 없습니다. 다시 선택해주세요.");
      navigate("/dashboard");
    }
    if (!userId) {
      alert("유저 정보가 없습니다. 다시 로그인해주세요.");
      navigate("/login");
    }
  }, [systemId, userId, navigate]);

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
    if (!userId) {
      console.error("유저 정보가 누락되었습니다. 다시 로그인해주세요.");
      return false;
    }
    return true;
  };

  const handleDiagnosisClick = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // ✅ 기존 데이터 확인
      const existingDataResponse = await axios.get(
        "http://localhost:3000/selftest",
        {
          params: { systemId, userId },
          withCredentials: true,
        }
      );

      if (existingDataResponse.data) {
        console.log(
          "✅ 기존 자가진단 데이터가 존재합니다:",
          existingDataResponse.data
        );
        navigate("/DiagnosisPage", {
          state: { systemId, userId },
        });
        return;
      }

      // ✅ 기존 데이터가 없으면 새 데이터 저장
      const response = await axios.post(
        "http://localhost:3000/selftest",
        { ...formData, systemId, userId },
        { withCredentials: true }
      );

      console.log("서버 응답:", response.data);
      navigate("/DiagnosisPage", {
        state: { systemId, userId },
      });
    } catch (error) {
      console.error("서버 저장 실패:", error.response?.data || error.message);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto max-w-5xl p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">자가진단 입력</h1>
        </div>

        <form>
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
          <div className="mt-8 text-center">
            <button
              onClick={handleDiagnosisClick}
              className="px-6 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
            >
              자가진단하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SelfTestStart;
