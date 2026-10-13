// src/Pages/HomePage/Components/Content/HomepageContent.js

import React, { useEffect, useRef, useState, useMemo } from 'react';
import './HomepageContent.css';
import { useNavigate, Link } from 'react-router-dom';
import api from "../../../../services/api";
import SEO from '../../../../Features/SEO';
import { useSettings } from '../../../../Context/SettingsContext';
import Skeleton from '../../../../Components/Skeleton/Skeleton';
import UniversalBanner from '../../../../Components/UniversalBanner/UniversalBanner';

const IntroSection = ({ content }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const contentRef = useRef(null);
    const [shouldShowButton, setShouldShowButton] = useState(false);

    useEffect(() => {
        if (contentRef.current && contentRef.current.scrollHeight > 200) {
            setShouldShowButton(true);
        }
    }, [content]);

    const defaultContent = `
        <h3>Về iCards - Nền Tảng Thiết Kế Thiệp Online Hàng Đầu</h3>
        <p>Chào mừng bạn đến với <strong>iCards</strong>, giải pháp toàn diện giúp bạn tạo ra những tấm thiệp mời, thiệp chúc mừng ấn tượng và mang đậm dấu ấn cá nhân.</p>
        <p>Với công cụ thiết kế trực quan, bạn không cần phải là một chuyên gia đồ họa. Chỉ cần vài thao tác kéo thả, chỉnh sửa nội dung, bạn đã có ngay một tấm thiệp ưng ý để gửi đến người thân, bạn bè và đối tác.</p>
        <h4>Tại sao chọn iCards?</h4>
        <ul>
            <li><strong>Kho giao diện phong phú:</strong> Cập nhật liên tục các xu hướng thiết kế mới nhất.</li>
            <li><strong>Tùy biến linh hoạt:</strong> Thay đổi màu sắc, font chữ, hình ảnh dễ dàng.</li>
            <li><strong>Tiết kiệm chi phí & thời gian:</strong> Tạo thiệp online nhanh chóng, gửi đi tức thì qua Email, Zalo, Facebook.</li>
            <li><strong>Chất lượng cao:</strong> Hỗ trợ xuất file in ấn sắc nét hoặc file kỹ thuật số tối ưu.</li>
        </ul>
        <p>Hãy bắt đầu hành trình sáng tạo của bạn ngay hôm nay cùng iCards và biến những khoảnh khắc đặc biệt trở nên đáng nhớ hơn bao giờ hết!</p>
    `;

    const finalContent = content || defaultContent;

    return (
        <section className="section-intro">
            <div className="section-header">
                <p className="section-subtitle">VỀ CHÚNG TÔI</p>
                <h2 className="section-title">GIỚI THIỆU ICARDS</h2>
            </div>

            <div className={`intro-content-wrapper ${isExpanded ? 'expanded' : 'collapsed'}`}>
                <div
                    ref={contentRef}
                    className="intro-html-content"
                    dangerouslySetInnerHTML={{ __html: finalContent }}
                />
                {!isExpanded && shouldShowButton && <div className="content-fade-overlay"></div>}
            </div>

            {shouldShowButton && (
                <button
                    className="intro-toggle-btn"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                    <svg
                        width="12" height="8" viewBox="0 0 12 8" fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                    >
                        <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            )}
        </section>
    );
};

