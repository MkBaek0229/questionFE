import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function CategoryBarChart({ categoryScores }) {
  const labels = categoryScores.map((item) => item.category);
  const currentScores = categoryScores.map((item) =>
    parseFloat(item.currentScore)
  );
  const maxScores = categoryScores.map((item) => parseFloat(item.maxScore));

  const data = {
    labels,
    datasets: [
      {
        label: "현재 보호 수준",
        data: currentScores,
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
      {
        label: "최대 보호 수준",
        data: maxScores,
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "진단 분야별 보호 수준 비교" },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return <Bar data={data} options={options} />;
}

export default CategoryBarChart;
