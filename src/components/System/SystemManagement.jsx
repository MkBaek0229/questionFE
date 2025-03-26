// src/pages/System/SystemManagement.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../../axiosInstance";
import { format } from "date-fns";

function SystemManagement() {
  const [summaryList, setSummaryList] = useState([]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axiosInstance.get(
          "http://localhost:3000/system/summary",
          {
            withCredentials: true,
          }
        );
        setSummaryList(res.data);
      } catch (error) {
        console.error("시스템 요약 불러오기 실패:", error);
      }
    };

    fetchSummary();
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">등록된 시스템</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryList.map((item) => (
          <div key={item.systems_id} className="bg-white border rounded-xl p-6">
            <h3 className="text-xl font-bold">{item.system_name}</h3>
            <p className="text-gray-500 text-sm mb-2">{item.description}</p>

            <div className="my-3">
              <p className="text-sm font-semibold">준수율:</p>
              <div className="bg-gray-100 rounded-full h-2 mt-1">
                <div
                  className="bg-black h-2 rounded-full"
                  style={{
                    width: item.compliance_rate
                      ? `${item.compliance_rate}%`
                      : "0%",
                  }}
                ></div>
              </div>
              <p className="text-right text-sm mt-1">
                {item.compliance_rate ? `${item.compliance_rate}%` : "-"}
              </p>
            </div>

            <p className="text-sm mt-2">
              <strong>최근 진단:</strong>{" "}
              {item.latest_self_assessment_date
                ? format(
                    new Date(item.latest_self_assessment_date),
                    "yyyy-MM-dd"
                  )
                : "-"}
            </p>
            <p className="text-sm mt-1">
              <strong>피드백 상태:</strong>{" "}
              {item.feedback_status === "완료"
                ? "✅ 완료"
                : item.feedback_status === "대기 중"
                ? "⌛ 대기 중"
                : "진단 필요"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SystemManagement;
