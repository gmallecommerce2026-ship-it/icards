// FE/Pages/DynamicPage/Components/Content/DynamicPageContent.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../../services/api';
import SEO from '../../../../Features/SEO';
import '../../../../tiptap-content.css'; 

const DynamicPageContent = () => {
    const { slug } = useParams();
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPage = async () => {
            setLoading(true);
            try {
                // TRẢ LẠI API ENDPOINT ĐÚNG: Không có "/slug/"
                const response = await api.get(`/pages/${slug}`);
                setPage(response.data.data);
            } catch (error) {
                setError("404 - Không tìm thấy trang bạn yêu cầu.");
            } finally {
                setLoading(false);
            }
        };
        fetchPage();
    }, [slug]);

    // ... (Phần còn lại của file giữ nguyên, logic render HTML của bạn đã đúng)
    if (loading) {
        return <div className="container" style={{ padding: '40px 0' }}><p>Đang tải trang...</p></div>;
    }

    if (error) {
        return <div className="container" style={{ padding: '40px 0', textAlign: 'center' }}><h1>{error}</h1></div>;
    }

    if (!page) return null;

    let rawHtml = page.content || '';

    // Fix phòng trường hợp dữ liệu cũ lưu dạng JSON String "...."
    // Nếu chuỗi bắt đầu bằng " và kết thúc bằng " (đôi khi bị stringify 2 lần), hoặc là JSON object string
    if (typeof rawHtml === 'string' && (rawHtml.trim().startsWith('{') || rawHtml.trim().startsWith('"'))) {
         try {
            // Thử parse nếu nó là JSON string (phòng hờ)
            const parsed = JSON.parse(rawHtml);
            // Nếu parse ra mà nó có dạng schema cũ (nếu có), xử lý tiếp, còn không thì dùng chính nó
            if (typeof parsed === 'string') rawHtml = parsed; 
         } catch (e) {
            // Nếu lỗi parse thì cứ để nguyên là string HTML
         }
    }
    
    // Nếu trước đây bạn lỡ lưu mảng object vào DB (từ code cũ), cần xử lý fallback:
    if (Array.isArray(rawHtml)) {
         rawHtml = rawHtml.map(block => block.content).join('');
    }

    return (
        <>
            <SEO title={page.seo?.metaTitle || page.title} description={page.seo?.metaDescription} />
            <main className="dynamic-page-wrapper">
                <div className="container">
                    <header className="dynamic-page-header">
                        <h1>{page.title}</h1>
                        <p className="last-updated">Cập nhật lần cuối: {new Date(page.updatedAt).toLocaleDateString('vi-VN')}</p>
                    </header>
                    
                    {/* Hiển thị nội dung HTML trực tiếp */}
                    <div
                        className="tiptap-content" 
                        dangerouslySetInnerHTML={{ __html: rawHtml }}
                    />
                    
                    <div className="ads-container" style={{ textAlign: 'center', margin: '40px 0' }}>
                        <div className="placeholder-ad">Vị trí đặt quảng cáo (970x250)</div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default DynamicPageContent;