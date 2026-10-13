import React, { useEffect, useRef } from 'react';

const CanvasCursor = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let animationFrameId;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);

        // Quản lý các hạt hạt sáng (Particles)
        const particles = [];
        const mouse = { x: -100, y: -100, isMoving: false };
        let mouseTimer = null;

        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            mouse.isMoving = true;

            // Tạo các hạt hào quang khi chuột di chuyển
            for (let i = 0; i < 2; i++) {
                particles.push({
                    x: mouse.x,
                    y: mouse.y,
                    size: Math.random() * 3 + 1.5,
                    speedX: (Math.random() - 0.5) * 1.5,
                    speedY: (Math.random() - 0.5) * 1.5,
                    color: i % 2 === 0 ? 'rgba(37, 99, 235,' : 'rgba(219, 39, 119,', // Xanh dương & Hồng tím
                    alpha: 0.7,
                    decay: Math.random() * 0.02 + 0.015,
                });
            }

            clearTimeout(mouseTimer);
            mouseTimer = setTimeout(() => {
                mouse.isMoving = false;
            }, 100);
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Vòng lặp render hiệu ứng
        const render = () => {
            ctx.clearRect(0, 0, width, height);

            // Vẽ vòng sáng dịu quanh đầu trỏ chuột
            if (mouse.x > 0 && mouse.y > 0) {
                const gradient = ctx.createRadialGradient(
                    mouse.x, mouse.y, 0,
                    mouse.x, mouse.y, 35
                );
                gradient.addColorStop(0, 'rgba(37, 99, 235, 0.18)');
                gradient.addColorStop(0.5, 'rgba(219, 39, 119, 0.08)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(mouse.x, mouse.y, 35, 0, Math.PI * 2);
                ctx.fill();
            }

            // Cập nhật và vẽ từng hạt vệt sáng
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.speedX;
                p.y += p.speedY;
                p.alpha -= p.decay;

                if (p.alpha <= 0) {
                    particles.splice(i, 1);
                } else {
                    ctx.fillStyle = `${p.color}${p.alpha})`;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
            clearTimeout(mouseTimer);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: 9999,
            }}
        />
    );
};

export default CanvasCursor;