import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './SearchResultsPage.css';

// --- Reusable ProductCard and InvitationCard Components ---

const ProductCard = ({ _id, title, imgSrc, price }) => {
    const navigate = useNavigate();
    const formatPrice = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    const handleNavigate = () => navigate(`/product/${_id}`);

    return (
        <div className="search-result-card product" onClick={handleNavigate}>
            <div className="card-image-wrapper">
                <img src={imgSrc || 'https://placehold.co/400x400/e0e0e0/757575?text=Image'} alt={title} />
            </div>
            <div className="card-info">
                <h5>{title}</h5>
                {price && <div className="price">{formatPrice(price)}</div>}
            </div>
        </div>
    );
};

const InvitationCard = ({ _id, title, imgSrc }) => {
    const navigate = useNavigate();
    const handleNavigate = () => navigate(`/invitation/${_id}`);

    return (
        <div className="search-result-card invitation" onClick={handleNavigate}>
            <div className="card-image-wrapper">
                <img src={imgSrc || 'https://placehold.co/400x500/e0e0e0/757575?text=Image'} alt={title} />
                 <div className="overlay">Xem chi tiết</div>
            </div>
            <div className="card-info">
                <h5>{title}</h5>
            </div>
        </div>
    );
};


const SearchResultsPage = () => {
    const { query } = useParams();
    const [products, setProducts] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return;

            setLoading(true);
            try {
                // Đảm bảo URL được xây dựng đúng cách
                const productUrl = `/products?search=${encodeURIComponent(query)}&limit=50`; // Thêm limit để không quá tải
                const invitationUrl = `/invitation-templates?search=${encodeURIComponent(query)}&limit=50`;

                console.log("Đang gọi API sản phẩm:", productUrl);
                console.log("Đang gọi API mẫu thiệp:", invitationUrl);

                // Gọi API song song
                const [productRes, invitationRes] = await Promise.all([
                    api.get(productUrl),
                    api.get(invitationUrl)
                ]);

                // Kiểm tra cấu trúc data trả về từ backend của bạn
                setProducts(productRes.data.data || []);
                setInvitations(invitationRes.data.data || []);

            } catch (error) {
                console.error("Lỗi khi gọi API tìm kiếm:", error);
                // Reset kết quả nếu có lỗi
                setProducts([]);
                setInvitations([]);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]); 

    return (
        <div className="search-results-page">
            <div className="container">
                <header className="search-header">
                    <h1>Kết quả tìm kiếm cho: "{query}"</h1>
                    <p>
                        Tìm thấy {products.length} sản phẩm và {invitations.length} mẫu thiệp.
                    </p>
                </header>

                {loading ? (
                    <div className="loading-message">Đang tải kết quả...</div>
                ) : (
                    <>
                        {invitations.length > 0 && (
                            <section className="results-section">
                                <h2>Mẫu thiệp</h2>
                                <div className="results-grid">
                                    {invitations.map(item => <InvitationCard key={item._id} {...item} />)}
                                </div>
                            </section>
                        )}

                        {products.length > 0 && (
                            <section className="results-section">
                                <h2>Sản phẩm</h2>
                                <div className="results-grid">
                                    {products.map(item => <ProductCard key={item._id} {...item} />)}
                                </div>
                            </section>
                        )}

                        {products.length === 0 && invitations.length === 0 && (
                            <div className="no-results-message">
                                Không tìm thấy kết quả nào phù hợp.
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SearchResultsPage;