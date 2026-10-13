// src/components/ContentRenderer.js
import React, { useMemo } from 'react';
import BannerUniversalItem from './BannerUniversalItem';
// Import component hiển thị thẻ Sản phẩm của bạn (nếu có)
// import ProductCard from './ProductCard'; 

const ContentRenderer = ({ content, injectedBlocks }) => {
    const renderContentWithInjectedBlocks = useMemo(() => {
        if (!content) return null;
        
        // Tách nội dung bài viết thành các đoạn văn (dựa trên thẻ </p>)
        const paragraphs = content.split('</p>').filter(p => p.trim() !== '');

        return paragraphs.map((htmlString, index) => {
            const currentPosition = index + 1;
            
            // Tìm xem ở vị trí đoạn văn hiện tại có block nào cần chèn không
            const blockToInject = injectedBlocks?.find(
                block => Number(block.position) === currentPosition
            );

            return (
                <React.Fragment key={index}>
                    {/* Render lại nội dung HTML đã bị cắt mất thẻ </p> */}
                    <div 
                        className="tiptap-content-paragraph" 
                        dangerouslySetInnerHTML={{ __html: htmlString + '</p>' }} 
                    />
                    
                    {/* Chèn khối Injected Block (Banner hoặc Product) vào giữa */}
                    {blockToInject && (
                        <div className="injected-block-wrapper" style={{ margin: '2rem 0' }}>
                            {blockToInject.type === 'banner' ? (
                                <BannerUniversalItem data={blockToInject} />
                            ) : blockToInject.type === 'product' ? (
                                // Xử lý render cho loại 'product' ở đây
                                <div className="product-suggestion-block">
                                    {/* <ProductCard productId={blockToInject.productId} /> */}
                                </div>
                            ) : null}
                        </div>
                    )}
                </React.Fragment>
            );
        });
    }, [content, injectedBlocks]);

    return (
        <div className="content-renderer-container">
            {renderContentWithInjectedBlocks}
        </div>
    );
};

export default ContentRenderer;