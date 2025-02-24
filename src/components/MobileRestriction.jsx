import React from "react";

function MobileRestriction() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">접근 제한</h1>
        <div className="w-24 h-24 mx-auto mb-4  overflow-hidden border-4 border-gray-300">
          <img
            src="src/assets/logo/MainLogo.png"
            alt="마틴랩 로고"
            className="w-full h-full object-cover"
          />
        </div>

        <p className="text-lg text-gray-600 mb-4">
          현재 사용 중인 디바이스는 지원되지 않습니다.
        </p>
        <p className="text-lg text-gray-600">
          태블릿 또는 PC를 이용해 접속해 주세요.
        </p>
      </div>
    </div>
  );
}

export default MobileRestriction;
