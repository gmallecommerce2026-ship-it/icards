import React from 'react';

// Import CSS toàn cục và các component con
// Đổi sang default import để khớp với cách export của component
import Content from './Components/Content/FaqPageContent.js';

/**
 * Component HomePage chính.
 * Đây là nơi lắp ráp các thành phần chính của trang: Header, Content, và Footer.
 * Nó cũng quản lý trạng thái chung, ví dụ như việc menu trên di động có đang mở hay không.
 */
const FaqPage = () => {

  return (
    <div className="page-wrapper">
      <Content />
    </div>
  );
};

export default FaqPage;
