function Footer() {
  return (
    <>
      <footer className="w-full py-6 bg-gray-200 text-gray-700 text-center">
        <p>
          © 2025 개인정보보호위원회 |{" "}
          <a
            href="https://www.martinlab.co.kr/"
            aria-label="마틴랩 홈페이지"
            className="text-blue-600 font-semibold"
          >
            주식회사 마틴랩
          </a>
        </p>
        <p className="mt-2 text-sm">문의: support@privacy.gov.kr</p>
      </footer>
    </>
  );
}

export default Footer;
