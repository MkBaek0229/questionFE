import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useSetRecoilState } from "recoil";
import { authState } from "../../state/authState";

function Dashboard() {
  const [systems, setSystems] = useState([]);
  const [assessmentStatuses, setAssessmentStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [userInfo, setUserInfo] = useState(null); // 유저 정보 상태
  const navigate = useNavigate();
  const setAuthState = useSetRecoilState(authState);

  // 시스템 및 진단 상태 가져오기
  const fetchSystems = async () => {
    setErrorMessage("");
    try {
      const [systemsResponse, userResponse] = await Promise.all([
        axios.get("http://localhost:3000/systems", { withCredentials: true }),
        axios.get("http://localhost:3000/user", { withCredentials: true }),
      ]);
      setSystems(systemsResponse.data);
      setUserInfo(userResponse.data);

      // 각 시스템의 진단 상태 가져오기
      const statusResponse = await axios.get(
        "http://localhost:3000/assessment/status",
        { withCredentials: true }
      );
      setAssessmentStatuses(statusResponse.data);
    } catch (error) {
      console.error("데이터 조회 실패:", error);
      setErrorMessage("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystems();
  }, []);

  const handleRegisterClick = () => {
    if (!userInfo || !userInfo.id) {
      alert("사용자 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }
    navigate("/system-register", { state: { userId: userInfo.id } });
  };

  const handleViewResult = (systemId) => {
    console.log("Navigating to view results for system:", systemId);
    navigate("/completion", { state: { systemId, userId: userInfo.id } });
  };

  const handleEditResult = (systemId) => {
    console.log("Navigating to edit results for system:", systemId);
    navigate("/SelfTestStart", {
      state: { selectedSystems: [systemId], userInfo },
    });
  };

  const handleStartDiagnosis = (systemId) => {
    console.log("Navigating to start diagnosis for system:", systemId);
    navigate("/SelfTestStart", {
      state: { selectedSystems: [systemId], userInfo },
    });
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3000/logout", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message); // 로그아웃 성공 메시지
        // Recoil 상태 업데이트
        setAuthState({
          isLoggedIn: false,
          isExpertLoggedIn: false,
          user: null,
        });
        navigate("/"); // MainPage로 리다이렉트
      } else {
        alert(data.message || "로그아웃 실패");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("로그아웃 요청 중 오류가 발생했습니다.");
    }
  };
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-6 text-black text-center">
        <h1 className="text-4xl font-bold">기관회원 마이페이지</h1>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">등록된 시스템</h2>
          <button
            onClick={handleRegisterClick}
            className="px-4 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700"
          >
            시스템 등록
          </button>
        </div>
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded">
            {errorMessage}
          </div>
        )}
        {loading ? (
          <p className="text-center">로딩 중...</p>
        ) : systems.length === 0 ? (
          <p className="text-center">등록된 시스템이 없습니다.</p>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {systems.map((system) => {
              const isCompleted = assessmentStatuses[system.system_id];
              return (
                <div
                  key={system.system_id}
                  className="p-4 bg-white shadow-lg rounded-md border"
                >
                  <h3 className="font-bold text-lg mb-2">
                    {system.system_name}
                  </h3>
                  {isCompleted ? (
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => handleViewResult(system.system_id)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        결과 보기
                      </button>
                      <button
                        onClick={() => handleEditResult(system.system_id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        수정하기
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartDiagnosis(system.system_id)}
                      className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                    >
                      진단하기
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* 로그아웃 FAB 버튼 */}
      <button
        className="fixed bottom-5 right-5 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 w-[100px] h-[100px] flex items-center justify-center flex-col"
        onClick={handleLogout}
      >
        <FontAwesomeIcon icon={faSignOutAlt} size="2xl" />
        <p>로그아웃</p>
      </button>
    </div>
  );
}

export default Dashboard;
