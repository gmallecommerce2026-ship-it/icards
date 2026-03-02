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

    const rawHtml = page.content && Array.isArray(page.content) 
        ? page.content.map(block => block.content).join('') 
        : '';

    return (
        <>
            <SEO title={page.seo?.metaTitle || page.title} description={page.seo?.metaDescription} />
            <main className="dynamic-page-wrapper">
                <div className="container">
                    <header className="dynamic-page-header">
                        <h1>{page.title}</h1>
                        <p className="last-updated">Cập nhật lần cuối: {new Date(page.updatedAt).toLocaleDateString('vi-VN')}</p>
                    </header>
                    
                    <div
                        className="tiptap-content" 
                        dangerouslySetInnerHTML={{ __html: rawHtml }}
                    />
                    
                    <div className="ads-container" style={{ textAlign: 'center', margin: '40px 0' }}>
                        <div className="placeholder-ad">Vị trí đặt quảng cáo (970x250)</div>
                    </div>
                </div>
            </main>
            {/* ... CSS styles giữ nguyên ... */}
        </>
    );
};

export default DynamicPageContent;