import React, { useEffect, useState } from "react";
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
      console.error("❌ 시스템 또는 사용자 정보가 누락되었습니다.");
      alert("시스템 또는 사용자 정보가 누락되었습니다.");
      navigate("/dashboard");
      return;
    }
    setCurrentStep(1);
    const fetchQualitativeData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/selftest/qualitative",
          { params: { systemId }, withCredentials: true }
        );

        const data = response.data || [];
        console.log("✅ Fetched Qualitative Data:", data);

        setQualitativeData(data);

        // ✅ 기존 응답 데이터 설정 (file_upload → file_path 필드 확인)
        const initialResponses = data.reduce((acc, item) => {
          acc[item.question_number] = {
            response: item.response || "해당없음",
            additionalComment: item.additional_comment || "",
            filePath: item.file_path || null, // 필드명이 `file_path`인지 확인 필요
          };
          return acc;
        }, {});
        setResponses(initialResponses);
      } catch (error) {
        console.error("❌ 정성 문항 데이터를 불러오지 못했습니다:", error);
        alert("데이터를 불러오는 중 오류가 발생했습니다.");
        navigate("/dashboard");
      }
    };

    fetchQualitativeData();
  }, [systemId, userId, navigate, setQualitativeData, setResponses]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);
    formData.append("systemId", systemId);
    formData.append("questionId", currentStep);

    try {
      const response = await axios.post(
        "http://localhost:3000/upload",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // ✅ 업로드된 파일 경로를 responses 상태에 반영
      setResponses((prev) => ({
        ...prev,
        [currentStep]: {
          ...prev[currentStep],
          filePath: response.data.filePath, // 백엔드에서 받은 파일 경로 저장
        },
      }));

      console.log("✅ File uploaded successfully:", response.data.filePath);
    } catch (error) {
      console.error("❌ 파일 업로드 실패:", error);
      alert("파일 업로드 중 오류가 발생했습니다.");
    }
  };

  const handleComplete = async () => {
    if (!systemId || !userId || Object.keys(responses).length < 8) {
      alert("🚨 모든 문항에 응답해야 합니다.");
      return;
    }

    try {
      // ✅ 응답 데이터 포맷 정리
      const formattedResponses = Object.entries(responses).map(
        ([question_number, responseData]) => ({
          systemId,
          userId,
          questionId: Number(question_number),
          response: ["자문필요", "해당없음"].includes(
            responseData.response.trim()
          )
            ? responseData.response.trim()
            : "해당없음",
          additionalComment:
            responseData.response === "자문필요" &&
            responseData.additionalComment
              ? responseData.additionalComment.trim()
              : "",
          filePath: responseData.filePath || null,
        })
      );

      console.log(
        "📤 [DEBUG] Sending qualitative responses:",
        formattedResponses
      );

      // ✅ 서버에 데이터 전송
      const response = await axios.post(
        "http://localhost:3000/selftest/qualitative",
        { responses: formattedResponses },
        { withCredentials: true }
      );

      console.log("✅ [DEBUG] 정성 응답 저장 완료:", response.data);

      // ✅ 점수 계산 및 등급 산정 API 호출
      await axios.post(
        "http://localhost:3000/assessment/complete",
        { userId, systemId },
        { withCredentials: true }
      );

      console.log("✅ [DEBUG] 점수 및 등급 산정 완료");
      navigate("/completion", { state: { userId, systemId } });
    } catch (error) {
      console.error("❌ [ERROR] 정성 평가 저장 실패:", error);
      alert("정성 평가 저장 중 오류가 발생했습니다.");
    }
  };

  const renderCurrentStep = () => {
    const currentData = qualitativeData.find(
      (item) => item.question_number === currentStep
    ) || {
      question_number: currentStep,
      indicator: "질문 없음",
      indicator_definition: "",
      evaluation_criteria: "",
      reference_info: "",
      filePath: null, // ✅ 파일 필드 추가
    };

    console.log("🔍 Current Data:", currentData);

    return (
      <table className="w-full border-collapse border border-gray-300 mb-6">
        <tbody>
          <tr>
            <td className="border border-gray-300 p-2 bg-gray-200">
              지표 번호
            </td>
            <td className="border border-gray-300 p-2">
              {currentData.question_number}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2 bg-gray-200">지표</td>
            <td className="border border-gray-300 p-2">
              {currentData.indicator}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2 bg-gray-200">
              지표 정의
            </td>
            <td className="border border-gray-300 p-2">
              {currentData.indicator_definition}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2 bg-gray-200">평가기준</td>
            <td className="border border-gray-300 p-2">
              {currentData.evaluation_criteria}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2 bg-gray-200">참고사항</td>
            <td className="border border-gray-300 p-2">
              {currentData.reference_info}
            </td>
          </tr>
          {/* 🔹 파일 첨부 필드 유지 */}
          <tr>
            <td className="border border-gray-300 p-2 bg-gray-200">
              파일 첨부
            </td>
            <td className="border border-gray-300 p-2">
              {responses[currentStep]?.filePath ? (
                <a
                  href={responses[currentStep]?.filePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500"
                >
                  첨부 파일 보기
                </a>
              ) : (
                <input
                  type="file"
                  className="w-full p-1 border rounded"
                  onChange={handleFileUpload}
                />
              )}
            </td>
          </tr>
          {/* 🔹 평가 선택 필드 수정 (자문 필요 / 해당 없음만 선택 가능) */}
          <tr>
            <td className="border border-gray-300 p-2 bg-gray-200">평가</td>
            <td className="border border-gray-300 p-2">
              <select
                value={responses[currentStep]?.response || "해당없음"}
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
                <option value="자문필요">자문필요</option>
                <option value="해당없음">해당없음</option>
              </select>
            </td>
          </tr>
          {/* 🔹 "자문 필요" 선택 시 추가 입력 필드 표시 */}
          {responses[currentStep]?.response === "자문필요" && (
            <tr>
              <td className="border border-gray-300 p-2 bg-gray-200">
                자문 필요 사항
              </td>
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
          정성 자가진단 ({currentStep}/8번)
        </h2>
        {renderCurrentStep()}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
          >
            이전
          </button>
          <button
            onClick={
              currentStep === 8
                ? handleComplete
                : () => setCurrentStep((prev) => prev + 1)
            }
          >
            {currentStep === 8 ? "완료" : "다음"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default QualitativeSurvey;
