import React, { useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useRecoilState } from "recoil";
import {
  qualitativeDataState,
  qualitativeResponsesState,
  qualitativeCurrentStepState,
} from "../../state/selfTestState";

function QualitativeSurvey() {
  const [currentStep, setCurrentStep] = useRecoilState(
    qualitativeCurrentStepState
  );
  const [responses, setResponses] = useRecoilState(qualitativeResponsesState);
  const [qualitativeData, setQualitativeData] =
    useRecoilState(qualitativeDataState);

  const navigate = useNavigate();
  const location = useLocation();
  const { userId, systemId } = location.state || {};

  useEffect(() => {
    if (!systemId || !userId) {
      console.error("필수 데이터(userId 또는 systemId)가 누락되었습니다.");
      alert("시스템 또는 사용자 정보가 누락되었습니다.");
      navigate("/dashboard");
      return;
    }

    const fetchQualitativeData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/selftest/qualitative",
          {
            params: { systemId },
            withCredentials: true,
          }
        );

        const data = response.data || [];
        setQualitativeData(data);

        const initialResponses = data.reduce((acc, item) => {
          acc[item.question_number] = {
            response: item.response || "해당없음",
            additionalComment: item.additional_comment || "",
          };
          return acc;
        }, {});
        setResponses(initialResponses);

        console.log("Initialized Responses:", initialResponses);
      } catch (error) {
        console.error(
          "정성 문항 데이터를 불러오지 못했습니다:",
          error.response || error
        );
        alert("데이터를 불러오는 중 오류가 발생했습니다.");
        navigate("/dashboard");
      }
    };

    fetchQualitativeData();
  }, [systemId, userId, navigate, setQualitativeData, setResponses]);

  const saveResponse = async (questionNumber) => {
    const currentResponse = responses[questionNumber] || {};
    if (!systemId || !userId) {
      console.error("시스템 또는 사용자 정보가 누락되었습니다.");
      alert("시스템 또는 사용자 정보가 누락되었습니다.");
      return false;
    }

    const requestData = {
      questionNumber,
      response: currentResponse.response || "해당없음",
      additionalComment: currentResponse.additionalComment || "",
      systemId,
      userId,
    };

    if (
      !requestData.questionNumber ||
      !requestData.response ||
      !requestData.systemId ||
      !requestData.userId
    ) {
      console.error("Invalid requestData:", requestData);
      alert("필수 데이터가 누락되었습니다. 모든 문항을 확인해주세요.");
      return false;
    }

    try {
      await axios.post(
        "http://localhost:3000/selftest/qualitative",
        requestData,
        { withCredentials: true }
      );
      console.log(
        `Response for question ${questionNumber} saved successfully.`
      );
      return true;
    } catch (error) {
      console.error("정성 설문 저장 실패:", error.response?.data || error);
      alert("정성 설문 저장 중 오류가 발생했습니다. 다시 시도해주세요.");
      return false;
    }
  };

  const handleNextClick = async () => {
    const success = await saveResponse(currentStep);

    if (!success) return;

    if (currentStep < 8) {
      setCurrentStep((prev) => prev + 1);
    } else {
      try {
        const response = await axios.post(
          "http://localhost:3000/assessment/complete",
          { userId, systemId },
          { withCredentials: true }
        );
        console.log("최종 결과 저장 성공:", response.data);
        alert("결과가 성공적으로 저장되었습니다.");
        navigate("/completion", { state: { userId, systemId } });
      } catch (error) {
        console.error("최종 결과 저장 실패:", error.response?.data || error);
        alert("결과 저장 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    }
  };

  const handlePreviousClick = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const renderCurrentStep = () => {
    if (qualitativeData.length === 0) {
      return (
        <p className="text-center">정성 문항 데이터를 불러오는 중입니다...</p>
      );
    }

    const currentData = qualitativeData.find(
      (item) => item.question_number === currentStep
    ) || {
      question_number: currentStep,
      question: "질문이 없습니다.",
      evaluation_criteria: "",
      reference_info: "",
    };

    return (
      <table className="w-full border-collapse border border-gray-300 mb-6">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">항목</th>
            <th className="border border-gray-300 p-2">내용</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 p-2">지표 번호</td>
            <td className="border border-gray-300 p-2">{currentStep}번</td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2">지표 정의</td>
            <td className="border border-gray-300 p-2">
              {currentData.question}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2">평가기준</td>
            <td className="border border-gray-300 p-2">
              {currentData.evaluation_criteria}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2">참고사항</td>
            <td className="border border-gray-300 p-2">
              {currentData.reference_info}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2">평가</td>
            <td className="border border-gray-300 p-2">
              <div className="flex items-center space-x-4">
                {["자문필요", "해당없음"].map((option) => (
                  <label key={option}>
                    <input
                      type="radio"
                      name={`response_${currentStep}`}
                      value={option}
                      onChange={(e) =>
                        setResponses((prev) => ({
                          ...prev,
                          [currentStep]: {
                            ...prev[currentStep],
                            response: e.target.value,
                          },
                        }))
                      }
                      checked={responses[currentStep]?.response === option}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </td>
          </tr>
          {responses[currentStep]?.response === "자문필요" && (
            <tr>
              <td className="border border-gray-300 p-2">자문 내용</td>
              <td className="border border-gray-300 p-2">
                <textarea
                  placeholder="자문 필요 내용을 입력하세요"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={responses[currentStep]?.additionalComment || ""}
                  onChange={(e) =>
                    setResponses((prev) => ({
                      ...prev,
                      [currentStep]: {
                        ...prev[currentStep],
                        additionalComment: e.target.value,
                      },
                    }))
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
        <h2 className="text-xl font-bold mb-6">
          정성 설문조사 ({currentStep}/8번)
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
            {currentStep === 8 ? "완료" : "다음"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default QualitativeSurvey;
