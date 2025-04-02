import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import axiosInstance from "../../../axiosInstance";

const TiptapEditor = ({ value, onChange }) => {
  // ✅ `useState`는 반드시 컴포넌트 내부에서 호출
  const [editorContent, setEditorContent] = useState(value || "");
  const [csrfToken, setCsrfToken] = useState("");

  // ✅ CSRF 토큰 가져오기 (컴포넌트 내부에서 실행)
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await axiosInstance.get(
          "http://localhost:3000/csrf-token",
          {
            withCredentials: true, // ✅ 세션 쿠키 포함
          }
        );
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
      if (!input.files || !input.files[0]) return;

      const formData = new FormData();
      formData.append("file", input.files[0]); // 여기를 확인해주세요!

      try {
        const response = await axiosInstance.post(
          "http://localhost:3000/upload/image",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "X-CSRF-Token": csrfToken,
            },
            withCredentials: true, // ✅ 세션 쿠키 포함 (CSRF 보호)
          }
        );

        // 응답에서 이미지 URL 추출
        const imageUrl = response.data.file.path;
        // URL이 상대 경로인 경우 서버 주소 추가
        const fullUrl = imageUrl.startsWith("http")
          ? imageUrl
          : `http://localhost:3000/${imageUrl}`;

        editor.chain().focus().setImage({ src: fullUrl }).run();
      } catch (error) {
        console.error("이미지 업로드 실패:", error);
        alert("이미지 업로드에 실패했습니다.");
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
