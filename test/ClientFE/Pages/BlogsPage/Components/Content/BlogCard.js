import React from 'react';
import { Calendar, Clock, ArrowUpRight } from 'lucide-react';
import { getThumbnail, getExcerpt, calculateReadTime } from '../utils/blogHelpers';

const BlogCard = ({ blog, onClick }) => {
    // 1. Ưu tiên dùng ảnh thumbnail từ DB, nếu không có thì dùng hàm fallback cũ
    const displayImage = blog.thumbnail || getThumbnail(blog.content);

    // 2. Ưu tiên dùng mô tả ngắn (summary) từ DB, nếu không có thì dùng hàm fallback cũ
    const displayExcerpt = blog.summary || getExcerpt(blog.content);

    // 3. Xử lý khi ảnh bị lỗi (ví dụ: link hỏng) -> Hiện ảnh placeholder
    const handleImageError = (e) => {
        // Bạn có thể thay đường dẫn này bằng ảnh default trong project của bạn (vd: /assets/images/blog-placeholder.jpg)
        e.target.src = 'https://placehold.co/600x400/png?text=iCards+Blog'; 
    };

    return (
        <div className="bp-card" onClick={onClick}>
            {/* Image Section */}
            <div className="bp-card-img-wrap">
                <img 
                    src={displayImage} 
                    alt={blog.title} 
                    className="bp-img-cover"
                    loading="lazy"
                    onError={handleImageError}
                />
                <span className="bp-card-cat">{blog.category?.name || 'Tin tức'}</span>
            </div>

            {/* Content Section */}
            <div className="bp-card-body">
                <div className="bp-meta">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} />
                        {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        {calculateReadTime(blog.content)} min đọc
                    </span>
                </div>

                <h3 className="bp-card-title">{blog.title}</h3>

                <p className="bp-card-excerpt">
                    {displayExcerpt}
                </p>

                {/* Footer */}
                <div className="bp-card-footer">
                    <div className="bp-author">
                        <div className="bp-avatar-placeholder">
                            {(blog.author?.name || 'i')[0]?.toUpperCase()}
                        </div>
                        <span>{blog.author?.name || 'iCards Team'}</span>
                    </div>
                    <ArrowUpRight size={18} color="#9ca3af" />
                </div>
            </div>
        </div>
    );
};

export default BlogCard;