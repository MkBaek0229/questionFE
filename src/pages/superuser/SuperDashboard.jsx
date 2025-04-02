import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignOutAlt,
  faUsers,
  faTachometerAlt,
  faFileAlt,
  faCommentDots,
  faServer,
  faClipboardCheck,
} from "@fortawesome/free-solid-svg-icons";
import axiosInstance from "../../../axiosInstance";
import { useRecoilState } from "recoil";
import { superUserAuthState } from "../../state/authState";
import { format } from "date-fns";
import MainLogo from "../../assets/logo/MainLogo.png";
import { toast } from "react-toastify";

const getCsrfToken = async () => {
  try {
    const response = await axiosInstance.get(
      "http://localhost:3000/csrf-token",
      { withCredentials: true }
    );
    return response.data.csrfToken;
  } catch (error) {
    console.error("❌ CSRF 토큰 가져오기 실패:", error);
    return null;
  }
};

function SuperDashboard() {
  const navigate = useNavigate();
  const [superUser, setSuperUser] = useRecoilState(superUserAuthState);
  const [csrfToken, setCsrfToken] = useState("");
  const [selectedMenu, setSelectedMenu] = useState("dashboard");

  const [stats, setStats] = useState({
    totalUsers: 25,
    pendingUsers: 3,
    totalSystems: 45,
    pendingSystems: 2,
    totalExperts: 10,
    unassignedExperts: 4,
    completedAssessments: 35,
    ongoingAssessments: 7,
    pendingFeedback: 8,
    feedbackUnread: 3,
  });

  const [notifications, setNotifications] = useState([
    "플랫폼 시스템 점검이 4월 5일 오전 2시에 예정되어 있습니다.",
    "전문가 매칭 및 피드백 기능이 업데이트 되었습니다.",
    "신규 시스템 등록 승인 요청이 2건 있습니다.",
  ]);

  useEffect(() => {
    const fetchCsrfToken = async () => {
      const token = await getCsrfToken();
      setCsrfToken(token);
    };
    fetchCsrfToken();
  }, []);

  const handleLogout = async () => {
    try {
      await axiosInstance.post(
        "http://localhost:3000/superuser/logout",
        {},
        { withCredentials: true, headers: { "X-CSRF-Token": csrfToken } }
      );
      sessionStorage.removeItem("superUserData");
      setSuperUser({ isLoggedIn: false, user: null });
      toast.success("로그아웃 되었습니다.");
      navigate("/login");
    } catch (error) {
      console.error("❌ 로그아웃 실패:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-lg flex flex-col h-screen sticky top-0 rounded-r-[20px]">
        <div className="h-60 flex flex-col items-center justify-center gap-2">
          <img src={MainLogo} alt="메인로고" className="w-16 h-12" />
          <p className="font-medium text-black text-[16px]">
            개인정보 컴플라이언스 강화 플랫폼
          </p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {[
            {
              key: "dashboard",
              label: "대시보드",
              icon: faTachometerAlt,
              path: "/SuperDashboard",
            },
            {
              key: "user-management",
              label: "회원 관리",
              icon: faUsers,
              path: "/SuperManageUsers",
            },
            {
              key: "system-management",
              label: "시스템 관리",
              icon: faServer,
              path: "/ViewSystems",
            },
            {
              key: "diagnosis-management",
              label: "자가진단 관리",
              icon: faClipboardCheck,
              path: "/SuperManageQuestions",
            },
            {
              key: "feedback-management",
              label: "전문가 피드백 관리",
              icon: faCommentDots,
              path: "/MatchExperts",
            },
            {
              key: "report-management",
              label: "보고서 관리",
              icon: faFileAlt,
              path: "#",
            },
          ].map((menu) => (
            <button
              key={menu.key}
              onClick={() => {
                setSelectedMenu(menu.key);
                navigate(menu.path);
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-md font-semibold transition-colors
                ${
                  selectedMenu === menu.key
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }
              `}
            >
              <FontAwesomeIcon icon={menu.icon} />
              <span>{menu.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-md"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            로그아웃
          </button>
          <div className="mt-5 pt-3 text-center text-xs px-2 border-t border-gray-100">
            <a href="https://www.martinlab.co.kr/" target="_blank">
              © 주식회사 마틴 랩
            </a>
            <p className="text-gray-400">문의 : martin@martinlab.co.kr</p>
          </div>
        </div>
      </aside>

      <div className="flex-1 overflow-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">슈퍼유저 대시보드</h1>
            <p className="text-gray-500 text-sm">
              플랫폼 전체 현황을 확인하세요.
            </p>
          </div>
          <div className="text-right">
            <div className="font-medium">
              {superUser?.user?.name || "관리자"}님, 안녕하세요
            </div>
            <div className="text-xs text-gray-500">
              최종 접속: {format(new Date(), "yyyy년 MM월 dd일 HH시 mm분")}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-500 p-4 rounded text-white">
            <p>전체 회원 수: {stats.totalUsers}</p>
            <p>미승인: {stats.pendingUsers}</p>
          </div>
          <div className="bg-green-500 p-4 rounded text-white">
            <p>등록 시스템: {stats.totalSystems}</p>
            <p>승인 대기: {stats.pendingSystems}</p>
          </div>
          <div className="bg-indigo-500 p-4 rounded text-white">
            <p>총 전문가 수: {stats.totalExperts}</p>
            <p>미배정: {stats.unassignedExperts}</p>
          </div>
          <div className="bg-yellow-500 p-4 rounded text-white">
            <p>자가진단 완료: {stats.completedAssessments}</p>
            <p>진행 중: {stats.ongoingAssessments}</p>
          </div>
          <div className="bg-red-500 p-4 rounded text-white">
            <p>피드백 대기: {stats.pendingFeedback}</p>
            <p>미확인: {stats.feedbackUnread}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="font-bold mb-4">📢 주요 알림</h2>
          <ul className="list-disc pl-5">
            {notifications.map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SuperDashboard;
