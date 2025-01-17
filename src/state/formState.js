import { atom } from "recoil";

export const formState = atom({
  key: "formState",
  default: {
    agreement: false,
    member_type: "", // "User" 또는 "expert"
    email: "",
    password: "",
    emailVerified: false,
    user: {
      institution_name: "",
      institution_address: "",
      representative_name: "",
      phone: "",
    },
    expert: {
      name: "",
      institution_name: "",
      ofcps: "", // 직위(직급)
      phone_number: "",
      major_carrea: "", // 주요 경력
    },
  },
});
