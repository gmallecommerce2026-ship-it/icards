// FE/Pages/BlogsDetailPage/Components/Content/BlogDetailsPageContent.js

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../../../services/api';
import SEO from '../../../../Features/SEO';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger'; // Nếu project có ScrollTrigger
import '../../../../tiptap-content.css';
import './BlogDetailsPageContent.css';

// Đăng ký plugin nếu có dùng
gsap.registerPlugin(ScrollTrigger);

const BlogDetailsPageContent = () => {
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scrollWidth, setScrollWidth] = useState(0);
    const { slug } = useParams();
    const navigate = useNavigate();
    const contentRef = useRef(null);

    // --- 1. Effect: Scroll Progress Bar ---
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (scrollTop / docHeight) * 100;
            setScrollWidth(scrolled);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // --- 2. Fetch Data ---
    useEffect(() => {
        const fetchBlogDetails = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/pages/${slug}`);
                // Xử lý linh hoạt data trả về
                const data = response.data?.data || response.data;
                setBlog(data);
                
                // Animation nhẹ khi load xong content
                setTimeout(() => {
                    gsap.fromTo(".blog-animate", 
                        { y: 20, opacity: 0 }, 
                        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 }
                    );
                }, 100);

            } catch (err) {
                console.error("Lỗi tải bài viết:", err);
            } finally {
                setLoading(false);
            }
        };
        if (slug) fetchBlogDetails();
    }, [slug]);

    // --- Widget Sản phẩm liên quan (Giả lập nếu API chưa có field này) ---
    // Logic: Nếu API trả về relatedProducts thì dùng, không thì dùng mock data
    const relatedProducts = blog?.relatedProducts?.length 
        ? blog.relatedProducts 
        : [
            // Mock data phòng hờ để bạn thấy giao diện lên đẹp thế nào
            { id: 1, name: "Set quà tặng doanh nghiệp cao cấp", price: 1250000, img: "https://picsum.photos/200" },
            { id: 2, name: "Bút ký tên mạ vàng 24K", price: 890000, img: "https://picsum.photos/201" },
            { id: 3, name: "Sổ tay da thật Handmade", price: 450000, img: "https://picsum.photos/202" }
        ];

    // --- Render ---
    if (loading) return <div className="loading-wrapper">Đang tải nội dung...</div>;
    if (!blog) return <div className="loading-wrapper">Bài viết không tồn tại.</div>;

    const blogHtmlContent = blog.content || '';

    return (
        <>
            <SEO title={blog.title} description={blog.excerpt} />

            {/* Scroll Progress Bar */}
            <div className="scroll-progress-container">
                <div className="scroll-progress-bar" style={{ width: `${scrollWidth}%` }}></div>
            </div>

            <div className="luxury-blog-detail-wrapper">
                
                {/* Breadcrumb / Back Button */}
                <div onClick={() => navigate(-1)} className="nav-back">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Quay lại
                </div>

                <div className="blog-layout">
                    {/* --- CỘT TRÁI: NỘI DUNG CHÍNH (8 phần) --- */}
                    <article className="main-content" ref={contentRef}>
                        
                        <header className="blog-header blog-animate">
                            <span className="blog-category-badge">
                                {blog.category?.name || 'Kiến thức'}
                            </span>
                            <h1 className="blog-title">{blog.title}</h1>
                            
                            <div className="author-meta">
                                <img 
                                    src={blog.author?.avatar || "https://ui-avatars.com/api/?name=Admin"} 
                                    alt="Author" 
                                    className="author-avatar" 
                                />
                                <div className="author-info">
                                    <h4>{blog.author?.name || 'Ban biên tập'}</h4>
                                    <span>{new Date(blog.createdAt).toLocaleDateString('vi-VN')} • 5 phút đọc</span>
                                </div>
                            </div>
                        </header>

                        {/* Featured Image */}
                        {blog.thumbnail && (
                            <div className="blog-thumbnail blog-animate" style={{marginBottom: '2rem', borderRadius: '8px', overflow: 'hidden'}}>
                                <img src={blog.thumbnail} alt={blog.title} style={{width:'100%', display:'block'}} />
                            </div>
                        )}

                        {/* Content Body - Render HTML */}
                        <div 
                            className="blog-content-body blog-animate ck-content"
                            dangerouslySetInnerHTML={{ __html: blogHtmlContent }}
                        />

                        {/* Tags */}
                        <div className="blog-tags" style={{marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid #eee'}}>
                             <strong style={{fontSize: '0.9rem', marginRight: '10px'}}>Tags:</strong>
                             {['Review', 'Xu hướng', '2026'].map((tag, i) => (
                                 <span key={i} style={{background: '#f3f4f6', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', marginRight: '8px', color: '#555'}}>#{tag}</span>
                             ))}
                        </div>
                    </article>

                    {/* --- CỘT PHẢI: SIDEBAR (4 phần) --- */}
                    <aside className="sidebar-wrapper">
                        <div className="sidebar-sticky">
                            
                            {/* Widget 1: Sản phẩm liên quan (QUAN TRỌNG ĐỂ BÁN HÀNG) */}
                            <div className="widget-box blog-animate">
                                <div className="widget-title" style={{ color: '#2563eb' }}>Sản phẩm trong bài</div>
                                <div className="products-list">
                                    {relatedProducts.map(prod => (
                                        <Link to={`/products/${prod.id}`} key={prod.id} className="mini-product-card">
                                            <img src={prod.img || prod.images?.[0]?.url} alt={prod.name} className="mini-product-img" />
                                            <div className="mini-product-info">
                                                <h5>{prod.name}</h5>
                                                <div className="price-tag">
                                                    {prod.price.toLocaleString('vi-VN')}đ
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Widget 2: Mục lục hoặc Bài viết mới */}
                            <div className="widget-box blog-animate">
                                <div className="widget-title">Bài viết mới nhất</div>
                                <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                                    {[1, 2, 3].map(i => (
                                        <li key={i} style={{marginBottom: '1rem', fontSize: '0.9rem'}}>
                                            <Link to="#" style={{textDecoration: 'none', color: '#374151', fontWeight: '500', display:'block', marginBottom: '4px'}}>
                                                Top 10 xu hướng quà tặng doanh nghiệp 2026
                                            </Link>
                                            <span style={{fontSize: '0.75rem', color: '#9ca3af'}}>12 Tháng 2, 2026</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
};

export default BlogDetailsPageContent;