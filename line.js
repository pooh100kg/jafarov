// line.js
document.addEventListener('DOMContentLoaded', () => {
    const lineContainer = document.getElementById('yellow-line-container');
    if(lineContainer) {
        lineContainer.innerHTML = `
        <svg viewBox="0 0 600 120" fill="none" style="width: 100%; height: 100%; overflow: visible;">
            <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                    <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
            </defs>
            <path d="M50 60 Q 150 55, 250 65 T 550 60 M 60 75 Q 200 65, 300 80 T 540 70 M 80 90 Q 250 85, 520 85" 
                  stroke="#ffea00" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"
                  filter="url(#glow)" opacity="0"
                  style="stroke-dasharray: 2000; stroke-dashoffset: 2000; animation: drawLine 1.5s ease-out 0.5s forwards, fadeIn 0.5s linear 0.5s forwards;">
            </path>
            <style>
                @keyframes drawLine { to { stroke-dashoffset: 0; } }
                @keyframes fadeIn { to { opacity: 0.8; } }
            </style>
        </svg>`;
    }
});