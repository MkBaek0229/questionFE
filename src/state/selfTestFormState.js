import { atom } from "recoil";

// 자가진단 폼 상태
export const selfTestFormState = atom({
  key: "selfTestFormState",
  default: {
    organization: "교육기관", // 기본값 설정
    userGroup: "1~4명", // 기본값 설정
    personalInfoSystem: "없음", // 기본값 설정
    memberInfoHomepage: "없음", // 기본값 설정
    externalDataProvision: "없음", // 기본값 설정
    cctvOperation: "미운영", // 기본값 설정
    taskOutsourcing: "없음", // 기본값 설정
    personalInfoDisposal: "없음", // 기본값 설정
  },
});

export const quantitativeDataState = atom({
  key: "quantitativeDataState",
  default: [], // 초기값은 빈 배열
});

// 사용자 응답 상태
export const responsesState = atom({
  key: "responsesState",
  default: {}, // 초기값은 빈 객체
});

// 현재 진행 단계 상태
export const currentStepState = atom({
  key: "currentStepState",
  default: 1, // 초기값은 1단계
});

// 정성 문항 데이터 상태
export const qualitativeDataState = atom({
  key: "qualitativeDataState",
  default: [], // 초기값은 빈 배열
});

// 사용자 응답 상태
export const qualitativeResponsesState = atom({
  key: "qualitativeResponsesState",
  default: {}, // 초기값은 빈 객체
});

// 현재 진행 단계 상태
export const qualitativeCurrentStepState = atom({
  key: "qualitativeCurrentStepState",
  default: 1, // 초기값은 첫 번째 단계
});
