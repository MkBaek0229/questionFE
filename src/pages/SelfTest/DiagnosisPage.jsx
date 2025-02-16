import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useRecoilState, useResetRecoilState } from "recoil";
import {
  quantitativeDataState,
  quantitativeResponsesState,
  currentStepState,
} from "../../state/selfTestState";

const getCsrfToken = async () => {
  try {
    const response = await axios.get("http://localhost:3000/csrf-token", {
      withCredentials: true, // ✅ 세션 쿠키 포함
    });
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
    const fetchQuantitativeData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/selftest/quantitative",
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
      await axios.post(
        "http://localhost:3000/user/selftest/quantitative",
        { responses: formattedResponses },
        { withCredentials: true, headers: { "X-CSRF-Token": csrfToken } }
      );
      console.log("✅ [DEBUG] 정량 평가 저장 완료");
      alert("✅ 정량 평가 응답이 저장되었습니다.");
      navigate("/qualitative-survey", { state: { systemId, userId } });
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
    setQuantitativeResponses((prev) => ({
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
    setQuantitativeResponses((prev) => ({
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
        <h2 className="text-xl font-bold mb-6">정량 설문조사</h2>

        {/* ✅ 현재 문항 표시 */}
        {quantitativeData.length > 0 ? (
          <table className="w-full border-collapse border border-gray-300 mb-6">
            <tbody>
              <tr>
                <td className="bg-gray-200 p-2 border">지표 번호</td>
                <td className="p-2 border">
                  {quantitativeData[currentStep - 1]?.question_number ||
                    currentStep}
                </td>
              </tr>
              <tr>
                <td className="bg-gray-200 p-2 border">지표</td>
                <td colSpan="3" className="p-2 border">
                  {quantitativeData[currentStep - 1]?.question || "질문 없음"}
                </td>
              </tr>
              <tr>
                <td className="bg-gray-200 p-2 border">평가기준</td>
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
                <td className="bg-gray-200 p-2 border">평가</td>
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

        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
          >
            이전
          </button>
          <button onClick={handleNextClick}>
            {currentStep === quantitativeData.length ? "저장 후 완료" : "다음"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DiagnosisPage;
