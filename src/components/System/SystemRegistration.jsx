import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useRecoilState } from "recoil";
import { authState } from "../../state/authState";
import { formState } from "../../state/formState";

function SystemRegistration() {
  const auth = useRecoilValue(authState); // 로그인된 사용자 정보 가져오기
  const [formData, setFormData] = useRecoilState(formState); // 전역 상태 관리
  const navigate = useNavigate();

  // 폼 데이터 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      system: {
        ...prevState.system,
        [name]: value || "", // 기본값 설정
      },
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

      // reason 필드가 빈 문자열인 경우 기본값 설정
      const reason = formData.system.reason || "동의";

      console.log("🚀 [POST] 요청 데이터:", {
        ...formData.system,
        reason,
        user_id: auth.user.id,
      });

      const response = await axios.post(
        "http://localhost:3000/systems",
        { ...formData.system, reason, user_id: auth.user.id },
        {
          withCredentials: true,
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
              value={formData.system.name || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="시스템 이름을 입력하세요"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">
              최소 문항 수
            </label>
            <input
              type="number"
              name="min_subjects"
              value={formData.system.min_subjects || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="최소 문항 수를 입력하세요"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">
              최대 문항 수
            </label>
            <input
              type="number"
              name="max_subjects"
              value={formData.system.max_subjects || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="최대 문항 수를 입력하세요"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">처리 목적</label>
            <input
              type="text"
              name="purpose"
              value={formData.system.purpose || ""}
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
              value={formData.system.is_private ? "포함" : "미포함"}
              onChange={(e) =>
                handleChange({
                  target: {
                    name: "is_private",
                    value: e.target.value === "포함",
                  },
                })
              }
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
              value={formData.system.is_unique ? "포함" : "미포함"}
              onChange={(e) =>
                handleChange({
                  target: {
                    name: "is_unique",
                    value: e.target.value === "포함",
                  },
                })
              }
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
              value={formData.system.is_resident ? "포함" : "미포함"}
              onChange={(e) =>
                handleChange({
                  target: {
                    name: "is_resident",
                    value: e.target.value === "포함",
                  },
                })
              }
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
              value={formData.system.reason || "동의"}
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
