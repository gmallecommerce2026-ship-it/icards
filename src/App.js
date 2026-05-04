// src/App.js

import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Navigate, Route, Routes, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './Context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';
// --- CSS ---
import './App.css';
import './tiptap-content.css'
import './BannerStyles.css'
// --- CORE COMPONENTS ---
import ScrollToTop from './Features/ScrollToTop';
import GlobalHeader from './Pages/Components/GlobalHeader';
import GlobalFooter from './Pages/Components/GlobalFooter';
import Breadcrumbs from './Pages/Components/Breadcrumbs';
import GenAIPage from './Pages/GenAIPage/GenAIPage';

// --- PAGES ---
const HomePage = lazy(() => import('./Pages/HomePage/HomePage'));
const SignInPage =  lazy(() => import('./Pages/SignInPage/SignInPage'));
const SignUpPage =  lazy(() => import('./Pages/SignUpPage/SignUpPage'));
const ForgotPasswordPage =  lazy(() => import('./Pages/ForgotPasswordPage/ForgotPasswordPage'));
const ResetPasswordPage =  lazy(() => import('./Pages/ResetPasswordPage/ResetPasswordPage'));
const ProductPage =  lazy(() => import('./Pages/ProductPage/ProductPage'));
const ProductDetailsPage =  lazy(() => import('./Pages/ProductDetailsPage/ProductDetailsPage'));
const InvitationPage =  lazy(() => import('./Pages/InvitationPage/InvitationPage'));
const InvitationDetailsPage =  lazy(() => import('./Pages/InvitationDetailsPage/InvitationDetailsPage'));
const InvitationDesignPage =  lazy(() => import('./Pages/InvitationDesign/InvitationDesign'));
const AccountSettingsPage =  lazy(() => import('./Pages/AccountSettingsPage/AccountSettingsPage'));
const InvitationManagementPage =  lazy(() => import('./Pages/InvitationManagementPage/InvitationManagementPage'));
const TutorialPage =  lazy(() => import('./Pages/TutorialPage/TutorialPage'));
const AboutUsPage =  lazy(() => import('./Pages/AboutUsPage/AboutUsPage'));
const SearchResultsPage =  lazy(() => import('./Pages/SearchResultsPage/SearchResultsPage'));
const FaqPage =  lazy(() => import('./Pages/FaqPage/FaqPage'));
const BlogsPage =  lazy(() => import('./Pages/BlogsPage/BlogsPage'));
const BlogDetailsPage =  lazy(() => import('./Pages/BlogsDetailPage/BlogsDetailPage'));
const EventWishesPage = lazy(() => import('./Pages/EventWishesPage/EventWishesPage'));

// --- WELCOME POPUP COMPONENT ---
const popupStyles = `
  .welcome-popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    backdrop-filter: blur(5px);
  }

  .welcome-popup-container {
    background-color: #fff;
    padding: 30px 40px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    width: 90%;
    max-width: 550px;
    text-align: center;
    font-family: 'Be Vietnam Pro', 'SVN-Gilroy', sans-serif;
    animation: fadeInPopup 0.5s ease-out;
  }

  @keyframes fadeInPopup {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .welcome-popup-container h2 {
    color: var(--color-primary, #27548A);
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 15px;
  }

  .welcome-popup-container p {
    font-size: 16px;
    color: var(--color-text-light, #666);
    line-height: 1.7;
    margin-bottom: 25px;
  }

  .welcome-popup-features {
    text-align: left;
    margin-bottom: 30px;
    padding-left: 20px;
    list-style: none;
  }

  .welcome-popup-features li {
    font-size: 16px;
    color: var(--color-text-dark, #333);
    margin-bottom: 12px;
    padding-left: 25px;
    position: relative;
  }

  .welcome-popup-features li::before {
    content: '🚀';
    position: absolute;
    left: 0;
    top: 2px;
  }

  .welcome-popup-close-btn {
    background-color: var(--color-primary, #27548A);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 30px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.2s;
    text-transform: uppercase;
  }

  .welcome-popup-close-btn:hover {
    background-color: #1f426b;
    transform: translateY(-2px);
  }
`;

const WelcomePopup = ({ onClose }) => {
  return (
    <>
      <style>{popupStyles}</style>
      <div className="welcome-popup-overlay" onClick={onClose}>
        <div className="welcome-popup-container" onClick={(e) => e.stopPropagation()}>
          <h2>Chào mừng đến với iCards!</h2>
          <p>
            Chúng tôi là nền tảng chuyên cung cấp giải pháp tạo và quản lý thiệp mời sự kiện kỹ thuật số một cách chuyên nghiệp và hiệu quả.
          </p>
          <ul className="welcome-popup-features">
            <li><strong>Thiết kế thiệp mời:</strong> Sáng tạo những mẫu thiệp độc đáo với bộ công cụ tùy chỉnh mạnh mẽ.</li>
            <li><strong>Quản lý khách mời:</strong> Tổ chức và theo dõi danh sách khách mời khoa học, cập nhật trạng thái tham dự dễ dàng.</li>
            <li><strong>Trang sự kiện chuyên biệt:</strong> Tạo không gian trực tuyến riêng cho sự kiện để chia sẻ thông tin và tương tác với khách mời.</li>
          </ul>
          <p>Hãy bắt đầu trải nghiệm những tính năng ưu việt của chúng tôi.</p>
          <button className="welcome-popup-close-btn" onClick={onClose}>
            Bắt đầu khám phá
          </button>
        </div>
      </div>
    </>
  );
};

