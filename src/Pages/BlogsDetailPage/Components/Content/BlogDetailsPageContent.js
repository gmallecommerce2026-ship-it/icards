import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../../../services/api';
import SEO from '../../../../Features/SEO';
import { gsap } from 'gsap';
import { ChevronRight, Hash } from 'lucide-react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import parse, { domToReact, attributesToProps } from 'html-react-parser';
import '../../../../tiptap-content.css';
import './BlogDetailsPageContent.css';

gsap.registerPlugin(ScrollTrigger);

const BLOG_PAGE_PATH = '/page';

const getPlainText = (node) => {
    let text = '';
    if (node.type === 'text') {
        text += node.data;
    } else if (node.children) {
        node.children.forEach(child => {
            text += getPlainText(child);
        });
    }
    return text;
};

const InlineProductCard = ({ product }) => {
    if (!product || !product.title) return null;
    const imgUrl = product.imgSrc || (product.images && product.images[0]) || "https://placehold.co/150";

    return (
        <div className="inline-product-banner">
            <Link to={`/product/${product._id || product.slug}`} className="inline-product-link">
                <img src={imgUrl} alt={product.title} className="inline-product-img" />
                <div className="inline-product-details">
                    <span className="inline-product-badge">Gợi ý cho bạn</span>
                    <h4 className="inline-product-title">{product.title}</h4>
                    <div className="inline-product-price">{product.price?.toLocaleString('vi-VN')}đ</div>
                    <span className="inline-product-btn">Xem chi tiết</span>
                </div>
            </Link>
        </div>
    );
};

const InlineBannerCard = ({ img, link }) => {
    if (!img) return null;
    return (
        <div className="inline-banner-container">
            <a href={link || '#'} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                <img src={img} alt="Advertisement" className="inline-banner-img" />
            </a>
            <span className="inline-banner-sponsor">Tài trợ</span>
        </div>
    );
};

const InlineGmallProductCard = ({ gmallData }) => {
    if (!gmallData || !gmallData.name) return null;
    const imgUrl = gmallData.image || "https://placehold.co/150";
    
    const productLink = `https://gmall.onrender.com/product-details/${gmallData.slug || gmallData.id}`;

    return (
        <div className="inline-product-banner">
            <a href={productLink} target="_blank" rel="noopener noreferrer" className="inline-product-link">
                <img src={imgUrl} alt={gmallData.name} className="inline-product-img" />
                <div className="inline-product-details">
                    <span className="inline-product-badge" style={{ backgroundColor: '#f59e0b', color: '#fff' }}>Sản phẩm G-Mall</span>
                    <h4 className="inline-product-title">{gmallData.name}</h4>
                    <div className="inline-product-price">{gmallData.price?.toLocaleString('vi-VN')}đ</div>
                    <span className="inline-product-btn">Mua trên G-Mall</span>
                </div>
            </a>
        </div>
    );
};

const isPolicyOrTermsBlog = (blog) => {
    if (!blog) return false;
    const keywords = ['chính sách', 'chinh sach', 'điều khoản', 'dieu khoan', 'policy', 'terms'];
    const title = (blog.title || '').toLowerCase();
    const slug = (blog.slug || '').toLowerCase();
    const summary = (blog.summary || '').toLowerCase();
    const categoryName = (typeof blog.category === 'object' ? blog.category?.name || '' : blog.category || '').toLowerCase();

    const fullText = `${title} ${slug} ${summary} ${categoryName}`;
    return keywords.some(keyword => fullText.includes(keyword));
};

