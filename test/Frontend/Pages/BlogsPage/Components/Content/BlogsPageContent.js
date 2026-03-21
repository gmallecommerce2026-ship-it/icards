import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Layers, Clock, ArrowRight, Flame } from 'lucide-react'; // Thêm icon Hash, Flame
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import _ from 'lodash'; 

import api from '../../../../services/api';
import { getThumbnail, getExcerpt, calculateReadTime } from '../utils/blogHelpers'; 
import BlogHero from './BlogHero';
import BlogSidebar from './BlogSidebar';
import './BlogsPageContent.css';

// --- Các Sub-Components (Giữ nguyên) ---
const BlogListItem = ({ blog, onClick }) => (
    <div className="bp-card-horizontal" onClick={onClick} style={{cursor: 'pointer'}}>
        <div className="bp-card-h-img-wrap">
            <img 
                src={blog.thumbnail || getThumbnail(blog.content)} 
                alt={blog.title} 
                className="bp-img-cover" 
            />
        </div>
        <div className="bp-card-h-body">
            <div className="bp-meta">
                <span style={{color: '#2563eb', fontWeight: 600}}>{blog.category?.name || 'Tin tức'}</span>
                <span>•</span>
                <span>{new Date(blog.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
            <h3 className="bp-card-h-title">{blog.title}</h3>
            <p className="bp-card-h-excerpt">{getExcerpt(blog.content, 100)}</p>
        </div>
    </div>
);

const BlogOverlayItem = ({ blog, onClick }) => (
    <div className="bp-card-overlay" onClick={onClick}>
        <img 
            src={blog.thumbnail || getThumbnail(blog.content)} 
            alt={blog.title} 
            className="bp-img-cover" 
        />
        <div className="bp-overlay-content">
            <span className="bp-overlay-cat">{blog.category?.name || 'Nổi bật'}</span>
            <h3 className="bp-overlay-title">{blog.title}</h3>
            <div style={{display: 'flex', gap: '10px', fontSize: '0.8rem', opacity: 0.9}}>
                <span>{blog.author?.name || 'Admin'}</span>
                <span>•</span>
                <span>{calculateReadTime(blog.content)} min đọc</span>
            </div>
        </div>
    </div>
);

const BlogGridItem = ({ blog, onClick }) => (
     <div className="bp-card" onClick={onClick} style={{cursor: 'pointer'}}>
        <div className="bp-card-img-wrap">
            <img 
                src={blog.thumbnail || getThumbnail(blog.content)} 
                alt={blog.title} 
                className="bp-img-cover" 
            />
            <span className="bp-card-cat">{blog.category?.name || 'Blog'}</span>
        </div>
        <div className="bp-card-body">
            <h3 className="bp-card-title">{blog.title}</h3>
            <p className="bp-card-excerpt">{getExcerpt(blog.content)}</p>
            <div className="bp-card-footer">
                <span className="bp-author">{new Date(blog.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
        </div>
    </div>
);

// --- Main Component ---
const BlogsPageContent = () => {
    const navigate = useNavigate();
    
    // States
    const [blogs, setBlogs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filter Params
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    
    const searchQueryRef = useRef(searchQuery);

    useEffect(() => {
        searchQueryRef.current = searchQuery;
    }, [searchQuery]);

    // Hàm gọi API bài viết
    const fetchBlogs = useCallback(async (params) => {
        try {
            setLoading(true);
            const res = await api.get('/pages', {
                params: {
                    isBlog: true,
                    isPublished: true,
                    limit: 50, 
                    sort: '-createdAt',
                    ...params
                }
            });
            if (res.data?.data) {
                setBlogs(res.data.data);
            }
        } catch (error) {
            console.error("Fetch Blogs Error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounce Search
    const debouncedSearch = useMemo(
        () => _.debounce((query, category) => {
            fetchBlogs({ 
                search: query, 
                category: category 
            });
        }, 500),
        [fetchBlogs]
    );

    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    // Initial Load
    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        const fetchInitialData = async () => {
            try {
                const [catsRes, topicsRes] = await Promise.all([
                    api.get('/public/page-categories'),
                    api.get('/public/topics')
                ]);

                if (catsRes.data?.data) setCategories(catsRes.data.data);
                
                if (topicsRes?.data?.data && Array.isArray(topicsRes.data.data)) {
                    setTopics(topicsRes.data.data.map(t => t.name));
                }
                
                fetchBlogs({ category: 'all' });

            } catch (error) {
                console.error("Init Error:", error);
            }
        };
        fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    // Effect khi đổi Category
    useEffect(() => {
        fetchBlogs({ 
            category: activeCategory, 
            search: searchQueryRef.current 
        });
    }, [activeCategory, fetchBlogs]);

    // Effect khi đổi Search Query
    useEffect(() => {
        debouncedSearch(searchQuery, activeCategory);
    }, [searchQuery, debouncedSearch, activeCategory]);

    // Phân chia dữ liệu cho UI
    const { heroPosts, latestList, visualGrid, standardGrid, isSearchMode } = useMemo(() => {
        const isSearching = !!searchQuery.trim() || activeCategory !== 'all';
        
        if (isSearching) {
            return {
                heroPosts: [],
                latestList: [],
                visualGrid: [],
                standardGrid: blogs,
                popularPosts: [],
                isSearchMode: true
            };
        }
        
        return {
            heroPosts: blogs.slice(0, 3),        
            latestList: blogs.slice(3, 7),       
            visualGrid: blogs.slice(7, 9),       
            standardGrid: blogs.slice(9),        
            popularPosts: blogs.slice(0, 5),      
            isSearchMode: false
        };
    }, [blogs, searchQuery, activeCategory]);

    // Animation Re-trigger
    useEffect(() => {
        if (!loading) {
            ScrollTrigger.refresh();
            setTimeout(() => {
                ScrollTrigger.batch(".bp-anim-item", {
                    onEnter: batch => gsap.to(batch, {
                        autoAlpha: 1, 
                        y: 0, 
                        stagger: 0.1, 
                        duration: 0.6, 
                        overwrite: true
                    }),
                    start: "top 90%" 
                });
            }, 100);
        }
    }, [loading, blogs]);

    // Xử lý click vào Topic -> Tự động điền vào ô tìm kiếm
    const handleTopicClick = (topicName) => {
        setSearchQuery(topicName);
        window.scrollTo({ top: 400, behavior: 'smooth' }); // Scroll xuống phần kết quả
    };

    if (loading && blogs.length === 0) return <div className="bp-container" style={{textAlign: 'center', paddingTop: '100px'}}>Loading iCards Insights...</div>;

    return (
        <div className="bp-container">
            {/* === UPGRADED HEADER === */}
            <div className="bp-header-modern">
                <div className="bp-header-branding">
                    <h1 className="bp-title">
                        iCards <span className="bp-title-highlight">INSIGHTS</span>
                    </h1>
                    <p className="bp-subtitle">Nơi cập nhật xu hướng công nghệ đa chiều.</p>
                </div>

                {/* Categories Navigation */}
                <div className="bp-nav-wrapper">
                    <nav className="bp-nav-categories">
                        <button 
                            className={`bp-nav-item-btn ${activeCategory === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveCategory('all')}
                        >
                            Tất cả
                        </button>
                        {categories.map(cat => (
                            <button 
                                key={cat._id}
                                className={`bp-nav-item-btn ${activeCategory === cat._id ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat._id)}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Topics / HashTags Bar (Nếu có topics) */}
                {topics.length > 0 && (
                    <div className="bp-topics-bar">
                        <span className="bp-topic-label">
                            <Flame size={16} color="#eab308" fill="#eab308" />
                            Trending:
                        </span>
                        <div className="bp-topic-list">
                            {topics.slice(0, 10).map((topic, index) => (
                                <span 
                                    key={index} 
                                    className="bp-topic-tag" 
                                    onClick={() => handleTopicClick(topic)}
                                >
                                    #{topic}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Hero Section - Chỉ hiện khi không search/filter */}
            {!isSearchMode && heroPosts.length > 0 && <BlogHero posts={heroPosts} navigate={navigate} />}

            {/* Main Layout */}
            <div className="bp-layout">
                <main>
                    {isSearchMode ? (
                        /* GIAO DIỆN KHI TÌM KIẾM / FILTER */
                        <div className="animate-fade-in">
                            <div className="bp-section-header-sm">
                                <h2 className="bp-section-title-sm">
                                    {searchQuery ? `Kết quả tìm kiếm: "${searchQuery}"` : `Danh mục: ${categories.find(c => c._id === activeCategory)?.name || 'Tất cả'}`}
                                </h2>
                                {isSearchMode && (
                                    <button 
                                        className="bp-cat-btn" 
                                        style={{width:'auto'}}
                                        onClick={() => {
                                            setActiveCategory('all');
                                            setSearchQuery('');
                                        }}
                                    >
                                        Xóa bộ lọc
                                    </button>
                                )}
                            </div>
                            {blogs.length > 0 ? (
                                <div className="bp-grid-list">
                                    {standardGrid.map(blog => (
                                        <BlogGridItem key={blog._id} blog={blog} onClick={() => navigate(`/page/${blog.slug}`)} />
                                    ))}
                                </div>
                            ) : (
                                <div style={{padding: '40px', textAlign: 'center', color: '#666', background: 'white', borderRadius: '16px'}}>
                                    <p>Không tìm thấy bài viết nào phù hợp.</p>
                                    <button 
                                        onClick={() => {
                                            setActiveCategory('all');
                                            setSearchQuery('');
                                        }}
                                        style={{marginTop: '10px', color: '#2563eb', background: 'none', border:'none', cursor:'pointer', fontWeight: 600}}
                                    >
                                        Quay lại trang chủ
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* GIAO DIỆN TẠP CHÍ MẶC ĐỊNH */
                        <>
                            {latestList.length > 0 && (
                                <section className="mb-12">
                                    <div className="bp-section-header-sm">
                                        <h2 className="bp-section-title-sm">
                                            <Zap size={20} style={{display:'inline', marginRight:8, color:'#eab308'}}/>
                                            Mới cập nhật
                                        </h2>
                                    </div>
                                    <div className="bp-list-group">
                                        {latestList.map(blog => (
                                            <div key={blog._id} className="bp-anim-item" style={{opacity:0, transform:'translateY(20px)'}}>
                                                <BlogListItem blog={blog} onClick={() => navigate(`/page/${blog.slug}`)} />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {visualGrid.length > 0 && <div className="bp-divider"></div>}

                            {visualGrid.length > 0 && (
                                <section className="mb-12">
                                    <div className="bp-section-header-sm">
                                        <h2 className="bp-section-title-sm">
                                            <Layers size={20} style={{display:'inline', marginRight:8, color:'#8b5cf6'}}/>
                                            Góc nhìn chuyên sâu
                                        </h2>
                                    </div>
                                    <div className="bp-overlay-grid">
                                        {visualGrid.map(blog => (
                                            <div key={blog._id} className="bp-anim-item" style={{opacity:0, transform:'translateY(20px)'}}>
                                                <BlogOverlayItem blog={blog} onClick={() => navigate(`/page/${blog.slug}`)} />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {standardGrid.length > 0 && <div className="bp-divider"></div>}

                            {standardGrid.length > 0 && (
                                <section>
                                    <div className="bp-section-header-sm">
                                        <h2 className="bp-section-title-sm">
                                            <Clock size={20} style={{display:'inline', marginRight:8, color:'#2563eb'}}/>
                                            Dành cho bạn
                                        </h2>
                                        <button className="bp-cat-btn" style={{width:'auto', padding:'4px 12px'}}>
                                            Xem thêm <ArrowRight size={14} style={{marginLeft:4}}/>
                                        </button>
                                    </div>
                                    <div className="bp-grid-list">
                                        {standardGrid.map(blog => (
                                            <div key={blog._id} className="bp-anim-item" style={{opacity:0, transform:'translateY(20px)'}}>
                                                <BlogGridItem blog={blog} onClick={() => navigate(`/page/${blog.slug}`)} />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </>
                    )}
                </main>

                <div className="bp-sidebar-wrapper">
                    <BlogSidebar 
                        categories={categories}
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery} 
                        popularPosts={blogs.slice(0, 5)} 
                        tags={topics} 
                    />
                </div>
            </div>
        </div>
    );
};

export default BlogsPageContent;