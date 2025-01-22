import React, { useState, useEffect } from "react";
import axios from "axios";

function SuperUserPage() {
  const [systems, setSystems] = useState([]);
  const [managers, setManagers] = useState([]);
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [selectedManager, setSelectedManager] = useState(null);

  useEffect(() => {
    // 시스템 데이터 가져오기
    const fetchSystems = async () => {
      try {
        const response = await axios.get("http://localhost:3000/all-systems", {
          withCredentials: true,
        });
        console.log("📋 [FETCH SYSTEMS] 시스템 데이터:", response.data);
        setSystems(response.data.data); // 시스템 데이터 설정
      } catch (error) {
        console.error("❌ [FETCH SYSTEMS] 시스템 데이터 가져오기 실패:", error);
      }
    };

    // 관리자 데이터 가져오기
    const fetchManagers = async () => {
      try {
        const response = await axios.get("http://localhost:3000/all-expert", {
          withCredentials: true,
        });
        console.log("📋 [FETCH MANAGERS] 관리자 데이터:", response.data);
        setManagers(response.data.data); // 관리자 데이터 설정
      } catch (error) {
        console.error(
          "❌ [FETCH MANAGERS] 관리자 데이터 가져오기 실패:",
          error
        );
      }
    };

    fetchSystems();
    fetchManagers();
  }, []);

  // 시스템과 관리자 매칭
  const handleAssignManager = async () => {
    console.log("✅ 선택된 시스템 ID:", selectedSystem);
    console.log("✅ 선택된 관리자 ID:", selectedManager);

    if (!selectedSystem || !selectedManager) {
      alert("시스템과 관리자를 선택하세요.");
      return;
    }

    const requestData = {
      systemId: selectedSystem,
      expertIds: [selectedManager],
    };
    console.log("📩 [ASSIGN MANAGER] 매칭 요청 데이터:", requestData);

    try {
      const response = await axios.post(
        "http://localhost:3000/match-experts",
        requestData,
        { withCredentials: true }
      );
      console.log("✅ [ASSIGN MANAGER] 매칭 성공:", response.data);
      alert("관리자가 시스템에 성공적으로 매칭되었습니다.");
    } catch (error) {
      console.error(
        "❌ [ASSIGN MANAGER] 관리자 매칭 실패:",
        error.response?.data || error
      );
      alert(error.response?.data?.msg || "관리자 매칭 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 py-10">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 shadow-md">
        <h2 className="text-2xl font-bold mb-6">슈퍼유저 관리 페이지</h2>

        {/* 시스템 선택 */}
        <div className="mb-4">
          <label className="block text-lg font-medium mb-2">시스템 선택</label>
          <select
            value={selectedSystem || ""}
            onChange={(e) => {
              console.log("✅ 선택된 시스템:", e.target.value); // 디버깅 로그 추가
              setSelectedSystem(e.target.value);
            }}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            <option value="" disabled>
              시스템을 선택하세요
            </option>
            {systems.map((system) => (
              <option
                key={`system-${system.system_id}`}
                value={system.system_id} // system_id를 value로 설정
              >
                {system.system_name} ({system.institution_name})
              </option>
            ))}
          </select>
        </div>

        {/* 관리자 선택 */}
        <div className="mb-4">
          <label className="block text-lg font-medium mb-2">관리자 선택</label>
          <select
            value={selectedManager || ""}
            onChange={(e) => setSelectedManager(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            <option value="" disabled>
              관리자를 선택하세요
            </option>
            {managers.map((manager) => (
              <option
                key={`manager-${manager.expert_id}`}
                value={manager.expert_id}
              >
                {manager.expert_name} ({manager.email})
              </option>
            ))}
          </select>
        </div>

        {/* 매칭 버튼 */}
        <button
          onClick={handleAssignManager}
          className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          매칭 저장
        </button>
      </div>
    </div>
  );
}

export default SuperUserPage;
