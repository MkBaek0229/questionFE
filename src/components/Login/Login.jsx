import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Font Awesome 컴포넌트
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import axiosInstance from "../../../axiosInstance";
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
  const [rememberMe, setRememberMe] = useState(false); // 로그인 유지 체크박스 상태
  const navigate = useNavigate();
  const setAuthState = useSetRecoilState(authState);
  const setExpertAuthState = useSetRecoilState(expertAuthState);
  const setSuperUserAuthState = useSetRecoilState(superUserAuthState);

  const getCsrfToken = async () => {
    try {
      const response = await axiosInstance.get(
        "http://localhost:3000/csrf-token",
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.csrfToken;
    } catch (error) {
      console.error("❌ CSRF 토큰 가져오기 실패:", error);
      return null;
    }
  };

  const handleLogin = async (e) => {
    e && e.preventDefault();

    if (!email || !password) {
      setErrorMessage("이메일과 비밀번호를 입력해 주세요.");
      return;
    }
    setIsSubmitting(true);

    const finalUserType =
      email === "martin@martinlab.co.kr" ? "superuser" : userType;

    const endpoint =
      finalUserType === "user"
        ? "http://localhost:3000/auth/login"
        : finalUserType === "superuser"
        ? "http://localhost:3000/superuser/login"
        : "http://localhost:3000/expert/login";

    try {
      const csrfToken = await getCsrfToken();

      if (!csrfToken) {
        setErrorMessage("CSRF 토큰을 가져오는 데 실패했습니다.");
        setIsSubmitting(false);
        return;
      }

      const response = await axiosInstance.post(
        endpoint,
        { email, password, rememberMe },
        {
          withCredentials: true,
          headers: {
            "X-CSRF-Token": csrfToken,
          },
        }
      );

      // 서버 응답 출력
      console.log("🔍 로그인 응답:", response.data);
      console.log("📊 member_type:", response.data.data.member_type);

      const { id, member_type, ...userData } = response.data.data;

      if (member_type === "superuser") {
        setSuperUserAuthState({
          isLoggedIn: true,
          user: { id, member_type, ...userData },
        });
        navigate("/SuperDashboard");
      } else if (member_type === "expert") {
        setExpertAuthState({
          isLoggedIn: true,
          user: { id, member_type, ...userData },
        });
        navigate("/expert-dashboard");
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
        error.response?.data?.message || "로그인 요청 중 문제가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate("/")}
          className="mb-4 flex items-center text-slate-600 hover:text-slate-900 transition-colors py-2 px-3 rounded-md hover:bg-slate-100"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-4 w-4" />
          메인으로 돌아가기
        </button>

        <div className="bg-white rounded-xl shadow-lg border-none overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-2xl font-bold text-center text-slate-900">
              로그인
            </h2>
            <p className="text-center text-slate-500 mt-1 text-sm">
              계정 정보를 입력하여 로그인하세요
            </p>
          </div>

          <div className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {/* 회원 유형 선택 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  회원 유형
                </label>
                <select
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="user">기관회원</option>
                  <option value="expert">전문가회원</option>
                </select>
              </div>

              {/* 이메일 입력 */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700"
                >
                  이메일
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>

              {/* 비밀번호 입력 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-700"
                  >
                    비밀번호
                  </label>
                  <Link
                    to="/find-account/select"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    비밀번호 찾기
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>

              {/* 오류 메시지 */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
                  {errorMessage}
                </div>
              )}

              {/* 로그인 유지 체크박스 */}
              <div className="flex items-center mt-4">
                <div className="relative flex items-center">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer sr-only" // 원래 체크박스는 숨기고 커스텀 디자인 적용
                  />
                  <div
                    onClick={() => setRememberMe(!rememberMe)} // 클릭 이벤트 핸들러 추가
                    className="w-5 h-5 border border-slate-300 rounded-md 
                bg-white peer-checked:bg-blue-600 peer-checked:border-blue-600 
                transition-all duration-200 ease-in-out
                peer-focus:ring-2 peer-focus:ring-blue-300 peer-focus:ring-offset-1
                hover:border-blue-400 cursor-pointer"
                  >
                    {/* 체크 아이콘 */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-full w-full p-0.5 text-white stroke-2 
                   transition-opacity duration-200 ease-in-out
                   ${rememberMe ? "opacity-100" : "opacity-0"}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <label
                    htmlFor="rememberMe"
                    className="ml-2.5 text-sm font-medium text-slate-700 cursor-pointer select-none"
                  >
                    로그인 유지
                  </label>
                </div>
              </div>

              {/* 로그인 버튼 */}
              <button
                type="submit"
                className={`w-full font-medium rounded-lg px-4 py-3 text-white text-center transition-all ${
                  isSubmitting
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    로그인 중...
                  </span>
                ) : (
                  "로그인"
                )}
              </button>
            </form>
          </div>

          <div className="p-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              계정이 없으신가요?{" "}
              <Link
                to="/Signup"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
