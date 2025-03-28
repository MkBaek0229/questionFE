import React, { useEffect, useState } from "react";
import axiosInstance from "../../../axiosInstance";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { authState } from "../../state/authState";
import {
  assessmentStatusesState,
  loadingState,
  errorMessageState,
} from "../../state/dashboardState";
import { systemsState } from "../../state/system";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDay,
  faChartBar,
  faCircleCheck,
  faCircleInfo,
  faClipboardList,
  faPlay,
  faSignOutAlt,
  faTimes,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import RecentActivities from "./RecentActivities";
import { format } from "date-fns";
import { toast } from "react-toastify"; // toast 추가

function Dashboard() {
  const [summaryList, setSummaryList] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  const [activeMenuId, setActiveMenuId] = useState(null);

  const [systems, setSystems] = useRecoilState(systemsState);
  const [assessmentStatuses, setAssessmentStatuses] = useRecoilState(
    assessmentStatusesState
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const [loading, setLoading] = useRecoilState(loadingState);
  const [errorMessage, setErrorMessage] = useRecoilState(errorMessageState);
  const auth = useRecoilValue(authState);
  const setAuthState = useSetRecoilState(authState);
  const navigate = useNavigate();

  const [activeDetailCard, setActiveDetailCard] = useState(null);
  const [activeTab, setActiveTab] = useState("quantitative");

  // 메뉴 토글 함수
  const toggleMenu = (systemId) => {
    setActiveMenuId(activeMenuId === systemId ? null : systemId);
  };

  // CSRF 토큰 가져오는 함수
  const getCsrfToken = async () => {
    try {
      const res = await axiosInstance.get("http://localhost:3000/csrf-token", {
        withCredentials: true,
      });
      return res.data.csrfToken;
    } catch (error) {
      console.error("❌ CSRF 토큰 가져오기 실패:", error);
      toast.error("보안 토큰을 가져오는데 실패했습니다.");
      return null;
    }
  };

  // 시스템 삭제 함수
  const handleDeleteSystem = async (systemId) => {
    if (window.confirm("정말로 이 시스템을 삭제하시겠습니까?")) {
      try {
        const csrfToken = await getCsrfToken();
        if (!csrfToken) return;

        await axiosInstance.delete(
          `http://localhost:3000/system/system/${systemId}`,
          {
            withCredentials: true,
            headers: {
              "X-CSRF-Token": csrfToken,
            },
          }
        );

        toast.success("시스템이 삭제되었습니다.");
        fetchSystems();
        fetchSystemSummary();
      } catch (err) {
        console.error("시스템 삭제 실패", err);
        toast.error("시스템 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const fetchSystems = async () => {
    setErrorMessage("");
    setLoading(true);
    try {
      const [systemsResponse, statusResponse] = await Promise.all([
        axiosInstance.get("http://localhost:3000/system/systems", {
          withCredentials: true,
        }),
        axiosInstance.get("http://localhost:3000/result/assessment-statuses", {
          withCredentials: true,
        }),
      ]);
      setSystems(systemsResponse.data);
      setAssessmentStatuses(statusResponse.data);

      console.log(systemsResponse.data);
    } catch (error) {
      console.error("❌ 데이터 조회 실패:", error);
      setErrorMessage("데이터를 불러오는 중 오류가 발생했습니다.");
      toast.error("시스템 데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemSummary = async () => {
    try {
      const res = await axiosInstance.get(
        "http://localhost:3000/system/summary",
        {
          withCredentials: true,
        }
      );

      setSummaryList(res.data);
    } catch (error) {
      console.error("✅ 시스템 요약 정보 불러오기 실패:", error);
      toast.error("시스템 요약 정보를 불러오는데 실패했습니다.");
    }
  };

  useEffect(() => {
    fetchSystems();
    fetchSystemSummary();
    setCurrentCardIndex(0);
  }, [auth, selectedMenu]);

  const handleLogout = async () => {
    try {
      const csrfToken = await getCsrfToken();
      if (!csrfToken) return;

      const response = await fetch("http://localhost:3000/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: { "X-CSRF-Token": csrfToken },
      });
      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setAuthState({
          isLoggedIn: false,
          isExpertLoggedIn: false,
          user: null,
        });
        navigate("/login");
      } else {
        toast.error(data.message || "로그아웃 실패");
      }
    } catch (error) {
      toast.error("로그아웃 요청 중 오류 발생");
    }
  };

  const systemList = Array.isArray(systems) ? systems : systems?.systems || [];
  const completedCount =
    Object.values(assessmentStatuses).filter(Boolean).length;
  const avgRate = systemList.length
    ? Math.round(
        systemList.reduce((acc, cur) => acc + (cur.compliance_rate || 0), 0) /
          systemList.length
      )
    : 0;

  const diagnosedSystemIds = summaryList.map((s) => s.systems_id);
  const unDiagnosedSystems = systemList.filter(
    (system) => !diagnosedSystemIds.includes(system.systems_id)
  );

  // 세부평가 버튼 클릭 시 추가 정보 로딩 함수
  const fetchDetailedAssessment = async (systemId) => {
    try {
      // 현재 로그인한 사용자 ID
      const userId = auth.user?.id;
      if (!userId) return;

      const [quantitativeRes, qualitativeRes] = await Promise.all([
        axiosInstance.get(
          `http://localhost:3000/selftest/quantitative-responses/${systemId}`,
          { withCredentials: true }
        ),
        axiosInstance.get(
          `http://localhost:3000/selftest/qualitative-responses/${systemId}`,
          { withCredentials: true }
        ),
      ]);

      // 응답 데이터를 기존 summaryList에 추가
      setSummaryList((prev) =>
        prev.map((system) =>
          system.systems_id === systemId
            ? {
                ...system,
                detailedQuantitative: quantitativeRes.data,
                detailedQualitative: qualitativeRes.data,
              }
            : system
        )
      );
    } catch (error) {
      console.error("세부 평가 데이터 로딩 실패:", error);
      toast.error("세부 평가 데이터를 불러오는데 실패했습니다.");
    }
  };

  // 자가진단 시작 핸들러
  const handleStartDiagnosis = async (systemId) => {
    try {
      const res = await axiosInstance.get(
        `http://localhost:3000/selftest/round/${systemId}`,
        { withCredentials: true }
      );
      const nextRound = res.data.diagnosis_round;
      navigate(`/selftest/start/${systemId}`, {
        state: { diagnosisRound: nextRound },
      });
    } catch (err) {
      console.error("회차 조회 실패", err);
      toast.error("진단 회차를 불러오지 못했습니다."); // alert → toast
    }
  };

  // 결과 보기 핸들러
  const handleViewResults = async (systemId) => {
    try {
      const res = await axiosInstance.get(
        `http://localhost:3000/result/rounds`,
        {
          params: { systemId },
          withCredentials: true,
        }
      );

      const rounds = res.data;
      if (!rounds || rounds.length === 0) {
        toast.warn("완료된 진단 결과가 없습니다."); // alert → toast
        return;
      }

      const latestRound = rounds[0].diagnosis_round;
      navigate("/completion", {
        state: {
          systemId: systemId,
          diagnosisRound: latestRound,
        },
      });
    } catch (err) {
      console.error("회차 조회 실패", err);
      toast.error("진단 회차를 불러오지 못했습니다."); // alert → toast
    }
  };

  // Dashboard 컴포넌트 내 다른 useEffect 아래에 추가
  useEffect(() => {
    // 드롭다운 외부 클릭 시 닫기
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest(".dropdown-container")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const renderDashboard = () => (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">대시보드</h1>
          <p className="text-gray-500 text-sm mt-1">
            시스템 현황 및 자가진단 결과를 확인하세요.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-blue-500 border  p-4">
          <p className="text-sm text-white">등록된 시스템</p>
          <h2 className="text-2xl font-bold mt-2 text-white">
            {systemList.length}
          </h2>
          <p className="text-xs text-white">전체 시스템 수</p>
        </div>
        <div className="bg-green-500  border  p-4">
          <p className="text-sm text-white">완료된 자가진단</p>
          <h2 className="text-2xl font-bold mt-2 text-white">
            {completedCount}
          </h2>
          <p className="text-xs text-white">총 {systemList.length}개 중</p>
        </div>
        <div className="bg-red-500 border  p-4">
          <p className="text-sm text-white">평균 점수</p>
          <h2 className="text-2xl font-bold mt-2 text-white">{avgRate}%</h2>
          <p className="text-xs text-white">전월 대비 +5%</p>
        </div>
        <div className="bg-blue-400 border  p-4">
          <p className="text-sm text-white">피드백 대기</p>
          <h2 className="text-2xl font-bold mt-2 text-white">1</h2>
          <p className="text-xs text-white">전문가 피드백 대기 중</p>
        </div>
      </div>

      <RecentActivities />
    </>
  );

  const renderSystemManagement = () => (
    <>
      <h1 className="text-3xl font-bold">시스템 관리</h1>
      <p className="text-gray-500 text-sm mt-1 mb-4">
        자가진단 평가를 위한 시스템을 등록하세요.
      </p>
      <button
        className="bg-blue-500 text-white w-full py-2 text-[18px] mb-4 hover:bg-blue-600 font-bold"
        onClick={() => navigate("/system-register")}
      >
        + 시스템 추가
      </button>
      <div className="flex gap-6">
        <div className="flex-1">
          <span className="flex text-lg font-bold gap-2">
            <p>신규 등록 시스템</p>
          </span>
          <div className="mt-4 grid grid-cols-1 gap-6">
            {unDiagnosedSystems.map((system) => (
              <div
                key={system.systems_id}
                className="p-4 bg-white border-t-8 border-green-500 shadow-lg"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-2xl font-bold">{system.system_name}</h4>
                  <div className="relative">
                    <button
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => toggleMenu(system.systems_id)} // React 상태로 관리
                    >
                      ⋮
                    </button>
                    {activeMenuId === system.systems_id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-10">
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-100"
                          onClick={() => handleDeleteSystem(system.systems_id)}
                        >
                          <FontAwesomeIcon
                            icon={faTrash}
                            style={{ color: "#ff0000" }}
                            className="mr-2"
                          />{" "}
                          시스템 삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-md text-gray-400 mb-2 font-medium">
                  {system.purpose}
                </p>
                <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-md">
                  <FontAwesomeIcon
                    icon={faCircleInfo}
                    style={{ color: "#B197FC" }}
                    size="xl"
                    className="mt-2"
                  />
                  <div>
                    <p className="text-sm font-medium">
                      {system.isDiagnosed ? "자가진단 완료" : "자가진단 미진행"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      시스템 자가진단을 통해 보안 준수 상태를 확인하세요.
                    </p>
                  </div>
                </div>
                <button
                  className="w-full mt-6 py-3 bg-emerald-500 hover:bg-emerald-700 text-white font-bold rounded-lg"
                  onClick={() => handleStartDiagnosis(system.systems_id)}
                >
                  <FontAwesomeIcon icon={faPlay} className="mr-4" />
                  {system.isDiagnosed ? "자가진단 보기" : "자가진단 시작하기"}
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <span className="flex text-lg font-bold gap-2 mb-4">
            <p>자가진단 완료 시스템</p>
          </span>
          <div className="grid grid-cols-1 gap-6">
            {summaryList.map((system) => (
              <div
                key={system.systems_id}
                className="bg-white border-t-8 border-blue-500 shadow-lg p-4"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-2xl font-bold">{system.system_name}</h4>
                  <div className="relative">
                    <button
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => toggleMenu(system.systems_id)} // React 상태로 관리
                    >
                      ⋮
                    </button>
                    {activeMenuId === system.systems_id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-10">
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-100"
                          onClick={() => handleDeleteSystem(system.systems_id)}
                        >
                          <FontAwesomeIcon
                            icon={faTrash}
                            style={{ color: "#ff0000" }}
                            className="mr-2"
                          />{" "}
                          시스템 삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-md text-gray-400 mb-2 font-medium">
                  {system.purpose}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <FontAwesomeIcon
                        icon={faCalendarDay}
                        className="h-4 w-4"
                      />
                      <span className="text-sm font-medium">점수</span>
                    </div>
                    <span className="text-sm font-semibold">
                      {system.compliance_rate}점
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <FontAwesomeIcon
                        icon={faCircleCheck}
                        className="h-4 w-4"
                      />
                      <span className="text-sm font-medium">
                        최근 자가진단:
                      </span>
                    </div>
                    <span className="text-sm font-semibold">
                      {format(
                        new Date(system.last_assessment_date),
                        "yyyy년 MM월 dd일 HH시 mm분"
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <FontAwesomeIcon
                        icon={faClipboardList}
                        className="h-4 w-4"
                      />
                      <span className="text-sm font-medium">피드백 상태:</span>
                    </div>
                    <div
                      className={`rounded-full px-2 py-1 text-white text-xs font-semibold ${
                        system.feedback_status.includes("반영")
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }`}
                    >
                      {system.feedback_status}
                    </div>
                  </div>
                  <div className="flex justify-between pt-2 gap-2">
                    <button
                      className="flex-1 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg py-2 font-bold"
                      onClick={() => handleViewResults(system.systems_id)}
                    >
                      자가진단 결과{" "}
                      <FontAwesomeIcon
                        icon={faCircleCheck}
                        className="h-4 w-4"
                      />
                    </button>
                    <button
                      className="flex-1 bg-blue-500 hover:bg-blue-600 border-gray-300 rounded-lg py-2 font-bold text-white"
                      onClick={() => handleStartDiagnosis(system.systems_id)}
                    >
                      <FontAwesomeIcon icon={faPlay} className="mr-2" />
                      재진단
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const renderSelfAssessment = () => {
    return (
      <>
        <h1 className="text-3xl font-bold">자가진단</h1>
        <p className="text-gray-500 text-sm mt-1 mb-4">
          시스템별 항목별 체크 결과를 확인하세요.
        </p>

        {/* 시스템 선택 드롭다운 */}
        <div className="relative dropdown-container">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center text-black px-4 py-2 rounded-lg transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
            시스템 선택
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-xl z-20">
              <div className="p-2 border-b">
                <p className="font-medium text-gray-700">시스템 목록</p>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {summaryList.map((system, index) => (
                  <button
                    key={system.systems_id}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between ${
                      index === currentCardIndex ? "bg-blue-50" : ""
                    }`}
                    onClick={() => {
                      setCurrentCardIndex(index);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <span className="truncate">{system.system_name}</span>
                    {index === currentCardIndex && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
              {summaryList.length === 0 && (
                <div className="px-4 py-2 text-gray-500 text-center">
                  완료된 자가진단이 없습니다.
                </div>
              )}
            </div>
          )}
        </div>

        <section className="w-full">
          {summaryList.length > 0 ? (
            <div className="relative w-full">
              <div className="overflow-hidden w-full">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{
                    transform: `translateX(-${currentCardIndex * 100}%)`,
                  }}
                >
                  {summaryList.map((system, index) => (
                    <div
                      key={system.systems_id}
                      className="w-full flex-shrink-0 flex-grow-0 flex justify-center"
                      style={{ flexBasis: "100%" }}
                    >
                      <div className="bg-white border-t-8  border-blue-600 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl max-w-[375px] w-full relative">
                        {/* 상단 헤더 영역 */}
                        <div className="bg-gradient-to-r from-blue-50 to-white p-4 border-b">
                          <h3 className="text-2xl font-bold text-gray-800">
                            {system.system_name}
                          </h3>
                          <p className="text-gray-500">{system.purpose}</p>
                        </div>
                        {/* 점수 표시 영역 */}
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-center">
                          <h4 className="text-lg font-medium text-gray-500 mb-4">
                            컴플라이언스 점수
                          </h4>
                          <div className="w-24 h-24 relative">
                            {/* 배경 원 */}
                            <svg
                              className="w-full h-full -rotate-90 transform"
                              viewBox="0 0 36 36"
                            >
                              <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#e6e6e6"
                                strokeWidth="4"
                                strokeLinecap="round"
                              />

                              {/* 동적 색상 프로그레스 원 */}
                              <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke={
                                  system.compliance_rate >= 90
                                    ? "#8B5CF6" // S 등급: 보라색
                                    : system.compliance_rate >= 80
                                    ? "#4ade80" // A 등급: 녹색
                                    : system.compliance_rate >= 70
                                    ? "#22c55e" // B 등급: 진한 녹색
                                    : system.compliance_rate >= 60
                                    ? "#facc15" // C 등급: 노란색
                                    : "#ef4444" // D 등급: 빨간색
                                }
                                strokeWidth="4"
                                strokeDasharray={`${system.compliance_rate}, 100`}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-in-out"
                              />
                            </svg>

                            {/* 중앙 점수 표시 */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-2xl font-bold">
                                {system.compliance_rate}
                                <span className="text-sm">점</span>
                              </span>
                              <div className="flex flex-col items-start">
                                <span
                                  className={`text-md font-bold py-0.5 px-2 rounded  ${
                                    system.compliance_rate >= 90
                                      ? "text-purple-600"
                                      : system.compliance_rate >= 80
                                      ? "text-green-600"
                                      : system.compliance_rate >= 70
                                      ? "text-green-700"
                                      : system.compliance_rate >= 60
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {system.compliance_rate >= 90
                                    ? "S"
                                    : system.compliance_rate >= 80
                                    ? "A"
                                    : system.compliance_rate >= 70
                                    ? "B"
                                    : system.compliance_rate >= 60
                                    ? "C"
                                    : "D"}{" "}
                                  등급
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 개선된 등급 설명 */}
                          <div className="mt-6 text-xs text-gray-600 flex flex-wrap justify-center gap-2">
                            <span className="font-bold bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                              S: 90점↑ (최우수)
                            </span>
                            <span className="font-bold bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              A: 80점↑ (우수)
                            </span>
                            <span className="font-bold bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                              B: 70점↑ (양호)
                            </span>
                            <span className="font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                              C: 60점↑ (보통)
                            </span>
                            <span className="font-bold bg-red-100 text-red-700 px-2 py-1 rounded-full">
                              D: 60점↓ (미흡)
                            </span>
                          </div>
                        </div>

                        {/* 정보 영역 */}
                        <div className="p-3 space-y-2">
                          <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                            <div className="flex items-center">
                              <FontAwesomeIcon
                                icon={faCalendarDay}
                                className="text-blue-500 mr-3"
                              />
                              <span className="text-sm font-medium">
                                최근 평가일
                              </span>
                            </div>
                            <span className="text-sm text-gray-700">
                              {format(
                                new Date(system.last_assessment_date),
                                "yyyy년 MM월 dd일"
                              )}
                            </span>
                          </div>

                          <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                            <div className="flex items-center">
                              <FontAwesomeIcon
                                icon={faClipboardList}
                                className="text-blue-500 mr-3"
                              />
                              <span className="text-sm font-medium">
                                피드백
                              </span>
                            </div>
                            <div
                              className={`rounded-full px-2 py-0.5 font-medium text-white text-xs ${
                                system.feedback_status.includes("반영")
                                  ? "bg-green-500"
                                  : "bg-amber-500"
                              }`}
                            >
                              {system.feedback_status}
                            </div>
                          </div>
                        </div>
                        {/* 버튼 영역 */}
                        <div className="flex border-t">
                          <button
                            className="flex-1 py-3 text-center font-bold text-blue-600 hover:bg-blue-50 transition-colors border-r"
                            onClick={() => handleViewResults(system.systems_id)}
                          >
                            <FontAwesomeIcon
                              icon={faCircleCheck}
                              className="mr-2"
                            />
                            결과 보기
                          </button>
                          <button
                            className="flex-1 py-3 text-center font-bold text-green-600 hover:bg-green-50 transition-colors"
                            onClick={() => {
                              const newState =
                                activeDetailCard === system.systems_id
                                  ? null
                                  : system.systems_id;
                              setActiveDetailCard(newState);
                              if (newState && !system.detailedQuantitative) {
                                fetchDetailedAssessment(system.systems_id);
                              }
                            }}
                          >
                            <FontAwesomeIcon
                              icon={
                                activeDetailCard === system.systems_id
                                  ? faTimes
                                  : faChartBar
                              }
                              className="mr-2"
                            />
                            {activeDetailCard === system.systems_id
                              ? "닫기"
                              : "세부 평가"}
                          </button>
                        </div>
                        {/* 세부 평가 카드 (정량/정성 평가 내용) */}
                        <div
                          className={`absolute inset-0 bg-white rounded-lg transform transition-all duration-500 
  ${
    activeDetailCard === system.systems_id
      ? "translate-y-0 opacity-100 z-10"
      : "translate-y-full opacity-0 -z-10"
  }`}
                        >
                          <div className="h-full flex flex-col">
                            {/* 헤더 탭 */}
                            <div className="flex border-b">
                              <button
                                className={`flex-1 py-3 font-medium ${
                                  activeTab === "quantitative"
                                    ? "text-blue-600 border-b-2 border-blue-600"
                                    : "text-gray-500"
                                }`}
                                onClick={() => setActiveTab("quantitative")}
                              >
                                정량평가
                              </button>
                              <button
                                className={`flex-1 py-3 font-medium ${
                                  activeTab === "qualitative"
                                    ? "text-blue-600 border-b-2 border-blue-600"
                                    : "text-gray-500"
                                }`}
                                onClick={() => setActiveTab("qualitative")}
                              >
                                정성평가
                              </button>
                            </div>
                            {/* 내용 영역 - 스크롤 가능 */}
                            <div className="flex-1 overflow-y-auto p-4 max-h-[60vh]">
                              {activeTab === "quantitative" ? (
                                <div className="space-y-4">
                                  {system.detailedQuantitative ? (
                                    system.detailedQuantitative.length > 0 ? (
                                      system.detailedQuantitative.map(
                                        (item, idx) => (
                                          <div
                                            key={idx}
                                            className="border rounded-lg p-3 bg-gray-50"
                                          >
                                            <div className="flex justify-between items-start mb-1">
                                              <h4 className="text-xs font-medium">
                                                {item.question}
                                              </h4>
                                              <span
                                                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                  item.response === "이행"
                                                    ? "bg-green-100 text-green-800"
                                                    : item.response === "미이행"
                                                    ? "bg-red-100 text-red-800"
                                                    : item.response ===
                                                      "자문필요"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : "bg-gray-100 text-gray-800"
                                                }`}
                                              >
                                                {item.response}
                                              </span>
                                            </div>

                                            {item.evaluation_criteria && (
                                              <p className="text-xs text-gray-500 mb-2">
                                                {item.evaluation_criteria}
                                              </p>
                                            )}

                                            {item.additional_comment && (
                                              <div className="mt-2 bg-white p-2 rounded border-l-4 border-blue-500">
                                                <p className="text-sm font-medium text-gray-700">
                                                  코멘트:
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                  {item.additional_comment}
                                                </p>
                                              </div>
                                            )}

                                            {item.file_path && (
                                              <div className="mt-3 flex items-center">
                                                <a
                                                  href={`http://localhost:3000/uploads/${item.file_path}`}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                                                >
                                                  <svg
                                                    className="w-4 h-4 mr-1"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                  >
                                                    <path d="M8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L11 7.586V3a1 1 0 10-2 0v4.586l-.293-.293z"></path>
                                                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4.586l1.293-1.293a1 1 0 011.414 0l2 2a1 1 0 010 1.414l-2 2a1 1 0 01-1.414 0L12 13.414V15a2 2 0 01-2 2h-7a2 2 0 01-2-2V5zm2-1a1 1 0 00-1 1v10a1 1 0 001 1h7a1 1 0 001-1v-4.586l.293.293a1 1 0 001.414 0l2-2a1 1 0 000-1.414l-2-2a1 1 0 00-1.414 0L12 6.414V5a1 1 0 00-1-1H4z"></path>
                                                  </svg>
                                                  <span className="text-sm">
                                                    첨부파일 다운로드
                                                  </span>
                                                </a>
                                              </div>
                                            )}

                                            <div className="mt-3 pt-2 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
                                              <span>
                                                {item.category_name || "기타"}
                                              </span>
                                            </div>
                                          </div>
                                        )
                                      )
                                    ) : (
                                      <div className="flex flex-col items-center justify-center py-8">
                                        <svg
                                          className="w-12 h-12 text-gray-400 mb-3"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                          />
                                        </svg>
                                        <p className="text-gray-500 mb-1">
                                          정량평가 응답이 없습니다.
                                        </p>
                                        <p className="text-sm text-gray-400">
                                          자가진단을 완료하면 결과가 이곳에
                                          표시됩니다.
                                        </p>
                                      </div>
                                    )
                                  ) : (
                                    <div className="flex justify-center items-center h-40">
                                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {system.detailedQualitative ? (
                                    system.detailedQualitative.length > 0 ? (
                                      system.detailedQualitative.map(
                                        (item, idx) => (
                                          <div
                                            key={idx}
                                            className="border-l-4 border-indigo-500 pl-4 py-3 bg-gray-50 rounded-r"
                                          >
                                            <h4 className="text-sm font-medium">
                                              {item.indicator}
                                            </h4>
                                            <p className="text-xs text-gray-500 mt-1">
                                              {item.indicator_definition}
                                            </p>

                                            <div className="flex items-center mt-3">
                                              <span
                                                className={`px-2 py-0.5 text-xs rounded-full ${
                                                  item.response === "자문필요"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : "bg-gray-100 text-gray-700"
                                                }`}
                                              >
                                                {item.response}
                                              </span>
                                            </div>

                                            {item.additional_comment && (
                                              <div className="mt-2 bg-white p-3 rounded border border-gray-200">
                                                <p className="text-sm font-medium text-gray-700">
                                                  의견:
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                  {item.additional_comment}
                                                </p>
                                              </div>
                                            )}

                                            {item.file_path && (
                                              <div className="mt-3 flex items-center">
                                                <a
                                                  href={`http://localhost:3000/uploads/${item.file_path}`}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
                                                >
                                                  <svg
                                                    className="w-4 h-4 mr-1"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                  >
                                                    <path d="M8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L11 7.586V3a1 1 0 10-2 0v4.586l-.293-.293z"></path>
                                                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4.586l1.293-1.293a1 1 0 011.414 0l2 2a1 1 0 010 1.414l-2 2a1 1 0 01-1.414 0L12 13.414V15a2 2 0 01-2 2h-7a2 2 0 01-2-2V5zm2-1a1 1 0 00-1 1v10a1 1 0 001 1h7a1 1 0 001-1v-4.586l.293.293a1 1 0 001.414 0l2-2a1 1 0 000-1.414l-2-2a1 1 0 00-1.414 0L12 6.414V5a1 1 0 00-1-1H4z"></path>
                                                  </svg>
                                                  <span className="text-sm">
                                                    첨부파일 다운로드
                                                  </span>
                                                </a>
                                              </div>
                                            )}
                                          </div>
                                        )
                                      )
                                    ) : (
                                      <div className="flex flex-col items-center justify-center py-8">
                                        <svg
                                          className="w-12 h-12 text-gray-400 mb-3"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                          />
                                        </svg>
                                        <p className="text-gray-500 mb-1">
                                          정성평가 응답이 없습니다.
                                        </p>
                                        <p className="text-sm text-gray-400">
                                          자가진단을 완료하면 결과가 이곳에
                                          표시됩니다.
                                        </p>
                                      </div>
                                    )
                                  ) : (
                                    <div className="flex justify-center items-center h-40">
                                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            {/* 하단 닫기 버튼 */}
                            <div className="border-t p-3">
                              <button
                                className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium"
                                onClick={() => setActiveDetailCard(null)}
                              >
                                닫기
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {summaryList.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentCardIndex((prev) => Math.max(0, prev - 1))
                    }
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg z-10 disabled:opacity-30"
                    disabled={currentCardIndex === 0}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() =>
                      setCurrentCardIndex((prev) =>
                        Math.min(summaryList.length - 1, prev + 1)
                      )
                    }
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg z-10 disabled:opacity-30"
                    disabled={currentCardIndex === summaryList.length - 1}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-500">완료된 자가진단이 없습니다.</p>
            </div>
          )}
        </section>
      </>
    );
  };
  return (
    <div className="flex flex-col min-h-screen max-w-[1000px] mx-auto p-6">
      <nav className="flex gap-10 justify-center w-full">
        <button
          onClick={() => setSelectedMenu("dashboard")}
          className={`font-semibold ${
            selectedMenu === "dashboard"
              ? "text-black"
              : "text-gray-600 hover:text-black"
          }`}
        >
          대시보드
        </button>
        <button
          onClick={() => setSelectedMenu("system-management")}
          className={`font-semibold ${
            selectedMenu === "system-management"
              ? "text-black"
              : "text-gray-600 hover:text-black"
          }`}
        >
          시스템 관리
        </button>
        <button
          onClick={() => setSelectedMenu("self-assessment")}
          className={`font-semibold ${
            selectedMenu === "self-assessment"
              ? "text-black"
              : "text-gray-600 hover:text-black"
          }`}
        >
          자가진단
        </button>
        <button className="text-gray-600 hover:text-black">
          결과 및 보고서
        </button>
      </nav>

      <main className="flex-1 p-10">
        {selectedMenu === "dashboard" && renderDashboard()}
        {selectedMenu === "system-management" && renderSystemManagement()}
        {selectedMenu === "self-assessment" && renderSelfAssessment()}
      </main>

      <button
        onClick={handleLogout}
        className="fixed bottom-5 right-5 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 w-[100px] h-[100px] flex flex-col items-center justify-center"
      >
        <FontAwesomeIcon icon={faSignOutAlt} size="2xl" />
        <p className="text-sm mt-1">로그아웃</p>
      </button>
    </div>
  );
}

export default Dashboard;
