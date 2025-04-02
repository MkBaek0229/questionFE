import React from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

function StepProgressBar({ steps, currentStep }) {
  // 진행률 계산
  const totalSteps = steps.length - 1;
  const progressPercent = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* 단계 표시 */}
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <div
              key={index}
              className="flex flex-col items-center relative flex-1"
            >
              {/* 연결선 */}
              {index > 0 && (
                <div className="absolute top-5 w-full h-1 -left-1/2">
                  <div
                    className={`h-full ${
                      index <= currentStep ? "bg-blue-600" : "bg-slate-200"
                    }`}
                  />
                </div>
              )}

              {/* 단계 원형 아이콘 */}
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                  isCompleted || isActive
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
                initial={false}
                animate={
                  isActive
                    ? { scale: [1, 1.1, 1], backgroundColor: "#2563eb" }
                    : {}
                }
                transition={{ duration: 0.5 }}
              >
                {isCompleted ? (
                  <FontAwesomeIcon icon={faCheck} className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </motion.div>

              {/* 단계 이름 */}
              <span
                className={`mt-2 text-xs sm:text-sm font-medium ${
                  isActive
                    ? "text-blue-600"
                    : isCompleted
                    ? "text-slate-700"
                    : "text-slate-400"
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StepProgressBar;
