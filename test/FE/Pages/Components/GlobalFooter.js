// src/Pages/Components/GlobalFooter.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GlobalFooter.css';
import { useSettings } from '../../Context/SettingsContext';

const GlobalFooter = ({ className }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const { settings, loading } = useSettings();
  const renderLink = (link) => {
    let path;
    try {
      // Cố gắng phân tích link.url như một URL đầy đủ
      const urlObject = new URL(link.url);
      // Nếu URL này cùng tên miền với trang web hiện tại, chỉ lấy phần đường dẫn
      if (urlObject.origin === window.location.origin) {
        path = urlObject.pathname;
      } else {
        // Nếu là một trang web khác, giữ nguyên URL đầy đủ
        path = link.url;
      }
    } catch (e) {
      // Nếu link.url không phải là một URL hợp lệ, coi nó là một đường dẫn tương đối
      path = link.url;
    }

    // Nếu là một đường dẫn bên ngoài, sử dụng thẻ <a> thông thường
    if (path.startsWith('http')) {
      return (
        <a key={link.id || link.text} href={path} target="_blank" rel="noopener noreferrer">
          {link.text}
        </a>
      );
    }

    // Nếu là đường dẫn nội bộ, sử dụng navigate của React Router
    return (
      <a key={link.id || link.text} href={path} onClick={(e) => { e.preventDefault(); navigate(path); }}>
        {link.text}
      </a>
    );
  };
  
  if (loading || !settings || !settings.footer) {
    return (
        <footer className="footer-container">
            <div className="footer-content">
                <p>Đang tải thông tin chân trang...</p>
            </div>
        </footer>
    );
  }

  const logoUrl = settings?.theme?.logoUrl;
  const { columns = [], socialLinks = [], legalLinks = [], textContent } = settings.footer || {};
  const { companyName, address, phone } = settings.theme || {};

  const hasTextContent = textContent && (textContent.title || (textContent.blocks && textContent.blocks.length > 0));

  return (
    <>
      <footer className={`footer-container ${className || ''}`}>
        <div className="footer-content">
          {hasTextContent && (
            <div className={`text-content-wrapper ${isExpanded ? 'expanded' : ''}`}>
                <section className="section-text-content">
                    {textContent.title && (
                        <h3 className="text-content-title">{textContent.title}</h3>
                    )}
                    <div className="text-content-body">
                        {(textContent.blocks || []).map((block, index) => (
                            <div key={index} className="text-block">
                                {block.headline && <h4>{block.headline}</h4>}
                                {block.body && <p dangerouslySetInnerHTML={{ __html: block.body.replace(/\n/g, '<br />') }}></p>}
                            </div>
                        ))}
                    </div>
                </section>
                <button className="view-more-btn" onClick={() => setIsExpanded(!isExpanded)}>
                  {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                </button>
            </div>
          )}

          <div className="footer-main-content">
            <div className="footer-column footer-info">
              <div className="footer-logo">
                {logoUrl ? <img src={logoUrl} alt={companyName || "iCards Logo"} className="logo-icon-img" /> : (companyName || "iCards")}
              </div>
              <p className="company-name">{companyName}</p>
              <p className="company-address">
                {address}
                <br />
                Hotline: {phone}
              </p>
            </div>

            {columns.map((column, index) => (
              <div key={index} className="footer-column footer-links">
                <h5 className="footer-title">{column.title}</h5>
                {column.links?.map(renderLink)} 
              </div>
            ))}

            <div className="footer-column footer-connect">
                <h5 className="footer-title connect-title">Kết nối</h5>
                <div className="footer-social-icons">
                    {socialLinks.map(link => (
                        <a key={link.id} href={link.url} aria-label={link.name} target="_blank" rel="noopener noreferrer">
                            {link.icon && <img src={link.icon} alt={link.name} className="social-icon-img" />}
                        </a>
                    ))}
                </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="copyright">© {new Date().getFullYear()} iCards.com.vn ®</p>
          <div className="footer-legal-links">
            {legalLinks.map(renderLink)} 
          </div>
        </div>
      </footer>
    </>
  );
};

export default GlobalFooter;