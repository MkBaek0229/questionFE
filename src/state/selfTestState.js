import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

// ✅ 로컬 스토리지에 저장 (자동 유지됨)
const { persistAtom } = recoilPersist({
  key: "selfTestStorage", // 저장될 key
  storage: localStorage, // 또는 sessionStorage 사용 가능
});

export const selectedSystemState = atom({
  key: "selectedSystem",
  default: null,
  effects_UNSTABLE: [persistAtom],
});

export const selectedUserState = atom({
  key: "selectedUser",
  default: null, // ✅ 로그인한 사용자 ID 저장
  effects_UNSTABLE: [persistAtom],
});

export const selfTestFormState = atom({
  key: "selfTestForm",
  default: {
    organization: "교육기관",
    userGroup: "1~4명",
    personalInfoSystem: "없음",
    memberInfoHomepage: "없음",
    externalDataProvision: "없음",
    cctvOperation: "미운영",
    taskOutsourcing: "없음",
    personalInfoDisposal: "없음",
  },
  effects_UNSTABLE: [persistAtom],
});

export const quantitativeDataState = atom({
  key: "quantitativeData",
  default: [],
  effects_UNSTABLE: [persistAtom],
});

export const responsesState = atom({
  key: "responses",
  default: {},
  effects_UNSTABLE: [persistAtom],
});

export const currentStepState = atom({
  key: "currentStep",
  default: 1,
  effects_UNSTABLE: [persistAtom],
});

export const qualitativeDataState = atom({
  key: "qualitativeData",
  default: [],
  effects_UNSTABLE: [persistAtom],
});

export const qualitativeCurrentStepState = atom({
  key: "qualitativeCurrentStep",
  default: 1,
  effects_UNSTABLE: [persistAtom],
});

// ✅ 정량 응답 저장 여부 (중복 저장 방지)
export const responsesSavedState = atom({
  key: "responsesSaved",
  default: false,
  effects_UNSTABLE: [persistAtom],
});
export const quantitativeResponsesState = atom({
  key: "quantitativeResponses",
  default: [], // ✅ 기본값을 빈 배열로 설정
  effects_UNSTABLE: [persistAtom],
});

export const qualitativeResponsesState = atom({
  key: "qualitativeResponses",
  default: [], // ✅ 기본값을 빈 배열로 설정
});

// ✅ 진단 완료 여부 (설문 완료 여부 체크)
export const diagnosisCompletedState = atom({
  key: "diagnosisCompleted",
  default: false,
  effects_UNSTABLE: [persistAtom],
});

// ✅ 정량 문항 상태 (quantitative_questions)
export const quantitativeQuestionsState = atom({
  key: "quantitativeQuestionsState",
  default: [],
});

// ✅ 정성 문항 상태 (qualitative_questions)
export const qualitativeQuestionsState = atom({
  key: "qualitativeQuestionsState",
  default: [],
});

export const editorContentState = atom({
  key: "editorContentState",
  default: "", // 초기값은 빈 문자열
});

// ✅ 피드백 상태 (정량 + 정성)
export const feedbackState = atom({
  key: "feedbackState",
  default: [],
});

export const systemDataState = atom({
  key: "systemDataState",
  default: {
    quantitativeQuestions: [],
    quantitativeResponses: [],
    quantitativeFeedbacks: [],
    qualitativeQuestions: [],
    qualitativeResponses: [],
    qualitativeFeedbacks: [],
  },
});
