// FE/Pages/BlogsDetailPage/Components/Content/BlogDetailsPageContent.js

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../../services/api';
import SEO from '../../../../Features/SEO';
import { gsap } from 'gsap';
import '../../../../tiptap-content.css';
import './BlogDetailsPageContent.css';

const BlogDetailsPageContent = () => {
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Thêm state để quản lý lỗi
    const { slug } = useParams();
    const navigate = useNavigate();

    const pageWrapperRef = useRef(null);
    const cursorRef = useRef(null);

    useEffect(() => {
        const cursor = cursorRef.current;
        if (!cursor) return;
        const moveCursor = (e) => {
            gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1, ease: "power2.out" });
        };
        document.addEventListener('mousemove', moveCursor);
        return () => document.removeEventListener('mousemove', moveCursor);
    }, []);

    useEffect(() => {
        if (!loading && blog) {
            const ctx = gsap.context(() => {
                gsap.from('.blog-detail-title', { duration: 1, y: 50, opacity: 0, ease: 'power3.out' });
                gsap.from('.blog-meta-info span', { duration: 0.8, y: 30, opacity: 0, stagger: 0.2, delay: 0.3, ease: 'power3.out' });
                // Selector này sẽ hoạt động tốt hơn với cấu trúc DOM mới
                gsap.from('.blog-content-body > *', { duration: 0.8, y: 40, opacity: 0, stagger: 0.15, delay: 1, ease: 'power3.out' });
            }, pageWrapperRef);
            return () => ctx.revert();
        }
    }, [loading, blog]);


    useEffect(() => {
        const fetchBlogDetails = async () => {
            setLoading(true);
            setError(null); // Reset lỗi mỗi khi fetch lại
            try {
                const response = await api.get(`/pages/${slug}`);
                setBlog(response.data.data);
            } catch (err) {
                console.error("Lỗi khi tải chi tiết blog:", err);
                setError("Không thể tải được nội dung bài viết. Vui lòng thử lại sau.");
            } finally {
                setTimeout(() => setLoading(false), 500);
            }
        };

        if (slug) {
            fetchBlogDetails();
        }
    }, [slug]);

    const handleGoBack = () => {
        navigate('/page');
    };


    if (loading) {
        return (
            <div className="luxury-blog-wrapper">
                <div className="loading-luxury">
                    <div className="loading-text">Đang tải nội dung...</div>
                </div>
            </div>
        );
    }

    if (error || !blog) {
         return (
            <div className="luxury-blog-wrapper">
                <div className="no-results">
                    <h3>{error || 'Bài viết không tồn tại hoặc có lỗi'}</h3>
                    <p>Đã xảy ra lỗi khi tải dữ liệu. Hãy kiểm tra Console (F12) để xem chi tiết.</p>
                    <button onClick={handleGoBack} className="back-button">Quay lại</button>
                </div>
            </div>
        );
    }
    
    // Nối nội dung của tất cả các block thành một chuỗi HTML duy nhất
    const blogHtmlContent = (blog.content && Array.isArray(blog.content))
        ? blog.content.map(block => block.content).join('')
        : '';

    return (
        <>
            <SEO title={`${blog.title} | iCards Premium`} description={blog.excerpt || ''} />
            <div ref={cursorRef} className="custom-cursor"></div>
            <div className="luxury-blog-detail-wrapper" ref={pageWrapperRef}>
                <button onClick={handleGoBack} className="back-button">← Quay lại</button>
                <article className="blog-detail-container">
                    <header className="blog-detail-header">
                        <h1 className="blog-detail-title">{blog.title}</h1>
                        <div className="blog-meta-info">
                            <span className="meta-author">Tác giả: {blog.author?.name || 'iCards'}</span>
                            <span className="meta-date">Ngày đăng: {new Date(blog.createdAt).toLocaleDateString('vi-VN')}</span>
                            <span className="meta-category">Chuyên mục: {blog.category?.name || 'Chưa phân loại'}</span>
                        </div>
                    </header>

                    {/* --- PHẦN THAY ĐỔI CHÍNH --- */}
                    <div
                        className="tiptap-content"
                        dangerouslySetInnerHTML={{ __html: blogHtmlContent }}
                        style={{color: 'black !important'}}
                    />
                    
                    {/* Hiển thị thông báo nếu không có nội dung */}
                    {!blogHtmlContent && (
                        <p style={{ color: 'yellow', textAlign: 'center' }}>Không có nội dung để hiển thị.</p>
                    )}
                </article>
            </div>
        </>
    );
};

export default BlogDetailsPageContent;