import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from "../../../../services/api";
import { toast } from 'react-toastify';
import { useSettings } from '../../../../Context/SettingsContext';
import SEO from '../../../../Features/SEO';
import "./ProductPageContent.css"
import UniversalBanner from '../../../../Components/UniversalBanner/UniversalBanner';

// === COMPONENT CSS (Giữ nguyên của bạn) ===
const ComponentCSS = () => (
    <style>{`
        /* ----- CÀI ĐẶT CƠ BẢN ----- */
        .products-page-container * {
        box-sizing: border-box;
        font-family: var(--font-primary);
    }
    .products-page-container {
        background-color: var(--color-background);
        color: var(--color-text-dark);
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-bottom: 120px;
    }
    .products-page-container .container {
        width: 100%;
        max-width: 1520px;
        margin: 0 auto;
        padding: 0 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
    }

    /* ----- HERO SECTION ----- */
    .products-hero {
        width: 100%;
        height: 550px;
        background-color: var(--color-placeholder);
        background-size: cover;
        background-position: center;
    }

    /* ----- BỘ LỌC DANH MỤC ----- */
    .invitation-type-filters {
        display: flex;
        justify-content: center;
        gap: 20px;
        margin-top: 25px;
        width: 100%;
        overflow-x: auto;
        white-space: nowrap;
        padding-bottom: 10px;
    }
    .invitation-type-filters::-webkit-scrollbar {
        height: 6px;
    }
    .invitation-type-filters::-webkit-scrollbar-track {
        background: var(--color-background-light);
    }
    .invitation-type-filters::-webkit-scrollbar-thumb {
        background: var(--color-secondary);
    }
    .invitation-type-filters::-webkit-scrollbar-thumb:hover {
        background: var(--color-primary);
    }
    .category-button-pro {
        border: 0.5px solid var(--color-text-dark);
        background: transparent;
        height: 40px;
        padding: 0 24px;
        font-size: 16px;
        font-weight: 500;
        text-transform: uppercase;
        cursor: pointer;
        border-radius: 2px;
        transition: all 0.3s;
        flex-shrink: 0;
    }
    .category-button-pro.active, .category-button-pro:hover {
        background-color: var(--color-primary);
        color: var(--color-text-white);
        border-color: var(--color-primary);
    }

    /* ----- LƯỚI SẢN PHẨM ----- */
    .products-grid-wrapper {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 40px;
    }
    .products-grid {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 60px 20px;
        transition: opacity 0.5s ease-in-out;
    }

    .products-grid.fade-out {
        opacity: 0;
    }
    .products-grid.fade-in {
        opacity: 1;
    }

    /* ----- THẺ SẢN PHẨM ----- */
    .product-card-new {
        display: flex;
        flex-direction: column;
        gap: 20px;
        cursor: pointer;
    }
    .product-card-new .image-placeholder {
        width: 100%;
        padding-top: 100%;
        background-color: var(--color-placeholder);
        position: relative;
        overflow: hidden;
    }
    .product-card-new .image-placeholder img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }
    .product-card-new:hover .image-placeholder img {
        transform: scale(1.05);
    }
    .product-card-new .info {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        text-align: center;
    }
    .product-card-new .title {
        font-size: 16px;
        font-weight: 600;
        line-height: 1.3;
        color: var(--color-primary);
        text-transform: uppercase;
        letter-spacing: 0.02em;
    }
    .product-card-new .icon {
        width: 20px;
        height: 17px;
    }

    /* ----- THÔNG BÁO ----- */
    .grid-message {
        grid-column: 1 / -1;
        padding: 80px 20px;
        text-align: center;
        font-size: 18px;
        color: var(--color-text-light);
    }

    /* ----- RESPONSIVE ----- */
    @media (max-width: 1200px) {
        .products-grid {
            grid-template-columns: repeat(3, 1fr);
        }
    }
    @media (max-width: 768px) {
        .products-page-container { gap: 60px; padding-bottom: 60px; }
        .products-hero { height: 400px; }
        .products-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 40px 20px;
        }
        .invitation-type-filters {
            justify-content: flex-start;
        }
    }
    @media (max-width: 480px) {
        .products-grid {
            grid-template-columns: 1fr;
            gap: 40px;
        }
    }
    `}</style>
);

