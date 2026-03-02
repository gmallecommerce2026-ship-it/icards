import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../services/api';
import './TutorialPage.css';
import { useSettings } from '../../../../Context/SettingsContext';

// ----- CÁC COMPONENT CON (Giữ nguyên không đổi) -----

const SectionHeader = ({ title, subtitle, textAlign = 'center' }) => (
    <div className={`section-header-pro ${textAlign}`}>
        <h2 className="section-title-pro">{title}</h2>
        {subtitle && <p className="section-subtitle-pro">{subtitle}</p>}
    </div>
);

const FeatureCard = ({ iconSrc, title, description }) => (
    <div className="feature-card-pro">
        <div className="feature-icon-pro">
            <img src={`https://placehold.co/24x24/27548A/FFFFFF?text=${title.charAt(0)}`} alt={`${title} icon`} />
        </div>
        <div className="feature-content-pro">
            <h4>{title}</h4>
            <p>{description}</p>
        </div>
    </div>
);

const HowItWorksStep = ({ number, title }) => (
    <div className="print-process-step-pro">
        <div className="step-number-pro">{number}</div>
        <div className="step-title-pro">{title}</div>
    </div>
);

const FaqItem = ({ question, answer, isOpen, onClick }) => (
    <div className={`faq-item-pro ${isOpen ? 'open' : ''}`}>
        <div className="faq-question-pro" onClick={onClick}>
            <h4>{question}</h4>
            <svg className="faq-toggle-pro" width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L7 7L13 1" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
        {isOpen && (
            <div className="faq-answer-pro">
                <p>{answer}</p>
            </div>
        )}
    </div>
);

const TemplateCard = ({ id, title, imgSrc }) => {
    const navigate = useNavigate();
    const [isLiked, setIsLiked] = useState(false);

    const handleNavigate = () => navigate(`/invitation/${id}`);
    const handleLikeClick = (e) => {
        e.stopPropagation();
        setIsLiked(!isLiked);
    };

    return (
        <div className="template-card-pro" onClick={handleNavigate}>
            <div className="card-image-wrapper-pro">
                <img src={imgSrc || 'https://placehold.co/365x365/F5F5F5/333?text=Thiệp+Mẫu'} alt={title} />
            </div>
            <div className="card-info-pro">
                <h5>{title}</h5>
                <div className={`heart-icon-pro ${isLiked ? 'liked' : ''}`} onClick={handleLikeClick}>
                     <svg width="20" height="17" viewBox="0 0 20 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.3158 0.482422C13.8842 0.482422 12.0211 2.21053 11.0526 3.47368H10.9474C9.97895 2.21053 8.11579 0.482422 5.68421 0.482422C2.52632 0.482422 0 3.01895 0 6.16632C0 11.7558 11 17 11 17C11 17 22 11.7558 22 6.16632C22 3.01895 19.4737 0.482422 16.3158 0.482422Z"/>
                    </svg>
                </div>
            </div>
        </div>
    );
};

const CategoryShowcaseCard = ({ template }) => {
    const navigate = useNavigate();

    if (!template) {
        return null;
    }

    const categorySlug = template.category.replace(/\s+/g, '-').toLowerCase();

    const handleNavigate = () => {
        navigate(`/invitations/category/${categorySlug}`);
    };

    return (
        <div className="category-showcase-card">
            <div className="category-showcase-text">
                <h3>{template.category}</h3>
                <p>{template.description || `Những mẫu thiệp đẹp, chuyên nghiệp và cá nhân hóa.`}</p>
                <button onClick={handleNavigate}>{`Tạo ${template.category} online`}</button>
            </div>
            <div className="category-showcase-image">
                 <img src={template.imgSrc || 'https://placehold.co/160x160/e6e6e6/333?text=Image'} alt={template.category} />
            </div>
        </div>
    );
};

