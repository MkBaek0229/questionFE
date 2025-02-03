import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import {
  authState,
  expertAuthState,
  superUserAuthState,
} from "../../state/authState";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("user"); // "user", "expert", "superuser"
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const setAuthState = useSetRecoilState(authState);
  const setExpertAuthState = useSetRecoilState(expertAuthState);
  const setSuperUserAuthState = useSetRecoilState(superUserAuthState);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage("이메일과 비밀번호를 입력해 주세요.");
      return;
    }
    setIsSubmitting(true);

    const endpoint =
      userType === "user"
        ? "http://localhost:3000/login"
        : userType === "expert"
        ? "http://localhost:3000/login/expert"
        : "http://localhost:3000/login/superuser";

    try {
      console.log("🚀 [LOGIN] 요청 전송:", endpoint, { email, password });
      const response = await axios.post(
        endpoint,
        { email, password },
        { withCredentials: true }
      );
      console.log("✅ [LOGIN] 응답 데이터:", response.data);

      const { id, member_type, ...userData } = response.data.data;

      // 사용자 유형별로 상태 업데이트
      if (member_type === "superuser") {
        setSuperUserAuthState({
          isLoggedIn: true,
          user: { id, member_type, ...userData },
        });
        navigate("/superuserpage");
      } else if (member_type === "expert") {
        setExpertAuthState({
          isLoggedIn: true,
          user: { id, member_type, ...userData },
        });
        navigate("/system-management");
      } else {
        setAuthState({
          isLoggedIn: true,
          user: { id, member_type, ...userData },
        });
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("❌ [LOGIN] 오류:", error.response?.data || error.message);
      setErrorMessage(
        error.response?.data?.msg || "로그인 요청 중 문제가 발생했습니다."
      );
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
              <option value="user">기관회원</option>
              <option value="expert">전문가</option>
              <option value="superuser">슈퍼유저</option>
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
