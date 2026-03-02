import React, { useEffect, useState, useRef } from 'react';

// --- GIỮ NGUYÊN LOGIC LẤY DỮ LIỆU CỦA BẠN ---
import { useAuth } from '../../../../Context/AuthContext';
import api from '../../../../services/api';
import { showSuccessToast, showErrorToast } from '../../../../Utils/toastHelper';

// ----- CÁC BIỂU TƯỢỢNG SVG (Thêm mới) -----
const ProfileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const SecurityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const SpinnerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spinner"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>;
const EyeIcon = ({ off = false }) => off ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);


// ----- COMPONENT CSS (Nâng cấp) -----
const Styles = () => (
  <style>{`
    /* ----- BIẾN CSS & STYLES CƠ BẢN ----- */
    :root {
      --font-primary: 'Be Vietnam Pro', 'Inter', sans-serif;
      --color-primary: #27548A;
      --color-primary-dark: #1f426b;
      --color-secondary: #CDD7E5;
      --color-text-dark: #333;
      --color-text-light: #666;
      --color-background: #FFFFFF;
      --color-background-light: #F8F9FA;
      --color-border: #E0E0E0;
      --color-success: #28a745;
      --color-error: #dc3545;
      --shadow-soft: 0 4px 12px rgba(0, 0, 0, 0.08);
      --shadow-medium: 0 8px 24px rgba(0, 0, 0, 0.1);
      --border-radius: 12px;
    }
    
    .container {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 15px;
    }

    /* ----- CẤU TRÚC TRANG CÀI ĐẶT ----- */
    .settings-page-wrapper {
        background-color: var(--color-background-light);
        padding: 60px 0;
        min-height: 100vh;
    }
    .page-header {
        background-color: var(--color-background);
        padding: 40px 0;
        margin-bottom: 40px;
        border-bottom: 1px solid var(--color-border);
    }
     .page-header h2 {
        font-size: 28px;
        font-weight: 700;
        color: var(--color-primary);
        margin-bottom: 4px;
     }
     .page-header p {
        font-size: 16px;
        color: var(--color-text-light);
     }
    .settings-layout {
        display: grid;
        grid-template-columns: 280px 1fr;
        gap: 30px;
        align-items: flex-start;
    }

    /* ----- SIDEBAR ----- */
    .settings-sidebar {
        background-color: var(--color-background);
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-soft);
        padding: 15px;
    }
    .sidebar-menu-group {
        margin-bottom: 15px;
    }
    .sidebar-menu-group-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text-light);
        padding: 10px 15px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .sidebar-menu-item {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 12px 16px;
        font-size: 16px;
        font-weight: 600;
        color: var(--color-text-dark);
        border-radius: 10px;
        cursor: pointer;
        transition: background-color 0.2s ease, color 0.2s ease;
        border: none;
        background: transparent;
        text-align: left;
    }
    .sidebar-menu-item:hover {
        background-color: var(--color-background-light);
    }
    .sidebar-menu-item.active {
        background-color: var(--color-primary);
        color: white;
    }
    .sidebar-menu-item.active svg {
        stroke: white;
    }

    /* ----- CONTENT AREA ----- */
    .settings-content {
        background-color: var(--color-background);
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-soft);
    }
    .content-area {
        padding: 40px;
    }
    .content-header h3 {
        font-size: 22px;
        font-weight: 700;
        color: var(--color-text-dark);
        margin-bottom: 8px;
    }
    .content-header p {
        font-size: 15px;
        color: var(--color-text-light);
        margin-bottom: 30px;
    }

    /* ----- Avatar Section ----- */
    .avatar-section {
        display: flex;
        align-items: center;
        gap: 24px;
        margin-bottom: 40px;
        padding-bottom: 30px;
        border-bottom: 1px solid var(--color-border);
    }
    .avatar-image {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        object-fit: cover;
        box-shadow: 0 0 0 4px var(--color-background), 0 0 0 5px var(--color-border);
        transition: transform 0.3s ease;
    }
    .avatar-image:hover {
        transform: scale(1.05);
    }
    .avatar-info { flex-grow: 1; }
    .avatar-info p {
        font-weight: 600;
        font-size: 18px;
        color: var(--color-text-dark);
        margin-bottom: 4px;
    }
    .avatar-info span {
        font-size: 14px;
        color: var(--color-text-light);
    }
    .avatar-actions { display: flex; gap: 10px; }
    
    /* ----- FORM ELEMENTS ----- */
    .form-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 24px;
    }
    .form-grid.two-columns {
        grid-template-columns: 1fr 1fr;
    }
    .form-group.full-width {
        grid-column: 1 / -1;
    }
    .form-group label {
        display: block;
        font-weight: 600;
        margin-bottom: 8px;
        font-size: 14px;
    }
    .input-wrapper {
        position: relative;
    }
    .form-input {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid var(--color-border);
        border-radius: 10px;
        font-size: 16px;
        transition: border-color 0.3s ease, box-shadow 0.3s ease;
        background-color: var(--color-background-light);
    }
    .form-input:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(39, 84, 138, 0.2);
        background-color: var(--color-background);
    }
    .form-input:disabled {
        background-color: #e9ecef;
        cursor: not-allowed;
    }
    .password-toggle-btn {
        position: absolute;
        top: 50%;
        right: 15px;
        transform: translateY(-50%);
        background: transparent;
        border: none;
        cursor: pointer;
        color: var(--color-text-light);
    }
    
    .form-footer {
        margin-top: 40px;
        display: flex;
        justify-content: flex-end;
    }
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 28px; font-size: 15px; font-weight: 700; border-radius: 10px; cursor: pointer; transition: all 0.3s ease; text-transform: uppercase; border: none; }
    .btn-primary { background-color: var(--color-primary); color: white; }
    .btn-primary:hover:not(:disabled) { background-color: var(--color-primary-dark); transform: translateY(-2px); box-shadow: var(--shadow-medium); }
    .btn-secondary { background-color: var(--color-secondary); color: var(--color-text-dark); }
    .btn-secondary:hover:not(:disabled) { background-color: #b6c3d4; }
    .btn:disabled { opacity: 0.7; cursor: not-allowed; }

    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .spinner { animation: spin 1s linear infinite; }

    /* ----- TOAST NOTIFICATION ----- */
    .toast-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-medium);
        color: white;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 9999;
        transform: translateY(200%);
        transition: transform 0.5s ease-in-out;
    }
    .toast-notification.show {
        transform: translateY(0);
    }
    .toast-notification.success {
        background-color: var(--color-success);
    }
    .toast-notification.error {
        background-color: var(--color-error);
    }
    .toast-close-btn {
        background: transparent;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        opacity: 0.8;
        padding: 0;
        line-height: 1;
    }
    .toast-close-btn:hover {
        opacity: 1;
    }


    /* ----- RESPONSIVE ----- */
    @media (max-width: 992px) {
        .settings-layout { grid-template-columns: 1fr; }
        .settings-sidebar { margin-bottom: 30px; }
    }
    @media (max-width: 768px) {
        .form-grid.two-columns { grid-template-columns: 1fr; }
        .avatar-section { flex-direction: column; text-align: center; }
        .avatar-actions { margin-top: 15px; }
        .page-header { padding: 30px 0; margin-bottom: 30px; }
        .content-area { padding: 25px; }
    }
  `}</style>
);

// ----- COMPONENT CON: ProfileSettings -----
const ProfileSettings = ({ user, onUpdate, onAvatarUpdate }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', phone: '', address: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                address: user.address || '',
            });
            setPreview(user.avatar);
        }
    }, [user]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarUpload = async () => {
        if (!selectedFile) return;
        setIsUploading(true);
        await onAvatarUpdate(selectedFile);
        setIsUploading(false);
        setSelectedFile(null);
    };

    const triggerFileSelect = () => fileInputRef.current.click();

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        await onUpdate(formData);
        setIsLoading(false);
    };

    return (
        <div className="content-area">
            <div className="content-header">
                <h3>Thông tin hồ sơ</h3>
                <p>Cập nhật thông tin cá nhân và ảnh đại diện của bạn.</p>
            </div>
            
            <div className="avatar-section">
                <img className="avatar-image" src={preview || "https://placehold.co/100x100/CDD7E5/333?text=A"} alt="Ảnh đại diện" />
                <div className="avatar-info">
                    <p>{user?.username || 'Username'}</p>
                    <span>Thay đổi ảnh đại diện của bạn</span>
                </div>
                <div className="avatar-actions">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
                    <button onClick={triggerFileSelect} className="btn btn-secondary" disabled={isUploading}>
                        Chọn ảnh
                    </button>
                    {selectedFile && (
                        <button onClick={handleAvatarUpload} className="btn btn-primary" disabled={isUploading}>
                            {isUploading ? <SpinnerIcon /> : 'Lưu ảnh'}
                        </button>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-grid two-columns">
                    <div className="form-group">
                        <label htmlFor="lastName">Họ</label>
                        <input id="lastName" type="text" className="form-input" title="Nhập họ của bạn" placeholder="Ví dụ: Nguyễn Văn" value={formData.lastName} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="firstName">Tên</label>
                        <input id="firstName" type="text" className="form-input" title="Nhập tên của bạn" placeholder="Ví dụ: An" value={formData.firstName} onChange={handleInputChange} />
                    </div>
                    <div className="form-group full-width">
                        <label htmlFor="username">Tên đăng nhập</label>
                        <input id="username" type="text" className="form-input" title="Tên đăng nhập không thể thay đổi" value={user?.username || ''} disabled />
                    </div>
                    <div className="form-group full-width">
                        <label htmlFor="email">Email</label>
                        <input id="email" type="email" className="form-input" title="Email không thể thay đổi" value={user?.email || ''} disabled />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phone">Số điện thoại</label>
                        <input id="phone" type="tel" className="form-input" title="Nhập số điện thoại của bạn" placeholder="Ví dụ: 0987654321" value={formData.phone} onChange={handleInputChange} />
                    </div>
                     <div className="form-group">
                        <label htmlFor="address">Địa chỉ</label>
                        <input id="address" type="text" className="form-input" title="Nhập địa chỉ của bạn" placeholder="Ví dụ: 123 Đường ABC, TP.HCM" value={formData.address} onChange={handleInputChange} />
                    </div>
                </div>
                <div className="form-footer">
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? <><SpinnerIcon /> Đang lưu...</> : 'Lưu thay đổi'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// ----- COMPONENT MỚI: SecuritySettings -----
const SecuritySettings = ({ onChangePassword }) => {
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPasswords, setShowPasswords] = useState({});

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setPasswords(prev => ({ ...prev, [id]: value }));
        if (id === 'confirmPassword' && passwords.newPassword !== value) {
            setError('Mật khẩu xác nhận không khớp.');
        } else {
            setError('');
        }
    };
    
    const toggleShowPassword = (field) => {
        setShowPasswords(prev => ({...prev, [field]: !prev[field]}));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }
        if (passwords.newPassword.length < 8) {
            setError('Mật khẩu mới phải có ít nhất 8 ký tự.');
            return;
        }
        setError('');
        setIsLoading(true);
        await onChangePassword(passwords);
        setIsLoading(false);
        // Reset form sau khi submit
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    return (
        <div className="content-area">
            <div className="content-header">
                <h3>Bảo mật</h3>
                <p>Thay đổi mật khẩu để bảo vệ tài khoản của bạn.</p>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
                        <div className="input-wrapper">
                            <input 
                                id="currentPassword" 
                                type={showPasswords.current ? 'text' : 'password'}
                                className="form-input" 
                                value={passwords.currentPassword}
                                onChange={handleInputChange}
                                required 
                                placeholder="Nhập mật khẩu hiện tại của bạn"
                                title="Điền mật khẩu bạn đang sử dụng để đăng nhập."
                            />
                            <button type="button" onClick={() => toggleShowPassword('current')} className="password-toggle-btn">
                                <EyeIcon off={!showPasswords.current} />
                            </button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="newPassword">Mật khẩu mới</label>
                         <div className="input-wrapper">
                            <input 
                                id="newPassword" 
                                type={showPasswords.new ? 'text' : 'password'}
                                className="form-input" 
                                value={passwords.newPassword}
                                onChange={handleInputChange}
                                required
                                minLength="8"
                                placeholder="Ít nhất 8 ký tự"
                                title="Nhập mật khẩu mới. Mật khẩu phải có ít nhất 8 ký tự."
                            />
                             <button type="button" onClick={() => toggleShowPassword('new')} className="password-toggle-btn">
                                 <EyeIcon off={!showPasswords.new} />
                            </button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                        <div className="input-wrapper">
                            <input 
                                id="confirmPassword" 
                                type={showPasswords.confirm ? 'text' : 'password'}
                                className="form-input" 
                                value={passwords.confirmPassword}
                                onChange={handleInputChange}
                                required
                                placeholder="Nhập lại mật khẩu mới"
                                title="Xác nhận lại mật khẩu mới của bạn để đảm bảo chính xác."
                            />
                             <button type="button" onClick={() => toggleShowPassword('confirm')} className="password-toggle-btn">
                                 <EyeIcon off={!showPasswords.confirm} />
                            </button>
                        </div>
                        {error && <p style={{ color: 'var(--color-error)', fontSize: '14px', marginTop: '8px' }}>{error}</p>}
                    </div>
                </div>
                <div className="form-footer">
                    <button type="submit" className="btn btn-primary" disabled={isLoading || !!error}>
                        {isLoading ? <><SpinnerIcon /> Đang đổi...</> : 'Đổi mật khẩu'}
                    </button>
                </div>
            </form>
        </div>
    );
};


// ----- COMPONENT CHÍNH: AccountSettingsPage -----
const AccountSettingsPage = () => {
    // --- GIỮ NGUYÊN LOGIC DỮ LIỆU GỐC CỦA BẠN ---
    const { user: authUser, setUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [userData, setUserData] = useState(null);

    // --- THÊM STATE CHO TOAST NOTIFICATION ---
    // const [toast, setToast] = useState({ message: '', type: '', visible: false });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await api.get('/users/me');
                setUserData(response.data);
            } catch (error) {
                console.error("Failed to fetch user data:", error);
                showErrorToast('Không thể tải dữ liệu người dùng.'); // <-- THAY THẾ
            }
        };
        fetchUserData();
    }, []);

    // --- GIỮ NGUYÊN CÁC HÀM XỬ LÝ, CHỈ THAY ALERT BẰNG TOAST ---
    const handleUpdateProfile = async (formData) => {
        try {
            const response = await api.put('/users/me', formData);
            const updatedUser = response.data.data;
            setUserData(updatedUser);
            setUser(updatedUser);
            showSuccessToast('Cập nhật thông tin thành công!'); // <-- THAY THẾ
        } catch (error) {
            console.error("Failed to update user data:", error);
            showErrorToast('Cập nhật thất bại. Vui lòng thử lại.'); // <-- THAY THẾ
        }
    };

    const handleUpdateAvatar = async (file) => {
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await api.put('/users/me/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const updatedUser = response.data.data;
            setUserData(updatedUser);
            setUser(updatedUser);
            showSuccessToast('Cập nhật ảnh đại diện thành công!');
        } catch (error) {
            console.error("Failed to update avatar:", error);
            showErrorToast('Cập nhật ảnh đại diện thất bại.', 'error');
        }
    };
    
    // --- HÀM MỚI: Xử lý đổi mật khẩu ---
    const handleChangePassword = async (passwordData) => {
        try {
            // Giả sử bạn có endpoint này ở backend
            await api.put('/users/me/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            showSuccessToast('Đổi mật khẩu thành công!'); 
        } catch (error) {
            console.error("Failed to change password:", error);
            const errorMessage = error.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.';
            showErrorToast(errorMessage);
        }
    };
    
    const displayUser = userData || authUser;

    return (
        <main className="settings-page-wrapper">
            <Styles />
            <div className="page-header">
                <div className="container">
                    <h2>Thiết lập tài khoản</h2>
                    <p>Quản lý thông tin cá nhân và bảo mật cho tài khoản {displayUser?.email}</p>
                </div>
            </div>
            
            <div className="container">
                <div className="settings-layout">
                    <aside className="settings-sidebar">
                        <div className="sidebar-menu-group">
                            <div className="sidebar-menu-group-title">Cá nhân</div>
                            <button className={`sidebar-menu-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                                <ProfileIcon />
                                <span>Thiết lập hồ sơ</span>
                            </button>
                            <button className={`sidebar-menu-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
                                <SecurityIcon />
                                <span>Bảo mật</span>
                            </button>
                        </div>
                    </aside>
                    
                    <div className="settings-content">
                        {activeTab === 'profile' && (
                            <ProfileSettings user={displayUser} onUpdate={handleUpdateProfile} onAvatarUpdate={handleUpdateAvatar} />
                        )}
                        {activeTab === 'security' && (
                           <SecuritySettings onChangePassword={handleChangePassword} />
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default AccountSettingsPage;