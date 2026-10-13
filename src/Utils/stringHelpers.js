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

export const generateUniqueTemplateName = (baseName, existingNames) => {
    // Nếu tên gốc chưa tồn tại, dùng luôn tên gốc
    if (!existingNames.includes(baseName)) {
        return baseName;
    }

    let counter = 1;
    let newName = `${baseName} ${counter}`;

    // Tăng dần hậu tố cho đến khi tìm được tên chưa từng tồn tại
    while (existingNames.includes(newName)) {
        counter++;
        newName = `${baseName} ${counter}`;
    }

    return newName;
};