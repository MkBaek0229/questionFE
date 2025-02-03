import { atom } from "recoil";

export const systemsState = atom({
  key: "systemsState",
  default: [], // 초기값: 빈 배열
});

export const systemIdState = atom({
  key: "systemIdState",
  default: null,
});
