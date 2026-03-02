import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { getThumbnail } from '../utils/blogHelpers';

const BlogHero = ({ posts, navigate }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.bp-hero-anim', {
                y: 30,
                opacity: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: 'power3.out'
            });
        }, containerRef);
        return () => ctx.revert();
    }, [posts]);

    if (!posts || posts.length === 0) return null;

    const mainPost = posts[0];
    const subPosts = posts.slice(1, 3);

    // Hàm helper xử lý logic lấy ảnh: Ưu tiên thumbnail -> Ảnh trong content -> Placeholder
    const getDisplayImage = (post) => {
        // Kiểm tra kỹ: tồn tại, là chuỗi và không phải khoảng trắng
        if (post?.thumbnail && typeof post.thumbnail === 'string' && post.thumbnail.trim() !== "") {
            return post.thumbnail;
        }
        // Fallback sang ảnh trích xuất từ nội dung bài viết
        const contentThumbnail = getThumbnail(post.content);
        if (contentThumbnail) {
            return contentThumbnail;
        }
        // Fallback cuối cùng
        return 'https://placehold.co/600x400?text=No+Image'; 
    };

    return (
        <section ref={containerRef} className="bp-hero">
            {/* Main Post (Left) */}
            <div 
                className="bp-hero-main bp-hero-anim" 
                onClick={() => navigate(`/page/${mainPost.slug}`)}
            >
                <img 
                    // [ĐÃ SỬA]: Gọi hàm getDisplayImage thay vì logic inline
                    src={getDisplayImage(mainPost)} 
                    alt={mainPost.title}
                    className="bp-img-cover"
                    // Xử lý khi ảnh bị lỗi 404 dù có link
                    onError={(e) => {
                        e.target.onerror = null; // Tránh loop vô hạn
                        e.target.src = 'https://placehold.co/600x400?text=Error';
                    }} 
                />
                <div className="bp-overlay">
                    <span className="bp-tag">Mới nhất</span>
                    <h2 className="bp-hero-title-lg">{mainPost.title}</h2>
                    <p className="bp-hero-desc">
                        {mainPost.seo?.metaDescription || 'Khám phá bài viết nổi bật nhất.'}
                    </p>
                </div>
            </div>

            {/* Side Posts (Right) */}
            <div className="bp-hero-side">
                {subPosts.map((post) => (
                    <div 
                        key={post._id}
                        className="bp-hero-sub bp-hero-anim"
                        onClick={() => navigate(`/page/${post.slug}`)}
                    >
                        <img 
                            // [ĐÃ SỬA]: Gọi hàm getDisplayImage ở đây nữa
                            src={getDisplayImage(post)} 
                            className="bp-img-cover"
                            alt={post.title}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://placehold.co/600x400?text=Error';
                            }}
                        />
                        <div className="bp-overlay">
                            <span className="bp-cat-sm">{post.category?.name}</span>
                            <h3 className="bp-hero-title-sm">{post.title}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default BlogHero;