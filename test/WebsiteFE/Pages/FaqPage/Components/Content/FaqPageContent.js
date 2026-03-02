// FE/Pages/FaqPage/Components/Content/FaqPageContent.js
import React, { useState, useEffect } from 'react';
import SEO from '../../../../Features/SEO';
import api from '../../../../services/api'; 

const FaqItem = ({ question, answer, isOpen, onToggle }) => {
    return (
        <div className={`faq-item ${isOpen ? 'open' : ''}`}>
            <button className="faq-question" onClick={onToggle}>
                <span>{question}</span>
                <span className="faq-icon">{isOpen ? '−' : '+'}</span>
            </button>
            <div className="faq-answer-wrapper">
                <div className="faq-answer" dangerouslySetInnerHTML={{ __html: answer.replace(/\n/g, '<br />') }}></div>
            </div>
        </div>
    );
};


const FaqPageContent = () => {
    // ++ THAY ĐỔI: State để lưu câu hỏi và trạng thái tải
    const [faqData, setFaqData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openIndex, setOpenIndex] = useState(null);

    // ++ MỚI: Fetch dữ liệu từ API
    useEffect(() => {
        const fetchFaqPage = async () => {
            try {
                const response = await api.get('/pages/faq'); // Gọi đến trang có slug 'faq'
                const pageContent = response.data.data.content;
                
                // Chuyển đổi cấu trúc [text, text, text, text] thành [{q, a}, {q, a}]
                const formattedFaqs = [];
                for (let i = 0; i < pageContent.length; i += 2) {
                    if (pageContent[i]?.type === 'text' && pageContent[i+1]?.type === 'text') {
                        formattedFaqs.push({
                            q: pageContent[i].content,
                            a: pageContent[i+1].content
                        });
                    }
                }
                setFaqData(formattedFaqs);
            } catch (error) {
                console.error("Không thể tải nội dung FAQ:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFaqPage();
    }, []);

    const handleToggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <>
            <SEO title="Câu hỏi thường gặp | iCards.com.vn" description="Giải đáp các thắc mắc thường gặp khi sử dụng dịch vụ của iCards." />
            <main className="faq-page-wrapper">
                <div className="container">
                    <header className="faq-header">
                        <h1>Bạn cần trợ giúp?</h1>
                        <p>Chúng tôi đã tổng hợp các câu hỏi thường gặp nhất để bạn tham khảo.</p>
                    </header>
                    <div className="faq-list">
                        {loading ? (
                            <p>Đang tải câu hỏi...</p>
                        ) : faqData.length > 0 ? (
                            faqData.map((item, index) => (
                                <FaqItem 
                                    key={index} 
                                    question={item.q} 
                                    answer={item.a} 
                                    isOpen={openIndex === index}
                                    onToggle={() => handleToggle(index)}
                                />
                            ))
                        ) : (
                            <p>Chưa có câu hỏi nào được tạo. Vui lòng tạo trang "faq" trong phần quản trị.</p>
                        )}
                    </div>
                    <div className="ads-container" style={{ textAlign: 'center', margin: '40px 0' }}>
                        <div className="placeholder-ad">Vị trí đặt quảng cáo (970x250)</div>
                        {/* <ins className="adsbygoogle"
                             style={{ display: 'block' }}
                             data-ad-client="ca-pub-1234567890123456"
                             data-ad-slot="1234567890"
                             data-ad-format="auto"
                             data-full-width-responsive="true"></ins> */}
                    </div>
                </div>
            </main>
            {/* ++ THÊM MỚI: CSS cho phong cách minimalism */}
            <style>{`
                .faq-page-wrapper { padding: 80px 0; background-color: #f9fafb; }
                .faq-page-wrapper .container { max-width: 900px; margin: 0 auto; padding: 0 20px; }
                .faq-header { text-align: center; margin-bottom: 50px; }
                .faq-header h1 { font-family: 'Playfair Display', serif; font-size: 2.8rem; color: #1a1a1a; margin-bottom: 0.5rem; }
                .faq-header p { font-size: 1.1rem; color: #666; }
                .faq-list { border-top: 1px solid #e5e7eb; }
                .faq-item { border-bottom: 1px solid #e5e7eb; }
                .faq-question { width: 100%; text-align: left; padding: 24px 8px; font-size: 1.1rem; font-weight: 600; display: flex; justify-content: space-between; align-items: center; color: #111827; transition: background-color 0.2s ease; }
                .faq-question:hover { background-color: #f3f4f6; }
                .faq-icon { font-size: 1.5rem; color: #9ca3af; font-weight: 300; }
                .faq-answer-wrapper { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.4s ease-in-out; }
                .faq-item.open .faq-answer-wrapper { grid-template-rows: 1fr; }
                .faq-answer { overflow: hidden; padding: 0 8px 24px 8px; line-height: 1.8; color: #4b5563; font-size: 1rem; }
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
        </>
    );
};

export default FaqPageContent;