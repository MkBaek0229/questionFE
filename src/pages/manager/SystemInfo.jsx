import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { expertAuthState } from "../../state/authState";

function SystemInfo() {
  const { systemId } = useParams();
  const navigate = useNavigate();
  const expertAuth = useRecoilValue(expertAuthState);
  const [systemInfo, setSystemInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ 시스템 정보 가져오기 (GET /system-details)
  useEffect(() => {
    const fetchSystemInfo = async () => {
      if (!expertAuth.user || !expertAuth.user.id) {
        setError("전문가 정보가 없습니다.");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:3000/system-details?expertId=${expertAuth.user.id}&systemId=${systemId}`,
          { credentials: "include" }
        );

        const data = await response.json();

        if (response.ok) {
          setSystemInfo(data);
        } else {
          setError(data.message);
        }
      } catch (error) {
        setError("시스템 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchSystemInfo();
  }, [systemId, expertAuth.user]);

  if (loading) return <p className="text-center">데이터 로딩 중...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 py-10">
      <div className="bg-white rounded-lg w-full max-w-[800px] p-6 shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-5">
          {systemInfo.system_name} - 시스템 정보
        </h2>

        <table className="table-auto w-full border-collapse">
          <tbody>
            <tr>
              <td className="p-3 border bg-gray-100 font-semibold">
                기관 회원
              </td>
              <td className="p-3 border">{systemInfo.institution_name}</td>
            </tr>
            <tr>
              <td className="p-3 border bg-gray-100 font-semibold">
                최소 문항 수
              </td>
              <td className="p-3 border">{systemInfo.min_subjects}</td>
            </tr>
            <tr>
              <td className="p-3 border bg-gray-100 font-semibold">
                최대 문항 수
              </td>
              <td className="p-3 border">{systemInfo.max_subjects}</td>
            </tr>
            <tr>
              <td className="p-3 border bg-gray-100 font-semibold">
                처리 목적
              </td>
              <td className="p-3 border">{systemInfo.purpose}</td>
            </tr>
            <tr>
              <td className="p-3 border bg-gray-100 font-semibold">
                민감 정보 포함 여부
              </td>
              <td className="p-3 border">
                {systemInfo.is_private ? "포함" : "미포함"}
              </td>
            </tr>
            <tr>
              <td className="p-3 border bg-gray-100 font-semibold">
                고유 식별 정보 포함 여부
              </td>
              <td className="p-3 border">
                {systemInfo.is_unique ? "포함" : "미포함"}
              </td>
            </tr>
            <tr>
              <td className="p-3 border bg-gray-100 font-semibold">
                주민등록번호 포함 여부
              </td>
              <td className="p-3 border">
                {systemInfo.is_resident ? "포함" : "미포함"}
              </td>
            </tr>
            <tr>
              <td className="p-3 border bg-gray-100 font-semibold">
                수집 근거
              </td>
              <td className="p-3 border">{systemInfo.reason}</td>
            </tr>
            <tr>
              <td className="p-3 border bg-gray-100 font-semibold">
                자가진단 상태
              </td>
              <td className="p-3 border">{systemInfo.assessment_status}</td>
            </tr>
          </tbody>
        </table>

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

export default SystemInfo;
