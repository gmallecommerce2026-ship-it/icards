// src/Pages/InvitationPage/Components/Content/InvitationContent.js
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../../services/api';
import './InvitationContent.css';
import { useSettings } from '../../../../Context/SettingsContext';
import Skeleton from '../../../../Components/Skeleton/Skeleton';

// Card component to display each invitation
const InvitationCard = ({ id, title, imgSrc }) => {
    const navigate = useNavigate();
    const handleClick = () => navigate(`/invitation/${id}`);

    return (
        <div className="invitation-card-item" onClick={handleClick}>
            <div className="invitation-card-image-wrapper">
                <img src={imgSrc} alt={title} onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/400x500/EAEAEA/CCC?text=Image'; }}/>
            </div>
            <p className="invitation-card-title">{title}</p>
        </div>
    );
};

// --- Main Page Component ---
const InvitationPageContent = () => {
    // Sửa lại để nhận `typeName` làm tham số lọc chính
    const { categoryName, groupName, typeName } = useParams();
    const navigate = useNavigate();
    const [allTemplates, setAllTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const { settings } = useSettings();
    const filtersRef = useRef(null);

    useEffect(() => {
        const filtersEl = filtersRef.current;
        if (!filtersEl) return;

        const handleWheelScroll = (e) => {
            // Nếu không có thanh cuộn ngang thì không làm gì cả
            if (filtersEl.scrollWidth <= filtersEl.clientWidth) {
                return;
            }

            const isAtStart = filtersEl.scrollLeft === 0;
            // Trừ 1 pixel để xử lý lỗi làm tròn của trình duyệt
            const isAtEnd = filtersEl.scrollLeft + filtersEl.clientWidth >= filtersEl.scrollWidth - 1;

            // e.deltaY > 0 là cuộn xuống (sang phải), < 0 là cuộn lên (sang trái)
            if ((e.deltaY > 0 && !isAtEnd) || (e.deltaY < 0 && !isAtStart)) {
                // Ngăn trang cuộn dọc và thực hiện cuộn ngang
                e.preventDefault();
                filtersEl.scrollLeft += e.deltaY;
            }
            // Nếu đã ở đầu hoặc cuối, không làm gì để trình duyệt tự cuộn dọc trang
        };

        filtersEl.addEventListener('wheel', handleWheelScroll);

        // Dọn dẹp listener khi component bị hủy
        return () => {
            filtersEl.removeEventListener('wheel', handleWheelScroll);
        };
    }, []);
    const banners = settings?.banners || [];
    const invitationBanner = banners.find(b => b.displayPage === 'invitations' && b.isEnabled) || banners.find(b => b.displayPage === 'all' && b.isEnabled);
    const groupsForCurrentCategory = useMemo(() => {
        if (!categoryName) return [];
        const templatesInCategory = allTemplates.filter(t => titleToSlug(t.category) === categoryName);
        return [...new Set(templatesInCategory.map(t => t.group).filter(Boolean))];
    }, [allTemplates, categoryName]);
    const typesForCurrentGroup = useMemo(() => {
        if (!categoryName || !groupName) return [];
        const templatesInGroup = allTemplates.filter(t => 
            titleToSlug(t.category) === categoryName && 
            titleToSlug(t.group) === groupName
        );
        return [...new Set(templatesInGroup.map(t => t.type).filter(Boolean))];
    }, [allTemplates, categoryName, groupName]);
    // const filteredTemplates = useMemo(() => {
    //     if (!categoryName) return allTemplates;

    //     let filtered = allTemplates.filter(template => titleToSlug(template.category) === categoryName);

    //     if (groupName) {
    //         filtered = filtered.filter(template => titleToSlug(template.group) === groupName);
    //     }

    //     if (typeName) {
    //         filtered = filtered.filter(template => titleToSlug(template.type) === typeName);
    //     }

    //     return filtered;
    // }, [allTemplates, categoryName, groupName, typeName]);
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

    useEffect(() => {
        const fetchAllTemplates = async () => {
            setLoading(true);
            try {
                const response = await api.get('/invitation-templates?limit=1000');
                setAllTemplates(response.data.data || []);
            } catch (error) {
                console.error("Lỗi khi tải toàn bộ mẫu thiệp:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllTemplates();
    }, []);

    // [SỬA LỖI LOGIC] - Lấy ra các 'type' để làm bộ lọc, thay vì 'group'
    // const typesForCurrentCategory = useMemo(() => {
    //     if (!categoryName) return [];
    //     const templatesInCategory = allTemplates.filter(t => titleToSlug(t.category) === categoryName);
    //     // Trả về danh sách các 'type' duy nhất trong category hiện tại
    //     return [...new Set(templatesInCategory.map(t => t.type).filter(Boolean))];
    // }, [allTemplates, categoryName]);

    // Lọc template để hiển thị ra lưới dựa trên categoryName và typeName
    const filteredTemplates = useMemo(() => {
        if (!categoryName) return allTemplates;

        let filtered = allTemplates.filter(template => titleToSlug(template.category) === categoryName);

        if (groupName) {
            filtered = filtered.filter(template => titleToSlug(template.group) === groupName);
        }

        if (typeName) {
            filtered = filtered.filter(template => titleToSlug(template.type) === typeName);
        }

        return filtered;
    }, [allTemplates, categoryName, groupName, typeName]);

    return (
        <main className="invitation-page">
            <section className="hero-section">
                {invitationBanner ? (
                    invitationBanner.htmlContent ? (
                        <div dangerouslySetInnerHTML={{ __html: invitationBanner.htmlContent }} />
                    ) : (
                        <>
                            {invitationBanner.mediaType === 'video' && invitationBanner.videoUrl ? (
                                <video 
                                    src={invitationBanner.videoUrl} 
                                    autoPlay 
                                    loop 
                                    muted 
                                    playsInline 
                                    className="hero-video-background"
                                />
                            ) : (
                                <div 
                                    className="hero-image-background"
                                    style={{ backgroundImage: `url(${invitationBanner.imageUrl || 'https://pub-f720e3221ef5464a93d19bbdae2cfb86.r2.dev/default-banner.png'})` }}
                                />
                            )}
                            <div className="hero-content">
                                {invitationBanner.title && <h1 className="hero-title">{invitationBanner.title}</h1>}
                                {invitationBanner.subtitle && <p className="hero-subtitle">{invitationBanner.subtitle}</p>}
                            </div>
                        </>
                    )
                ) : (
                    <>
                        <div 
                            className="hero-image-background"
                            style={{ backgroundImage: `url('https://pub-f720e3221ef5464a93d19bbdae2cfb86.r2.dev/default-banner.png')` }}
                        />
                        <div className="hero-content">
                            <h1 className="hero-title">Tạo Lời Mời Hoàn Hảo</h1>
                            <p className="hero-subtitle">Chọn từ hàng trăm mẫu thiết kế chuyên nghiệp của chúng tôi</p>
                        </div>
                    </>
                )}
            </section>

            <div className="container">
                <div className="section-container">
                    {/* [SỬA LỖI HIỂN THỊ] - Filter giờ sẽ hiển thị các 'type' */}
                    {groupsForCurrentCategory.length > 0 && (
                        <div className="invitation-type-filters" ref={filtersRef} style={{ marginBottom: typeName || groupName ? '10px' : '30px' }}>
                            <button
                                className={`category-button-pro ${!groupName ? 'active' : ''}`}
                                onClick={() => navigate(`/invitations/category/${categoryName}`)}
                            >
                                Tất cả chủ đề
                            </button>
                            {groupsForCurrentCategory.map(group => {
                                const gSlug = titleToSlug(group);
                                return (
                                    <button
                                        key={group}
                                        className={`category-button-pro ${groupName === gSlug ? 'active' : ''}`}
                                        onClick={() => navigate(`/invitations/category/${categoryName}/group/${gSlug}`)}
                                    >
                                        {group}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* FILTER CHO TYPE (Cấp 3 - Chỉ hiện khi đã chọn Group) */}
                    {groupName && typesForCurrentGroup.length > 0 && (
                        <div className="invitation-type-filters" style={{ marginBottom: '30px' }}>
                            <button
                                className={`category-button-pro sub-filter ${!typeName ? 'active' : ''}`}
                                onClick={() => navigate(`/invitations/category/${categoryName}/group/${groupName}`)}
                            >
                                Tất cả loại
                            </button>
                            {typesForCurrentGroup.map(type => {
                                const tSlug = titleToSlug(type);
                                return (
                                    <button
                                        key={type}
                                        className={`category-button-pro sub-filter ${typeName === tSlug ? 'active' : ''}`}
                                        onClick={() => navigate(`/invitations/category/${categoryName}/group/${groupName}/type/${tSlug}`)}
                                    >
                                        {type}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Vị trí quảng cáo: Ngay dưới bộ lọc */}
                    {/* <div className="ads-container">
                        <div className="placeholder-ad">Vị trí đặt quảng cáo (970x250)</div> */}
                        {/*
                        Hãy thay thế đoạn mã trên bằng mã AdSense thực tế của bạn khi đã có tài khoản:
                        <ins className="adsbygoogle"
                             style={{ display: 'block' }}
                             data-ad-client="ca-pub-1234567890123456"
                             data-ad-slot="1234567890"
                             data-ad-format="auto"
                             data-full-width-responsive="true"></ins>
                        */}
                    {/* </div> */}

                    <div className="invitation-grid">
                        {loading ? (
                            // Render 8-12 thẻ skeleton card
                            Array.from({ length: 12 }).map((_, index) => (
                                <div key={index} className="invitation-card-item">
                                    <div className="invitation-card-image-wrapper">
                                        <Skeleton type="rect" height="100%" />
                                    </div>
                                    <div style={{ marginTop: '10px' }}>
                                        <Skeleton type="text" width="80%" />
                                    </div>
                                </div>
                            ))
                        ) : filteredTemplates.length > 0 ? (
                            filteredTemplates.map((item) => (
                                <InvitationCard
                                    key={item._id}
                                    id={item._id}
                                    title={item.title}
                                    imgSrc={item.imgSrc}
                                />
                            ))
                        ) : (
                            <div className="grid-message">Chưa có mẫu thiệp nào trong danh mục này.</div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default InvitationPageContent;