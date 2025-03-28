import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../../axiosInstance";
import { useRecoilState, useResetRecoilState } from "recoil";
import {
  qualitativeDataState,
  qualitativeResponsesState,
  qualitativeCurrentStepState,
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

function QualitativeSurvey() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, systemId, diagnosisRound } = location.state || {};

  // 자동 저장 관련 상태 추가
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const storageKey = `qualitative_responses_${systemId}_${userId}_${diagnosisRound}`;

  // 로컬 스토리지 저장 함수
  const saveToLocalStorage = (currentResponses) => {
    localStorage.setItem(storageKey, JSON.stringify(currentResponses));
    const currentTime = new Date().toISOString();
    localStorage.setItem(`${storageKey}_saved_time`, currentTime);
    setLastSavedTime(currentTime);
  };

  const [currentStep, setCurrentStep] = useRecoilState(
    qualitativeCurrentStepState
  );
  const [responses, setResponses] = useRecoilState(qualitativeResponsesState);
  const [qualitativeData, setQualitativeData] =
    useRecoilState(qualitativeDataState);

  const resetQualitativeResponses = useResetRecoilState(
    qualitativeResponsesState
  );
  const resetCurrentStep = useResetRecoilState(qualitativeCurrentStepState);
  const resetQualitativeData = useResetRecoilState(qualitativeDataState);
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
    if (!systemId || !userId) {
      alert("🚨 시스템 또는 사용자 정보가 누락되었습니다.");
      navigate("/dashboard");
      return;
    }

    console.log("🔄 [INFO] 새로운 시스템 감지 → 정성 평가 상태 초기화");
    resetQualitativeResponses();
    resetCurrentStep();
    resetQualitativeData();

    setCurrentStep(1);
  }, [
    systemId,
    userId,
    navigate,
    resetQualitativeResponses,
    resetCurrentStep,
    resetQualitativeData,
  ]);

  // 로컬스토리지에서 저장된 데이터 복구
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
          Object.keys(responses).length > 0
        ) {
          console.log("📂 저장된 정성평가 데이터 발견, 복구 중...");
          setResponses(parsedData);

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
  }, [systemId, userId, qualitativeData.length]);

  useEffect(() => {
    const fetchQualitativeData = async () => {
      try {
        const response = await axiosInstance.get(
          "http://localhost:3000/selftest/qualitative-questions",
          {
            params: { systemId },
            withCredentials: true,
          }
        );

        const data = response.data || [];
        setQualitativeData(data);

        console.log("📌 [DEBUG] 정성 평가 문항 개수:", data.length);

        // ✅ 기존 응답 데이터 초기화 (문항 개수에 맞게)
        const initialResponses = {};
        for (let i = 1; i <= data.length; i++) {
          initialResponses[i] = {
            response: "해당없음",
            additionalComment: "",
            filePath: null,
          };
        }
        setResponses(initialResponses);
      } catch (error) {
        console.error("❌ 정성 데이터를 불러오는 중 오류 발생:", error);
        alert("정성 데이터를 불러오는 데 실패했습니다.");
      }
    };

    fetchQualitativeData();
  }, [systemId, userId, setQualitativeData, setResponses]);

  // 페이지 이탈 경고 추가
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "작성 중인 내용이 있습니다. 페이지를 나가시겠습니까?";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // ✅ 파일 업로드 핸들러 - 자동 저장 추가
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
        ...responses,
        [questionNumber]: {
          ...responses[questionNumber],
          filePath,
        },
      };
      setResponses(updatedResponses);
      saveToLocalStorage(updatedResponses); // 자동 저장 추가
    } catch (error) {
      console.error("❌ 파일 업로드 실패:", error);
      alert("파일 업로드 중 오류가 발생했습니다.");
    }
  };

  const handleNextClick = () => {
    const totalQuestions = qualitativeData.length; // ✅ DB에서 가져온 문항 개수 반영

    if (currentStep < totalQuestions) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!systemId || !userId) {
      alert("🚨 시스템 또는 사용자 정보가 없습니다.");
      return;
    }

    // ✅ `question_id`를 `qualitativeData`에서 찾아서 사용
    const formattedResponses = Object.entries(responses).map(
      ([question_number, responseData]) => {
        const question = qualitativeData.find(
          (q) => Number(q.question_number) === Number(question_number)
        );

        return {
          systemId,
          userId,
          diagnosisRound,
          questionId: question?.id || null, // 🔥 여기가 핵심 (id로 저장)
          response: ["자문필요", "해당없음"].includes(
            responseData.response?.trim()
          )
            ? responseData.response.trim()
            : "해당없음",
          additionalComment:
            responseData.response === "자문필요"
              ? responseData.additionalComment?.trim() || "추가 의견 없음"
              : "",
          filePath: responseData.filePath || null,
        };
      }
    );

    try {
      console.log("📌 [DEBUG] 전송할 정성 평가 데이터:", formattedResponses);

      const response = await axiosInstance.post(
        "http://localhost:3000/selftest/qualitative-responses",
        { responses: formattedResponses },
        { withCredentials: true, headers: { "X-CSRF-Token": csrfToken } }
      );

      console.log("✅ [SUCCESS] 정성 평가 저장 응답:", response.data);

      const assessmentResponse = await axiosInstance.post(
        "http://localhost:3000/result/complete-selftest",
        { userId, systemId },
        { withCredentials: true, headers: { "X-CSRF-Token": csrfToken } }
      );

      console.log("✅ [SUCCESS] 평가 완료 응답:", assessmentResponse.data);

      alert("✅ 정성 평가가 완료되었습니다!");
      navigate("/completion", {
        state: { userId, systemId, diagnosisRound },
      });
    } catch (error) {
      console.error(
        "❌ [ERROR] 정성 평가 저장 실패:",
        error.response?.data || error
      );
      alert(
        `정성 평가 저장 중 오류가 발생했습니다. ${
          error.response?.data?.message || "서버 오류"
        }`
      );
    }
  };

  // 응답 변경 핸들러 - 자동 저장 추가
  const handleResponseChange = (questionNumber, value) => {
    const updatedResponses = {
      ...responses,
      [questionNumber]: {
        ...responses[questionNumber],
        response: value,
        additionalComment:
          value === "자문필요"
            ? responses[questionNumber]?.additionalComment || ""
            : "",
      },
    };
    setResponses(updatedResponses);
    saveToLocalStorage(updatedResponses);
  };

  // 추가 의견 변경 핸들러 - 자동 저장 추가
  const handleAdditionalCommentChange = (questionNumber, value) => {
    const updatedResponses = {
      ...responses,
      [questionNumber]: {
        ...responses[questionNumber],
        additionalComment: value,
      },
    };
    setResponses(updatedResponses);
    saveToLocalStorage(updatedResponses);
  };

  // 디자인 통일 - DiagnosisPage와 유사한 디자인으로 변경
  return (
    <div className="h-full flex flex-col justify-center items-center bg-white p-6">
      <div className="w-full max-w-[600px] py-8 gap-10">
        <h2 className="text-xl font-bold mb-6">정성 자가진단</h2>
        <div className="w-full mb-6">
          {/* 진행 상태 표시 */}
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">진행률</span>
            <span className="text-sm font-medium text-blue-600">
              {currentStep} / {qualitativeData.length} 문항
            </span>
          </div>

          {/* 진행 상태 바 */}
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{
                width: `${(currentStep / qualitativeData.length) * 100}%`,
              }}
            ></div>
          </div>

          {/* 단계 표시 */}
          <div className="flex justify-between mt-2">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">1</span>
              </div>
              <span className="text-xs mt-1">정량평가</span>
            </div>
            <div className="flex-1 relative top-4">
              <div className="h-0.5 bg-gray-300 w-full"></div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
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

        {/* 마지막 저장 시간 표시 */}
        {lastSavedTime && (
          <div className="text-right text-xs text-gray-500 mt-1 mb-2">
            마지막 저장: {new Date(lastSavedTime).toLocaleString()}
          </div>
        )}

        {/* 현재 문항 표시 */}
        {qualitativeData.length > 0 ? (
          <table className="w-full border-collapse border border-gray-300 mb-6">
            <tbody>
              <tr>
                <td className="bg-gray-200 p-2 border font-medium">
                  지표 번호
                </td>
                <td className="p-2 border">
                  {qualitativeData[currentStep - 1]?.question_number ||
                    currentStep}
                </td>
              </tr>
              <tr>
                <td className="bg-gray-200 p-2 border font-medium">지표</td>
                <td colSpan="3" className="p-2 border">
                  {qualitativeData[currentStep - 1]?.indicator || "질문 없음"}
                </td>
              </tr>
              <tr>
                <td className="bg-gray-200 p-2 border font-medium">평가기준</td>
                <td colSpan="3" className="p-2 border">
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        qualitativeData[currentStep - 1]?.evaluation_criteria ||
                        "N/A",
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
                  {responses[currentStep]?.filePath && (
                    <div className="mt-2 flex items-center">
                      <a
                        href={`http://localhost:3000${responses[currentStep].filePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        {responses[currentStep].filePath.split("/").pop()}
                      </a>
                      <button
                        onClick={() => {
                          const updatedResponses = {
                            ...responses,
                            [currentStep]: {
                              ...responses[currentStep],
                              filePath: null,
                            },
                          };
                          setResponses(updatedResponses);
                          saveToLocalStorage(updatedResponses); // 자동 저장 추가
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
                    value={responses[currentStep]?.response || "해당없음"}
                    onChange={(e) =>
                      handleResponseChange(currentStep, e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="자문필요">자문필요</option>
                    <option value="해당없음">해당없음</option>
                  </select>
                </td>
              </tr>
              {responses[currentStep]?.response === "자문필요" && (
                <tr>
                  <td className="bg-gray-200 p-2 border">자문 필요 사항</td>
                  <td className="p-2 border">
                    <textarea
                      placeholder="자문 필요 내용을 입력하세요"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={responses[currentStep]?.additionalComment || ""}
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
            className="w-[100%] h-[50px] text-[22px] text-black font-bold rounded-md"
            onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
          >
            이전
          </button>
          <button
            className="w-[100%] h-[50px] text-[22px] bg-blue-600 text-white font-bold rounded-md"
            onClick={handleNextClick}
          >
            {currentStep === qualitativeData.length ? "정성평가 완료" : "다음"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default QualitativeSurvey;