// Component cho trang bảo trì
const MaintenancePage = () => {
  const maintenanceStyles = `
    .maintenance-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
      width: 100vw;
      background-color: #f8f9fa;
      color: #333;
      font-family: 'Be Vietnam Pro', sans-serif;
      text-align: center;
      padding: 20px;
    }
    .maintenance-container svg {
      width: 80px;
      height: 80px;
      color: #27548A;
      margin-bottom: 20px;
    }
    .maintenance-container h1 {
      font-size: 2.5rem;
      color: #27548A;
      margin-bottom: 15px;
    }
    .maintenance-container p {
      font-size: 1.2rem;
      max-width: 600px;
      line-height: 1.6;
    }
  `;
  return (
    <>
      <style>{maintenanceStyles}</style>
      <div className="maintenance-container">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>
        <h1>Website đang được nâng cấp</h1>
        <p>Đang thực hiện một số cải tiến để mang lại trải nghiệm tốt hơn cho bạn. Vui lòng quay lại sau 24h ngày 30/9. Xin cảm ơn!</p>
      </div>
    </>
  );
};


// --- ROUTE & LAYOUT COMPONENTS ---

/**
 * Layout chính bao gồm Header, Footer, Breadcrumbs.
 * Các trang con sẽ được render thông qua <Outlet />.
 */
const MainLayout = () => {
    const location = useLocation();
    
    // Kiểm tra xem trang hiện tại có phải là trang Blog không
    // Dựa trên route đã định nghĩa: /page và /page/:slug
    const isBlogPage = location.pathname.startsWith('/page');

    return (
        <>
            {/* Chỉ hiển thị Header chung nếu KHÔNG phải trang Blog */}
            {!isBlogPage && <GlobalHeader />}
            
            {/* Chỉ hiển thị Breadcrumbs chung nếu KHÔNG phải trang Blog */}
            {!isBlogPage && <Breadcrumbs />}
            
            <main className="main-content-area">
                <Outlet />
            </main>
            
            {/* Chỉ hiển thị Footer chung nếu KHÔNG phải trang Blog */}
            {!isBlogPage && <GlobalFooter />}
        </>
    );
};


/**
 * Component bảo vệ các route yêu cầu đăng nhập.
 * Nếu chưa đăng nhập, chuyển hướng người dùng đến trang /sign-in
 * và lưu lại trang họ muốn đến để quay lại sau.
 */
const ProtectedRoute = () => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/sign-in" state={{ from: location }} replace />;
    }

    // Nếu đã đăng nhập, cho phép hiển thị các route con.
    return <Outlet />;
};

// --- MAIN APP COMPONENT ---

function App() {
    const [showWelcomePopup, setShowWelcomePopup] = useState(false);
    
    // Đặt biến này thành true để kích hoạt chế độ bảo trì
    const isMaintenanceMode = false; 

    useEffect(() => {
        const hasVisited = localStorage.getItem('hasVisitedSite');
        if (!hasVisited) {
            setShowWelcomePopup(true);
            localStorage.setItem('hasVisitedSite', 'true');
        }
    }, []);

    if (isMaintenanceMode) {
      return <MaintenancePage />;
    }

    return (
        <>
            <Suspense fallback={<div>Đang tải trang...</div>}>
            {showWelcomePopup && <WelcomePopup onClose={() => setShowWelcomePopup(false)} />}
            <ScrollToTop />
            <ToastContainer
                position="bottom-right"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            <Routes>
                {/* ===== CÁC ROUTE CÓ LAYOUT CHUNG (Header/Footer) ===== */}
                <Route element={<MainLayout />}>
                    {/* --- Các route công khai --- */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/shop" element={<ProductPage />} />
                    <Route path="/product/:productId" element={<ProductDetailsPage />} />
                    <Route path="/invitations" element={<InvitationPage />} />
                    <Route path="/invitations/category/:categoryName" element={<InvitationPage />} />
                    <Route path="/invitations/category/:categoryName/group/:groupName" element={<InvitationPage />} />
                    <Route path="/invitations/category/:categoryName/group/:groupName/type/:typeName" element={<InvitationPage />} />
                    <Route path="/invitation/:invitationId" element={<InvitationDetailsPage />} />
                    <Route path="/professional" element={<TutorialPage />} />
                    <Route path="/search/:query" element={<SearchResultsPage />} />
                    <Route path="/faq" element={<FaqPage />} />
                    
                    {/* Trang Blog sẽ dùng Header/Footer riêng của nó (đã xử lý trong MainLayout) */}
                    <Route path="/page" element={<BlogsPage />} />
                    <Route path="/page/:slug" element={<BlogDetailsPage />} />
                    
                    <Route path="/ai-face-gen" element={<GenAIPage />} />
                    
                    {/* --- Nhóm các route cần đăng nhập mới có thể truy cập --- */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/account-settings" element={<AccountSettingsPage />} />
                        <Route path="/invitation-management" element={<InvitationManagementPage />} />
                        <Route path="/invitation-management/:invitationId" element={<InvitationManagementPage />} />
                    </Route>
                </Route>

                {/* ===== CÁC ROUTE KHÔNG CÓ LAYOUT CHUNG ===== */}
                <Route path="/events/:id/wishes" element={<EventWishesPage />} />
                {/* --- Nhóm các route cần đăng nhập (Trang Canvas) --- */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/canvas/template/:templateId" element={<InvitationDesignPage />} />
                    <Route path="/canvas/edit/:invitationId" element={<InvitationDesignPage />} />
                    <Route path="/canvas" element={<InvitationDesignPage />} />
                </Route>
                
                {/* --- Các route công khai (trang sự kiện, đăng nhập, v.v.) --- */}
                <Route path="/events/:id" element={<AboutUsPage />} />
                <Route path="/sign-in" element={<SignInPage />} />
                <Route path="/sign-up" element={<SignUpPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

                {/* --- Route dự phòng: Nếu không khớp, chuyển về trang chủ --- */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </>
    );
}

export default App;