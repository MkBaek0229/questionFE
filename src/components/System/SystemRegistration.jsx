import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function SystemRegistration({ userId }) {
  const [formData, setFormData] = useState({
    name: "",
    min_subjects: "",
    max_subjects: "",
    purpose: "",
    is_private: "포함",
    is_unique: "미포함",
    is_resident: "포함",
    reason: "동의",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:3000/systems",
        { ...formData, user_id: userId },
        {
          withCredentials: true,
        }
      );
      alert("시스템 등록이 완료되었습니다!");
      navigate("/dashboard"); // 등록 완료 후 대시보드로 이동
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "시스템 등록 실패");
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
              value={formData.name}
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
              value={formData.min_subjects}
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
              value={formData.max_subjects}
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
              value={formData.purpose}
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
              value={formData.is_private}
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
              value={formData.is_unique}
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
              value={formData.is_resident}
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
              value={formData.reason}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="동의">동의</option>
              <option value="법적 근거">법적 근거</option>
              <option value="기타">기타</option>
            </select>
          </div>
          {errorMessage && (
            <p className="text-red-500 text-center">{errorMessage}</p>
          )}
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
