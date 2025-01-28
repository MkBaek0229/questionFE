import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

function QualitativeSurveyFeedback() {
  const [qualitativeData, setQualitativeData] = useState([]);
  const [feedbacks, setFeedbacks] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const location = useLocation();
  const navigate = useNavigate();
  const { systemId } = location.state || {};

  useEffect(() => {
    if (!systemId) {
      console.error("System ID가 누락되었습니다.");
      alert("시스템 정보가 없습니다. 대시보드로 이동합니다.");
      navigate("/dashboard");
      return;
    }

    const fetchQualitativeData = async () => {
      try {
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

        const questionResponse = await axios.get(
          "http://localhost:3000/selftest/qualitative",
          { params: { systemId }, withCredentials: true }
        );
        const questions = questionResponse.data || [];

        const responseResponse = await axios.get(
          "http://localhost:3000/selftest/qualitative/responses",
          { params: { systemId, userId }, withCredentials: true }
        );
        const responses = responseResponse.data || [];

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
        }));

        setQualitativeData(mergedData);
        console.log("✅ 병합된 정성 데이터:", mergedData);

        const initialResponses = mergedData.reduce((acc, item) => {
          acc[item.question_number] = {
            response: item.response,
            feedback: item.feedback,
            additionalComment: item.additional_comment || "",
          };
          return acc;
        }, {});
        setFeedbacks(initialResponses);
      } catch (error) {
        console.error("Error fetching qualitative data:", error);
        alert("데이터를 불러오는 중 오류가 발생했습니다.");
      }
    };
    fetchQualitativeData();
  }, [systemId, navigate]);

  const handleNextClick = () => {
    if (currentStep < qualitativeData.length) {
      setCurrentStep((prev) => prev + 1);
    } else {
      alert("피드백이 완료되었습니다.");
      navigate("/system-management");
    }
  };

  const handlePreviousClick = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const renderCurrentStep = () => {
    const currentData =
      qualitativeData.find((item) => item.question_number === currentStep) ||
      {};
    return (
      <table className="w-full border-collapse border border-gray-300 mb-6">
        <tbody>
          <tr>
            <td className="bg-gray-200 p-2 border">지표 번호</td>
            <td className="p-2 border">
              {currentData.question_number || "N/A"}
            </td>
          </tr>
          <tr>
            <td className="bg-gray-200 p-2 border">지표</td>
            <td className="p-2 border">{currentData.indicator || "N/A"}</td>
          </tr>
          <tr>
            <td className="bg-gray-200 p-2 border">평가기준</td>
            <td className="p-2 border">
              {currentData.evaluation_criteria || "N/A"}
            </td>
          </tr>
          <tr>
            <td className="bg-gray-200 p-2 border">기관회원 응답</td>
            <td className="p-2 border">
              {currentData.response || "응답 없음"}
            </td>
          </tr>
          {currentData.response === "자문 필요" && (
            <tr>
              <td className="bg-gray-200 p-2 border">자문 내용</td>
              <td className="p-2 border">
                {currentData.additional_comment || "자문 내용 없음"}
              </td>
            </tr>
          )}
          <tr>
            <td className="bg-gray-200 p-2 border">피드백</td>
            <td className="p-2 border">
              <textarea
                value={feedbacks[currentStep]?.feedback || "피드백 없음"}
                onChange={(e) =>
                  setFeedbacks((prev) => ({
                    ...prev,
                    [currentStep]: {
                      ...prev[currentStep],
                      feedback: e.target.value,
                    },
                  }))
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
          정성 피드백 작성 ({currentStep}/{qualitativeData.length})
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
            {currentStep === qualitativeData.length ? "완료" : "다음"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default QualitativeSurveyFeedback;
