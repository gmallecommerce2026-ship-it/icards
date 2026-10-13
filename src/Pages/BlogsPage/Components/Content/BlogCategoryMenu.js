import React from 'react';
import { Link } from 'react-router-dom';

export const BlogCategoryMenu = ({ categories = [], selectedCategory = '', onSelectCategory }) => {
  return (
    <nav className="gm-category-nav">
      <div className="gm-category-nav-inner">
        <ul className="gm-nav-root-list">
          {/* Nút Về tất cả */}
          <li className="gm-nav-item">
            <Link
              to="/blog"
              onClick={() => onSelectCategory && onSelectCategory('all')}
              className={`gm-nav-link ${!selectedCategory || selectedCategory === 'all' ? 'active' : ''}`}
            >
              Tất cả
            </Link>
          </li>

          {/* Danh mục cấp 1 */}
          {categories.map((item) => {
            const hasChildren = Boolean(item.children && item.children.length > 0);
            const itemKey = item.slug || item._id || item.id;
            const isActive = selectedCategory === itemKey;

            return (
              <li key={itemKey} className="gm-nav-item">
                <Link
                  to={`/blog?category=${itemKey}`}
                  onClick={() => onSelectCategory && onSelectCategory(itemKey)}
                  className={`gm-nav-link ${isActive ? 'active' : ''}`}
                >
                  <span>{item.name}</span>
                  {hasChildren && (
                    <svg
                      className="gm-dropdown-arrow"
                      width="12"
                      height="12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </Link>

                {/* Dropdown cấp 2 */}
                {hasChildren && (
                  <ul className="gm-dropdown-menu-level2">
                    {item.children.map((subItem) => {
                      const hasSubChildren = Boolean(subItem.children && subItem.children.length > 0);
                      const subKey = subItem.slug || subItem._id || subItem.id;
                      const isSubActive = selectedCategory === subKey;

                      return (
                        <li key={subKey} className="gm-dropdown-item">
                          <Link
                            to={`/blog?category=${subKey}`}
                            onClick={() => onSelectCategory && onSelectCategory(subKey)}
                            className={`gm-dropdown-link ${isSubActive ? 'active' : ''}`}
                          >
                            <span>{subItem.name}</span>
                            {hasSubChildren && (
                              <svg
                                width="12"
                                height="12"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                              </svg>
                            )}
                          </Link>

                          {/* Dropdown cấp 3 (bung sang phải) */}
                          {hasSubChildren && (
                            <ul className="gm-dropdown-menu-level3">
                              {subItem.children.map((thirdItem) => {
                                const thirdKey = thirdItem.slug || thirdItem._id || thirdItem.id;
                                return (
                                  <li key={thirdKey} className="gm-dropdown-item">
                                    <Link
                                      to={`/blog?category=${thirdKey}`}
                                      onClick={() => onSelectCategory && onSelectCategory(thirdKey)}
                                      className={`gm-dropdown-link ${selectedCategory === thirdKey ? 'active' : ''}`}
                                    >
                                      {thirdItem.name}
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};