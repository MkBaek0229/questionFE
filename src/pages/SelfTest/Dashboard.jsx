import React, { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { authState } from "../../state/authState";
import {
  systemsState,
  assessmentStatusesState,
  loadingState,
  errorMessageState,
} from "../../state/dashboardState";

function Dashboard() {
  const [systems, setSystems] = useRecoilState(systemsState);
  const [assessmentStatuses, setAssessmentStatuses] = useRecoilState(
    assessmentStatusesState
  );
  const [loading, setLoading] = useRecoilState(loadingState);
  const [errorMessage, setErrorMessage] = useRecoilState(errorMessageState);
  const auth = useRecoilValue(authState);
  const navigate = useNavigate();
  const setAuthState = useSetRecoilState(authState);

  const fetchSystems = async () => {
    setErrorMessage("");
    setLoading(true);
    try {
      console.log("⏳ [FETCH] 시스템 정보 요청 중...");
      const [systemsResponse, statusResponse] = await Promise.all([
        axios.get("http://localhost:3000/systems", { withCredentials: true }),
        axios.get("http://localhost:3000/assessment/status", {
          withCredentials: true,
        }),
      ]);

      console.log("✅ [FETCH] 시스템 응답:", systemsResponse.data);
      console.log("✅ [FETCH] 진단 상태 응답:", statusResponse.data);

      setSystems(systemsResponse.data);
      setAssessmentStatuses(statusResponse.data);
    } catch (error) {
      console.error("❌ 데이터 조회 실패:", error);
      setErrorMessage("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystems();
  }, [auth, navigate]);

  const handleRegisterClick = () => {
    if (!auth.user || !auth.user.id) {
      alert("🚨 사용자 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }
    navigate("/system-register");
  };

  const handleViewResult = (systemId) => {
    console.log("📂 결과 보기 요청:", systemId);
    navigate("/completion", {
      state: { systemId, userId: auth.user.id, userType: "기관회원" },
    });
  };

  const handleEditResult = (systemId) => {
    console.log("✏️ 수정 요청:", systemId);
    navigate("/SelfTestStart", {
      state: { selectedSystems: [systemId], userInfo: auth.user },
    });
  };

  const handleStartDiagnosis = (systemId) => {
    console.log("🔍 진단 시작 요청:", systemId);
    navigate("/SelfTestStart", {
      state: { selectedSystems: [systemId], userInfo: auth.user },
    });
  };

  const handleLogout = async () => {
    try {
      console.log("🚪 로그아웃 요청 중...");
      const response = await fetch("http://localhost:3000/logout", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✅ 로그아웃 성공:", data.message);
        alert(data.message);
        setAuthState({
          isLoggedIn: false,
          isExpertLoggedIn: false,
          user: null,
        });
        navigate("/");
      } else {
        console.error("❌ 로그아웃 실패:", data.message);
        alert(data.message || "로그아웃 실패");
      }
    } catch (error) {
      console.error("❌ 로그아웃 요청 오류:", error);
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
            className={`px-4 py-2 font-bold rounded ${
              auth.user
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-400 text-gray-700 cursor-not-allowed"
            }`}
            disabled={!auth.user}
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
