// src/Pages/CollectionPage/CollectionPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import SEO from '../../Features/SEO';
import Skeleton from '../../Components/Skeleton/Skeleton';
import '../HomePage/Components/Content/HomepageContent.css'; // Tái sử dụng CSS Grid của trang chủ
import './CollectionPage.css';

const InvitationCard = React.memo(({ _id, title, imgSrc }) => {
    const navigate = useNavigate();
    return (
        <div className="product-item" onClick={() => navigate(`/invitation/${_id}`)}>
            <div className="product-image-container">
                <img 
                    src={imgSrc || 'https://placehold.co/365x365/e6e6e6/999?text=Thiệp'} 
                    alt={title} 
                    className="product-image" 
                    loading="lazy"
                />
            </div>
            <div className="product-info">
                <h5 className="product-title">{title}</h5>
            </div>
        </div>
    );
});

const CollectionPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [collection, setCollection] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCollectionData = async () => {
            try {
                setLoading(true);
                // Gọi API public lấy chi tiết khối kèm danh sách thiệp đã populate dựa vào slug
                const response = await api.get(`/template-blocks/slug/${slug}`);
                if (response.data?.success) {
                    setCollection(response.data.data);
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu bộ sưu tập:", error);
                // Nếu không tìm thấy slug (404), điều hướng về trang danh sách chung
                navigate('/invitations');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchCollectionData();
        }
    }, [slug, navigate]);

    if (loading) {
        return (
            <div className="collection-page-container homepage-main">
                <div className="collection-header-skeleton" style={{ margin: '40px 0', textAlign: 'center' }}>
                    <Skeleton type="title" width="300px" height="40px" style={{ margin: '0 auto 15px' }} />
                    <Skeleton type="text" width="500px" height="20px" style={{ margin: '0 auto' }} />
                </div>
                <div className="product-grid">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="product-item">
                            <Skeleton type="rect" height="320px" style={{ borderRadius: '12px', marginBottom: '10px' }} />
                            <Skeleton type="text" width="90%" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const templates = collection?.templates || [];

    return (
        <>
            <SEO
                title={`${collection?.title || 'Bộ sưu tập thiệp'} | iCards.com.vn`}
                description={collection?.description || "Khám phá danh sách mẫu thiệp mời online thiết kế độc quyền chất lượng cao."}
                url={`/collection/${slug}`}
            />
            
            <div className="collection-page-container homepage-main">
                {/* Phần Header giới thiệu Khối */}
                <header className="collection-page-header">
                    <p className="collection-subtitle">BỘ SƯU TẬP ĐỘC QUYỀN</p>
                    <h1 className="collection-title">{collection?.title}</h1>
                    {collection?.description && (
                        <p className="collection-description">{collection.description}</p>
                    )}
                </header>

                {/* Grid danh sách thiệp thuộc khối */}
                <section className="section-products" style={{ marginTop: '20px' }}>
                    {templates.length > 0 ? (
                        <div className="product-grid">
                            {templates.map((invitation) => (
                                <InvitationCard
                                    key={invitation._id}
                                    _id={invitation._id}
                                    title={invitation.title}
                                    imgSrc={invitation.imgSrc}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-collection-message">
                            <p>Chưa có mẫu thiệp nào được thêm vào bộ sưu tập này.</p>
                            <button className="view-more-btn" onClick={() => navigate('/invitations')}>
                                KHÁM PHÁ CÁC MẪU KHÁC
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </>
    );
};

export default CollectionPage;