import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../../axiosConfig";
import { useRecoilState } from "recoil";
import {
  quantitativeDataState,
  currentStepState,
} from "../../state/selfTestState";
import { quantitativeFeedbackState } from "../../state/feedback";

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

function DiagnosisFeedbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const storedSystemId = sessionStorage.getItem("systemId");
  const systemId = location.state?.systemId || storedSystemId;
  const expertId = sessionStorage.getItem("expertId");

  const [quantitativeData, setQuantitativeData] = useRecoilState(
    quantitativeDataState
  );
  const [feedbacks, setFeedbacks] = useRecoilState(quantitativeFeedbackState);
  const [currentStep, setCurrentStep] = useRecoilState(currentStepState);
  const [responses, setResponses] = useState({});
  const [newFeedbacks, setNewFeedbacks] = useState({});
  const [maxSteps, setMaxSteps] = useState(0);
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    const fetchCsrfToken = async () => {
      const token = await getCsrfToken();
      setCsrfToken(token);
    };
    fetchCsrfToken();
  }, []);

  useEffect(() => {
    if (!systemId) {
      alert("🚨 시스템 정보가 없습니다. 대시보드로 이동합니다.");
      navigate("/dashboard");
      return;
    }
    setCurrentStep(1);
    sessionStorage.setItem("systemId", systemId);

    const fetchQuantitativeData = async () => {
      try {
        console.log("📡 Fetching quantitative data for systemId:", systemId);

        const ownerResponse = await axios.get("/system-owner", {
          params: { systemId },
          withCredentials: true,
        });

        if (!ownerResponse.data.userId) {
          alert("기관회원 정보를 가져올 수 없습니다.");
          return;
        }

        const userId = ownerResponse.data.userId;

        // ✅ 정량 문항 데이터를 가져오는 API 수정
        const responseResponse = await axios.get(
          `/selftest/quantitative/responses/${systemId}/${userId}`,
          { withCredentials: true }
        );

        let responses = responseResponse.data || [];
        console.log("✅ [DEBUG] 최신 정량 응답 데이터:", responses);

        // ✅ 문항 개수 반영 (슈퍼유저가 추가한 문항 포함)
        responses = responses.sort(
          (a, b) => a.question_number - b.question_number
        );
        setMaxSteps(responses.length);

        // ✅ 응답 데이터 정리 (빈 응답도 기본값으로 세팅)
        const responseMap = responses.reduce((acc, item) => {
          acc[item.question_number] = {
            response: item.response || "-",
            additionalComment: item.additional_comment || "",
          };
          return acc;
        }, {});

        setResponses(responseMap);
        setQuantitativeData(responses);
      } catch (error) {
        console.error("❌ [ERROR] 최신 정량 데이터를 가져오는 중 오류:", error);
        alert("정량 데이터를 불러오는 중 오류가 발생했습니다.");
      }
    };

    fetchQuantitativeData();
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
          `/selftest/feedback?systemId=${systemId}&questionNumber=${currentStep}`,
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

    const feedbackData = Object.keys(newFeedbacks)
      .filter((questionNumber) => newFeedbacks[questionNumber]?.trim() !== "")
      .map((questionNumber) => ({
        questionNumber: Number(questionNumber),
        systemId,
        feedback: newFeedbacks[questionNumber],
      }));

    if (feedbackData.length === 0) {
      navigate("/QualitativeSurveyfeedback", { state: { systemId } });
      return;
    }

    try {
      console.log("📡 [REQUEST] Sending feedback data:", feedbackData);

      await axios.post(
        "/selftest/quantitative/feedback",
        {
          systemId,
          expertId,
          feedbackResponses: feedbackData,
        },
        {
          withCredentials: true,
          headers: {
            "X-CSRF-Token": csrfToken, // ✅ CSRF 토큰 추가
          },
        }
      );

      console.log("✅ [SUCCESS] Feedback saved:", feedbackData);
      alert("모든 피드백이 저장되었습니다.");

      // ✅ 정성 피드백 페이지로 이동
      setCurrentStep(1); // ✅ 정성 평가 시작을 1로 설정
      navigate("/QualitativeSurveyfeedback", { state: { systemId } });
    } catch (error) {
      console.error("❌ [ERROR] Feedback save failed:", error);
      alert("피드백 저장 중 오류 발생");
    }
  };

  const handleNextClick = async () => {
    if (currentStep < quantitativeData.length) {
      setCurrentStep((prev) => prev + 1);
    } else {
      await saveAllFeedbacks();
    }
  };

  const handlePreviousClick = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const renderCurrentStep = () => {
    const currentData = quantitativeData[currentStep - 1] || {
      question_number: currentStep,
      question: "질문 없음",
      evaluation_criteria: "",
      response: "",
      additional_comment: "",
    };

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
            <td className="p-2 border">{currentData.question}</td>
          </tr>
          <tr>
            <td className="bg-gray-200 p-2 border">평가기준</td>
            <td className="p-2 border">
              {/* 이미지가 있는 경우 */}
              {currentData.evaluation_criteria.includes("<img") ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: currentData.evaluation_criteria,
                  }}
                />
              ) : (
                currentData.evaluation_criteria
              )}
            </td>
          </tr>
          <tr>
            <td className="bg-gray-200 p-2 border">응답</td>
            <td className="p-2 border">{currentData.response}</td>
          </tr>
          <tr>
            <td className="bg-gray-200 p-2 border">기존 피드백</td>
            <td className="p-2 border">
              {feedbacks.length > 0 ? (
                <ul>
                  {feedbacks.map((fb, index) => (
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
          정량 피드백 작성 ({currentStep}/{quantitativeData.length})
        </h2>
        {renderCurrentStep()} {/* 실제 문항 표시 */}
        <div className="flex justify-between mt-6">
          <button
            onClick={handlePreviousClick}
            disabled={currentStep === 1}
            className="px-4 py-2 bg-gray-400 text-white rounded disabled:opacity-50"
          >
            이전
          </button>
          <button
            onClick={handleNextClick}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            {currentStep === quantitativeData.length ? "완료" : "다음"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DiagnosisFeedbackPage;
