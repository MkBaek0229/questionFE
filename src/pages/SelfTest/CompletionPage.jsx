import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useRecoilValue } from "recoil";
import { authState } from "../../state/authState";

function CompletionPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [resultData, setResultData] = useState(null); // 결과 데이터 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const [finalUserId, setFinalUserId] = useState(null); // 최종 userId 상태

  // `systemId`와 `userId`를 location state에서 가져오기
  console.log(location.state);
  const { userId, systemId, userType } = location.state || {};

  console.log("Received state in CompletionPage:", {
    userId,
    systemId,
    userType,
  });

  // 사용자 유형 확인
  const isExpert = userType === "전문가";
  const isInstitution = userType === "기관회원";

  // ✅ 전문가 회원일 경우, systemId를 기반으로 기관회원 userId 조회
  const fetchSystemOwner = async () => {
    try {
      const response = await axios.get("http://localhost:3000/system-owner", {
        params: { systemId },
        withCredentials: true,
      });
      setFinalUserId(response.data.userId); // 기관회원의 userId 설정
    } catch (error) {
      console.error("Error fetching system owner:", error);
      setError("시스템 정보를 불러오는 중 오류가 발생했습니다.");
    }
  };

  // 최신 데이터를 가져오는 함수
  const fetchResultData = async (userIdToFetch) => {
    console.log("Sending GET request with:", {
      userId: userIdToFetch,
      systemId,
    });

    try {
      const response = await axios.get(
        "http://localhost:3000/assessment/result",
        {
          params: { userId: userIdToFetch, systemId },
          withCredentials: true,
        }
      );

      // 최신 데이터를 정렬하여 가장 최근 항목 선택
      const sortedData = response.data.sort(
        (a, b) => new Date(b.completed_at) - new Date(a.completed_at)
      );
      setResultData(sortedData[0]); // 최신 데이터만 설정
    } catch (error) {
      console.error("Error fetching results:", error.response?.data || error);
      setError(
        error.response?.data?.message ||
          "결과 데이터를 가져오는 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  // 결과 저장 요청
  const handlePostCompletion = async () => {
    if (!userId || !systemId) {
      setError("시스템 또는 사용자 정보가 누락되었습니다.");
      return;
    }

    try {
      // 상태 업데이트 요청
      const response = await axios.post(
        "http://localhost:3000/selftest/qualitative/update-status",
        { systemId },
        { withCredentials: true }
      );
      console.log("Feedback status updated:", response.data.msg);

      // ✅ 최신 상태 데이터 가져오기
      await fetchResultData(); // 상태 갱신 후 결과 데이터를 가져옴
      alert("피드백 상태가 성공적으로 업데이트되었습니다.");
    } catch (error) {
      console.error("Error updating feedback status:", error);
      setError(
        error.response?.data?.message ||
          "피드백 상태 업데이트 중 오류가 발생했습니다."
      );
    }
  };

  useEffect(() => {
    if (!systemId) {
      console.error("Missing systemId:", { systemId });
      setError("시스템 정보가 누락되었습니다.");
      setLoading(false);
      return;
    }

    const fetchOwnerAndSetUserId = async () => {
      if (isExpert) {
        console.log("🔹 전문가 회원으로 접근 - 기관회원의 userId 조회 시작");
        await fetchSystemOwner();
      } else {
        setFinalUserId(userId);
      }
    };

    fetchOwnerAndSetUserId();
  }, [userId, systemId, isExpert]);

  useEffect(() => {
    if (finalUserId && systemId) {
      fetchResultData(finalUserId);
    }
  }, [finalUserId, systemId]);

  if (loading) {
    return (
      <div className="text-center mt-10">
        <p className="text-lg font-semibold">결과를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-10">
        <p className="text-lg font-bold">오류 발생</p>
        <p className="text-gray-700">{error}</p>
        <button
          onClick={() => {
            if (isInstitution) {
              navigate("/dashboard");
            } else if (isExpert) {
              navigate("/system-management");
            } else {
              navigate("/");
            }
          }}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
        >
          대시보드로 이동
        </button>
      </div>
    );
  }

  const { score, grade, feedback_status } = resultData || {};

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center">
      <div className="container mx-auto max-w-4xl bg-white mt-10 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          자가진단 결과
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-blue-100 rounded-md text-center">
            <h3 className="text-lg font-bold text-blue-600">점수</h3>
            <p className="text-3xl font-extrabold">{score ?? "N/A"}</p>
          </div>
          <div className="p-4 bg-green-100 rounded-md text-center">
            <h3 className="text-lg font-bold text-green-600">등급</h3>
            <p className="text-3xl font-extrabold">{grade ?? "N/A"}</p>
          </div>
        </div>
        <div className="p-4 bg-gray-100 rounded-md mb-6">
          <h3 className="text-lg font-bold text-gray-600">피드백 상태</h3>
          <p className="text-gray-700">
            {feedback_status ?? "결과 데이터가 없습니다."}
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              if (isInstitution) {
                navigate("/dashboard");
              } else if (isExpert) {
                navigate("/system-management");
              } else {
                navigate("/");
              }
            }}
            className="px-6 py-2 bg-gray-400 text-white rounded-md shadow hover:bg-gray-500"
          >
            대시보드로 이동
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompletionPage;
