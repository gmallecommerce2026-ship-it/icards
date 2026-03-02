import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'; 
import api from "../../../../services/api";
import { toast } from 'react-toastify';
import { useSettings } from '../../../../Context/SettingsContext';
import SEO from '../../../../Features/SEO';
import "./ProductPageContent.css"
// === COMPONENT CSS (Đã bao gồm các chỉnh sửa giao diện) ===
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
        background-color: var(--color-placeholder); /* Màu nền giữ chỗ */
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
        background: var(--color-background-light); /* Thay thế #f1f1f1 */
    }
    .invitation-type-filters::-webkit-scrollbar-thumb {
        background: var(--color-secondary); /* Thay thế #CDD7E5 */
    }
    .invitation-type-filters::-webkit-scrollbar-thumb:hover {
        background: var(--color-primary); /* Thay thế #27548A */
    }
    .category-button-pro {
        border: 0.5px solid var(--color-text-dark); /* Thay thế #000 */
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
        background-color: var(--color-primary); /* Thay thế #27548A */
        color: var(--color-text-white); /* Thay thế #fff */
        border-color: var(--color-primary); /* Thay thế #27548A */
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
        background-color: var(--color-placeholder); /* SỬ DỤNG BIẾN MỚI */
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

    /* ----- NÚT XEM THÊM ----- */
    .load-more-btn {
        height: 40px;
        padding: 0 40px;
        border: 0.5px solid var(--color-border);
        font-size: 16px;
        font-weight: 500;
        text-transform: uppercase;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
    }
    .load-more-btn:hover {
        background-color: var(--color-primary);
        color: var(--color-text-white); /* Thay thế white */
        border-color: var(--color-primary);
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

    /* Styling cho các vị trí đặt quảng cáo */
    .ads-container {
        width: 100%;
        max-width: 1520px;
        margin: 40px auto;
        padding: 0 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 250px;
        text-align: center;
    }

    .placeholder-ad {
        width: 100%;
        max-width: 970px; /* Kích thước phổ biến của banner ngang */
        height: 250px; /* Chiều cao phổ biến của banner ngang */
        background-color: #f0f0f0;
        border: 2px dashed #ccc;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 16px;
        color: #888;
        text-align: center;
        line-height: 1.5;
        font-weight: 500;
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
    const [activeCategory, setActiveCategory] = useState('Phụ kiện trang trí'); // Sử dụng state cục bộ
    const { settings } = useSettings();
    const banners = settings?.banners || [];
    const shopBanner = banners.find(b => b.displayPage === 'shop' && b.isEnabled) || banners.find(b => b.displayPage === 'all' && b.isEnabled);
    
    const categories = ['Shop - Service', 'Phụ kiện trang trí', 'Quà tặng', 'Tổ chức sự kiện'];
    const productsSeo = settings?.seo?.pages?.products;

    // Khởi tạo activeCategory từ URL nếu có, nếu không thì dùng mặc định
    useEffect(() => {
        const categoryFromUrl = searchParams.get('category');
        if (categoryFromUrl && categories.includes(categoryFromUrl)) {
            setActiveCategory(categoryFromUrl);
        } else {
            // Nếu URL không có hoặc không hợp lệ, đặt lại URL
            setSearchParams({ category: activeCategory }, { replace: true });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps 
    }, []);

    const handleCategoryHover = (category) => {
        if (category !== activeCategory) {
            setActiveCategory(category);
            setPage(1); // Reset page khi đổi danh mục
            setProducts([]); // Xóa sản phẩm cũ để hiển thị fade-out
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
                const params = {
                    page: page,
                    limit: 8,
                    ...(activeCategory && { category: activeCategory })
                };
                const response = await api.get('/products', { params });
                const newProducts = response.data.data || [];
                
                setProducts(prev => page === 1 ? newProducts : [...prev, ...newProducts]);
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

    return (
        <div className="products-page-container">
            <SEO
                title={productsSeo?.title || "Sản phẩm & Dịch vụ | iCards.com.vn"}
                description={productsSeo?.description || "Khám phá các sản phẩm và dịch vụ hỗ trợ sự kiện của chúng tôi."}
                keywords={productsSeo?.keywords}
                url="/shop"
            />
            <ComponentCSS />
            <section className="hero-section">
                {shopBanner ? (
                    shopBanner.htmlContent ? (
                        <div dangerouslySetInnerHTML={{ __html: shopBanner.htmlContent }} />
                    ) : (
                        <>
                            {shopBanner.mediaType === 'video' && shopBanner.videoUrl ? (
                                <video 
                                    src={shopBanner.videoUrl} 
                                    autoPlay 
                                    loop 
                                    muted 
                                    playsInline 
                                    className="hero-video-background"
                                />
                            ) : (
                                <div 
                                    className="hero-image-background"
                                    style={{ backgroundImage: `url(${shopBanner.imageUrl || 'https://pub-f720e3221ef5464a93d19bbdae2cfb86.r2.dev/default-banner.png'})` }}
                                />
                            )}
                            <div className="hero-content">
                                {shopBanner.title && <h1 className="hero-title">{shopBanner.title}</h1>}
                                {shopBanner.subtitle && <p className="hero-subtitle">{shopBanner.subtitle}</p>}
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
                            <h1 className="hero-title">Cửa hàng</h1>
                            <p className="hero-subtitle">Khám phá các sản phẩm độc đáo của chúng tôi</p>
                        </div>
                    </>
                )}
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

                    {hasMore && !loading && (
                        <button onClick={handleLoadMore} className="load-more-btn" disabled={loading}>
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