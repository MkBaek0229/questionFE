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
  const { systemId, expertId } = location.state || {};
  // const expertId = sessionStorage.getItem("expertId");

  const [quantitativeData, setQuantitativeData] = useRecoilState(
    quantitativeDataState
  );
  const [feedbacks, setFeedbacks] = useRecoilState(quantitativeFeedbackState);
  const [currentStep, setCurrentStep] = useRecoilState(currentStepState);
  const [responses, setResponses] = useState({});
  const [newFeedbacks, setNewFeedbacks] = useState({});

  useEffect(() => {
    if (!systemId) {
      alert("시스템 정보가 없습니다. 대시보드로 이동합니다.");
      navigate("/dashboard");
      return;
    }

    const fetchQuantitativeData = async () => {
      try {
        console.log("📡 Fetching quantitative data for systemId:", systemId);

        const ownerResponse = await axios.get(
          "http://localhost:3000/system-owner",
          { params: { systemId }, withCredentials: true }
        );

        if (!ownerResponse.data.userId) {
          alert("기관회원 정보를 가져올 수 없습니다.");
          return;
        }

        const userId = ownerResponse.data.userId;

        const responseResponse = await axios.get(
          `http://localhost:3000/selftest/quantitative/responses?systemId=${systemId}&userId=${userId}`,
          { withCredentials: true }
        );

        let responses = responseResponse.data || [];

        console.log("✅ 정량 응답 데이터:", responses);

        const responseMap = responses.reduce((acc, item) => {
          acc[item.question_number] = {
            response: item.response || "응답 없음",
            additionalComment: item.additional_comment || "",
            feedbacks: Array.isArray(item.feedbacks) ? item.feedbacks : [],
          };
          return acc;
        }, {});

        setResponses(responseMap);
        setQuantitativeData(responses);

        // ✅ 기존 피드백을 newFeedbacks에 초기값으로 설정
        const feedbackMap = responses.reduce((acc, item) => {
          acc[item.question_number] = "";
          return acc;
        }, {});
        setNewFeedbacks(feedbackMap);
      } catch (error) {
        console.error("❌ Error fetching quantitative data:", error);
        alert("정량 데이터를 불러오는 중 오류가 발생했습니다.");
      }
    };

    fetchQuantitativeData();
  }, [systemId, navigate]);

  // ✅ 기존 피드백 불러오기
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        console.log(
          "📡 [API 요청] 피드백 데이터 가져오기 - systemId:",
          systemId,
          "currentStep:",
          currentStep
        );

        const response = await axios.get(
          `http://localhost:3000/selftest/feedback?systemId=${systemId}&questionNumber=${currentStep}`,
          { withCredentials: true }
        );

        console.log("✅ [API 응답] 피드백 데이터:", response.data);
        console.log(
          "🔍 [응답 데이터 구조] response.data.data:",
          response.data.data
        );

        setFeedbacks(response.data.data || []);
      } catch (error) {
        console.error(
          "❌ [ERROR] 피드백 데이터를 가져오는 중 오류 발생:",
          error
        );
      }
    };

    if (systemId && currentStep) {
      fetchFeedbacks();
    }
  }, [systemId, currentStep]);

  // ✅ 피드백 입력값 변경 핸들러
  const handleFeedbackChange = (questionNumber, value) => {
    setNewFeedbacks((prev) => ({
      ...prev,
      [questionNumber]: value,
    }));
  };

  // ✅ 모든 피드백 저장
  const saveAllFeedbacks = async () => {
    console.log(systemId, expertId);
    if (!systemId || !expertId) {
      alert("🚨 시스템 ID 또는 전문가 ID가 없습니다.");
      return;
    }

    const feedbackData = Object.keys(newFeedbacks).map((questionNumber) => ({
      questionNumber: Number(questionNumber),
      systemId,
      feedback: newFeedbacks[questionNumber] || "",
    }));

    try {
      console.log("📡 [REQUEST] Sending feedback data:", feedbackData);

      await axios.post(
        "http://localhost:3000/selftest/quantitative/feedback",
        { systemId, expertId, feedbackResponses: feedbackData },
        { withCredentials: true }
      );

      console.log("✅ [SUCCESS] Feedback saved:", feedbackData);

      sessionStorage.setItem("systemId", systemId);
      sessionStorage.setItem("expertId", expertId);

      alert("모든 피드백이 저장되었습니다.");

      // ✅ 기존 피드백 유지 + 새로운 피드백 추가
      setFeedbacks((prevFeedbacks) => [
        ...prevFeedbacks,
        ...feedbackData.map((fb) => ({ feedback: fb.feedback })),
      ]);

      navigate("/QualitativeSurveyfeedback");
    } catch (error) {
      console.error("❌ [ERROR] Feedback save failed:", error);
      alert(
        `피드백 저장 중 오류 발생: ${
          error.response?.data?.message || "서버 오류"
        }`
      );
    }
  };
  const handleNextClick = async () => {
    if (currentStep < 43) {
      setCurrentStep((prev) => prev + 1);
    } else {
      await saveAllFeedbacks();
      navigate("/QualitativeSurveyfeedback", { state: { systemId } });
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
      question: "질문 없음",
      response: "",
      additional_comment: "",
      feedbacks: [],
    };

    console.log("📌 현재 문항 데이터:", currentData);
    const isFeedbackAllowed = currentData.response === "자문필요";
    // ✅ `feedbacks`가 배열인지 확인 후 필터링
    const filteredFeedbacks = Array.isArray(feedbacks)
      ? feedbacks.filter((fb) => fb.quantitative_question_id === currentStep)
      : [];

    return (
      <table className="w-full border-collapse border border-gray-300 mb-6">
        <tbody>
          <tr>
            <td className="bg-gray-200 p-2 border">지표 번호</td>
            <td className="p-2 border">{currentData.question_number}</td>
          </tr>
          <tr>
            <td className="bg-gray-200 p-2 border">지표</td>
            <td className="p-2 border">{currentData.question}</td>
          </tr>
          <tr>
            <td className="bg-gray-200 p-2 border">응답</td>
            <td className="p-2 border">{currentData.response}</td>
          </tr>

          <tr>
            <td className="bg-gray-200 p-2 border">기존 피드백</td>
            <td className="p-2 border">
              {filteredFeedbacks.length > 0 ? (
                <ul>
                  {filteredFeedbacks.map((fb, index) => (
                    <li key={index} className="text-sm text-gray-700">
                      - {fb.feedback} (작성자: {fb.expert_name})
                    </li>
                  ))}
                </ul>
              ) : (
                "등록된 피드백 없음"
              )}
            </td>
          </tr>

          {isFeedbackAllowed && (
            <tr>
              <td className="bg-gray-200 p-2 border">새 피드백 입력</td>
              <td className="p-2 border">
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newFeedbacks[currentStep] || ""}
                  onChange={(e) =>
                    handleFeedbackChange(currentStep, e.target.value)
                  }
                />
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
        <h2 className="text-xl font-bold mb-6">
          정량 피드백 작성 ({currentStep}/43)
        </h2>
        {renderCurrentStep()}
        <div className="flex justify-between mt-6">
          <button onClick={handlePreviousClick} disabled={currentStep === 1}>
            이전
          </button>
          <button onClick={handleNextClick}>
            {currentStep === 43 ? "완료" : "다음"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DiagnosisFeedbackPage;
