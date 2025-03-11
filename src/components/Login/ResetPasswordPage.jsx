import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../../axiosConfig";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token"); // 🔹 URL에서 토큰 가져오기

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const getCsrfToken = async () => {
    try {
      const response = await axios.get("/csrf-token", {
        withCredentials: true, // ✅ 쿠키 포함 필수
      });
      return response.data.csrfToken;
    } catch (error) {
      console.error("❌ CSRF 토큰 가져오기 실패:", error);
      return null;
    }
  };

  // ✅ 비밀번호 강도 검사 함수 (선택)
  const validatePassword = (password) => {
    if (password.length < 8) return "비밀번호는 최소 8자 이상이어야 합니다.";
    if (!/[A-Z]/.test(password))
      return "비밀번호에 최소 하나의 대문자가 필요합니다.";
    if (!/[a-z]/.test(password))
      return "비밀번호에 최소 하나의 소문자가 필요합니다.";
    if (!/[0-9]/.test(password))
      return "비밀번호에 최소 하나의 숫자가 필요합니다.";
    if (!/[@$!%*?&]/.test(password))
      return "비밀번호에 최소 하나의 특수문자가 필요합니다.";
    return "";
  };

  // ✅ 비밀번호 재설정 API 호출
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("유효하지 않은 요청입니다.");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      console.log("🚀 [CSRF] 토큰 가져오는 중...");
      const csrfToken = await getCsrfToken(); // ✅ CSRF 토큰 가져오기

      if (!csrfToken) {
        setError("CSRF 토큰을 가져오지 못했습니다.");
        return;
      }

      await axios.post(
        "/reset-password",
        { token, password },
        {
          withCredentials: true, // ✅ 쿠키 포함 필수
          headers: {
            "X-CSRF-Token": csrfToken, // ✅ CSRF 토큰 추가
          },
        }
      );

      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000); // 3초 후 로그인 페이지로 이동
    } catch (err) {
      setError(err.response?.data?.message || "비밀번호 변경 실패");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="p-8 rounded-lg w-3/4 max-w-md bg-white shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">비밀번호 재설정</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success ? (
          <p className="text-green-500 text-center">
            비밀번호가 성공적으로 변경되었습니다! <br />
            잠시 후 로그인 페이지로 이동합니다...
          </p>
        ) : (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="새 비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-3 rounded-lg w-full"
              required
            />
            <input
              type="password"
              placeholder="새 비밀번호 확인"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border p-3 rounded-lg w-full"
              required
            />
            <button
              type="submit"
              className="bg-blue-500 text-white py-3 rounded-lg shadow-lg hover:bg-blue-600"
            >
              비밀번호 변경
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordPage;
