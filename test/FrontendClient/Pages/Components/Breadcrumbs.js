// src/Pages/Components/Breadcrumbs.js

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../services/api';
import './Breadcrumbs.css';

// Component con để xử lý việc tải tên cho các trang chi tiết
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


const Breadcrumbs = ({ className }) => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    const breadcrumbNameMap = {
        'invitations': 'Tất cả mẫu thiệp',
        'product': 'Sản phẩm',
        'invitation': 'Mẫu thiệp',
        'shop': 'Cửa hàng',
        'professional': 'Chuyên nghiệp',
        'account-settings': 'Thiết lập tài khoản',
        'invitation-management': 'Quản lý thiệp mời',
        
        // Mapping thêm cho các slug tiếng Việt để hiển thị đẹp hơn
        'thiep-theo-mua': 'Thiệp Theo Mùa',
        'trang-trong': 'Trang Trọng',
        'hien-dai': 'Hiện Đại',
        'truyen-thong': 'Truyền Thống',
        'toi-gian': 'Tối Giản',
        'thiep-cuoi': 'Thiệp Cưới',
        'thiep-sinh-nhat': 'Thiệp Sinh Nhật',
        'thiep-thoi-noi': 'Thiệp Thôi Nôi',
        'thiep-tan-gia': 'Thiệp Tân Gia',
    };

    // --- BẮT ĐẦU SỬA LỖI ---
    const breadcrumbLinkMap = {
        'product': '/shop',
        'invitation': '/invitations' // Thêm dòng này để map đúng về trang danh sách
    };
    // --- KẾT THÚC SỬA LỖI ---

    if (pathnames.length === 0) {
        return null;
    }

    return (
        <nav className={`breadcrumbs-container ${className || ''}`}>
            <Link to="/" className="breadcrumb-link">Trang chủ</Link>
            {pathnames.map((value, index) => {
                const isLast = index === pathnames.length - 1;
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                const prevPath = pathnames[index - 1];

                // --- CHỈNH SỬA: Ẩn cả 'category' và 'type' khỏi giao diện ---
                if (value === 'category' || value === 'type') {
                    return null;
                }
                // ----------------------------------------------------------

                if (isLast && (prevPath === 'product' || prevPath === 'invitation' || prevPath === 'invitation-management')) {
                    return <DynamicBreadcrumbItem key={to} type={prevPath} id={value} />;
                }
                
                // Ưu tiên lấy tên từ map, nếu không có thì format lại slug (bỏ dấu gạch ngang)
                const displayName = breadcrumbNameMap[value] || decodeURIComponent(value).replace(/-/g, ' ');
                
                // Sử dụng breadcrumbLinkMap để lấy đường dẫn đúng nếu có
                const linkPath = breadcrumbLinkMap[value] || to;

                return isLast ? (
                    <span key={to} className="breadcrumb-active">
                        {` / ${displayName}`}
                    </span>
                ) : (
                    <Link key={to} to={linkPath} className="breadcrumb-link">
                        {` / ${displayName}`}
                    </Link>
                );
            })}
        </nav>
    );
};

export default Breadcrumbs;