import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useRecoilState } from "recoil";
import { systemsState } from "../../state/system";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faRedo,
  faChartBar,
} from "@fortawesome/free-solid-svg-icons";
import { format } from "date-fns";

import { toast } from "react-toastify";

function CompletionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { systemId, diagnosisRound } = location.state || {};

  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roundList, setRoundList] = useState(); // 회차 목록
  const [selectedRound, setSelectedRound] = useState(diagnosisRound); // 선택된 회차
  const [systemName, setSystemName] = useState("");

  // ✅ 시스템 상태 가져오기
  const [systems, setSystems] = useRecoilState(systemsState);

  useEffect(() => {
    const fetchRounds = async () => {
      try {
        const res = await axios.get("http://localhost:3000/result/rounds", {
          params: { systemId },
          withCredentials: true,
        });
        console.log(res.data);
        const rounds = res.data;
        setRoundList(rounds);
        // 기본 선택이 없다면 최신 회차 선택
        if (!selectedRound && rounds.length > 0) {
          setSelectedRound(rounds[rounds.length - 1].diagnosis_round);
        }
      } catch (error) {
        console.error("❌ 회차 목록 불러오기 실패:", error);
      }
    };

    fetchRounds();

    // 시스템 이름 설정
    const currentSystem = systems.find(
      (sys) => sys.systems_id === Number(systemId)
    );
    if (currentSystem) {
      setSystemName(currentSystem.system_name);
    }
  }, [systemId, systems, selectedRound]);

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

  const getGradeColor = (grade) => {
    switch (grade) {
      case "S":
        return "#8B5CF6"; // 보라색
      case "A":
        return "#4ADE80"; // 녹색
      case "B":
        return "#22C55E"; // 짙은 녹색
      case "C":
        return "#FACC15"; // 노란색
      case "D":
        return "#EF4444"; // 빨간색
      default:
        return "#94A3B8"; // 기본 회색
    }
  };

  const getGradeText = (grade) => {
    switch (grade) {
      case "S":
        return "최우수";
      case "A":
        return "우수";
      case "B":
        return "양호";
      case "C":
        return "보통";
      case "D":
        return "미흡";
      default:
        return "평가 없음";
    }
  };

  const getGradeBgColor = (grade) => {
    switch (grade) {
      case "S":
        return "bg-purple-100";
      case "A":
        return "bg-green-100";
      case "B":
        return "bg-emerald-100";
      case "C":
        return "bg-yellow-100";
      case "D":
        return "bg-red-100";
      default:
        return "bg-gray-100";
    }
  };

  const handleStartDiagnosis = async () => {
    try {
      // 다음 회차 정보 가져오기
      const res = await axios.get(
        `http://localhost:3000/selftest/round/${systemId}`,
        { withCredentials: true }
      );
      const nextRound = res.data.diagnosis_round;

      // 새 회차로 진단 시작 페이지로 이동
      navigate(`/selftest/start/${systemId}`, {
        state: { diagnosisRound: nextRound },
      });
    } catch (err) {
      console.error("회차 조회 실패", err);
      toast.error("진단 회차를 불러오지 못했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">
            결과를 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow p-6 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">오류 발생</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition-colors w-full"
          >
            대시보드로 이동
          </button>
        </div>
      </div>
    );
  }

  const { score, grade, feedback_status, completed_at } = resultData || {};
  const completedDate = completed_at ? new Date(completed_at) : null;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* 헤더 영역 */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">자가진단 결과</h1>
            <p className="text-sm text-gray-500">{systemName}</p>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="container mx-auto px-4 py-6">
        {/* 회차 선택 카드 */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                진단 회차
              </h2>
              {roundList && roundList.length > 0 ? (
                <div className="flex items-center">
                  <select
                    value={selectedRound}
                    onChange={(e) => setSelectedRound(Number(e.target.value))}
                    className="py-2 px-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {roundList.map((round) => (
                      <option
                        key={round.diagnosis_round}
                        value={round.diagnosis_round}
                      >
                        {round.diagnosis_round}회차
                        {round.completed_at &&
                          ` (${format(
                            new Date(round.completed_at),
                            "yyyy년 MM월 dd일"
                          )})`}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-2 border rounded-md bg-gray-50 inline-block min-w-[180px]">
                  {selectedRound || 1}회차 (현재)
                </div>
              )}
            </div>

            {completedDate && (
              <div className="text-sm text-gray-500">
                <span className="font-medium">진단 완료일:</span>{" "}
                {format(completedDate, "yyyy년 MM월 dd일 HH시 mm분")}
              </div>
            )}
          </div>
        </div>

        {/* 점수 및 결과 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* 점수 및 등급 카드 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
              종합 점수
            </h2>
            <div className="flex flex-col items-center">
              {/* 원형 점수 표시 */}
              <div className="relative w-48 h-48 mb-6">
                {/* 배경 원 */}
                <div className="absolute inset-0 rounded-full border-8 border-gray-100"></div>

                {/* 점수 원 - 데이터에 따라 border 너비 계산 */}
                <div
                  className="absolute inset-0 rounded-full border-8"
                  style={{
                    borderColor: getGradeColor(grade),
                    clipPath: `polygon(0 0, 100% 0, 100% ${score}%, 0 ${score}%)`,
                  }}
                ></div>

                {/* 중앙 점수 표시 */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-gray-800">
                    {score}
                  </span>
                  <span className="text-gray-500 text-sm">/ 100점</span>
                </div>
              </div>

              {/* 등급 표시 */}
              <div
                className={`flex flex-col items-center ${getGradeBgColor(
                  grade
                )} p-3 rounded-lg mb-4`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-2xl font-bold"
                    style={{ color: getGradeColor(grade) }}
                  >
                    {grade} 등급
                  </span>
                  <span className="text-sm px-2 py-1 bg-white rounded-full text-gray-700 font-medium">
                    {getGradeText(grade)}
                  </span>
                </div>
              </div>

              {/* 피드백 상태 표시 */}
              {feedback_status && (
                <div
                  className={`mt-2 text-center px-4 py-1 rounded-full text-sm font-medium
                  ${
                    feedback_status.includes("반영")
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {feedback_status}
                </div>
              )}
            </div>
          </div>

          {/* 등급별 평가 기준 정보 카드 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center">
              <FontAwesomeIcon
                icon={faChartBar}
                className="mr-2 text-blue-600"
              />
              등급별 평가 기준
            </h2>

            <div className="space-y-6">
              {/* S등급 */}
              <div className="flex items-center border-l-4 border-purple-500 bg-gradient-to-r from-purple-50 to-white p-3 rounded-r-lg">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-3xl font-bold text-purple-700">S</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-gray-800">최우수 등급</h3>
                    <span className="text-sm font-semibold bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                      90점 이상
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    개인정보 보호 체계가 완벽히 구축되어 있으며, 모든 법적
                    요구사항을 충족합니다.
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div
                      className="bg-purple-500 h-1.5 rounded-full"
                      style={{ width: "90%" }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* A등급 */}
              <div className="flex items-center border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-white p-3 rounded-r-lg">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-3xl font-bold text-green-700">A</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-gray-800">우수 등급</h3>
                    <span className="text-sm font-semibold bg-green-100 text-green-800 px-3 py-1 rounded-full">
                      80-89점
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    대부분의 개인정보 보호 요구사항이 충족되고, 안전한
                    관리체계가 구축되어 있습니다.
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div
                      className="bg-green-500 h-1.5 rounded-full"
                      style={{ width: "80%" }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* B등급 */}
              <div className="flex items-center border-l-4 border-emerald-500 bg-gradient-to-r from-emerald-50 to-white p-3 rounded-r-lg">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-3xl font-bold text-emerald-700">B</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-gray-800">양호 등급</h3>
                    <span className="text-sm font-semibold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                      70-79점
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    필수적인 개인정보 보호 조치는 이행되었으나, 일부 영역에서
                    개선이 필요합니다.
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full"
                      style={{ width: "70%" }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* C등급 */}
              <div className="flex items-center border-l-4 border-yellow-500 bg-gradient-to-r from-yellow-50 to-white p-3 rounded-r-lg">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-3xl font-bold text-yellow-700">C</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-gray-800">보통 등급</h3>
                    <span className="text-sm font-semibold bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                      60-69점
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    기본적인 보호조치만 이행되어 있으며, 여러 영역에서 개선이
                    필요한 상태입니다.
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div
                      className="bg-yellow-500 h-1.5 rounded-full"
                      style={{ width: "60%" }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* D등급 */}
              <div className="flex items-center border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-white p-3 rounded-r-lg">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-3xl font-bold text-red-700">D</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-gray-800">미흡 등급</h3>
                    <span className="text-sm font-semibold bg-red-100 text-red-800 px-3 py-1 rounded-full">
                      60점 미만
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    개인정보 보호 조치가 미흡하며, 시급한 개선이 필요한
                    상태입니다.
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div
                      className="bg-red-500 h-1.5 rounded-full"
                      style={{ width: "40%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* 요약 및 제안 카드 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
            평가 요약
          </h2>

          <div className="mb-4">
            <p className="text-gray-700 mb-3">
              귀사의 개인정보보호 컴플라이언스 자가진단 결과,
              <span
                className="font-bold"
                style={{ color: getGradeColor(grade) }}
              >
                {" "}
                {grade}등급({getGradeText(grade)}, {score}점)
              </span>
              으로 평가되었습니다.
            </p>
            <p className="text-gray-700">
              {score >= 90
                ? "전반적인 개인정보보호 수준이 매우 우수합니다. 현재의 관리 체계를 계속 유지해 주세요."
                : score >= 80
                ? "전반적인 개인정보보호 수준이 우수합니다. 일부 영역에서 개선이 필요합니다."
                : score >= 70
                ? "개인정보보호 수준이 양호하나, 여러 영역에서 개선이 필요합니다."
                : score >= 60
                ? "개인정보보호 수준이 보통이며, 여러 취약점이 발견되었습니다. 개선이 필요합니다."
                : "개인정보보호 수준이 미흡하며, 시급한 개선이 필요합니다."}
            </p>
          </div>
        </div>

        {/* 액션 버튼 영역 */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex-1 font-medium"
          >
            대시보드로 돌아가기
          </button>

          <button
            onClick={handleStartDiagnosis}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex-1 font-medium flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faRedo} className="mr-2" />
            재진단하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompletionPage;
