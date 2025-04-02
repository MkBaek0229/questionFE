import React, { useState, useRef, useEffect } from "react";
import { useRecoilState } from "recoil";
import { formState } from "../../state/formState";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

function SignupStep1({ prevStep, nextStep }) {
  const [formData, setFormData] = useRecoilState(formState);
  const [isScrolled, setIsScrolled] = useState(false);
  const termsRef = useRef(null);

  useEffect(() => {
    if (termsRef.current) {
      console.log("약관 영역이 정상적으로 참조됨:", termsRef.current);
    }
  }, []);

  // 스크롤이 끝까지 내려갔는지 확인
  const handleScroll = () => {
    if (termsRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = termsRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 5) {
        setIsScrolled(true);
      }
    }
  };

  const handleAgreementChange = (e) => {
    if (isScrolled) {
      setFormData({ ...formData, agreement: e.target.checked });
    }
  };

  return (
    <>
      {/* 폼 UI */}
      <div className="bg-white p-6 rounded-lg  w-3/4 max-w-2xl">
        <p className="text-[18px] mb-3 font-bold">
          <span className="text-blue-500 font-medium">[필수]</span> 이용약관
        </p>
        {/* 이용약관 섹션 */}
        <div className="mb-6">
          <div
            className="border p-4 h-48 overflow-y-auto text-sm bg-gray-100"
            ref={termsRef}
            onScroll={handleScroll}
            style={{ whiteSpace: "pre-wrap", lineHeight: "1.5" }}
          >
            <strong>제1조 (목적)</strong>
            <p>
              본 약관은 [개인정보 컴플라이언스 강화 플랫폼]이 제공하는 서비스의
              이용 조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임 사항을
              규정함을 목적으로 합니다.
            </p>
            <strong>제2조 (용어의 정의)</strong>
            <p>
              1. "서비스"라 함은 회사가 운영하는 웹사이트 및 모바일
              애플리케이션을 통해 제공하는 모든 기능과 콘텐츠를 의미합니다.
            </p>
            <p>
              2. "회원"이라 함은 본 약관에 따라 서비스에 가입하여 이용하는 자를
              의미합니다.
            </p>
            <p>
              3. "이용 계약"이라 함은 본 약관을 포함하여 서비스 이용과 관련하여
              회사와 회원 간에 체결하는 모든 계약을 의미합니다.
            </p>
            <strong>제3조 (이용 계약 체결)</strong>
            <p>
              1. 회원 가입은 서비스가 정한 가입 양식에 따라 이용자가 동의 후
              신청하고, 회사가 이를 승인함으로써 성립됩니다.
            </p>
            <p>2. 회사는 아래의 경우 가입 승인을 거부할 수 있습니다.</p>
            <p>a. 신청자가 본 약관을 위반한 사실이 있는 경우</p>
            <p>b. 허위 정보를 기재한 경우</p>
            <p>c. 기타 운영상 부적절하다고 판단되는 경우</p>
            <strong>제4조 (서비스 이용 및 제한)</strong>
            <p>
              1. 서비스 이용 시간은 회사의 운영정책에 따라 변경될 수 있으며,
              회사는 별도의 공지 없이 서비스를 중단할 수 있습니다.
            </p>
            <p>
              2. 회원은 서비스 이용 시 관련 법령 및 본 약관을 준수해야 합니다.
            </p>
            <strong>제5조 (계약 해지 및 이용 제한)</strong>
            <p>
              1. 회원이 서비스 탈퇴를 원할 경우, [고객센터 문의 또는 관리자
              요청을 통해] 탈퇴를 진행할 수 있습니다.
            </p>
            <p>
              2. 회사는 다음과 같은 경우 회원의 서비스 이용을 제한하거나 해지할
              수 있습니다.
            </p>
            <p>a. 본 약관을 위반한 경우</p>
            <p>b. 불법 행위를 하거나 타인의 권리를 침해한 경우</p>
            <p>c. 기타 서비스 운영에 지장을 초래하는 행위를 한 경우</p>
            <strong>제6조 (면책 조항)</strong>
            <p>
              1. 회사는 천재지변, 전쟁, 기술적 장애 등 불가항력적 사유로 인해
              서비스를 제공할 수 없는 경우 책임을 지지 않습니다.
            </p>
            <p>
              2. 회원이 서비스 이용 중 발생한 손해에 대해 회사는 책임을 지지
              않습니다.
            </p>
          </div>
        </div>

        {/* 체크박스 숨기기 */}
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.agreement || false}
              onChange={handleAgreementChange}
              disabled={!isScrolled}
              className="sr-only peer"
            />

            {/* 체크박스 스타일 */}
            <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center peer-checked:bg-blue-500 peer-checked:border-blue-500 mr-2">
              {/* 체크 아이콘 */}
              <FontAwesomeIcon icon={faCheck} className="text-white text-sm" />
            </div>

            <span className="text-[16px] font-medium">
              이용 약관에 동의합니다
            </span>
          </label>
          {!isScrolled && (
            <p className="text-red-500 text-sm mt-1">
              약관을 끝까지 읽어야 동의할 수 있습니다.
            </p>
          )}
        </div>

        <button
          onClick={prevStep}
          className="w-[100%] h-[50px] text-[22px] font-bold rounded-md"
        >
          이전
        </button>

        {/* 다음 버튼 */}
        <button
          className={`w-[100%] h-[50px] text-[22px] font-bold rounded-md ${
            formData.agreement
              ? "bg-blue-500 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-700 cursor-not-allowed"
          }`}
          onClick={nextStep}
          disabled={!formData.agreement}
        >
          다음
        </button>
      </div>
    </>
  );
}

export default SignupStep1;
