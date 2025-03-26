// 📌 최근 활동 컴포넌트 추가
import React, { useEffect, useState } from "react";
import axiosInstance from "../../../axiosInstance";
import {
  faClipboardCheck,
  faPen,
  faDesktop,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const getRelativeTime = (dateStr) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diff === 0) return "오늘";
  if (diff === 1) return "어제";
  return `${diff}일 전`;
};

const iconMap = {
  diagnosis: faClipboardCheck,
  feedback: faPen,
  register: faDesktop,
};

function RecentActivities() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axiosInstance.get(
          "http://localhost:3000/activity/recent",
          {
            withCredentials: true,
          }
        );
        setActivities(response.data);
      } catch (error) {
        console.error("❌ 최근 활동 가져오기 실패:", error);
      }
    };

    fetchActivities();
  }, []);

  return (
    <div className="bg-white border p-6 mt-6">
      <h3 className="text-2xl font-bold">최근 활동</h3>
      <p className="text-sm font-medium text-gray-500">
        사용자의 최근 활동 정보를 안내합니다.
      </p>
      {activities.map((act, idx) => (
        <div key={idx} className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
            <FontAwesomeIcon
              icon={iconMap[act.type]}
              className="text-gray-600"
            />
          </div>
          <div>
            <p className="text-sm font-medium">
              {act.title} {getActivityLabel(act.type)}
            </p>
            <p className="text-xs text-gray-400">{getRelativeTime(act.date)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function getActivityLabel(type) {
  switch (type) {
    case "diagnosis":
      return "자가진단 완료";
    case "feedback":
      return "피드백 수신";
    case "register":
      return "시스템 등록";
    default:
      return "활동";
  }
}

export default RecentActivities;
