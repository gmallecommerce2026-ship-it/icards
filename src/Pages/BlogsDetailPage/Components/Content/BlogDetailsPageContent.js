// FrontendClient/Pages/BlogsDetailPage/Components/Content/BlogDetailsPageContent.js

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../../../services/api';
import SEO from '../../../../Features/SEO';
import { gsap } from 'gsap';
import { ChevronRight, Hash } from 'lucide-react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../../../../tiptap-content.css';
import './BlogDetailsPageContent.css';

gsap.registerPlugin(ScrollTrigger);

const BlogDetailsPageContent = () => {
    const [blog, setBlog] = useState(null);
    const [latestPosts, setLatestPosts] = useState([]); // ++ MỚI: State cho bài mới nhất
    const [loading, setLoading] = useState(true);
    const [scrollWidth, setScrollWidth] = useState(0);
    const [categories, setCategories] = useState([]);
    const [topics, setTopics] = useState([]);
    const { slug } = useParams();
    const navigate = useNavigate();
    const contentRef = useRef(null);
    let textBlockCount = 0;
    let productIndex = 0;
    // --- 1. Effect: Scroll Progress Bar (Giữ nguyên) ---
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
                // Cấu trúc response mới: { data: pageObject, related: { latestPosts: [] } }
                const pageData = response.data?.data;
                const relatedData = response.data?.related;

                setBlog(pageData);
                if (relatedData?.latestPosts) {
                    setLatestPosts(relatedData.latestPosts);
                }
                
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
    useEffect(() => {
        const fetchSidebarData = async () => {
            try {
                const [catsRes, topicsRes] = await Promise.all([
                    api.get('/public/page-categories'),
                    api.get('/public/topics')
                ]);

                if (catsRes.data?.data) setCategories(catsRes.data.data);
                
                if (topicsRes?.data?.data && Array.isArray(topicsRes.data.data)) {
                    setTopics(topicsRes.data.data.map(t => t.name));
                }
            } catch (error) {
                console.error("Lỗi tải dữ liệu sidebar:", error);
            }
        };
        fetchSidebarData();
    }, []);
    if (loading) return <div className="loading-wrapper">Đang tải nội dung...</div>;
    if (!blog) return <div className="loading-wrapper">Bài viết không tồn tại.</div>;

    //const blogHtmlContent = blog.content || '';
    
    // ++ MỚI: Lấy relatedProducts từ dữ liệu thật
    const relatedProducts = blog.relatedProducts || [];

    return (
        <>
            <SEO title={blog.title} description={blog.seo?.metaDescription || blog.excerpt} />

            <div className="scroll-progress-container">
                <div className="scroll-progress-bar" style={{ width: `${scrollWidth}%` }}></div>
            </div>

            <div className="luxury-blog-detail-wrapper">
                <div onClick={() => navigate(-1)} className="nav-back">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Quay lại
                </div>

                <div className="blog-layout">
                    {/* --- CỘT TRÁI (Giữ nguyên) --- */}
                    <article className="main-content" ref={contentRef}>
                        <header className="blog-header blog-animate">
                            <span className="blog-category-badge">{blog.category?.name || 'Blog'}</span>
                            <h1 className="blog-title">{blog.title}</h1>
                            <div className="author-meta">
                                <img src={blog.author?.avatar || "https://ui-avatars.com/api/?name=Admin"} alt="Author" className="author-avatar" />
                                <div className="author-info">
                                    <h4>{blog.author?.name || 'Ban biên tập'}</h4>
                                    <span>{new Date(blog.createdAt).toLocaleDateString('vi-VN')}</span>
                                </div>
                            </div>
                        </header>

                        {blog.thumbnail && (
                            <div className="blog-thumbnail blog-animate" style={{marginBottom: '2rem', borderRadius: '8px', overflow: 'hidden'}}>
                                <img src={blog.thumbnail} alt={blog.title} style={{width:'100%', display:'block'}} />
                            </div>
                        )}

                        <div className="blog-content-body blog-animate ck-content">
    {Array.isArray(blog.content) ? (
        blog.content.map((block, index) => {
            let injectedProduct = null;

            // Nếu là block text, tăng biến đếm
            if (block.type === 'text') {
                textBlockCount++;
                
                // Cứ sau mỗi 2 block text, chèn 1 sản phẩm (nếu còn sản phẩm trong mảng)
                if (textBlockCount % 2 === 0 && productIndex < relatedProducts.length) {
                    const prod = relatedProducts[productIndex];
                    injectedProduct = (
                        <div className="inline-product-banner" key={`inline-prod-${prod._id}`}>
                            <Link to={`/product/${prod._id}`} className="inline-product-link">
                                <img 
                                    src={prod.imgSrc || (prod.images && prod.images[0]) || "https://placehold.co/150"} 
                                    alt={prod.title} 
                                    className="inline-product-img" 
                                />
                                <div className="inline-product-details">
                                    <span className="inline-product-badge">Gợi ý cho bạn</span>
                                    <h4 className="inline-product-title">{prod.title}</h4>
                                    <div className="inline-product-price">{prod.price?.toLocaleString('vi-VN')}đ</div>
                                    <span className="inline-product-btn">Xem chi tiết</span>
                                </div>
                            </Link>
                        </div>
                    );
                    productIndex++; // Chuyển sang sản phẩm tiếp theo cho lần chèn sau
                }
            }

            return (
                <React.Fragment key={block._id || index}>
                    {/* Render nội dung bài viết */}
                    {block.type === 'text' && (
                        <div dangerouslySetInnerHTML={{ __html: block.content }} />
                    )}
                    {block.type === 'image' && (
                        <img 
                            src={block.content} 
                            alt={block.alt || "blog-image"} 
                            style={{ maxWidth: '100%', borderRadius: '8px', margin: '1.5rem 0' }}
                        />
                    )}
                    
                    {/* Render sản phẩm xen kẽ (nếu có ở vị trí này) */}
                    {injectedProduct}
                </React.Fragment>
            );
        })
    ) : (
        typeof blog.content === 'string' ? (
            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        ) : null
    )}
</div>
                    </article>

                    {/* --- CỘT PHẢI: SIDEBAR --- */}
                    <aside className="sidebar-wrapper">
                        <div className="sidebar-sticky">
                            
                            {/* Widget 1: Sản phẩm liên quan (REAL DATA) */}
                            {relatedProducts.length > 0 && (
                                <div className="widget-box blog-animate">
                                    <div className="widget-title" style={{ color: '#2563eb' }}>Sản phẩm gợi ý</div>
                                    <div className="products-list">
                                        {relatedProducts.map(prod => (
                                            // [FIX 1]: Route trong App.js là /product/:productId (số ít), không phải /products/
                                            // [FIX 2]: Ưu tiên dùng _id nếu không có slug sản phẩm
                                            <Link 
                                                to={`/product/${prod._id}`} 
                                                key={prod._id} 
                                                className="mini-product-card"
                                            >
                                                <img 
                                                    // [FIX 3]: Logic lấy ảnh từ Product Model
                                                    // Model có: images (array string) và imgSrc (string)
                                                    // Frontend cũ dùng: images?.[0]?.url (sai cấu trúc)
                                                    src={prod.imgSrc || (prod.images && prod.images[0]) || "https://placehold.co/100"} 
                                                    
                                                    // [FIX 4]: Dùng prod.title thay vì prod.name
                                                    alt={prod.title} 
                                                    className="mini-product-img" 
                                                />
                                                <div className="mini-product-info">
                                                    {/* [FIX 4]: Dùng prod.title */}
                                                    <h5>{prod.title}</h5>
                                                    <div className="price-tag">
                                                        {prod.price?.toLocaleString('vi-VN')}đ
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Widget 2: Bài viết mới nhất (REAL DATA) */}
                            {latestPosts.length > 0 && (
                                <div className="widget-box blog-animate">
                                    <div className="widget-title">Bài viết mới nhất</div>
                                    <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                                        {latestPosts.map(post => (
                                            <li key={post._id} style={{marginBottom: '1rem', fontSize: '0.9rem'}}>
                                                <Link 
                                                    // [FIX]: Sửa từ /blog/ thành /page/ để khớp với App.js
                                                    to={`/page/${post.slug}`} 
                                                    style={{textDecoration: 'none', color: '#374151', fontWeight: '500', display:'block', marginBottom: '4px'}}
                                                >
                                                    {post.title}
                                                </Link>
                                                <span style={{fontSize: '0.75rem', color: '#9ca3af'}}>
                                                    {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {categories.length > 0 && (
                                <div className="widget-box blog-animate">
                                    <div className="widget-title">Danh mục</div>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                        {categories.map((cat) => (
                                            <li key={cat._id} style={{ marginBottom: '0.5rem', borderBottom: '1px dashed #e5e7eb', paddingBottom: '0.5rem' }}>
                                                {/* Chú ý: Cần xử lý navigate về trang danh sách blog và truyền state category */}
                                                <div 
                                                    onClick={() => navigate('/blogs', { state: { categoryId: cat._id } })}
                                                    style={{ 
                                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                        cursor: 'pointer', color: '#374151', fontSize: '0.9rem', transition: 'color 0.2s'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.color = '#2563eb'}
                                                    onMouseOut={(e) => e.currentTarget.style.color = '#374151'}
                                                >
                                                    <span>{cat.name}</span>
                                                    <ChevronRight size={14} color="#9ca3af" />
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* [+] MỚI - Widget 4: Chủ đề (Tags/Topics) */}
                            {topics.length > 0 && (
                                <div className="widget-box blog-animate">
                                    <div className="widget-title">Chủ đề nổi bật</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                                        {topics.map((topic, idx) => (
                                            <span 
                                                key={idx} 
                                                onClick={() => navigate('/blogs', { state: { search: topic } })}
                                                style={{
                                                    background: '#f3f4f6', color: '#374151', padding: '6px 12px',
                                                    borderRadius: '999px', fontSize: '0.8rem', cursor: 'pointer',
                                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                    border: '1px solid #e5e7eb', transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#2563eb'; }}
                                                onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151'; }}
                                            >
                                                <Hash size={12} /> {topic}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
};

export default BlogDetailsPageContent;