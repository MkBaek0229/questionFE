import React, { useEffect, useState } from "react";
import axios from "axios";
import CategoryBarChart from "./CategoryBarChart"; // 그래프 컴포넌트

function CategoryScoresChart({ systemId, diagnosisRound }) {
  const [categoryScores, setCategoryScores] = useState([]);

  useEffect(() => {
    const fetchCategoryScores = async () => {
      try {
        // diagnosisRound가 있으면 쿼리 파라미터로 전달
        const url = `http://localhost:3000/result/category-protection-scores/${systemId}${
          diagnosisRound ? `?diagnosisRound=${diagnosisRound}` : ""
        }`;

        const response = await axios.get(url, { withCredentials: true });
        setCategoryScores(response.data);
      } catch (error) {
        console.error("❌ 분야별 보호 수준 데이터 가져오기 실패:", error);
      }
    };

    fetchCategoryScores();
  }, [systemId, diagnosisRound]); // diagnosisRound 의존성 추가

  return (
    <div className="p-6 bg-white rounded-lg shadow-md w-full max-w-2xl">
      <h2 className="text-xl font-bold text-gray-700 mb-4">
        📊 진단 분야별 보호 수준
      </h2>
      {categoryScores.length > 0 ? (
        <CategoryBarChart categoryScores={categoryScores} />
      ) : (
        <p className="text-gray-500">데이터를 불러오는 중...</p>
      )}
    </div>
  );
}

export default CategoryScoresChart;
