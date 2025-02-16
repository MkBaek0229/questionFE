import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useNavigate } from "react-router-dom";

function FindAccountSelectPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 bg-cover bg-center">
      <div className="p-8 rounded-lg w-3/4 max-w-md bg-white shadow-lg">
        {/* 뒤로가기 버튼 + 제목 */}
        <div className="flex items-center mb-6 gap-4">
          <Link to="/login" className="text-blue-500 hover:underline">
            <FontAwesomeIcon icon={faArrowLeft} />
          </Link>
          <h2 className="text-1xl font-bold text-center">
            회원 유형을 선택하세요
          </h2>
        </div>

        {/* 회원 유형 선택 버튼 */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate(`/find-account/institution`)}
            className="bg-blue-500 text-white py-3 px-6 rounded-lg shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105"
          >
            기관회원 비밀번호 찾기
          </button>
          <button
            onClick={() => navigate(`/find-account/expert`)}
            className="bg-green-500 text-white py-3 px-6 rounded-lg shadow-lg hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105"
          >
            전문가회원 비밀번호 찾기
          </button>
        </div>
      </div>
    </div>
  );
}

export default FindAccountSelectPage;
