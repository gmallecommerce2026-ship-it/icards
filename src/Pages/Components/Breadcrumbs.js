// src/Pages/Components/Breadcrumbs.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../services/api';
import './Breadcrumbs.css';

// Hàm helper để convert slug thành text dễ nhìn (Fallback khi không có trong map)
const formatSlugToText = (slug) => {
    if (!slug) return '';
    const text = decodeURIComponent(slug).replace(/-/g, ' ');
    // Viết hoa chữ cái đầu của mỗi từ
    return text.replace(/\b\w/g, char => char.toUpperCase());
};

const DynamicBreadcrumbItem = ({ type, id }) => {
    const [name, setName] = useState('...'); // Hiển thị '...' trong khi tải

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                let endpoint = '';
                let nameField = 'title'; // Trường tên mặc định

                // Xác định API endpoint và trường tên dựa trên loại trang
                if (type === 'product') {
                    endpoint = `/products/${id}`;
                } else if (type === 'invitation') {
                    endpoint = `/invitation-templates/${id}`;
                } else if (type === 'invitation-management') {
                    endpoint = `/invitations/${id}`; // API cho thiệp đã tạo
                    nameField = 'slug'; // Tên của thiệp đã tạo nằm trong trường 'slug'
                } else {
                    if (isMounted) setName(id);
                    return;
                }

                const response = await api.get(endpoint);
                const fetchedName = response.data?.data?.[nameField] || response.data?.data?.title || id;
                
                if (isMounted) {
                    setName(fetchedName);
                }
            } catch (error) {
                console.error("Lỗi khi tải tên cho breadcrumb:", error);
                if (isMounted) {
                    setName(id); // Nếu lỗi, hiển thị lại ID
                }
            }
        };

        fetchData();
        return () => { isMounted = false; };
    }, [type, id]);

    return <span className="breadcrumb-active"> / {name}</span>;
};

// Cung cấp thêm prop customBreadcrumbs để ghi đè khi cần
const Breadcrumbs = ({ className, customBreadcrumbs }) => {
    const location = useLocation();
    
    // Nếu component cha truyền customBreadcrumbs, ưu tiên dùng nó (Dùng cho trang Detail)
    if (customBreadcrumbs && customBreadcrumbs.length > 0) {
        return (
            <nav className={`breadcrumbs-container ${className || ''}`}>
                <Link to="/" className="breadcrumb-link">Trang chủ</Link>
                {customBreadcrumbs.map((crumb, index) => {
                    const isLast = index === customBreadcrumbs.length - 1;
                    return isLast ? (
                        <span key={index} className="breadcrumb-active"> / {crumb.label}</span>
                    ) : (
                        <Link key={index} to={crumb.path} className="breadcrumb-link"> / {crumb.label}</Link>
                    );
                })}
            </nav>
        );
    }

    const pathnames = location.pathname.split('/').filter((x) => x);

    // Mở rộng map cho các category/group phổ biến để hiển thị chính xác tiếng Việt có dấu
    const breadcrumbNameMap = {
        'invitations': 'Mẫu thiệp', // Đổi "Tất cả mẫu thiệp" thành "Mẫu thiệp" cho đỡ rườm rà
        'product': 'Sản phẩm',
        'invitation': 'Mẫu thiệp',
        'shop': 'Cửa hàng',
        'category': null, // Thêm null để dễ handle filter
        'group': null,
        'type': null,
        // Map sẵn một số slug tiếng Việt
        'thiep-chuc-mung': 'Thiệp Chúc Mừng',
        'thiep-mung-ngay-le': 'Thiệp Mừng Ngày Lễ',
        'thiep-mung-nam-moi': 'Thiệp Mừng Năm Mới',
        'thiep-cuoi': 'Thiệp Cưới',
    };

    const breadcrumbLinkMap = {
        'product': '/shop',
        'invitation': '/invitations'
    };

    if (pathnames.length === 0) return null;

    // Các keyword cần ẩn khỏi breadcrumb path
    const hiddenKeywords = ['category', 'group', 'type'];

    return (
        <nav className={`breadcrumbs-container ${className || ''}`}>
            <Link to="/" className="breadcrumb-link">Trang chủ</Link>
            {pathnames.map((value, index) => {
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                const prevPath = pathnames[index - 1];

                // Bỏ qua các params phân cấp của router
                if (hiddenKeywords.includes(value)) return null;

                const isLast = index === pathnames.length - 1;
                if (isLast && (prevPath === 'product' || prevPath === 'invitation' || prevPath === 'invitation-management')) {
                    return <DynamicBreadcrumbItem key={to} type={prevPath} id={value} />;
                }
                
                // Ưu tiên lấy từ map, nếu không có thì tự động format slug (thiep-chuc-mung -> Thiep Chuc Mung)
                const displayName = breadcrumbNameMap[value] || formatSlugToText(value);
                const linkPath = breadcrumbLinkMap[value] || to;

                return isLast ? (
                    <span key={to} className="breadcrumb-active"> / {displayName}</span>
                ) : (
                    <Link key={to} to={linkPath} className="breadcrumb-link"> / {displayName}</Link>
                );
            })}
        </nav>
    );
};

export default Breadcrumbs;