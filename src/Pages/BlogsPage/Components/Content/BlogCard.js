import React from 'react';
import { Clock, ArrowUpRight, BookOpen } from 'lucide-react';
import { getThumbnail, getExcerpt, calculateReadTime } from '../utils/blogHelpers';

const BlogCard = ({ blog, variant = 'simple', onClick }) => {
    const displayImage = blog.thumbnail || getThumbnail(blog.content);
    const displayExcerpt = blog.summary || getExcerpt(blog.content, 110);
    const readTime = calculateReadTime(blog.content);
    const categoryName = typeof blog.category === 'object' ? blog.category?.name : (blog.category || 'Tin tức');

    const handleImageError = (e) => {
        e.target.src = 'https://placehold.co/600x400/png?text=iCards+Insights'; 
    };

    // VARIANT 1: HERO TỐI THƯỢNG (Khối tin bài nổi bật nhất đầu trang)
    if (variant === 'hero') {
        return (
            <div className="gm-blog-card-hero" onClick={onClick}>
                <div className="gm-hero-img-container">
                    <img src={displayImage} alt={blog.title} className="gm-img-magnify" onError={handleImageError} loading="lazy" />
                </div>
                <div className="gm-hero-overlay"></div>
                <div className="gm-hero-content-area">
                    <span className="gm-badge-accent bg-blue-600">{categoryName}</span>
                    <h2 className="gm-hero-main-title">{blog.title}</h2>
                    {displayExcerpt && <p className="gm-hero-excerpt">{displayExcerpt}</p>}
                    <div className="gm-card-meta-inline text-gray-300">
                        <span className="gm-author-name">{blog.author?.name || 'Ban biên tập iCards'}</span>
                        <span className="gm-meta-dot"></span>
                        <span className="gm-read-time">
                            <Clock size={12} style={{ marginRight: '4px', display: 'inline' }} />
                            {readTime} phút đọc
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // VARIANT 2: OVERLAY (Khối tin bài vuông phủ bóng)
    if (variant === 'overlay') {
        return (
            <div className="gm-blog-card-overlay" onClick={onClick}>
                <img src={displayImage} alt={blog.title} className="gm-img-magnify" onError={handleImageError} loading="lazy" />
                <div className="gm-overlay-darkness"></div>
                <div className="gm-overlay-text-wrapper">
                    <span className="gm-badge-accent bg-rose-600">{categoryName}</span>
                    <h3 className="gm-overlay-title">{blog.title}</h3>
                    <div className="gm-card-meta-inline text-gray-300">
                        <span>{readTime} phút đọc</span>
                    </div>
                </div>
            </div>
        );
    }

    // VARIANT 3: HORIZONTAL LIST (Dạng tin bài nằm ngang - Ảnh trái, chữ phải)
    if (variant === 'list') {
        return (
            <div className="gm-blog-card-list-row" onClick={onClick}>
                <div className="gm-list-img-box">
                    <img src={displayImage} alt={blog.title} className="gm-img-cover" onError={handleImageError} />
                </div>
                <div className="gm-list-content-box">
                    <span className="gm-badge-accent bg-indigo-600" style={{ alignSelf: 'flex-start' }}>{categoryName}</span>
                    <h4 className="gm-list-title">{blog.title}</h4>
                    <div className="gm-card-meta-inline text-gray-500">
                        <span>{readTime} phút đọc</span>
                    </div>
                </div>
            </div>
        );
    }

    // VARIANT 4: SIMPLE MAGAZINE (Thẻ tạp chí dạng cột cổ điển)
    return (
        <div className="gm-blog-card-simple" onClick={onClick}>
            <div className="gm-simple-img-box">
                <img src={displayImage} alt={blog.title} className="gm-img-magnify" onError={handleImageError} loading="lazy" />
                <span className="gm-simple-floating-badge">{categoryName}</span>
            </div>
            <div className="gm-simple-body">
                <h3 className="gm-simple-title">{blog.title}</h3>
                <div className="gm-card-meta-inline text-gray-500 mb-2">
                    <span className="gm-uppercase-author">{blog.author?.name || 'iCards'}</span>
                    <span className="gm-meta-pipe">|</span>
                    <span>{readTime} phút đọc</span>
                </div>
                {displayExcerpt && <p className="gm-simple-excerpt">{displayExcerpt}</p>}
            </div>
        </div>
    );
};

export default BlogCard;