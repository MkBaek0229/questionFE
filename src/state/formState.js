import { atom } from "recoil";

export const formState = atom({
  key: "formState",
  default: {
    agreement: false, // 추가된 필드
    member_type: "", // "user" 또는 "expert"
    email: "", // 추가된 필드
    password: "", // 추가된 필드
    emailVerified: false, // 추가된 필드
    user: {
      institution_name: "", // 추가된 필드
      institution_address: "", // 추가된 필드
      representative_name: "", // 추가된 필드
      phone_number: "", // ✅ 반드시 phone_number로 유지
    },
    expert: {
      name: "", // 추가된 필드
      institution_name: "", // 추가된 필드
      ofcps: "", // 추가된 필드
      phone_number: "", // 추가된 필드
      major_carrea: "", // 추가된 필드
    },
    name: "",
    num_data_subjects: "", // ✅ 변경된 필드 반영
    purpose: "",
    is_private: "포함", // 기본값 설정
    is_unique: "미포함", // 기본값 설정
    is_resident: "포함", // 기본값 설정
    reason: "동의", // 기본값 설정
  },
});
