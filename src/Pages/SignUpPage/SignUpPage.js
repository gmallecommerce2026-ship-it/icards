import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { handlePromiseToast } from '../../Utils/toastHelper';

// --- CÁC ICON (SVG) ĐỂ SỬ DỤNG ---
const BackIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18L9 12L15 6" stroke="#4A4A4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.825 10.2063C19.825 9.38129 19.75 8.58129 19.6 7.80629H10.125V11.2563H15.7125C15.4625 12.4313 14.6375 14.1563 13.2125 15.1563L13.1812 15.1875L15.7687 17.1563L15.9187 17.1875C17.9625 15.3563 19.825 12.8563 19.825 10.2063Z" fill="#4285F4"></path><path d="M10.125 20C12.825 20 15.0125 19.1375 16.65 17.75L14.0625 15.7812C13.2125 16.3125 12.0375 16.6875 10.125 16.6875C7.575 16.6875 5.45 15.0125 4.675 12.7187L4.6 12.7187L1.9125 14.7187L1.85 14.8437C3.4875 17.9375 6.5625 20 10.125 20Z" fill="#34A853"></path><path d="M4.675 12.7187C4.475 12.1312 4.3625 11.5062 4.3625 10.8437C4.3625 10.1812 4.475 9.55624 4.675 8.96874L4.6625 8.90624L1.8625 6.78124L1.85 6.65624C1.0375 8.05624 0.5 9.70624 0.5 11.3437C0.5 12.9812 1.0375 14.6312 1.85 16.0312L4.675 12.7187Z" fill="#FBBC05"></path><path d="M10.125 4.53125C11.725 4.53125 12.8625 5.11875 13.75 5.96875L16.3375 3.34375C14.6125 1.76875 12.425 0.875 10.125 0.875C6.5625 0.875 3.4875 2.9375 1.85 6.03125L4.675 8.96875C5.45 6.675 7.575 4.53125 10.125 4.53125Z" fill="#EB4335"></path></svg>
);
const FacebookIcon = () => (
    <svg width="10" height="20" viewBox="0 0 10 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.6543 19.5V10.6055H9.5332L9.96777 7.30957H6.6543V5.15039C6.6543 4.19531 6.9209 3.55957 8.12891 3.55957L10.125 3.55908V0.52832C9.79199 0.491211 8.71094 0.416016 7.46484 0.416016C4.86133 0.416016 3.08008 2.05371 3.08008 4.83301V7.30957H0.25V10.6055H3.08008V19.5H6.6543Z" fill="#1877F2"></path></svg>
);

// --- COMPONENT CSS ---
const Styles = () => (
    <style>{`
      /* (Giữ nguyên CSS từ file gốc của bạn) */
      .auth-page-wrapper {
          font-family: 'SVN-Gilroy', sans-serif;
          background-color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 20px;
      }

      .auth-container {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        gap: 30px;
        width: 100%;
      }

      .auth-header {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 15px;
        text-align: center;
        width: 100%;
      }

      .auth-header h1 {
        font-size: 36px;
        color: rgba(0,0,0,1);
        line-height: 1.2;
        text-transform: uppercase;
        letter-spacing: 0.02em;
        font-weight: 700;
        white-space: nowrap;
      }

      .auth-header p {
        font-size: 16px;
        width: 100%;
        max-width: 500px;
        color: rgba(102,102,102,1);
        line-height: 1.5;
        font-weight: 500;
      }

      .auth-form {
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: 100%;
        max-width: 500px;
      }

      .form-input {
        height: 60.5px;
        width: 100%;
        border: 0.5px solid rgb(128,128,128);
        padding: 11px 20px;
        font-family: 'SVN-Gilroy', sans-serif;
        font-size: 16px;
        font-weight: 500;
        color: #333;
        background-color: #fff;
        border-radius: 0; 
      }

      .form-input::placeholder {
        color: rgba(102,102,102,1);
      }
      
      .form-input:focus {
          outline: 1px solid #27548A;
      }
      
      .form-input.is-invalid {
        border-color: #dc3545;
      }

      .invalid-feedback {
        color: #dc3545;
        font-size: 14px;
        margin-top: -8px;
        margin-bottom: 8px;
        text-align: left;
      }

      .form-actions {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        margin-top: 28px;
        width: 100%;
        max-width: 500px;
      }
      
      .main-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
      }

      .btn {
          width: 100%;
          border: 0.5px solid rgb(0,0,0);
          height: 60px;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          font-family: 'SVN-Gilroy', sans-serif;
          transition: opacity 0.2s;
          text-transform: uppercase;
          font-weight: 700;
          border-radius: 0;
      }
      .btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
      .btn:hover:not(:disabled) {
          opacity: 0.9;
      }

      .btn-primary {
          background-color: #27548A;
          color: rgba(255,255,255,1);
          font-size: 20px;
          letter-spacing: 0.02em;
          border-color: #27548A;
      }

      .social-buttons {
          display: flex;
          flex-direction: row;
          gap: 12px;
          width: 100%;
      }

      .btn-social {
          border-color: rgb(128,128,128);
          width: 100%;
          height: 48px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          background-color: #fff;
          font-size: 16px;
          color: rgba(51,51,51,1);
          text-transform: none;
          font-weight: bold;
      }
      
      .auth-switch {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 500;
        line-height: 21px;
        width: 100%;
      }
      .auth-switch span {
          color: rgba(102,102,102,1);
      }
      .auth-switch a {
          color: #27548A;
          text-decoration: none;
          font-weight: bold;
      }

      .back-to-home {
        position: fixed;
        top: 30px;
        left: 30px;
      }

      @media (max-width: 768px) {
          .auth-header h1 {
              font-size: 28px;
              white-space: normal;
          }
          .social-buttons {
              flex-direction: column;
          }
          .auth-header p,
          .auth-form,
          .form-actions {
              max-width: 100%;
          }
      }
    `}</style>
);


const RegisterPage = () => {
    const { register } = useAuth(); 
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Xóa lỗi khi người dùng bắt đầu nhập lại
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.username) newErrors.username = 'Tên đăng nhập là bắt buộc.';
        else if (/\s/.test(formData.username)) newErrors.username = 'Tên đăng nhập không được chứa dấu cách.';
        
        if (!formData.email) newErrors.email = 'Email là bắt buộc.';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ.';
        
        if (!formData.password) newErrors.password = 'Mật khẩu là bắt buộc.';
        else if (formData.password.length < 8) newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        setIsLoading(true);

        const registerPromise = register(formData.username, formData.email, formData.password);

        handlePromiseToast(registerPromise, {
            pending: 'Đang xử lý đăng ký...',
            success: 'Đăng ký thành công! Vui lòng đăng nhập.',
            error: 'Đăng ký thất bại!',
        });

        try {
            await registerPromise;
            setTimeout(() => navigate('/sign-in'), 2000);
        } catch (err) {
            // Lỗi đã được toast xử lý
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = (provider) => {
        const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        window.location.href = `${backendUrl}/api/auth/${provider}`;
    };

    return (
        <>
            <Styles />
            <div className="auth-page-wrapper">
                <Link to="/" className="back-to-home">
                    <BackIcon /> Trở về trang chủ
                </Link>
                <div className="auth-container">
                    <div className="auth-header">
                        <h1>Tạo tài khoản mới</h1>
                        <p>Cùng iCards kết nối và chia sẻ những điều hạnh phúc đến mọi người trong cuộc sống của bạn.</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit} noValidate>
                        <input
                            type="text"
                            name="username"
                            className={`form-input ${errors.username ? 'is-invalid' : ''}`}
                            placeholder="Tên đăng nhập (không có dấu cách)"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                        {errors.username && <div className="invalid-feedback">{errors.username}</div>}

                        <input
                            type="email"
                            name="email"
                            className={`form-input ${errors.email ? 'is-invalid' : ''}`}
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}

                        <input
                            type="password"
                            name="password"
                            className={`form-input ${errors.password ? 'is-invalid' : ''}`}
                            placeholder="Mật khẩu"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                    </form>

                    <div className="form-actions">
                        <div className="main-actions">
                            <button type="submit" className="btn btn-primary" onClick={handleSubmit} disabled={isLoading}>
                                {isLoading ? 'Đang đăng ký...' : 'Đăng Ký'}
                            </button>
                            <div className="social-buttons">
                                <button type="button" className="btn btn-social" onClick={() => handleSocialLogin('google')}>
                                    <GoogleIcon /> Google
                                </button>
                                <button type="button" className="btn btn-social" onClick={() => handleSocialLogin('facebook')}>
                                    <FacebookIcon /> Facebook
                                </button>
                            </div>
                        </div>
                        <div className="auth-switch">
                            <span>Bạn đã có tài khoản?</span>
                            <Link to="/sign-in">Đăng nhập</Link>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default RegisterPage;