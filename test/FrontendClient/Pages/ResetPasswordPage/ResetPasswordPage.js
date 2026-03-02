import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { showSuccessToast, showErrorToast } from '../../Utils/toastHelper';

// --- ICONS ---
const BackIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18L9 12L15 6" stroke="#4A4A4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

// --- CSS COMPONENT ---
const Styles = () => (
    <style>{`
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
      .back-to-home {
        position: fixed;
        top: 30px;
        left: 30px;
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
      }
      .form-actions {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        width: 100%;
        max-width: 500px;
        margin-top: 20px;
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
      }
      .btn:disabled { opacity: 0.7; cursor: not-allowed; }
      .btn-primary {
          background-color: #27548A;
          color: white;
          border-color: #27548A;
      }
    `}</style>
);

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            showErrorToast('Mật khẩu nhập lại không khớp!');
            return;
        }
        if (password.length < 8) {
            showErrorToast('Mật khẩu phải có ít nhất 8 ký tự.');
            return;
        }
        
        setIsLoading(true);
        try {
            const response = await api.patch(`/auth/reset-password/${token}`, { password });
            showSuccessToast(response.data.message || 'Đặt lại mật khẩu thành công!');
            navigate('/sign-in');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
            showErrorToast(errorMessage);
        } finally {
            setIsLoading(false);
        }
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
                        <h1>Đặt lại mật khẩu</h1>
                        <p>Vui lòng nhập mật khẩu mới của bạn.</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Mật khẩu mới (ít nhất 8 ký tự)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Xác nhận mật khẩu mới"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </form>
                    
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ResetPasswordPage;