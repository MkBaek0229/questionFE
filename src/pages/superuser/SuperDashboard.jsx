import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faList,
  faUserTie,
  faSignOutAlt,
  faClipboardList,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useRecoilState } from "recoil";
import { superUserAuthState } from "../../state/authState"; // Recoil 상태 가져오기

const getCsrfToken = async () => {
  try {
    const response = await axios.get("http://localhost:3000/csrf-token", {
      withCredentials: true,
    });
    return response.data.csrfToken;
  } catch (error) {
    console.error("❌ CSRF 토큰 가져오기 실패:", error);
    return null;
  }
};

function SuperDashboard() {
  const navigate = useNavigate();
  const [superUser, setSuperUser] = useRecoilState(superUserAuthState); // Recoil 상태
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    const fetchCsrfToken = async () => {
      const token = await getCsrfToken();
      setCsrfToken(token);
    };
    fetchCsrfToken();
  }, []);

  // ✅ 로그아웃 기능
  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:3000/logout/SuperUser",
        {},
        { withCredentials: true, headers: { "X-CSRF-Token": csrfToken } }
      );

      // ✅ 세션 및 Recoil 상태 초기화
      sessionStorage.removeItem("superUserData");
      setSuperUser({ isLoggedIn: false, user: null });

      navigate("/login");
    } catch (error) {
      console.error("❌ 로그아웃 실패:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-100 to-gray-300 p-6">
      <div className="bg-white rounded-lg p-8 max-w-lg w-full text-center">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-500 to-teal-500 text-transparent bg-clip-text flex items-center justify-center mb-8 pb-4">
          <FontAwesomeIcon icon={faUserTie} className="text-gray-700 mr-3" />
          {superUser?.user?.name || "슈퍼유저"} 대시보드
        </h1>

        {/* ✅ 버튼 목록 */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/ViewSystems")}
            className="px-6 py-4 bg-blue-500 text-white font-semibold rounded-xl text-lg flex items-center justify-center hover:bg-blue-600 transform transition-all duration-200 hover:scale-105 shadow-md"
          >
            <FontAwesomeIcon icon={faList} className="mr-3" />
            시스템 관리
          </button>

          <button
            onClick={() => navigate("/MatchExperts")}
            className="px-6 py-4 bg-green-500 text-white font-semibold rounded-xl text-lg flex items-center justify-center hover:bg-green-600 transform transition-all duration-200 hover:scale-105 shadow-md"
          >
            <FontAwesomeIcon icon={faUserTie} className="mr-3" />
            전문가 매칭
          </button>

          <button
            onClick={() => navigate("/SuperManageQuestions")}
            className="px-6 py-4 bg-purple-500 text-white font-semibold rounded-xl text-lg flex items-center justify-center hover:bg-purple-600 transform transition-all duration-200 hover:scale-105 shadow-md"
          >
            <FontAwesomeIcon icon={faClipboardList} className="mr-3" />
            문항 관리
          </button>

          <button
            onClick={() => navigate("/SuperManageUsers")}
            className="px-6 py-4 bg-teal-500 text-white font-semibold rounded-xl text-lg flex items-center justify-center hover:bg-teal-600 transform transition-all duration-200 hover:scale-105 shadow-md"
          >
            <FontAwesomeIcon icon={faUsers} className="mr-3" />
            회원 관리
          </button>

          <button
            onClick={handleLogout}
            className="col-span-2 px-6 py-4 bg-red-500 text-white font-semibold rounded-xl text-lg flex items-center justify-center hover:bg-red-600 transform transition-all duration-200 hover:scale-105 shadow-md"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-3" />
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}

export default SuperDashboard;
