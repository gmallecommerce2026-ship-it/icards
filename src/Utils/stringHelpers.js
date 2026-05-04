// Đảm bảo dùng hàm này cho mọi tác vụ liên quan đến tạo URL từ Category Name
export const titleToSlug = (title) => {
    if (!title) return '';
    return title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');
};