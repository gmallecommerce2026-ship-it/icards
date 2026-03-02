export const MOCK_ENVELOPE_TEMPLATES = [
  {
    id: 'env_001',
    name: 'Phong bì Xanh Navy Lót Vàng',
    // 1. Mặt trước phong bì (phần thân, không có nắp)
    envelopeFrontUrl: 'https://placehold.co/520x420/000080/ffffff?text=Mặt+Trước+Thân+Phong+Bì+(Navy)',
    // 2. Mặt sau phong bì (phần lưng, không có nắp)
    envelopeBackUrl: 'https://placehold.co/520x420/000080/ffffff?text=Mặt+Sau+Thân+Phong+Bì+(Navy)',
    // 3. Mặt ngoài của nắp (phần tam giác bạn thấy khi nắp đóng)
    lidOuterUrl: 'https://placehold.co/520x250/000080/ffffff?text=Nắp+(Mặt+Ngoài)+Navy',
    // 4. Mặt trong của nắp (phần tam giác bạn thấy khi nắp mở)
    lidInnerUrl: 'https://placehold.co/520x250/FFD700/000080?text=Nắp+(Mặt+Trong)+Vàng',
  },
  {
    id: 'env_002',
    name: 'Phong bì Giấy Kraft Cổ điển',
    envelopeFrontUrl: 'https://placehold.co/520x420/D2B48C/8B4513?text=Mặt+Trước+(Kraft)',
    envelopeBackUrl: 'https://placehold.co/520x420/D2B48C/8B4513?text=Mặt+Sau+(Kraft)',
    lidOuterUrl: 'https://placehold.co/520x250/D2B48C/8B4513?text=Nắp+Ngoài+(Kraft)',
    lidInnerUrl: 'https://placehold.co/520x250/F5F5DC/8B4513?text=Nắp+Trong+(Beige)',
  },
  {
    id: 'env_003',
    name: 'Phong bì Trắng Tinh Tế',
    envelopeFrontUrl: 'https://placehold.co/520x420/FFFFFF/333333?text=Mặt+Trước+(Trắng)',
    envelopeBackUrl: 'https://placehold.co/520x420/FFFFFF/333333?text=Mặt+Sau+(Trắng)',
    lidOuterUrl: 'https://placehold.co/520x250/FFFFFF/333333?text=Nắp+Ngoài+(Trắng)',
    lidInnerUrl: 'https://placehold.co/520x250/F0F0F0/333333?text=Nắp+Trong+(Xám+Nhạt)',
  },
];