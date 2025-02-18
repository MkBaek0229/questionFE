import React, { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faSave,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

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

function CategoryManager({ categories, fetchCategories, setNewQuestion }) {
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    const fetchCsrfToken = async () => {
      const token = await getCsrfToken();
      setCsrfToken(token);
    };
    fetchCsrfToken();
  }, []);

  // ✅ 새로운 카테고리 추가
  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      alert("카테고리 이름을 입력하세요.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/categories/add",
        { name: newCategory },
        {
          withCredentials: true,
          headers: {
            "X-CSRF-Token": csrfToken, // ✅ CSRF 토큰 추가
          },
        }
      );

      alert("✅ 카테고리 추가 완료!");
      setNewCategory("");
      fetchCategories();
    } catch (error) {
      console.error("❌ 카테고리 추가 실패:", error);
      alert("카테고리 추가 중 오류 발생");
    }
  };

  // ✅ 카테고리 수정 시작
  const handleEditStart = (category) => {
    setEditingCategory(category.id);
    setEditedName(category.name);
  };

  // ✅ 카테고리 수정 완료
  const handleEditSave = async (categoryId) => {
    if (!editedName.trim()) {
      alert("카테고리 이름을 입력하세요.");
      return;
    }

    try {
      await axios.put(`http://localhost:3000/categories/edit/${categoryId}`, {
        name: editedName,
      });
      alert("✅ 카테고리 수정 완료!");
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error("❌ 카테고리 수정 실패:", error);
      alert("카테고리 수정 중 오류 발생");
    }
  };

  // ✅ 카테고리 삭제
  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await axios.delete(
        `http://localhost:3000/categories/delete/${categoryId}`
      );
      alert("✅ 카테고리 삭제 완료!");
      fetchCategories();
    } catch (error) {
      console.error("❌ 카테고리 삭제 실패:", error);
      alert("카테고리 삭제 중 오류 발생");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">카테고리 관리</h2>

      {/* ✅ 새로운 카테고리 추가 */}
      <div className="mb-4 flex">
        <input
          type="text"
          placeholder="새로운 카테고리"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="w-full p-2 border rounded-md"
        />
        <button
          onClick={handleAddCategory}
          className="ml-2 px-4 py-2 bg-green-500 text-white rounded-md"
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>

      {/* ✅ 카테고리 목록 */}
      <ul>
        {categories.map((category) => (
          <li
            key={category.id}
            className="flex justify-between items-center p-2 border-b"
          >
            {editingCategory === category.id ? (
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            ) : (
              <span>{category.name}</span>
            )}

            <div className="flex space-x-2">
              {editingCategory === category.id ? (
                <button
                  onClick={() => handleEditSave(category.id)}
                  className="text-blue-500"
                >
                  <FontAwesomeIcon icon={faSave} />
                </button>
              ) : (
                <button
                  onClick={() => handleEditStart(category)}
                  className="text-blue-500"
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
              )}
              <button
                onClick={() => handleDeleteCategory(category.id)}
                className="text-red-500"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CategoryManager;
