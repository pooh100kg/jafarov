// background.js
document.addEventListener('DOMContentLoaded', () => {
    let bgContainer = document.getElementById('background-effects');
    if (!bgContainer) {
        bgContainer = document.createElement('div');
        bgContainer.id = 'background-effects';
        document.body.appendChild(bgContainer);
    }
    bgContainer.innerHTML = '';
    
    const orbsCount = 4;
    for (let i = 0; i < orbsCount; i++) {
        const orb = document.createElement('div');
        const size = Math.random() * 600 + 400;
        
        orb.style.position = 'absolute';
        orb.style.borderRadius = '50%';
        orb.style.filter = 'blur(120px)';
        orb.style.opacity = '0.4';
        orb.style.zIndex = '-1';
        orb.style.width = `${size}px`;
        orb.style.height = `${size}px`;
        orb.style.background = 'radial-gradient(circle, rgba(255, 234, 0, 0.12) 0%, rgba(0,0,0,0) 70%)';
        orb.style.left = `${Math.random() * 100}%`;
        orb.style.top = `${Math.random() * 100}%`;
        orb.style.transform = 'translate(-50%, -50%)';
        
        bgContainer.appendChild(orb);

        function floatOrb() {
            const nextX = Math.random() * 100 - 50;
            const nextY = Math.random() * 100 - 50;
            const scale = 0.8 + Math.random() * 0.4;

            orb.animate([
                { transform: `translate(-50%, -50%) translate(0, 0) scale(1)` },
                { transform: `translate(-50%, -50%) translate(${nextX}vw, ${nextY}vh) scale(${scale})` }
            ], {
                duration: 20000 + Math.random() * 10000,
                easing: 'ease-in-out',
                fill: 'forwards'
            }).onfinish = floatOrb;
        }
        floatOrb();
    }
});