// ----- COMPONENT CON: THẺ SẢN PHẨM -----
const ProductCard = ({ id, title, imgSrc }) => {
    const navigate = useNavigate();
    const handleNavigate = () => navigate(`/product/${id}`);

    return (
        <div className="product-card-new" onClick={handleNavigate}>
            <div className="image-placeholder">
                <img src={imgSrc || 'https://placehold.co/365x365/e6e6e6/999?text=Image'} alt={title} />
            </div>
            <div className="info">
                <div className="title">{title}</div>
            </div>
        </div>
    );
};

// ----- COMPONENT CHÍNH: TRANG SẢN PHẨM -----
const ProductPageContent = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // 1. Thêm 'Tất cả' vào danh sách categories
    const categories = ['Tất cả', 'Shop - Service', 'Phụ kiện trang trí', 'Quà tặng', 'Tổ chức sự kiện'];

    // Đặt mặc định là 'Tất cả' thay vì 'Phụ kiện trang trí'
    const [activeCategory, setActiveCategory] = useState('Tất cả');

    const { settings } = useSettings();
    const banners = settings?.banners || [];
    const shopBanner = banners.find(b => b.displayPage === 'shop' && b.isEnabled) || banners.find(b => b.displayPage === 'all' && b.isEnabled);
    const productsSeo = settings?.seo?.pages?.products;

    useEffect(() => {
        const categoryFromUrl = searchParams.get('category');
        if (categoryFromUrl && categories.includes(categoryFromUrl)) {
            setActiveCategory(categoryFromUrl);
        } else {
            setSearchParams({ category: 'Tất cả' }, { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps 
    }, []);

    const handleCategoryHover = (category) => {
        if (category !== activeCategory) {
            setActiveCategory(category);
            setPage(1);
            setProducts([]);
            setHasMore(true);
            setSearchParams({ category }, { replace: true });
        }
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            setPage(prevPage => prevPage + 1);
        }
    };

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // 2. Chỉnh sửa logic Params
                const params = {
                    page: page,
                    limit: 4, // Thay đổi từ 8 xuống 4 theo yêu cầu
                };

                // Nếu không phải tab "Tất cả", mới truyền param category lên API
                if (activeCategory !== 'Tất cả') {
                    params.category = activeCategory;
                }

                const response = await api.get('/products', { params });
                const newProducts = response.data.data || [];

                setProducts(prev => page === 1 ? newProducts : [...prev, ...newProducts]);

                // Nếu API trả về số lượng đúng bằng limit (4), tức là khả năng cao vẫn còn SP để "Xem thêm"
                setHasMore(newProducts.length === params.limit);

            } catch (error) {
                toast.error('Không thể tải sản phẩm.');
                console.error("Lỗi khi tải sản phẩm:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [page, activeCategory, setSearchParams]);

    const renderShopBanner = () => {
        if (!shopBanner) {
            return (
                <div style={{ position: 'relative', width: '100%', display: 'flex' }}>
                    <img
                        src="https://pub-f720e3221ef5464a93d19bbdae2cfb86.r2.dev/default-banner.png"
                        alt="Hero Banner"
                        style={{ width: '100%', height: '100%', minHeight: '400px', objectFit: 'cover', display: 'block' }}
                    />
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 1 }}></div>
                    <div className="hero-content" style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        color: 'white', textShadow: '2px 2px 10px rgba(0,0,0,0.8)', textAlign: 'center', padding: '20px', zIndex: 2
                    }}>
                        <h1 className="hero-title" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 'bold', margin: '0 0 16px 0', lineHeight: '1.2', maxWidth: '90%' }}>Cửa hàng</h1>
                        <p className="hero-subtitle" style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', margin: 0, fontWeight: '500', maxWidth: '90%' }}>Khám phá các sản phẩm độc đáo của chúng tôi</p>
                    </div>
                </div>
            );
        }

        if (shopBanner.mediaType === 'html') {
            return <div dangerouslySetInnerHTML={{ __html: shopBanner.htmlContent }} style={{ width: '100%', height: '100%' }} />;
        }

        const bannerContent = (
            <div style={{ position: 'relative', width: '100%', display: 'flex' }}>
                {shopBanner.mediaType === 'video' && shopBanner.videoUrl ? (
                    <video src={shopBanner.videoUrl} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', minHeight: '400px', objectFit: 'cover', display: 'block' }} />
                ) : (
                    <img src={shopBanner.imageUrl || 'https://pub-f720e3221ef5464a93d19bbdae2cfb86.r2.dev/default-banner.png'} alt={shopBanner.title || "Banner"} style={{ width: '100%', height: '100%', minHeight: '400px', objectFit: 'cover', display: 'block' }} />
                )}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 1 }}></div>
                <div className="hero-content" style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    color: 'white', textShadow: '2px 2px 10px rgba(0,0,0,0.8)', textAlign: 'center', padding: '20px', zIndex: 2
                }}>
                    {shopBanner.title && <h1 className="hero-title" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 'bold', margin: '0 0 16px 0', lineHeight: '1.2', maxWidth: '90%' }}>{shopBanner.title}</h1>}
                    {shopBanner.subtitle && <p className="hero-subtitle" style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', margin: 0, fontWeight: '500', maxWidth: '90%' }}>{shopBanner.subtitle}</p>}
                </div>
            </div>
        );

        if (shopBanner.link) {
            const isExternal = shopBanner.link.startsWith('http');
            if (isExternal) {
                return <a href={shopBanner.link} target="_blank" rel="noopener noreferrer" className="hero-link-wrapper" style={{ display: 'block', width: '100%' }}>{bannerContent}</a>;
            }
            return <Link to={shopBanner.link} className="hero-link-wrapper" style={{ display: 'block', width: '100%' }}>{bannerContent}</Link>;
        }

        return bannerContent;
    };
    return (
        <div className="products-page-container">
            <SEO
                title={productsSeo?.title || "Sản phẩm & Dịch vụ | iCards.com.vn"}
                description={productsSeo?.description || "Khám phá các sản phẩm và dịch vụ hỗ trợ sự kiện của chúng tôi."}
                keywords={productsSeo?.keywords}
                url="/shop"
            />
            <ComponentCSS />
            <section className="page-hero-wrapper" style={{ width: '100%', overflow: 'hidden' }}>
                <UniversalBanner
                    banner={shopBanner}
                    defaultTitle="Cửa hàng"
                    defaultSubtitle="Khám phá các sản phẩm độc đáo của chúng tôi"
                />
            </section>
            <div className="container">
                <div className="invitation-type-filters">
                    {categories.map(item => (
                        <button
                            key={item}
                            className={`category-button-pro ${activeCategory === item ? 'active' : ''}`}
                            onMouseEnter={() => handleCategoryHover(item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                <div className="products-grid-wrapper">
                    <div className={`products-grid ${loading ? 'fade-out' : 'fade-in'}`}>
                        {loading && page === 1 ? (
                            <div className="grid-message">Đang tải sản phẩm...</div>
                        ) : products.length > 0 ? (
                            products.map((item) => (
                                <ProductCard
                                    key={item._id}
                                    id={item._id}
                                    title={item.title}
                                    imgSrc={item.imgSrc}
                                />
                            ))
                        ) : (
                            <div className="grid-message">Chưa có sản phẩm nào trong danh mục này.</div>
                        )}
                    </div>

                    {/* 3. Thay class load-more-btn thành category-button-pro để UI đồng bộ */}
                    {hasMore && !loading && (
                        <button
                            onClick={handleLoadMore}
                            className="category-button-pro"
                            disabled={loading}
                        >
                            {loading && page > 1 ? 'Đang tải...' : 'Xem thêm'}
                        </button>
                    )}
                    {loading && page > 1 && <div className="grid-message">Đang tải thêm...</div>}
                </div>
            </div>
        </div>
    );
};

export default ProductPageContent;