// --- [SỬA ĐỔI] --- Cập nhật component nút điều khiển để có thể vô hiệu hóa
const CarouselArrow = ({ direction, onClick, disabled }) => (
    <button className={`carousel-arrow ${direction}`} onClick={onClick} disabled={disabled}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d={direction === 'left' ? "M15 18L9 12L15 6" : "M9 18L15 12L9 6"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    </button>
);


// ----- COMPONENT CHÍNH CỦA TRANG -----
const Content = () => {
    const [allCategories, setAllCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('');
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openFaq, setOpenFaq] = useState(null);
    const [showcaseTemplates, setShowcaseTemplates] = useState([]);
    const { settings } = useSettings();

    // --- [THÊM MỚI] --- State cho carousel
    const [carouselIndex, setCarouselIndex] = useState(0);
    const bannerSecondaryUrl1 = settings?.banners?.professional_secondary_1?.imageUrl || "https://pub-f720e3221ef5464a93d19bbdae2cfb86.r2.dev/herotutorial.png";
    const banners = settings?.banners || [];
    const professionalBanner = banners.find(b => b.displayPage === 'professional' && b.isEnabled) || banners.find(b => b.displayPage === 'all' && b.isEnabled);
    
    const faqData = [
        { q: "Thiệp mời online là gì?", a: "Thiệp mời online là thiệp mời trên nền tảng số trực tuyến, thay vì được in ra giấy như các tấm thiệp mời truyền thống. Sau khi tạo thiệp mời online, bạn sẽ gửi tấm thiệp tới khách mời thông qua tin nhắn hoặc mạng xã hội như Facebook, Zalo,... Khi đó, khách mời chỉ cần có kết nối Internet là đã có thể xem được tấm thiệp mời của bạn." },
        { q: "Thiệp mời online và thiệp mời truyền thống khác nhau thế nào?", a: "Thiệp mời online và thiệp mời truyền thống có nhiều điểm khác biệt, chủ yếu ở hình thức, thiết kế, cách truyền tải thông tin đám cưới và cách gửi thiệp:\n\n1. Với thiệp mời truyền thống: Là thiệp in giấy, với những thiết kế phổ thông, khó thay đổi theo mong muốn cá nhân, chi phí in ấn cao, hình thức gửi thiệp là Tay Trao Tay cho khách mời. Với thời đại công nghệ hiện nay, đa phần mọi người bắt đầu sử dụng thiệp bán online, ví dụ như: Chụp hình thiệp truyền thống để gửi tin nhắn hoặc mạng xã hội cho khách mời, hoặc tự thiết kế rồi xuất thành hình ảnh rồi gửi online cho khách mời.\n\n2. Với thiệp mời online: Là thiệp bạn có thể tự mình thiết kế trên nền tảng thiết kế thiệp mời online, với đa dạng mẫu thiết kế, và cá nhân hoá thiệp mời theo những gì bạn thích. Không cần phải in ấn nên tiết kiệm chi phí. Có tính năng quản lý danh sách khách mời, và gửi thiệp mời cho từng khách bằng một liên kết online thông qua internet như tin nhắn, Facebook, Zalo,..." },
        { q: "Lợi ích của thiệp mời online là gì?", a: "Không đơn thuần là một tấm thiệp, thiệp mời online là một sự kết hợp hoàn hảo với nền tảng số.\n\nCá nhân hóa thiết kế, để sự kiện trở nên ấn tượng hơn. Tiết kiệm chi phí in ấn thiệp mời, góp phần bảo vệ môi trường. Quản lý thông tin khách mời dễ dàng và cho phép khách mời có thể xác nhận tham dự, giúp bạn kế hoạch cho sự kiện chu toàn hơn. Dễ dàng gửi thiệp mời qua Facebook, Zalo, SMS hoặc bằng mail thông qua internet cho tất cả khách mời." },
        { q: "Tôi có thể đặt in thiệp mời được không?", a: "Được, bạn có thể thiết kế thiệp mời, và trực tiếp đặt in trên nền tảng invitePro. Chúng tôi cung cấp dịch vụ In ấn chất lượng - Chuyển thiệp tận nơi. Chúng tôi giúp bạn biến những thiết kế của bạn thành những tấm thiệp mời hoàn chỉnh. Nếu chất lượng bản in không đúng cam kết, liên hệ với chúng tôi để được khắc phục, in lại hoặc hoàn tiền!.\n\nNgoài ra, bạn cũng có thể tải xuống bản thiết kế, sau đó có thể đặt in ở bất kỳ nhà in ấn thiệp mời nào mà bạn muốn." },
        { q: "Thời gian in và nhận thiệp bao lâu?", a: "Thời gian in và nhận thiệp sẽ tuỳ thuộc vào loại thiệp bạn chọn (giấy in, chi tiết trên thiệp, cách điệu thiệp, v.v) và địa điểm giao nhận thiệp. Thông thường bạn sẽ nhận được thiệp sau 7 -10 ngày đặt in. Trong trường hợp, bạn cần in thiệp gấp, vui lòng liên hệ admin để được hỗ trợ." }
    ];

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [showcaseResponse, allTemplatesResponse] = await Promise.all([
                    api.get('/invitation-templates?limit=10'), 
                    api.get('/invitation-templates?limit=1000')
                ]);
                
                const allTemplates = showcaseResponse.data.data || [];
                const uniqueCategories = [...new Set(allTemplates.map(t => t.category))];
                const showcase = uniqueCategories.map(category => {
                    return allTemplates.find(t => t.category === category);
                }).filter(Boolean); 
                
                setShowcaseTemplates(showcase);
                
                const allTemplatesData = allTemplatesResponse.data.data || [];
                const allUniqueCategoriesList = [...new Set(allTemplatesData.map(t => t.category).filter(Boolean))];
                setAllCategories(allUniqueCategoriesList);
                
                if (allUniqueCategoriesList.length > 0) {
                    setActiveCategory(allUniqueCategoriesList[0]);
                } else {
                     setLoading(false);
                }

            } catch (error) {
                console.error("Lỗi khi tải dữ liệu trang:", error);
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (!activeCategory) return;
        
        const fetchTemplatesByCategory = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/invitation-templates?category=${encodeURIComponent(activeCategory)}&limit=8`);
                setTemplates(response.data.data || []);
            } catch (error) {
                console.error("Lỗi khi tải mẫu thiệp:", error);
                setTemplates([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchTemplatesByCategory();
    }, [activeCategory]);
    
    // --- [THÊM MỚI] --- Logic điều khiển Carousel
    const ITEMS_PER_PAGE = 3;
    const totalPages = Math.ceil(showcaseTemplates.length / ITEMS_PER_PAGE);

    const handleCarouselScroll = (direction) => {
        if (direction === 'left') {
            setCarouselIndex(prev => Math.max(0, prev - 1));
        } else {
            setCarouselIndex(prev => Math.min(totalPages - 1, prev + 1));
        }
    };

    return (
        <div className="pro-page-wrapper">
            <section className="hero-section">
                {professionalBanner ? (
                    professionalBanner.htmlContent ? (
                        <div dangerouslySetInnerHTML={{ __html: professionalBanner.htmlContent }} />
                    ) : (
                        <>
                            {professionalBanner.mediaType === 'video' && professionalBanner.videoUrl ? (
                                <video 
                                    src={professionalBanner.videoUrl} 
                                    autoPlay 
                                    loop 
                                    muted 
                                    playsInline 
                                    className="hero-video-background"
                                />
                            ) : (
                                <div 
                                    className="hero-image-background"
                                    style={{ backgroundImage: `url(${professionalBanner.imageUrl || 'https://pub-f720e3221ef5464a93d19bbdae2cfb86.r2.dev/default-banner.png'})` }}
                                />
                            )}
                            <div className="hero-content">
                                {professionalBanner.title && <h1 className="hero-title">{professionalBanner.title}</h1>}
                                {professionalBanner.subtitle && <p className="hero-subtitle">{professionalBanner.subtitle}</p>}
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
                            <h1 className="hero-title">Chuyên nghiệp</h1>
                            <p className="hero-subtitle">Hướng dẫn chi tiết và các mẹo hữu ích</p>
                        </div>
                    </>
                )}
            </section>
            <main className="pro-page-content">
                <section className="features-pro-section">
                    <SectionHeader title="các tính năng thiệp mời pro" />
                    <div className="features-pro-grid">
                        <div className="feature-card-column">
                            <FeatureCard title="Trang thông tin cưới" description="Trang web thể hiện đầy đủ thông tin cần thiết cho đám cưới, bao gồm sự kiện cưới, thông tin dâu rể, chuyện tình yêu và album ảnh cưới. Lưu giữ kỷ niệm và chia sẻ với bạn bè, người thân." />
                            <FeatureCard title="Danh sách khách mời" description="Lên danh sách và quản lý thông tin khách mời giúp bạn dễ dàng xác định được số lượng người tham dự, tính toán chi phí phù hợp cho đám cưới của mình." />
                            <FeatureCard title="Kế hoạch cưới" description="Tạo và theo dõi công việc cho ngày trọng đại của bạn, đảm bảo mọi thứ theo kế hoạch, cho đám cưới của bạn được vẹn toàn." />
                        </div>
                        <img src="https://pub-f720e3221ef5464a93d19bbdae2cfb86.r2.dev/f1.png" alt="Tính năng thiệp mời" className="main-image-pro" />
                        <div className="feature-card-column">
                            <FeatureCard title="Ngân sách cưới" description="Lập kế hoạch tài chính chi tiết và quản lý chi tiêu một cách thông minh. Tối ưu hóa ngân sách và đảm bảo rằng bạn có thể tận hưởng ngày cưới mà không cần lo lắng về tài chính." />
                            <FeatureCard title="Thiệp cưới online" description="Tự tay thiết kế và gửi thiệp cưới online độc đáo. Với những mẫu thiệp chuyên nghiệp, bạn có thể gửi thiệp một cách dễ dàng và hiện đại, trong khi đó vẫn thể hiện sự trọn vẹn với khách mời của bạn." />
                            <FeatureCard title="Gửi lời chúc" description="Cho phép bạn bè gửi lời chúc mừng, và lưu giữ mãi mãi. Thật tuyệt vời nếu 10 năm, 20 năm sau bạn vẫn còn nhớ những ai và nói những lời ấm áp nhất của ngày trọng đại." />
                        </div>
                    </div>
                </section>
                
                {/* Vị trí quảng cáo: Giữa các tính năng và carousel thiệp mẫu */}
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
                {/* --- [SỬA ĐỔI] --- Cấu trúc Carousel mới --- */}
                <section className="category-showcase-section">
                     <SectionHeader 
                        title="Dễ dàng tạo thiệp mời từ vô vàn mẫu thiệp có sẵn"
                        subtitle="Những mẫu thiệp đẹp, chuyên nghiệp và cá nhân hoá, cho ngày trọng đại thêm nhiều ý nghĩa."
                     />
                     <div className="category-showcase-carousel-wrapper">
                        <CarouselArrow direction="left" onClick={() => handleCarouselScroll('left')} disabled={carouselIndex === 0} />
                        <div className="carousel-viewport">
                             <div 
                                className="category-showcase-grid-transform"
                                style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
                            >
                                {showcaseTemplates.map(template => (
                                    <CategoryShowcaseCard key={template._id} template={template} />
                                ))}
                            </div>
                        </div>
                        <CarouselArrow direction="right" onClick={() => handleCarouselScroll('right')} disabled={carouselIndex >= totalPages - 1} />
                     </div>
                </section>

                <section className="print-process-section-pro">
                    <div className="print-process-content-pro">
                        <SectionHeader title="In ấn chất lượng Chuyển thiệp tận nơi" subtitle="Chúng tôi giúp bạn biến những thiết kế của bạn thành những tấm thiệp mời hoàn chỉnh. Nếu chất lượng bản in không đúng cam kết, liên hệ với chúng tôi để được khắc phục, in lại hoặc hoàn tiền!" textAlign="left" />
                        <div className="print-process-steps-pro">
                            <HowItWorksStep number="1" title="Chọn mẫu thiệp" />
                            <HowItWorksStep number="2" title="Chỉnh sửa" />
                            <HowItWorksStep number="3" title="Đặt in" />
                            <HowItWorksStep number="4" title="Nhận thiệp" />
                        </div>
                        <p className="print-process-note-pro">Lưu ý: Thời gian nhận thiệp sẽ tuỳ thuộc vào địa điểm nhận hàng, thông thường mất 7 -10 ngày (bao gồm 2-3 ngày in), không bao gồm thời gian phát sinh khác</p>
                    </div>
                    <div className="print-process-image-pro">
                        <img src="https://pub-f720e3221ef5464a93d19bbdae2cfb86.r2.dev/f2.png" alt="Quy trình in ấn" />
                    </div>
                </section>

                <section className="download-section-pro">
                    <SectionHeader title="Tải xuống bản thiết kế của bạn" subtitle="Cho phép bạn tải xuống bản thiết kế thiệp mời của bạn, và bạn có thể đặt in bất kỳ nơi nào bạn muốn" />
                    <img src={bannerSecondaryUrl1} alt="Mẫu thiết kế thiệp" />
                    <p className="download-note-pro">Lưu ý: Chúng tôi không giải quyết các vấn đề in ấn ở địa điểm khác ngoài nhà cung cấp mà chúng tôi gợi ý.</p>
                </section>

                <section className="template-discovery-section">
                    <div className="related-categories-pro">
                        {allCategories.map(item => (
                            <button key={item} className={`category-button-pro ${activeCategory === item ? 'active' : ''}`} onClick={() => setActiveCategory(item)}>
                                {item}
                            </button>
                        ))}
                    </div>
                    <div className="template-showcase-grid-pro">
                        {loading && !templates.length ? <p>Đang tải...</p> : templates.map((template) => (
                            <TemplateCard key={template._id} id={template._id} title={template.title} imgSrc={template.imgSrc} />
                        ))}
                    </div>
                    <button className="view-more-btn-pro">XEM THÊM</button>
                </section>

                <section className="faq-section-pro">
                    <SectionHeader title="Có thể bạn chưa biết" />
                    <div className="faq-container-pro">
                        {faqData.map((faq, index) => (
                            <FaqItem 
                                key={index} 
                                question={faq.q} 
                                answer={faq.a} 
                                isOpen={openFaq === index} 
                                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                            />
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Content;
