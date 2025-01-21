import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

function CompletionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const system = location.state?.system || {}; // ✅ `Dashboard.js`에서 전달받은 데이터

  console.log("📂 Received system data in CompletionPage:", system);

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center">
      <div className="container mx-auto max-w-4xl bg-white mt-10 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          자가진단 결과 - {system.system_name}
        </h2>
        <div className="text-lg text-gray-700 mb-6">
          <span className="font-semibold">시스템 ID:</span>{" "}
          <span className="font-bold">{system.system_id}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-blue-100 rounded-md text-center">
            <h3 className="text-lg font-bold text-blue-600">점수</h3>
            <p className="text-3xl font-extrabold">{system.score ?? "N/A"}</p>
          </div>
          <div className="p-4 bg-green-100 rounded-md text-center">
            <h3 className="text-lg font-bold text-green-600">등급</h3>
            <p className="text-3xl font-extrabold">{system.grade ?? "N/A"}</p>
          </div>
        </div>
        <div className="p-4 bg-gray-100 rounded-md mb-6">
          <h3 className="text-lg font-bold text-gray-600">피드백 상태</h3>
          <p className="text-gray-700">
            {system.feedback_status ?? "전문가 피드백 없음"}
          </p>
        </div>

        {/* ✅ 전문가 피드백 추가 */}
        <div className="p-4 bg-yellow-100 rounded-md mb-6">
          <h3 className="text-lg font-bold text-yellow-700">전문가 피드백</h3>
          <p className="text-gray-700">
            {system.feedback_content
              ? `"${system.feedback_content}" - ${
                  system.expert_name || "익명 전문가"
                }`
              : "아직 피드백이 작성되지 않았습니다."}
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2 bg-gray-400 text-white rounded-md shadow hover:bg-gray-500"
          >
            대시보드로 이동
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompletionPage;
