import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { expertAuthState } from "../../state/authState";

function SystemDetails() {
  const { systemId } = useParams();
  const navigate = useNavigate();
  const expertAuth = useRecoilValue(expertAuthState);
  const [systemResult, setSystemResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackContent, setFeedbackContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  console.log("✅ 전문가 정보:", expertAuth);

  // ✅ 시스템 자가진단 결과 가져오기 (GET /system-result)
  useEffect(() => {
    const fetchSystemResult = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/system-result?systemId=${systemId}`,
          { credentials: "include" }
        );
        const data = await response.json();

        if (response.ok) {
          setSystemResult(data);
        } else {
          setError(data.message);
        }
      } catch (error) {
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchSystemResult();
  }, [systemId]);

  // ✅ 전문가가 작성한 피드백 가져오기 (GET /feedback?expertId=X&systemId=Y)
  useEffect(() => {
    const fetchFeedback = async () => {
      if (!expertAuth.user || !expertAuth.user.id) return;

      try {
        const response = await fetch(
          `http://localhost:3000/feedback?expertId=${expertAuth.user.id}&systemId=${systemId}`,
          { credentials: "include" }
        );

        const data = await response.json();

        if (response.ok) {
          setFeedbackContent(data.feedback_content || "");
        } else {
          console.warn("피드백 없음 또는 조회 불가:", data.message);
        }
      } catch (error) {
        console.error("피드백 조회 오류:", error);
      }
    };

    fetchFeedback();
  }, [systemId, expertAuth.user]);

  // ✅ 피드백 저장 (POST /add-feedback)
  const handleSubmitFeedback = async () => {
    if (!feedbackContent.trim()) {
      alert("피드백 내용을 입력하세요.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/add-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          assessmentId: systemResult.assessment_id,
          expertId: expertAuth.user.id,
          feedbackContent,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("피드백이 성공적으로 저장되었습니다.");
        setFeedbackSubmitted(!feedbackSubmitted);
      } else {
        alert(`피드백 저장 실패: ${data.message}`);
      }
    } catch (error) {
      console.error("피드백 저장 오류:", error);
      alert("피드백 저장 중 오류가 발생했습니다.");
    }
  };

  // ✅ 피드백 수정 (PUT /update-feedback)
  const handleUpdateFeedback = async () => {
    if (!feedbackContent.trim()) {
      alert("피드백 내용을 입력하세요.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/update-feedback", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          assessmentId: systemResult.assessment_id,
          expertId: expertAuth.user.id,
          feedbackContent,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("피드백이 성공적으로 수정되었습니다.");
        setFeedbackSubmitted(!feedbackSubmitted);
        setIsEditing(false);
      } else {
        alert(`피드백 수정 실패: ${data.message}`);
      }
    } catch (error) {
      console.error("피드백 수정 오류:", error);
      alert("피드백 수정 중 오류가 발생했습니다.");
    }
  };

  if (loading) return <p className="text-center">데이터 로딩 중...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 py-10">
      <div className="bg-white rounded-lg w-full max-w-[800px] p-6 shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-5">
          {systemResult.system_name} - 자가진단 결과
        </h2>

        <table className="table-auto w-full border-collapse">
          <tbody>
            <tr>
              <td className="p-3 border bg-gray-100 font-semibold">점수</td>
              <td className="p-3 border">{systemResult.score}</td>
            </tr>
            <tr>
              <td className="p-3 border bg-gray-100 font-semibold">등급</td>
              <td className="p-3 border">{systemResult.grade}</td>
            </tr>
            <tr>
              <td className="p-3 border bg-gray-100 font-semibold">
                진단 완료 날짜
              </td>
              <td className="p-3 border">
                {systemResult.completed_at
                  ? systemResult.completed_at.split("T")[0]
                  : "진단 미완료"}
              </td>
            </tr>
            <tr>
              <td className="p-3 border bg-gray-100 font-semibold">
                피드백 상태
              </td>
              <td className="p-3 border">
                {systemResult.feedback_status || "전문가 피드백 없음"}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ✅ 피드백 입력/수정 폼 */}
        <div className="mt-5">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">
            피드백 작성
          </h3>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg"
            rows="5"
            placeholder="피드백을 입력하세요..."
            value={feedbackContent}
            onChange={(e) => setFeedbackContent(e.target.value)}
          ></textarea>

          {feedbackContent ? (
            isEditing ? (
              <button
                onClick={handleUpdateFeedback}
                className="mt-3 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                수정 완료
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="mt-3 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                피드백 수정
              </button>
            )
          ) : (
            <button
              onClick={handleSubmitFeedback}
              className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              피드백 저장
            </button>
          )}
        </div>

        <div className="mt-5 flex justify-between">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            뒤로 가기
          </button>
        </div>
      </div>
    </div>
  );
}

export default SystemDetails;
