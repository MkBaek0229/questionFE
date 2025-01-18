import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useSetRecoilState } from "recoil";
import { authState } from "../../state/authState";

const systems = [
  { name: "시스템 A", member: "홍길동", date: "2025-01-01", status: "반영 전" },
  // ... 추가 시스템 데이터
];

function SystemManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const setAuthState = useSetRecoilState(authState);

  const systemsPerPage = 5; // 페이지당 시스템 개수를 5개로 설정

  // 현재 페이지에 표시할 시스템 데이터 계산
  const indexOfLastSystem = currentPage * systemsPerPage;
  const indexOfFirstSystem = indexOfLastSystem - systemsPerPage;
  const currentSystems = systems.slice(indexOfFirstSystem, indexOfLastSystem);

  // 페이지 번호 계산
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(systems.length / systemsPerPage); i++) {
    pageNumbers.push(i);
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3000/logout/expert", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.resultCode === "S-1") {
        alert(data.msg); // 로그아웃 성공 메시지
        // Recoil 상태 업데이트
        setAuthState({
          isLoggedIn: false,
          isExpertLoggedIn: false,
          user: null,
        });
        navigate("/"); // MainPage로 리다이렉트
      } else {
        alert(data.msg || "로그아웃 실패");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("로그아웃 요청 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      {/* 상단 헤더 */}
      <header className="w-full max-w-[1000px] h-[70px] bg-blue-600 flex items-center justify-between px-5 text-white mb-6 shadow-md rounded-lg">
        <h1 className="text-lg font-semibold">전문가회원 대시보드</h1>
      </header>
      {/* 컨텐츠 영역 */}
      <div className="bg-white rounded-lg w-full max-w-[1000px] min-h-[600px] h-full p-5 shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-5">
          배정된 시스템 관리
        </h2>

        {/* 검색 바 */}
        <div className="flex gap-2 mb-5">
          <input
            type="text"
            placeholder="검색어를 입력해주세요."
            className="flex-1 p-3 border border-gray-300 rounded-lg"
          />
          <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 w-40">
            검색
          </button>
        </div>

        {/* 테이블 */}
        <table className="table-auto w-full border-collapse">
          <thead>
            <tr>
              <th className="p-3 border bg-gray-100 text-gray-600 text-left font-semibold">
                기관 회원
              </th>
              <th className="p-3 border bg-gray-100 text-gray-600 text-left font-semibold">
                시스템명
              </th>
              <th className="p-3 border bg-gray-100 text-gray-600 text-left font-semibold">
                진단 날짜
              </th>
              <th className="p-3 border bg-gray-100 text-gray-600 text-left font-semibold">
                상태
              </th>
              <th className="p-3 border bg-gray-100 text-gray-600 text-left font-semibold">
                관리
              </th>
            </tr>
          </thead>
          <tbody>
            {currentSystems.map((system, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="p-3 border text-gray-700">{system.member}</td>
                <td className="p-3 border text-gray-700">{system.name}</td>
                <td className="p-3 border text-gray-700">{system.date}</td>
                <td className="p-3 border">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-sm">
                    {system.status}
                  </span>
                </td>
                <td className="p-3 border text-center">
                  <button className="px-3 py-1  bg-gray-300 text-gray-700 rounded-lg hover:bg-blue-600 mr-2">
                    피드백 보기
                  </button>
                  <button className="px-2 py-1 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 mr-2">
                    시스템 정보
                  </button>
                  <button className="px-3 py-1 bg-blue-500  text-white rounded-lg hover:bg-gray-400">
                    피드백 작성
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 페이지네이션 */}
        <div className="flex justify-center mt-5">
          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => setCurrentPage(number)}
              className={`px-3 py-1 mx-1 rounded-lg ${
                currentPage === number
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-700"
              }`}
            >
              {number}
            </button>
          ))}
        </div>
      </div>
      {/* 로그아웃 FAB 버튼 */}
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
