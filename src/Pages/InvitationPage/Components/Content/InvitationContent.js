// src/Pages/InvitationPage/Components/Content/InvitationContent.js
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import api from '../../../../services/api';
import './InvitationContent.css';
import { useSettings } from '../../../../Context/SettingsContext';
import Skeleton from '../../../../Components/Skeleton/Skeleton';
import UniversalBanner from '../../../../Components/UniversalBanner/UniversalBanner';

// Card component to display each invitation
const InvitationCard = ({ id, title, imgSrc, forwardState }) => {
    const navigate = useNavigate();
    const handleClick = () => {
        if (forwardState) {
            // Nếu đang trong luồng tạo thiệp cảm ơn, đẩy state đi tiếp
            navigate(`/invitation/${id}`, { state: forwardState });
        } else {
            navigate(`/invitation/${id}`);
        }
    };

    return (
        <div className="invitation-card-item" onClick={handleClick}>
            <div className="invitation-card-image-wrapper">
                <img src={imgSrc} alt={title} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x500/EAEAEA/CCC?text=Image'; }} />
            </div>
            <p className="invitation-card-title">{title}</p>
        </div>
    );
};

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

// Hàm hỗ trợ map slug danh mục sang displayPage key của Banner
const getDisplayPageKey = (categorySlug) => {
    if (!categorySlug) return 'invitations'; // Mặc định là trang chung
    if (categorySlug.includes('chuc-mung')) return 'greetings';
    if (categorySlug.includes('cam-on')) return 'thanks';
    if (categorySlug.includes('thiep-moi')) return 'invitations';
    return 'others'; // Fallback cho các danh mục khác
};

// Hàm hỗ trợ lấy nội dung mặc định theo danh mục
const getDefaultBannerTexts = (categorySlug) => {
    if (!categorySlug || categorySlug.includes('thiep-moi')) {
        return { title: "Tạo Lời Mời Hoàn Hảo", subtitle: "Chọn từ hàng trăm mẫu thiết kế chuyên nghiệp của chúng tôi" };
    }
    if (categorySlug.includes('chuc-mung')) {
        return { title: "Thiệp Chúc Mừng Ý Nghĩa", subtitle: "Gửi gắm yêu thương qua từng thiết kế tinh tế" };
    }
    if (categorySlug.includes('cam-on')) {
        return { title: "Lời Cảm Ơn Chân Thành", subtitle: "Thiết kế thiệp cảm ơn độc đáo dành riêng cho bạn" };
    }
    return { title: "Khám Phá Các Mẫu Thiệp", subtitle: "Thiết kế ấn tượng, thao tác dễ dàng chỉ trong vài phút" };
};


// --- Main Page Component ---
const InvitationPageContent = () => {
    const { categoryName, groupName, typeName } = useParams();
    const navigate = useNavigate();
    const location = useLocation(); 
    const [allTemplates, setAllTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const { settings } = useSettings();
    const filtersRef = useRef(null);

    // Nhận diện luồng tạo thiệp cảm ơn
    const isCreatingThankYou = location.state?.purpose === 'create_thank_you';
    const returnUrl = location.state?.returnUrl;

    useEffect(() => {
        const filtersEl = filtersRef.current;
        if (!filtersEl) return;

        const handleWheelScroll = (e) => {
            if (filtersEl.scrollWidth <= filtersEl.clientWidth) {
                return;
            }
            const isAtStart = filtersEl.scrollLeft === 0;
            const isAtEnd = filtersEl.scrollLeft + filtersEl.clientWidth >= filtersEl.scrollWidth - 1;

            if ((e.deltaY > 0 && !isAtEnd) || (e.deltaY < 0 && !isAtStart)) {
                e.preventDefault();
                filtersEl.scrollLeft += e.deltaY;
            }
        };

        filtersEl.addEventListener('wheel', handleWheelScroll);
        return () => {
            filtersEl.removeEventListener('wheel', handleWheelScroll);
        };
    }, []);

    // ===== LOGIC CHỌN BANNER TỰ ĐỘNG =====
    const banners = settings?.banners || [];
    const displayPageKey = getDisplayPageKey(categoryName);
    const { title: defaultTitle, subtitle: defaultSubtitle } = getDefaultBannerTexts(categoryName);

    // Ưu tiên 1: Banner khớp với danh mục đang xem
    // Ưu tiên 2: Fallback về banner trang Thiệp Mời chung
    // Ưu tiên 3: Fallback về banner dùng cho tất cả (all)
    const invitationBanner = banners.find(b => b.displayPage === displayPageKey && b.isEnabled) 
                          || banners.find(b => b.displayPage === 'invitations' && b.isEnabled) 
                          || banners.find(b => b.displayPage === 'all' && b.isEnabled);
    // =====================================

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
            {isCreatingThankYou && (
                <div style={{
                    backgroundColor: '#e6f7ff',
                    padding: '12px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #91d5ff',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100
                }}>
                    <span style={{ color: '#0050b3', fontWeight: 500 }}>
                        Bạn đang chọn mẫu để tạo Thiệp Cảm Ơn.
                    </span>
                    <button
                        onClick={() => navigate(returnUrl || '/')}
                        style={{
                            border: '1px solid #1890ff',
                            background: 'white',
                            color: '#1890ff',
                            padding: '6px 16px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 500,
                            transition: 'all 0.3s'
                        }}
                    >
                        Hủy & Quay lại
                    </button>
                </div>
            )}

            <section className="page-hero-wrapper" style={{ width: '100%', overflow: 'hidden' }}>
                <UniversalBanner
                    banner={invitationBanner}
                    defaultTitle={defaultTitle}
                    defaultSubtitle={defaultSubtitle}
                />
            </section>

            <div className="container">
                <div className="section-container">
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

                    <div className="invitation-grid">
                        {loading ? (
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
                                    forwardState={location.state} 
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