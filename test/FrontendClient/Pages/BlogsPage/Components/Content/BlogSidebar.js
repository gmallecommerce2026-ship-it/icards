import React from 'react';
import { Search, Hash, TrendingUp, Mail, ChevronRight } from 'lucide-react';

const BlogSidebar = ({ 
    categories, 
    activeCategory, 
    setActiveCategory, 
    searchQuery, 
    setSearchQuery,
    popularPosts,
    tags 
}) => {
    return (
        <aside className="bp-sidebar">
            {/* 1. Search Widget */}
            <div className="bp-widget">
                <h3 className="bp-widget-title">
                    <Search size={18} /> Tìm kiếm
                </h3>
                <div className="bp-search-box">
                    <input
                        type="text"
                        placeholder="Tìm bài viết..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bp-search-input"
                    />
                    <button className="bp-search-btn">
                        <Search size={18} />
                    </button>
                </div>
            </div>

            {/* 2. Categories Widget */}
            <div className="bp-widget">
                <h3 className="bp-widget-title">Danh mục</h3>
                <ul className="bp-cat-list">
                    <li className="bp-cat-item">
                        <button
                            onClick={() => setActiveCategory('all')}
                            className={`bp-cat-btn ${activeCategory === 'all' ? 'active' : ''}`}
                        >
                            <span>Tất cả</span>
                            <ChevronRight size={16} color={activeCategory === 'all' ? '#2563eb' : '#9ca3af'} />
                        </button>
                    </li>
                    {categories.map((cat) => (
                        <li key={cat._id} className="bp-cat-item">
                            <button
                                onClick={() => setActiveCategory(cat._id)}
                                className={`bp-cat-btn ${activeCategory === cat._id ? 'active' : ''}`}
                            >
                                <span>{cat.name}</span>
                                <span className="bp-count">
                                    {Math.floor(Math.random() * 10) + 1}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* 3. Trending Widget */}
            {popularPosts && popularPosts.length > 0 && (
                <div className="bp-widget">
                    <h3 className="bp-widget-title">
                        <TrendingUp size={18} color="#ef4444" /> Xu hướng
                    </h3>
                    <div className="bp-trending-list">
                        {popularPosts.map((post, index) => (
                            <div key={post._id} className="bp-trending-item">
                                <div className="bp-rank">0{index + 1}</div>
                                <div className="bp-trending-info">
                                    <h4>{post.title}</h4>
                                    <span className="bp-date-sm">
                                        {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 4. Tags Widget */}
            {tags && tags.length > 0 && (
                <div className="bp-widget">
                    <h3 className="bp-widget-title">
                        <Hash size={18} /> Từ khóa hot
                    </h3>
                    <div className="bp-tags-cloud">
                        {tags.map((tag, idx) => (
                            <button key={idx} className="bp-tag-btn">
                                #{tag}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 5. Newsletter Widget */}
            <div className="bp-widget bp-newsletter">
                <div className="bp-widget-title">
                    <Mail size={20} />
                    <span>Newsletter</span>
                </div>
                <p className="bp-nl-desc">
                    Đăng ký nhận bài viết công nghệ mới nhất hàng tuần.
                </p>
                <input type="email" placeholder="Email của bạn" className="bp-nl-input" />
                <button className="bp-nl-btn">Đăng ký ngay</button>
            </div>
        </aside>
    );
};

export default BlogSidebar;