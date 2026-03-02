import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Component này sẽ tự động cuộn cửa sổ lên đầu trang (0, 0)
 * mỗi khi đường dẫn (pathname) thay đổi, ngoại trừ khi đang điều hướng
 * giữa các danh mục thiệp mời.
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  const prevPathnameRef = useRef();

  useEffect(() => {
    const prevPathname = prevPathnameRef.current;

    // Kiểm tra xem cả trang trước đó và trang hiện tại có phải là các trang danh mục thiệp mời hay không.
    const isNavigatingBetweenInvitationCategories =
      prevPathname?.startsWith('/invitations/category/') &&
      pathname.startsWith('/invitations/category/');

    // Chỉ cuộn lên đầu trang nếu không phải đang chuyển đổi giữa các danh mục thiệp.
    if (!isNavigatingBetweenInvitationCategories) {
      window.scrollTo(0, 0);
    }

    // Lưu lại pathname hiện tại để so sánh trong lần thay đổi tiếp theo.
    prevPathnameRef.current = pathname;
  }, [pathname]);

  return null;
}

export default ScrollToTop;