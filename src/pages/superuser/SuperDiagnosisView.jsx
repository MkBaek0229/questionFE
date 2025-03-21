import React, { useEffect, useState } from "react";
import axiosInstance from "../../../axiosInstance";
import { useNavigate, useLocation } from "react-router-dom";
function SuperDiagnosisView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { systemId, systemName } = location.state || {};
  // ✅ 상태 (useState 추가)
  const [quantitativeData, setQuantitativeData] = useState([]);
  const [quantitativeResponses, setQuantitativeResponses] = useState([]);
  const [qualitativeData, setQualitativeData] = useState([]);
  const [qualitativeResponses, setQualitativeResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  useEffect(() => {
    if (!systemId) {
      alert("🚨 시스템 정보가 누락되었습니다.");
      navigate("/super/dashboard");
      return;
    }
    const fetchData = async () => {
      try {
        console.log("🔄 데이터 요청 시작...");
        const [
          quantitativeQuestionsRes,
          quantitativeResponsesRes,
          qualitativeQuestionsRes,
          qualitativeResponsesRes,
        ] = await Promise.all([
          axiosInstance.get(
            `http://localhost:3000/super/selftest/quantitative`,
            {
              withCredentials: true,
            }
          ),
          axiosInstance.get(
            `http://localhost:3000/super/selftest/quantitative/responses/${systemId}`,
            { withCredentials: true }
          ),
          axiosInstance.get(
            `http://localhost:3000/super/selftest/qualitative`,
            {
              withCredentials: true,
            }
          ),
          axiosInstance.get(
            `http://localhost:3000/super/selftest/qualitative/responses/${systemId}`,
            { withCredentials: true }
          ),
        ]);
        console.log("📌 정량 문항 데이터:", quantitativeQuestionsRes.data);
        console.log("📌 정량 응답 데이터:", quantitativeResponsesRes.data);
        console.log("📌 정성 문항 데이터:", qualitativeQuestionsRes.data);
        console.log("📌 정성 응답 데이터:", qualitativeResponsesRes.data);
        setQuantitativeData(
          Array.isArray(quantitativeQuestionsRes.data.data)
            ? quantitativeQuestionsRes.data.data
            : []
        );
        setQuantitativeResponses(
          Array.isArray(quantitativeResponsesRes.data.data)
            ? quantitativeResponsesRes.data.data
            : []
        );
        setQualitativeData(
          Array.isArray(qualitativeQuestionsRes.data.data)
            ? qualitativeQuestionsRes.data.data
            : []
        );
        setQualitativeResponses(
          Array.isArray(qualitativeResponsesRes.data.data)
            ? qualitativeResponsesRes.data.data
            : []
        );
      } catch (err) {
        console.error("❌ 데이터 조회 오류:", err);
        setErrorMessage("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [systemId, navigate]);
  // ✅ 응답 데이터 매칭 함수
  const findResponse = (responses, questionNumber) => {
    return (
      responses.find(
        (r) => Number(r.question_number) === Number(questionNumber)
      ) || { response: "-", file_path: "" }
    );
  };
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        {systemName} - 슈퍼유저 진단 결과
      </h1>
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
          {errorMessage}
        </div>
      )}
      {loading ? (
        <p className="text-center text-lg font-semibold text-gray-600">
          데이터 불러오는 중...
        </p>
      ) : (
        <>
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
                </tr>
              </thead>
              <tbody>
                {quantitativeData.length > 0 ? (
                  quantitativeData.map((q) => {
                    const responseObj = findResponse(
                      quantitativeResponses,
                      q.question_number
                    );
                    return (
                      <tr
                        key={q.question_number}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-3 text-center">{q.question_number}</td>
                        <td className="p-3">{q.question || "-"}</td>
                        <td
                          className="p-3"
                          dangerouslySetInnerHTML={{
                            __html: q.evaluation_criteria || "-",
                          }}
                        />
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
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center p-3 text-gray-500">
                      등록된 데이터가 없습니다.
                    </td>
                  </tr>
                )}
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
                  <th className="p-3">번호</th>
                  <th className="p-3">지표</th>
                  <th className="p-3">지표 정의</th>
                  <th className="p-3">평가기준</th>
                  <th className="p-3">참고 정보</th>
                  <th className="p-3">파일</th>
                  <th className="p-3">응답</th>
                </tr>
              </thead>
              <tbody>
                {qualitativeData.length > 0 ? (
                  qualitativeData.map((q) => {
                    const responseObj = findResponse(
                      qualitativeResponses,
                      q.question_number
                    );
                    return (
                      <tr
                        key={q.question_number}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-3 text-center">{q.question_number}</td>
                        <td className="p-3">{q.indicator || "-"}</td>
                        <td className="p-3">{q.indicator_definition || "-"}</td>
                        <td
                          className="p-3"
                          dangerouslySetInnerHTML={{
                            __html: q.evaluation_criteria || "-",
                          }}
                        />
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
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center p-3 text-gray-500">
                      등록된 데이터가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
export default SuperDiagnosisView;
