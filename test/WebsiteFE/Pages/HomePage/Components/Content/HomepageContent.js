// src/Pages/HomePage/Components/Content/HomepageContent.js

import React, { useEffect, useRef, useState } from 'react';
import './HomepageContent.css';
import { useNavigate, Link } from 'react-router-dom';
import api from "../../../../services/api";
import SEO from '../../../../Features/SEO';
import { useSettings } from '../../../../Context/SettingsContext';

// Hàm tiện ích để chuẩn hóa chuỗi thành slug URL
const titleToSlug = (title) => {
    if (!title) return '';
    return title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');
};

const ArrowButton = ({ direction, onClick }) => (
    <button className={`arrow-btn ${direction}`} onClick={onClick}>
        <svg width="13" height="22" viewBox="0 0 13 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 2L3 11L11 20" stroke="black" strokeWidth="2" strokeLinecap="round"/>
        </svg>
    </button>
);

const OccasionCard = ({ title, imgSrc, onClick }) => (
    <div className="occasion-item" onClick={onClick}>
        <div className="occasion-image-wrapper">
            <img src={imgSrc} alt={title} />
        </div>
        <p className="occasion-title">{title}</p>
    </div>
);

const InvitationCard = React.memo(({ _id, title, imgSrc }) => {
    const navigate = useNavigate();
    const handleNavigate = () => navigate(`/invitation/${_id}`);

    return (
        <div className="product-item" onClick={handleNavigate}>
            <div className="product-image-container">
                <img src={imgSrc || 'https://placehold.co/365x365/e6e6e6/999?text=Thiệp'} alt={title} className="product-image" />
            </div>
            <div className="product-info">
                <h5 className="product-title">{title}</h5>
            </div>
        </div>
    );
});

const BannerContent = ({ banner }) => (
    <>
        <img src={banner.imageUrl} alt={banner.name || 'Banner'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {(banner.title || banner.subtitle) && (
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'white',
                textShadow: '2px 2px 8px rgba(0,0,0,0.7)'
            }}>
                {banner.title && <h2 style={{ fontSize: '2.5rem', margin: 0 }}>{banner.title}</h2>}
                {banner.subtitle && <p style={{ fontSize: '1.2rem', margin: '8px 0 0' }}>{banner.subtitle}</p>}
            </div>
        )}
    </>
);

