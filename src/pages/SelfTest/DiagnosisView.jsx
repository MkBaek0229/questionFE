import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

function DiagnosisView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { systemId, userId } = location.state || {};

  const [questions, setQuestions] = useState([]); // 정량 문항
  const [responses, setResponses] = useState([]); // 정량 응답
  const [feedbacks, setFeedbacks] = useState([]); // 피드백 데이터 (정량 & 정성)
  const [qualitativeData, setQualitativeData] = useState([]); // 정성 평가 데이터
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!systemId || !userId) {
      alert("🚨 시스템 또는 사용자 정보가 누락되었습니다.");
      navigate("/dashboard");
      return;
    }
  }, [systemId, userId, navigate]);

  useEffect(() => {
    const fetchQuantData = async () => {
      try {
        setLoading(true);
        setError("");

        const questionsRes = await axios.get(
          "http://localhost:3000/selftest/quantitative",
          { params: { systemId }, withCredentials: true }
        );

        const responsesRes = await axios.get(
          "http://localhost:3000/selftest/quantitative/responses",
          { params: { systemId, userId }, withCredentials: true }
        );

        const feedbackRes = await axios.get(
          "http://localhost:3000/selftest/feedback",
          { params: { systemId }, withCredentials: true }
        );

        setQuestions(questionsRes.data);
        setResponses(responsesRes.data);
        setFeedbacks(feedbackRes.data.data || []);
      } catch (err) {
        setError("정량 데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuantData();
  }, [systemId, userId]);

  useEffect(() => {
    const fetchQualData = async () => {
      try {
        const qualRes = await axios.get(
          "http://localhost:3000/selftest/qualitative/responses",
          { params: { systemId, userId }, withCredentials: true }
        );
        setQualitativeData(qualRes.data);
      } catch (err) {
        console.error("❌ 정성 데이터 조회 오류:", err);
      }
    };

    fetchQualData();
  }, [systemId, userId]);

  const getResponseByQuestionNumber = (questionNumber) => {
    return (
      responses.find(
        (r) => Number(r.question_number) === Number(questionNumber)
      ) || { response: "-", additional_comment: "-" }
    );
  };

  const getLatestFeedbackByQuestionNumber = (questionNumber) => {
    return (
      feedbacks.find(
        (f) =>
          Number(f.quantitative_question_id) === Number(questionNumber) ||
          Number(f.qualitative_question_id) === Number(questionNumber)
      ) || { feedback: "-" }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        <p className="text-xl font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
        진단 결과 보기
      </h1>

      {/* ✅ 정량 평가 결과 테이블 */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          정량 평가 결과
        </h2>
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="w-full border border-gray-300 bg-white rounded-lg">
            <thead>
              <tr className="bg-blue-500 text-white">
                <th className="p-3">지표 번호</th>
                <th className="p-3">질문</th>
                <th className="p-3">평가기준</th>

                <th className="p-3">응답</th>
                <th className="p-3">추가 의견</th>
                <th className="p-3">피드백</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => {
                const responseObj = getResponseByQuestionNumber(
                  q.question_number
                );
                const feedbackObj = getLatestFeedbackByQuestionNumber(
                  q.question_number
                );
                return (
                  <tr
                    key={q.question_number}
                    className="border-b hover:bg-gray-100"
                  >
                    <td className="p-3 text-center">{q.question_number}</td>
                    <td className="p-3">{q.question}</td>
                    <td className="p-3">{q.evaluation_criteria}</td>

                    <td className="p-3">{responseObj.response}</td>
                    <td className="p-3">{responseObj.additional_comment}</td>
                    <td className="p-3">{feedbackObj.feedback}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ 정성 평가 결과 테이블 */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          정성 평가 결과
        </h2>
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="w-full border border-gray-300 bg-white rounded-lg">
            <thead>
              <tr className="bg-green-500 text-white">
                <th className="p-3">지표 번호</th>
                <th className="p-3">지표</th>
                <th className="p-3">평가기준</th>
                <th className="p-3">응답</th>
                <th className="p-3">추가 의견</th>
                <th className="p-3">첨부 파일</th>
                <th className="p-3">피드백</th>
              </tr>
            </thead>
            <tbody>
              {qualitativeData.map((q) => {
                const qualFeedbackObj = getLatestFeedbackByQuestionNumber(
                  q.question_number
                );
                return (
                  <tr
                    key={q.question_number}
                    className="border-b hover:bg-gray-100"
                  >
                    <td className="p-3 text-center">{q.question_number}</td>
                    <td className="p-3">{q.indicator}</td>
                    <td className="p-3">{q.evaluation_criteria}</td>
                    <td className="p-3">{q.response || "-"}</td>
                    <td className="p-3">{q.additional_comment || "-"}</td>
                    <td className="p-3">
                      {q.file_path ? (
                        <a
                          href={q.file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          보기
                        </a>
                      ) : (
                        "없음"
                      )}
                    </td>
                    <td className="p-3">{qualFeedbackObj.feedback}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DiagnosisView;
