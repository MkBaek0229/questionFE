import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { authState } from "../../state/authState";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("user"); // "user" 또는 "expert"
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const setAuthState = useSetRecoilState(authState);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage("이메일과 비밀번호를 입력해 주세요.");
      return;
    }
    setIsSubmitting(true);

    const endpoint =
      userType === "user"
        ? "http://localhost:3000/login"
        : "http://localhost:3000/login/expert";

    try {
      const response = await axios.post(
        endpoint,
        { email, password },
        { withCredentials: true } // ✅ 서버에서 쿠키를 받을 수 있도록 설정
      );

      console.log("Login Response:", response.data); // 응답 데이터 확인
      const { id, role, ...userData } = response.data.user;

      // Recoil 상태 업데이트
      setAuthState({
        isLoggedIn: true,
        isExpertLoggedIn: role === "expert",
        user: { id, role, ...userData }, // 사용자 정보 저장
      });

      // role 변수를 사용하여 페이지 리디렉션
      if (role === "expert") {
        navigate("/system-management"); // 관리자 페이지로 이동
      } else {
        navigate("/dashboard"); // 일반 사용자 페이지로 이동
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      setErrorMessage(error.response?.data?.msg || "로그인 실패");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-3/4 max-w-md">
        <h1 className="text-2xl font-bold mb-6">로그인</h1>
        <div className="space-y-4">
          {/* 회원 유형 선택 */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              회원 유형
            </label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
            >
              <option value="user">일반회원</option>
              <option value="expert">관리자</option>
            </select>
          </div>

          {/* 이메일 입력 */}
          <div>
            <label className="block text-gray-700 font-medium">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="이메일을 입력하세요"
            />
          </div>

          {/* 비밀번호 입력 */}
          <div>
            <label className="block text-gray-700 font-medium">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          {/* 오류 메시지 */}
          {errorMessage && (
            <p className="text-red-500 text-center">{errorMessage}</p>
          )}

          {/* 로그인 버튼 */}
          <button
            onClick={handleLogin}
            className={`w-full px-4 py-3 font-bold rounded-md ${
              isSubmitting
                ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "로그인 중..." : "로그인"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
