import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, ShoppingBag } from 'lucide-react';

export const BlogNavbar = ({
    categories = [],
    topicsTree = [],
    activeCategory = 'all',
    onSelectCategory,
    onSearch,
    initialSearch = ''
}) => {
    const [searchValue, setSearchValue] = useState(initialSearch);

    // Quản lý trạng thái hover dropdown
    const [hoveredMenu, setHoveredMenu] = useState(null); // { item, left, top }
    const hideTimeoutRef = useRef(null);

    // Ref cho thanh cuộn ngang và khung navbar
    const scrollContainerRef = useRef(null);
    const navWrapperRef = useRef(null);

    useEffect(() => {
        setSearchValue(initialSearch);
    }, [initialSearch]);

    // 1. TÍNH NĂNG: ĐẶT CON TRỎ CHUỘT VÀO ĐỂ CUỘN NGANG KHI LĂN CHUỘT (WHEEL)
    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;

        const handleWheel = (e) => {
            if (e.deltaY !== 0) {
                e.preventDefault();
                el.scrollLeft += e.deltaY * 1.2; // Cuộn ngang theo con lăn chuột dọc
                // Đóng dropdown khi người dùng đang cuộn nhanh để tránh lệch vị trí
                if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
                setHoveredMenu(null);
            }
        };

        el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleWheel);
    }, []);


    // 3. XỬ LÝ HOVER MỞ DROPDOWN MƯỢT MÀ KHÔNG BỊ CẮT BỞI OVERFLOW
    const handleMouseEnterItem = (item, element) => {
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        if (!item.children || item.children.length === 0) {
            setHoveredMenu(null);
            return;
        }

        const navRect = navWrapperRef.current?.getBoundingClientRect();
        const btnRect = element.getBoundingClientRect();

        if (navRect) {
            // Đặt vị trí X của Dropdown đúng vào tọa độ của nút đang hover
            setHoveredMenu({
                item,
                left: Math.max(10, btnRect.left - navRect.left),
                top: navRect.height
            });
        }
    };

    const handleMouseLeaveItem = () => {
        hideTimeoutRef.current = setTimeout(() => {
            setHoveredMenu(null);
        }, 220); // Độ trễ 220ms giúp rê chuột vào menu con không bị tắt
    };

    const handleDropdownMouseEnter = () => {
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };

    const handleDropdownMouseLeave = () => {
        hideTimeoutRef.current = setTimeout(() => {
            setHoveredMenu(null);
        }, 150);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (onSearch) onSearch(searchValue.trim());
    };

    return (
        <nav className="gm-newspaper-navbar" ref={navWrapperRef}>
            <div className="gm-container gm-navbar-inner">

                {/* 1. THANH CUỘN NGANG CHỨA CÁC DANH MỤC */}
                <div className="gm-nav-scroll-track" ref={scrollContainerRef}>
                    <ul className="gm-nav-root-menu">
                        {/* Nút TRANG CHỦ */}
                        <li className="gm-nav-root-item">
                            <button
                                className={`gm-nav-root-btn ${activeCategory === 'all' ? 'is-active' : ''}`}
                                onClick={() => {
                                    setHoveredMenu(null);
                                    onSelectCategory('all');
                                }}
                            >
                                <span>TRANG CHỦ</span>
                            </button>
                        </li>

                        {/* Danh mục cấp 1 */}
                        {categories.map((cat) => {
                            const catId = cat._id || cat.id;
                            const isActive = activeCategory === catId;
                            const isHovered = hoveredMenu?.item?._id === catId || hoveredMenu?.item?.id === catId;

                            return (
                                <li
                                    key={catId}
                                    className="gm-nav-root-item"
                                    onMouseEnter={(e) => handleMouseEnterItem(cat, e.currentTarget)}
                                    onMouseLeave={handleMouseLeaveItem}
                                >
                                    <button
                                        className={`gm-nav-root-btn ${isActive ? 'is-active' : ''} ${isHovered ? 'is-hovered' : ''}`}
                                        onClick={() => {
                                            setHoveredMenu(null);
                                            onSelectCategory(catId);
                                        }}
                                    >
                                        <span>{cat.name}</span>
                                        {cat.children && cat.children.length > 0 && (
                                            <ChevronDown size={11} className={`gm-arrow-icon ${isHovered ? 'rotate-180' : ''}`} />
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* 2. CỘT PHẢI CỐ ĐỊNH: Ô TÌM KIẾM BO TRÒN & ICON TÚI XÁCH (ẢNH MẪU) */}
                <div className="gm-navbar-right">
                    <form className="gm-search-pill-wrapper" onSubmit={handleSearchSubmit}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="gm-search-pill-input"
                        />
                        <button type="submit" className="gm-search-pill-btn" aria-label="Tìm kiếm">
                            <Search size={14} />
                        </button>
                    </form>

                    <button className="gm-shopping-bag-btn" aria-label="Giỏ hàng" onClick={() => window.location.href = '/shop'}>
                        <ShoppingBag size={18} strokeWidth={1.8} />
                    </button>
                </div>

            </div>

            {/* 3. DROPDOWN ĐA CẤP (NẰM NGOÀI THANH CUỘN NGANG NÊN 100% KHÔNG BỊ ẨN) */}
            {hoveredMenu && hoveredMenu.item?.children && (
                <div
                    className="gm-floating-dropdown-wrapper"
                    style={{
                        left: `${hoveredMenu.left}px`,
                        top: `${hoveredMenu.top}px`
                    }}
                    onMouseEnter={handleDropdownMouseEnter}
                    onMouseLeave={handleDropdownMouseLeave}
                >
                    <ul className="gm-dropdown-level2-list">
                        {hoveredMenu.item.children.map((subItem) => {
                            const subId = subItem._id || subItem.id;
                            const hasSubChildren = subItem.children && subItem.children.length > 0;

                            return (
                                <li key={subId} className="gm-dropdown-level2-item">
                                    <button
                                        className="gm-dropdown-btn"
                                        onClick={() => {
                                            setHoveredMenu(null);
                                            onSelectCategory(subId);
                                        }}
                                    >
                                        <span>{subItem.name}</span>
                                        {hasSubChildren && <ChevronRight size={13} className="gm-sub-arrow" />}
                                    </button>

                                    {/* DROPDOWN CẤP 3: BUNG SANG PHẢI KHI HOVER VÀO CẤP 2 */}
                                    {hasSubChildren && (
                                        <div className="gm-dropdown-level3-wrapper">
                                            <ul className="gm-dropdown-level3-list">
                                                {subItem.children.map((thirdItem) => {
                                                    const thirdId = thirdItem._id || thirdItem.id;
                                                    return (
                                                        <li key={thirdId} className="gm-dropdown-level3-item">
                                                            <button
                                                                className="gm-dropdown-btn"
                                                                onClick={() => {
                                                                    setHoveredMenu(null);
                                                                    onSelectCategory(thirdId);
                                                                }}
                                                            >
                                                                <span>{thirdItem.name}</span>
                                                            </button>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </nav>
    );
};