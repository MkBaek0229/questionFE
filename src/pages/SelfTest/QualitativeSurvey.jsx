import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../../axiosConfig";
import { useRecoilState, useResetRecoilState } from "recoil";
import {
  qualitativeDataState,
  qualitativeResponsesState,
  qualitativeCurrentStepState,
} from "../../state/selfTestState";

const getCsrfToken = async () => {
  try {
    const response = await axios.get("/csrf-token", {
      withCredentials: true, // ✅ 세션 쿠키 포함
    });
    return response.data.csrfToken;
  } catch (error) {
    console.error("❌ CSRF 토큰 가져오기 실패:", error);
    return null;
  }
};

function QualitativeSurvey() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, systemId } = location.state || {};

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

  useEffect(() => {
    const fetchQualitativeData = async () => {
      try {
        const response = await axios.get(
          "/selftest/qualitative",
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

  // ✅ 파일 업로드 핸들러
  const handleFileUpload = async (event, questionNumber) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post(
        "/upload/response-file", // ✅ 파일 업로드 API 경로
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
      setResponses((prev) => ({
        ...prev,
        [questionNumber]: {
          ...prev[questionNumber],
          filePath,
        },
      }));
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

      const response = await axios.post(
        "/user/selftest/qualitative",
        { responses: formattedResponses },
        { withCredentials: true, headers: { "X-CSRF-Token": csrfToken } }
      );

      console.log("✅ [SUCCESS] 정성 평가 저장 응답:", response.data);

      const assessmentResponse = await axios.post(
        "/assessment/complete",
        { userId, systemId },
        { withCredentials: true, headers: { "X-CSRF-Token": csrfToken } }
      );

      console.log("✅ [SUCCESS] 평가 완료 응답:", assessmentResponse.data);

      alert("✅ 정성 평가가 완료되었습니다!");
      navigate("/completion", { state: { userId, systemId } });
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

  const handleResponseChange = (questionNumber, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionNumber]: {
        ...prev[questionNumber],
        response: value,
        additionalComment:
          value === "자문필요"
            ? prev[questionNumber]?.additionalComment || ""
            : "",
      },
    }));
  };

  const handleAdditionalCommentChange = (questionNumber, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionNumber]: {
        ...prev[questionNumber],
        additionalComment: value,
      },
    }));
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center">
      <div className="container mx-auto max-w-5xl bg-white mt-10 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-6">
          정성 평가 ({currentStep}/{qualitativeData.length}번)
        </h2>

        {/* ✅ 현재 문항 표시 */}
        {qualitativeData.length > 0 ? (
          <table className="w-full border-collapse border border-gray-300 mb-6">
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2 bg-gray-200">
                  지표 번호
                </td>
                <td className="border border-gray-300 p-2">
                  {qualitativeData[currentStep - 1]?.question_number ||
                    currentStep}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 bg-gray-200">지표</td>
                <td className="border border-gray-300 p-2">
                  {qualitativeData[currentStep - 1]?.indicator || "질문 없음"}
                </td>
              </tr>
              {/* ✅ 파일 업로드 추가 */}
              <tr>
                <td className="border border-gray-300 p-2 bg-gray-200">
                  파일 업로드
                </td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={(e) => handleFileUpload(e, currentStep)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  {responses[currentStep]?.filePath && (
                    <div className="mt-2 flex items-center">
                      <a
                        href={`${responses[currentStep].filePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        {responses[currentStep].filePath.split("/").pop()}
                      </a>
                      <button
                        onClick={() =>
                          setResponses((prev) => ({
                            ...prev,
                            [currentStep]: {
                              ...prev[currentStep],
                              filePath: null,
                            },
                          }))
                        }
                        className="ml-2 bg-red-500 text-white px-2 py-1 rounded text-sm"
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 bg-gray-200">
                  평가기준
                </td>
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
                <td className="border border-gray-300 p-2 bg-gray-200">평가</td>
                <td className="border border-gray-300 p-2">
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
                  <td className="border border-gray-300 p-2 bg-gray-200">
                    자문 필요 사항
                  </td>
                  <td className="border border-gray-300 p-2">
                    <textarea
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

        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
          >
            이전
          </button>
          <button onClick={handleNextClick}>
            {currentStep === qualitativeData.length ? "완료" : "다음"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default QualitativeSurvey;
