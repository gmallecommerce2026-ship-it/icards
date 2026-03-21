// src/Pages/InvitationDesign/Components/Content/EnvelopeFlow.jsx

import React, { useState, useEffect } from 'react';
import './EnvelopeFlow.css';
import { Button, Box, Typography, CircularProgress } from '@mui/material';
import { Edit, Sync, ArrowForward } from '@mui/icons-material';
import { gsap } from 'gsap';
// --- Placeholders ---
const PLACEHOLDERS = {
  frontCover: 'https://placehold.co/400x500/e6e6e6/27548A?text=Mặt+Trước+Thiệp',
  backCover: 'https://placehold.co/400x500/ffd4a3/27548A?text=Mặt+Sau+Thiệp+(Vàng)', // Màu vàng cam
  envelopeFront: 'https://placehold.co/450x320/27548A/ffffff?text=Mặt+Trước+Phong+Bì',
  envelopeBack: 'https://placehold.co/450x320/1f426b/ffffff?text=Mặt+Sau+Phong+Bì',
  lidOuter: 'https://placehold.co/450x200/1f426b/ffffff?text=Nắp+(Mặt+Ngoài)',
  lidInner: 'https://placehold.co/450x200/27548A/ffffff?text=Nắp+(Mặt+Trong)',
};

// ---------------------------------------------------------

/**
 * Tấm thiệp phẳng (card) bay từ trái vào phong bì
 */
const FlatCard = ({ isInserting, frontCoverUrl, backCoverUrl }) => (
  <div 
    className={`
      flat-card-container 
      ${isInserting ? 'inserting' : ''}
      ${/* SỬA LỖI: Xóa class 'opening' vì thiệp không còn tự mở */ ''}
    `}
  >
    {/* Phần DƯỚI (cố định) */}
    <div className="card-bottom">
      <div className="card-bottom-front">
        <img src={frontCoverUrl || PLACEHOLDERS.frontCover} alt="Bìa trước (dưới)" />
      </div>
      <div className="card-bottom-back">
        <img src={backCoverUrl || PLACEHOLDERS.backCover} alt="Bìa sau (dưới)" />
      </div>
    </div>

    {/* Phần TRÊN (có thể mở) */}
    <div className="card-top">
      <div className="card-top-front">
        <img 
          src={frontCoverUrl || PLACEHOLDERS.frontCover} 
          alt="Bìa trước (trên)" 
          style={{ filter: 'brightness(0.95)' }} /* Làm tối hơn để phân biệt */
        />
      </div>
      <div className="card-top-back">
        <img 
          src={backCoverUrl || PLACEHOLDERS.backCover} 
          alt="Bìa sau (trên)" 
          style={{ filter: 'brightness(1.1) saturate(1.2)' }} /* Sáng hơn để phân biệt */
        />
      </div>
    </div>
  </div>
);


/**
 * Phong bì (wrapper) có thể lật và trượt đi.
 */
const Envelope = ({ 
  isFlipped, stage, isMoving, 
  envelopeFrontUrl, envelopeBackUrl, 
  lidOuterUrl, lidInnerUrl 
}) => (
  <div 
    className={`
      envelope-wrapper 
      ${stage === 'closingLid' ? 'closing-lid' : ''}
      ${stage === 'flippingAndMoving' || stage === 'done' ? 'flipping-and-moving' : ''}
      ${isMoving ? 'move-right' : ''}
    `}
  >
    <div className="envelope-part envelope-back">
      <img src={envelopeBackUrl || PLACEHOLDERS.envelopeBack} alt="Mặt sau phong bì" />
    </div>

    <div className="envelope-part envelope-body">
      <img src={envelopeFrontUrl || PLACEHOLDERS.envelopeFront} alt="Mặt trước phong bì" />
    </div>

    {/* Nắp phong bì (cấu trúc 3D 2 mặt) */}
    <div className="envelope-lid">
      <div className="lid-face lid-inner">
        <img src={lidInnerUrl || PLACEHOLDERS.lidInner} alt="Mặt trong nắp" />
      </div>
      <div className="lid-face lid-outer">
        <img src={lidOuterUrl || PLACEHOLDERS.lidOuter} alt="Mặt ngoài nắp" />
      </div>
      
      {/* 🚀 THÊM DẤU SÁP VÀO ĐÂY 🚀 */}
      <img 
        src="/assets/dau-sap.png" 
        alt="Wax Seal" 
        className="wax-seal"
      />
    </div>
  </div>
);

