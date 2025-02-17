import React, { useEffect, useState } from "react";
import axios from "axios";
import CategoryBarChart from "./CategoryBarChart"; // 그래프 컴포넌트

function CategoryScoresChart({ systemId }) {
  const [categoryScores, setCategoryScores] = useState([]);

  useEffect(() => {
    const fetchCategoryScores = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/category-scores/${systemId}`,
          { withCredentials: true }
        );
        setCategoryScores(response.data);
      } catch (error) {
        console.error("❌ 분야별 보호 수준 데이터 가져오기 실패:", error);
      }
    };

    fetchCategoryScores();
  }, [systemId]);

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
