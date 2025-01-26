import React, { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { expertAuthState } from "../../state/authState";
import { systemsState } from "../../state/system";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

function SystemManagement() {
  const expert = useRecoilValue(expertAuthState);
  const [systems, setSystems] = useRecoilState(systemsState);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignedSystems = async () => {
      if (!expert.user || !expert.user.id) return;

      try {
        const response = await axios.get(
          `http://localhost:3000/assigned-systems?expertId=${expert.user.id}`,
          { withCredentials: true }
        );
        console.log("✅ 매칭된 시스템 데이터:", response.data);

        const uniqueSystems = response.data.data.filter(
          (value, index, self) =>
            index === self.findIndex((t) => t.system_id === value.system_id)
        );
        setSystems(uniqueSystems || []);
      } catch (error) {
        console.error("❌ 매칭된 시스템 가져오기 실패:", error);
      }
    };

    if (expert.isLoggedIn) {
      fetchAssignedSystems();
    }
  }, [expert, setSystems]);

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/logout/expert",
        {},
        { withCredentials: true }
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

  const handleViewResults = (system) => {
    navigate("/completion", {
      state: {
        systemId: system.system_id,
        userId: expert.user?.id,
        userType: "전문가", // 전문가로 접근했음을 표시
      },
    });
  };

  const handleProvideFeedback = (system) => {
    navigate("/DiagnosisfeedbackPage", {
      state: {
        userId: expert.user?.id,
        systemId: system.system_id,
      },
    });
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
                  <tr key={system.system_id} className="hover:bg-gray-50">
                    <td className="p-3 border">{system.system_name}</td>
                    <td className="p-3 border">{system.institution_name}</td>
                    <td className="p-3 border text-center">
                      {system.feedback_status ===
                      "전문가 자문이 반영되었습니다" ? (
                        <span className="text-green-600">
                          {system.feedback_status}
                        </span>
                      ) : (
                        <span className="text-red-600">반영 전</span>
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
