import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Hash, Mail, ChevronRight, ChevronDown, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TopicTreeItem = ({ topic, activeTopic, onSelect, depth = 0 }) => {
    const hasChildren = topic.children && topic.children.length > 0;
    const isActive = activeTopic === topic._id;
    
    const isDescendantActive = (node, activeId) => {
        if (node._id === activeId) return true;
        if (node.children) return node.children.some(c => isDescendantActive(c, activeId));
        return false;
    };
    
    const [isOpen, setIsOpen] = useState(isDescendantActive(topic, activeTopic));

    useEffect(() => {
        if (isDescendantActive(topic, activeTopic)) setIsOpen(true);
    }, [activeTopic, topic]);

    const handleToggle = (e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    return (
        <li style={{ listStyle: 'none' }}>
            <div 
                className={`gm-cat-item ${isActive ? 'is-active' : ''}`}
                style={{ 
                    paddingLeft: `${depth * 14 + 12}px`, 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    fontWeight: isActive ? '700' : (depth === 0 ? '600' : '400'),
                    borderLeft: depth > 0 ? '1px dashed #cbd5e1' : 'none',
                    marginLeft: depth > 0 ? '8px' : '0'
                }}
                onClick={() => onSelect(topic._id)}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {depth > 0 && <span style={{ width: '6px', height: '1px', backgroundColor: '#cbd5e1' }}></span>}
                    {topic.name}
                </span>
                
                {hasChildren ? (
                    <button onClick={handleToggle} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#64748b' }}>
                        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                ) : (
                    <div style={{ width: '14px' }}></div>
                )}
            </div>
            
            {hasChildren && (
                <ul style={{ padding: 0, margin: 0, display: isOpen ? 'block' : 'none', transition: 'all 0.3s ease' }}>
                    {topic.children.map(child => (
                        <TopicTreeItem 
                            key={child._id} 
                            topic={child} 
                            activeTopic={activeTopic} 
                            onSelect={onSelect} 
                            depth={depth + 1} 
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};

const SIDEBAR_TAGS = ['Thiệp Cưới', 'Công Nghệ', 'Sự Kiện', 'Xu Hướng', 'Thiết Kế', 'AI', 'Quà Tặng'];

const BlogSidebar = ({ 
    topicsTree, 
    activeTopic, 
    searchQuery, 
    onFilterChange,
    popularPosts
}) => {
    const navigate = useNavigate();
    const [localSearch, setLocalSearch] = useState(searchQuery || '');
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [subscribeStatus, setSubscribeStatus] = useState('idle');

    useEffect(() => {
        setLocalSearch(searchQuery || '');
    }, [searchQuery]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        onFilterChange({ search: localSearch.trim() });
    };

    const handleTopicSelect = (topicId) => {
        setLocalSearch('');
        onFilterChange({ topic: topicId, search: '' }); 
    };

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!newsletterEmail) return;
        setSubscribeStatus('loading');
        try {
            await new Promise(resolve => setTimeout(resolve, 800)); 
            setSubscribeStatus('success');
            setNewsletterEmail('');
            setTimeout(() => setSubscribeStatus('idle'), 3000); 
        } catch (error) {
            setSubscribeStatus('idle');
        }
    };

    return (
        <div className="gm-magazine-sidebar-column">
            {/* WIDGET 1: TÌM KIẾM */}
            <div className="gm-sidebar-widget">
                <h3 className="gm-widget-title">TÌM KIẾM BÀI VIẾT</h3>
                <form className="gm-search-form" onSubmit={handleSearchSubmit}>
                    <input 
                        type="text" 
                        className="gm-search-input" 
                        placeholder="Nhập từ khóa tìm kiếm..." 
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                    />
                    <button type="submit" className="gm-search-btn">
                        <Search size={16} />
                    </button>
                </form>
            </div>

            {/* WIDGET 2: CHỦ ĐỀ CHUYÊN SÂU */}
            <div className="gm-sidebar-widget">
                <h3 className="gm-widget-title">CHỦ ĐỀ CHUYÊN SÂU</h3>
                <ul className="gm-cat-list" style={{ padding: 0 }}>
                    <li 
                        className={`gm-cat-item ${activeTopic === 'all' ? 'is-active' : ''}`}
                        onClick={() => handleTopicSelect('all')}
                        style={{ fontWeight: activeTopic === 'all' ? '700' : '600', paddingLeft: '12px' }}
                    >
                        <span>Tất cả chủ đề</span>
                        <ChevronRight size={14} className="gm-cat-icon" />
                    </li>
                    {topicsTree && topicsTree.map((topic) => (
                        <TopicTreeItem 
                            key={topic._id} 
                            topic={topic} 
                            activeTopic={activeTopic} 
                            onSelect={handleTopicSelect} 
                        />
                    ))}
                </ul>
            </div>

            {/* WIDGET 3: ĐỌC NHIỀU NHẤT (POPULAR ARTICLES) */}
            {popularPosts && popularPosts.length > 0 && (
                <div className="gm-sidebar-widget">
                    <h3 className="gm-widget-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingUp size={16} color="#2563eb" /> ĐỌC NHIỀU NHẤT
                    </h3>
                    <div className="gm-popular-list">
                        {popularPosts.map((post, index) => (
                            <div key={post._id} className="gm-popular-item" onClick={() => navigate(`/page/${post.slug}`)}>
                                <div className="gm-popular-number">{String(index + 1).padStart(2, '0')}</div>
                                <div className="gm-popular-content">
                                    <h4>{post.title}</h4>
                                    <span className="gm-popular-author">{post.author?.name || 'Ban biên tập'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* WIDGET 4: CHỦ ĐỀ HOT (TAG CLOUD) */}
            <div className="gm-sidebar-widget">
                <h3 className="gm-widget-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Hash size={16} color="#db2777" /> CHỦ ĐỀ HOT
                </h3>
                <div className="gm-tag-cloud">
                    {SIDEBAR_TAGS.map((tag, idx) => (
                        <span 
                            key={idx} 
                            className="gm-tag-pill"
                            onClick={() => onFilterChange({ search: tag })}
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* WIDGET 5: NEWSLETTER SUBSCRIPTION */}
            <div className="gm-newsletter-box">
                <Mail size={32} className="gm-newsletter-icon" />
                <h3 className="gm-newsletter-title">BẢN TIN ICARDS INSIGHTS</h3>
                <p className="gm-newsletter-desc">Đăng ký để nhận phân tích xu hướng công nghệ & ý tưởng sự kiện mới nhất.</p>
                {subscribeStatus === 'success' ? (
                    <div className="gm-newsletter-success-msg">
                        🎉 Cảm ơn bạn đã đăng ký!
                    </div>
                ) : (
                    <form onSubmit={handleSubscribe}>
                        <input 
                            type="email" 
                            placeholder="Email của bạn..." 
                            className="gm-newsletter-input" 
                            required 
                            value={newsletterEmail} 
                            onChange={(e) => setNewsletterEmail(e.target.value)} 
                            disabled={subscribeStatus === 'loading'} 
                        />
                        <button 
                            type="submit" 
                            className="gm-newsletter-btn" 
                            disabled={subscribeStatus === 'loading'} 
                            style={{ opacity: subscribeStatus === 'loading' ? 0.7 : 1 }}
                        >
                            {subscribeStatus === 'loading' ? 'Đang gửi...' : 'Đăng ký ngay'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default BlogSidebar;