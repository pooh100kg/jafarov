document.addEventListener('DOMContentLoaded', () => {
    const lineContainer = document.getElementById('yellow-line-container');
    
    if(lineContainer) {
        lineContainer.innerHTML = `
        <svg viewBox="0 0 600 150" preserveAspectRatio="none" style="width: 100%; height: 100%; overflow: visible;">
            <defs>
                <!-- Легкое свечение самой линии -->
                <filter id="line-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            
            <!-- Рисуем зигзаг: чуть шире и более плоский -->
            <path d="M 20 80 Q 150 70, 280 85 T 580 80 M 30 100 Q 180 90, 310 105 T 570 95 M 50 120 Q 200 115, 550 115" 
                  fill="none" 
                  stroke="#ffea00" 
                  stroke-width="5" 
                  stroke-linecap="round" 
                  stroke-linejoin="round"
                  filter="url(#line-glow)"
                  opacity="0"
                  style="stroke-dasharray: 1500; stroke-dashoffset: 1500; animation: drawLine 2s cubic-bezier(0.25, 1, 0.5, 1) 0.5s forwards, fadeIn 0.5s ease-out 0.5s forwards;">
            </path>
            
            <style>
                @keyframes drawLine { to { stroke-dashoffset: 0; } }
                @keyframes fadeIn { to { opacity: 1; } }
            </style>
        </svg>`;
    }
});
