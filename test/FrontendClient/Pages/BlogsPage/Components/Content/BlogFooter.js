import React from 'react';
import { Facebook, Twitter, Linkedin, Instagram, Mail, ArrowRight, Heart } from 'lucide-react';
import './BlogFooter.css';

const BlogFooter = () => {
    return (
        <footer className="blogs-footer">
            {/* Top Section: Newsletter */}
            <div className="blogs-footer__top">
                <div className="blogs-footer__container">
                    <div className="blogs-newsletter">
                        <div className="blogs-newsletter__content">
                            <h3 className="blogs-newsletter__title">Đăng ký nhận bản tin G-Mall</h3>
                            <p className="blogs-newsletter__desc">Cập nhật xu hướng công nghệ mới nhất vào mỗi sáng thứ Hai.</p>
                        </div>
                        <form className="blogs-newsletter__form" onSubmit={(e) => e.preventDefault()}>
                            <div className="blogs-input-group">
                                <Mail className="blogs-input-icon" size={20} />
                                <input type="email" placeholder="Nhập địa chỉ email của bạn" className="blogs-newsletter__input" />
                                <button type="submit" className="blogs-newsletter__btn">
                                    Đăng ký <ArrowRight size={18} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Middle Section: Links */}
            <div className="blogs-footer__middle">
                <div className="blogs-footer__container">
                    <div className="blogs-footer__grid">
                        
                        {/* Column 1: Brand Info */}
                        <div className="blogs-footer__col blogs-footer__col--brand">
                            <h2 className="blogs-footer__logo">G-MALL <span className="highlight">INSIGHTS</span></h2>
                            <p className="blogs-footer__text">
                                Nền tảng chia sẻ kiến thức chuyên sâu về Lập trình, Công nghệ và Thương mại điện tử hàng đầu Việt Nam.
                            </p>
                            <div className="blogs-socials">
                                <a href="#" className="blogs-social-link"><Facebook size={20} /></a>
                                <a href="#" className="blogs-social-link"><Twitter size={20} /></a>
                                <a href="#" className="blogs-social-link"><Linkedin size={20} /></a>
                                <a href="#" className="blogs-social-link"><Instagram size={20} /></a>
                            </div>
                        </div>

                        {/* Column 2: Categories */}
                        <div className="blogs-footer__col">
                            <h4 className="blogs-footer__heading">Khám phá</h4>
                            <ul className="blogs-footer__links">
                                <li><a href="/page">Công nghệ</a></li>
                                <li><a href="/page">Lập trình</a></li>
                                <li><a href="/page">E-Commerce</a></li>
                                <li><a href="/page">Blockchain & AI</a></li>
                                <li><a href="/page">Review sản phẩm</a></li>
                            </ul>
                        </div>

                        {/* Column 3: Company */}
                        <div className="blogs-footer__col">
                            <h4 className="blogs-footer__heading">Về G-Mall</h4>
                            <ul className="blogs-footer__links">
                                <li><a href="/about">Giới thiệu</a></li>
                                <li><a href="/contact">Liên hệ & Hợp tác</a></li>
                                <li><a href="/careers">Tuyển dụng</a></li>
                                <li><a href="/terms">Điều khoản sử dụng</a></li>
                                <li><a href="/privacy">Chính sách bảo mật</a></li>
                            </ul>
                        </div>

                        {/* Column 4: Popular Tags */}
                        <div className="blogs-footer__col">
                            <h4 className="blogs-footer__heading">Từ khóa hot</h4>
                            <div className="blogs-footer__tags">
                                <span className="blogs-tag-pill">ReactJS</span>
                                <span className="blogs-tag-pill">Next.js</span>
                                <span className="blogs-tag-pill">Startup</span>
                                <span className="blogs-tag-pill">Marketing</span>
                                <span className="blogs-tag-pill">UI/UX</span>
                                <span className="blogs-tag-pill">DevOps</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Bottom Section: Copyright */}
            <div className="blogs-footer__bottom">
                <div className="blogs-footer__container">
                    <div className="blogs-copyright">
                        <p>&copy; {new Date().getFullYear()} G-Mall Vietnam. All rights reserved.</p>
                        <p className="blogs-made-with">
                            Made with <Heart size={14} fill="#ef4444" color="#ef4444" /> by G-Mall Team
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default BlogFooter;