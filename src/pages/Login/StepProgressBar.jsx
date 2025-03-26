function StepProgressBar({ steps, currentStep }) {
  // 예: step=0 → 0% / step=1 → 33% / step=2 → 66% / step=3 → 100%
  const totalSteps = steps.length - 1; // (예: 3)
  const progressPercent = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full max-w-[600px] px-4 mb-4">
      {/* 진행 라인(전체 바탕) */}
      <div className="relative h-2 bg-gray-300 rounded-full">
        {/* 채워지는 부분 */}
        <div
          className="absolute top-0 left-0 h-2 bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 단계 표시용 마커 */}
      <div className="flex justify-between mt-2">
        {steps.map((label, index) => {
          // 현재 스텝보다 작거나 같으면 활성화(파란색), 아니면 회색
          const isActive = index <= currentStep;
          return (
            <div key={index} className="flex flex-col items-center">
              <span
                className={`text-sm mt-1 ${
                  isActive ? "text-blue-600 font-bold" : "text-gray-500"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StepProgressBar;
