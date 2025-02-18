import React, { useEffect, useState } from "react";

import { useRecoilState, useRecoilValue } from "recoil";
import { expertAuthState } from "../../state/authState";
import { systemsState } from "../../state/system";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
const getCsrfToken = async () => {
  try {
    const response = await axios.get("http://localhost:3000/csrf-token", {
      withCredentials: true, // ✅ 세션 쿠키 포함
    });
    return response.data.csrfToken;
  } catch (error) {
    console.error("❌ CSRF 토큰 가져오기 실패:", error);
    return null;
  }
};
function SystemManagement() {
  const expert = useRecoilValue(expertAuthState);
  const [systems, setSystems] = useRecoilState(systemsState);
  const [csrfToken, setCsrfToken] = useState("");
  const navigate = useNavigate();
  console.log(systems);
  // ✅ 전문가가 배정된 시스템 불러오기
  useEffect(() => {
    const fetchCsrfToken = async () => {
      const token = await getCsrfToken();
      setCsrfToken(token);
    };
    fetchCsrfToken();
  }, []);

  useEffect(() => {
    const fetchAssignedSystems = async () => {
      if (!expert.user || !expert.user.id) return;

      try {
        const response = await axios.get(
          `http://localhost:3000/assigned-systems?expertId=${expert.user.id}`,
          { withCredentials: true }
        );
        console.log("✅ 매칭된 시스템 데이터:", response.data);

        setSystems(response.data.data || []);
      } catch (error) {
        console.error("❌ 매칭된 시스템 가져오기 실패:", error);
      }
    };

    if (expert.isLoggedIn) {
      fetchAssignedSystems();
    }
  }, [expert, setSystems]);

  // ✅ 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/logout/expert",
        {},
        { withCredentials: true, headers: { "X-CSRF-Token": csrfToken } }
      );

      if (response.status === 200) {
        alert(response.data.msg || "로그아웃 성공");
        navigate("/login");
      } else {
        alert("로그아웃 실패");
      }
    } catch (error) {
      console.error("❌ 로그아웃 요청 실패:", error);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  // ✅ 평가 결과 보기
  const handleViewResults = async (system) => {
    try {
      const response = await axios.get("http://localhost:3000/system-owner", {
        params: { systemId: system.systems_id },
        withCredentials: true,
      });

      const userId = response.data.userId;

      navigate("/completion", {
        state: {
          systemId: system.systems_id,
          userId: userId, // ✅ 시스템 소유자의 userId를 전달
          userType: "전문가",
        },
      });
    } catch (error) {
      console.error("❌ 시스템 소유자 조회 실패:", error);
      alert("시스템 소유자 조회 중 오류가 발생했습니다.");
    }
  };

  // ✅ 피드백 작성 후 상태 업데이트
  const handleProvideFeedback = async (system) => {
    console.log("🟢 [handleProvideFeedback] 시스템 ID:", system.systems_id);

    await navigate("/DiagnosisfeedbackPage", {
      state: {
        userId: expert.user?.id,
        systemId: system.systems_id,
      },
    });

    // ✅ UI 상태 즉시 변경 (반영 후로 가정)
    setSystems((prevSystems) =>
      prevSystems.map((s) =>
        s.systems_id === system.systems_id
          ? { ...s, feedback_status: "전문가 자문이 반영되었습니다" }
          : s
      )
    );

    console.log("🟢 [handleProvideFeedback] UI 상태 변경 완료");

    // ✅ 백엔드 업데이트 요청
    try {
      const updateResponse = await axios.post(
        "http://localhost:3000/selftest/qualitative/update-status",
        { systemId: system.systems_id },
        { withCredentials: true, headers: { "X-CSRF-Token": csrfToken } }
      );

      console.log(
        "✅ [handleProvideFeedback] 백엔드 업데이트 응답:",
        updateResponse.data
      );

      // ✅ 상태 갱신 후 데이터 다시 불러오기
      setTimeout(async () => {
        const response = await axios.get(
          `http://localhost:3000/assigned-systems?expertId=${expert.user.id}`,
          { withCredentials: true }
        );

        console.log(
          "✅ [handleProvideFeedback] 시스템 데이터 갱신됨:",
          response.data
        );

        setSystems(response.data.data);
      }, 1000);
    } catch (error) {
      console.error(
        "❌ [handleProvideFeedback] 시스템 데이터 갱신 실패:",
        error
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-[1000px] flex flex-col items-center">
        <header className="w-full h-[70px] bg-blue-600 flex items-center justify-between px-5 text-white mb-6 shadow-md rounded-lg">
          <h1 className="text-lg font-semibold">전문가 대시보드</h1>
        </header>

        <div className="bg-white rounded-lg w-full min-h-[500px] p-5 shadow-md">
          <h2 className="text-2xl font-semibold text-gray-700 mb-5 text-center">
            배정된 시스템 관리
          </h2>
          <table className="table-auto w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 border text-left font-semibold">시스템명</th>
                <th className="p-3 border text-left font-semibold">기관명</th>
                <th className="p-3 border text-left font-semibold">
                  피드백 상태
                </th>
                <th className="p-3 border text-center font-semibold">관리</th>
              </tr>
            </thead>
            <tbody>
              {systems.length > 0 ? (
                systems.map((system) => (
                  <tr key={system.systems_id} className="hover:bg-gray-50">
                    <td className="p-3 border">{system.system_name}</td>
                    <td className="p-3 border">{system.institution_name}</td>
                    <td className="p-3 border text-center">
                      {system.feedback_status ===
                      "전문가 자문이 반영되었습니다" ? (
                        <span className="text-green-600 font-bold">
                          반영 후
                        </span>
                      ) : (
                        <span className="text-red-600 font-bold">반영 전</span>
                      )}
                    </td>
                    <td className="p-3 border text-center">
                      <button
                        onClick={() => handleViewResults(system)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 mr-2"
                      >
                        결과 보기
                      </button>
                      <button
                        onClick={() => handleProvideFeedback(system)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        피드백 하기
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center p-3 text-gray-500">
                    배정된 시스템이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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

export default SystemManagement;
