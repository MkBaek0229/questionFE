import React, { useEffect } from "react";
import axiosInstance from "../../../axiosInstance";
import { useNavigate, useLocation } from "react-router-dom";
import { useRecoilState } from "recoil";
import {
  quantitativeDataState,
  quantitativeResponsesState,
  qualitativeDataState,
  qualitativeResponsesState,
} from "../../state/selfTestState";
import {
  qualitativeFeedbackState,
  quantitativeFeedbackState,
} from "../../state/feedback";

function DiagnosisView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { systemId, userId } = location.state || {};

  // ✅ 정량 데이터 (질문 + 응답)
  const [quantitativeData, setQuantitativeData] = useRecoilState(
    quantitativeDataState
  );
  const [quantitativeResponses, setQuantitativeResponses] = useRecoilState(
    quantitativeResponsesState
  );

  // ✅ 정성 데이터 (질문 + 응답)
  const [qualitativeData, setQualitativeData] =
    useRecoilState(qualitativeDataState);
  const [qualitativeResponses, setQualitativeResponses] = useRecoilState(
    qualitativeResponsesState
  );

  // ✅ 피드백 데이터 (정량 + 정성)
  const [quantitativeFeedbacks, setQuantitativeFeedbacks] = useRecoilState(
    quantitativeFeedbackState
  );
  const [qualitativeFeedbacks, setQualitativeFeedbacks] = useRecoilState(
    qualitativeFeedbackState
  );

  useEffect(() => {
    if (!systemId || !userId) {
      alert("🚨 시스템 또는 사용자 정보가 누락되었습니다.");
      navigate("/dashboard");
      return;
    }
  }, [systemId, userId, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!systemId || !userId) return;

      try {
        const [
          questionsRes,
          responsesRes,
          quantFeedbackRes,
          qualRes,
          qualResponsesRes,
          qualFeedbackRes,
        ] = await Promise.all([
          axiosInstance.get(`http://localhost:3000/selftest/quantitative`, {
            params: { systemId },
            withCredentials: true,
          }),
          axiosInstance.get(
            `http://localhost:3000/selftest/quantitative/responses/${systemId}/${userId}`,
            {
              withCredentials: true,
            }
          ),
          axiosInstance.get(`http://localhost:3000/selftest/feedback`, {
            params: { systemId, type: "quantitative" },
            withCredentials: true,
          }),
          axiosInstance.get(`http://localhost:3000/selftest/qualitative`, {
            params: { systemId },
            withCredentials: true,
          }),
          axiosInstance.get(
            `http://localhost:3000/selftest/qualitative/responses/${systemId}/${userId}`,
            {
              withCredentials: true,
            }
          ),
          axiosInstance.get(`http://localhost:3000/selftest/feedback`, {
            params: { systemId, type: "qualitative" },
            withCredentials: true,
          }),
        ]);

        // ✅ Recoil 상태 업데이트
        setQuantitativeData(questionsRes.data ?? []);
        setQuantitativeResponses(
          Array.isArray(responsesRes.data) ? responsesRes.data : []
        );
        setQuantitativeFeedbacks(
          Array.isArray(quantFeedbackRes.data?.data)
            ? quantFeedbackRes.data.data
            : []
        );
        setQualitativeData(qualRes.data ?? []);
        setQualitativeResponses(
          Array.isArray(qualResponsesRes.data) ? qualResponsesRes.data : []
        );
        setQualitativeFeedbacks(
          Array.isArray(qualFeedbackRes.data?.data)
            ? qualFeedbackRes.data.data
            : []
        );

        // ✅ 디버그 로그
        console.log("📡 [DEBUG] 정량 질문 데이터:", questionsRes.data);
        console.log("📡 [DEBUG] 정량 응답 데이터:", responsesRes.data);
        console.log("📡 [DEBUG] 정성 질문 데이터:", qualRes.data);
        console.log("📡 [DEBUG] 정성 응답 데이터:", qualResponsesRes.data);
      } catch (err) {
        console.error("❌ 데이터 조회 오류:", err);
      }
    };

    fetchData();
  }, [systemId, userId]);

  // ✅ 전문가별로 하나씩만 가져오는 함수

  const getUniqueFeedbackByExpert = (feedbackList) => {
    if (!Array.isArray(feedbackList)) return [];

    const feedbackByExpert = {};

    feedbackList.forEach((fb) => {
      // 전문가별로 created_at 기준 최신 피드백 저장
      if (
        !feedbackByExpert[fb.expert_name] ||
        new Date(fb.created_at) >
          new Date(feedbackByExpert[fb.expert_name].created_at)
      ) {
        feedbackByExpert[fb.expert_name] = fb;
      }
    });

    return Object.values(feedbackByExpert);
  };

  // ✅ 기존 피드백 필터링 함수 수정 (question_number 기반 필터링)
  const getAllFeedbacks = (feedbackList, questionNumber) => {
    if (!Array.isArray(feedbackList)) return [];

    const filtered = feedbackList.filter(
      (f) => Number(f.question_number) === Number(questionNumber)
    );

    // ✅ 전문가별 최신 피드백만 반환
    return getUniqueFeedbackByExpert(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        진단 결과 보기
      </h1>

      {/* ✅ 정량 평가 결과 */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-10">
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">
          정량 평가 결과
        </h2>
        <table className="w-full border border-gray-300 rounded-lg text-left">
          <thead>
            <tr className="bg-blue-500 text-white text-center">
              <th className="p-3">번호</th>

              <th className="p-3">질문</th>

              <th className="p-3">평가기준</th>

              <th className="p-3">법적 근거</th>

              <th className="p-3">배점</th>

              <th className="p-3">파일</th>

              <th className="p-3">응답</th>

              <th className="p-3">피드백</th>
            </tr>
          </thead>
          <tbody>
            {quantitativeData.map((q) => {
              const responsesArray = Array.isArray(quantitativeResponses)
                ? quantitativeResponses
                : [];

              const responseObj = responsesArray.find(
                (r) => Number(r.question_number) === Number(q.question_number)
              ) || { response: "-" };

              const feedbackList = getAllFeedbacks(
                quantitativeFeedbacks,
                q.question_number
              );

              return (
                <tr
                  key={q.question_number}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-3 text-center">{q.question_number}</td>
                  <td className="p-3">{q.question || "-"}</td>
                  <td className="p-3">
                    {/* HTML 태그(이미지 포함)를 그대로 렌더링 */}
                    <div
                      dangerouslySetInnerHTML={{
                        __html: q.evaluation_criteria || "-",
                      }}
                    />
                  </td>

                  <td className="p-3">{q.legal_basis || "-"}</td>
                  <td className="p-3 text-center">{q.score ?? "-"}</td>
                  <td className="p-3 text-center">
                    {responseObj.file_path ? (
                      <a
                        href={`http://localhost:3000${responseObj.file_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        파일 다운로드
                      </a>
                    ) : (
                      <span className="text-gray-400">파일 없음</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {responseObj.response ?? "-"}
                  </td>
                  <td className="p-3">
                    {feedbackList.length > 0 ? (
                      feedbackList.map((fb, index) => (
                        <p key={fb.feedback_id || `feedback-${index}`}>
                          {fb.feedback} ({fb.expert_name},{" "}
                          {new Date(fb.created_at).toLocaleDateString()})
                        </p>
                      ))
                    ) : (
                      <span className="text-gray-400">등록된 피드백 없음</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ✅ 정성 평가 결과 */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-green-700 mb-4">
          정성 평가 결과
        </h2>
        <table className="w-full border border-gray-300 rounded-lg text-left">
          <thead>
            <tr className="bg-green-500 text-white text-center">
              <th className="p-3 w-[80px]">번호</th>
              <th className="p-3 w-[250px]">지표</th>
              <th className="p-3 w-[300px]">지표 정의</th>
              <th className="p-3 w-[300px]">평가기준</th>
              <th className="p-3 w-[250px]">참고 정보</th>
              <th className="p-3 w-[250px]">파일</th>
              <th className="p-3 w-[100px]">응답</th>
              <th className="p-3 w-[250px]">피드백</th>
            </tr>
          </thead>
          <tbody>
            {qualitativeData.map((q) => {
              const responseObj = qualitativeResponses.find(
                (r) => Number(r.question_number) === Number(q.question_number)
              ) || { response: "-" };

              const feedbackList = getAllFeedbacks(
                qualitativeFeedbacks,
                q.question_number,
                "qualitative"
              );

              return (
                <tr
                  key={q.question_number}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-3 text-center">{q.question_number}</td>
                  <td className="p-3">{q.indicator || "-"}</td>
                  <td className="p-3">{q.indicator_definition || "-"}</td>
                  <td className="p-3">
                    {/* HTML 태그(이미지 포함)를 그대로 렌더링 */}
                    <div
                      dangerouslySetInnerHTML={{
                        __html: q.evaluation_criteria || "-",
                      }}
                    />
                  </td>

                  <td className="p-3">{q.reference_info || "-"}</td>
                  <td className="p-3 text-center">
                    {responseObj.file_path ? (
                      <a
                        href={`http://localhost:3000${responseObj.file_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        파일 다운로드
                      </a>
                    ) : (
                      <span className="text-gray-400">파일 없음</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {responseObj.response ?? "-"}
                  </td>
                  <td className="p-3">
                    {feedbackList.length > 0 ? (
                      feedbackList.map((fb, index) => (
                        <p key={fb.feedback_id || `feedback-${index}`}>
                          {fb.feedback} ({fb.expert_name},{" "}
                          {new Date(fb.created_at).toLocaleDateString()})
                        </p>
                      ))
                    ) : (
                      <span className="text-gray-400">등록된 피드백 없음</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DiagnosisView;
