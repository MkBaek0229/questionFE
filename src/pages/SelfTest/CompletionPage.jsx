import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useRecoilState } from "recoil";
import { systemsState } from "../../state/system";
import CategoryScoresChart from "../../components/Chart/CategoryScoresChart";

function CompletionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { systemId, diagnosisRound } = location.state || {};

  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roundList, setRoundList] = useState([]); // 회차 목록
  const [selectedRound, setSelectedRound] = useState(diagnosisRound); // 선택된 회차

  // ✅ 시스템 상태 가져오기
  const [systems, setSystems] = useRecoilState(systemsState);
  console.log("🟢 Recoil 상태 (systemsState) 확인:", systems);

  useEffect(() => {
    const fetchRounds = async () => {
      try {
        const res = await axios.get("http://localhost:3000/result/rounds", {
          params: { systemId },
          withCredentials: true,
        });
        const rounds = res.data;
        setRoundList(rounds);
        // 기본 선택이 없다면 최신 회차 선택
        if (!selectedRound && rounds.length > 0) {
          setSelectedRound(rounds[rounds.length - 1]);
        }
      } catch (error) {
        console.error("❌ 회차 목록 불러오기 실패:", error);
      }
    };

    fetchRounds();
  }, [systemId]);

  useEffect(() => {
    if (!systemId || !selectedRound) return;

    const fetchResultByRound = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/result/round-result",
          {
            params: { systemId, diagnosisRound: selectedRound },
            withCredentials: true,
          }
        );
        setResultData(response.data);
      } catch (error) {
        console.error("❌ 진단 결과 불러오기 실패:", error);
        setError("🚨 결과 데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchResultByRound();
  }, [systemId, selectedRound]);

  const getGradeClassName = (grade) => {
    switch (grade) {
      case "S":
        return "bg-green-100 text-green-600"; // 초록색
      case "A":
        return "bg-lime-100 text-lime-600"; // 연두색
      case "B":
        return "bg-yellow-100 text-yellow-600"; // 노란색
      case "C":
        return "bg-orange-100 text-orange-600"; // 주황색
      case "D":
        return "bg-red-100 text-red-600"; // 빨간색
      default:
        return "bg-gray-100 text-gray-600"; // 기본 회색
    }
  };

  // ✅ 시스템 상태 업데이트 함수 추가
  const updateSystemStatus = async (systemId) => {
    try {
      const response = await axios.get(
        "http://localhost:3000/assessment/status",
        {
          withCredentials: true,
        }
      );

      console.log("✅ [DEBUG] 최신 진단 상태:", response.data);

      setSystems((prevSystems) =>
        prevSystems.map((system) =>
          system.systems_id === systemId
            ? { ...system, completed: true } // ✅ 상태 업데이트
            : system
        )
      );
    } catch (error) {
      console.error("❌ 진단 상태 업데이트 실패:", error);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-10">
        <p className="text-lg font-semibold">결과를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-10">
        <p className="text-lg font-bold">오류 발생</p>
        <p className="text-gray-700">{error}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
        >
          대시보드로 이동
        </button>
      </div>
    );
  }

  const { score, grade } = resultData || {};

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center">
      <div className="container mx-auto max-w-4xl bg-white mt-10 p-6 rounded-lg shadow-lg">
        {roundList.length > 1 && (
          <div className="mb-6 text-center">
            <label className="mr-2 font-medium">회차 선택:</label>
            <select
              value={selectedRound}
              onChange={(e) => setSelectedRound(Number(e.target.value))}
              className="p-2 border rounded-md"
            >
              {roundList.map((round) => (
                <option key={round} value={round}>
                  {round}회차
                </option>
              ))}
            </select>
          </div>
        )}

        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          자가진단 결과
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-blue-100 rounded-md text-center">
            <h3 className="text-lg font-bold text-blue-600">점수</h3>
            <p className="text-3xl font-extrabold">{score ?? "N/A"}</p>
          </div>
          <div
            className={`p-4 rounded-md text-center ${getGradeClassName(grade)}`}
          >
            <h3 className="text-lg font-bold text-green-600">등급</h3>
            <p className="text-3xl font-extrabold">{grade ?? "N/A"}</p>
          </div>
        </div>

        {/* ✅ 보호 수준 그래프 추가 */}
        <div className="flex justify-center mb-6">
          <CategoryScoresChart systemId={systemId} />
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              navigate("/dashboard");
            }}
            className="px-6 py-2 bg-gray-400 text-white rounded-md shadow hover:bg-gray-500"
          >
            대시보드로 이동
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompletionPage;
