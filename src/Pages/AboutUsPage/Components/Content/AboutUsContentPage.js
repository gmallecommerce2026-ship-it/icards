// train-data/FE/Pages/AboutUsPage/Components/Content/AboutUsContentPage.js
import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../../../../services/api';
import SEO from '../../../../Features/SEO';
import { showSuccessToast } from '../../../../Utils/toastHelper';
import { Helmet } from 'react-helmet';
import { Facebook, MessageCircle, Phone, Copy, Heart, X, ChevronLeft, ChevronRight, Calendar, Gift, ChevronDown, ExternalLink } from 'lucide-react';
import HTMLFlipBook from 'react-pageflip';
import "./AboutUsContentPage.css";
import { useSettings } from '../../../../Context/SettingsContext';
import { generateGoogleCalendarLink, generateOutlookCalendarLink, downloadIcsFile } from '../../../../Utils/calendar-links';
import "./customeditor.css"

const useSmoothParallax = (isOpen) => {
    useEffect(() => {
        if (!isOpen) return; // Chỉ chạy khi thiệp đã mở

        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.scrollY;
                    const windowHeight = window.innerHeight;

                    // 1. Parallax cho Banner (Cuộn chậm hơn trang)
                    document.querySelectorAll('.parallax-banner').forEach(el => {
                        const speed = parseFloat(el.dataset.speed || 0.4);
                        el.style.transform = `translate3d(0, ${scrolled * speed}px, 0)`;
                    });

                    // 2. Parallax cho Ảnh (Couple, Event) - Hiệu ứng ảnh trượt trong khung
                    document.querySelectorAll('.parallax-image').forEach(el => {
                        const rect = el.parentElement.getBoundingClientRect();
                        // Chỉ tính toán khi element nằm trong viewport
                        if (rect.top <= windowHeight && rect.bottom >= 0) {
                            const speed = parseFloat(el.dataset.speed || 0.15);
                            // Tính khoảng cách từ tâm màn hình đến thẻ
                            const yPos = (windowHeight / 2 - rect.top) * speed;
                            el.style.transform = `translate3d(0, ${yPos}px, 0) scale(1.15)`;
                        }
                    });

                    // 3. Parallax cho Decorative Elements (Hoa văn bay lơ lửng)
                    document.querySelectorAll('.parallax-float').forEach(el => {
                        const rect = el.closest('.section-container').getBoundingClientRect();
                        if (rect.top <= windowHeight && rect.bottom >= 0) {
                            const speed = parseFloat(el.dataset.speed || -0.2);
                            const yPos = (windowHeight - rect.top) * speed;
                            el.style.transform = `translate3d(0, ${yPos}px, 0)`;
                        }
                    });

                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        // Kích hoạt lần đầu
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [isOpen]);
};

const CustomHtmlSection = React.memo(({ content, title, titleStyle }) => {
    if (!content) return null;

    // Sử dụng dangerouslySetInnerHTML để render HTML thô từ editor.
    // Class "tiptap-content" (hoặc "tiptap-content1" như trong AdminFE) 
    // đảm bảo style đồng bộ với editor.
    return (
        <section className="section-container">
            <SectionHeader title={title || "Nội dung tùy chỉnh"} titleStyle={titleStyle} />
            <div 
                className="tiptap-content1" 
                dangerouslySetInnerHTML={{ __html: content }} 
            />
        </section>
    );
});

// ===================================================================
// ++ CÁC COMPONENT CON (GIỮ NGUYÊN) ++
// ===================================================================

const SectionHeader = React.memo(({ title, subtitle, decorative = true, titleStyle, subtitleStyle })  => {
    // Helper để chuyển đổi object style từ DB thành object mà Material-UI/React có thể dùng
    const createStyleObject = (styleData, defaultStyles = {}) => {
        if (!styleData) return defaultStyles;
        return {
            ...defaultStyles, // Áp dụng style mặc định trước
            fontFamily: styleData.fontFamily || defaultStyles.fontFamily,
            fontSize: styleData.fontSize ? `${styleData.fontSize}px` : defaultStyles.fontSize,
            color: styleData.color || defaultStyles.color,
            fontWeight: styleData.fontWeight || defaultStyles.fontWeight,
            fontStyle: styleData.fontStyle || defaultStyles.fontStyle,
            textDecoration: styleData.textDecoration || defaultStyles.textDecoration,
            textAlign: styleData.textAlign || defaultStyles.textAlign,
        };
    };

    return (
        <div className="modern-section-header">
            {decorative && (
                <div className="decorative-element parallax-float" data-speed="-0.15">
                      <svg width="200" height="50" viewBox="0 0 400 100" className="decorative-swirl" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M50 50 C 80 20, 120 20, 150 50" stroke="var(--color-accent)" strokeWidth="2" />
                          <path d="M350 50 C 320 20, 280 20, 250 50" stroke="var(--color-accent)" strokeWidth="2" />
                          <circle cx="200" cy="50" r="8" fill="var(--color-accent-light)" stroke="var(--color-accent)" strokeWidth="1.5"/>
                          <path d="M180 50 Q 190 35 200 25 Q 210 35 220 50" stroke="var(--color-accent)" strokeWidth="1.5" fill="none"/>
                          <path d="M185 58 Q 195 70 200 80 Q 205 70 215 58" stroke="var(--color-accent)" strokeWidth="1.5" fill="none"/>
                      </svg>
                </div>
            )}
            {/* Áp dụng style trực tiếp vào thẻ */}
            <h2 className="section-title" style={createStyleObject(titleStyle)}>{title}</h2>
            {subtitle && <p className="section-subtitle" style={createStyleObject(subtitleStyle)}>{subtitle}</p>}
        </div>
    );
});

const ParticipantsSection = React.memo(({ participants, title, titleStyle }) => {
    if (!participants || participants.length === 0) return null;

    return (
        <section className="section-container fade-in-up">
            <SectionHeader title={title || "Thành Viên Tham Gia"} titleStyle={titleStyle} />
            <div className="participants-grid">
                {participants.map((p) => (
                    <div key={p.id} className="participant-card">
                        <div className="participant-image-wrapper">
                            <img src={p.imageUrl} alt={p.title} className="participant-image" loading="lazy" />
                        </div>
                        <div className="participant-info">
                            <h3 className="participant-title">{p.title}</h3>
                            <p className="participant-content">{p.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
});
// ===================================================================
// ++ UPDATED: LOVE STORY TIMELINE (ALTERNATING ROWS & COLORS) ++
// ===================================================================
const LoveStoryTimeline = React.memo(({ stories, title, titleStyle }) => {
    // Giữ nguyên hiệu ứng cuộn Observer
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    entry.target.classList.add('animate');
                }
            });
        }, { threshold: 0.2, rootMargin: "0px 0px -50px 0px" });

        const items = document.querySelectorAll('.lovestory-color-row');
        items.forEach(item => observer.observe(item));

        return () => items.forEach(item => observer.unobserve(item));
    }, [stories]);

    if (!stories || stories.length === 0) return null;

    // Bảng màu Pastel xoay vòng cho các hàng (Bạn có thể đổi mã màu tùy ý)
    const rowColors = [
        '#FDF3F4', // Hồng nhạt
        '#F0F7F4', // Xanh mint nhạt
        '#FFF6E9', // Cam đào/Be nhạt
        '#F4F0F8', // Tím pastel
        '#EAF4F4'  // Xanh dương nhạt
    ];

    return (
        <section className="section-container" style={{ overflow: 'hidden' }}>
            <SectionHeader title={title || "Chuyện Tình Yêu"} titleStyle={titleStyle}/>
            
            <div className="lovestory-color-wrapper">
                {stories.map((story, index) => {
                    // Lấy màu nền tương ứng (nếu có hơn 5 sự kiện sẽ tự động quay lại màu đầu tiên)
                    const bgColor = rowColors[index % rowColors.length];
                    
                    // Xác định hàng chẵn/lẻ (Index 0 là hàng 1 -> Lẻ; Index 1 là hàng 2 -> Chẵn)
                    const isEvenRow = (index + 1) % 2 === 0;

                    return (
                        <div 
                            key={story.id || index} 
                            // Nếu là hàng chẵn, thêm class 'row-reverse' để đảo ngược layout
                            className={`lovestory-color-row ${isEvenRow ? 'row-reverse' : ''} fade-in-up`}
                            style={{ backgroundColor: bgColor }}
                        >
                            {/* Cột 1: Hình ảnh */}
                            <div className="lovestory-col-image">
                                {story.imageUrl ? (
                                    <img
                                        src={story.imageUrl}
                                        alt={story.title || "Kỷ niệm"}
                                        className="lovestory-circle-img parallax-image"
                                        data-speed="0.05"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="lovestory-circle-placeholder"></div>
                                )}
                            </div>

                            {/* Cột 2: Mốc thời gian (Luôn nằm ở giữa) */}
                            <div className="lovestory-col-time">
                                <div className="time-badge">{story.date}</div>
                            </div>

                            {/* Cột 3: Nội dung */}
                            <div className="lovestory-col-text">
                                <h3 className="lovestory-title">{story.title}</h3>
                                <p className="lovestory-desc">{story.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
});

const EventSchedule = React.memo(({ events, title, titleStyle }) => {
    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!events || events.length === 0) return null;
    
    const formatDate = (dateString, timeString) => {
        if (!dateString) return { date: 'Ngày chưa xác định', time: '' };
        const date = new Date(`${dateString}T${timeString || '00:00:00'}`);
        const formattedDate = new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric', month: '2-digit', day: '2-digit'
        }).format(date);
        const formattedTime = timeString ? new Intl.DateTimeFormat('vi-VN', {
            hour: '2-digit', minute: '2-digit'
        }).format(date) : '';
        return { date: formattedDate, time: formattedTime };
    };

    return (
        <section className="section-container fade-in-up">
            <SectionHeader title={title || "Sự Kiện Cưới"} titleStyle={titleStyle} />
            <div className="event-schedule-grid">
                {events.map((event) => {
                    const { date, time } = formatDate(event.date, event.time);
                    return (
                        <div key={event.id} className="event-card">
                            <div className="event-card-image-wrapper">
                                <img src={event.imageUrl || 'https://placehold.co/400x500/F2E8EB/5C5258?text=Event'} alt={event.title} loading="lazy" />
                            </div>
                            <div className="event-card-content">
                                <h3 className="event-card-title">{event.title}</h3>
                                <p className="event-card-time">{time} | {date}</p>
                                <p className="event-card-address">{event.address}</p>
                                <div className="event-card-actions">
                                    {event.mapUrl && <a href={event.mapUrl} target="_blank" rel="noopener noreferrer" className="event-btn map-btn"><ExternalLink size={14} /> Xem bản đồ</a>}
                                    <div className="calendar-menu-container">
                                        <button onClick={() => setOpenMenuId(openMenuId === event.id ? null : event.id)} className="event-btn calendar-btn">
                                            <Calendar size={14} /> Thêm vào lịch
                                        </button>
                                        {openMenuId === event.id && (
                                            <div className="calendar-dropdown" ref={menuRef}>
                                                <a href={generateGoogleCalendarLink(event)} target="_blank" rel="noopener noreferrer">Google Calendar</a>
                                                <a href={generateOutlookCalendarLink(event)} target="_blank" rel="noopener noreferrer">Outlook Calendar</a>
                                                <button onClick={() => downloadIcsFile(event)}>Apple Calendar</button>
                                                <button onClick={() => downloadIcsFile(event)}>Tải file .ics</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
});

const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};

const EventDescription = React.memo(({ description, style }) => {
    if (!description) return null;
    return (
        <div className="section-container event-description fade-in-up">
            <div className="content-wrapper-narrow">
                <p className="event-description-text" style={style}>
                    {description}
                </p>
            </div>
        </div>
    );
});

const EventVideo = React.memo(({ videoUrl, title, titleStyle }) => {
    const getEmbedUrl = useCallback((url) => {
        if (!url) return '';
        try {
            const urlObj = new URL(url);
            let videoId = urlObj.searchParams.get('v');
            if (!videoId && urlObj.hostname === 'youtu.be') {
                videoId = urlObj.pathname.slice(1);
            }
            if (videoId) return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
        } catch (e) { console.error("Invalid video URL", e); }
        return url;
    }, []);

    const embedUrl = getEmbedUrl(videoUrl);
    if (!embedUrl) return null;

    return (
        <section className="section-container modern-video-section fade-in-up">
             <SectionHeader title={title || "Video Kỷ Niệm"} titleStyle={titleStyle} />
             <div className="video-wrapper">
                 <div className="modern-video-container">
                     <iframe
                         src={embedUrl}
                         title="Video Kỷ Niệm"
                         frameBorder="0"
                         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                         allowFullScreen
                     ></iframe>
                 </div>
            </div>
        </section>
    );
});

const GiftSection = React.memo(({ qrCodes, title, titleStyle }) => {
    if (!qrCodes || qrCodes.length === 0) return null;
    return (
        <section className="section-container">
            <div className="modern-gift-section fade-in-up">
                <SectionHeader
                    title={title || "Gửi Quà Mừng"}
                    subtitle="Tình cảm của bạn là món quà quý giá nhất. Nếu bạn muốn gửi quà mừng, có thể sử dụng các mã QR dưới đây."
                    titleStyle={titleStyle}
                />
                <div className="modern-qr-container">
                    {qrCodes.map((qr, index) => (
                        <div key={index} className="modern-qr-item">
                            <img src={qr.url} alt={qr.title || `Mã QR mừng cưới ${index + 1}`} />
                            {qr.title && <p className="qr-code-title">{qr.title}</p>}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
});

const BannerCarousel = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToNext = useCallback(() => {
        setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    }, [images]);
    
    const goToPrevious = useCallback(() => {
        setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    }, [images]);


    useEffect(() => {
        if (images && images.length > 1) {
            const timer = setTimeout(goToNext, 5000);
            return () => clearTimeout(timer);
        }
    }, [currentIndex, images, goToNext]);


    if (!images || images.length === 0) return null;

    // --- SỬA LỖI TẠI ĐÂY ---
    // Cập nhật logic để lấy url từ cả 'preview' (khi đang edit/upload) và 'url' (khi lấy từ DB)
    const getImageUrl = (image) => {
        if (typeof image === 'string') return image;
        return image.url || image.preview || ''; 
    };
    // --- KẾT THÚC SỬA LỖI ---

    return (
        <div className="modern-banner">
            <div className="banner-slides-wrapper">
                {images.map((image, index) => (
                    <div
                        key={index}
                        className={`modern-slide ${index === currentIndex ? 'active' : ''}`}
                    >
                        <img src={getImageUrl(image)} alt={`Banner ${index + 1}`} className="modern-slide-image parallax-banner" data-speed="0.4" />
                        <div className="modern-slide-overlay"></div>
                    </div>
                ))}
            </div>

            {images.length > 1 && (
                <>
                    <button onClick={goToPrevious} className="modern-arrow prev">
                        <ChevronLeft size={24} />
                    </button>
                    <button onClick={goToNext} className="modern-arrow next">
                        <ChevronRight size={24} />
                    </button>
                    <div className="banner-indicators">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                className={`indicator ${index === currentIndex ? 'active' : ''}`}
                                onClick={() => setCurrentIndex(index)}
                            />
                        ))}
                    </div>
                </>
            )}

            <div className="modern-scroll-indicator">
                <span>Cuộn xuống</span>
                <ChevronDown size={24} />
            </div>
        </div>
    );
};


const wrapText = (context, text, maxWidth) => {
    if (!text) return [];
    const paragraphs = text.split('\n');
    let allLines = [];
    paragraphs.forEach(paragraph => {
        if (paragraph === '') { allLines.push(''); return; }
        let words = paragraph.split(' ');
        let currentLine = words[0] || '';
        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = context.measureText(currentLine + " " + word).width;
            if (width < maxWidth) { currentLine += " " + word; }
            else { allLines.push(currentLine); currentLine = word; }
        }
        allLines.push(currentLine);
    });
    return allLines;
};

const PageCanvas = React.memo(React.forwardRef((props, ref) => {
    const { page, originalWidth, guestDetails } = props;
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !page || !originalWidth) return;

        const { canvasWidth, canvasHeight, items, backgroundImage, backgroundColor } = page;
        const dpr = window.devicePixelRatio || 1;
        
        canvas.width = canvasWidth * dpr;
        canvas.height = canvasHeight * dpr;
        canvas.style.width = `${canvasWidth}px`;
        canvas.style.height = `${canvasHeight}px`;
        ctx.scale(dpr, dpr);

        const scale = originalWidth > 0 ? canvasWidth / originalWidth : 1;

        const renderAll = async () => {
            ctx.fillStyle = backgroundColor || '#FFFFFF';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            if (backgroundImage) {
                const bgImg = new Image();
                bgImg.crossOrigin = "anonymous";
                try {
                    await new Promise((resolve, reject) => {
                        bgImg.onload = resolve;
                        bgImg.onerror = reject;
                        bgImg.src = backgroundImage;
                    });
                    ctx.drawImage(bgImg, 0, 0, canvasWidth, canvasHeight);
                } catch (e) { console.error("Lỗi tải ảnh nền:", e); }
            }

            const sortedItems = [...(items || [])].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
            for (const item of sortedItems) {
                if (item.visible === false) continue;
                ctx.save();
                ctx.globalAlpha = item.opacity || 1;

                const scaledX = item.x * scale;
                const scaledY = item.y * scale;
                const scaledWidth = item.width * scale;
                const scaledHeight = item.height * scale;

                ctx.translate(scaledX + scaledWidth / 2, scaledY + scaledHeight / 2);
                ctx.rotate((item.rotation || 0) * Math.PI / 180);

                if (item.type === 'text' && item.content) {
                    const scaledFontSize = (item.fontSize || 16) * scale;
                    const fontFamily = item.fontFamily || 'Arial';
                    const fontStyle = item.fontStyle || 'normal';
                    const fontWeight = item.fontWeight || 'normal';
                    
                    ctx.font = `${fontStyle} ${fontWeight} ${scaledFontSize}px "${fontFamily}"`;
                    ctx.fillStyle = item.color || '#000000';
                    ctx.textAlign = item.textAlign || 'center';
                    ctx.textBaseline = 'middle';

                    const isGuestNameField = item.isGuestName === true;
                    
                    const guestName = guestDetails?.name || "Quý Khách Mời"; 

                    const textContent = isGuestNameField ? guestName : item.content;

                    const lines = wrapText(ctx, textContent, scaledWidth);
                    const lineHeight = scaledFontSize * 1.3;
                    const totalHeight = lines.length * lineHeight;
                    const startY = - (totalHeight / 2) + (lineHeight / 2);

                    lines.forEach((line, index) => {
                        const yPos = startY + (index * lineHeight);
                        let xPos = 0;
                        if (ctx.textAlign === 'left') {
                            xPos = -scaledWidth / 2;
                        } else if (ctx.textAlign === 'right') {
                            xPos = scaledWidth / 2;
                        }

                        ctx.fillText(line, xPos, yPos);

                        // Handle text-decoration: underline
                        if (item.textDecoration === 'underline') {
                            const metrics = ctx.measureText(line);
                            const textWidth = metrics.width;
                            let lineX;

                            if (ctx.textAlign === 'center') {
                                lineX = -textWidth / 2;
                            } else if (ctx.textAlign === 'left') {
                                lineX = xPos;
                            } else { // right
                                lineX = xPos - textWidth;
                            }
                            
                            const lineY = yPos + scaledFontSize / 2 + 2; // Position underline below the text baseline

                            ctx.save();
                            ctx.beginPath();
                            ctx.strokeStyle = item.color || '#000000';
                            ctx.lineWidth = Math.max(1, scaledFontSize / 15); // Make underline thickness proportional
                            ctx.moveTo(lineX, lineY);
                            ctx.lineTo(lineX + textWidth, lineY);
                            ctx.stroke();
                            ctx.restore();
                        }
                    });
                    // --- END: UPDATED CODE ---
                } else if (item.type === 'image' && item.url) {
                    const itemImg = new Image();
                    itemImg.crossOrigin = "anonymous";
                    try {
                        await new Promise((resolve, reject) => {
                            itemImg.onload = resolve; itemImg.onerror = reject;
                            itemImg.src = item.url;
                        });

                        // 1. Set clipping path (khung) dựa trên item.shape
                        ctx.beginPath();
                        if (item.shape === 'circle') {
                            // SỬA LỖI: Sử dụng ctx.ellipse để hỗ trợ hình oval khi scale non-uniform
                            const radiusX = scaledWidth / 2;
                            const radiusY = scaledHeight / 2;

                            if (ctx.ellipse) {
                                ctx.ellipse(
                                    0, // x center (đã translate)
                                    0, // y center (đã translate)
                                    radiusX, // radiusX
                                    radiusY, // radiusY
                                    0, // rotation
                                    0,
                                    Math.PI * 2
                                );
                            } else {
                                // Fallback cho browser không hỗ trợ ellipse (sử dụng hình tròn nhỏ hơn)
                                ctx.arc(
                                    0, // x center (đã translate)
                                    0, // y center (đã translate)
                                    Math.min(radiusX, radiusY), // bán kính
                                    0,
                                    Math.PI * 2
                                );
                            }
                        } else {
                            // Mặc định là hình chữ nhật
                            ctx.rect(-scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
                        }
                        ctx.closePath();
                        ctx.clip(); // Áp dụng clipping

                        // 2. Áp dụng filter (nếu có)
                        const filterString = `brightness(${item.brightness ?? 1}) contrast(${item.contrast ?? 1}) grayscale(${item.grayscale ?? 0})`;
                        ctx.filter = filterString;

                        // 3. Tính toán kích thước "object-fit: cover"
                        const frameRatio = scaledWidth / scaledHeight;
                        const imgRatio = itemImg.naturalWidth / itemImg.naturalHeight;
                        
                        let drawWidth, drawHeight;
                        if (imgRatio > frameRatio) {
                            // Ảnh rộng hơn khung
                            drawHeight = scaledHeight;
                            drawWidth = drawHeight * imgRatio;
                        } else {
                            // Ảnh cao hơn khung
                            drawWidth = scaledWidth;
                            drawHeight = drawWidth / imgRatio;
                        }

                        // 4. Lấy vị trí pan/scan (và nhân với scale của canvas)
                        const posX = (item.imagePosition?.x || 0) * scale;
                        const posY = (item.imagePosition?.y || 0) * scale;
                        
                        // 5. Tính toán vị trí vẽ (drawX, drawY)
                        // Căn giữa ảnh (đã "cover") sau đó áp dụng vị trí pan/scan
                        const drawX = (-scaledWidth / 2) - (drawWidth - scaledWidth) / 2 + posX;
                        const drawY = (-scaledHeight / 2) - (drawHeight - scaledHeight) / 2 + posY;

                        // 6. Vẽ ảnh đã được tính toán
                        ctx.drawImage(
                            itemImg,
                            drawX, 
                            drawY,
                            drawWidth,
                            drawHeight
                        );
                        

                    } catch (e) { console.error("Lỗi tải ảnh item:", e); }
                }
                ctx.restore();
            }
        };
        renderAll();
    }, [page, originalWidth, guestDetails]);

    return (
        <div className="page" ref={ref}>
            <div className="page-content">
                <canvas ref={canvasRef} className="modern-canvas" />
            </div>
        </div>
    );
}));


// ===================================================================
// ++ START: COMPONENT MODIFICATION ++
// ===================================================================
const InvitationCanvasDisplay = ({ pages, isFullscreen = false, guestDetails }) => {
    const flipBook = useRef(null);
    const containerRef = useRef(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1100);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const originalWidth = pages?.[0]?.canvasWidth || 500;
    const originalHeight = pages?.[0]?.canvasHeight || 700;

    // --- FIX: Logic to correctly calculate and maintain aspect ratio ---
    const updateDimensions = useCallback(() => {
        const mobile = window.innerWidth <= 1100;
        setIsMobile(mobile);

        let newWidth = 0;
        let newHeight = 0;

        // Guard against invalid original dimensions
        if (!originalWidth || !originalHeight) {
            setDimensions({ width: 0, height: 0 });
            return;
        }

        // The correct aspect ratio
        const ratio = originalWidth / originalHeight;

        if (isFullscreen) {
            const vh = window.innerHeight;
            const vw = window.innerWidth;
            const padding = mobile ? 20 : 60;
            const heightFactor = mobile ? 0.9 : 0.85;

            const availableWidth = vw - padding;
            const availableHeight = vh * heightFactor - padding;
            
            const effectiveOriginalWidth = mobile ? originalWidth : originalWidth * 2;

            const widthScale = availableWidth / effectiveOriginalWidth;
            const heightScale = availableHeight / originalHeight;
            
            const scale = Math.min(widthScale, heightScale);

            newWidth = originalWidth * scale;
            newHeight = originalHeight * scale;
        } else {
            // Simplified and corrected logic for preview mode
            const wrapper = containerRef.current?.parentElement;
            if (wrapper && wrapper.clientWidth > 0) {
                newWidth = wrapper.clientWidth;
                newHeight = newWidth / ratio; // Recalculate height based on the correct ratio
            } else {
                // Fallback dimensions, maintaining aspect ratio
                newWidth = 400; 
                newHeight = 400 / ratio;
            }
        }
        
        setDimensions({ width: Math.floor(newWidth), height: Math.floor(newHeight) });
    }, [originalWidth, originalHeight, isFullscreen]);
    // --- END: FIX ---

    // useLayoutEffect to prevent flicker on resize
    useLayoutEffect(() => {
        const debouncedUpdate = debounce(updateDimensions, 150);
        debouncedUpdate();
        window.addEventListener('resize', debouncedUpdate);
        return () => window.removeEventListener('resize', debouncedUpdate);
    }, [updateDimensions]);
    
    const onPage = useCallback((e) => setCurrentPage(e.data), []);
    const handleNext = useCallback(() => flipBook.current?.pageFlip().flipNext(), []);
    const handlePrev = useCallback(() => flipBook.current?.pageFlip().flipPrev(), []);

    if (!pages || pages.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-content">
                    <h2>Thiệp chưa có nội dung</h2>
                </div>
            </div>
        );
    }

    const { width: pageWidth, height: pageHeight } = dimensions;

    const getPageViewState = () => {
        if (!isFullscreen || isMobile) return 'single-page-view';
        if (pages.length <= 1) return 'single-page-view';
        if (currentPage === 0) return 'first-page-view';
        if (currentPage === pages.length - 1) return 'last-page-view';
        return 'double-page-view';
    };
    const pageStateClass = getPageViewState();
    
    const pageIndicatorText = isMobile 
        ? `${currentPage + 1} / ${pages.length}` 
        : `${currentPage === 0 || currentPage >= pages.length - 1 ? currentPage + 1 : `${currentPage}-${currentPage + 1}`} / ${pages.length}`;
    
    const getContainerStyle = () => {
        const style = {
            height: `${pageHeight}px`,
        };
        if (!isFullscreen) {
            style.width = `${pageWidth}px`;
        } else {
            style.width = isMobile ? `${pageWidth}px` : `${pageWidth * 2}px`;
        }
        return style;
    };

    return (
        <div className={`modern-canvas-wrapper ${isFullscreen ? 'fullscreen' : 'preview-mode'} fade-in-up`} ref={containerRef}>
            {pageWidth > 0 && pageHeight > 0 && (
                <>
                    <div
                        className={`flipbook-container ${pageStateClass}`}
                        style={getContainerStyle()}
                    >
                        <HTMLFlipBook
                            width={pageWidth} height={pageHeight} size="fixed"
                            minWidth={pageWidth} maxWidth={pageWidth} minHeight={pageHeight} maxHeight={pageHeight}
                            maxShadowOpacity={0.5} 
                            showCover={isFullscreen ? !isMobile : true}
                            mobileScrollSupport={true}
                            onFlip={onPage} ref={flipBook} className="invitation-flipbook"
                            startPage={isFullscreen ? currentPage : 0} 
                            flippingElements={isFullscreen ? ["all"] : []}
                            disableFlip={!isFullscreen}
                        >
                            {isFullscreen ? pages.map((page, index) => (
                                <PageCanvas 
                                    key={page.id || index} 
                                    page={{...page, canvasWidth: pageWidth, canvasHeight: pageHeight }} 
                                    originalWidth={originalWidth}
                                    guestDetails={guestDetails}
                                />
                            )) : (
                                <PageCanvas 
                                    key={pages[0].id || 0} 
                                    page={{...pages[0], canvasWidth: pageWidth, canvasHeight: pageHeight }} 
                                    originalWidth={originalWidth}
                                    guestDetails={guestDetails}
                                />
                            )}
                        </HTMLFlipBook>
                        
                    </div>
                    
                    {isFullscreen && (
                        <div className="navigation-controls" >
                            <button className={`modern-nav-btn prev ${currentPage === 0 ? 'disabled' : ''}`} onClick={handlePrev} disabled={currentPage === 0}>
                                <ChevronLeft size={20} />
                            </button>
                            <div className="page-indicator">
                                Trang {pageIndicatorText}
                            </div>
                            <button className={`modern-nav-btn next ${currentPage >= pages.length - 1 ? 'disabled' : ''}`} onClick={handleNext} disabled={currentPage >= pages.length - 1}>
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
// ===================================================================
// ++ END: COMPONENT MODIFICATION ++
// ===================================================================

const Countdown = ({ targetDate, title, titleStyle }) => {
    const calculateTimeLeft = useCallback(() => {
        const difference = +new Date(targetDate) - +new Date();
        if (difference <= 0) return null;
        return {
            Ngày: Math.floor(difference / (1000 * 60 * 60 * 24)),
            Giờ: Math.floor((difference / (1000 * 60 * 60)) % 24),
            Phút: Math.floor((difference / 1000 / 60) % 60),
            Giây: Math.floor((difference / 1000) % 60),
        };
    }, [targetDate]);

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        if (!timeLeft) return;
        const timer = setTimeout(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearTimeout(timer);
    });
    
    return (
        <section className="section-container">
            <SectionHeader title={title || "Sự kiện trọng đại sẽ diễn ra trong"} titleStyle={titleStyle} />
            {!timeLeft ? (
                 <div className="countdown-ended fade-in-up">
                     <span>Sự kiện đã diễn ra!</span>
                 </div>
            ) : (
                <div className="modern-countdown fade-in-up">
                    {Object.entries(timeLeft).map(([interval, value]) => (
                        <div key={interval} className="modern-countdown-item">
                            <div className="countdown-card">
                                <span className="countdown-value">{String(value).padStart(2, '0')}</span>
                                <span className="countdown-label">{interval}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};
const CoupleImageDisplay = ({ src, alt, position }) => {
    const x = position?.x || 0;
    const y = position?.y || 0;
    const scale = position?.scale || 1;

    return (
        <div 
            className="modern-couple-image" 
            style={{ 
                position: 'relative', 
                overflow: 'hidden', // Quan trọng: giấu phần ảnh thừa khi parallax
                padding: 0,
                display: 'block' 
            }}
        >
            <img
                src={src}
                alt={alt}
                className="parallax-image" // <-- Thêm class kích hoạt Parallax
                data-speed="0.15" // <-- Tốc độ trượt
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    // Sửa lại transform để dự phòng (hook sẽ overwrite translateY)
                    transform: `scale(${Math.max(scale, 1.15)}) translate(${x / scale}px, ${y / scale}px)`,
                    transformOrigin: 'center center',
                    willChange: 'transform',
                    transition: 'transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)' // Smooth movement
                }}
            />
        </div>
    );
};
const CoupleInfo = React.memo(({ settings }) => {
    const createStyleObject = (styleData, defaultSize = 16) => ({
        fontFamily: styleData?.fontFamily || 'var(--font-primary)',
        fontSize: `${styleData?.fontSize || defaultSize}px`,
        color: styleData?.color || 'var(--color-text-medium)',
        fontWeight: styleData?.fontWeight || 'normal',
        fontStyle: styleData?.fontStyle || 'normal',
        textDecoration: styleData?.textDecoration || 'none',
        textAlign: styleData?.textAlign || 'center',
    });

    const groomNameStyle = createStyleObject(settings.groomNameStyle, 32);
    const brideNameStyle = createStyleObject(settings.brideNameStyle, 32);
    const groomInfoStyle = createStyleObject(settings.groomInfoStyle);
    const brideInfoStyle = createStyleObject(settings.brideInfoStyle);

    return (
        <section className="section-container">
            <SectionHeader 
                title={settings.coupleTitle || "Cô Dâu & Chú Rể"} 
                subtitle={settings.coupleSubtitle || "... và hai trái tim cùng chung một nhịp đập ..."} 
                titleStyle={settings.coupleTitleStyle}
                subtitleStyle={settings.coupleSubtitleStyle}
            />
            <div className="modern-couple-container fade-in-up">
                {/* --- CHÚ RỂ --- */}
                <div className="modern-couple-card">
                    <div className="couple-image-wrapper">
                        {/* Sử dụng component hiển thị mới */}
                        <CoupleImageDisplay 
                            src={settings.groomImageUrl || 'https://placehold.co/300x300/F2E8EB/5C5258?text=CR'}
                            alt={settings.groomName}
                            position={settings.groomImagePosition} // Truyền tọa độ và scale
                        />
                    </div>
                    <div className="couple-content">
                        <h3 className="couple-name" style={groomNameStyle}>{settings.groomName || 'Chú rể'}</h3>
                        <p className="couple-info" style={groomInfoStyle}>{settings.groomInfo}</p>
                    </div>
                </div>

                <div className="modern-separator">
                    <div className="heart-wrapper">
                        {settings.coupleSeparatorImageUrl ? (
                            <img 
                                src={settings.coupleSeparatorImageUrl} 
                                alt="Separator" 
                                style={{ width: '40px', height: '40px', objectFit: 'contain' }} 
                            />
                        ) : (
                            <Heart size={40} style={{ color: 'var(--color-primary)' }} />
                        )}
                    </div>
                </div>

                {/* --- CÔ DÂU --- */}
                <div className="modern-couple-card">
                    <div className="couple-image-wrapper">
                        {/* Sử dụng component hiển thị mới */}
                        <CoupleImageDisplay 
                            src={settings.brideImageUrl || 'https://placehold.co/300x300/F2E8EB/5C5258?text=CD'}
                            alt={settings.brideName}
                            position={settings.brideImagePosition} // Truyền tọa độ và scale
                        />
                    </div>
                    <div className="couple-content">
                        <h3 className="couple-name" style={brideNameStyle}>{settings.brideName || 'Cô dâu'}</h3>
                        <p className="couple-info" style={brideInfoStyle}>{settings.brideInfo}</p>
                    </div>
                </div>
            </div>
        </section>
    )
});


// Component Gallery chính, sử dụng GalleryItem
const Gallery = React.memo(({ images, onImageClick, title, titleStyle }) => (
    <section className="section-container">
        <SectionHeader title={title || "Khoảnh Khắc Đáng Nhớ"} titleStyle={titleStyle} />
        <div className="modern-gallery fade-in-up">
            {images && images.map((src, index) => (
                <div key={index} className="modern-gallery-item" onClick={() => onImageClick(index)}>
                    <div className="gallery-image-wrapper">
                        <img src={src} alt={`Kỷ niệm ${index + 1}`} loading="lazy" />
                        <div className="gallery-overlay">
                            <span>Xem ảnh</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </section>
));

// END: MODIFICATION FOR MASONRY GALLERY


const LightboxModal = ({ images, startIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(startIndex);
    const goToPrevious = useCallback(() => setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1)), [images]);
    const goToNext = useCallback(() => setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0)), [images]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') goToNext();
            if (e.key === 'ArrowLeft') goToPrevious();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goToNext, goToPrevious, onClose]);

    if (!images || images.length === 0) return null;

    return (
        <div className="modern-lightbox" onClick={onClose}>
            <button className="modern-lightbox-close" onClick={onClose}><X size={24} /></button>
            <button className="modern-lightbox-nav lightbox-prev" onClick={e => { e.stopPropagation(); goToPrevious(); }}><ChevronLeft size={28} /></button>
            <div className="modern-lightbox-content" onClick={e => e.stopPropagation()}>
                <img src={images[currentIndex]} alt={`Hình ảnh ${currentIndex + 1}`} />
            </div>
            <button className="modern-lightbox-nav lightbox-next" onClick={e => { e.stopPropagation(); goToNext(); }}><ChevronRight size={28} /></button>
        </div>
    );
};

const RsvpSection = ({ resourceId, guestDetails }) => {
    const [showForm, setShowForm] = useState(false);
    const [status, setStatus] = useState(guestDetails?.status || 'pending');
    const [attendingCount, setAttendingCount] = useState(guestDetails?.attendingCount || 1);
    const [submitting, setSubmitting] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState({ text: '', type: '' });

    if (!guestDetails?._id) {
        return (
            <div className="modern-rsvp-notice">
                <p>Phần xác nhận tham dự sẽ hiển thị khi bạn truy cập từ đường dẫn được gửi trong thiệp mời.</p>
            </div>
        );
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFeedbackMessage({ text: '', type: '' });
        try {
            await api.put(`/invitations/${resourceId}/guests/${guestDetails._id}/rsvp`, { status, attendingCount: Number(attendingCount) });
            setFeedbackMessage({ text: 'Cảm ơn bạn đã gửi phản hồi!', type: 'success' });
        } catch (error) {
            console.error("Lỗi khi gửi phản hồi:", error);
            setFeedbackMessage({ text: 'Đã có lỗi xảy ra, vui lòng thử lại.', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    if ((guestDetails.status === 'attending' || guestDetails.status === 'declined') && !feedbackMessage.text) {
        return (
            <div className="modern-rsvp-confirmed">
                <div className="confirmed-content">
                    <span className="confirmed-icon">✓</span>
                    <p>Bạn đã xác nhận tham dự. Xin cảm ơn và hẹn gặp lại!</p>
                </div>
            </div>
        );
    }

    if (feedbackMessage.type === 'success') {
        return (
            <div className="modern-rsvp-success">
                <div className="success-content">
                    <span className="success-icon">✓</span>
                    <p>{feedbackMessage.text}</p>
                </div>
            </div>
        );
    }

    if (!showForm) {
        return (
            <div className="rsvp-trigger">
                <button onClick={() => setShowForm(true)} className="modern-btn-primary">Xác Nhận Tham Dự</button>
            </div>
        );
    }

    return (
        <form className="modern-rsvp-form" onSubmit={handleSubmit}>
            <div className="modern-form-group">
                <label htmlFor="attendanceStatus" className="form-label">Bạn sẽ tham gia chứ?</label>
                <select id="attendanceStatus" className="modern-form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="pending">Chưa xác định</option>
                    <option value="attending">Tôi sẽ tham gia</option>
                    <option value="declined">Tôi không tham gia được</option>
                </select>
            </div>

            {status === 'attending' && (
                <div className="modern-form-group">
                    <label htmlFor="attendanceCount" className="form-label">Số người tham dự (gồm cả bạn)</label>
                    <input id="attendanceCount" type="number" min="1" max="10" className="modern-form-input" value={attendingCount} onChange={(e) => setAttendingCount(e.target.value)} />
                </div>
            )}

            <button type="submit" className="modern-btn-primary submit-btn" disabled={submitting}>
                {submitting ? 'Đang gửi...' : 'Gửi phản hồi'}
            </button>

            {feedbackMessage.text && (
                <div className={`modern-feedback ${feedbackMessage.type}`}>
                    {feedbackMessage.text}
                </div>
            )}
        </form>
    );
};


// ===================================================================
// ++ COMPONENT CHÍNH CỦA TRANG ++
// ===================================================================

const WeddingInvitation = () => {
    const { id: resourceId } = useParams();
    const [searchParams] = useSearchParams();
    const guestId = searchParams.get('guestId');
    const { settings: globalSettings } = useSettings();
    const [invitationData, setInvitationData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [isRotating, setIsRotating] = useState(false);
    const [musicEmbedUrl, setMusicEmbedUrl] = useState('');
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxStartIndex, setLightboxStartIndex] = useState(0);
    const loveGiftsButton = invitationData?.template?.loveGiftsButton;
    const particleCanvasRef = useRef(null); 
    const [customFonts, setCustomFonts] = useState([]);
    const isPreview = searchParams.get('preview') === 'true'; 
    useSmoothParallax(isOpen);
    // ===================================================================
    // ++ START: STATE MỚI CHO OVERLAY ++
    // ===================================================================
    const [isFlipbookFullscreen, setIsFlipbookFullscreen] = useState(false);
    // ===================================================================
    // ++ END: STATE MỚI CHO OVERLAY ++
    // ===================================================================

    // ===================================================================
    // ++ LOGIC API (GIỮ NGUYÊN) ++
    // ===================================================================
    const getYoutubeEmbedUrl = useCallback((url) => {
        if (!url || typeof url !== 'string') return '';
        let videoId;
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname === 'youtu.be') videoId = urlObj.pathname.slice(1);
            else if (urlObj.hostname.includes('youtube.com')) videoId = urlObj.searchParams.get('v');
        } catch (e) { return ''; }
        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&autohide=1&modestbranding=1` : '';
    }, []);

    useEffect(() => {
        const fetchFonts = async () => {
            try {
                const response = await api.get('/fonts');
                setCustomFonts(response.data.data || []);
            } catch (err) {
                console.error("Không thể tải danh sách font:", err);
            }
        };
        fetchFonts();
    }, []);
    
    
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
    
            // 1. Check for preview data from editor in sessionStorage
            const previewDataString = sessionStorage.getItem('invitationPreviewData');
            if (previewDataString) {
                try {
                    const data = JSON.parse(previewDataString);
                    setInvitationData({
                        content: data.pages || [],
                        settings: data.invitationSettings || {},
                        guestDetails: { name: "Quý Khách Mời" },
                        template: { loveGiftsButton: {} }
                    });
                    sessionStorage.removeItem('invitationPreviewData');
                } catch (e) {
                    setError("Dữ liệu xem trước không hợp lệ.");
                } finally {
                    setLoading(false);
                }
                return;
            }
    
            // 2. If no sessionStorage, proceed with API call based on ID
            if (!resourceId) {
                setError("Không tìm thấy ID của thiệp mời.");
                setLoading(false);
                return;
            }
    
            try {
                let response;
                // If it's a preview link (from template details), fetch the TEMPLATE
                if (isPreview) {
                    response = await api.get(`/invitation-templates/${resourceId}`);
                    const template = response.data.data;
                    const formattedData = {
                        content: template.templateData?.pages || [],
                        settings: template.templateData?.settings || {},
                        guestDetails: { name: "Quý Khách Mời" },
                        template: { loveGiftsButton: template.loveGiftsButton || {} },
                        imgSrc: template.imgSrc
                    };
                    setInvitationData(formattedData);
                    const musicUrl = template.templateData?.settings?.musicUrl;
                    if (musicUrl) {
                        setMusicEmbedUrl(getYoutubeEmbedUrl(musicUrl));
                    }
                } else { // Otherwise, it's a real INVITATION
                    const queryString = guestId ? `?guestId=${guestId}` : '';
                    response = await api.get(`/invitations/public/${resourceId}${queryString}`);
                    setInvitationData(response.data.data);
                    const musicUrl = response.data.data?.settings?.musicUrl;
                    if (musicUrl) {
                        setMusicEmbedUrl(getYoutubeEmbedUrl(musicUrl));
                    }
                }
            } catch (err) {
                setError("Không tìm thấy thiệp mời.");
                console.error("Lỗi khi tải dữ liệu thiệp mời:", err);
            } finally {
                setLoading(false);
            }
        };
    
        loadData();
    }, [resourceId, guestId, getYoutubeEmbedUrl, isPreview]);


    // ===================================================================
    // ++ LOGIC HIỆU ỨNG HẠT BAY (MỚI) ++
    // ===================================================================
    useEffect(() => {
        const canvas = particleCanvasRef.current;
        if (!canvas || !isOpen) return;

        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationFrameId;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedY = Math.random() * 1 + 0.5;
                this.opacity = Math.random() * 0.5 + 0.2;
            }
            update() {
                this.y -= this.speedY;
                if (this.y < 0) {
                    this.y = canvas.height;
                    this.x = Math.random() * canvas.width;
                }
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(232, 184, 109, ${this.opacity})`;
                ctx.fill();
            }
        }

        const initParticles = () => {
            particles = [];
            const numberOfParticles = (canvas.width * canvas.height) / 9000;
            for (let i = 0; i < numberOfParticles; i++) {
                particles.push(new Particle());
            }
        };
        initParticles();

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isOpen]); // Chỉ chạy hiệu ứng khi thiệp đã mở



    // ===================================================================
    // ++ LOGIC GIAO DIỆN (GIỮ NGUYÊN VÀ TINH CHỈNH) ++
    // ===================================================================
    const handleOpen = useCallback(() => {
        if (isRotating || loading) return;
        setIsRotating(true);
        setTimeout(() => setIsOpen(true), 1200);
    }, [isRotating, loading]);

    const handleImageClick = useCallback((index) => {
        setLightboxStartIndex(index);
        setLightboxOpen(true);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        const elements = document.querySelectorAll('.fade-in-up');
        elements.forEach(el => observer.observe(el));
        return () => elements.forEach(el => observer.unobserve(el));
    }, [isOpen]);

    if (loading) {
        return (
            <div className="modern-envelope">
                <div className="loading-content">
                    <div className="loading-spinner"></div>
                    <p>Đang tải thiệp mời...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-state">
                <div className="error-content"><h2>Oops!</h2><p>{error}</p></div>
            </div>
        );
    }

    if (!invitationData) {
        return (
            <div className="empty-state">
                <div className="empty-content"><h2>Không tìm thấy thiệp mời.</h2></div>
            </div>
        );
    }
    
    const { settings, guestDetails, content: pages } = invitationData;
    const { contactGroom, contactBride, groomName, brideName } = settings;
    const pageTitle = (settings.title || "Thiệp mời online").replace('{LờiXưngHô}', guestDetails?.salutation || settings.salutationStyle).replace('{TênKháchMời}', guestDetails?.name || "Bạn");
    const pageDescription = (settings.description || "Mời bạn đến tham dự buổi tiệc chung vui cùng gia đình chúng tôi!").replace('{LờiXưngHô}', '').replace('{TênKháchMời}', '').trim();
const shareUrl = `${window.location.origin}/events/${resourceId}${guestId ? `?guestId=${guestId}` : ''}`;
    const shareText = `Trân trọng kính mời bạn đến dự lễ cưới của ${groomName} và ${brideName}!`;
    const ogImageUrl = invitationData.imgSrc || settings.heroImages?.main;

    const handleShareFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
    const handleShareZalo = () => window.open(`https://zalo.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank', 'width=600,height=400');
    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl).then(() => showSuccessToast('Đã sao chép liên kết!'), () => showSuccessToast('Không thể sao chép.'));
    };

    const hasBanner = settings.bannerImages && settings.bannerImages.length > 0;
    
    const eventDescriptionStyle = {
        fontFamily: settings.eventDescriptionStyle?.fontFamily || 'var(--font-primary)',
        fontSize: `${settings.eventDescriptionStyle?.fontSize || 18}px`,
        color: settings.eventDescriptionStyle?.color || 'var(--color-text-medium)',
        fontWeight: settings.eventDescriptionStyle?.fontWeight || 'normal',
        fontStyle: settings.eventDescriptionStyle?.fontStyle || 'normal',
        textDecoration: settings.eventDescriptionStyle?.textDecoration || 'none',
        textAlign: settings.eventDescriptionStyle?.textAlign || 'center',
    };
    
    const createStyleObject = (styleData, defaultSize = 16) => ({
        fontFamily: styleData?.fontFamily || 'var(--font-primary)',
        fontSize: `${styleData?.fontSize || defaultSize}px`,
        color: styleData?.color || 'var(--color-text-light)',
        fontWeight: styleData?.fontWeight || 'normal',
        fontStyle: styleData?.fontStyle || 'normal',
        textDecoration: styleData?.textDecoration || 'none',
        textAlign: styleData?.textAlign || 'center',
    });

    const contactGroomStyle = createStyleObject(settings.contactGroomStyle);
    const contactBrideStyle = createStyleObject(settings.contactBrideStyle);

    const defaultBlockOrder = ['EVENT_DESCRIPTION', 'COUPLE_INFO', 'PARTICIPANTS', 'EVENT_SCHEDULE', 'COUNTDOWN', 'LOVE_STORY', 'GALLERY', 'VIDEO', 'CONTACT_INFO', 'QR_CODES', 'RSVP'];
    
    const blocksToRender = Array.isArray(settings.blocksOrder) && settings.blocksOrder.length > 0 
    ? settings.blocksOrder 
    : defaultBlockOrder;

        
    // 2. Thêm component RSVP vào componentMap
    const componentMap = {
        EVENT_DESCRIPTION: <EventDescription description={settings.eventDescription} style={eventDescriptionStyle} />,
        COUPLE_INFO: <CoupleInfo settings={settings}/>,
        PARTICIPANTS: <ParticipantsSection participants={settings.participants} title={settings.participantsTitle} titleStyle={settings.participantsTitleStyle} />,
        EVENT_SCHEDULE: <EventSchedule events={settings.events} title={settings.eventsTitle} titleStyle={settings.eventsTitleStyle} />,
        COUNTDOWN: <Countdown targetDate={settings.eventDate} title={settings.countdownTitle} titleStyle={settings.countdownTitleStyle} />,
        LOVE_STORY: <LoveStoryTimeline stories={settings.loveStory} title={settings.loveStoryTitle} titleStyle={settings.loveStoryTitleStyle} />,
        GALLERY: <Gallery images={settings.galleryImages} onImageClick={handleImageClick} title={settings.galleryTitle} titleStyle={settings.galleryTitleStyle} />,
        VIDEO: <EventVideo videoUrl={settings.videoUrl} title={settings.videoTitle} titleStyle={settings.videoTitleStyle} />,
        CONTACT_INFO: (
            <section className="section-container">
                <SectionHeader title={settings.contactTitle || "Thông Tin Liên Hệ"} titleStyle={settings.contactTitleStyle} />
                <div className="modern-contact-section">
                    {contactGroom && (
                        <a href={`tel:${contactGroom.replace(/\D/g,'')}`} className="modern-contact-card">
                            <div className="contact-icon"><Phone size={24} /></div>
                            <div className="contact-info">
                                <h4 style={contactGroomStyle}>Nhà trai</h4>
                                <span>{groomName || 'Chú rể'}</span>
                                <p style={contactGroomStyle}>{contactGroom}</p>
                            </div>
                        </a>
                    )}
                    {contactBride && (
                        <a href={`tel:${contactBride.replace(/\D/g,'')}`} className="modern-contact-card">
                            <div className="contact-icon"><Phone size={24} /></div>
                            <div className="contact-info">
                                <h4 style={contactBrideStyle}>Nhà gái</h4>
                                <span>{brideName || 'Cô dâu'}</span>
                                <p style={contactBrideStyle}>{contactBride}</p>
                            </div>
                        </a>
                    )}
                </div>
            </section>
        ),
        QR_CODES: <GiftSection qrCodes={settings.qrCodes} title={settings.qrCodeTitle} titleStyle={settings.qrCodeTitleStyle} />,
        RSVP: (
            <section className="section-container">
                <SectionHeader 
                    title={settings.rsvpTitle || "Xác Nhận Tham Dự"} 
                    subtitle={settings.rsvpSubtitle || "Sự hiện diện của bạn là niềm vinh hạnh cho gia đình chúng tôi."}
                    titleStyle={settings.rsvpTitleStyle}
                    subtitleStyle={settings.rsvpSubtitleStyle}
                />
                <div className="modern-rsvp-wrapper">
                    <RsvpSection resourceId={resourceId} guestDetails={guestDetails} />
                </div>
            </section>
        ),
        CUSTOM_HTML: (
            <CustomHtmlSection 
                content={settings.customHtmlContent} 
                title={settings.customHtmlTitle}
                titleStyle={settings.customHtmlTitleStyle}
            />
        ),
    };

    return (
        <div className="modern-invitation">
            <Helmet>
                <style>
                    {customFonts.map(font => `
                        @font-face {
                            font-family: "${font.name}";
                            src: url('${font.url}');
                        }
                    `).join('\n')}
                </style>
            </Helmet>

            <SEO title={pageTitle} description={pageDescription} imageUrl={ogImageUrl} url={`/events/${resourceId}${guestId ? `?guestId=${guestId}` : ''}`} />
            {isPreview && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', 
                    background: 'rgba(212, 175, 55, 0.9)', color: 'white', 
                    textAlign: 'center', padding: '10px', zIndex: 2000,
                    fontSize: '14px', fontWeight: 'bold'
                }}>
                    Đây là chế độ xem trước
                </div>
            )}
            <canvas ref={particleCanvasRef} id="particle-canvas"></canvas>

            {isOpen && musicEmbedUrl && <iframe width="0" height="0" src={musicEmbedUrl} title="Invitation Music" frameBorder="0" allow="autoplay" style={{ display: 'none' }} />}

            {lightboxOpen && <LightboxModal images={settings.galleryImages || []} startIndex={lightboxStartIndex} onClose={() => setLightboxOpen(false)} />}
            
            {/* =================================================================== */}
            {/* ++ START: RENDER OVERLAY ++ */}
            {/* =================================================================== */}
            {isFlipbookFullscreen && (
                <div className="flipbook-fullscreen-overlay" onClick={() => setIsFlipbookFullscreen(false)}>
                    <button className="flipbook-fullscreen-close" onClick={() => setIsFlipbookFullscreen(false)}>
                        <X size={32} />
                    </button>
                    <div className="flipbook-fullscreen-content" onClick={(e) => e.stopPropagation()}>
                         <InvitationCanvasDisplay pages={pages} isFullscreen={true} guestDetails={guestDetails} />
                    </div>
                </div>
            )}
            {/* =================================================================== */}
            {/* ++ END: RENDER OVERLAY ++ */}
            {/* =================================================================== */}

            {hasBanner && isOpen && <BannerCarousel images={settings.bannerImages} />}

            <div className={`modern-envelope ${isOpen ? 'closed' : ''}`}>
                {/* START: MODIFIED ENVELOPE STRUCTURE */}
                <div className="coded-envelope-container" onClick={handleOpen}>
                    <div className="envelope-body">
                        <div className="decor-corner top-left"></div>
                        <div className="decor-corner top-right"></div>
                        <div className="decor-corner bottom-left"></div>
                        <div className="decor-corner bottom-right"></div>
                        <div className="stamp">
                            {globalSettings?.theme?.logoUrl ? (
                                <img src={globalSettings.theme.logoUrl} alt="Site Logo" className="stamp-logo-icon" />
                            ) : (
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="bird-icon"><path d="M12.5 7.55C15.5 4.5 15.5 4.5 15.5 4.5C18.5 1.5 20.25 3.75 20.25 3.75C22.5 6.5 19 11.5 19 11.5L12.5 7.55Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M11.5 8.55L4.5 11.5C4.5 11.5 2.5 10.5 3.5 8.5C4.5 6.5 6.5 7.5 6.5 7.5L11.5 8.55Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M15.5 4.5L12.5 7.55L11.5 8.55L6.5 7.5L9 9.5L8.5 11L10 12L11.5 11L13.5 13L15 12L15.5 10.5L17 9.5L19 11.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M9.5 15.5C9.5 15.5 6.5 22.5 12.5 22.5C18.5 22.5 14.5 15.5 14.5 15.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                            )}
                        </div>

                        <div className="address-area">
                            {/* Dòng này sẽ hiển thị lời chào và tên khách mời nếu có */}
                            {guestDetails && (
                                <div className="recipient-tagline">
                                    {settings.salutationStyle} {guestDetails.name}, trân trọng kính mời!
                                </div>
                            )}
                            {/* Giữ nguyên tên cặp đôi */}
                            <div className="recipient-name">
                                {groomName} & {brideName}
                            </div>
                        </div>
                    </div>
                    <div className="flap top"></div>
                    <div className="flap left"></div>
                    <div className="flap right"></div>
                    <div className={`envelope-seal custom-wax-seal ${isRotating ? 'rotating' : ''}`}>
                        {/* Thêm ảnh dấu sáp png của bạn vào đây */}
                        <img src="/assets/dau-sap.png" alt="Mở thiệp" className="wax-seal-img" />
                    </div>
                </div>
                {/* END: MODIFIED ENVELOPE STRUCTURE */}
            </div>

            <div className="modern-share-buttons">
                <button className="share-button facebook" onClick={handleShareFacebook}><Facebook size={20} /></button>
                <button className="share-button zalo" onClick={handleShareZalo}><MessageCircle size={20} /></button>
                <button className="share-button copy" onClick={handleCopyLink}><Copy size={20} /></button>
            </div>

            <main className={`modern-content ${isOpen ? 'visible' : ''}`}>
                <div className="modern-container">
                    {/* =================================================================== */}
                    {/* ++ START: KHU VỰC CANVAS PREVIEW ĐÃ ĐƯỢC THAY ĐỔI ++ */}
                    {/* =================================================================== */}
                    <section className="section-container invitation-preview-wrapper">
                        <div className="invitation-preview-card">
                            <div className="invitation-canvas-preview">
                                <InvitationCanvasDisplay pages={pages} isFullscreen={false} guestDetails={guestDetails} />
                            </div>
                            <div className="invitation-preview-action">
                                <button className="modern-btn-primary" onClick={() => setIsFlipbookFullscreen(true)}>
                                    <ExternalLink size={18} style={{ marginRight: '8px' }}/>
                                    Xem Toàn Bộ Thiệp Mời
                                </button>
                            </div>
                        </div>
                    </section>
                    {/* =================================================================== */}
                    {/* ++ END: KHU VỰC THAY ĐỔI ++ */}
                    {/* =================================================================== */}
                    
                    
                    {blocksToRender.map(blockKey => {
                        // Kiểm tra xem có dữ liệu cho khối đó không trước khi render
                        const hasData = (key) => {
                            switch(key) {
                                case 'EVENT_DESCRIPTION': return !!settings.eventDescription;
                                case 'COUPLE_INFO': return settings.invitationType === 'Thiệp cưới';
                                // Sửa lỗi: Thêm Array.isArray để đảm bảo đây là mảng
                                case 'PARTICIPANTS': return Array.isArray(settings.participants) && settings.participants.length > 0;
                                case 'EVENT_SCHEDULE': return Array.isArray(settings.events) && settings.events.length > 0;
                                case 'COUNTDOWN': return !!settings.eventDate;
                                case 'LOVE_STORY': return Array.isArray(settings.loveStory) && settings.loveStory.length > 0;
                                case 'GALLERY': return Array.isArray(settings.galleryImages) && settings.galleryImages.length > 0;
                                case 'VIDEO': return !!settings.videoUrl;
                                case 'CONTACT_INFO': return settings.invitationType === 'Thiệp cưới' && (settings.contactGroom || settings.contactBride);
                                case 'QR_CODES': return Array.isArray(settings.qrCodes) && settings.qrCodes.length > 0;
                                case 'RSVP': return settings.rsvpTitle && settings.rsvpTitle.length > 0; 
                                default: return false;
                            }
                        };



                        if (hasData(blockKey)) {
                            return <React.Fragment key={blockKey}>{componentMap[blockKey]}</React.Fragment>;
                        }
                        return null;
                    })}
                    {loveGiftsButton?.isEnabled && (
                        <section className="section-container">
                            <a href={loveGiftsButton.link} target="_blank" rel="noopener noreferrer" className="modern-btn-primary">
                                 <Gift size={18} /> {loveGiftsButton.text || 'Gửi Quà Mừng Cưới'}
                            </a>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
};

export default WeddingInvitation;