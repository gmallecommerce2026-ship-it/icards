import React from 'react';
import { ArrowRight } from 'lucide-react';
import BlogCard from './BlogCard';

export const CategoryBlock = ({ category, posts = [], layout = 'layout-A', colorClass = 'color-blue', onNavigate }) => {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="gm-category-block gm-fade-in">
      {/* Header Chuyên Mục */}
      <div className="gm-section-header">
        <div className="gm-section-title-wrap">
          <span className={`gm-badge-accent ${colorClass}`}></span>
          <h3 className="gm-section-title">{category?.name || 'Chuyên mục'}</h3>
        </div>
        {category?.slug && (
          <button 
            type="button"
            onClick={() => onNavigate(`/blog?category=${category.slug}`)}
            className="gm-see-all-link"
          >
            <span>Xem tất cả</span>
            <ArrowRight size={13} />
          </button>
        )}
      </div>

      {/* Grid bài viết theo từng dạng layout */}
      {layout === 'layout-A' && (
        <div className="gm-layout-A">
          <div className="gm-layout-A-main">
            <BlogCard blog={posts[0]} variant="hero" onClick={() => onNavigate(`/page/${posts[0].slug}`)} />
          </div>
          <div className="gm-layout-A-side">
            {posts.slice(1, 4).map(p => (
              <BlogCard key={p._id || p.id} blog={p} variant="list" onClick={() => onNavigate(`/page/${p.slug}`)} />
            ))}
          </div>
        </div>
      )}

      {layout === 'layout-B' && (
        <div className="gm-layout-B">
          {posts.slice(0, 3).map(p => (
            <BlogCard key={p._id || p.id} blog={p} variant="simple" onClick={() => onNavigate(`/page/${p.slug}`)} />
          ))}
        </div>
      )}

      {layout === 'layout-C' && (
        <div className="gm-layout-C">
          <div className="gm-layout-C-main">
            <BlogCard blog={posts[0]} variant="hero" onClick={() => onNavigate(`/page/${posts[0].slug}`)} />
          </div>
          <div className="gm-layout-C-side">
            {posts.slice(1, 3).map(p => (
              <BlogCard key={p._id || p.id} blog={p} variant="simple" onClick={() => onNavigate(`/page/${p.slug}`)} />
            ))}
          </div>
        </div>
      )}

      {layout === 'layout-D' && (
        <div className="gm-layout-D">
          {posts.slice(0, 4).map(p => (
            <BlogCard key={p._id || p.id} blog={p} variant="simple" onClick={() => onNavigate(`/page/${p.slug}`)} />
          ))}
        </div>
      )}

      {layout === 'layout-E' && (
        <div className="gm-layout-E">
          {posts.slice(0, 4).map(p => (
            <BlogCard key={p._id || p.id} blog={p} variant="list" onClick={() => onNavigate(`/page/${p.slug}`)} />
          ))}
        </div>
      )}
    </section>
  );
};