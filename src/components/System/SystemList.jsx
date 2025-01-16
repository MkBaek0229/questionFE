import React from "react";

function SystemList({ systems }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {systems.map((system, index) => (
        <div
          key={system.id}
          className="p-4 border rounded-lg shadow-sm bg-gray-50 text-center"
        >
          <h3 className="text-lg font-bold mb-2">시스템{index + 1}</h3>
          <p className="text-gray-700">{system.name}</p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md">
            자세히 보기
          </button>
        </div>
      ))}
    </div>
  );
}

export default SystemList;
