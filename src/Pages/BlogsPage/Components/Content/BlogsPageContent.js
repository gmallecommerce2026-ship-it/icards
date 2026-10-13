import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, X, Clock, Flame, Filter } from 'lucide-react';
import api, { getCategories, getTopics } from '../../../../services/api';
import { BlogNavbar } from './BlogNavbar';
import './BlogsPageContent.css';

// Thumbnail fallback ảnh ngọn núi & mặt trời
const PostThumbnail = ({ src, alt = '' }) => {
    if (src) {
        return <img src={src} alt={alt} className="gm-post-img" loading="lazy" />;
    }
    return (
        <div className="gm-thumbnail-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
    );
};

// Hàm làm phẳng cây chủ đề
const flattenTopics = (nodes) => {
    let list = [];
    if (!Array.isArray(nodes)) return list;
    nodes.forEach(node => {
        list.push(node);
        if (node.children && node.children.length > 0) {
            list = list.concat(flattenTopics(node.children));
        }
    });
    return list;
};

export default function BlogsPageContent() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const activeCategory = searchParams.get('category') || 'all';
    const activeTopic = searchParams.get('topic') || 'all';
    const searchQuery = searchParams.get('search') || '';

    const [allBlogs, setAllBlogs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [topicsTree, setTopicsTree] = useState([]);
    const [loading, setLoading] = useState(true);

    const [sidebarSearchText, setSidebarSearchText] = useState(searchQuery);
    const [sidebarTab, setSidebarTab] = useState('latest');

    useEffect(() => {
        setSidebarSearchText(searchQuery);
    }, [searchQuery]);

    const todayFormatted = useMemo(() => {
        const now = new Date();
        const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        return `${days[now.getDay()]}, ${now.getDate()} Tháng ${now.getMonth() + 1}, ${now.getFullYear()}`;
    }, []);

    const updateParams = (updates) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            Object.entries(updates).forEach(([key, val]) => {
                if (val && val !== 'all') next.set(key, val);
                else next.delete(key);
            });
            return next;
        });
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [pagesRes, categoriesRes, topicsRes] = await Promise.all([
                    api.get('/pages', { params: { isBlog: true, isPublished: true, limit: 200, sort: '-createdAt' } }),
                    getCategories(),
                    getTopics().catch(() => ({ data: { data: [] } }))
                ]);
                if (pagesRes.data?.data) setAllBlogs(pagesRes.data.data);
                if (categoriesRes.data?.data) setCategories(categoriesRes.data.data);
                if (topicsRes.data?.data) setTopicsTree(topicsRes.data.data);
            } catch (err) {
                console.error("Lỗi tải dữ liệu:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    // Danh sách chủ đề làm phẳng cho Sidebar
    const flatTopicsList = useMemo(() => {
        return flattenTopics(topicsTree);
    }, [topicsTree]);

    // Đối tượng Category & Topic đang được kích hoạt
    const currentCategoryObj = useMemo(() => {
        if (!activeCategory || activeCategory === 'all') return null;
        return categories.find(c => 
            String(c._id || c.id).toLowerCase() === String(activeCategory).toLowerCase() ||
            String(c.slug || '').toLowerCase() === String(activeCategory).toLowerCase()
        );
    }, [categories, activeCategory]);

    const currentTopicObj = useMemo(() => {
        if (!activeTopic || activeTopic === 'all') return null;
        return flatTopicsList.find(t => 
            String(t._id || t.id).toLowerCase() === String(activeTopic).toLowerCase() ||
            String(t.slug || '').toLowerCase() === String(activeTopic).toLowerCase()
        );
    }, [flatTopicsList, activeTopic]);

    // =========================================================================
    // THUẬT TOÁN LỌC BÀI VIẾT CHUẨN XÁC 100% (KHÔNG BAO GIỜ BỊ SÓT BÀI)
    // =========================================================================
    const filteredBlogs = useMemo(() => {
        return allBlogs.filter(blog => {
            // 1. Lọc theo Danh mục (Category)
            if (activeCategory !== 'all') {
                const targetCat = String(activeCategory).trim().toLowerCase();
                const bCat = blog.category;
                const bCatId = String(typeof bCat === 'object' ? (bCat?._id || bCat?.id || '') : (bCat || '')).toLowerCase();
                const bCatSlug = String(typeof bCat === 'object' ? (bCat?.slug || '') : '').toLowerCase();
                const bCatName = String(typeof bCat === 'object' ? (bCat?.name || '') : '').toLowerCase();

                const matchCatId = bCatId && (bCatId === targetCat || targetCat.includes(bCatId));
                const matchCatSlug = bCatSlug && (bCatSlug === targetCat || targetCat.includes(bCatSlug));
                const matchCatName = currentCategoryObj?.name && bCatName.includes(currentCategoryObj.name.toLowerCase());

                if (!matchCatId && !matchCatSlug && !matchCatName) {
                    return false;
                }
            }

            // 2. Lọc theo Chủ đề (Topic)
            if (activeTopic !== 'all') {
                const targetTopic = String(activeTopic).trim().toLowerCase();
                
                // Lấy mảng topic IDs của bài viết và ép kiểu chuỗi
                const blogTopics = (blog.topics || []).map(t => {
                    if (typeof t === 'object' && t !== null) {
                        return String(t._id || t.id || t.slug || '').toLowerCase();
                    }
                    return String(t || '').toLowerCase();
                }).filter(Boolean);

                // So sánh trực tiếp ID hoặc Slug của topic
                const matchTopicId = blogTopics.some(id => id === targetTopic || (currentTopicObj && id === String(currentTopicObj._id || currentTopicObj.id).toLowerCase()));

                // Fallback nếu bài viết chưa gán topic trong DB -> Tìm từ khóa tên chủ đề trong Tiêu đề hoặc Tóm tắt
                const topicName = String(currentTopicObj?.name || '').toLowerCase();
                const titleLower = String(blog.title || '').toLowerCase();
                const summaryLower = String(blog.summary || '').toLowerCase();
                const matchKeyword = topicName && (titleLower.includes(topicName) || summaryLower.includes(topicName));

                if (!matchTopicId && !matchKeyword) {
                    return false;
                }
            }

            // 3. Lọc theo Search Query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const title = String(blog.title || '').toLowerCase();
                const summary = String(blog.summary || '').toLowerCase();
                if (!title.includes(q) && !summary.includes(q)) return false;
            }

            return true;
        });
    }, [allBlogs, activeCategory, activeTopic, searchQuery, currentCategoryObj, currentTopicObj]);

    // =========================================================================
    // TÍNH ĐÚNG SỐ BÀI VIẾT THEO TỪNG CHỦ ĐỀ CHO SIDEBAR
    // =========================================================================
    const topicCountMap = useMemo(() => {
        const counts = {};
        flatTopicsList.forEach(topic => {
            const tId = String(topic._id || topic.id || '').toLowerCase();
            const tSlug = String(topic.slug || '').toLowerCase();
            const tName = String(topic.name || '').toLowerCase();

            const count = allBlogs.filter(blog => {
                const bTopics = (blog.topics || []).map(t => 
                    String(typeof t === 'object' && t !== null ? (t._id || t.id || t.slug || '') : t).toLowerCase()
                );
                const hasId = bTopics.includes(tId) || (tSlug && bTopics.includes(tSlug));
                const hasKeyword = tName && (String(blog.title || '').toLowerCase().includes(tName) || String(blog.summary || '').toLowerCase().includes(tName));
                return hasId || hasKeyword;
            }).length;

            counts[topic._id || topic.id] = count;
        });
        return counts;
    }, [allBlogs, flatTopicsList]);

    // Dựng các khối chuyên mục trang chủ
    const categorySections = useMemo(() => {
        if (activeCategory !== 'all' || activeTopic !== 'all' || searchQuery.trim()) return [];

        return categories
            .map(cat => {
                const catId = String(cat._id || cat.id).toLowerCase();
                const catSlug = String(cat.slug || '').toLowerCase();

                const posts = allBlogs.filter(b => {
                    const bCat = b.category;
                    const bCatId = String(typeof bCat === 'object' ? (bCat?._id || bCat?.id || '') : (bCat || '')).toLowerCase();
                    const bCatSlug = String(typeof bCat === 'object' ? (bCat?.slug || '') : '').toLowerCase();
                    return bCatId === catId || (catSlug && bCatSlug === catSlug);
                });

                return {
                    category: cat,
                    posts: posts,
                    subCategories: cat.children || []
                };
            })
            .filter(sec => sec.posts.length > 0);
    }, [categories, allBlogs, activeCategory, activeTopic, searchQuery]);

    const heroMainPost = allBlogs[0] || null;
    const heroSidePosts = allBlogs.slice(1, 5);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        updateParams({ search: sidebarSearchText.trim() });
    };

    return (
        <div className="gm-page-wrapper">
            {/* Topbar */}
            <div className="gm-topbar">
                <div className="gm-container gm-topbar-content">
                    <div>{todayFormatted}</div>
                    <div className="gm-topbar-links">
                        <a href="/">Về iCards</a>
                        <a href="/shop">Cửa Hàng</a>
                    </div>
                </div>
            </div>

            {/* Header Brand */}
            <header className="gm-container gm-main-header">
                <div>
                    <h1 className="gm-brand-logo" onClick={() => updateParams({ category: 'all', topic: 'all', search: '' })}>
                        iCards<span>.Blog</span>
                    </h1>
                    <div className="gm-brand-sub">Tạp chí đời sống & mua sắm</div>
                </div>
                <div className="gm-ads-placeholder">
                    ADVERTISEMENT AREA
                </div>
            </header>

            {/* NAVBAR HEADER: CUỘN NGANG KHI LĂN CHUỘT + DROPDOWN DANH MỤC */}
            <BlogNavbar
                categories={categories}
                topicsTree={topicsTree}
                activeCategory={activeCategory}
                initialSearch={searchQuery}
                onSelectCategory={(catId) => {
                    // Khi chọn danh mục trên Navbar: reset topic để không bị kẹt filter
                    updateParams({ category: catId, topic: 'all', search: '' });
                }}
                onSearch={(q) => updateParams({ search: q })}
            />

            <main className="gm-container" style={{ marginTop: '0.75rem', paddingBottom: '4rem' }}>
                {/* Ticker Bar */}
                <div className="gm-ticker-bar">
                    <span className="gm-ticker-badge">XU HƯỚNG HOT</span>
                    <span className="gm-ticker-text">
                        {heroMainPost ? heroMainPost.title : "Outfit là gì? Tìm hiểu thuật ngữ hot trend 2026"}
                    </span>
                    <div className="gm-ticker-nav">
                        <button><ChevronLeft size={14} /></button>
                        <button><ChevronRight size={14} /></button>
                    </div>
                </div>

                {/* Hero Section (1 lớn + 4 nhỏ 2x2) */}
                {activeCategory === 'all' && activeTopic === 'all' && !searchQuery && heroMainPost && (
                    <section className="gm-hero-editorial-grid">
                        <div className="gm-hero-card gm-hero-large" onClick={() => navigate(`/page/${heroMainPost.slug}`)}>
                            <PostThumbnail src={heroMainPost.thumbnail || heroMainPost.coverImage} alt={heroMainPost.title} />
                            <div className="gm-hero-card-overlay">
                                <span className="gm-card-tag">{heroMainPost.category?.name || 'Tin Nổi Bật'}</span>
                                <h2 className="gm-hero-card-title">{heroMainPost.title}</h2>
                                <p className="gm-hero-card-date">{new Date(heroMainPost.createdAt).toLocaleDateString('vi-VN')}</p>
                            </div>
                        </div>

                        <div className="gm-hero-right-2x2">
                            {heroSidePosts.map(post => (
                                <div key={post._id} className="gm-hero-card" onClick={() => navigate(`/page/${post.slug}`)}>
                                    <PostThumbnail src={post.thumbnail || post.coverImage} alt={post.title} />
                                    <div className="gm-hero-card-overlay">
                                        <span className="gm-card-tag">{post.category?.name || 'Tin Mới'}</span>
                                        <h3 className="gm-hero-card-title">{post.title}</h3>
                                        <p className="gm-hero-card-date">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Layout chính: 8 Cột (Feed) + 4 Cột (Sidebar) */}
                <div className="gm-main-layout">
                    
                    {/* CỘT TRÁI: Main Feed */}
                    <div className="gm-main-feed">
                        {loading ? (
                            <div className="gm-loading-state">Đang tải dữ liệu bài viết...</div>
                        ) : (activeCategory !== 'all' || activeTopic !== 'all' || searchQuery.trim()) ? (
                            /* KHI ĐANG LỌC */
                            <section className="gm-section-block">
                                <div className="gm-section-header">
                                    <div className="gm-section-title-wrap">
                                        <h3 className="gm-section-title">
                                            {searchQuery ? `KẾT QUẢ CHO: "${searchQuery}"`
                                                : activeTopic !== 'all' ? `CHỦ ĐỀ: ${currentTopicObj?.name || activeTopic}`
                                                : `DANH MỤC: ${currentCategoryObj?.name || activeCategory}`}
                                        </h3>
                                    </div>
                                    <button
                                        className="gm-clear-filter-link"
                                        onClick={() => updateParams({ category: 'all', topic: 'all', search: '' })}
                                    >
                                        <X size={13} /> Xóa bộ lọc
                                    </button>
                                </div>

                                {filteredBlogs.length > 0 ? (
                                    <div className="gm-layout-A-grid">
                                        <div className="gm-layout-A-large" onClick={() => navigate(`/page/${filteredBlogs[0].slug}`)}>
                                            <PostThumbnail src={filteredBlogs[0].thumbnail || filteredBlogs[0].coverImage} alt={filteredBlogs[0].title} />
                                            <div className="gm-layout-A-large-content">
                                                <span className="gm-card-tag">{filteredBlogs[0].category?.name || 'Bài viết'}</span>
                                                <h4 className="gm-layout-A-large-title">{filteredBlogs[0].title}</h4>
                                                <span className="gm-layout-A-large-meta">
                                                    {filteredBlogs[0].author?.name || 'Admin'} • {new Date(filteredBlogs[0].createdAt).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="gm-layout-A-list">
                                            {filteredBlogs.slice(1, 6).map(post => (
                                                <div key={post._id} className="gm-list-item" onClick={() => navigate(`/page/${post.slug}`)}>
                                                    <div className="gm-list-thumb">
                                                        <PostThumbnail src={post.thumbnail || post.coverImage} alt={post.title} />
                                                    </div>
                                                    <div className="gm-list-info">
                                                        <h5 className="gm-list-title">{post.title}</h5>
                                                        <p className="gm-list-date">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="gm-empty-state">
                                        <p>Không tìm thấy bài viết nào phù hợp.</p>
                                        <button onClick={() => updateParams({ category: 'all', topic: 'all', search: '' })}>
                                            Xem tất cả bài viết
                                        </button>
                                    </div>
                                )}
                            </section>
                        ) : (
                            /* TRANG CHỦ: HIỂN THỊ CÁC KHỐI DANH MỤC */
                            <>
                                <section className="gm-section-block">
                                    <div className="gm-section-header">
                                        <div className="gm-section-title-wrap">
                                            <h3 className="gm-section-title">BÀI MỚI NHẤT</h3>
                                        </div>
                                        <span className="gm-section-more">XEM THÊM &gt;</span>
                                    </div>

                                    <div className="gm-layout-A-grid">
                                        {heroMainPost && (
                                            <div className="gm-layout-A-large" onClick={() => navigate(`/page/${heroMainPost.slug}`)}>
                                                <PostThumbnail src={heroMainPost.thumbnail || heroMainPost.coverImage} alt={heroMainPost.title} />
                                                <div className="gm-layout-A-large-content">
                                                    <span className="gm-card-tag">{heroMainPost.category?.name || 'Nổi bật'}</span>
                                                    <h4 className="gm-layout-A-large-title">{heroMainPost.title}</h4>
                                                    <span className="gm-layout-A-large-meta">
                                                        {heroMainPost.author?.name || 'Admin'} • {new Date(heroMainPost.createdAt).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="gm-layout-A-list">
                                            {heroSidePosts.map(post => (
                                                <div key={post._id} className="gm-list-item" onClick={() => navigate(`/page/${post.slug}`)}>
                                                    <div className="gm-list-thumb">
                                                        <PostThumbnail src={post.thumbnail || post.coverImage} alt={post.title} />
                                                    </div>
                                                    <div className="gm-list-info">
                                                        <h5 className="gm-list-title">{post.title}</h5>
                                                        <p className="gm-list-date">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                {categorySections.map(sec => {
                                    const secId = sec.category._id || sec.category.id;
                                    const mainPost = sec.posts[0];
                                    const sidePosts = sec.posts.slice(1, 5);

                                    return (
                                        <section key={secId} className="gm-section-block">
                                            <div className="gm-section-header">
                                                <div className="gm-section-title-wrap">
                                                    <h3
                                                        className="gm-section-title"
                                                        onClick={() => updateParams({ category: secId, topic: 'all' })}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        {sec.category.name}
                                                    </h3>
                                                    {sec.subCategories.length > 0 && (
                                                        <div className="gm-section-subtabs">
                                                            {sec.subCategories.slice(0, 4).map(sub => (
                                                                <React.Fragment key={sub._id || sub.id}>
                                                                    <span className="divider">|</span>
                                                                    <span
                                                                        className="subtab-item"
                                                                        onClick={() => updateParams({ category: sub._id || sub.id, topic: 'all' })}
                                                                    >
                                                                        {sub.name}
                                                                    </span>
                                                                </React.Fragment>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    className="gm-section-more-btn"
                                                    onClick={() => updateParams({ category: secId, topic: 'all' })}
                                                >
                                                    XEM THÊM &gt;
                                                </button>
                                            </div>

                                            <div className="gm-layout-A-grid">
                                                {mainPost && (
                                                    <div className="gm-layout-A-large" onClick={() => navigate(`/page/${mainPost.slug}`)}>
                                                        <PostThumbnail src={mainPost.thumbnail || mainPost.coverImage} alt={mainPost.title} />
                                                        <div className="gm-layout-A-large-content">
                                                            <span className="gm-card-tag">{sec.category.name}</span>
                                                            <h4 className="gm-layout-A-large-title">{mainPost.title}</h4>
                                                            <span className="gm-layout-A-large-meta">
                                                                {mainPost.author?.name || 'Admin'} • {new Date(mainPost.createdAt).toLocaleDateString('vi-VN')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="gm-layout-A-list">
                                                    {sidePosts.map(post => (
                                                        <div key={post._id} className="gm-list-item" onClick={() => navigate(`/page/${post.slug}`)}>
                                                            <div className="gm-list-thumb">
                                                                <PostThumbnail src={post.thumbnail || post.coverImage} alt={post.title} />
                                                            </div>
                                                            <div className="gm-list-info">
                                                                <h5 className="gm-list-title">{post.title}</h5>
                                                                <p className="gm-list-date">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </section>
                                    );
                                })}
                            </>
                        )}
                    </div>

                    {/* CỘT PHẢI: SIDEBAR (LỌC CHỦ ĐỀ TOPICS) */}
                    <aside className="gm-sidebar">
                        
                        {(activeCategory !== 'all' || activeTopic !== 'all' || searchQuery) && (
                            <div className="gm-sidebar-active-filter">
                                <div className="filter-header">
                                    <Filter size={13} />
                                    <span>ĐANG LỌC THEO:</span>
                                </div>
                                <div className="filter-details">
                                    {activeCategory !== 'all' && (
                                        <span className="filter-chip">
                                            Danh mục: {currentCategoryObj?.name || activeCategory}
                                        </span>
                                    )}
                                    {activeTopic !== 'all' && (
                                        <span className="filter-chip">
                                            Chủ đề: {currentTopicObj?.name || activeTopic}
                                        </span>
                                    )}
                                    {searchQuery && (
                                        <span className="filter-chip">
                                            Từ khóa: "{searchQuery}"
                                        </span>
                                    )}
                                </div>
                                <button
                                    className="gm-btn-clear-all"
                                    onClick={() => updateParams({ category: 'all', topic: 'all', search: '' })}
                                >
                                    Xóa tất cả lọc
                                </button>
                            </div>
                        )}

                        {/* KHỐI CHỦ ĐỀ (Bấm vào sẽ lọc chuẩn theo Topic, không bị kẹt Category) */}
                        <div className="gm-sidebar-box">
                            <h4 className="gm-sidebar-heading-bar">CHỦ ĐỀ</h4>
                            <div className="gm-tags-cloud">
                                <button
                                    className={`gm-tag-pill ${activeTopic === 'all' ? 'is-active' : ''}`}
                                    onClick={() => updateParams({ topic: 'all' })}
                                >
                                    TẤT CẢ ({allBlogs.length})
                                </button>
                                {flatTopicsList.map(topic => {
                                    const tId = topic._id || topic.id;
                                    const count = topicCountMap[tId] || 0;
                                    const isActive = activeTopic === tId || activeTopic === topic.slug;
                                    return (
                                        <button
                                            key={tId}
                                            className={`gm-tag-pill ${isActive ? 'is-active' : ''}`}
                                            onClick={() => updateParams({ topic: tId, category: 'all', search: '' })}
                                        >
                                            {topic.name} {count > 0 && <span className="cat-count">({count})</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="gm-sidebar-box">
                            <div className="gm-sidebar-tabs-header">
                                <button
                                    className={`sidebar-tab-btn ${sidebarTab === 'latest' ? 'active' : ''}`}
                                    onClick={() => setSidebarTab('latest')}
                                >
                                    <Clock size={13} /> BÀI VIẾT MỚI
                                </button>
                                <button
                                    className={`sidebar-tab-btn ${sidebarTab === 'popular' ? 'active' : ''}`}
                                    onClick={() => setSidebarTab('popular')}
                                >
                                    <Flame size={13} /> NỔI BẬT
                                </button>
                            </div>

                            <div className="gm-sidebar-posts-list">
                                {(sidebarTab === 'latest' ? allBlogs.slice(0, 5) : allBlogs.slice().reverse().slice(0, 5)).map(post => (
                                    <div
                                        key={post._id}
                                        className="gm-sidebar-post-item"
                                        onClick={() => navigate(`/page/${post.slug}`)}
                                    >
                                        <div className="gm-sidebar-post-thumb">
                                            <PostThumbnail src={post.thumbnail || post.coverImage} alt={post.title} />
                                        </div>
                                        <div className="gm-sidebar-post-info">
                                            <h5 className="gm-sidebar-post-title">{post.title}</h5>
                                            <span className="gm-sidebar-post-date">
                                                {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </aside>
                </div>
            </main>
        </div>
    );
}