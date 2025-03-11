import React, { useEffect, useState } from "react";
import axios from "../../axiosConfig";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useRecoilState } from "recoil";
import { authState } from "../../state/authState";
import { formState } from "../../state/formState";
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
function SystemRegistration() {
  const auth = useRecoilValue(authState); // 로그인된 사용자 정보 가져오기
  const [formData, setFormData] = useRecoilState(formState); // 전역 상태 관리
  const [csrfToken, setCsrfToken] = useState("");
  useEffect(() => {
    const fetchCsrfToken = async () => {
      const token = await getCsrfToken();
      setCsrfToken(token);
    };
    fetchCsrfToken();
  }, []);

  const navigate = useNavigate();

  // 폼 데이터 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value || "", // 기본값 설정
    }));
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!auth.user || !auth.user.id) {
        alert("사용자 정보가 없습니다. 다시 로그인해주세요.");
        return;
      }

      console.log("🚀 [POST] 요청 데이터:", {
        ...formData,
        user_id: auth.user.id,
      });
      console.log("📋 [DEBUG] reason 값:", formData.reason);

      const response = await axios.post(
        "/systems",
        { ...formData, user_id: auth.user.id },
        {
          withCredentials: true,
          headers: { "X-CSRF-Token": csrfToken },
        }
      );

      console.log("✅ [POST] 응답 데이터:", response.data);
      alert("시스템 등록이 완료되었습니다!");
      navigate("/dashboard"); // 등록 완료 후 대시보드로 이동
    } catch (error) {
      console.error(
        "❌ [POST] 에러 응답:",
        error.response?.data || error.message
      );
      alert(error.response?.data?.message || "시스템 등록 실패");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-3/4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">시스템 등록 확인</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">
              시스템 이름
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="시스템 이름을 입력하세요"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">
              정보 주체수
            </label>
            <input
              type="number"
              name="num_data_subjects"
              value={formData.num_data_subjects || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="정보 주체 수를 입력하세요"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">처리 목적</label>
            <input
              type="text"
              name="purpose"
              value={formData.purpose || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="처리 목적을 입력하세요"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">
              민감 정보 포함 여부
            </label>
            <select
              name="is_private"
              value={formData.is_private || "포함"}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="포함">포함</option>
              <option value="미포함">미포함</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium">
              고유 식별 정보 포함 여부
            </label>
            <select
              name="is_unique"
              value={formData.is_unique || "미포함"}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="포함">포함</option>
              <option value="미포함">미포함</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium">
              주민등록번호 포함 여부
            </label>
            <select
              name="is_resident"
              value={formData.is_resident || "포함"}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="포함">포함</option>
              <option value="미포함">미포함</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium">수집 근거</label>
            <select
              name="reason"
              value={formData.reason || "동의"}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="동의">동의</option>
              <option value="법적 근거">법적 근거</option>
              <option value="기타">기타</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            확인
          </button>
        </form>
      </div>
    </div>
  );
}

export default SystemRegistration;
