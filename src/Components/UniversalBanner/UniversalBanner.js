// src/Components/UniversalBanner/UniversalBanner.js
import React from 'react';
import { Link } from 'react-router-dom';

const UniversalBanner = ({
    banner,
    variant = 'hero', // 'hero' (Banner to đầu trang) | 'secondary' (Banner chèn xen kẽ)
    defaultImg = 'https://pub-f720e3221ef5464a93d19bbdae2cfb86.r2.dev/default-banner.png',
    defaultTitle = '',
    defaultSubtitle = ''
}) => {
    // Nếu không có banner từ DB, ta tạo một banner giả dùng default data
    const activeBanner = banner || {};
    const isHero = variant === 'hero';

    // 1. Phân giải linh hoạt các trường dữ liệu từ Admin
    const finalTitle = activeBanner.title || defaultTitle;
    const finalSubtitle = activeBanner.subtitle || defaultSubtitle;
    const finalMediaUrl = activeBanner.mediaUrl || activeBanner.imageUrl || activeBanner.videoUrl || activeBanner.bannerImg || defaultImg;
    
    // Dữ liệu Link cho toàn bộ ảnh (Cũ)
    const wholeBannerLink = activeBanner.link || activeBanner.bannerLink;
    
    // Dữ liệu cho Nút Bấm (Mới)
    const buttonText = activeBanner.buttonText;
    const buttonLink = activeBanner.buttonLink;

    // 2. Cấu hình Style tùy theo vị trí hiển thị (Hero vs Secondary)
    const containerStyle = isHero
        ? {
            position: 'relative',
            width: '100vw',
            marginLeft: 'calc(-50vw + 50%)',
            display: 'block', 
            overflow: 'hidden'
        }
        : { display: 'flex', width: '100%', borderRadius: '12px', overflow: 'hidden', textAlign: 'left', position: 'relative', backgroundColor: '#f0f0f0', aspectRatio: '1520 / 634' };

    const mediaStyle = isHero
        ? { width: '100%', height: 'auto', objectFit: 'cover', display: 'block' }
        : { width: '100%', height: '100%', objectFit: 'cover', display: 'block' };

    const titleFontSize = isHero ? 'clamp(2rem, 5vw, 4rem)' : 'clamp(1.5rem, 4vw, 3rem)';
    const subtitleFontSize = isHero ? 'clamp(1.2rem, 3vw, 1.8rem)' : 'clamp(1rem, 2vw, 1.5rem)';

    // 3. Khối Render Nội Dung Cốt Lõi
    const renderContent = () => {
        if (activeBanner.mediaType === 'html' && activeBanner.htmlContent) {
            return <div dangerouslySetInnerHTML={{ __html: activeBanner.htmlContent }} style={{ width: '100%' }} />;
        }

        // Hàm render Nút Bấm
        const renderButton = () => {
            if (!buttonText || !buttonLink) return null;
            
            const btnStyle = {
                marginTop: '24px',
                pointerEvents: 'auto', // Đảm bảo nút click được
                backgroundColor: '#27548A', // Màu primary
                color: '#ffffff',
                border: 'none',
                padding: '12px 28px', // Thêm padding cho nút bấm đẹp hơn
                borderRadius: '5px',
                fontWeight: 'bold',
                textDecoration: 'none',
                display: 'inline-block'
            };

            const isExternalBtn = buttonLink.startsWith('http');
            if (isExternalBtn) {
                return (
                    <a href={buttonLink} target="_blank" rel="noopener noreferrer" className="btn" style={btnStyle}>
                        {buttonText}
                    </a>
                );
            }
            return (
                <Link to={buttonLink} className="btn" style={btnStyle}>
                    {buttonText}
                </Link>
            );
        };

        return (
            <div style={containerStyle}>
                {/* Lớp Media Nền */}
                {activeBanner.mediaType === 'video' || (finalMediaUrl && finalMediaUrl.match(/\.(mp4|webm)$/i)) ? (
                    <video src={finalMediaUrl} autoPlay loop muted playsInline style={mediaStyle} />
                ) : (
                    <img src={finalMediaUrl} alt={finalTitle || "Banner"} style={mediaStyle} />
                )}

                {/* Lớp phủ đen tạo độ sâu */}
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1 }}></div>

                {/* Khung Text phủ tràn lên trên ảnh */}
                {(finalTitle || finalSubtitle || buttonText) && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', flexDirection: 'column', 
                        alignItems: 'flex-start', /* ĐÃ SỬA: Căn các khối con sang trái */
                        justifyContent: 'center',
                        color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)', 
                        textAlign: 'left', /* ĐÃ SỬA: Căn chữ sang trái */
                        padding: '20px 10%', zIndex: 2,
                        pointerEvents: 'none' // Cho phép click xuyên qua thẻ div nền để rơi vào nút hoặc link tổng
                    }}>
                        {finalTitle && <h2 style={{ fontSize: titleFontSize, fontWeight: 'bold', margin: '0 0 16px 0', lineHeight: '1.2', maxWidth: '800px' }}>{finalTitle}</h2>}
                        {finalSubtitle && <p style={{ fontSize: subtitleFontSize, margin: 0, fontWeight: '500', maxWidth: '800px' }}>{finalSubtitle}</p>}
                        
                        {/* Gọi hàm render Nút bấm vào đây */}
                        {renderButton()}
                    </div>
                )}
            </div>
        );
    };

    // 4. Xử lý bọc Link toàn ảnh (Chỉ bọc nếu KHÔNG cấu hình Nút Bấm để tránh lỗi HTML)
    if (wholeBannerLink && !(buttonText && buttonLink)) {
        const isExternal = wholeBannerLink.startsWith('http');
        if (isExternal) {
            return <a href={wholeBannerLink} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', height: '100%', textDecoration: 'none' }}>{renderContent()}</a>;
        }
        return <Link to={wholeBannerLink} style={{ display: 'block', width: '100%', height: '100%', textDecoration: 'none' }}>{renderContent()}</Link>;
    }

    return renderContent();
};

export default UniversalBanner;