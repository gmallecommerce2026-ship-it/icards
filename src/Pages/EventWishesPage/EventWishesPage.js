import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { showSuccessToast, showErrorToast } from '../../Utils/toastHelper';
import { Heart, ChevronLeft, MessageCircle } from 'lucide-react';
import './EventWishesPage.css';

const EventWishesPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const guestId = searchParams.get('guestId');

    const [wishes, setWishes] = useState([]);
    const [senderName, setSenderName] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch danh sách lời chúc khi load trang
    useEffect(() => {
        if (!id) return;
        const fetchWishes = async () => {
            try {
                const res = await api.get(`/wishes/public/${id}`);
                setWishes(res.data.data || []);
            } catch (err) {
                console.error("Lỗi tải lời chúc:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchWishes();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!senderName.trim() || !content.trim()) {
            showErrorToast("Vui lòng nhập đầy đủ tên và lời chúc!");
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await api.post(`/wishes/public/${id}`, {
                senderName: senderName.trim(),
                content: content.trim()
            });
            showSuccessToast("Gửi lời chúc thành công!");
            setContent('');
            // Đẩy lời chúc mới lên đầu danh sách
            if(res.data && res.data.data) {
                setWishes(prev => [res.data.data, ...prev]);
            }
        } catch (err) {
            showErrorToast("Có lỗi xảy ra, vui lòng thử lại.");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        const backUrl = guestId ? `/events/${id}?guestId=${guestId}` : `/events/${id}`;
        navigate(backUrl);
    };

    return (
        <div className="wishes-page-wrapper">
            <div className="wishes-page-header">
                <button onClick={handleBack} className="back-btn">
                    <ChevronLeft size={24} />
                    <span>Trở về thiệp</span>
                </button>
            </div>

            <div className="wishes-container">
                <div className="wishes-hero">
                    <div className="icon-wrapper">
                        <MessageCircle size={40} className="pulse-icon" />
                    </div>
                    <h1>Sổ Lưu Bút</h1>
                    <p>Hãy để lại những lời chúc tốt đẹp nhất dành cho chúng tôi nhé!</p>
                </div>

                <div className="wishes-form-card">
                    <form onSubmit={handleSubmit} className="modern-rsvp-form">
                        <div className="modern-form-group">
                            <label className="form-label">Tên của bạn</label>
                            <input 
                                type="text"
                                className="modern-form-input" 
                                placeholder="Nhập tên của bạn..." 
                                value={senderName}
                                onChange={(e) => setSenderName(e.target.value)}
                            />
                        </div>
                        <div className="modern-form-group">
                            <label className="form-label">Lời chúc</label>
                            <textarea 
                                className="modern-form-input custom-scrollbar" 
                                placeholder="Nhập lời chúc của bạn tại đây..." 
                                rows="4"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                style={{ resize: 'none' }}
                            />
                        </div>
                        <button type="submit" className="modern-btn-primary submit-btn" disabled={isSubmitting}>
                            {isSubmitting ? 'Đang gửi...' : 'Gửi Lời Chúc'} <Heart size={18} style={{marginLeft: 8}}/>
                        </button>
                    </form>
                </div>

                <div className="wishes-list-section">
                    <h3 className="list-title">
                        Lời chúc từ mọi người <span className="badge">{wishes.length}</span>
                    </h3>
                    
                    {loading ? (
                        <p className="loading-text">Đang tải lời chúc...</p>
                    ) : wishes.length === 0 ? (
                        <p className="empty-text">Chưa có lời chúc nào. Hãy là người đầu tiên gửi lời chúc nhé!</p>
                    ) : (
                        <div className="wishes-grid">
                            {wishes.map(wish => (
                                <div key={wish._id} className="wish-card-item">
                                    <div className="wish-card-header">
                                        <div className="wish-avatar">
                                            {wish.senderName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="wish-meta">
                                            <h4>{wish.senderName}</h4>
                                            <span>{new Date(wish.createdAt).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                    </div>
                                    <p className="wish-content-text">"{wish.content}"</p>
                                    
                                    {wish.reply && (
                                        <div className="wish-reply-box">
                                            <strong>Cô Dâu & Chú Rể:</strong>
                                            <p>{wish.reply}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventWishesPage;