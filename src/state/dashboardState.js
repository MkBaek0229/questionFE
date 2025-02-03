import { atom } from "recoil";

// 각 시스템의 진단 상태
export const assessmentStatusesState = atom({
  key: "assessmentStatusesState",
  default: {}, // 초기값은 빈 객체
});

// 로딩 상태
export const loadingState = atom({
  key: "loadingState",
  default: true, // 초기값은 true (로딩 중)
});

// 오류 메시지 상태
export const errorMessageState = atom({
  key: "errorMessageState",
  default: "", // 초기값은 빈 문자열
});
