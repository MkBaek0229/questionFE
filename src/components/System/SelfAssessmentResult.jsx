import React from "react";

function SelfAssessmentResult({ systems }) {
  return (
    <div>
      {systems.map((system, index) => (
        <div key={system.id} className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                defaultChecked={index === 0} // 첫 번째 시스템 기본 체크
              />
              시스템{index + 1}
            </label>
            <span>{system.score}점</span>
          </div>
          <div className="w-full bg-gray-300 h-4 rounded-md overflow-hidden">
            <div
              className="bg-blue-600 h-4"
              style={{ width: `${system.score}%` }}
            ></div>
          </div>
        </div>
      ))}
      <div className="flex justify-between mt-4">
        <button className="px-4 py-2 bg-gray-300 rounded-md">
          자가 진단 실시
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md">
          자가 진단 결과
        </button>
      </div>
    </div>
  );
}

export default SelfAssessmentResult;
