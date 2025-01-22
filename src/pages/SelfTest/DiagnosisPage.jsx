import React, { useEffect } from "react";
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
      console.error("Missing userId or systemId:", { userId, systemId });
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

        const data = response.data.filter(
          (item) => item.question_number >= 1 && item.question_number <= 43
        );

        setQuantitativeData(data);

        const initialResponses = data.reduce((acc, item) => {
          acc[item.question_number] = {
            response: item.response || "",
            additionalComment: item.additional_comment || "",
          };
          return acc;
        }, {});
        setResponses(initialResponses);

        console.log("Initialized Responses:", initialResponses);
      } catch (error) {
        console.error("Error fetching quantitative data:", error);
        alert("정량 데이터를 불러오는 데 실패했습니다. 다시 시도해주세요.");
      }
    };

    fetchQuantitativeData();
  }, [userId, systemId, navigate, setQuantitativeData, setResponses]);

  const validateResponses = (data) => {
    return data.every(
      (item) =>
        item.questionNumber &&
        item.response &&
        item.systemId &&
        typeof item.questionNumber === "number"
    );
  };

  const saveAllResponses = async () => {
    const requestData = Object.keys(responses).map((questionNumber) => ({
      questionNumber: Number(questionNumber),
      response: responses[questionNumber]?.response || "",
      additionalComment: responses[questionNumber]?.additionalComment || "",
      systemId,
    }));

    if (!validateResponses(requestData)) {
      console.error("Invalid requestData:", requestData);
      alert("필수 데이터가 누락되었습니다. 모든 문항을 확인해주세요.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:3000/selftest/quantitative",
        { quantitativeResponses: requestData },
        { withCredentials: true }
      );
      alert("모든 응답이 저장되었습니다.");
      navigate("/qualitative-survey", { state: { systemId, userId } });
    } catch (error) {
      console.error(
        "Error saving all responses:",
        error.response?.data || error
      );
      alert(
        error.response?.data?.message ||
          "응답 저장 중 오류가 발생했습니다. 다시 시도해주세요."
      );
    }
  };

  const handleNextClick = async () => {
    if (currentStep < 43) {
      setCurrentStep((prev) => prev + 1);
    } else {
      await saveAllResponses();
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
      unit: "",
      legal_basis: "",
      evaluation_criteria: "",
      reference_info: "",
    };

    return (
      <table className="w-full border-collapse border border-gray-300 mb-6">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">지표 번호</th>
            <th className="border border-gray-300 p-2">내용</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 p-2">
              {currentData.question_number}
            </td>
            <td className="border border-gray-300 p-2">
              {currentData.question}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2">근거법령</td>
            <td className="border border-gray-300 p-2">
              {currentData.legal_basis}
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
              <select
                value={responses[currentStep]?.response || ""}
                onChange={(e) =>
                  setResponses((prev) => ({
                    ...prev,
                    [currentStep]: {
                      ...prev[currentStep],
                      response: e.target.value,
                    },
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">선택</option>
                <option value="이행">이행</option>
                <option value="미이행">미이행</option>
                <option value="해당없음">해당없음</option>
                <option value="자문 필요">자문 필요</option>
              </select>
            </td>
          </tr>
          {responses[currentStep]?.response === "자문 필요" && (
            <tr>
              <td className="border border-gray-300 p-2">자문 필요 사항</td>
              <td className="border border-gray-300 p-2">
                <textarea
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
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="추가 의견을 입력하세요"
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

export default DiagnosisPage;
