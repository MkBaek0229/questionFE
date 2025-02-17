import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import axios from "axios";

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

const TiptapEditor = ({ value, onChange }) => {
  const [editorContent, setEditorContent] = useState(value || "");
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    const fetchCsrfToken = async () => {
      const token = await getCsrfToken();
      setCsrfToken(token);
    };
    fetchCsrfToken();
  }, []);

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(editorContent);
    }
  }, [editorContent]);

  const editor = useEditor({
    extensions: [StarterKit, Image, Link],
    content: editorContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setEditorContent(html);
      onChange(html);
    },
  });

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  // ✅ 이미지 업로드 핸들러 (파일 업로드 방식)
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
          "http://localhost:3000/upload", // ✅ 업로드 API 경로
          formData,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "multipart/form-data",
              "X-CSRF-Token": csrfToken, // ✅ CSRF 토큰 추가
            },
          }
        );

        const url = response.data.url;
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
