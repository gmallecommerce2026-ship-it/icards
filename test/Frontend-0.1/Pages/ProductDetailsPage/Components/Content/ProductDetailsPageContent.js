import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../../services/api';
import SEO from '../../../../Features/SEO'; // ++ Thêm import

// ----- COMPONENT CHỨA TOÀN BỘ CSS -----
const Styles = () => (
  <style>{`
    /* ... (CSS không đổi) ... */
     /* ----- BIẾN CSS & STYLES CƠ BẢN ----- */
     :root {
      --font-primary: 'Be Vietnam Pro', 'SVN-Gilroy', sans-serif;
      --color-primary: #27548A;
      --color-secondary: #CDD7E5;
      --color-text-dark: #333;
      --color-text-light: #666;
      --color-background: #FFFFFF;
      --color-background-light: #F8F9FA;
      --color-border: #E0E0E0;
      --color-price: #FF0000;
      --shadow-soft: 0 4px 12px rgba(0, 0, 0, 0.08);
      --shadow-medium: 0 8px 24px rgba(0, 0, 0, 0.1);
      --border-radius: 12px;
    }

    /* ----- CẤU TRÚC CHUNG ----- */
    .page-content-wrapper { margin: 0 auto; overflow-x: hidden; }
    .container { width: 100%; max-width: 1200px; margin-left: auto; margin-right: auto; padding: 0 30px; }
    .section-container { padding: 80px 0; }
    .section-header { text-align: center; max-width: 800px; margin: 0 auto 40px auto; }
    .section-header h2 { font-size: 32px; color: var(--color-primary); text-transform: uppercase; font-weight: 700; }
    .section-header p { font-size: 16px; margin-top: 8px; }

    /* ----- PRODUCT DETAIL LAYOUT ----- */
    .product-detail-layout {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 60px;
        align-items: flex-start;
    }

    /* ----- Product Gallery ----- */
    .product-gallery .main-image img {
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-medium);
        width: 100%;
    }
    .product-thumbnails {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin-top: 16px;
    }
    .product-thumbnails .thumb-item img {
        border-radius: var(--border-radius);
        cursor: pointer;
        opacity: 0.7;
        transition: all 0.3s ease;
        border: 2px solid transparent;
    }
    .product-thumbnails .thumb-item.active img,
    .product-thumbnails .thumb-item:hover img {
        opacity: 1;
        border-color: var(--color-primary);
    }
    
    /* ----- Product Info ----- */
    .product-info h1 {
        font-size: 36px;
        font-weight: 700;
        color: var(--color-primary);
        text-transform: uppercase;
        line-height: 1.2;
    }
    .product-meta {
        display: flex;
        gap: 24px;
        color: var(--color-text-light);
        margin: 16px 0;
        font-size: 15px;
    }
    .product-price .price-label {
        font-size: 16px;
        font-weight: 500;
        color: var(--color-text-light);
    }
    .product-price .price-value {
        font-size: 28px;
        font-weight: 700;
        color: var(--color-price);
    }
    .quantity-selector {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 24px;
    }
    .quantity-selector label { font-weight: 600; }
    .quantity-input { display: flex; align-items: center; }
    .quantity-btn {
        width: 32px; height: 32px; border: 1px solid var(--color-border); background: white; cursor: pointer; font-size: 20px;
    }
    .quantity-display {
        width: 50px; height: 32px; border: 1px solid var(--color-border); border-left: none; border-right: none; text-align: center; font-size: 16px;
    }
    
    .product-actions {
        margin-top: 30px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
    }
    .btn { padding: 16px; font-size: 16px; font-weight: 700; border-radius: var(--border-radius); cursor: pointer; transition: all 0.3s ease; text-transform: uppercase;}
    .btn-primary { background-color: var(--color-primary); color: white; border: none; }
    .btn-secondary { background-color: transparent; color: var(--color-primary); border: 2px solid var(--color-primary); }
    .btn-secondary:hover { background-color: var(--color-primary); color: white; }

    /* ----- Product Tabs ----- */
    .product-tabs { border-bottom: 1px solid var(--color-border); display: flex; gap: 32px; margin-bottom: 32px; }
    .tab-button { background: none; border: none; padding: 16px 0; font-size: 18px; font-weight: 600; cursor: pointer; color: var(--color-text-light); position: relative; }
    .tab-button::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 100%; height: 3px; background-color: var(--color-primary); transform: scaleX(0); transition: transform 0.3s ease; }
    .tab-button.active { color: white !important; }
    .tab-button.active::after { transform: scaleX(1); }
    .tab-content { line-height: 1.7; color: var(--color-text-dark); }
    .tab-content ul { list-style-type: '✓ '; padding-left: 20px; }
    .tab-content li { margin-bottom: 8px; }

    /* ----- Related Products ----- */
    .related-products-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 30px; }
    .related-product-card .card-image-wrapper { background-color: var(--color-background-light); border-radius: var(--border-radius); overflow: hidden; margin-bottom: 12px; }
    .related-product-card h5 { font-size: 16px; font-weight: 600; text-transform: uppercase; }
    .related-product-card .price { font-size: 18px; font-weight: 700; color: var(--color-price); margin-top: 8px; }
    
    /* ----- RESPONSIVE ----- */
    @media (max-width: 992px) {
        .product-detail-layout { grid-template-columns: 1fr; }
        .related-products-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 768px) {
        .section-header h2, .product-info h1 { font-size: 28px; }
        .product-actions { grid-template-columns: 1fr; }
        .related-products-grid { grid-template-columns: 1fr; }
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

// ----- CÁC COMPONENT CON -----
const SectionHeader = ({ title }) => (
  <div className="section-header">
    <h2>{title}</h2>
  </div>
);

const ProductCard = ({ id, title, price, imgSrc }) => {
  const navigate = useNavigate();
  const formatPrice = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  const handleNavigate = () => {
    if (id) {
      navigate(`/product/${id}`);
    }
  };

  return (
    <div className="related-product-card" onClick={handleNavigate} style={{ cursor: 'pointer' }}>
      <div className="card-image-wrapper">
        <img src={imgSrc} alt={title} />
      </div>
      <h5>{title}</h5>
      <p className="price">{formatPrice(price)}</p>
    </div>
  );
};

// ----- COMPONENT CHÍNH CỦA TRANG -----
const Content = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [mainImage, setMainImage] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('info');
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchProductDetails = async () => {
            if (!productId) return;
            try {
                setLoading(true);
                window.scrollTo(0, 0); // ++ Cuộn lên đầu trang khi đổi sản phẩm
                const res = await api.get(`/products/${productId}`);
                setProduct(res.data);
                if (res.data.images && res.data.images.length > 0) {
                    setMainImage(res.data.images[0]);
                } else if (res.data.imgSrc) { // ++ Fallback to imgSrc
                    setMainImage(res.data.imgSrc);
                }

                const relatedRes = await api.get(`/products?category=${res.data.category}&limit=4`);
                setRelatedProducts(relatedRes.data.data.filter(p => p._id !== productId));

            } catch (error) {
                console.error("Failed to fetch product details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProductDetails();
    }, [productId]);

    // ++ Tạo schema cho Dữ liệu có cấu trúc
    const productSchema = product ? {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.title,
        "image": product.images && product.images.length > 0 ? product.images : [product.imgSrc],
        "description": product.description,
        "sku": product._id,
        "offers": {
            "@type": "Offer",
            "url": window.location.href,
            "priceCurrency": "VND",
            "price": product.price,
            "availability": "https://schema.org/InStock", // Giả định sản phẩm luôn có sẵn
            "itemCondition": "https://schema.org/NewCondition"
        },
        "brand": {
            "@type": "Brand",
            "name": "iCards"
        }
    } : null;

    if (loading) {
        return <div>Đang tải sản phẩm...</div>;
    }

    if (!product) {
        return <div>Không tìm thấy sản phẩm.</div>;
    }

    return (
        <main className="page-content-wrapper">
            <Styles />
            {/* ++ Thêm SEO component với dữ liệu động */}
            <SEO
                title={`${product.title} - iCards.com.vn`}
                description={product.description.substring(0, 160)} // Cắt mô tả ngắn gọn cho meta tag
                imageUrl={mainImage}
                url={`/product/${productId}`}
                schema={productSchema}
            />
            <div className="container">
                <section className="section-container">
                    <div className="product-detail-layout">
                        <div className="product-gallery">
                            <div className="main-image">
                                <img src={mainImage} alt={product.title} />
                            </div>
                            <div className="product-thumbnails">
                                {product.images && product.images.map((thumb, index) => (
                                    <div
                                        key={index}
                                        className={`thumb-item ${mainImage === thumb ? 'active' : ''}`}
                                        onClick={() => setMainImage(thumb)}
                                    >
                                        <img src={thumb} alt={`Thumbnail ${index + 1} của ${product.title}`} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="product-info">
                            <h1>{product.title}</h1>
                            <div className="product-meta">
                                <span>Lượt xem: 13</span>
                                <span>Mã sản phẩm: {product._id.slice(-6)}</span>
                            </div>
                            <div className="product-price">
                                <span className="price-label">Giá: </span>
                                <span className="price-value">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</span>
                            </div>
                            <div className="quantity-selector">
                                <label htmlFor="quantity">Số lượng</label>
                                <div className="quantity-input">
                                    <button className="quantity-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                                    <span className="quantity-display">{quantity}</span>
                                    <button className="quantity-btn" onClick={() => setQuantity(q => q + 1)}>+</button>
                                </div>
                            </div>
                            <div className="product-actions">
                                <button className="btn btn-secondary">Thêm vào giỏ hàng</button>
                                <button className="btn btn-primary">Đặt hàng</button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="section-container">
                    <div className="product-tabs">
                        <button className={`tab-button ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
                            Thông tin sản phẩm
                        </button>
                         <button className={`tab-button ${activeTab === 'comments' ? 'active' : ''}`} onClick={() => setActiveTab('comments')}>
                            Bình luận
                        </button>
                    </div>
                    <div className="tab-content">
                        {activeTab === 'info' ? (
                            <div 
                                className="ck-content"
                                dangerouslySetInnerHTML={{ __html: product.description }} 
                            />
                        ) : (
                            <p>Hiện chưa có bình luận nào cho sản phẩm này.</p>
                        )}
                    </div>
                </section>


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

                <section className="section-container">
                    <SectionHeader title="Sản phẩm liên quan" />
                    <div className="related-products-grid">
                        {relatedProducts.map(p => (
                            <ProductCard 
                                key={p._id} 
                                id={p._id}
                                title={p.title}
                                price={p.price} 
                                imgSrc={p.images && p.images.length > 0 ? p.images[0] : p.imgSrc} 
                            />
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Content;
