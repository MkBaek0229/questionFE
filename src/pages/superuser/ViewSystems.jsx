import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../axiosInstance";
import { useRecoilState } from "recoil";

import { systemsState, selectedSystemState } from "../../state/system"; // Recoil로 상태 관리
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faArrowLeft,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

// ✅ CSRF 토큰 가져오기
const getCsrfToken = async () => {
  try {
    const response = await axiosInstance.get(
      "http://localhost:3000/csrf-token",
      {
        withCredentials: true,
      }
    );
    return response.data.csrfToken;
  } catch (error) {
    console.error("❌ CSRF 토큰 가져오기 실패:", error);
    return null;
  }
};

function ViewSystems() {
  const navigate = useNavigate();
  const [systems, setSystems] = useRecoilState(systemsState); // Recoil로 상태 관리
  const [csrfToken, setCsrfToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedSystem, setSelectedSystem] =
    useRecoilState(selectedSystemState);

  // ✅ 시스템 목록 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getCsrfToken();
        setCsrfToken(token);

        const response = await axiosInstance.get(
          "http://localhost:3000/all-systems",
          {
            withCredentials: true,
          }
        );

        setSystems(response.data.data || []);
      } catch (error) {
        console.error("❌ 시스템 목록 불러오기 오류:", error);
        setErrorMessage("시스템 목록을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setSystems]);

  // ✅ 시스템 삭제 기능
  const handleDeleteSystem = async (systemId) => {
    const confirmDelete = window.confirm("정말 이 시스템을 삭제하시겠습니까?");
    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(
        `http://localhost:3000/superuser/systems/${systemId}`,
        {
          withCredentials: true,
          headers: { "X-CSRF-Token": csrfToken },
        }
      );

      alert("✅ 시스템이 삭제되었습니다.");

      // ✅ 상태 업데이트 (삭제된 시스템 제거)
      setSystems((prevSystems) =>
        prevSystems.filter((system) => system.systems_id !== systemId)
      );
    } catch (error) {
      console.error("❌ 시스템 삭제 실패:", error);
      alert("🚨 시스템 삭제 중 오류가 발생했습니다.");
    }
  };
  // ✅ 시스템 클릭 시 선택 & 이동 (유저 ID 포함)
  const handleSelectSystem = (system) => {
    setSelectedSystem(system.systems_id);
    setTimeout(() => {
      navigate("/SuperDiagnosisView", {
        state: {
          systemId: system.systems_id,
          systemName: system.system_name,
          userId: system.user_id, // ✅ 작성자 ID 추가됨
        },
      });
    }, 100);
  };
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
      <div className="max-w-5xl w-full bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 flex items-center justify-center">
          <FontAwesomeIcon icon={faBuilding} className="text-blue-600 mr-3" />
          전체 시스템 목록
        </h1>

        {/* ✅ 오류 메시지 표시 */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
            {errorMessage}
          </div>
        )}

        {/* ✅ 로딩 중일 때 */}
        {loading ? (
          <p className="text-center text-lg font-semibold text-gray-600">
            데이터 불러오는 중...
          </p>
        ) : (
          <>
            {/* ✅ 시스템 목록 */}
            {systems.length > 0 ? (
              <ul className="space-y-4">
                {systems.map((system) => (
                  <li
                    key={system.systems_id}
                    className="p-6 border rounded-lg shadow-md bg-gray-50 flex justify-between items-center transition-transform transform hover:scale-105 cursor-pointer"
                    onClick={() => handleSelectSystem(system)}
                  >
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {system.system_name}
                      </h2>
                      <p className="text-gray-600">
                        기관명: {system.institution_name}
                      </p>
                      <p className="text-gray-500 text-sm">
                        작성자 ID: {system.user_id}
                      </p>{" "}
                      {/* ✅ 유저 ID 표시 */}
                    </div>

                    {/* ✅ 삭제 버튼 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSystem(system.systems_id);
                      }}
                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center text-sm"
                    >
                      {" "}
                      <FontAwesomeIcon icon={faTrash} className="mr-1" />
                      삭제
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center">
                📌 등록된 시스템이 없습니다.
              </p>
            )}
          </>
        )}

        {/* ✅ 뒤로가기 버튼 */}
        <button
          onClick={() => navigate("/SuperDashboard")}
          className="mt-6 w-full px-5 py-3 bg-blue-600 text-white rounded-md font-semibold text-lg flex items-center justify-center hover:bg-blue-700 transition-all"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-3" />
          대시보드로 돌아가기
        </button>
      </div>
    </div>
  );
}

export default ViewSystems;
