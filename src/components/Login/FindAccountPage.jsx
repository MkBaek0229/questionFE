import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

function FindAccountPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // ✅ 로딩 상태 추가
  const navigate = useNavigate();
  const location = useLocation();
  const userType = location.pathname.includes("institution")
    ? "institution"
    : "expert"; // ✅ 현재 페이지에서 회원 유형 확인

  const getCsrfToken = async () => {
    try {
      const response = await axios.get("http://localhost:3000/csrf-token", {
        withCredentials: true, // ✅ 쿠키 포함 필수
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data.csrfToken;
    } catch (error) {
      console.error("❌ CSRF 토큰 가져오기 실패:", error);
      return null;
    }
  };

  // ✅ 이메일 형식 검증 함수
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // ✅ 비밀번호 찾기 API 호출
  const handleFindPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true); // ✅ 로딩 시작

    if (!validateEmail(email)) {
      setError("올바른 이메일 형식을 입력해주세요.");
      setIsLoading(false);
      return;
    }

    try {
      console.log("🚀 [CSRF] 토큰 가져오는 중...");
      const csrfToken = await getCsrfToken(); // ✅ CSRF 토큰 가져오기

      if (!csrfToken) {
        setError("CSRF 토큰을 가져오지 못했습니다.");
        setIsLoading(false);
        return;
      }

      console.log("🚀 [POST] 비밀번호 찾기 요청 보내는 중...");

      await axios.post(
        "http://localhost:3000/find-password",
        { email },
        {
          withCredentials: true, // ✅ 쿠키 포함 필수
          headers: {
            "X-CSRF-Token": csrfToken, // ✅ CSRF 토큰 추가
          },
        }
      );
      setMessage(
        "비밀번호 재설정 이메일이 전송되었습니다. 이메일을 확인하세요."
      );
    } catch (err) {
      setError(err.response?.data?.message || "비밀번호 찾기 실패");
    } finally {
      setIsLoading(false); // ✅ 로딩 종료
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="p-8 rounded-lg w-3/4 max-w-md bg-white shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">
          {userType === "institution" ? "기관회원" : "전문가회원"} 비밀번호 찾기
        </h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {message && (
          <p className="text-green-500 text-center mb-4">{message}</p>
        )}

        <form onSubmit={handleFindPassword} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="가입한 이메일 입력"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-3 rounded-lg w-full"
            required
          />
          <button
            type="submit"
            className={`bg-green-500 text-white py-3 rounded-lg shadow-lg hover:bg-green-600 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? "처리 중..." : "비밀번호 찾기"}
          </button>
        </form>

        <button
          onClick={() => navigate("/login")}
          className="mt-4 text-blue-500 hover:underline"
        >
          로그인 페이지로 돌아가기
        </button>
      </div>
    </div>
  );
}

export default FindAccountPage;
