import React, { useState } from 'react';
import { fal } from "@fal-ai/client"; // <--- ĐÃ SỬA IMPORT
import './GenAIPage.css';
import { Link } from 'react-router-dom';

// Lưu ý: Key chỉ dùng để test. Production phải giấu key này đi.
fal.config({
  credentials: 'b7a8645d-ae4d-4d9f-a066-0f2023022433:d1e82541ee4bf2f0cb3f45d8e54576f2', 
});

const GenAIPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prompt, setPrompt] = useState("A portrait of a person wearing traditional Vietnamese Ao Dai with gold embroidery, standing in an ancient temple in Hanoi during Tet holiday, yellow apricot blossoms, cinematic lighting, 8k, highly detailed, photorealistic");
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [error, setError] = useState(null);

  // Xử lý khi chọn ảnh
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setResultImage(null);
    }
  };

  const generateImage = async () => {
    if (!selectedFile) {
      alert("Vui lòng chọn ảnh khuôn mặt!");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // 1. Upload ảnh lên Fal storage
      const storageUrl = await fal.storage.upload(selectedFile);

      // 2. Gọi model Instant Character (ID chính xác trên Fal.ai)
      // Thay đổi ID thành: 'fal-ai/instant-character'
      const result = await fal.subscribe("fal-ai/instant-character", {
        input: {
          // Lưu ý: Model này dùng key 'image_url' (không phải face_image_url)
          image_url: storageUrl, 
          prompt: prompt,
          // Negative prompt giúp loại bỏ lỗi
          negative_prompt: "text, watermark, low quality, deformed, ugly, bad anatomy, disfigured",
          // Strength: Độ mạnh của việc giữ nét mặt (0.0 - 1.0)
          strength: 0.8 
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            console.log("Đang xử lý...", update.logs);
          }
        },
      });

      // 3. Nhận kết quả
      console.log("📌 Fal.ai Raw Response:", result); // <--- Bước quan trọng nhất: Mở Console F12 để xem cấu trúc thật

      // Defensive Coding: Check nhiều trường hợp cấu trúc có thể xảy ra
      let generatedUrl = null;

      if (result) {
        if (result.images && result.images[0]?.url) {
          // Trường hợp chuẩn theo JSON bạn cung cấp
          generatedUrl = result.images[0].url;
        } else if (result.data && result.data.images && result.data.images[0]?.url) {
          // Trường hợp bị bọc trong 'data'
          generatedUrl = result.data.images[0].url;
        } else if (result.image && result.image.url) {
           // Một số model trả về object đơn 'image' thay vì mảng
           generatedUrl = result.image.url;
        }
      }

      if (generatedUrl) {
        console.log("✅ Lấy được ảnh:", generatedUrl);
        setResultImage(generatedUrl);
      } else {
        console.error("❌ Không tìm thấy URL ảnh trong response:", result);
        setError("API thành công nhưng không tìm thấy ảnh. Vui lòng kiểm tra Console (F12).");
      }

    } catch (err) {
      console.error("Lỗi:", err);
      const errorMsg = err.body?.detail || err.message || "Có lỗi xảy ra.";
      setError(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="gen-ai-container">
      <div className="gen-ai-header">
        <h1>Zero-shot Face Customization (InstantID)</h1>
        <p>Demo tích hợp AI tạo sinh: Giữ khuôn mặt, thay đổi phong cách.</p>
        <Link to="/" className="back-link">← Quay lại trang chủ</Link>
      </div>

      <div className="gen-ai-content">
        {/* Cột trái: Input */}
        <div className="input-section">
          <div className="form-group">
            <label>1. Upload ảnh khuôn mặt (Rõ nét)</label>
            <div className="upload-box">
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {previewUrl && (
                <div className="image-preview">
                  <img src={previewUrl} alt="Preview" />
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>2. Nhập mô tả (Prompt - Tiếng Anh)</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows="4"
              placeholder="Describe the image you want..."
            />
          </div>

          <button 
            className="generate-btn" 
            onClick={generateImage}
            disabled={isGenerating || !selectedFile}
          >
            {isGenerating ? "Đang xử lý AI..." : "Tạo ảnh ngay (Generate)"}
          </button>

          {error && <div className="error-msg">{error}</div>}
        </div>

        {/* Cột phải: Output */}
        <div className="output-section">
          <label>Kết quả:</label>
          <div className="result-box">
            {isGenerating ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Đang vẽ lại khuôn mặt của bạn...</p>
                <p className="sub-text">(Mất khoảng 10-20 giây)</p>
              </div>
            ) : resultImage ? (
              <div className="result-image">
                <img src={resultImage} alt="AI Generated" />
                <a href={resultImage} target="_blank" rel="noreferrer" className="download-btn">
                  Tải ảnh về
                </a>
              </div>
            ) : (
              <div className="placeholder-text">
                Kết quả sẽ hiển thị tại đây
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenAIPage;