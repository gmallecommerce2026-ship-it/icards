import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../services/api';
import './Breadcrumbs.css';

const formatSlugToText = (slug) => {
    if (!slug) return '';
    const text = decodeURIComponent(slug).replace(/-/g, ' ');
    return text.replace(/\b\w/g, char => char.toUpperCase());
};

const DynamicBreadcrumbItem = ({ type, id }) => {
    const [name, setName] = useState('...');

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                let endpoint = '';
                let nameField = 'title';

                if (type === 'product') {
                    endpoint = `/products/${id}`;
                } else if (type === 'invitation') {
                    endpoint = `/invitation-templates/${id}`;
                } else if (type === 'invitation-management') {
                    endpoint = `/invitations/${id}`;
                    nameField = 'slug';
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
                    setName(id);
                }
            }
        };

        fetchData();
        return () => { isMounted = false; };
    }, [type, id]);

    return <span className="breadcrumb-active"> / {name}</span>;
};

const Breadcrumbs = ({ className, customBreadcrumbs }) => {
    const location = useLocation();
    
    if (customBreadcrumbs && customBreadcrumbs.length > 0) {
        return (
            <div className={`breadcrumbs-wrapper ${className || ''}`}>
                <nav className="breadcrumbs-container">
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
            </div>
        );
    }

    const pathnames = location.pathname.split('/').filter((x) => x);

    const breadcrumbNameMap = {
        'invitations': 'Mẫu thiệp',
        'product': 'Sản phẩm',
        'invitation': 'Mẫu thiệp',
        'shop': 'Cửa hàng',
        'category': null, 
        'group': null,
        'type': null,
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
    const hiddenKeywords = ['category', 'group', 'type'];

    return (
        <div className={`breadcrumbs-wrapper ${className || ''}`}>
            <nav className="breadcrumbs-container">
                <Link to="/" className="breadcrumb-link">Trang chủ</Link>
                {pathnames.map((value, index) => {
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const prevPath = pathnames[index - 1];

                    if (hiddenKeywords.includes(value)) return null;

                    const isLast = index === pathnames.length - 1;
                    if (isLast && (prevPath === 'product' || prevPath === 'invitation' || prevPath === 'invitation-management')) {
                        return <DynamicBreadcrumbItem key={to} type={prevPath} id={value} />;
                    }
                    
                    const displayName = breadcrumbNameMap[value] || formatSlugToText(value);
                    const linkPath = breadcrumbLinkMap[value] || to;

                    return isLast ? (
                        <span key={to} className="breadcrumb-active"> / {displayName}</span>
                    ) : (
                        <Link key={to} to={linkPath} className="breadcrumb-link"> / {displayName}</Link>
                    );
                })}
            </nav>
        </div>
    );
};

export default Breadcrumbs;