import React from 'react';
import BlogDetailsPageContent from './Components/Content/BlogDetailsPageContent.js';
import GlobalFooter from '../Components/GlobalFooter'; // Import GlobalFooter

const BlogDetailsPage = () => {
  return (
    <div className="page-wrapper">
      <BlogDetailsPageContent />
      <GlobalFooter /> {/* Thêm Footer vào cuối trang */}
    </div>
  );
};

export default BlogDetailsPage;