/**
 * Component chính: Điều khiển toàn bộ flow
 */
const EnvelopeFlow = ({ 
  onComplete, 
  onCancel,
  frontCoverUrl,
  backCoverUrl,
  envelopeFrontUrl,
  envelopeBackUrl,
  lidOuterUrl,
  lidInnerUrl
}) => {
  // Giai đoạn:
  // 'selecting': Đang chọn, lật phong bì.
  // 'inserting': Đã nhấn chọn, thiệp đang bay vào.
  // 'closingLid': Nắp đang đóng. (Giai đoạn này kích hoạt anim nắp)
  // 'flippingAndMoving': Nắp đã đóng, phong bì đang lật ra trước và trượt sang phải.
  // 'done': Hoàn tất.
  const [stage, setStage] = useState('selecting');
  
  // SỬA: Dùng lại state 'isFlipped'
  // false (ban đầu) = Mặt SAU (Nắp MỞ)
  // true = Mặt TRƯỚC (Nắp ĐÓNG)
  const [isFlipped, setIsFlipped] = useState(false); // Bắt đầu ở mặt SAU (Nắp MỞ)

  // SỬA: Set trạng thái ban đầu của phong bì và nắp
  useEffect(() => {
    // Trạng thái ban đầu: Mặt SAU (false), Nắp MỞ (90 độ)
    /* --- BẮT ĐẦU VÙNG COMMENT OUT GSAP: Trạng thái ban đầu --- */
    // gsap.set('.envelope-wrapper', { rotateY: 180 });
    // gsap.set('.envelope-lid', { rotateX: 90, translateZ: 2 }); // Gắn vào mặt lưng z:2
    /* --- KẾT THÚC VÙNG COMMENT OUT GSAP: Trạng thái ban đầu --- */
  }, []); // Chỉ chạy một lần khi component mount

  // SỬA: useEffect này điều khiển việc LẬT MẶT (nút Sync)
  useEffect(() => {
    // Chỉ chạy khi đang ở bước chọn
    if (stage !== 'selecting') return; 

    /* --- BẮT ĐẦU VÙNG COMMENT OUT GSAP: Lật mặt phong bì (Sync) --- */
    // const tl = gsap.timeline();
    
    // // ==========================================================
    // // KHỐI CODE ĐÚNG KHI isFlipped = true (MẶT TRƯỚC, NẮP ĐÓNG)
    // // ==========================================================
    // if (isFlipped) {
    //     // Trạng thái: MẶT TRƯỚC (Nắp ĐÓNG)
    //     tl.to('.envelope-wrapper', { 
    //         rotateY: 0, // Lật ra mặt trước
    //         duration: 0.8,
    //         ease: 'power2.inOut'
    //     })
    //     .to('.envelope-lid', {
    //         rotateX: -180, // <-- ĐÓNG NẮP
    //         translateZ: 3, // Gắn vào mặt trước z:3
    //         duration: 0.8,
    //         ease: 'power2.inOut'
    //     }, '<'); // Chạy song song
    
    // // ==========================================================
    // // KHỐI CODE ĐÚNG KHI isFlipped = false (MẶT SAU, NẮP MỞ)
    // // ==========================================================
    // } else {
    //     // Trạng thái: MẶT SAU (Nắp MỞ)
    //     tl.to('.envelope-wrapper', { 
    //         rotateY: 180, // Lật ra mặt sau
    //         duration: 0.8,
    //         ease: 'power2.inOut'
    //     })
    //     .to('.envelope-lid', {
    //         rotateX: 90,   // <-- MỞ NẮP
    //         translateZ: 2, // Gắn vào mặt lưng z:2
    //         duration: 0.8,
    //         ease: 'power2.inOut'
    //     }, '<'); // Chạy song song
    // }
    /* --- KẾT THÚC VÙNG COMMENT OUT GSAP: Lật mặt phong bì (Sync) --- */
  }, [isFlipped, stage]); // Lắng nghe state 'isFlipped'


  useEffect(() => {
    if (stage === 'inserting') {
      
      /* --- BẮT ĐẦU VÙNG COMMENT OUT GSAP: Animation flow chính --- */
      /* // THAY ĐỔI 1: Xóa onComplete khỏi định nghĩa timeline
      const tl = gsap.timeline({
        // onComplete: () => setStage('done') // <-- XÓA DÒNG NÀY
      });

      // SỬA: PHASE 1: MỞ NẮP PHONG BÌ (RỘNG HƠN)
      // Nắp đang ở mặt sau, mở 90 độ (đã set ở useEffect trên).
      // Giờ mở rộng hơn để đút thiệp.
      tl.to('.envelope-lid', {
        rotateX: 130, // SỬA LỖI: Mở nắp RỘNG HƠN (từ 90 lên 130)
        translateZ: 2, // Vẫn ở mặt sau
        duration: 0.8,
        ease: 'back.out(1.2)',
      })
      .to('.envelope-wrapper', {
        y: -5,
        duration: 0.15,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1
      }, '-=0.3');

      // ===== PHASE 2: THIỆP BAY VÀO (ĐÃ TINH CHỈNH) =====
      
      // 2A. Thiệp bay TỚI VỊ TRÍ PHÍA TRÊN khe hở
      tl.to('.flat-card-container', {
        x: 0, 
        y: -150, // SỬA: Bắt đầu cao hơn (y: -150)
        rotateZ: -90, 
        rotateY: 0, 
        scale: 0.75,
        duration: 1.5, 
        ease: 'power2.inOut'
      }, '+=0.2'); 

      // 2B. SỬA LỖI: Bỏ hành động mở nắp thiệp
      // ...
      
      // 2C. Thiệp RƠI VÀO KHE
      tl.to('.flat-card-container', {
        y: -50, // SỬA: Kết thúc cao hơn (y: -50)
        translateZ: 0, 
        duration: 0.7,
        ease: 'power1.in',
        onStart: () => {
          // SỬA LỖI: Đặt z-index của thiệp (4) thấp hơn phong bì (5)
          // để nó bị che khuất bởi mặt lưng (z-index: 3)
          gsap.set('.flat-card-container', { zIndex: 4 });
        }
      }); 

      // 2D. SỬA LỖI: Bỏ hành động fade out
      // ...

      // ===== PHASE 3: ĐÓNG NẮP PHONG BÌ (VỀ PHÍA MẶT TRƯỚC) =====
      // Sửa: Nắp đang mở rộng (130 độ) ở mặt sau (z:2)
      // Giờ nó phải lật và đóng lại ở mặt trước (z:3)
      tl.to('.envelope-lid', {
        rotateX: -178, // Đóng về phía MẶT TRƯỚC
        translateZ: 3, // Gắn vào mặt trước
        duration: 0.9,
        ease: 'power3.inOut',
        onStart: () => {
          setStage('closingLid'); 
          gsap.to('.lid-inner::after', { opacity: 0, duration: 0.3 });
        }
      })
      .to('.envelope-lid', {
        rotateX: -180,
        translateZ: 3, 
        duration: 0.2,
        ease: 'power1.in'
      })
      .to('.envelope-wrapper', {
        y: 3,
        duration: 0.1,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1
      });

      // ===== PHASE 4: LẬT (RA TRƯỚC) VÀ TRƯỢT PHONG BÌ =====
      // Sửa: Phong bì đang ở mặt SAU (rotateY:180).
      // Giờ lật ra mặt TRƯỚC (rotateY:0) VÀ trượt đi
      tl.to('.envelope-wrapper', {
        rotateY: 0, // LẬT RA MẶT TRƯỚC
        duration: 1.0,
        ease: 'power2.inOut',
        onStart: () => setStage('flippingAndMoving') 
      }, '+=0.4')
      
      // THAY ĐỔI 2: Xóa 'x: 550' để phong bì không di chuyển sang phải
      .to('.envelope-wrapper', {
        // x: 550, // <-- XÓA DÒNG NÀY
        scale: 0.95,
        duration: 1.2,
        ease: 'power2.out'
      }, '<0.3') // Chạy song song với lật (sau 0.3s)
      
      .to('.envelope-wrapper', {
        y: -15,
        duration: 0.2,
        ease: 'power2.out'
      })
      
      // THAY ĐỔI 3: Thêm 'onComplete: onComplete' vào
      // animation CUỐI CÙNG để kích hoạt điều hướng
      .to('.envelope-wrapper', {
        y: 0,
        duration: 0.3,
        ease: 'bounce.out',
        onComplete: onComplete // <-- THÊM DÒNG NÀY
      });
      */
      // --- LOGIC THAY THẾ KHI COMMENT OUT (Bỏ qua animation, gọi onComplete sau 0.5s) ---
      setStage('flippingAndMoving'); // Cập nhật stage cuối để hiển thị loading
      const delay = 500; // 0.5 giây
      const timeoutId = setTimeout(() => {
          onComplete();
      }, delay);

      return () => clearTimeout(timeoutId); // Cleanup function
      /* --- KẾT THÚC VÙNG COMMENT OUT GSAP: Animation flow chính --- */
    }
  }, [stage, onComplete]); // Thêm onComplete vào dependency array


  // SỬA: Cập nhật logic khi chọn
  const handleSelectEnvelope = () => {
    
    // Đảm bảo không thể click nhiều lần
    if (stage !== 'selecting') return; 

    if (isFlipped) { // Nếu đang ở MẶT TRƯỚC (true, Nắp Đóng)
      // 1. Lật ra MẶT SAU (false, Nắp Mở)
      setIsFlipped(false); // Kích hoạt animation lật (trong useEffect)
      
      // 2. Chờ cho animation lật (0.8s) hoàn tất RỒI MỚI bắt đầu 'inserting'
      // Vì animation đã bị comment, thời gian chờ này không cần thiết nhưng vẫn giữ logic chuyển trạng thái
      gsap.delayedCall(0.05, () => { // Giảm thời gian chờ xuống 50ms
        setStage('inserting');
        document.querySelector('.flat-card-container')?.classList.add('inserting');
      });
      
    } else { // Nếu đã ở MẶT SAU (false, Nắp Mở)
      // 3. Bắt đầu ngay lập tức
      setStage('inserting');
      document.querySelector('.flat-card-container')?.classList.add('inserting');
    }
  };


  return (
    <div className="envelope-flow-overlay">
      <div className="flow-scene">
        
        {/* Tấm thiệp luôn ở bên trái, chờ được kích hoạt */}
        <FlatCard 
          isInserting={stage !== 'selecting'}
          frontCoverUrl={frontCoverUrl}
          backCoverUrl={backCoverUrl}
        />
        
        {/* Phong bì ở giữa, chờ được lật và chọn */}
        <Envelope 
          isFlipped={isFlipped} // Prop này giờ chỉ điều khiển CSS class (nếu có)
          stage={stage}
          isMoving={stage === 'flippingAndMoving' || stage === 'done'}
          envelopeFrontUrl={envelopeFrontUrl}
          envelopeBackUrl={envelopeBackUrl}
          lidOuterUrl={lidOuterUrl}
          lidInnerUrl={lidInnerUrl}
        />

      </div>

      {/* Thanh điều khiển */}
      <div className="flow-controls">
        {stage === 'selecting' && (
          <>
            <Button 
              variant="outlined" 
              onClick={onCancel} 
              startIcon={<Edit />}
              sx={{ color: '#6B7280', borderColor: '#E5E7EB', bgcolor: 'white' }}
            >
              Hủy
            </Button>
            <Button 
              variant="contained" 
              onClick={() => setIsFlipped(f => !f)} // SỬA: Dùng state mới
              startIcon={<Sync />}
              sx={{ bgcolor: 'white', color: '#333', '&:hover': { bgcolor: 'f0f0f0' } }}
            >
              {/* SỬA LỖI: Đổi text của nút */}
              {isFlipped ? "Xem Mặt Sau (Nắp Mở)" : "Xem Mặt Trước (Nắp Đóng)"}
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSelectEnvelope} 
              startIcon={<ArrowForward />}
              color="primary"
            >
              Chọn Mẫu Này
            </Button>
          </>
        )}

        {(stage === 'inserting' || stage === 'closingLid' || stage === 'flippingAndMoving') && (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#333' }}>
              {stage === 'inserting' && 'Đang đưa thiệp vào phong bì...'}
              {stage === 'closingLid' && 'Đang đóng nắp phong bì...'}
              {stage === 'flippingAndMoving' && 'Hoàn tất...'}
            </Typography>
          </Box>
        )}
      </div>
    </div>
  );
};

export default EnvelopeFlow;