import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useRecoilState, useRecoilValue } from "recoil";
import { systemsState } from "../../state/system"; // ✅ 시스템 상태 가져오기

function CompletionPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [finalUserId, setFinalUserId] = useState(null);

  const { userId, systemId, userType } = location.state || {};
  const isExpert = userType === "전문가";
  const isInstitution = userType === "기관회원";

  // ✅ 시스템 상태 가져오기
  const [systems, setSystems] = useRecoilState(systemsState);
  console.log("🟢 Recoil 상태 (systemsState) 확인:", systems);

  // ✅ 현재 선택된 시스템 찾기
  let currentSystem = systems.find(
    (sys) => Number(sys.systems_id) === Number(systemId)
  );

  console.log("🟢 현재 선택된 시스템:", currentSystem);

  // ✅ 만약 currentSystem이 없거나 feedback_status가 없으면, 백엔드에서 다시 가져옴
  useEffect(() => {
    if (!currentSystem || !currentSystem.feedback_status) {
      console.log("⚠️ 시스템 데이터가 최신이 아님. 백엔드에서 다시 가져옴.");
      fetchAssignedSystems();
    }
  }, [currentSystem]);

  const fetchAssignedSystems = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/assigned-systems?expertId=${userId}`,
        { withCredentials: true }
      );
      console.log("✅ 최신 시스템 데이터:", response.data.data);
      setSystems(response.data.data);
    } catch (error) {
      console.error("❌ 시스템 데이터 가져오기 실패:", error);
    }
  };

  // ✅ 피드백 상태 가져오기
  const feedbackStatus =
    currentSystem?.feedback_status || "전문가 자문 반영 전";

  // ✅ 전문가 회원일 경우, systemId를 기반으로 기관회원 userId 조회
  const fetchSystemOwner = async () => {
    try {
      const response = await axios.get("http://localhost:3000/system-owner", {
        params: { systemId },
        withCredentials: true,
      });
      setFinalUserId(response.data.userId);
    } catch (error) {
      console.error("❌ 시스템 소유자 정보 가져오기 실패:", error);
      setError("시스템 정보를 불러오는 중 오류가 발생했습니다.");
    }
  };

  // ✅ 최신 결과 데이터 가져오기
  const fetchResultData = async (userIdToFetch) => {
    if (!userIdToFetch || !systemId) return;

    try {
      const response = await axios.get(
        "http://localhost:3000/assessment/result",
        {
          params: { userId: userIdToFetch, systemId },
          withCredentials: true,
        }
      );

      const sortedData = response.data.sort(
        (a, b) => new Date(b.completed_at) - new Date(a.completed_at)
      );

      setResultData(sortedData[0]);
    } catch (error) {
      console.error(
        "❌ 결과 데이터 가져오기 실패:",
        error.response?.data || error
      );
      setError(
        error.response?.data?.message ||
          "결과 데이터를 가져오는 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ 전문가 회원일 경우 기관회원 userId 조회
  useEffect(() => {
    if (!systemId) {
      setError("시스템 정보가 누락되었습니다.");
      setLoading(false);
      return;
    }

    const fetchOwnerAndSetUserId = async () => {
      if (isExpert) {
        await fetchSystemOwner();
      } else {
        setFinalUserId(userId);
      }
    };

    fetchOwnerAndSetUserId();
  }, [userId, systemId, isExpert]);

  // ✅ `finalUserId` 변경 시 데이터 다시 로드
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

  const { score, grade } = resultData || {};

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
          <p className="text-gray-700">{feedbackStatus}</p>
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
