import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faTwitter,
  faInstagram,
  faLinkedin,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import {
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";

import MainLogo from "../../assets/logo/MainLogo.png";
function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white">
      {/* 상단 푸터 영역 */}

      {/* 하단 저작권 영역 */}
      <div className="border-t border-blue-500/50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row  items-center">
          <span className="bg-white text-blue-600 w-10 h-10 rounded-full flex items-center justify-center mr-3">
            <img src={MainLogo} alt="메인로고" className="w-8 h-6" />
          </span>{" "}
          <a
            href="https://www.martinlab.co.kr/"
            target="_blank"
            className="text-md text-blue-100 flex"
          >
            © {year} 주식회사 마틴랩.
          </a>
        </div>
      </div>

      {/* 하단 장식 요소 */}
      <div className="bg-gradient-to-r from-blue-800 to-indigo-800 h-2"></div>
    </footer>
  );
}

export default Footer;