const SecondaryBanner = ({ banner }) => {
    if (!banner) return null;

    const bannerStyle = {
        width: '100%',
        borderRadius: '12px',
        overflow: 'hidden',
        textAlign: 'center',
        position: 'relative',
        backgroundColor: '#f0f0f0',
        aspectRatio: '1520 / 634'
    };

    const renderBanner = () => {
        if (banner.htmlContent) {
            return <div style={bannerStyle} dangerouslySetInnerHTML={{ __html: banner.htmlContent }} />;
        }
        return (
            <div style={bannerStyle}>
                <BannerContent banner={banner} />
            </div>
        );
    };

    if (banner.link) {
        const isExternal = banner.link.startsWith('http');
        if (isExternal) {
            return (
                <a href={banner.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    {renderBanner()}
                </a>
            );
        }
        return <Link to={banner.link}>{renderBanner()}</Link>;
    }

    return renderBanner();
};

export const Content = () => {
    const navigate = useNavigate();
    const occasionContainerRef = useRef(null);

    const [occasions, setOccasions] = useState([]);
    const [featuredInvitations, setFeaturedInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const { settings, loading: settingsLoading } = useSettings();

    const homeBanners = settings?.banners?.filter(b => b.displayPage === 'home' && b.isEnabled) || [];
    const homeBanner = homeBanners.find(b => b.name?.toLowerCase().includes('chính')) || homeBanners[0];

    const secondaryBanners = homeBanners.filter(b => b.id !== homeBanner?.id).slice(0, 2);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // --- THAY ĐỔI LOGIC XỬ LÝ DỮ LIỆU ---
                // Lấy danh sách lớn hơn để có đủ dữ liệu lọc trùng lặp (ví dụ 50 item)
                const response = await api.get('/invitation-templates?limit=50');
                const allTemplates = response.data.data || [];

                // 1. Xử lý "Occasions" (Slider):
                // Mục tiêu: Chỉ hiển thị các cặp "Category + Type" duy nhất.
                // Ví dụ: Nếu có 5 mẫu "Thiệp Cưới - Hiện Đại", chỉ lấy 1 mẫu làm đại diện.
                const uniqueOccasionsMap = new Map();
                allTemplates.forEach(template => {
                    const category = template.category || '';
                    const type = template.type || '';
                    // Tạo key duy nhất dựa trên Category và Type
                    const key = `${category.trim()}-${type.trim()}`;
                    
                    if (category && !uniqueOccasionsMap.has(key)) {
                        uniqueOccasionsMap.set(key, template);
                    }
                });
                // Chuyển Map thành Array cho slider
                const processedOccasions = Array.from(uniqueOccasionsMap.values());
                setOccasions(processedOccasions);

                // 2. Xử lý "Featured Invitations" (Grid):
                // Lấy 8 mẫu thiệp đầu tiên (hoặc có thể random nếu muốn) để hiển thị ở lưới sản phẩm
                const usedIds = new Set(processedOccasions.map(item => item._id));

                // Lọc danh sách gốc: Chỉ lấy những mẫu chưa xuất hiện trong Occasions
                const availableForFeatured = allTemplates.filter(t => !usedIds.has(t._id));

                // Lấy 8 mẫu thiệp từ danh sách đã lọc (đảm bảo không trùng)
                const featured = availableForFeatured.slice(0, 8);
                setFeaturedInvitations(featured);

            } catch (error) {
                console.error("Failed to fetch homepage data:", error);
                // Fallback nếu lỗi
                setOccasions([]);
                setFeaturedInvitations([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleScroll = (direction) => {
        if (occasionContainerRef.current) {
            const scrollAmount = occasionContainerRef.current.querySelector('.occasion-item').offsetWidth + 20;
            occasionContainerRef.current.scrollBy({
                left: direction === 'next' ? scrollAmount : -scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const homeSeo = settings?.seo?.pages?.home;

    if (loading || settingsLoading) {
        return <div className="loading-spinner"><div></div><div></div><div></div></div>;
    }
    
    const renderHeroBanner = () => {
        if (!homeBanner) {
            return (
                <div
                    className="hero-image-background"
                    style={{ backgroundImage: `url(https://pub-f720e3221ef5464a93d19bbdae2cfb86.r2.dev/herohome.png)` }}
                />
            );
        }

        if (homeBanner.htmlContent) {
            return <div dangerouslySetInnerHTML={{ __html: homeBanner.htmlContent }} />;
        }

        const bannerContent = (
            <>
                {homeBanner.mediaType === 'video' && homeBanner.videoUrl ? (
                    <video
                        src={homeBanner.videoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="hero-video-background"
                    />
                ) : (
                    <div
                        className="hero-image-background"
                        style={{ backgroundImage: `url(${homeBanner.imageUrl || 'https://pub-f720e3221ef5464a93d19bbdae2cfb86.r2.dev/herohome.png'})` }}
                    />
                )}
                <div className="hero-content">
                    {homeBanner.title && <h1 className="hero-title">{homeBanner.title}</h1>}
                    {homeBanner.subtitle && <p className="hero-subtitle">{homeBanner.subtitle}</p>}
                </div>
            </>
        );

        if (homeBanner.link) {
            const isExternal = homeBanner.link.startsWith('http');
            if (isExternal) {
                return (
                    <a href={homeBanner.link} target="_blank" rel="noopener noreferrer" className="hero-link-wrapper">
                        {bannerContent}
                    </a>
                );
            }
            return <Link to={homeBanner.link} className="hero-link-wrapper">{bannerContent}</Link>;
        }

        return bannerContent;
    };

    const HOMEPAGE_IMAGE = "https://imagedelivery.net/mYCNH6-2h27PJijuhYd-fw/32c7501a-ed3b-4466-876b-48bcfb13d600/public";

    return (
        <>
            <SEO
                title={homeSeo?.title || "iCards.com.vn: Nền Tảng Thiết Kế Thiệp Online"}
                description={homeSeo?.description || "Tạo thiệp mời, thiệp chúc mừng online đẹp mắt và chuyên nghiệp."}
                keywords={homeSeo?.keywords}
                imageUrl={HOMEPAGE_IMAGE}
                url="/"
            />
            <section className="hero-section">
                {renderHeroBanner()}
            </section>

            <main className="homepage-main">
                <section className="section-occasions">
                    <div className="section-header">
                        <p className="section-subtitle">NHỮNG CƠ HỘI MỌI NGƯỜI KẾT NỐI THÂN THIẾT</p>
                        <h2 className="section-title">NHỮNG DỊP LAN TỎA NIỀM VUI</h2>
                    </div>
                    
                    {/* Chỉ hiển thị slider nếu có dữ liệu */}
                    {occasions.length > 0 ? (
                        <div className="occasions-carousel">
                            <ArrowButton direction="prev" onClick={() => handleScroll('prev')} />
                            <div className="occasions-container" ref={occasionContainerRef}>
                                {occasions.map((item) => (
                                    <OccasionCard
                                        key={item._id}
                                        // Hiển thị tên Danh mục + Loại (VD: Thiệp Cưới Hiện Đại)
                                        title={`${item.category} ${item.type || ""}`.trim()}
                                        imgSrc={item.imgSrc || `https://placehold.co/324x324/e0f7fa/006064?text=${item.title}`}
                                        // Điều hướng đến trang danh mục tương ứng
                                        onClick={() => navigate(`/invitations/category/${titleToSlug(item.category)}/type/${titleToSlug(item.type)}`)}
                                    />
                                ))}
                            </div>
                            <ArrowButton direction="next" onClick={() => handleScroll('next')} />
                        </div>
                    ) : (
                        <div style={{textAlign: 'center', color: '#666'}}>Đang cập nhật các dịp...</div>
                    )}
                </section>

                <section className="section-products">
                     <div className="section-header">
                        <p className="section-subtitle">KHÁM PHÁ NHỮNG MẪU THIỆP ĐỘC ĐÁO</p>
                        <h2 className="section-title">MẪU THIỆP NỔI BẬT</h2>
                    </div>
                    <div className="product-grid">
                        {featuredInvitations.length > 0 ? (
                            featuredInvitations.map((invitation) => (
                                <InvitationCard
                                    key={invitation._id}
                                    _id={invitation._id}
                                    title={invitation.title}
                                    imgSrc={invitation.imgSrc}
                                />
                            ))
                        ) : (
                            <div style={{gridColumn: '1/-1', textAlign: 'center'}}>Chưa có mẫu thiệp nổi bật nào.</div>
                        )}
                    </div>
                    <button className="view-more-btn" onClick={() => navigate('/invitations')}>XEM TẤT CẢ</button>
                </section>

                <section className="section-features">
                    {secondaryBanners.map((banner, index) => (
                        <SecondaryBanner key={banner.id || index} banner={banner} />
                    ))}
                </section>
            </main>
        </>
    );
};

export default Content;