import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useRecoilState } from "recoil";
import {
  quantitativeDataState,
  currentStepState,
} from "../../state/selfTestState";
import { quantitativeFeedbackState } from "../../state/feedback";

function DiagnosisFeedbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { systemId } = location.state || {};

  const [quantitativeData, setQuantitativeData] = useRecoilState(
    quantitativeDataState
  );
  const [feedbacks, setFeedbacks] = useRecoilState(quantitativeFeedbackState);
  const [currentStep, setCurrentStep] = useRecoilState(currentStepState);
  const [responses, setResponses] = useState({});

  useEffect(() => {
    if (!systemId) {
      console.error("System ID가 누락되었습니다.");
      alert("시스템 정보가 없습니다. 대시보드로 이동합니다.");
      navigate("/dashboard");
      return;
    }

    const fetchQuantitativeData = async () => {
      try {
        // 1️⃣ 기관회원 userId 조회
        const ownerResponse = await axios.get(
          "http://localhost:3000/system-owner",
          { params: { systemId }, withCredentials: true }
        );

        if (!ownerResponse.data.userId) {
          console.error("❌ 기관회원 ID 조회 실패:", ownerResponse.data);
          alert("기관회원 정보를 가져올 수 없습니다.");
          return;
        }

        const userId = ownerResponse.data.userId;
        console.log("✅ 기관회원 ID 조회 성공:", userId);

        // 2️⃣ 정량 질문 조회
        const questionResponse = await axios.get(
          "http://localhost:3000/selftest/quantitative",
          { params: { systemId }, withCredentials: true }
        );
        const questions = questionResponse.data || [];

        // 3️⃣ 정량 응답 조회 (userId 추가)
        const responseResponse = await axios.get(
          "http://localhost:3000/selftest/quantitative/responses",
          { params: { systemId, userId }, withCredentials: true }
        );
        const responses = responseResponse.data || [];

        // 4️⃣ 응답 데이터를 질문 데이터와 병합 (🚨 추가적인 `additional_comment` 반영)
        const responseMap = responses.reduce((acc, item) => {
          acc[item.question_number] = item;
          return acc;
        }, {});

        const mergedData = questions.map((question) => ({
          ...question,
          response:
            responseMap[question.question_number]?.response || "응답 없음",
          feedback:
            responseMap[question.question_number]?.feedback || "피드백 없음",
          additional_comment:
            responseMap[question.question_number]?.additional_comment || "",
          file_path: responseMap[question.question_number]?.file_path || "",
        }));

        setQuantitativeData(mergedData);
        console.log("✅ 병합된 정량 데이터:", mergedData);

        // 5️⃣ responses 상태도 업데이트 (UI 반영용)
        const initialResponses = mergedData.reduce((acc, item) => {
          acc[item.question_number] = {
            response: item.response,
            feedback: item.feedback,
            additionalComment: item.additional_comment || "", // ✅ 추가
          };
          return acc;
        }, {});
        setResponses(initialResponses);
      } catch (error) {
        console.error("Error fetching quantitative data:", error);
        alert("데이터를 불러오는 중 오류가 발생했습니다.");
      }
    };

    fetchQuantitativeData();
  }, [systemId, navigate, setQuantitativeData]);

  const handleFeedbackChange = (questionNumber, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionNumber]: {
        ...prev[questionNumber],
        feedback: value,
        // ✅ "자문 필요" 선택 시 기존의 `additional_comment` 유지
        additionalComment:
          responses[questionNumber]?.response === "자문 필요"
            ? responses[questionNumber]?.additionalComment || ""
            : "",
      },
    }));
  };

  const saveAllFeedbacks = async () => {
    const feedbackData = quantitativeData.map((item) => ({
      questionNumber: item.question_number,
      systemId,
      feedback: responses[item.question_number]?.feedback || "피드백 없음",
    }));

    console.log("Sending feedback data:", feedbackData);

    try {
      const response = await axios.post(
        "http://localhost:3000/selftest/quantitative/feedback",
        { systemId, feedbackResponses: feedbackData },
        { withCredentials: true }
      );

      alert(response.data.msg || "모든 피드백이 저장되었습니다.");
      console.log(
        "Navigating to /QualitativeSurveyfeedback with systemId:",
        systemId
      );

      // Navigate with systemId in state
      navigate("/QualitativeSurveyfeedback", { state: { systemId } });
    } catch (error) {
      console.error("Error saving feedback:", error.response?.data || error);
      alert(
        error.response?.data?.msg ||
          "피드백 저장 중 오류가 발생했습니다. 다시 시도해주세요."
      );
    }
  };

  const handleNextClick = () => {
    if (currentStep < 43) {
      setCurrentStep((prev) => prev + 1);
    } else {
      saveAllFeedbacks();
    }
  };

  const handlePreviousClick = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const renderCurrentStep = () => {
    const currentData = quantitativeData.find(
      (item) => item.question_number === currentStep
    ) || {
      question_number: currentStep,
      unit: "N/A",
      evaluation_method: "N/A",
      score: "N/A",
      question: "질문 없음",
      legal_basis: "N/A",
      criteria_and_references: "N/A",
      file_upload: "",
      response: "",
      feedback: "피드백 없음",
    };

    return (
      <table className="w-full border-collapse border border-gray-300 mb-6">
        <tbody>
          <tr>
            <td className="bg-gray-200 p-2 border">지표 번호</td>
            <td className="p-2 border">{currentData.question_number}</td>
            <td className="bg-gray-200 p-2 border">단위</td>
            <td className="p-2 border">{currentData.unit}</td>
          </tr>
          <tr>
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
            <td className="bg-gray-200 p-2 border">근거법령</td>
            <td colSpan="3" className="p-2 border">
              {currentData.legal_basis}
            </td>
          </tr>
          <tr>
            <td className="bg-gray-200 p-2 border">평가기준</td>
            <td colSpan="3" className="p-2 border">
              {currentData.evaluation_criteria}
            </td>
          </tr>

          <tr>
            <td className="bg-gray-200 p-2 border">파일 첨부</td>
            <td colSpan="3" className="p-2 border">
              {currentData.file_upload ? (
                <a
                  href={currentData.file_upload}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  첨부 파일 보기
                </a>
              ) : (
                "파일 없음"
              )}
            </td>
          </tr>
          <tr>
            <td className="bg-gray-200 p-2 border">기관회원 응답</td>
            <td colSpan="3" className="p-2 border">
              <input
                type="text"
                value={currentData.response || "응답 없음"}
                readOnly
                className="w-full p-2 border border-gray-300 bg-gray-100"
              />
            </td>
          </tr>
          {/* 🚨 "자문 필요"일 경우 추가적인 자문 내용 표시 */}
          {currentData.response === "자문 필요" && (
            <tr>
              <td className="bg-gray-200 p-2 border">자문 내용</td>
              <td colSpan="3" className="p-2 border">
                <textarea
                  value={currentData.additional_comment || "자문 내용 없음"}
                  readOnly
                  className="w-full p-2 border border-gray-300 bg-gray-100"
                />
              </td>
            </tr>
          )}
          <tr>
            <td className="bg-gray-200 p-2 border">피드백</td>
            <td colSpan="3" className="p-2 border">
              <textarea
                value={responses[currentStep]?.feedback || "피드백 없음"}
                onChange={(e) =>
                  handleFeedbackChange(currentStep, e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="피드백을 입력하세요"
              />
            </td>
          </tr>
        </tbody>
      </table>
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center">
      <div className="container mx-auto max-w-5xl bg-white mt-10 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-6">
          정량 피드백 작성 ({currentStep}/43)
        </h2>
        {renderCurrentStep()}
        <div className="flex justify-between mt-6">
          <button
            onClick={handlePreviousClick}
            disabled={currentStep === 1}
            className="px-6 py-2 bg-gray-400 text-white rounded-md shadow hover:bg-gray-500"
          >
            이전
          </button>
          <button
            onClick={handleNextClick}
            className="px-6 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
          >
            {currentStep === 43 ? "완료" : "다음"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DiagnosisFeedbackPage;
