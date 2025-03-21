// Dashboard.js
import React, { useEffect } from "react";
import axiosInstance from "../../../axiosInstance";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { authState } from "../../state/authState";
import {
  assessmentStatusesState,
  loadingState,
  errorMessageState,
} from "../../state/dashboardState";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

import { systemsState } from "../../state/system";
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
        axiosInstance.get("http://localhost:3000/system/systems", {
          withCredentials: true,
        }),
        axiosInstance.get("http://localhost:3000/result/assessment-statuses", {
          withCredentials: true,
        }),
      ]);

      console.log("✅ [FETCH] 시스템 응답:", systemsResponse.data);

      // 🔹 데이터 확인
      if (systemsResponse.data.length > 0) {
        console.log("🔍 시스템 데이터 샘플:", systemsResponse.data[0]); // ✅ user_id 포함 여부 확인
      }

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

  const handleDeleteSystem = async (systemId, userId) => {
    console.log("🗑️ 삭제 요청 systemId:", systemId, "userId:", userId);
    console.log("🔍 현재 로그인한 사용자 ID:", auth.user?.id);

    if (!userId) {
      console.error("🚨 [ERROR] system.user_id가 undefined입니다!");
      alert("🚨 시스템 정보를 불러오는 중 문제가 발생했습니다.");
      return;
    }

    if (auth.user?.id !== userId) {
      alert("🚨 해당 시스템을 삭제할 권한이 없습니다.");
      return;
    }

    const confirmDelete = window.confirm(
      "⚠️ 정말 이 시스템을 삭제하시겠습니까?"
    );
    if (!confirmDelete) return;

    try {
      console.log("🚀 [삭제] CSRF 토큰 가져오는 중...");
      const csrfToken = await getCsrfToken(); // 🔥 CSRF 토큰 가져오기

      if (!csrfToken) {
        alert("CSRF 토큰을 가져오는 데 실패했습니다.");
        return;
      }
      const response = await axiosInstance.delete(
        `http://localhost:3000/system/${systemId}`, // ✅ URL 확인
        { withCredentials: true, headers: { "X-CSRF-Token": csrfToken } }
      );

      console.log("✅ 시스템 삭제 응답:", response.data);
      alert("✅ 시스템이 삭제되었습니다.");

      setSystems((prevSystems) =>
        prevSystems.filter((system) => system.systems_id !== systemId)
      );
    } catch (error) {
      console.error("❌ 시스템 삭제 실패:", error);
      alert(
        `🚨 시스템 삭제 중 오류 발생: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

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

  // ★ 새로운 진단보기 핸들러
  const handleViewDiagnosis = (systemId) => {
    console.log("🔎 진단보기 요청:", systemId);
    navigate("/DiagnosisView", { state: { systemId, userId: auth.user.id } });
  };

  const handleLogout = async () => {
    try {
      console.log("🚪 로그아웃 요청 중...");
      console.log("🚀 [로그아웃] CSRF 토큰 가져오는 중...");
      const csrfToken = await getCsrfToken(); // 🔥 CSRF 토큰 가져오기

      if (!csrfToken) {
        alert("CSRF 토큰을 가져오는 데 실패했습니다.");
        return;
      }
      const response = await fetch("http://localhost:3000/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: { "X-CSRF-Token": csrfToken },
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
        navigate("/login");
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
          <div className="overflow-x-auto">
            <table className="table-auto w-full border border-gray-300 rounded-lg shadow-md">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left">시스템 이름</th>
                  <th className="px-4 py-2 text-left">진단 상태</th>
                  <th className="px-4 py-2 text-left">관리</th>
                </tr>
              </thead>
              <tbody>
                {systems.map((system) => {
                  const isCompleted = assessmentStatuses[system.systems_id];
                  return (
                    <tr
                      key={system.systems_id}
                      className="border-b border-gray-300"
                    >
                      <td className="px-4 py-2">{system.system_name}</td>
                      <td className="px-4 py-2">
                        {isCompleted ? (
                          <span className="text-green-600 font-semibold">
                            완료
                          </span>
                        ) : (
                          <span className="text-yellow-600 font-semibold">
                            미완료
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex space-x-2">
                          {isCompleted ? (
                            <>
                              <button
                                onClick={() =>
                                  handleViewResult(system.systems_id)
                                }
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                              >
                                결과 보기
                              </button>
                              <button
                                onClick={() =>
                                  handleEditResult(system.systems_id)
                                }
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                              >
                                수정하기
                              </button>
                              <button
                                onClick={() =>
                                  handleViewDiagnosis(system.systems_id)
                                }
                                className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                              >
                                진단보기
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() =>
                                handleStartDiagnosis(system.systems_id)
                              }
                              className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                            >
                              진단하기
                            </button>
                          )}
                          <button
                            onClick={() =>
                              handleDeleteSystem(
                                system.systems_id,
                                system.user_id
                              )
                            } // ✅ user_id 넘기기
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 flex items-center text-sm"
                          >
                            <FontAwesomeIcon icon={faTrash} className="mr-1" />
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
