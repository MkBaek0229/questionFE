import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { expertAuthState } from "../../state/authState";

function SystemManagement() {
  const [systems, setSystems] = useState([]);
  const [filteredSystems, setFilteredSystems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const expertAuth = useRecoilValue(expertAuthState);
  const navigate = useNavigate();
  const setExpertAuthState = useSetRecoilState(expertAuthState);

  const systemsPerPage = 5;

  // 시스템 데이터 가져오기
  useEffect(() => {
    const fetchAssignedSystems = async () => {
      if (!expertAuth.user || !expertAuth.user.id) {
        console.error(
          "[SystemManagement] 전문가 ID가 없습니다.",
          expertAuth.user
        );
        return;
      }

      try {
        console.log(`Fetching systems for expert ID: ${expertAuth.user.id}`);
        const response = await fetch(
          `http://localhost:3000/assigned-systems?expertId=${expertAuth.user.id}`,
          { credentials: "include" }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("[SystemManagement] 시스템 조회 실패:", errorData);
          return;
        }

        const data = await response.json();
        console.log("[SystemManagement] 시스템 조회 성공:", data);
        setSystems(data);
      } catch (error) {
        console.error("[SystemManagement] API 요청 실패:", error);
      }
    };

    fetchAssignedSystems();
  }, [expertAuth.user]);

  // 검색 기능
  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = systems.filter(
      (system) =>
        system.institution_name.toLowerCase().includes(lowercasedQuery) ||
        system.system_name.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredSystems(filtered);
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  }, [searchQuery, systems]);

  // 현재 페이지에 표시할 데이터 계산
  const indexOfLastSystem = currentPage * systemsPerPage;
  const indexOfFirstSystem = indexOfLastSystem - systemsPerPage;
  const currentSystems = filteredSystems.slice(
    indexOfFirstSystem,
    indexOfLastSystem
  );

  // 페이지 번호 계산
  const totalPages = Math.ceil(filteredSystems.length / systemsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3000/logout/expert", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.resultCode === "S-1") {
        alert(data.msg);
        setExpertAuthState({
          isLoggedIn: false,
          user: null,
        });
        navigate("/");
      } else {
        alert(data.msg || "로그아웃 실패");
      }
    } catch (error) {
      console.error("[SystemManagement] 로그아웃 요청 실패:", error);
      alert("로그아웃 요청 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      {/* 상단 헤더 */}
      <header className="w-full max-w-[1000px] h-[70px] bg-blue-600 flex items-center justify-between px-5 text-white mb-6 shadow-md rounded-lg">
        <h1 className="text-lg font-semibold">전문가 대시보드</h1>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="bg-white rounded-lg w-full max-w-[1000px] min-h-[600px] h-full p-5 shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-5">
          배정된 시스템 관리
        </h2>

        {/* 검색 바 */}
        <div className="flex gap-2 mb-5">
          <input
            type="text"
            placeholder="검색어를 입력하세요."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg"
          />
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
            {currentSystems.length > 0 ? (
              currentSystems.map((system) => (
                <tr key={system.system_id} className="hover:bg-gray-50">
                  <td className="p-3 border text-gray-700">
                    {system.institution_name}
                  </td>
                  <td className="p-3 border text-gray-700">
                    {system.system_name}
                  </td>
                  <td className="p-3 border text-gray-700">
                    {system.completed_at
                      ? system.completed_at.split("T")[0]
                      : "진단 미완료"}
                  </td>
                  <td className="p-3 border">
                    <span
                      className={`px-2 py-1 rounded-lg text-sm ${
                        system.feedback_status ===
                        "전문가 자문이 반영되었습니다"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {system.feedback_status || "반영 전"}
                    </span>
                  </td>
                  <td className="p-3 border text-center">
                    <button
                      onClick={() =>
                        navigate(`/system-details/${system.system_id}`)
                      }
                      className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg hover:bg-blue-600 mr-2"
                    >
                      피드백 보기
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-3 text-gray-500">
                  배정된 시스템이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
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
        )}
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
