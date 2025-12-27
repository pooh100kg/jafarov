/* 
   APP.JS - UNIVERSAL PLAYER WITH AMBILIGHT EFFECT & LIVE PREVIEWS
*/

function getYouTubeID(url) {
    if (!url || url === '#') return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

const videoList = [
    {
        title: "", 
        link: "videos/video1.mp4", 
    },
    {
        title: "",
        link: "videos/video2.mp4",
    },
    {
        title: "",
        link: "videos/video3.mp4",
    },
    {
        title: "",
        link: "videos/video4.mp4",
    }
];

class App {
    constructor() {
        this.dom = {
            preloader: document.getElementById('preloader'),
            hero: document.getElementById('hero-section'),
            portfolio: document.getElementById('portfolio-section'),
            grid: document.getElementById('grid-container'),
            cursor: document.getElementById('cursor-follower'),
            bgContainer: document.getElementById('background-effects'),
            line: document.getElementById('yellow-line-container')
        };
        
        this.state = {
            mouseX: window.innerWidth / 2,
            mouseY: window.innerHeight / 2,
            isLoading: true
        };

        setTimeout(() => { if(this.state.isLoading) this.finishLoading(); }, 2500);
        this.init();
    }

    init() {
        try {
            this.audio = new AudioController();
            this.videoPlayer = new UniversalPlayer(this.audio);
            this.setupPreloader();
            this.setupEventListeners();
            this.setupBackground();
            this.setupYellowLine();
            this.renderGrid();
            this.loop();
        } catch (e) {
            console.error("Init Error:", e);
            this.finishLoading();
        }
    }

    setupPreloader() {
        const bar = this.dom.preloader.querySelector('.progress-bar');
        let width = 0;
        const interval = setInterval(() => {
            width += Math.random() * 15;
            if (width >= 100) {
                width = 100;
                clearInterval(interval);
                this.finishLoading();
            }
            if(bar) bar.style.width = `${width}%`;
        }, 100);
    }

    finishLoading() {
        if (!this.state.isLoading) return;
        this.state.isLoading = false;
        if(this.dom.preloader) {
            this.dom.preloader.style.opacity = '0';
            setTimeout(() => { this.dom.preloader.style.display = 'none'; }, 500);
        }
    }

    setupEventListeners() {
        const openBtn = document.getElementById('open-portfolio');
        const backBtn = document.getElementById('back-home');
        if(openBtn) openBtn.addEventListener('click', () => { this.audio.play('click'); this.switchScreen('portfolio'); });
        if(backBtn) backBtn.addEventListener('click', () => { this.audio.play('click'); this.switchScreen('hero'); });

        window.addEventListener('mousemove', (e) => {
            this.state.mouseX = e.clientX; this.state.mouseY = e.clientY;
            this.checkCursorHover(e);
        }, { passive: true });

        document.querySelectorAll('.btn-apple').forEach(btn => {
            btn.addEventListener('mousemove', (e) => this.tiltButton(e, btn));
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale(1)`;
                if(this.dom.cursor) this.dom.cursor.classList.remove('cursor-hover');
            });
            btn.addEventListener('mouseenter', () => {
                this.audio.play('hover'); 
                if(this.dom.cursor) this.dom.cursor.classList.add('cursor-hover');
            });
        });
    }

    checkCursorHover(e) {
        if (!this.dom.cursor) return;
        const target = e.target;
        const isInteractive = target.closest('#video-modal') || 
                              target.closest('.video-card') || 
                              target.tagName === 'A' || target.tagName === 'BUTTON' ||
                              target.closest('.progress-track');
        if (isInteractive) {
            this.dom.cursor.classList.add('cursor-dot-active');
        } else {
            this.dom.cursor.classList.remove('cursor-dot-active');
        }
    }

    tiltButton(e, btn) {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const xRot = -(y / rect.height) * 20;
        const yRot = (x / rect.width) * 20;
        btn.style.transform = `perspective(1000px) rotateX(${xRot}deg) rotateY(${yRot}deg) scale(1.05)`;
    }

    switchScreen(target) {
        const hero = this.dom.hero;
        const port = this.dom.portfolio;

        if (target === 'portfolio') {
            hero.classList.replace('active-screen', 'hidden-screen');
            setTimeout(() => {
                hero.style.display = 'none'; port.style.display = 'flex';
                void port.offsetWidth; 
                port.classList.replace('hidden-screen', 'active-screen');
                port.style.visibility = 'visible';
                
                const cards = port.querySelectorAll('.card-wrapper');
                cards.forEach((card, index) => {
                    card.classList.remove('card-visible'); card.style.animation = 'none'; card.offsetHeight;
                    card.style.animation = `cardEntrance 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards ${index * 0.1}s`;
                });
            }, 500);
        } else {
            port.classList.replace('active-screen', 'hidden-screen');
            setTimeout(() => {
                port.style.display = 'none'; hero.style.display = 'flex';
                void hero.offsetWidth; hero.classList.replace('hidden-screen', 'active-screen');
            }, 500);
        }
    }

    renderGrid() {
        if (!this.dom.grid) return;
        
        this.dom.grid.innerHTML = videoList.map(video => {
            const ytId = getYouTubeID(video.link);
            let contentHtml = '';

            if (ytId) {
                // YouTube: use thumbnail
                const thumbUrl = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
                contentHtml = `<div class="grid-video-element" style="background: url('${thumbUrl}') center/cover;"></div>`;
            } else {
                // Local MP4: use <video> tag with #t=0.1 to show first frame
                contentHtml = `
                    <video class="grid-video-element" muted playsinline preload="metadata">
                        <source src="${video.link}#t=0.1" type="video/mp4">
                    </video>
                `;
            }

            return `
            <div class="card-wrapper">
                <a href="${video.link}" class="video-card">
                    ${contentHtml}
                    <div class="card-overlay">
                        <div class="play-icon"></div>
                        <span class="card-text">${video.title}</span>
                    </div>
                </a>
            </div>
            `;
        }).join('');

        const cards = this.dom.grid.querySelectorAll('.video-card');
        cards.forEach((card, index) => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const link = card.getAttribute('href');
                if (link === '#' || link === '') return;
                
                if (link.includes('t.me')) {
                    window.open(link, '_blank');
                } else {
                    this.videoPlayer.open(index);
                }
            });
            
            // Play on Hover for Grid
            const vid = card.querySelector('video');
            if(vid) {
                card.addEventListener('mouseenter', () => { 
                    this.audio.play('hover');
                    vid.play().catch(()=>{}); 
                });
                card.addEventListener('mouseleave', () => { 
                    vid.pause(); 
                    vid.currentTime = 0; 
                });
            } else {
                card.addEventListener('mouseenter', () => this.audio.play('hover'));
            }
        });
    }

    setupBackground() {
        if(!this.dom.bgContainer) return;
        this.dom.bgContainer.innerHTML = '';
        for(let i=0; i<6; i++) {
            const orb = document.createElement('div');
            orb.classList.add('bg-orb');
            const size = 300 + Math.random() * 500;
            orb.style.width = `${size}px`; orb.style.height = `${size}px`;
            orb.style.left = `${Math.random()*100}%`; orb.style.top = `${Math.random()*100}%`;
            orb.dataset.vx = (Math.random() - 0.5) * 0.3; orb.dataset.vy = (Math.random() - 0.5) * 0.3;
            orb.dataset.x = parseFloat(orb.style.left); orb.dataset.y = parseFloat(orb.style.top);
            this.dom.bgContainer.appendChild(orb);
        }
    }

    setupYellowLine() {
        if(!this.dom.line) return;
        this.dom.line.innerHTML = `
            <svg viewBox="0 0 600 120" preserveAspectRatio="none" style="width:100%; height:100%; overflow:visible;">
                <filter id="glow"><feGaussianBlur stdDeviation="4" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <path d="M0 60 Q 150 10, 300 60 T 600 60" fill="none" stroke="#ffea00" stroke-width="2" filter="url(#glow)"
                      style="stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: drawLine 2s ease-out 0.5s forwards; opacity: 0.8;">
                </path>
            </svg>
            <style>@keyframes drawLine { to { stroke-dashoffset: 0; } }</style>
        `;
    }

    loop() {
        if (window.innerWidth > 768 && this.dom.cursor) {
            const currentX = parseFloat(this.dom.cursor.dataset.x) || 0;
            const currentY = parseFloat(this.dom.cursor.dataset.y) || 0;
            const nextX = currentX + (this.state.mouseX - currentX) * 0.15;
            const nextY = currentY + (this.state.mouseY - currentY) * 0.15;
            this.dom.cursor.style.transform = `translate(${nextX}px, ${nextY}px) translate(-50%, -50%)`;
            this.dom.cursor.dataset.x = nextX; this.dom.cursor.dataset.y = nextY;
        }
        if(this.dom.bgContainer) {
            const orbs = this.dom.bgContainer.children;
            for (let orb of orbs) {
                let x = parseFloat(orb.dataset.x); let y = parseFloat(orb.dataset.y);
                x += parseFloat(orb.dataset.vx); y += parseFloat(orb.dataset.vy);
                if(x < -20 || x > 120) orb.dataset.vx *= -1;
                if(y < -20 || y > 120) orb.dataset.vy *= -1;
                orb.dataset.x = x; orb.dataset.y = y;
                orb.style.left = `${x}%`; orb.style.top = `${y}%`;
            }
        }
        requestAnimationFrame(() => this.loop());
    }
}

class AudioController {
    constructor() {
        this.sounds = { hover: document.getElementById('sound-hover'), click: document.getElementById('sound-click') };
        Object.values(this.sounds).forEach(s => { if(s) s.volume = 0.2; });
    }
    play(id) { const s = this.sounds[id]; if (s) { s.currentTime = 0; s.play().catch(() => {}); } }
}

class UniversalPlayer {
    constructor(audioCtrl) {
        this.audio = audioCtrl;
        this.currentIndex = 0;
        
        this.dom = {
            modal: document.getElementById('video-modal'),
            content: document.querySelector('.modal-content'),
            iframe: document.getElementById('lb-iframe'),
            video: document.getElementById('lb-video'),
            videoBg: document.getElementById('lb-video-bg'), // Background video
            blurContainer: document.querySelector('.lb-blur-bg'),
            loader: document.querySelector('.lb-loader'),
            hud: document.querySelector('.hud-controls'),
            progressTrack: document.querySelector('.progress-track'),
            progressFill: document.querySelector('.progress-fill'),
            progressHover: document.querySelector('.progress-hover'),
            playBtn: document.querySelector('.play-btn'),
            timeCurrent: document.querySelector('.time-current'),
            timeTotal: document.querySelector('.time-total'),
            closeBtn: document.getElementById('close-modal'),
            prevBtn: document.getElementById('prev-video'),
            nextBtn: document.getElementById('next-video')
        };

        this.bindEvents();
    }

    bindEvents() {
        if(this.dom.closeBtn) this.dom.closeBtn.addEventListener('click', () => this.close());
        const backdrop = this.dom.modal.querySelector('.modal-backdrop');
        if(backdrop) backdrop.addEventListener('click', () => this.close());

        document.addEventListener('keydown', (e) => {
            if (this.dom.modal.classList.contains('modal-hidden')) return;
            if (e.key === 'Escape') this.close();
            if (e.key === 'ArrowRight') this.next();
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === ' ') { e.preventDefault(); this.togglePlay(); }
        });

        if(this.dom.prevBtn) this.dom.prevBtn.addEventListener('click', () => this.prev());
        if(this.dom.nextBtn) this.dom.nextBtn.addEventListener('click', () => this.next());

        if(this.dom.playBtn) this.dom.playBtn.addEventListener('click', () => this.togglePlay());
        if(this.dom.progressTrack) {
            this.dom.progressTrack.addEventListener('click', (e) => this.seek(e));
            this.dom.progressTrack.addEventListener('mousemove', (e) => this.hoverSeek(e));
            let isDragging = false;
            this.dom.progressTrack.addEventListener('mousedown', () => isDragging = true);
            document.addEventListener('mouseup', () => isDragging = false);
            document.addEventListener('mousemove', (e) => {
                if(isDragging && !this.dom.video.paused) this.seek(e);
            });
        }

        this.dom.video.addEventListener('timeupdate', () => this.updateProgress());
        this.dom.video.addEventListener('waiting', () => { if(this.dom.loader) this.dom.loader.style.opacity = '1'; });
        this.dom.video.addEventListener('playing', () => { if(this.dom.loader) this.dom.loader.style.opacity = '0'; });
        this.dom.video.addEventListener('ended', () => {
             this.dom.playBtn.innerText = "►";
             this.dom.videoBg.pause();
        });
    }

    open(index) {
        this.currentIndex = index;
        const item = videoList[index];
        this.dom.modal.classList.remove('modal-hidden');
        document.body.style.overflow = 'hidden';

        // Reset
        this.dom.iframe.classList.remove('active');
        this.dom.iframe.src = "";
        this.dom.video.classList.remove('active');
        this.dom.video.pause();
        this.dom.videoBg.src = "";
        this.dom.blurContainer.classList.remove('active');
        this.dom.hud.style.display = 'none';
        this.dom.loader.style.opacity = '1';

        const ytID = getYouTubeID(item.link);

        if (ytID) {
            // YOUTUBE
            this.dom.content.style.aspectRatio = '16/9';
            this.dom.content.style.width = '90%';
            let ytUrl = `https://www.youtube.com/embed/${ytID}?autoplay=1&modestbranding=1&rel=0&playsinline=1`;
            this.dom.iframe.src = ytUrl;
            this.dom.iframe.classList.add('active');
            setTimeout(() => { this.dom.loader.style.opacity = '0'; }, 1000);
        } else {
            // NATIVE MP4 with BLUR BACKGROUND
            this.dom.video.src = item.link;
            this.dom.video.classList.add('active');
            
            // Set up background video
            this.dom.videoBg.src = item.link;
            this.dom.blurContainer.classList.add('active');

            this.dom.hud.style.display = 'flex';
            this.dom.playBtn.innerText = "❚❚";
            
            // Aspect Ratio Logic
            this.dom.content.style.aspectRatio = '16/9'; 
            this.dom.content.style.width = '90%';
            this.dom.content.style.height = 'auto';

            // Start both
            const playPromise = this.dom.video.play();
            if(playPromise !== undefined) {
                playPromise.then(() => {
                    this.dom.videoBg.play();
                }).catch(e => console.log("Autoplay blocked"));
            }
        }
    }

    togglePlay() {
        if(this.dom.video.classList.contains('active')) {
            if(this.dom.video.paused) {
                this.dom.video.play();
                this.dom.videoBg.play();
                this.dom.playBtn.innerText = "❚❚";
            } else {
                this.dom.video.pause();
                this.dom.videoBg.pause();
                this.dom.playBtn.innerText = "►";
            }
        }
    }

    seek(e) {
        if(!this.dom.video.duration) return;
        const rect = this.dom.progressTrack.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const targetTime = pos * this.dom.video.duration;
        this.dom.video.currentTime = targetTime;
        this.dom.videoBg.currentTime = targetTime;
    }

    hoverSeek(e) {
        const rect = this.dom.progressTrack.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        this.dom.progressHover.style.width = `${pos * 100}%`;
    }

    updateProgress() {
        const vid = this.dom.video;
        if(vid.duration) {
            const pct = (vid.currentTime / vid.duration) * 100;
            this.dom.progressFill.style.width = `${pct}%`;
            this.dom.timeCurrent.innerText = this.formatTime(vid.currentTime);
            this.dom.timeTotal.innerText = this.formatTime(vid.duration);
            
            // Sync check
            if(Math.abs(this.dom.videoBg.currentTime - vid.currentTime) > 0.5) {
                this.dom.videoBg.currentTime = vid.currentTime;
            }
        }
    }

    formatTime(s) {
        if(isNaN(s)) return "00:00";
        let min = Math.floor(s / 60);
        let sec = Math.floor(s % 60);
        return `${min < 10 ? '0'+min : min}:${sec < 10 ? '0'+sec : sec}`;
    }

    next() {
        let nextIndex = this.currentIndex + 1;
        if (nextIndex >= videoList.length) nextIndex = 0;
        this.open(nextIndex);
    }

    prev() {
        let prevIndex = this.currentIndex - 1;
        if (prevIndex < 0) prevIndex = videoList.length - 1;
        this.open(prevIndex);
    }

    close() {
        this.dom.modal.classList.add('modal-hidden');
        document.body.style.overflow = '';
        setTimeout(() => {
            this.dom.iframe.src = "";
            this.dom.video.pause();
            this.dom.video.src = "";
            this.dom.videoBg.pause();
            this.dom.videoBg.src = "";
        }, 300);
    }
}

document.addEventListener('DOMContentLoaded', () => new App());