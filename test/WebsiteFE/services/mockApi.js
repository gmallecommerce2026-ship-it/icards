const MOCK_TAGS = ['Technology', 'Design', 'Innovation', 'Future', 'AI', 'Digital Art', 'Luxury', 'Premium'];
const MOCK_CATEGORIES = ['Tech Trends', 'Digital Luxury', 'Innovation Hub', 'Future Vision', 'Art & Design'];

const generateMockBlogs = (count) => {
  const blogs = [];
  for (let i = 0; i < count; i++) {
    const blogId = `60d5ec${i.toString().padStart(18, '0')}`;
    const title = `Blog Post Title ${i + 4}`;
    blogs.push({
      _id: blogId,
      title: title,
      slug: `blog-post-title-${i + 4}`,
      content: [
        { type: 'image', content: `https://picsum.photos/seed/${blogId}/800/600` },
        { type: 'text', content: `This is the excerpt for ${title}. It delves into fascinating topics and provides deep insights. Explore the future of digital luxury and cutting-edge technology with us.` }
      ],
      createdAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
      tags: MOCK_TAGS.slice(i % 5, (i % 5) + Math.floor(Math.random() * 3) + 1),
      category: MOCK_CATEGORIES[i % MOCK_CATEGORIES.length],
      readTime: Math.floor(Math.random() * 10) + 5,
      views: Math.floor(Math.random() * 2000) + 200,
      isFeatured: i < 2, // Make the first two new blogs featured
      gradient: `linear-gradient(135deg, hsl(${220 + i * 15}, 75%, 65%), hsl(${270 + i * 10}, 85%, 75%))`
    });
  }
  return blogs;
};

// Bổ sung 15 bài blog mới
const newMockBlogs = generateMockBlogs(15);

const mockApi = {
  get: (url) => {
    return new Promise((resolve) => {
      if (url.includes('/pages?isBlog=true&isPublished=true')) {
        // Trả về dữ liệu mock thay vì gọi API thật
        setTimeout(() => {
          resolve({
            data: {
              data: newMockBlogs
            }
          });
        }, 500); // Giả lập độ trễ mạng
      }
    });
  }
};

export default mockApi;