const BlogDetailsPageContent = () => {
    const [blog, setBlog] = useState(null);
    const [latestPosts, setLatestPosts] = useState([]);
    const [allBlogs, setAllBlogs] = useState([]);
    const [topicsTree, setTopicsTree] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scrollWidth, setScrollWidth] = useState(0);
    const { slug } = useParams();
    const navigate = useNavigate();
    const contentRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (scrollTop / docHeight) * 100;
            setScrollWidth(scrolled);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchBlogDetails = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/pages/${slug}`);
                const pageData = response.data?.data;
                const relatedData = response.data?.related;

                setBlog(pageData);
                if (relatedData?.latestPosts) {
                    const validLatest = relatedData.latestPosts.filter(p => !isPolicyOrTermsBlog(p));
                    setLatestPosts(validLatest);
                }

                setTimeout(() => {
                    gsap.fromTo(".blog-animate",
                        { y: 20, opacity: 0 },
                        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 }
                    );
                }, 100);

            } catch (err) {
                console.error("Lỗi tải bài viết:", err);
            } finally {
                setLoading(false);
            }
        };
        if (slug) fetchBlogDetails();
    }, [slug]);

    useEffect(() => {
        const fetchSupplementaryData = async () => {
            try {
                const [topicsRes, blogsRes] = await Promise.all([
                    api.get('/public/topics'),
                    api.get('/pages', { params: { isBlog: true, isPublished: true, limit: 200, sort: '-createdAt' } })
                ]);

                if (topicsRes.data?.data) setTopicsTree(topicsRes.data.data);
                if (blogsRes.data?.data) {
                    const validBlogs = blogsRes.data.data.filter(b => !isPolicyOrTermsBlog(b));
                    setAllBlogs(validBlogs);
                }
            } catch (error) {
                console.error("Lỗi tải dữ liệu bổ trợ:", error);
            }
        };
        fetchSupplementaryData();
    }, []);

    const dynamicHotTags = useMemo(() => {
        if (!allBlogs || allBlogs.length === 0) return [];
        const stopWords = ['của', 'và', 'các', 'những', 'cho', 'với', 'trong', 'một', 'là', 'để', 'có', 'không', 'về', 'từ', 'đến', 'tại', 'khi', 'này', 'được', 'thì', 'làm', 'cách', 'như', 'hay', 'hoặc', 'nhưng', 'cùng', 'bằng', 'sự', 'việc', 'nhất'];
        const tagMap = {};

        allBlogs.forEach(item => {
            if (!item.title) return;
            const cleanTitle = item.title.replace(/[.,?!()"[\]{}:;]/g, '').toLowerCase();
            const words = cleanTitle.split(/\s+/);
            for (let i = 0; i < words.length - 1; i++) {
                const w1 = words[i];
                const w2 = words[i + 1];
                if (!stopWords.includes(w1) && !stopWords.includes(w2) && w1.length >= 2 && w2.length >= 2) {
                    const tag = `${w1} ${w2}`;
                    tagMap[tag] = (tagMap[tag] || 0) + 1;
                }
            }
        });

        const sortedTags = Object.keys(tagMap).sort((a, b) => tagMap[b] - tagMap[a]);
        if (sortedTags.length === 0) {
            return allBlogs.slice(0, 8).map(b => b.title.split(' ').find(w => w.length > 4) || b.title.split(' ')[0]).filter(Boolean);
        }
        return sortedTags.slice(0, 8);
    }, [allBlogs]);

    const injectedBlocksConfig = blog?.injectedBlocks || [];

    const computedBlocks = useMemo(() => {
        if (!blog || typeof blog.content !== 'string' || injectedBlocksConfig.length === 0) {
            return [];
        }

        const totalHeadings = (blog.content.match(/<h[2-6][^>]*>/gi) || []).length;
        const blocks = [...injectedBlocksConfig];

        if (totalHeadings > 0) {
            blocks.forEach((block, index) => {
                block.computedPosition = Math.floor(index * (totalHeadings / blocks.length)) + 1;
                block.targetType = 'heading';
            });
        } else {
            const totalParagraphs = (blog.content.match(/<p[^>]*>/gi) || []).length;
            blocks.forEach((block, index) => {
                const pCount = totalParagraphs > 0 ? totalParagraphs : 10;
                block.computedPosition = Math.floor(index * (pCount / blocks.length)) + 1;
                block.targetType = 'paragraph';
            });
        }

        return blocks;
    }, [blog, injectedBlocksConfig]);

    if (loading) return <div className="loading-wrapper">Đang tải nội dung...</div>;
    if (!blog) return <div className="loading-wrapper">Bài viết không tồn tại.</div>;

    const relatedProducts = blog.relatedProducts || [];
    let headingCounter = 0;
    let paragraphCounter = 0;

    const parseOptions = {
        replace: (domNode) => {
            const isHeadingTag = domNode.type === 'tag' && ['h2', 'h3', 'h4', 'h5', 'h6'].includes(domNode.name);
            const isParagraphTag = domNode.type === 'tag' && domNode.name === 'p';

            if (isHeadingTag) {
                headingCounter++;
                const blocksToInjectHere = computedBlocks.filter(b => b.targetType === 'heading' && b.computedPosition === headingCounter);

                if (blocksToInjectHere.length > 0) {
                    const props = attributesToProps(domNode.attribs || {});
                    const Tag = domNode.name;

                    return (
                        <React.Fragment>
                            {blocksToInjectHere.map((block, idx) => {
                                if (block.type === 'product' && block.productId) {
                                    return <InlineProductCard key={`inj-p-h${headingCounter}-${idx}`} product={block.productId} />;
                                }
                                if (block.type === 'banner' && block.bannerImg) {
                                    return <InlineBannerCard key={`inj-b-h${headingCounter}-${idx}`} img={block.bannerImg} link={block.bannerLink} />;
                                }
                                if (block.type === 'gmall-product' && block.gmallData) {
                                    return <InlineGmallProductCard key={`inj-g-h${headingCounter}-${idx}`} gmallData={block.gmallData} />;
                                }
                                return null;
                            })}
                            <Tag {...props}>
                                {domNode.children ? domToReact(domNode.children, parseOptions) : null}
                            </Tag>
                        </React.Fragment>
                    );
                }
            }
            else if (isParagraphTag) {
                paragraphCounter++;
                const blocksToInjectHere = computedBlocks.filter(b => b.targetType === 'paragraph' && b.computedPosition === paragraphCounter);

                if (blocksToInjectHere.length > 0) {
                    const props = attributesToProps(domNode.attribs || {});
                    return (
                        <React.Fragment>
                            <p {...props}>
                                {domNode.children ? domToReact(domNode.children, parseOptions) : null}
                            </p>

                            {blocksToInjectHere.map((block, idx) => {
                                if (block.type === 'product' && block.productId) {
                                    return <InlineProductCard key={`inj-p-p${paragraphCounter}-${idx}`} product={block.productId} />;
                                }
                                if (block.type === 'banner' && block.bannerImg) {
                                    return <InlineBannerCard key={`inj-b-p${paragraphCounter}-${idx}`} img={block.bannerImg} link={block.bannerLink} />;
                                }
                                if (block.type === 'gmall-product' && block.gmallData) {
                                    return <InlineGmallProductCard key={`inj-g-p${paragraphCounter}-${idx}`} gmallData={block.gmallData} />;
                                }
                                return null;
                            })}
                        </React.Fragment>
                    );
                }
            }
        }
    };

    return (
        <>
            <SEO title={blog.title} description={blog.seo?.metaDescription || blog.excerpt} />

            <div className="scroll-progress-container">
                <div className="scroll-progress-bar" style={{ width: `${scrollWidth}%` }}></div>
            </div>

            <div className="luxury-blog-detail-wrapper">
                <div onClick={() => navigate(-1)} className="nav-back">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    Quay lại
                </div>

                <div className="blog-layout">
                    <article className="main-content" ref={contentRef}>
                        <header className="blog-header blog-animate">
                            <span className="blog-category-badge">{blog.category?.name || 'Blog'}</span>
                            <h1 className="blog-title">{blog.title}</h1>
                            <div className="author-meta">
                                <img src={blog.author?.avatar || "https://ui-avatars.com/api/?name=Admin"} alt="Author" className="author-avatar" />
                                <div className="author-info">
                                    <h4>{blog.author?.name || 'Ban biên tập'}</h4>
                                </div>
                            </div>
                        </header>

                        {blog.thumbnail && (
                            <div className="blog-thumbnail blog-animate" style={{ marginBottom: '2rem', borderRadius: '4px', overflow: 'hidden' }}>
                                <img src={blog.thumbnail} alt={blog.title} style={{ width: '100%', display: 'block' }} />
                            </div>
                        )}

                        <div className="blog-content-body blog-animate ck-content">
                            {typeof blog.content === 'string' ? (
                                parse(blog.content, parseOptions)
                            ) : Array.isArray(blog.content) ? (
                                blog.content.map((block, index) => (
                                    <React.Fragment key={block._id || index}>
                                        {block.type === 'text' && <div dangerouslySetInnerHTML={{ __html: block.content }} />}
                                        {block.type === 'image' && <img src={block.content} alt={block.alt || "blog-image"} style={{ maxWidth: '100%', borderRadius: '4px', margin: '1.5rem 0' }} />}
                                    </React.Fragment>
                                ))
                            ) : null}
                        </div>
                    </article>

                    <aside className="sidebar-wrapper">
                        <div className="sidebar-sticky">
                            {latestPosts.length > 0 && (
                                <div className="widget-box blog-animate">
                                    <div className="widget-title">Bài viết mới nhất</div>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                        {latestPosts.map(post => (
                                            <li key={post._id} style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                                                <Link to={`/page/${post.slug}`} style={{ textDecoration: 'none', color: '#374151', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                                                    {post.title}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {topicsTree.length > 0 && (
                                <div className="widget-box blog-animate">
                                    <div className="widget-title">Chủ đề</div>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                        {(() => {
                                            const renderTree = (nodes, depth = 0) => {
                                                return nodes.map(node => (
                                                    <React.Fragment key={node._id}>
                                                        <li style={{
                                                            marginBottom: depth === 0 ? '0.5rem' : '0',
                                                            paddingBottom: depth === 0 ? '0.5rem' : '0',
                                                            borderBottom: depth === 0 ? '1px dashed #e5e7eb' : 'none'
                                                        }}>
                                                            <div
                                                                onClick={() => navigate(`${BLOG_PAGE_PATH}?topic=${node._id}`)}
                                                                style={{
                                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                                    cursor: 'pointer', color: '#374151', fontSize: '0.9rem',
                                                                    transition: 'color 0.2s', paddingLeft: `${depth * 14}px`,
                                                                    paddingTop: depth > 0 ? '6px' : '0',
                                                                    fontWeight: depth === 0 ? '500' : '400'
                                                                }}
                                                                onMouseOver={(e) => e.currentTarget.style.color = '#2563eb'}
                                                                onMouseOut={(e) => e.currentTarget.style.color = '#374151'}
                                                            >
                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    {depth > 0 && <span style={{ width: '6px', height: '1px', backgroundColor: '#cbd5e1' }}></span>}
                                                                    {node.name}
                                                                </span>
                                                                <ChevronRight size={14} color="#9ca3af" />
                                                            </div>
                                                        </li>
                                                        {node.children && node.children.length > 0 && (
                                                            <div style={{ marginLeft: '4px', borderLeft: '1px dashed #e2e8f0' }}>
                                                                {renderTree(node.children, depth + 1)}
                                                            </div>
                                                        )}
                                                    </React.Fragment>
                                                ));
                                            };
                                            return renderTree(topicsTree);
                                        })()}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>

                {dynamicHotTags.length > 0 && (
                    <div className="blog-details-topics-floor blog-animate">
                        <div className="topics-floor-header">
                            <div className="topics-floor-title-group">
                                <Hash className="topics-floor-icon" size={20} />
                                <h3 className="topics-floor-title">Chủ đề nổi bật</h3>
                            </div>
                            <p className="topics-floor-subtitle">Bắt kịp các xu hướng công nghệ, phân tích giải pháp thiệp điện tử và kết nối chuyên sâu.</p>
                        </div>
                        <div className="topics-floor-cloud">
                            {dynamicHotTags.map((topic, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => navigate(`${BLOG_PAGE_PATH}?search=${topic}`)}
                                    className="topics-floor-tag-btn"
                                >
                                    <span className="tag-hash">#</span>{topic}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default BlogDetailsPageContent;