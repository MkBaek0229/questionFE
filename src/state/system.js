import { atom } from "recoil";

// 전체 시스템 목록 상태
export const systemsState = atom({
  key: "systemsState",
  default: [],
});
// 선택된 시스템 ID 상태
export const selectedSystemState = atom({
  key: "selectedSystemState",
  default: null,
});
