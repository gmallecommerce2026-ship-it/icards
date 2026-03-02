import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'; // Thêm useRef
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../../../services/api';
import { showErrorToast } from '../../../../Utils/toastHelper';

// --- THÊM GSAP ---
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
// --------------------

// Helper component để render card bài viết (tránh lặp code)
const ArticleCard = ({ blog, className, onClick, getFeaturedImage }) => (
    <article className={`ics-featured-card-new ${className}`} onClick={onClick}>
        <div className="ics-featured-image-new">
            <img src={getFeaturedImage(blog.content)} alt={blog.title} />
        </div>
        <div className="ics-featured-content-new">
            <span className="ics-featured-date-new">{new Date(blog.createdAt).toLocaleDateString('vi-VN')}</span>
            <h3 className="ics-featured-title-new">{blog.title}</h3>
        </div>
    </article>
);


const BlogsPageContent = () => {
    // State management
    const [blogs, setBlogs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filteredBlogs, setFilteredBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const searchQuery = '';
    const selectedTag = '';
    const [selectedCategory, setSelectedCategory] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const POSTS_PER_PAGE = 9;
    const navigate = useNavigate();

    // --- THÊM REF VÀ STATE CHO CAROUSEL DRAG ---
    const carouselRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startScrollLeft, setStartScrollLeft] = useState(0);
    // ------------------------------------------

    // --- ĐĂNG KÝ PLUGIN GSAP ---
    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
    }, []);
    // ----------------------------

    // Fetch real data from API
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [blogsRes, categoriesRes/*, topicsRes*/] = await Promise.all([
                    api.get('/pages?isBlog=true&isPublished=true&limit=1000'),
                    api.get('/public/page-categories'),
                    api.get('/public/topics')
                ]);
                setBlogs(blogsRes.data.data || []);
                setCategories(categoriesRes.data.data || []);

            } catch (error) {
                console.error("Error fetching blog data:", error);
                showErrorToast("Không thể tải dữ liệu blog. Vui lòng thử lại.");
                setBlogs([]);
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filtering logic
    useEffect(() => {
        let result = blogs;
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            result = result.filter(blog =>
                blog.title.toLowerCase().includes(query) ||
                blog.content?.some(block => block.type === 'text' && block.content?.toLowerCase().includes(query))
            );
        }
        if (selectedCategory) {
            result = result.filter(blog => blog.category?._id === selectedCategory);
        }
        if (selectedTag) {
            result = result.filter(blog => Array.isArray(blog.topics) && blog.topics.some(t => t.slug === selectedTag));
        }
        setFilteredBlogs(result);
        setCurrentPage(1);
    }, [searchQuery, selectedCategory, selectedTag, blogs]);

    // --- THÊM HIỆU ỨNG GSAP ---
    useEffect(() => {
        if (loading) return; // Chỉ chạy khi đã tải xong

        // Dùng gsap.context để dọn dẹp animation
        const ctx = gsap.context(() => {
            // 1. Animation cho Carousel Tin Mới Nhất
            gsap.from(".ics-carousel-card", {
                opacity: 0,
                x: 50,
                duration: 0.5,
                stagger: 0.1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: ".ics-latest-carousel",
                    start: "top 80%", // Bắt đầu khi trigger cách top 80%
                }
            });

            // 2. Animation cho Grid Nổi Bật
            gsap.from(".ics-featured-card-new", {
                opacity: 0,
                scale: 0.95,
                y: 30,
                duration: 0.6,
                stagger: 0.15,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: ".ics-featured-grid-new",
                    start: "top 80%",
                }
            });

            // 3. Animation cho Card Bài Viết Thường (Quan trọng)
            // Cần refresh ScrollTrigger khi filteredBlogs thay đổi
            ScrollTrigger.refresh();
            gsap.from(".ics-card", {
                opacity: 0,
                y: 40,
                duration: 0.5,
                stagger: 0.1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: ".ics-grid",
                    start: "top 85%", // Bắt đầu khi grid cách top 85%
                }
            });

            // 4. Animation cho Sidebar
            gsap.from(".ics-sidebar-widget", {
                opacity: 0,
                x: 30,
                duration: 0.6,
                stagger: 0.2,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: ".ics-sidebar",
                    start: "top 70%",
                }
            });
        });

        // Hàm dọn dẹp
        return () => ctx.revert();

    }, [loading, filteredBlogs]); // Chạy lại khi loading hoặc filteredBlogs thay đổi
    // ----------------------------


    // Memoized values
    const featuredBlogs = useMemo(() => filteredBlogs.filter(b => b.isFeatured), [filteredBlogs]);
    const regularBlogs = useMemo(() => filteredBlogs.filter(b => !b.isFeatured), [filteredBlogs]);
    
    const latestBlogs = useMemo(() =>
        [...blogs]
            .filter(b => b.isBlog)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
    , [blogs]);

    const [feat1, feat2, feat3, feat4] = useMemo(() => featuredBlogs.slice(0, 4), [featuredBlogs]);

    const paginatedBlogs = useMemo(() => regularBlogs.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE), [regularBlogs, currentPage]);
    const totalPages = useMemo(() => Math.ceil(regularBlogs.length / POSTS_PER_PAGE), [regularBlogs]);

    // Utility functions
    const getFeaturedImage = useCallback((content) => {
        if (!content || !Array.isArray(content)) {
            return 'https://imagedelivery.net/mYCNH6-2h27PJijuhYd-fw/32c7501a-ed3b-4466-876b-48bcfb13d600/public';
        }
        const imageBlock = content.find(block => block.type === 'image' && block.content);
        return imageBlock?.content || 'https://imagedelivery.net/mYCNH6-2h27PJijuhYd-fw/32c7501a-ed3b-4466-876b-48bcfb13d600/public';
    }, []);


    const getExcerpt = useCallback((content) => {
        if (!content || !Array.isArray(content)) {
            return '<p>Khám phá nội dung độc quyền...</p>';
        }
        const textBlock = content.find(block => block.type === 'text' && block.content);
        if (textBlock?.content && typeof textBlock.content === 'string') {
            const paragraphMatch = textBlock.content.match(/<p>(.*?)<\/p>/i);
            if (paragraphMatch && paragraphMatch[1]) {
                 const innerText = paragraphMatch[1].replace(/<[^>]+>/g, ''); // Loại bỏ tag HTML bên trong
                const limitedText = innerText.substring(0, 100) + (innerText.length > 100 ? '...' : ''); // Rút gọn còn 100 ký tự
                return `<p>${limitedText}</p>`;
            } else {
                 const plainText = textBlock.content.replace(/<[^>]+>/g, '');
                const limitedText = plainText.substring(0, 100) + (plainText.length > 100 ? '...' : '');
                return `<p>${limitedText}</p>`;
            }
        }
        return '<p>Khám phá nội dung độc quyền...</p>';
    }, []);


    // Navigate to blog detail page
    const handleViewDetail = (slug) => {
        navigate(`/page/${slug}`);
    };

    // --- CÁC HÀM XỬ LÝ DRAG CAROUSEL ---
    const handleMouseDown = (e) => {
        if (!carouselRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - carouselRef.current.offsetLeft);
        setStartScrollLeft(carouselRef.current.scrollLeft);
        carouselRef.current.style.cursor = 'grabbing'; // Đổi cursor khi nhấn
    };

    const handleMouseLeave = () => {
        if (!isDragging) return;
        setIsDragging(false);
        if (carouselRef.current) {
            carouselRef.current.style.cursor = 'grab'; // Trả lại cursor khi thả
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        if (carouselRef.current) {
            carouselRef.current.style.cursor = 'grab'; // Trả lại cursor khi thả
        }
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !carouselRef.current) return;
        e.preventDefault();
        const x = e.pageX - carouselRef.current.offsetLeft;
        const walk = (x - startX) * 2; // Tăng tốc độ kéo (nhân 2)
        carouselRef.current.scrollLeft = startScrollLeft - walk;
    };
    // ------------------------------------

    if (loading) {
        return (
            <div className="ics-loading">
                <div className="ics-spinner"></div>
                <p>Đang tải...</p>
            </div>
        );
    }

    // Static list for "Danh mục sản phẩm" based on image
    const productCategories = [
        { name: 'Thiệp hiện đại', tag: 'Nổi bật' },
        { name: 'Thiệp ép kim', tag: 'Nổi bật' },
        { name: 'Thiệp acrylic' },
        { name: 'Thiệp hình cưới' },
        { name: 'Thiệp kỷ niệm', tag: 'Nổi bật' },
        { name: 'Thiệp laser' },
        { name: 'Thiệp nổi bật' },
    ];
    
    return (
        <div className="ics-blogs">
            <div className="ics-container">
                <div className="ics-layout-wrapper">
                    
                    <main className="ics-main-content">

                        {latestBlogs.length > 0 && (
                            <section className="ics-latest-carousel">
                                <h2 className="ics-section-title" style={{ border: 'none', marginBottom: 'var(--space-lg)' }}>
                                    Tin mới nhất
                                </h2>
                                {/* --- THÊM REF VÀ CÁC SỰ KIỆN CHUỘT --- */}
                                <div 
                                    className="ics-carousel-wrapper"
                                    ref={carouselRef}
                                    onMouseDown={handleMouseDown}
                                    onMouseLeave={handleMouseLeave}
                                    onMouseUp={handleMouseUp}
                                    onMouseMove={handleMouseMove}
                                >
                                {/* ----------------------------------- */}
                                    {latestBlogs.map(blog => (
                                        <article key={blog._id} className="ics-carousel-card" onClick={() => handleViewDetail(blog.slug)}>
                                            <div className="ics-carousel-image">
                                                <img src={getFeaturedImage(blog.content)} alt={blog.title} />
                                                <div className="ics-carousel-overlay"></div>
                                            </div>
                                            <div className="ics-carousel-content">
                                                <span className="ics-carousel-date">{new Date(blog.createdAt).toLocaleDateString('vi-VN')}</span>
                                                <h4 className="ics-carousel-title">{blog.title}</h4>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </section>
                        )}


                        {filteredBlogs.length > 0 ? (
                            <>
                                {featuredBlogs.length > 0 && !selectedCategory && !selectedTag && !searchQuery && currentPage === 1 && (
                                    <section className="ics-featured">
                                        <h2 className="ics-section-title" style={{ border: 'none', marginBottom: 'var(--space-lg)' }}>
                                            Nổi bật
                                        </h2>
                                        <div className="ics-featured-grid-new">
                                            {feat1 && <ArticleCard blog={feat1} className="ics-featured-large" onClick={() => handleViewDetail(feat1.slug)} getFeaturedImage={getFeaturedImage} />}
                                            {feat2 && <ArticleCard blog={feat2} className="ics-featured-medium" onClick={() => handleViewDetail(feat2.slug)} getFeaturedImage={getFeaturedImage} />}
                                            <div className="ics-featured-right-stack">
                                                {feat3 && <ArticleCard blog={feat3} className="ics-featured-small" onClick={() => handleViewDetail(feat3.slug)} getFeaturedImage={getFeaturedImage} />}
                                                {feat4 && <ArticleCard blog={feat4} className="ics-featured-small" onClick={() => handleViewDetail(feat4.slug)} getFeaturedImage={getFeaturedImage} />}
                                            </div>
                                        </div>
                                    </section>
                                )}

                                <section className="ics-regular">
                                    <h2 className="ics-section-title" style={{ border: 'none' }}>
                                        {/* Hidden title */}
                                    </h2>
                                    <div className="ics-grid">
                                        {paginatedBlogs.map(blog => (
                                            blog.isBlog ?
                                                // --- CẬP NHẬT JSX CHO .ICS-CARD ---
                                                <article key={blog._id} className="ics-card" onClick={() => handleViewDetail(blog.slug)}>
                                                    {/* Hình ảnh làm nền */}
                                                    <img 
                                                        src={getFeaturedImage(blog.content)} 
                                                        alt={blog.title} 
                                                        className="ics-card-bg-image" 
                                                    />
                                                    {/* Lớp phủ gradient */}
                                                    <div className="ics-card-overlay-gradient"></div>
                                                    
                                                    {/* Nội dung đè lên */}
                                                    <div className="ics-card-content">
                                                        <span className="ics-card-date-new">{new Date(blog.createdAt).toLocaleDateString('vi-VN')}</span>
                                                        <h3 className="ics-card-title">{blog.title}</h3>
                                                        <div
                                                            className="ics-card-excerpt"
                                                            dangerouslySetInnerHTML={{ __html: getExcerpt(blog.content) }}
                                                        />
                                                    </div>
                                                </article>
                                                // --- KẾT THÚC CẬP NHẬT ---
                                            : null
                                        ))}
                                    </div>

                                    {totalPages > 1 && (
                                        <div className="ics-pagination">
                                            <button
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                                className="ics-page-btn"
                                                aria-label="Trang trước"
                                            >
                                                <ChevronLeft size={20} />
                                            </button>
                                            <span className="ics-page-indicator">
                                                Trang {currentPage} / {totalPages}
                                            </span>
                                            <button
                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                disabled={currentPage === totalPages}
                                                className="ics-page-btn"
                                                aria-label="Trang sau"
                                            >
                                                <ChevronRight size={20} />
                                            </button>
                                        </div>
                                    )}
                                </section>
                            </>
                        ) : (
                            <div className="ics-empty">
                                <div className="ics-empty-icon">🔍</div>
                                <h3>Không tìm thấy bài viết</h3>
                                <p>Thử điều chỉnh bộ lọc hoặc tìm kiếm khác nhé!</p>
                            </div>
                        )}
                    </main>

                    <aside className="ics-sidebar">
                        <div className="ics-sidebar-widget">
                            <h3>Danh mục tin tức</h3>
                            <ul className="ics-sidebar-list">
                                <li className="ics-sidebar-item">
                                    <button
                                        onClick={() => setSelectedCategory('')}
                                        className={`ics-sidebar-link ${!selectedCategory ? 'ics-sidebar-link--active' : ''}`}
                                    >
                                        Tất cả
                                    </button>
                                </li>
                                {categories.map(cat => (
                                    <li key={cat._id} className="ics-sidebar-item">
                                        <button
                                            onClick={() => setSelectedCategory(cat._id)}
                                            className={`ics-sidebar-link ${selectedCategory === cat._id ? 'ics-sidebar-link--active' : ''}`}
                                        >
                                            {cat.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        <div className="ics-sidebar-widget">
                            <h3>Danh mục sản phẩm</h3>
                            <ul className="ics-sidebar-list">
                                {productCategories.map(item => (
                                    <li key={item.name} className="ics-sidebar-item">
                                        <button type="button" className="ics-sidebar-link">
                                            {item.name}
                                            {item.tag && <span className="ics-sidebar-tag">{item.tag}</span>}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>

                </div>
            </div>
             {/* --- CẬP NHẬT CSS TRONG STYLE TAG ---
                - Thêm cursor 'grab'/'grabbing' cho .ics-carousel-wrapper
                - Sửa .ics-card và các class con để khớp với UI mới
                - Thêm class mới: .ics-card-bg-image, .ics-card-overlay-gradient, .ics-card-date-new
             */}
            <style>{`
                 /* === CSS Custom Properties === */
                :root {
                    --font-display: 'Be Vietnam Pro', 'Inter', sans-serif;
                    --font-body: 'Be Vietnam Pro', 'Inter', sans-serif;
                    --color-white: #ffffff;
                    --color-gray-50: #fafafa;
                    --color-gray-100: #f5f5f5;
                    --color-gray-200: #eeeeee;
                    --color-gray-300: #e0e0e0;
                    --color-gray-400: #bdbdbd;
                    --color-gray-600: #757575;
                    --color-gray-700: #616161;
                    --color-gray-900: #212121;
                    --color-primary: #27548A;
                    --color-primary-dark: #1f426b;
                    --color-secondary: #CDD7E5;
                    --color-accent: #FF8C42;
                    --color-success: #28a745;
                    --color-text-primary: #1f2937;
                    --color-text-secondary: #4b5563;
                    --color-text-muted: #9ca3af;
                    --color-bg-primary: #ffffff;
                    --color-bg-secondary: #f8f9fa;
                    --color-bg-tertiary: #f0f0f0;
                    --color-border: #e0e0e0;
                    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
                    --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
                    --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
                    --shadow-hover: 0 10px 20px rgba(0,0,0,0.1), 0 6px 6px rgba(0,0,0,0.1);
                    --radius-sm: 4px;
                    --radius-md: 8px;
                    --radius-lg: 12px;
                    --radius-xl: 16px;
                    --space-xs: 0.25rem;
                    --space-sm: 0.5rem;
                    --space-md: 1rem;
                    --space-lg: 1.5rem;
                    --space-xl: 2rem;
                    --space-2xl: 3rem;
                    --space-3xl: 4rem;
                    --transition-fast: 200ms ease;
                    --transition-normal: 300ms ease;
                    --transition-smooth: 400ms ease-out;
                    --container-max-width: 1200px;
                    --container-padding: var(--space-lg);
                    --font-size-xs: 0.75rem;
                    --font-size-sm: 0.875rem;
                    --font-size-base: 1rem;
                    --font-size-lg: 1.125rem;
                    --font-size-xl: 1.25rem;
                    --font-size-2xl: 1.5rem;
                    --font-size-3xl: 2rem;
                }

                /* === Base & Reset === */
                .ics-blogs *, .ics-blogs *::before, .ics-blogs *::after {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }
                .ics-blogs {
                    font-family: var(--font-body);
                    color: var(--color-text-primary);
                    line-height: 1.6;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    background: var(--color-bg-primary);
                    overflow-x: hidden;
                }

                /* Loading */
                .ics-loading {
                    position: fixed;
                    inset: 0;
                    background: var(--color-white);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: var(--space-md);
                    z-index: 9999;
                }
                .ics-spinner {
                    width: 50px;
                    height: 50px;
                    border: 4px solid var(--color-gray-200);
                    border-top: 4px solid var(--color-primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                /* Container */
                .ics-container {
                    max-width: var(--container-max-width);
                    margin: 0 auto;
                    padding: var(--space-2xl) var(--container-padding);
                }
                
                /* === NEW LAYOUT STYLES === */
                .ics-layout-wrapper {
                    display: grid;
                    grid-template-columns: 3fr 1fr;
                    gap: var(--space-2xl);
                }
                .ics-main-content {
                    min-width: 0;
                }
                .ics-sidebar {
                    position: sticky;
                    top: var(--space-xl);
                    align-self: start;
                }
                .ics-sidebar-widget {
                    margin-bottom: var(--space-2xl);
                }
                .ics-sidebar-widget h3 {
                    font-family: var(--font-display);
                    font-size: var(--font-size-base);
                    font-weight: 600;
                    color: var(--color-text-primary);
                    margin-bottom: var(--space-md);
                    padding-bottom: var(--space-md);
                    border-bottom: 1px solid var(--color-border);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .ics-sidebar-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .ics-sidebar-item {
                    margin-bottom: var(--space-xs);
                }
                .ics-sidebar-link {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: var(--space-sm) 0;
                    text-decoration: none;
                    color: var(--color-text-secondary);
                    font-size: var(--font-size-base);
                    font-weight: 500;
                    transition: all var(--transition-fast);
                    border: none;
                    background: none;
                    width: 100%;
                    text-align: left;
                    cursor: pointer;
                    border-bottom: 1px solid var(--color-border);
                }
                .ics-sidebar-item:last-child .ics-sidebar-link {
                    border-bottom: none;
                }
                .ics-sidebar-link:hover {
                    color: var(--color-primary);
                }
                .ics-sidebar-link--active {
                    color: var(--color-primary);
                    font-weight: 700;
                }
                .ics-sidebar-tag {
                    font-size: 0.65rem;
                    font-weight: 700;
                    color: var(--color-white);
                    background: #f06292;
                    padding: 2px 6px;
                    border-radius: var(--radius-sm);
                    text-transform: uppercase;
                }

                /* === NEW: LATEST NEWS CAROUSEL === */
                .ics-latest-carousel {
                    margin-bottom: var(--space-3xl);
                }
                .ics-carousel-wrapper {
                    display: flex;
                    overflow-x: auto;
                    gap: var(--space-lg);
                    padding-bottom: var(--space-md);
                    scroll-snap-type: x mandatory;
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                    
                    /* --- CSS CHO DRAG --- */
                    cursor: grab;
                    user-select: none; /* Ngăn chọn text khi kéo */
                    /* ------------------ */
                }
                /* --- CSS CHO DRAG --- */
                .ics-carousel-wrapper:active {
                    cursor: grabbing;
                }
                /* ------------------ */

                .ics-carousel-wrapper::-webkit-scrollbar {
                    display: none;
                }
                .ics-carousel-card {
                    flex: 0 0 280px;
                    scroll-snap-align: start;
                    border-radius: var(--radius-md);
                    overflow: hidden;
                    box-shadow: var(--shadow-sm);
                    cursor: pointer;
                    transition: all var(--transition-normal);
                    background: var(--color-white);
                }
                .ics-carousel-card:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-md);
                }
                .ics-carousel-image {
                    height: 160px;
                    overflow: hidden;
                    position: relative;
                }
                .ics-carousel-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform var(--transition-normal);
                }
                .ics-carousel-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.2);
                    opacity: 0;
                    transition: opacity var(--transition-normal);
                }
                .ics-carousel-card:hover .ics-carousel-image img {
                    transform: scale(1.1);
                }
                .ics-carousel-card:hover .ics-carousel-overlay {
                    opacity: 1;
                }
                .ics-carousel-content {
                    padding: var(--space-md);
                }
                .ics-carousel-date {
                    font-size: var(--font-size-xs);
                    color: var(--color-text-muted);
                    font-weight: 500;
                }
                .ics-carousel-title {
                    font-size: var(--font-size-sm);
                    font-weight: 600;
                    color: var(--color-text-primary);
                    margin-top: var(--space-xs);
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                /* Section Title */
                .ics-section-title {
                    font-family: var(--font-display);
                    font-size: clamp(1.5rem, 4vw, 2rem);
                    font-weight: 700;
                    color: var(--color-text-primary);
                    margin-bottom: var(--space-xl);
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                    border-bottom: 2px solid var(--color-primary);
                    padding-bottom: var(--space-sm);
                }
                .ics-title-icon {
                    font-size: 1.5rem;
                }

                /* === UPDATED: Featured Grid === */
                .ics-featured {
                    margin-bottom: var(--space-3xl);
                }
                .ics-featured-grid-new {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    grid-auto-flow: dense;
                    gap: var(--space-lg);
                }
                .ics-featured-card-new {
                    position: relative;
                    border-radius: var(--radius-md);
                    overflow: hidden;
                    cursor: pointer;
                    background: var(--color-gray-100);
                    box-shadow: var(--shadow-sm);
                    transition: all var(--transition-smooth);
                    display: flex;
                    flex-direction: column;
                }
                .ics-featured-card-new:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-hover);
                }
                .ics-featured-card-new:hover .ics-featured-image-new img {
                    transform: scale(1.05);
                }
                .ics-featured-image-new {
                    position: absolute;
                    inset: 0;
                    z-index: 1;
                }
                .ics-featured-image-new img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform var(--transition-smooth);
                }
                .ics-featured-content-new {
                    position: relative;
                    z-index: 2;
                    padding: var(--space-md);
                    margin-top: auto;
                    color: var(--color-white);
                    background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%);
                    min-height: 100px;
                }
                .ics-featured-date-new {
                    font-size: var(--font-size-xs);
                    font-weight: 500;
                    opacity: 0.9;
                    display: block;
                    margin-bottom: var(--space-xs);
                }
                .ics-featured-title-new {
                    font-family: var(--font-display);
                    font-size: var(--font-size-lg);
                    font-weight: 700;
                    line-height: 1.4;
                    color: var(--color-white);
                    text-shadow: 0 1px 3px rgba(0,0,0,0.4);
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .ics-featured-large {
                    grid-column: span 2;
                    grid-row: span 2;
                    height: 500px;
                }
                .ics-featured-medium {
                    grid-column: span 1;
                    grid-row: span 2;
                    height: 500px;
                }
                .ics-featured-right-stack {
                    grid-column: span 1;
                    grid-row: span 2;
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-lg);
                }
                .ics-featured-small {
                    height: calc((500px - var(--space-lg)) / 2);
                    width: 100%;
                }
                
                @media (max-width: 1024px) {
                    .ics-featured-grid-new {
                        grid-template-columns: 1fr 1fr;
                    }
                    .ics-featured-large {
                        grid-column: span 2;
                        grid-row: span 2;
                        height: 400px;
                    }
                    .ics-featured-medium {
                        grid-column: span 1;
                        grid-row: span 2;
                        height: 400px;
                    }
                    .ics-featured-right-stack {
                        grid-column: span 1;
                        grid-row: span 2;
                        height: 400px;
                    }
                     .ics-featured-small {
                        height: calc((400px - var(--space-lg)) / 2);
                    }
                }
                 @media (max-width: 768px) {
                    .ics-featured-grid-new {
                        grid-template-columns: 1fr;
                    }
                     .ics-featured-large,
                     .ics-featured-medium,
                     .ics-featured-right-stack {
                        grid-column: span 1;
                        grid-row: span 1;
                        height: 350px;
                     }
                     .ics-featured-right-stack {
                        height: auto;
                     }
                     .ics-featured-small {
                        height: 300px;
                     }
                }

                /* === OLD FEATURED GRID STYLES (Kept for reference, but new ones above apply) === */
                /*
                .ics-featured-grid { ... }
                .ics-featured-card { ... }
                */

                /* === CẬP NHẬT CSS CHO REGULAR GRID (.ics-card) === */
                .ics-regular {
                    margin-bottom: var(--space-3xl);
                }
                .ics-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: var(--space-lg);
                }
                
                /* Thay đổi .ics-card */
                .ics-card {
                    background: var(--color-gray-200); /* Fallback */
                    border-radius: var(--radius-lg); /* Thêm radius */
                    overflow: hidden;
                    box-shadow: var(--shadow-sm); /* Thêm shadow */
                    border: none;
                    cursor: pointer;
                    transition: all var(--transition-smooth);
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end; /* Đẩy content xuống */
                    position: relative; /* Cho children absolute */
                    height: 380px; /* Cần chiều cao cố định */
                }
                .ics-card:hover {
                    transform: translateY(-5px);
                    box-shadow: var(--shadow-hover);
                }
                .ics-card:hover .ics-card-bg-image {
                    transform: scale(1.05); /* Zoom ảnh nền khi hover */
                }

                /* Class mới cho ảnh nền */
                .ics-card-bg-image {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: var(--radius-lg);
                    z-index: 1;
                    transition: transform var(--transition-smooth);
                }
                
                /* Class mới cho lớp phủ gradient */
                .ics-card-overlay-gradient {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%);
                    z-index: 2;
                    border-radius: var(--radius-lg);
                }

                /* Class mới cho ngày tháng */
                .ics-card-date-new {
                    font-size: var(--font-size-sm);
                    color: rgba(255, 255, 255, 0.8);
                    margin-bottom: var(--space-xs);
                    display: block;
                    font-weight: 500;
                }

                /* Class .ics-card-image cũ không còn dùng trong JSX này */
                .ics-card-image {
                    /* Style này không còn áp dụng cho card mới */
                }
                .ics-card-category {
                    /* Style này không còn dùng trong card mới */
                }

                /* Thay đổi .ics-card-content */
                .ics-card-content {
                    padding: var(--space-lg); /* Thêm padding 2 bên */
                    flex: 0; /* Không- flex 1 */
                    position: relative;
                    z-index: 3;
                }
                
                /* Thay đổi .ics-card-title */
                .ics-card-title {
                    font-family: var(--font-display);
                    font-size: var(--font-size-lg);
                    font-weight: 700;
                    line-height: 1.4;
                    color: var(--color-white); /* Đổi màu */
                    margin-bottom: var(--space-sm);
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    transition: color var(--transition-fast);
                    text-shadow: 0 1px 3px rgba(0,0,0,0.4); /* Thêm shadow */
                }
                
                /* Thay đổi .ics-card-excerpt */
                .ics-card-excerpt {
                    font-size: var(--font-size-sm);
                    color: rgba(255, 255, 255, 0.9); /* Đổi màu */
                    line-height: 1.6;
                    margin-bottom: 0; /* Bỏ margin */
                    flex-grow: 0; /* Bỏ flex-grow */
                    display: -webkit-box;
                    -webkit-line-clamp: 2; /* 2 dòng là hợp lý */
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                /* Thêm style cho thẻ p bên trong excerpt */
                .ics-card-excerpt p {
                    margin: 0; 
                }

                /* Class .ics-card-footer cũ không còn dùng trong JSX này */
                .ics-card-footer {
                     display: none;
                }
                
                /* Pagination */
                .ics-pagination {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: var(--space-sm);
                    margin-top: var(--space-2xl);
                }
                .ics-page-btn,
                .ics-page-num {
                    min-width: 42px;
                    height: 42px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid var(--color-border);
                    background: var(--color-white);
                    color: var(--color-text-secondary);
                    border-radius: var(--radius-md);
                    font-weight: 600;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                    padding: 0 var(--space-sm);
                }
                 .ics-page-indicator {
                    font-size: var(--font-size-sm);
                    color: var(--color-text-secondary);
                    font-weight: 500;
                    padding: 0 var(--space-md);
                }
                .ics-page-btn:hover:not(:disabled),
                .ics-page-num:hover {
                    background: var(--color-primary);
                    color: var(--color-white);
                    border-color: var(--color-primary);
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-sm);
                }
                .ics-page-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                    background: var(--color-bg-tertiary);
                }

                /* Empty State */
                .ics-empty {
                    text-align: center;
                    padding: var(--space-3xl) var(--space-xl);
                    background: var(--color-bg-secondary);
                    border-radius: var(--radius-lg);
                    border: 1px dashed var(--color-border);
                }
                .ics-empty-icon {
                    font-size: 3rem;
                    margin-bottom: var(--space-md);
                    opacity: 0.6;
                }
                .ics-empty h3 {
                    font-family: var(--font-display);
                    font-size: var(--font-size-xl);
                    font-weight: 700;
                    color: var(--color-text-primary);
                    margin-bottom: var(--space-sm);
                }
                .ics-empty p {
                    color: var(--color-text-secondary);
                    font-size: var(--font-size-base);
                }

                /* Responsive Design */
                @media (max-width: 1024px) {
                    .ics-layout-wrapper {
                        grid-template-columns: 1fr;
                        gap: var(--space-xl);
                    }
                    .ics-main-content {
                        order: 1;
                    }
                    .ics-sidebar {
                        order: 2;
                        position: static;
                    }
                }

                @media (max-width: 768px) {
                    :root { --container-padding: var(--space-md); }
                    .ics-grid {
                        grid-template-columns: 1fr; /* 1 cột trên mobile */
                        gap: var(--space-md);
                    }
                }

                @media (max-width: 480px) {
                    .ics-section-title {
                        font-size: 1.3rem;
                    }
                    .ics-card {
                        height: 320px; /* Giảm chiều cao card trên mobile */
                    }
                    .ics-page-btn,
                    .ics-page-num {
                        min-width: 38px;
                        height: 38px;
                        font-size: var(--font-size-sm);
                    }
                    .ics-grid {
                        grid-template-columns: 1fr;
                    }
                }

                /* Xóa animation mặc định để GSAP xử lý */
                /*
                @media (prefers-reduced-motion: no-preference) {
                    .ics-card,
                    .ics-featured-card-new,
                    .ics-carousel-card {
                        animation: fadeInUp 0.5s ease-out backwards;
                    }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                */

                /* Accessibility */
                @media (prefers-reduced-motion: reduce) {
                    .ics-blogs *, .ics-blogs *::before, .ics-blogs *::after {
                        animation: none !important;
                        transition: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default BlogsPageContent;