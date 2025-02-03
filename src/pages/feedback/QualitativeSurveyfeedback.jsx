import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useRecoilState } from "recoil";
import {
  qualitativeDataState,
  currentStepState,
} from "../../state/selfTestState";
import { qualitativeFeedbackState } from "../../state/feedback";

function QualitativeSurveyFeedback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { systemId, expertId } = location.state || {};
  // const storedSystemId = sessionStorage.getItem("systemId");
  // const systemId = location.state?.systemId || storedSystemId;
  // const expertId = sessionStorage.getItem("expertId");

  const [qualitativeData, setQualitativeData] =
    useRecoilState(qualitativeDataState);
  const [feedbacks, setFeedbacks] = useRecoilState(qualitativeFeedbackState);
  const [currentStep, setCurrentStep] = useRecoilState(currentStepState);
  const [responses, setResponses] = useState({});
  const [newFeedbacks, setNewFeedbacks] = useState({});
  const [maxSteps, setMaxSteps] = useState(0);

  useEffect(() => {
    if (!systemId) {
      alert("시스템 정보가 없습니다. 대시보드로 이동합니다.");
      navigate("/dashboard");
      return;
    }

    // sessionStorage.setItem("systemId", systemId);

    const fetchQualitativeData = async () => {
      try {
        console.log("📡 Fetching qualitative data for systemId:", systemId);

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
          `http://localhost:3000/selftest/qualitative/responses?systemId=${systemId}&userId=${userId}`,
          { withCredentials: true }
        );

        let responses = responseResponse.data || [];
        console.log("✅ 정성 응답 데이터:", responses);

        responses = responses.sort(
          (a, b) => a.question_number - b.question_number
        );
        setMaxSteps(responses.length);

        const responseMap = responses.reduce((acc, item) => {
          acc[item.question_number] = {
            response: item.response || "",
            additionalComment: item.additional_comment || "",
            feedback: item.feedback || "",
          };
          return acc;
        }, {});

        setResponses(responseMap);
        setQualitativeData(responses);
      } catch (error) {
        console.error("❌ Error fetching qualitative data:", error);
        alert("정성 데이터를 불러오는 중 오류가 발생했습니다.");
      }
    };

    fetchQualitativeData();
  }, [systemId, navigate]);

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

        setFeedbacks(
          Array.isArray(response.data.data) ? response.data.data : []
        );
      } catch (error) {
        console.error(
          "❌ [ERROR] 피드백 데이터를 가져오는 중 오류 발생:",
          error
        );
        setFeedbacks([]);
      }
    };

    if (systemId && currentStep) {
      fetchFeedbacks();
    }
  }, [systemId, currentStep]);

  useEffect(() => {
    if (!location.state?.reloaded) {
      navigate("/QualitativeSurveyfeedback", {
        state: { systemId, reloaded: true },
      });
      window.location.reload();
    }
  }, []);

  const handleFeedbackChange = (questionNumber, value) => {
    setNewFeedbacks((prev) => ({
      ...prev,
      [questionNumber]: value,
    }));
  };

  const saveAllFeedbacks = async () => {
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
        "http://localhost:3000/selftest/qualitative/feedback",
        { systemId, expertId, feedbackResponses: feedbackData },
        { withCredentials: true }
      );

      console.log("✅ [SUCCESS] Feedback saved:", feedbackData);
      //sessionStorage.setItem("systemId", systemId);
      //sessionStorage.setItem("expertId", expertId);

      alert("모든 피드백이 저장되었습니다.");
      navigate("/");
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
    if (currentStep < maxSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      await saveAllFeedbacks();
    }
  };

  const handlePreviousClick = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const renderCurrentStep = () => {
    const currentData = qualitativeData[currentStep - 1] || {
      question_number: currentStep,
      indicator: "질문 없음",
      response: "",
      additional_comment: "",
    };

    const currentFeedbacks = Array.isArray(feedbacks)
      ? feedbacks.filter(
          (fb) => fb.qualitative_question_id === currentData.question_number
        )
      : [];

    const isFeedbackAllowed = currentData.response === "자문필요";
    return (
      <table className="w-full border-collapse border border-gray-300 mb-6">
        <tbody>
          <tr>
            <td className="bg-gray-200 p-2 border">지표 번호</td>
            <td className="p-2 border">{currentData.question_number}</td>
          </tr>
          <tr>
            <td className="bg-gray-200 p-2 border">지표</td>
            <td className="p-2 border">{currentData.indicator}</td>
          </tr>
          <tr>
            <td className="bg-gray-200 p-2 border">응답</td>
            <td className="p-2 border">{currentData.response}</td>
          </tr>

          <tr>
            <td className="bg-gray-200 p-2 border">기존 피드백</td>
            <td className="p-2 border">
              {currentFeedbacks.length > 0 ? (
                <ul>
                  {currentFeedbacks.map((fb, index) => (
                    <li key={index} className="text-sm text-gray-700">
                      - {fb.feedback} ({fb.expert_name})
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
          정성 피드백 작성 ({currentStep}/{maxSteps})
        </h2>
        {renderCurrentStep()}
        <div className="flex justify-between mt-6">
          <button onClick={handlePreviousClick} disabled={currentStep === 1}>
            이전
          </button>
          <button onClick={handleNextClick}>
            {currentStep === maxSteps ? "완료" : "다음"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default QualitativeSurveyFeedback;
