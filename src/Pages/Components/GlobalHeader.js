// src/Pages/Components/GlobalHeader.js

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './GlobalHeader.css';
import { useAuth } from '../../Context/AuthContext';
import { useSettings } from '../../Context/SettingsContext';
import { HiOutlineMenuAlt3 } from "react-icons/hi";
import { AiOutlineClose, AiOutlineRight } from "react-icons/ai";
import { FiSearch } from "react-icons/fi";

const titleToSlug = (title) => {
    if (!title) return '';
    return title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');
};

// --- CÁC COMPONENT CON (Giữ nguyên không thay đổi) ---
const UserMenu = ({ user, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNavigate = (path) => {
        navigate(path);
        setIsOpen(false);
    };

    const handleLogout = () => {
        onLogout();
        setIsOpen(false);
        navigate('/');
    };

    return (
        <div className="user-menu" ref={menuRef}>
            <button className="avatar-button" onClick={() => setIsOpen(!isOpen)}>
                <img src={user.avatar || 'https://placehold.co/40x40/CDD7E5/333?text=A'} alt="User Avatar" />
            </button>
            {isOpen && (
                <div className="dropdown-menu">
                    <div className="dropdown-header">
                        <p className="username">{user.username}</p>
                        <p className="email">{user.email}</p>
                    </div>
                    <button className="dropdown-item" onClick={() => handleNavigate('/account-settings')}>Cài đặt tài khoản</button>
                    <button className="dropdown-item" onClick={() => handleNavigate('/invitation-management')}>Quản lí thiệp mời</button>
                    <button className="dropdown-item" onClick={handleLogout}>Đăng xuất</button>
                </div>
            )}
        </div>
    );
};

const MegaMenuPane = ({ activeMenuData, onMouseEnter, onMouseLeave }) => {
    const navigate = useNavigate();
    const isVisible = activeMenuData && activeMenuData.columns?.length > 0;

    const handleLinkClick = (e, path) => {
        e.preventDefault();
        navigate(path);
        onMouseLeave();
    };

    return (
        <div
            className={`mega-menu-pane ${isVisible ? 'visible' : ''}`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="container">
                 {isVisible && (
                    <div className="mega-menu-content">
                        {activeMenuData.columns.map((column, index) => (
                            <div key={index} className="mega-menu-column">
                                <a href={column.path} onClick={(e) => handleLinkClick(e, column.path)} className="mega-menu-title-link">
                                    <h3 className="mega-menu-title">{column.title}</h3>
                                </a>
                                <ul className="mega-menu-links">
                                    {column.links.map((link, linkIndex) => (
                                        <li key={linkIndex}>
                                            <a href={link.href} onClick={(e) => handleLinkClick(e, link.href)}>
                                                {link.text}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                 )}
            </div>
        </div>
    );
};

const MobileNav = ({ isOpen, onMenuToggle, menuData, mainNavItems }) => {
    const [openSubMenu, setOpenSubMenu] = useState(null);
    const navigate = useNavigate();

    if (!isOpen) {
        return null;
    }

    const handleItemClick = (item) => {
        const menuNode = menuData[item.title];
        const hasSubMenu = menuNode?.columns?.length > 0;
        
        if (hasSubMenu) {
            setOpenSubMenu(prev => prev === item.title ? null : item.title);
        } else {
            const path = menuNode?.path || '#';
            navigate(path);
            onMenuToggle();
        }
    };

    const handleSubItemClick = (path) => {
        navigate(path);
        onMenuToggle();
    };

    return (
        <div className={`mobile-nav-container ${isOpen ? 'open' : ''}`} onClick={onMenuToggle}>
            <div className="mobile-nav-content" onClick={e => e.stopPropagation()}>
                <div className="mobile-nav-header">
                    <button onClick={onMenuToggle} className="mobile-nav-close-btn">
                        <AiOutlineClose size={24} />
                    </button>
                </div>
                <div className="mobile-nav-scroll-area">
                    {mainNavItems.map(item => {
                        const menuNode = menuData[item.title];
                        const hasSubMenu = menuNode?.columns?.length > 0;
                        const isSubMenuOpen = openSubMenu === item.title;

                        return (
                            <div key={item.id || item.title} className="mobile-nav-group">
                                <button className="mobile-nav-item" onClick={() => handleItemClick(item)}>
                                    <span>{item.title}</span>
                                    {hasSubMenu && <AiOutlineRight className={`arrow-icon ${isSubMenuOpen ? 'open' : ''}`} />}
                                </button>
                                {hasSubMenu && isSubMenuOpen && (
                                    <div className="mobile-submenu">
                                        {menuNode.columns.map(col => (
                                            <div key={col.title} className="mobile-submenu-column">
                                                <button className="mobile-submenu-title" onClick={() => handleSubItemClick(col.path)}>
                                                    {col.title}
                                                </button>
                                                {col.links.map(link => (
                                                    <button key={link.text} className="mobile-submenu-item" onClick={() => handleSubItemClick(link.href)}>
                                                        {link.text}
                                                    </button>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const AnnouncementBar = () => {
    const { settings, loading } = useSettings();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const dismissed = localStorage.getItem('announcementDismissed');
        if (!dismissed) {
            setIsVisible(true);
        }
    }, []);

    if (loading || !isVisible || !settings?.theme?.announcementBar?.isEnabled || !settings.theme.announcementBar.text) {
        return null;
    }

    const { text, link, backgroundColor, textColor, backgroundImage, isMarquee } = settings.theme.announcementBar;

    const barStyle = {
        color: textColor || 'var(--color-text-white)',
        position: 'relative',
        overflow: 'hidden',
    };

    if (backgroundImage) {
        barStyle.backgroundImage = `url(${backgroundImage})`;
    } else if (backgroundColor) {
        barStyle.backgroundColor = backgroundColor;
    }

    const handleClose = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsVisible(false);
        localStorage.setItem('announcementDismissed', 'true');
    };

    const content = (
        <div className="announcement-bar" style={barStyle}>
            {backgroundImage && <div className="announcement-bar-overlay"></div>}
            <div className={`announcement-bar-content ${isMarquee ? 'marquee' : ''}`}>
                <p>
                    {text} {link && <a href={link} className="learn-more-link">Tìm hiểu thêm.</a>}
                </p>
            </div>
            <button onClick={handleClose} className="announcement-close-btn" aria-label="Đóng thông báo">&times;</button>
        </div>
    );
    
    return link ? <a href={link} className="announcement-bar-link">{content}</a> : content;
};

const MainHeader = React.memo(React.forwardRef(({ onMenuToggle, isSticky, isVisible, activeMenu, setActiveMenu, menuData, mainNavItems }, ref) => {
    const { isAuthenticated, user, logout } = useAuth();
    const { settings } = useSettings();
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const menuTimeoutRef = useRef(null);

    const logoUrl = settings?.theme?.logoUrl;
    const companyName = settings?.theme?.companyName || 'iCards.com.vn';

    const handleNavigate = (path) => {
        navigate(path);
        setActiveMenu(null);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search/${searchQuery.trim()}`);
            setSearchQuery('');
        }
    };

    const handleMouseEnter = (itemTitle) => {
        clearTimeout(menuTimeoutRef.current);
        setActiveMenu(itemTitle);
    };

    const handleMouseLeave = () => {
        menuTimeoutRef.current = setTimeout(() => setActiveMenu(null), 200);
    };
    
    return (
        <div ref={ref} className={`main-header-wrapper ${isSticky ? 'is-sticky' : ''} ${isVisible ? '' : 'is-hidden'}`}>
            <div className="main-header">
                <div className="container">
                    <div className="header-top">
                        <div className="header-section left">
                            <div className="logo" onClick={() => handleNavigate("/")}>
                                {logoUrl ? (
                                    <img src={logoUrl} alt={companyName} />
                                 ) : (
                                    companyName
                                 )}
                            </div>
                            <nav className="header-nav-main desktop-only">
                                <button className="nav-item" onClick={() => handleNavigate("/professional")}>Chuyên nghiệp</button>
                            </nav>
                        </div>
                        <div className="header-section right">
                            <form className="search-bar-wrapper" onSubmit={handleSearchSubmit}>
                                <FiSearch className="search-icon" />
                                <input type="text" className="search-input" placeholder="Tìm kiếm sản phẩm, mẫu thiệp..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                            </form>
                            {isAuthenticated ? (
                                <UserMenu user={user} onLogout={logout} />
                            ) : (
                                <div className="auth-actions">
                                    <button className="auth-btn" onClick={() => handleNavigate("/sign-in")}>Đăng nhập</button>
                                    <span className="separator"></span>
                                    <button className="auth-btn" onClick={() => handleNavigate("/sign-up")}>Đăng ký</button>
                                </div>
                            )}
                        </div>
                        <button className="hamburger-menu mobile-only" onClick={onMenuToggle} aria-label="Mở menu">
                            <HiOutlineMenuAlt3 size={28} />
                        </button>
                    </div>
                    <nav className="header-bottom desktop-only">
                        {mainNavItems.map(item => (
                            <button
                                key={item.id || item.title}
                                onClick={() => handleNavigate(menuData[item.title]?.path || item.path || '#')}
                                onMouseEnter={() => handleMouseEnter(item.title)}
                                onMouseLeave={handleMouseLeave}
                                className={`nav-item-bottom ${activeMenu === item.title ? 'active' : ''}`}
                            >
                                {item.title}
                            </button>
                        ))}
                    </nav>
                </div>
                <MegaMenuPane
                    activeMenuData={activeMenu ? menuData[activeMenu] : null}
                    onMouseEnter={() => clearTimeout(menuTimeoutRef.current)}
                    onMouseLeave={handleMouseLeave}
                />
            </div>
        </div>
    );
}));

const Header = ({ className }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [isSticky, setIsSticky] = useState(false);
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const [headerHeight, setHeaderHeight] = useState(0);
    
    const { settings, loading: settingsLoading } = useSettings();

    // ++ START: MODIFIED LOGIC ++
    const { mainNavItems, menuData } = useMemo(() => {
        if (settingsLoading || !settings || !settings.headerNav) {
            return { mainNavItems: [], menuData: {} };
        }

        const navItemsFromSettings = (settings.headerNav || [])
            .filter(item => item.isVisible)
            .sort((a, b) => (a.order || 0) - (b.order || 0));

        const newMenuData = {};
        
        // Lấy 3 danh mục đầu tiên để hiển thị trên header
        const mainCategories = navItemsFromSettings.slice(0, 3);
        // Lấy các danh mục còn lại
        const otherCategories = navItemsFromSettings.slice(3);

        const finalNavItems = [...mainCategories]; // Bắt đầu với 3 danh mục chính

        // Xử lý 3 danh mục chính
        mainCategories.forEach(navItem => {
            const categoryPath = `/invitations/category/${titleToSlug(navItem.title)}`;
            newMenuData[navItem.title] = {
                path: categoryPath,
                columns: (navItem.children || [])
                    .filter(col => col.isVisible)
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map(column => {
                        // SỬA TẠI ĐÂY 1: Tạo đường dẫn chuẩn cho Group
                        const groupPath = `${categoryPath}/group/${titleToSlug(column.title)}`;
                        return {
                            title: column.title,
                            path: groupPath, 
                            links: (column.children || [])
                               .filter(link => link.isVisible)
                               .sort((a, b) => (a.order || 0) - (b.order || 0))
                               .map(link => ({
                                    text: link.title,
                                    // SỬA TẠI ĐÂY 2: Link của Type phải nối tiếp sau Group
                                    href: `${groupPath}/type/${titleToSlug(link.title)}`,
                               })),
                        };
                    }),
            };
        });

        // Xử lý "Thiệp khác"
        if (otherCategories.length > 0) {
            const otherInvitationsItem = { id: 'other-invitations', title: 'Thiệp khác', path: '/invitations', order: 97 };
            finalNavItems.push(otherInvitationsItem);

            newMenuData['Thiệp khác'] = {
                path: '/invitations',
                columns: otherCategories.map(navItem => {
                    const categoryPath = `/invitations/category/${titleToSlug(navItem.title)}`;
                    return {
                        title: navItem.title,
                        path: categoryPath,
                        links: (navItem.children || [])
                            .filter(link => link.isVisible)
                            .sort((a, b) => (a.order || 0) - (b.order || 0))
                            .map(link => ({
                                text: link.title,
                                // SỬA TẠI ĐÂY 3: Link cho danh mục con của "Thiệp khác" sẽ là Group
                                href: `${categoryPath}/group/${titleToSlug(link.title)}`,
                            })),
                    };
                }),
            };
        }

        // Thêm "Shop & Service" và "Blogs"
        const hasShopService = finalNavItems.some(item => item.title === 'Cửa hàng - Dịch vụ');
        if (!hasShopService) {
            const shopServiceItem = { id: 'static-shop', title: 'Cửa hàng - Dịch vụ', path: '/shop', order: 98, isVisible: true, };
            finalNavItems.push(shopServiceItem);
            newMenuData['Cửa hàng - Dịch vụ'] = {
                path: "/shop",
                columns: [{
                    title: "Sản phẩm & Dịch vụ", path: "/shop",
                    links: [
                        { text: "Phụ kiện trang trí", href: `/shop?category=${encodeURIComponent('Phụ kiện trang trí')}` },
                        { text: "Quà tặng", href: `/shop?category=${encodeURIComponent('Quà tặng')}` },
                        { text: "Shop - Service", href: `/shop?category=${encodeURIComponent('Shop - Service')}` },
                        { text: "Tổ chức sự kiện", href: `/shop?category=${encodeURIComponent('Tổ chức sự kiện')}` }
                    ]
                }]
            };
        }

        const hasBlogs = finalNavItems.some(item => item.title === 'Tin tức');
        if (!hasBlogs) {
            const blogsItem = { id: 'static-blogs', title: 'Tin tức', path: '/page', order: 99, isVisible: true };
            finalNavItems.push(blogsItem);
            newMenuData['Tin tức'] = { path: '/page', columns: [] };
        }
        
        finalNavItems.sort((a, b) => (a.order || 0) - (b.order || 0));

        return { mainNavItems: finalNavItems, menuData: newMenuData };

    }, [settingsLoading, settings]);
    // ++ END: MODIFIED LOGIC ++
    
    const mainHeaderRef = useRef(null);
    const lastScrollY = useRef(0);
    
    useEffect(() => {
        const mainHeader = mainHeaderRef.current;
        if (mainHeader) setHeaderHeight(mainHeader.offsetHeight);
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (mainHeaderRef.current) setIsSticky(currentScrollY > mainHeaderRef.current.offsetHeight);
            setIsHeaderVisible(currentScrollY < lastScrollY.current || currentScrollY < 100);
            lastScrollY.current = currentScrollY;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 992 && isMenuOpen) setIsMenuOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMenuOpen]);

    return (
        <header className={`header-container ${className || ''}`}>
            {isSticky && <div style={{ height: `${headerHeight}px` }} />}
            <AnnouncementBar/>
            <MainHeader
                ref={mainHeaderRef}
                onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
                isSticky={isSticky}
                isVisible={isHeaderVisible}
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                menuData={menuData}
                mainNavItems={mainNavItems}
            />
            <MobileNav 
                isOpen={isMenuOpen} 
                onMenuToggle={() => setIsMenuOpen(false)}
                menuData={menuData}
                mainNavItems={mainNavItems}
            />
        </header>
    );
};

export default Header;