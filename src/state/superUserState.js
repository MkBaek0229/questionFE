import { atom } from "recoil";

// 관리자 데이터 상태
export const managersState = atom({
  key: "managersState",
  default: [], // 초기값: 빈 배열
});
