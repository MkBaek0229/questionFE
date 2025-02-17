import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useRecoilState } from "recoil";
import {
  quantitativeQuestionsState,
  qualitativeQuestionsState,
} from "../../state/selfTestState";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faSave,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import TiptapEditor from "../../components/Super/TiptapEditor";
import { faFolderOpen } from "@fortawesome/free-regular-svg-icons";
import CategoryManager from "./CategoryManager";

const getCsrfToken = async () => {
  try {
    const response = await axios.get("http://localhost:3000/csrf-token", {
      withCredentials: true, // ✅ 세션 쿠키 포함
    });
    return response.data.csrfToken;
  } catch (error) {
    console.error("❌ CSRF 토큰 가져오기 실패:", error);
    return null;
  }
};
function SuperManageQuestions() {
  const [categories, setCategories] = useState([]); // ✅ 카테고리 목록 저장
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false); // ✅ 모달 상태 추가

  const [quantitativeQuestions, setQuantitativeQuestions] = useRecoilState(
    quantitativeQuestionsState
  );
  const [qualitativeQuestions, setQualitativeQuestions] = useRecoilState(
    qualitativeQuestionsState
  );
  const [newQuestion, setNewQuestion] = useState({
    type: "quantitative",
    question_number: "",
    category_id: "", // ✅ 추가: 선택한 카테고리 ID
    question: "",
    indicator: "",
    indicator_definition: "",
    evaluation_criteria: "", // ✅ 기본값을 빈 문자열로 설정
    reference_info: "",
    legal_basis: "",
  });
  const [selectedQuestion, setSelectedQuestion] = useState(null); // 수정할 문항 저장
  const [editedData, setEditedData] = useState({}); // 수정 데이터 저장
  const quillRef = useRef(null); // ✅ Quill ref 추가
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    const fetchCsrfToken = async () => {
      const token = await getCsrfToken();
      setCsrfToken(token);
    };
    fetchCsrfToken();
  }, []);

  useEffect(() => {
    // ✅ 서버에서 카테고리 목록 가져오기
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:3000/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("❌ 카테고리 목록 불러오기 실패:", error);
      }
    };
    fetchCategories();
  }, []);

  // ✅ 문항 목록 API 요청
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const [quantitativeRes, qualitativeRes] = await Promise.all([
          axios.get("http://localhost:3000/super/selftest/quantitative", {
            withCredentials: true,
          }),
          axios.get("http://localhost:3000/super/selftest/qualitative", {
            withCredentials: true,
          }),
        ]);

        console.log("🔍 [DEBUG] 정량 문항 응답 데이터:", quantitativeRes.data);
        console.log("🔍 [DEBUG] 정성 문항 응답 데이터:", qualitativeRes.data);

        // ✅ API 응답에서 `data` 키를 추출하여 설정
        setQuantitativeQuestions(
          Array.isArray(quantitativeRes.data.data)
            ? quantitativeRes.data.data
            : []
        );
        setQualitativeQuestions(
          Array.isArray(qualitativeRes.data.data)
            ? qualitativeRes.data.data
            : []
        );
      } catch (error) {
        console.error("❌ 문항 불러오기 오류:", error);
      }
    };

    fetchQuestions();
  }, []);

  // 문항 추가 요청
  const handleAddQuestion = async () => {
    try {
      const endpoint =
        newQuestion.type === "quantitative"
          ? "http://localhost:3000/super/selftest/quantitative/add"
          : "http://localhost:3000/super/selftest/qualitative/add";

      const questionData =
        newQuestion.type === "quantitative"
          ? {
              question_number: newQuestion.question_number,
              question: newQuestion.question,
              evaluation_criteria: newQuestion.evaluation_criteria,
              legal_basis: newQuestion.legal_basis,
              score_fulfilled: Number(newQuestion.score_fulfilled) || 0,
              score_unfulfilled: Number(newQuestion.score_unfulfilled) || 0,
              score_consult: Number(newQuestion.score_consult) || 0,
              score_not_applicable:
                Number(newQuestion.score_not_applicable) || 0,
            }
          : {
              question_number: newQuestion.question_number,
              indicator: newQuestion.indicator,
              indicator_definition: newQuestion.indicator_definition,
              evaluation_criteria: newQuestion.evaluation_criteria,
              reference_info: newQuestion.reference_info,
              score_consult: Number(newQuestion.score_consult) || 0,
              score_not_applicable:
                Number(newQuestion.score_not_applicable) || 0,
            };

      console.log("📤 전송할 데이터:", questionData); // 디버깅 로그 추가

      const response = await axios.post(endpoint, questionData, {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });

      alert("✅ 문항이 추가되었습니다!");
      if (newQuestion.type === "quantitative") {
        setQuantitativeQuestions([...quantitativeQuestions, response.data]);
      } else {
        setQualitativeQuestions([...qualitativeQuestions, response.data]);
      }

      // 입력 필드 초기화
      setNewQuestion({
        type: "quantitative",
        question_number: "",
        question: "",
        indicator: "",
        indicator_definition: "",
        evaluation_criteria: "",
        reference_info: "",
        legal_basis: "",
        score_fulfilled: "",
        score_unfulfilled: "",
        score_consult: "",
        score_not_applicable: "",
      });
    } catch (error) {
      console.error("❌ 문항 추가 실패:", error.response?.data || error);
      alert("❌ 문항 추가 실패:", error.response.data.message);
    }
  };

  // ✅ 수정 저장 버튼 클릭
  const handleEditSave = async (id, type) => {
    const endpoint =
      type === "quantitative"
        ? `http://localhost:3000/super/selftest/quantitative/put/${id}`
        : `http://localhost:3000/super/selftest/qualitative/put/${id}`;

    try {
      await axios.put(endpoint, editedData, {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });

      alert("✅ 문항이 수정되었습니다!");
      setSelectedQuestion(null); // 폼 닫기

      if (type === "quantitative") {
        setQuantitativeQuestions((prev) =>
          prev.map((q) => (q.id === id ? editedData : q))
        );
      } else {
        setQualitativeQuestions((prev) =>
          prev.map((q) => (q.id === id ? editedData : q))
        );
      }
    } catch (error) {
      console.error("❌ 문항 수정 실패:", error);
      alert("문항 수정 중 오류가 발생했습니다.");
    }
  };
  // 문항 삭제 요청
  const handleDeleteQuestion = async (id, type) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      const endpoint =
        type === "quantitative"
          ? `http://localhost:3000/super/selftest/quantitative/del/${id}`
          : `http://localhost:3000/super/selftest/qualitative/del/${id}`;

      await axios.delete(endpoint, {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });

      alert("✅ 문항이 삭제되었습니다!");
      if (type === "quantitative") {
        setQuantitativeQuestions(
          quantitativeQuestions.filter((q) => q.id !== id)
        );
      } else {
        setQualitativeQuestions(
          qualitativeQuestions.filter((q) => q.id !== id)
        );
      }
    } catch (error) {
      console.error("❌ 문항 삭제 실패:", error);
      alert("문항 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleEditStart = (question, type) => {
    console.log("📝 수정할 문항 데이터:", question); // 🔥 디버깅

    setSelectedQuestion({ ...question, type });

    setEditedData({
      ...question,
      category_id: question.category_id || "", // ✅ 기존 카테고리 값 불러오기
      evaluation_criteria: question.evaluation_criteria || "<p><br></p>", // ✅ 빈 값 방지
      score_fulfilled: question.score_fulfilled || 0, // ✅ 기존 점수 불러오기
      score_unfulfilled: question.score_unfulfilled || 0,
      score_consult: question.score_consult || 0,
      score_not_applicable: question.score_not_applicable || 0,
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
      <div className="max-w-6xl w-full bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          슈퍼유저 문항 관리
        </h1>

        {/* ✅ 카테고리 관리 버튼 (모달 열기) */}
        <button
          onClick={() => setCategoryModalOpen(true)}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md flex items-center"
        >
          <FontAwesomeIcon icon={faFolderOpen} className="mr-2" />
          카테고리 관리
        </button>

        {/* ✅ 모달 추가 (카테고리 관리) */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 relative">
              <h2 className="text-xl font-bold mb-4">카테고리 관리</h2>
              <CategoryManager
                categories={categories}
                fetchCategories={() => {}}
              />
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                ✖
              </button>
            </div>
          </div>
        )}

        {/* ✅ 문항 추가 폼 */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">새로운 문항 추가</h2>

          <select
            value={newQuestion.type}
            onChange={(e) =>
              setNewQuestion({ ...newQuestion, type: e.target.value })
            }
            className="w-full p-2 mb-4 border rounded"
          >
            <option value="quantitative">정량 문항</option>
            <option value="qualitative">정성 문항</option>
          </select>

          {newQuestion.type === "quantitative" ? (
            <>
              <input
                type="number"
                placeholder="문항 번호"
                value={newQuestion.question_number}
                onChange={(e) =>
                  setNewQuestion({
                    ...newQuestion,
                    question_number: e.target.value,
                  })
                }
                className="w-full p-2 mb-2 border rounded"
              />
              {/* ✅ 카테고리 선택 드롭다운 */}
              <select
                value={newQuestion.category_id}
                onChange={(e) =>
                  setNewQuestion({
                    ...newQuestion,
                    category_id: e.target.value,
                  })
                }
                className="w-full p-2 mb-2 border rounded"
              >
                <option value="">카테고리 선택</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="문항 내용"
                value={newQuestion.question}
                onChange={(e) =>
                  setNewQuestion({
                    ...newQuestion,
                    question: e.target.value,
                  })
                }
                className="w-full p-2 mb-2 border rounded"
              />
              <TiptapEditor
                value={newQuestion.evaluation_criteria}
                onChange={(content) =>
                  setNewQuestion({
                    ...newQuestion,
                    evaluation_criteria: content,
                  })
                }
              />

              <input
                type="text"
                placeholder="법적 근거"
                value={newQuestion.legal_basis}
                onChange={(e) =>
                  setNewQuestion({
                    ...newQuestion,
                    legal_basis: e.target.value,
                  })
                }
                className="w-full p-2 mb-2 border rounded"
              />
              <input
                type="number"
                placeholder="이행 점수"
                value={newQuestion.score_fulfilled || ""}
                onChange={(e) =>
                  setNewQuestion({
                    ...newQuestion,
                    score_fulfilled: e.target.value,
                  })
                }
                className="w-full p-2 mb-2 border rounded"
              />
              <input
                type="number"
                placeholder="미이행 점수"
                value={newQuestion.score_unfulfilled || ""}
                onChange={(e) =>
                  setNewQuestion({
                    ...newQuestion,
                    score_unfulfilled: e.target.value,
                  })
                }
                className="w-full p-2 mb-2 border rounded"
              />
              <input
                type="number"
                placeholder="자문 필요 점수"
                value={newQuestion.score_consult || ""}
                onChange={(e) =>
                  setNewQuestion({
                    ...newQuestion,
                    score_consult: e.target.value,
                  })
                }
                className="w-full p-2 mb-2 border rounded"
              />
              <input
                type="number"
                placeholder="해당 없음 점수"
                value={newQuestion.score_not_applicable || ""}
                onChange={(e) =>
                  setNewQuestion({
                    ...newQuestion,
                    score_not_applicable: e.target.value,
                  })
                }
                className="w-full p-2 mb-2 border rounded"
              />
            </>
          ) : (
            <>
              <input
                type="number"
                placeholder="문항 번호"
                value={newQuestion.question_number}
                onChange={(e) =>
                  setNewQuestion({
                    ...newQuestion,
                    question_number: e.target.value,
                  })
                }
                className="w-full p-2 mb-2 border rounded"
              />
              <input
                type="text"
                placeholder="지표"
                value={newQuestion.indicator}
                onChange={(e) =>
                  setNewQuestion({
                    ...newQuestion,
                    indicator: e.target.value,
                  })
                }
                className="w-full p-2 mb-2 border rounded"
              />
              <input
                type="text"
                placeholder="지표 정의"
                value={newQuestion.indicator_definition}
                onChange={(e) =>
                  setNewQuestion({
                    ...newQuestion,
                    indicator_definition: e.target.value,
                  })
                }
                className="w-full p-2 mb-2 border rounded"
              />
              <TiptapEditor
                value={newQuestion.evaluation_criteria}
                onChange={(content) =>
                  setNewQuestion({
                    ...newQuestion,
                    evaluation_criteria: content,
                  })
                }
              />

              <input
                type="text"
                placeholder="참고 정보"
                value={newQuestion.reference_info}
                onChange={(e) =>
                  setNewQuestion({
                    ...newQuestion,
                    reference_info: e.target.value,
                  })
                }
                className="w-full p-2 mb-2 border rounded"
              />
              <input
                type="number"
                placeholder="자문 필요 점수"
                value={newQuestion.score_consult || ""}
                onChange={(e) =>
                  setNewQuestion({
                    ...newQuestion,
                    score_consult: e.target.value,
                  })
                }
                className="w-full p-2 mb-2 border rounded"
              />
              <input
                type="number"
                placeholder="해당 없음 점수"
                value={newQuestion.score_not_applicable || ""}
                onChange={(e) =>
                  setNewQuestion({
                    ...newQuestion,
                    score_not_applicable: e.target.value,
                  })
                }
                className="w-full p-2 mb-2 border rounded"
              />
            </>
          )}

          <button onClick={handleAddQuestion} className="w-full btn-add">
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            문항 추가하기
          </button>
        </div>
        {/* ✅ 수정 폼 (선택된 문항이 있을 때만 표시) */}
        {selectedQuestion && (
          <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">문항 수정</h2>
            <input
              type="number"
              placeholder="문항 번호"
              value={editedData.question_number}
              onChange={(e) =>
                setEditedData({
                  ...editedData,
                  question_number: e.target.value,
                })
              }
              className="w-full p-2 mb-2 border rounded"
            />

            {/* ✅ 정량 문항 입력 필드 */}
            {selectedQuestion.type === "quantitative" ? (
              <>
                <input
                  type="text"
                  placeholder="문항 내용"
                  value={editedData.question}
                  onChange={(e) =>
                    setEditedData({ ...editedData, question: e.target.value })
                  }
                  className="w-full p-2 mb-2 border rounded"
                />
                {/* ✅ 기존 카테고리 표시 및 변경 가능하도록 추가 */}
                <label className="text-gray-700 font-semibold">카테고리</label>
                <select
                  value={editedData.category_id}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      category_id: e.target.value,
                    })
                  }
                  className="w-full p-2 mb-2 border rounded"
                >
                  <option value="">카테고리 선택</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <TiptapEditor
                  value={editedData.evaluation_criteria || ""} // ✅ 빈 값 방지
                  onChange={(content) => {
                    console.log("🔥 저장되는 HTML (수정폼):", content); // ✅ 디버깅 로그 추가
                    setEditedData({
                      ...editedData,
                      evaluation_criteria: content,
                    });
                  }}
                />

                <input
                  type="text"
                  placeholder="법적 근거"
                  value={editedData.legal_basis}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      legal_basis: e.target.value,
                    })
                  }
                  className="w-full p-2 mb-2 border rounded"
                />
                <input
                  type="number"
                  placeholder="이행 점수"
                  value={editedData.score_fulfilled || ""}
                  onChange={(e) =>
                    setNewQuestion({
                      ...editedData,
                      score_fulfilled: e.target.value,
                    })
                  }
                  className="w-full p-2 mb-2 border rounded"
                />
                <input
                  type="number"
                  placeholder="미이행 점수"
                  value={editedData.score_unfulfilled || ""}
                  onChange={(e) =>
                    setNewQuestion({
                      ...editedData,
                      score_unfulfilled: e.target.value,
                    })
                  }
                  className="w-full p-2 mb-2 border rounded"
                />
                <input
                  type="number"
                  placeholder="자문 필요 점수"
                  value={editedData.score_consult || ""}
                  onChange={(e) =>
                    setNewQuestion({
                      ...editedData,
                      score_consult: e.target.value,
                    })
                  }
                  className="w-full p-2 mb-2 border rounded"
                />
                <input
                  type="number"
                  placeholder="해당 없음 점수"
                  value={editedData.score_not_applicable || ""}
                  onChange={(e) =>
                    setNewQuestion({
                      ...editedData,
                      score_not_applicable: e.target.value,
                    })
                  }
                  className="w-full p-2 mb-2 border rounded"
                />
              </>
            ) : (
              // ✅ 정성 문항 입력 필드
              <>
                <input
                  type="text"
                  placeholder="지표"
                  value={editedData.indicator}
                  onChange={(e) =>
                    setEditedData({ ...editedData, indicator: e.target.value })
                  }
                  className="w-full p-2 mb-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="지표 정의"
                  value={editedData.indicator_definition}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      indicator_definition: e.target.value,
                    })
                  }
                  className="w-full p-2 mb-2 border rounded"
                />
                <TiptapEditor
                  value={editedData.evaluation_criteria || ""} // ✅ 빈 값 방지
                  onChange={(content) => {
                    console.log("🔥 저장되는 HTML (수정폼):", content); // ✅ 디버깅 로그 추가
                    setEditedData({
                      ...editedData,
                      evaluation_criteria: content,
                    });
                  }}
                />

                <input
                  type="text"
                  placeholder="참고 정보"
                  value={editedData.reference_info}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      reference_info: e.target.value,
                    })
                  }
                  className="w-full p-2 mb-2 border rounded"
                />
                <input
                  type="number"
                  placeholder="자문 필요 점수"
                  value={editedData.score_consult || ""}
                  onChange={(e) =>
                    setNewQuestion({
                      ...editedData,
                      score_consult: e.target.value,
                    })
                  }
                  className="w-full p-2 mb-2 border rounded"
                />
                <input
                  type="number"
                  placeholder="해당 없음 점수"
                  value={editedData.score_not_applicable || ""}
                  onChange={(e) =>
                    setNewQuestion({
                      ...editedData,
                      score_not_applicable: e.target.value,
                    })
                  }
                  className="w-full p-2 mb-2 border rounded"
                />
              </>
            )}

            <button
              onClick={() =>
                handleEditSave(selectedQuestion.id, selectedQuestion.type)
              }
              className="w-full btn-save"
            >
              <FontAwesomeIcon icon={faSave} className="mr-2" />
              수정된 문항 저장
            </button>
          </div>
        )}
        {/* ✅ 문항 리스트 */}
        <h2 className="text-xl font-semibold mt-6 mb-4 text-gray-800">
          정량 문항 목록
        </h2>
        <div className="space-y-4">
          {quantitativeQuestions.map((q) => (
            <div
              key={q.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md border hover:shadow-lg transition"
            >
              {/* 문항 번호 및 내용 */}
              <div className="flex items-center space-x-4">
                <span className="font-semibold text-lg text-gray-700">
                  {q.question_number}.
                </span>
                <span className="text-gray-600">{q.question}</span>
              </div>

              {/* 수정 & 삭제 버튼 */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditStart(q, "quantitative")}
                  className="px-3 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition flex items-center"
                >
                  <FontAwesomeIcon icon={faEdit} className="mr-1" /> 수정
                </button>
                <button
                  onClick={() => handleDeleteQuestion(q.id, "quantitative")}
                  className="px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition flex items-center"
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-1" /> 삭제
                </button>
              </div>
            </div>
          ))}
        </div>
        <h2 className="text-xl font-semibold mt-6 mb-4">정성 문항 목록</h2>
        <div className="space-y-4">
          {qualitativeQuestions.map((q) => (
            <div
              key={q.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md border hover:shadow-lg transition"
            >
              {/* 문항 번호 및 내용 */}
              <div className="flex items-center space-x-4">
                <span className="font-semibold text-lg text-gray-700">
                  {q.question_number}.
                </span>
                <span className="text-gray-600">{q.indicator}</span>
              </div>

              {/* 수정 & 삭제 버튼 */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditStart(q, "qualitative")}
                  className="px-3 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition flex items-center"
                >
                  <FontAwesomeIcon icon={faEdit} className="mr-1" /> 수정
                </button>
                <button
                  onClick={() => handleDeleteQuestion(q.id, "qualitative")}
                  className="px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition flex items-center"
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-1" /> 삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SuperManageQuestions;
