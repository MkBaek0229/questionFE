import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../../axiosInstance";
import { useRecoilState, useResetRecoilState } from "recoil";
import {
  quantitativeDataState,
  quantitativeResponsesState,
  currentStepState,
} from "../../state/selfTestState";

const getCsrfToken = async () => {
  try {
    const response = await axiosInstance.get(
      "http://localhost:3000/csrf-token",
      {
        withCredentials: true, // ✅ 세션 쿠키 포함
      }
    );
    return response.data.csrfToken;
  } catch (error) {
    console.error("❌ CSRF 토큰 가져오기 실패:", error);
    return null;
  }
};

function DiagnosisPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, systemId } = location.state || {};
  const diagnosisRound = location.state?.diagnosisRound || 1;

  const [lastSavedTime, setLastSavedTime] = useState(null);
  const storageKey = `quantitative_responses_${systemId}_${userId}_${diagnosisRound}`;

  const saveToLocalStorage = (responses) => {
    localStorage.setItem(storageKey, JSON.stringify(responses));
    const currentTime = new Date().toISOString();
    localStorage.setItem(`${storageKey}_saved_time`, currentTime);
    setLastSavedTime(currentTime);
  };

  const [quantitativeData, setQuantitativeData] = useRecoilState(
    quantitativeDataState
  );
  const [quantitativeResponses, setQuantitativeResponses] = useRecoilState(
    quantitativeResponsesState
  );
  const [currentStep, setCurrentStep] = useRecoilState(currentStepState);

  const resetQuantitativeResponses = useResetRecoilState(
    quantitativeResponsesState
  );
  const resetCurrentStep = useResetRecoilState(currentStepState);
  const resetQuantitativeData = useResetRecoilState(quantitativeDataState);
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    const fetchCsrfToken = async () => {
      const token = await getCsrfToken();
      setCsrfToken(token);
    };
    fetchCsrfToken();
  }, []);

  // ✅ 시스템 변경 시 상태 초기화
  useEffect(() => {
    if (!userId || !systemId) {
      alert("🚨 시스템 또는 사용자 정보가 없습니다.");
      navigate("/dashboard");
      return;
    }

    console.log("🔄 [INFO] 새로운 시스템 감지 → 상태 초기화");
    resetQuantitativeResponses();
    resetCurrentStep();
    resetQuantitativeData();

    setCurrentStep(1);
  }, [
    systemId,
    userId,
    navigate,
    resetQuantitativeResponses,
    resetCurrentStep,
    resetQuantitativeData,
  ]);

  useEffect(() => {
    if (!systemId || !userId) return;

    try {
      const savedData = localStorage.getItem(storageKey);
      const savedTime = localStorage.getItem(`${storageKey}_saved_time`);

      if (savedData) {
        const parsedData = JSON.parse(savedData);

        // 데이터가 있고 초기화된 이후에만 복구
        if (
          Object.keys(parsedData).length > 0 &&
          Object.keys(quantitativeResponses).length > 0
        ) {
          console.log("📂 저장된 응답 데이터 발견, 복구 중...");
          setQuantitativeResponses(parsedData);

          if (savedTime) {
            setLastSavedTime(savedTime);
            console.log(
              "⏰ 마지막 저장 시간:",
              new Date(savedTime).toLocaleString()
            );
          }
        }
      }
    } catch (error) {
      console.error("❌ 로컬스토리지 데이터 복구 실패:", error);
    }
  }, [systemId, userId, quantitativeData.length]);

  useEffect(() => {
    const fetchQuantitativeData = async () => {
      try {
        const response = await axiosInstance.get(
          "http://localhost:3000/selftest/quantitative-questions",
          {
            params: { systemId },
            withCredentials: true,
          }
        );

        const data = response.data || [];
        setQuantitativeData(data);

        // ✅ 기존 응답 데이터 초기화
        const initialResponses = {};
        data.forEach((item, index) => {
          initialResponses[index + 1] = {
            response: "이행",
            additionalComment: "",
            filePath: null,
          };
        });
        setQuantitativeResponses(initialResponses);
      } catch (error) {
        console.error("❌ 정량 데이터를 불러오는 중 오류 발생:", error);
        alert("정량 데이터를 불러오는 데 실패했습니다.");
      }
    };

    fetchQuantitativeData();
  }, [systemId, userId, setQuantitativeData, setQuantitativeResponses]);

  // ✅ 파일 업로드 핸들러
  const handleFileUpload = async (event, questionNumber) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axiosInstance.post(
        "http://localhost:3000/upload/response-file", // ✅ 파일 업로드 API 경로
        formData,
        {
          withCredentials: true,
          headers: {
            "X-CSRF-Token": csrfToken,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const filePath = response.data.url; // ✅ 업로드된 파일 경로 받기
      console.log("✅ 업로드된 파일 경로:", filePath);
      const updatedResponses = {
        ...quantitativeResponses,
        [questionNumber]: {
          ...quantitativeResponses[questionNumber],
          filePath,
        },
      };
      setQuantitativeResponses(updatedResponses);
      saveToLocalStorage(updatedResponses);
    } catch (error) {
      console.error("❌ 파일 업로드 실패:", error);
      alert("파일 업로드 중 오류가 발생했습니다.");
    }
  };

  const handleNextClick = async () => {
    const totalQuestions = quantitativeData.length;

    if (currentStep < totalQuestions) {
      setCurrentStep((prev) => prev + 1);
    } else {
      console.log(
        "📌 [DEBUG] 문항 완료, 정량 평가 저장 후 정성 평가로 이동..."
      );
      await saveAllResponses();
      navigate("/qualitative-survey", { state: { systemId, userId } });
    }
  };

  const saveAllResponses = async () => {
    if (!systemId || !userId) {
      alert("🚨 시스템 또는 사용자 정보가 없습니다.");
      return;
    }

    const formattedResponses = Object.entries(quantitativeResponses).map(
      ([question_number, responseData]) => ({
        systemId,
        userId,
        diagnosisRound,
        questionId: Number(question_number),
        response: responseData.response?.trim() || "이행",
        additionalComment:
          responseData.response === "자문필요"
            ? responseData.additionalComment?.trim() || "추가 의견 없음"
            : "",
        filePath: responseData.filePath || null,
      })
    );

    try {
      await axiosInstance.post(
        "http://localhost:3000/selftest/quantitative-responses",
        { responses: formattedResponses },
        { withCredentials: true, headers: { "X-CSRF-Token": csrfToken } }
      );
      console.log("✅ [DEBUG] 정량 평가 저장 완료");
      alert("✅ 정량 평가 응답이 저장되었습니다.");
      navigate("/qualitative-survey", {
        state: { systemId, userId, diagnosisRound },
      });
    } catch (error) {
      console.error(
        "❌ [DEBUG] 정량 평가 저장 실패:",
        error.response?.data || error
      );
      alert(
        `🚨 저장 중 오류 발생: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleResponseChange = (questionNumber, value) => {
    const updatedResponses = {
      ...quantitativeResponses,
      [questionNumber]: {
        ...quantitativeResponses[questionNumber],
        response: value,
        additionalComment:
          value === "자문필요"
            ? quantitativeResponses[questionNumber]?.additionalComment || ""
            : "",
      },
    };

    setQuantitativeResponses(updatedResponses);

    saveToLocalStorage(updatedResponses);
  };

  const handleAdditionalCommentChange = (questionNumber, value) => {
    const updatedResponses = {
      ...quantitativeResponses,
      [questionNumber]: {
        ...quantitativeResponses[questionNumber],
        additionalComment: value,
      },
    };

    setQuantitativeResponses(updatedResponses);
    saveToLocalStorage(updatedResponses);
  };

  return (
    <div className="h-full flex flex-col justify-center items-center bg-white p-6">
      <div className="w-full max-w-[600px] py-8 gap-10">
        <h2 className="text-xl font-bold mb-6">정량 자가진단</h2>
        <div className="w-full mb-6">
          {/* 진행 상태 표시 */}
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">진행률</span>
            <span className="text-sm font-medium text-blue-600">
              {currentStep} / {quantitativeData.length} 문항
            </span>
          </div>

          {/* 진행 상태 바 */}
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{
                width: `${(currentStep / quantitativeData.length) * 100}%`,
              }}
            ></div>
          </div>

          {/* 단계 표시 */}
          <div className="flex justify-between mt-2">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">1</span>
              </div>
              <span className="text-xs mt-1">정량평가</span>
            </div>
            <div className="flex-1 relative top-4">
              <div className="h-0.5 bg-gray-300 w-full"></div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">2</span>
              </div>
              <span className="text-xs mt-1">정성평가</span>
            </div>
            <div className="flex-1 relative top-4">
              <div className="h-0.5 bg-gray-300 w-full"></div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">3</span>
              </div>
              <span className="text-xs mt-1">결과</span>
            </div>
          </div>
        </div>
        {lastSavedTime && (
          <div className="text-right text-xs text-gray-500 mt-1 mb-2">
            마지막 저장: {new Date(lastSavedTime).toLocaleString()}
          </div>
        )}
        {/* ✅ 현재 문항 표시 */}
        {quantitativeData.length > 0 ? (
          <table className="w-full border-collapse border border-gray-300 mb-6">
            <tbody>
              <tr>
                <td className="bg-gray-200 p-2 border font-medium">
                  지표 번호
                </td>
                <td className="p-2 border">
                  {quantitativeData[currentStep - 1]?.question_number ||
                    currentStep}
                </td>
              </tr>
              <tr>
                <td className="bg-gray-200 p-2 border font-medium">지표</td>
                <td colSpan="3" className="p-2 border">
                  {quantitativeData[currentStep - 1]?.question || "질문 없음"}
                </td>
              </tr>
              <tr>
                <td className="bg-gray-200 p-2 border font-medium">평가기준</td>
                <td colSpan="3" className="p-2 border">
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        quantitativeData[currentStep - 1]
                          ?.evaluation_criteria || "N/A",
                    }}
                  />
                </td>
              </tr>
              <tr>
                <td className="bg-gray-200 p-2 border font-medium">
                  파일 업로드
                </td>
                <td colSpan="3" className="p-2 border">
                  <label className="cursor-pointer bg-blue-500 text-white px-4 py-1 rounded">
                    파일 선택
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      onChange={(e) => handleFileUpload(e, currentStep)}
                      className="hidden"
                    />
                  </label>
                  {quantitativeResponses[currentStep]?.filePath && (
                    <div className="mt-2 flex items-center">
                      <a
                        href={`http://localhost:3000${quantitativeResponses[currentStep].filePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        {quantitativeResponses[currentStep].filePath
                          .split("/")
                          .pop()}{" "}
                        {/* 파일명 표시 */}
                      </a>
                      <button
                        onClick={() => {
                          const updatedResponses = {
                            ...quantitativeResponses,
                            [currentStep]: {
                              ...quantitativeResponses[currentStep],
                              filePath: null,
                            },
                          };
                          setQuantitativeResponses(updatedResponses);
                          saveToLocalStorage(updatedResponses); // 추가: 로컬스토리지에 저장
                        }}
                        className="ml-2 bg-red-500 text-white px-2 py-1 rounded text-sm"
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </td>
              </tr>
              <tr>
                <td className="bg-gray-200 p-2 border font-medium">평가</td>
                <td colSpan="3" className="p-2 border">
                  <select
                    value={
                      quantitativeResponses[currentStep]?.response || "이행"
                    }
                    onChange={(e) =>
                      handleResponseChange(currentStep, e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="이행">이행</option>
                    <option value="미이행">미이행</option>
                    <option value="해당없음">해당없음</option>
                    <option value="자문필요">자문필요</option>
                  </select>
                </td>
              </tr>
              {/* "자문필요" 선택 시 추가 의견 입력란 표시 */}
              {quantitativeResponses[currentStep]?.response === "자문필요" && (
                <tr>
                  <td className="bg-gray-200 p-2 border">자문 필요 사항</td>
                  <td className="p-2 border">
                    <textarea
                      placeholder="자문 필요 내용을 입력하세요"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={
                        quantitativeResponses[currentStep]?.additionalComment ||
                        ""
                      }
                      onChange={(e) =>
                        handleAdditionalCommentChange(
                          currentStep,
                          e.target.value
                        )
                      }
                    ></textarea>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500">로딩 중...</p>
        )}
        <div className="mt-6">
          <button
            className="w-[100%] h-[50px] text-[22px]  text-black font-bold rounded-md"
            onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
          >
            이전
          </button>
          <button
            className="w-[100%] h-[50px] text-[22px]  bg-blue-600 text-white font-bold rounded-md"
            onClick={handleNextClick}
          >
            {currentStep === quantitativeData.length ? "정량평가 완료" : "체크"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DiagnosisPage;