const ArrowButton = ({ direction, onClick }) => (
    <button className={`arrow-btn ${direction}`} onClick={onClick}>
        <svg width="13" height="22" viewBox="0 0 13 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 2L3 11L11 20" stroke="black" strokeWidth="2" strokeLinecap="round" />
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

const HomeSkeleton = () => {
    return (
        <div className="homepage-skeleton">
            <div style={{ width: '100%', aspectRatio: '16/9', maxHeight: '600px', marginBottom: '20px' }}>
                <Skeleton type="rect" height="100%" />
            </div>

            <div className="homepage-main" style={{ padding: '0 20px', maxWidth: '1440px', margin: '0 auto' }}>
                <div style={{ marginBottom: '40px', marginTop: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                        <Skeleton type="text" width="200px" height="20px" />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
                        <Skeleton type="title" width="400px" height="40px" />
                    </div>
                    <div style={{ display: 'flex', gap: '20px', overflow: 'hidden' }}>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} style={{ minWidth: '200px', flex: 1 }}>
                                <Skeleton type="rect" height="200px" style={{ borderRadius: '12px', marginBottom: '10px' }} />
                                <Skeleton type="text" width="80%" height="20px" style={{ margin: '0 auto' }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

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

export const Content = () => {
    const navigate = useNavigate();
    const occasionContainerRef = useRef(null);

    const [occasions, setOccasions] = useState([]);
    const [featuredInvitations, setFeaturedInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const { settings, loading: settingsLoading } = useSettings();

    const homeBanners = settings?.banners?.filter(b => b.displayPage === 'home' && b.isEnabled) || [];
    const homeBanner = homeBanners.find(b => b.name?.toLowerCase().includes('chính')) || homeBanners[0] || {}; // Đảm bảo luôn trả về object

    const secondaryBanners = homeBanners.filter(b => b.id !== homeBanner?.id).slice(0, 2);
    const introContent = settings?.introText || undefined;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [blocksResponse, templatesResponse] = await Promise.all([
                    api.get('/template-blocks'),
                    api.get('/invitation-templates?limit=50')
                ]);

                const allBlocks = blocksResponse.data?.data || [];
                const mappedOccasions = allBlocks
                    .filter(block => block.isActive)
                    .map(block => ({
                        _id: block._id,
                        title: block.title,
                        slug: block.slug,
                        imgSrc: block.templates?.[0]?.imgSrc || 'https://placehold.co/324x324/e0f7fa/006064?text=iCards'
                    }));

                setOccasions(mappedOccasions);

                const allTemplates = templatesResponse.data?.data || [];
                const usedTemplateIds = new Set(allBlocks.flatMap(block => block.templates?.map(t => t._id) || []));
                const featured = allTemplates.filter(t => !usedTemplateIds.has(t._id));

                setFeaturedInvitations(featured.slice(0, 8));
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu trang chủ:", error);
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
            const containerWidth = occasionContainerRef.current.offsetWidth;
            const scrollAmount = containerWidth * 0.8;
            occasionContainerRef.current.scrollBy({
                left: direction === 'next' ? scrollAmount : -scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const homeSeo = settings?.seo?.pages?.home;

    if (loading || settingsLoading) {
        return <HomeSkeleton />;
    }

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

            {/* SỬ DỤNG TRỰC TIẾP UNIVERSAL BANNER TẠI ĐÂY */}
            <section className="homepage-hero-wrapper" style={{ width: '100%', overflow: 'hidden' }}>
                <UniversalBanner
                    banner={homeBanner}
                    variant="hero"
                    defaultImg="https://pub-f720e3221ef5464a93d19bbdae2cfb86.r2.dev/herohome.png"
                />
            </section>

            <main className="homepage-main">
                <section className="section-occasions">
                    <div className="section-header">
                        <p className="section-subtitle">NHỮNG CƠ HỘI MỌI NGƯỜI KẾT NỐI THÂN THIẾT</p>
                        <h2 className="section-title">NHỮNG DỊP LAN TỎA NIỀM VUI</h2>
                    </div>

                    {occasions.length > 0 ? (
                        <div className="occasions-carousel">
                            <ArrowButton direction="prev" onClick={() => handleScroll('prev')} />
                            <div className="occasions-container" ref={occasionContainerRef}>
                                {occasions.map((item) => (
                                    <OccasionCard
                                        key={item._id}
                                        title={item.title}
                                        imgSrc={item.imgSrc || `https://placehold.co/324x324/e0f7fa/006064?text=${encodeURIComponent(item.title)}`}
                                        onClick={() => navigate(`/collection/${item.slug}`)}
                                    />
                                ))}
                            </div>
                            <ArrowButton direction="next" onClick={() => handleScroll('next')} />
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: '#666' }}>Đang cập nhật các khối...</div>
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
                            <div style={{ gridColumn: '1/-1', textAlign: 'center' }}>Chưa có mẫu thiệp nổi bật nào.</div>
                        )}
                    </div>
                    <button className="view-more-btn" onClick={() => navigate('/invitations')}>XEM TẤT CẢ</button>
                </section>

                <section className="section-features">
                    {secondaryBanners.map((banner, index) => (
                        <UniversalBanner
                            key={banner.id || index}
                            banner={banner}
                            variant="secondary"
                        />
                    ))}
                </section>

                <IntroSection content={introContent} />
            </main>
        </>
    );
};

export default Content;