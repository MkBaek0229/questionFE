import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import axios from "axios";

const TiptapEditor = ({ value, onChange }) => {
  // ✅ `useState`는 반드시 컴포넌트 내부에서 호출
  const [editorContent, setEditorContent] = useState(value || "");
  const [csrfToken, setCsrfToken] = useState("");

  // ✅ CSRF 토큰 가져오기 (컴포넌트 내부에서 실행)
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get("http://localhost:3000/csrf-token", {
          withCredentials: true, // ✅ 세션 쿠키 포함
        });
        setCsrfToken(response.data.csrfToken);
      } catch (error) {
        console.error("❌ CSRF 토큰 가져오기 실패:", error);
      }
    };

    fetchCsrfToken();
  }, []);

  // ✅ `editor`는 반드시 `useEffect`보다 먼저 정의
  const editor = useEditor({
    extensions: [StarterKit, Image, Link],
    content: editorContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setEditorContent(html);
      onChange(html);
    },
  });

  // ✅ `editor`가 `null`이 아닐 때만 실행되도록 변경
  useEffect(() => {
    if (editor && editorContent) {
      editor.commands.setContent(editorContent);
    }
  }, [editor, editorContent]);

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  // ✅ 이미지 업로드 핸들러
  const addImage = async () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await axios.post(
          "http://localhost:3000/upload/question-image",
          formData,
          {
            withCredentials: true, // ✅ 세션 쿠키 포함 (CSRF 보호)
            headers: {
              "Content-Type": "multipart/form-data",
              "X-CSRF-Token": csrfToken,
            },
          }
        );

        const url = `http://localhost:3000${response.data.url}`; // ✅ 서버의 응답을 절대 경로로 변환
        console.log("✅ 업로드된 이미지 URL:", url);

        editor.chain().focus().setImage({ src: url }).run();
      } catch (error) {
        console.error("❌ 이미지 업로드 실패:", error);
        alert("이미지 업로드 중 오류가 발생했습니다.");
      }
    };
  };

  return (
    <div className="border p-2 rounded">
      <div className="mb-2 flex space-x-2">
        {/* ✅ 이미지 업로드 버튼 */}
        <button
          onClick={addImage}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          이미지 추가
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;
