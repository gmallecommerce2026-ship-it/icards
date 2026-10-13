import React from 'react';
import BlogsPageContent from './Components/Content/BlogsPageContent.js';
import GlobalFooter from '../Components/GlobalFooter'; // Import GlobalFooter

const BlogListPage = () => {
  return (
    <div className="page-wrapper">
      <BlogsPageContent />
      <GlobalFooter /> {/* Thêm Footer vào cuối trang */}
    </div>
  );
};

export default BlogListPage;