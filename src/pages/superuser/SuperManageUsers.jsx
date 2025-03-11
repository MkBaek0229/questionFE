import React, { useEffect, useState } from "react";
import axios from "../../axiosConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faUsers, faUserTie } from "@fortawesome/free-solid-svg-icons";

const getCsrfToken = async () => {
  try {
    const response = await axios.get("/csrf-token", {
      withCredentials: true, // ✅ 세션 쿠키 포함
    });
    return response.data.csrfToken;
  } catch (error) {
    console.error("❌ CSRF 토큰 가져오기 실패:", error);
    return null;
  }
};

function SuperManageUsers() {
  const [csrfToken, setCsrfToken] = useState("");
  const [users, setUsers] = useState([]);
  const [experts, setExperts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("users"); // "users" | "experts"

  useEffect(() => {
    const fetchCsrfToken = async () => {
      const token = await getCsrfToken();
      setCsrfToken(token);
    };
    fetchCsrfToken();
    fetchUsers();
    fetchExperts();
  }, []);

  // ✅ 유저 목록 가져오기
  const fetchUsers = async () => {
    try {
      const response = await axios.get("/superuser/users", {
        withCredentials: true,
      });
      setUsers(response.data.data);
    } catch (error) {
      console.error("❌ 유저 목록 조회 실패:", error);
    }
  };

  // ✅ 전문가 목록 가져오기
  const fetchExperts = async () => {
    try {
      const response = await axios.get("/superuser/experts", {
        withCredentials: true,
      });
      setExperts(response.data.data);
    } catch (error) {
      console.error("❌ 전문가 목록 조회 실패:", error);
    }
  };

  // ✅ 유저 또는 전문가 삭제
  const handleDelete = async (id, type) => {
    const confirmDelete = window.confirm("정말 이 회원을 삭제하시겠습니까?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`/superuser/${type}/${id}`, {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });
      alert("✅ 회원이 삭제되었습니다.");
      type === "user" ? fetchUsers() : fetchExperts();
    } catch (error) {
      console.error(
        `❌ ${type === "user" ? "유저" : "전문가"} 삭제 실패:`,
        error
      );
      alert("🚨 회원 삭제 중 오류가 발생했습니다.");
    }
  };

  // ✅ 검색 필터 적용
  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.institution_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredExperts = experts.filter(
    (expert) =>
      expert.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expert.institution_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          회원 관리 (슈퍼유저)
        </h1>

        {/* ✅ 탭 버튼 */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-5 py-2 rounded-md text-lg font-semibold ${
              activeTab === "users"
                ? "bg-blue-600 text-white"
                : "bg-gray-300 text-gray-700"
            }`}
          >
            <FontAwesomeIcon icon={faUsers} className="mr-2" />
            기관회원 관리
          </button>
          <button
            onClick={() => setActiveTab("experts")}
            className={`px-5 py-2 rounded-md text-lg font-semibold ${
              activeTab === "experts"
                ? "bg-green-600 text-white"
                : "bg-gray-300 text-gray-700"
            }`}
          >
            <FontAwesomeIcon icon={faUserTie} className="mr-2" />
            전문가(관리자) 관리
          </button>
        </div>

        {/* ✅ 검색 입력 필드 */}
        <input
          type="text"
          placeholder="이메일 또는 기관명을 검색하세요"
          className="w-full p-3 border rounded-md mb-6"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* ✅ 유저 테이블 */}
        {activeTab === "users" && (
          <table className="table-auto w-full border border-gray-300 rounded-lg shadow-md">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2">이메일</th>
                <th className="px-4 py-2">기관명</th>
                <th className="px-4 py-2">대표자</th>
                <th className="px-4 py-2">관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-300">
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.institution_name}</td>
                  <td className="px-4 py-2">{user.representative_name}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleDelete(user.id, "user")}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      <FontAwesomeIcon icon={faTrash} className="mr-1" />
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* ✅ 전문가 테이블 */}
        {activeTab === "experts" && (
          <table className="table-auto w-full border border-gray-300 rounded-lg shadow-md">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2">이메일</th>
                <th className="px-4 py-2">이름</th>
                <th className="px-4 py-2">기관명</th>
                <th className="px-4 py-2">관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredExperts.map((expert) => (
                <tr key={expert.id} className="border-b border-gray-300">
                  <td className="px-4 py-2">{expert.email}</td>
                  <td className="px-4 py-2">{expert.name}</td>
                  <td className="px-4 py-2">{expert.institution_name}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleDelete(expert.id, "expert")}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      <FontAwesomeIcon icon={faTrash} className="mr-1" />
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default SuperManageUsers;
