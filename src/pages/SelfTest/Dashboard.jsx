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
  faCircleCheck,
  faCircleInfo,
  faClipboardList,
  faPlay,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import RecentActivities from "./RecentActivities";
import { format } from "date-fns";

function Dashboard() {
  const [summaryList, setSummaryList] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState("dashboard");

  const [systems, setSystems] = useRecoilState(systemsState);
  const [assessmentStatuses, setAssessmentStatuses] = useRecoilState(
    assessmentStatusesState
  );
  const [loading, setLoading] = useRecoilState(loadingState);
  const [errorMessage, setErrorMessage] = useRecoilState(errorMessageState);
  const auth = useRecoilValue(authState);
  const setAuthState = useSetRecoilState(authState);
  const navigate = useNavigate();

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
    }
  };

  useEffect(() => {
    fetchSystems();
    fetchSystemSummary();
  }, [auth]);

  const handleLogout = async () => {
    try {
      const res = await axiosInstance.get("http://localhost:3000/csrf-token", {
        withCredentials: true,
      });
      const response = await fetch("http://localhost:3000/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: { "X-CSRF-Token": res.data.csrfToken },
      });
      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        setAuthState({
          isLoggedIn: false,
          isExpertLoggedIn: false,
          user: null,
        });
        navigate("/login");
      } else {
        alert(data.message || "로그아웃 실패");
      }
    } catch (error) {
      alert("로그아웃 요청 중 오류 발생");
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

  // ✅ 이 아래에 추가하세요!
  const diagnosedSystemIds = summaryList.map((s) => s.systems_id);
  const unDiagnosedSystems = systemList.filter(
    (system) => !diagnosedSystemIds.includes(system.systems_id)
  );

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
            - <p>신규 등록 시스템</p>
          </span>
          <div className="mt-4 grid grid-cols-1 gap-6">
            {unDiagnosedSystems.map((system) => (
              <div
                key={system.id}
                className="p-4 bg-white border-t-8 border-green-500 shadow-lg"
              >
                <h4 className="text-2xl font-bold">{system.system_name}</h4>
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
                  onClick={async () => {
                    try {
                      const res = await axiosInstance.get(
                        `http://localhost:3000/selftest/round/${system.systems_id}`,
                        { withCredentials: true }
                      );
                      const nextRound = res.data.diagnosis_round;
                      navigate(`/selftest/start/${system.systems_id}`, {
                        state: { diagnosisRound: nextRound },
                      });
                    } catch (err) {
                      console.error("회차 조회 실패", err);
                      alert("진단 회차를 불러오지 못했습니다.");
                    }
                  }}
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
            - <p>자가진단 완료 시스템</p>
          </span>
          <div className="grid grid-cols-1 gap-6">
            {summaryList.map((system) => (
              <div
                key={system.systems_id}
                className="bg-white border-t-8 border-blue-500 shadow-lg p-4"
              >
                <h4 className="text-2xl font-bold">{system.system_name}</h4>
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
                      onClick={async () => {
                        try {
                          // 회차 정보 불러오기
                          const res = await axiosInstance.get(
                            `http://localhost:3000//round/${system.systems_id}`,
                            { withCredentials: true }
                          );
                          const latestRound = res.data.diagnosis_round;

                          navigate("/completion", {
                            state: {
                              systemId: system.systems_id,
                              diagnosisRound: latestRound,
                              userType: auth?.user?.type || "사용자", // 전문가 여부에 따라 분기
                            },
                          });
                        } catch (err) {
                          console.error("회차 조회 실패", err);
                          alert("진단 회차를 불러오지 못했습니다.");
                        }
                      }}
                    >
                      자가진단 결과{" "}
                      <FontAwesomeIcon
                        icon={faCircleCheck}
                        className="h-4 w-4"
                      />
                    </button>
                    <button
                      className="flex-1 bg-blue-500 hover:bg-blue-600 border-gray-300 rounded-lg py-2 font-bold text-white"
                      onClick={async () => {
                        try {
                          const res = await axiosInstance.get(
                            `http://localhost:3000/selftest/round/${system.systems_id}`,
                            { withCredentials: true }
                          );
                          const nextRound = res.data.diagnosis_round;
                          navigate(`/selftest/start/${system.systems_id}`, {
                            state: { diagnosisRound: nextRound },
                          });
                        } catch (err) {
                          console.error("회차 조회 실패", err);
                          alert("진단 회차를 불러오지 못했습니다.");
                        }
                      }}
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
        <button className="text-gray-600 hover:text-black">자가진단</button>
        <button className="text-gray-600 hover:text-black">
          결과 및 보고서
        </button>
      </nav>

      <main className="flex-1 p-10">
        {selectedMenu === "dashboard" && renderDashboard()}
        {selectedMenu === "system-management" && renderSystemManagement()}
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
