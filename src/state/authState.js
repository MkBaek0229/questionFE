import { atom } from "recoil";

export const authState = atom({
  key: "authState",
  default: {
    isLoggedIn: false,
    user: null, // 로그인된 관리자 정보
  },
});
// 관리자 로그인 상태
export const expertAuthState = atom({
  key: "expertAuthState",
  default: {
    isLoggedIn: false, // 관리자 로그인 여부
    user: null, // 로그인된 관리자 정보
  },
});

// 슈퍼유저 로그인 상태
export const superUserAuthState = atom({
  key: "superUserAuthState",
  default: {
    isLoggedIn: false, // 슈퍼유저 로그인 여부
    user: null, // 로그인된 슈퍼유저 정보
  },
});
