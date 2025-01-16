import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ setIsExpertLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage("이메일과 비밀번호를 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:3000/login/expert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.resultCode === "S-1") {
        alert(data.msg); // 로그인 성공 메시지
        setIsExpertLoggedIn(true); // 로그인 상태 업데이트
        navigate("/system-management"); // 기본 페이지로 이동
      } else {
        setErrorMessage(data.msg || "로그인 실패");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("로그인 요청 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-3/4 max-w-md">
        <h1 className="text-2xl font-bold mb-6">로그인</h1>
        <div className="space-y-4">
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
          {errorMessage && (
            <p className="text-red-500 text-center">{errorMessage}</p>
          )}
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
