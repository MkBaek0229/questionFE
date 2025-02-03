import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useRecoilState } from "recoil";
import {
  quantitativeDataState,
  responsesState,
  currentStepState,
} from "../../state/selfTestState";

function DiagnosisPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, systemId } = location.state || {};

  const [quantitativeData, setQuantitativeData] = useRecoilState(
    quantitativeDataState
  );
  const [responses, setResponses] = useRecoilState(responsesState);
  const [currentStep, setCurrentStep] = useRecoilState(currentStepState);

  useEffect(() => {
    if (!userId || !systemId) {
      alert("시스템 또는 사용자 정보가 누락되었습니다. 대시보드로 이동합니다.");
      navigate("/dashboard");
      return;
    }

    const fetchQuantitativeData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/selftest/quantitative",
          { params: { systemId }, withCredentials: true }
        );

        const data = response.data || [];
        setQuantitativeData(data);

        // 초기 응답 상태 설정
        const initialResponses = data.reduce((acc, item) => {
          acc[item.question_number] = {
            response: item.response || "",
            additionalComment: item.additional_comment || "",
            filePath: item.file_upload || null,
          };
          return acc;
        }, {});
        setResponses(initialResponses);
      } catch (error) {
        console.error("❌ 정량 데이터를 불러오는 중 오류 발생:", error);
        alert("정량 데이터를 불러오는 데 실패했습니다. 다시 시도해주세요.");
      }
    };

    fetchQuantitativeData();
  }, [userId, systemId, navigate, setQuantitativeData, setResponses]);

  // ✅ 정량 응답 저장 및 정성 평가 페이지 이동
  const saveAllResponses = async () => {
    if (!systemId || !userId || Object.keys(responses).length < 43) {
      alert("🚨 모든 문항에 응답해야 합니다.");
      return;
    }

    try {
      const formattedResponses = Object.entries(responses).map(
        ([question_number, responseData]) => {
          const normalizedResponse = responseData.response.trim();
          return {
            systemId,
            userId,
            questionId: Number(question_number),
            response: ["이행", "미이행", "해당없음", "자문필요"].includes(
              normalizedResponse
            )
              ? normalizedResponse
              : "이행",
            additionalComment:
              normalizedResponse === "자문필요"
                ? responseData.additionalComment?.trim() || "추가 의견 없음" // ✅ NULL 값 방지
                : "",
            filePath: responseData.filePath || null,
          };
        }
      );

      // ✅ 백엔드로 보내기 전에 데이터 확인
      console.log("📡 [DEBUG] 저장할 데이터:", formattedResponses);

      await axios.post(
        "http://localhost:3000/selftest/quantitative",
        { responses: formattedResponses },
        { withCredentials: true }
      );

      alert("✅ 정량 평가 응답이 저장되었습니다.");

      // 정량 평가 완료 후 정성 평가 페이지로 이동
      navigate("/qualitative-survey", { state: { systemId, userId } });
    } catch (error) {
      console.error("❌ 정량 평가 저장 실패:", error);
      alert("🚨 저장 중 오류 발생");
    }
  };

  const handleNextClick = async () => {
    if (currentStep < 43) {
      setCurrentStep((prev) => prev + 1);
    } else {
      await saveAllResponses(); // ✅ 마지막 질문일 때 저장 실행
    }
  };

  const handlePreviousClick = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleResponseChange = (questionNumber, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionNumber]: {
        ...prev[questionNumber],
        response: value,
        additionalComment:
          value === "자문필요"
            ? prev[questionNumber]?.additionalComment ||
              "추가 의견을 입력하세요"
            : "", // ✅ "자문필요" 선택 시 추가 의견 유지
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

  const renderCurrentStep = () => {
    if (!quantitativeData || quantitativeData.length === 0) {
      return <p className="text-center text-gray-500">로딩 중...</p>;
    }

    const currentData = quantitativeData.find(
      (item) => item.question_number === currentStep
    ) || {
      question_number: currentStep,
      question: "질문 없음",
      evaluation_criteria: "N/A",
      legal_basis: "N/A",
      score: "N/A",
      filePath: null,
      additional_comment: "",
    };

    return (
      <table className="w-full border-collapse border border-gray-300 mb-6">
        <tbody>
          <tr>
            <td className="bg-gray-200 p-2 border">지표 번호</td>
            <td className="p-2 border">{currentData.question_number}</td>
            <td className="bg-gray-200 p-2 border">배점</td>
            <td className="p-2 border">{currentData.score}</td>
          </tr>
          <tr>
            <td className="bg-gray-200 p-2 border">지표</td>
            <td colSpan="3" className="p-2 border">
              {currentData.question}
            </td>
          </tr>
          <tr>
            <td className="bg-gray-200 p-2 border">평가기준</td>
            <td colSpan="3" className="p-2 border">
              {currentData.evaluation_criteria}
            </td>
          </tr>
          <tr>
            <td className="bg-gray-200 p-2 border">평가</td>
            <td colSpan="3" className="p-2 border">
              <select
                value={responses[currentStep]?.response || ""}
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

          {responses[currentStep]?.response === "자문필요" && (
            <tr>
              <td className="bg-gray-200 p-2 border">자문 필요 사항</td>
              <td colSpan="3" className="p-2 border">
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="추가 의견을 입력하세요"
                  value={responses[currentStep]?.additionalComment || ""}
                  onChange={(e) =>
                    handleAdditionalCommentChange(currentStep, e.target.value)
                  }
                ></textarea>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center">
      <div className="container mx-auto max-w-5xl bg-white mt-10 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-6">정량 설문조사</h2>
        {renderCurrentStep()}
        <div className="flex justify-between mt-6">
          <button onClick={handlePreviousClick}>이전</button>
          <button onClick={handleNextClick}>
            {currentStep === 43 ? "완료" : "다음"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DiagnosisPage;
