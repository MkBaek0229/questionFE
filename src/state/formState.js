import { atom } from "recoil";

export const formState = atom({
  key: "formState",
  default: {
    agreement: false,
    member_type: "", // "user" 또는 "expert"
    email: "",
    password: "",
    emailVerified: false,
    user: {
      institution_name: "",
      institution_address: "",
      representative_name: "",
      phone_number: "", // ✅ 반드시 phone_number로 유지
    },
    expert: {
      name: "",
      institution_name: "",
      ofcps: "",
      phone_number: "",
      major_carrea: "",
    },
    system: {
      // 시스템 등록 폼 데이터 추가
      name: "",
      min_subjects: "",
      max_subjects: "",
      purpose: "",
      is_private: false,
      is_unique: false,
      is_resident: false,
      reason: "동의", // 기본값 설정
    },
  },
});
