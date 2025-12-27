/* 
   APP.JS - OPTIMIZED FOR MOBILE
*/

function getYouTubeID(url) {
    if (!url || url === '#') return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// VIDEO DATA
const videoList = [
    { title: "VIDEO 01", link: "videos/video1.mp4" },
    { title: "VIDEO 02", link: "videos/video2.mp4" },
    { title: "VIDEO 03", link: "videos/video3.mp4" },
    { title: "VIDEO 04", link: "videos/video4.mp4" }
];

class App {
    constructor() {
        this.dom = {
            preloader: document.getElementById('preloader'),
            hero: document.getElementById('hero-section'),
            portfolio: document.getElementById('portfolio-section'),
            grid: document.getElementById('grid-container'),
            cursor: document.getElementById('cursor-follower'),
            fireflies: document.getElementById('fireflies-container')
        };
        
        this.state = {
            mouseX: window.innerWidth / 2,
            mouseY: window.innerHeight / 2,
            isLoading: true,
            isMobile: window.innerWidth < 768
        };

        setTimeout(() => { if(this.state.isLoading) this.finishLoading(); }, 2000);
        this.init();
    }

    init() {
        try {
            this.audio = new AudioController();
            this.videoPlayer = new UniversalPlayer(this.audio, this.state.isMobile);
            this.setupPreloader();
            this.setupEventListeners();
            this.setupFireflies(); // Replaces old background setup
            this.renderGrid();
            
            // Only run cursor loop on desktop
            if (!this.state.isMobile) {
                this.loop();
            } else {
                if(this.dom.cursor) this.dom.cursor.style.display = 'none';
            }
        } catch (e) {
            console.error("Init Error:", e);
            this.finishLoading();
        }
    }

    setupPreloader() {
        const bar = this.dom.preloader.querySelector('.progress-bar');
        let width = 0;
        const interval = setInterval(() => {
            width += Math.random() * 20;
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
        
        if(openBtn) openBtn.addEventListener('click', () => { 
            this.audio.play('click'); 
            this.switchScreen('portfolio'); 
        });
        
        if(backBtn) backBtn.addEventListener('click', () => { 
            this.audio.play('click'); 
            this.switchScreen('hero'); 
        });

        // Desktop Only Interactions
        if (!this.state.isMobile) {
            window.addEventListener('mousemove', (e) => {
                this.state.mouseX = e.clientX; 
                this.state.mouseY = e.clientY;
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
    }

    // Fireflies Logic (Lightweight DOM)
    setupFireflies() {
        if (!this.dom.fireflies) return;
        this.dom.fireflies.innerHTML = '';
        const count = this.state.isMobile ? 15 : 30; // Fewer particles on mobile
        
        for(let i=0; i<count; i++) {
            const f = document.createElement('div');
            f.classList.add('firefly');
            
            // Random properties
            const size = Math.random() * 3 + 2;
            f.style.width = `${size}px`;
            f.style.height = `${size}px`;
            f.style.left = `${Math.random() * 100}%`;
            f.style.animationDuration = `${10 + Math.random() * 20}s`;
            f.style.animationDelay = `${Math.random() * 5}s`;
            
            this.dom.fireflies.appendChild(f);
        }
    }

    checkCursorHover(e) {
        if (!this.dom.cursor) return;
        const target = e.target;
        const isInteractive = target.closest('a') || target.closest('button') || target.closest('.video-card');
        
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
        const xRot = -(y / rect.height) * 10; // Reduced rotation for performance
        const yRot = (x / rect.width) * 10;
        btn.style.transform = `perspective(1000px) rotateX(${xRot}deg) rotateY(${yRot}deg) scale(1.02)`;
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
                
                // Animate cards
                const cards = port.querySelectorAll('.card-wrapper');
                cards.forEach((card, index) => {
                    card.classList.remove('card-visible'); 
                    card.style.animation = 'none'; 
                    card.offsetHeight;
                    card.style.animation = `cardEntrance 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards ${index * 0.05}s`;
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
                const thumbUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                contentHtml = `<div class="grid-video-element" style="background: url('${thumbUrl}') center/cover no-repeat;"></div>`;
            } else {
                // Mobile optimization: Use poster or simplified video element
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
                if (link.includes('t.me')) {
                    window.open(link, '_blank');
                } else {
                    this.videoPlayer.open(index);
                }
            });
            
            // Mouseover Play - Only on Desktop
            if (!this.state.isMobile) {
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
            }
        });
    }

    loop() {
        if (this.dom.cursor) {
            const currentX = parseFloat(this.dom.cursor.dataset.x) || this.state.mouseX;
            const currentY = parseFloat(this.dom.cursor.dataset.y) || this.state.mouseY;
            
            // Linear interpolation for smooth cursor
            const nextX = currentX + (this.state.mouseX - currentX) * 0.2;
            const nextY = currentY + (this.state.mouseY - currentY) * 0.2;
            
            this.dom.cursor.style.transform = `translate(${nextX}px, ${nextY}px) translate(-50%, -50%)`;
            this.dom.cursor.dataset.x = nextX; 
            this.dom.cursor.dataset.y = nextY;
        }
        requestAnimationFrame(() => this.loop());
    }
}

class AudioController {
    constructor() {
        this.sounds = { hover: document.getElementById('sound-hover'), click: document.getElementById('sound-click') };
        Object.values(this.sounds).forEach(s => { if(s) s.volume = 0.2; });
    }
    play(id) { 
        const s = this.sounds[id]; 
        if (s && s.readyState >= 2) { 
            s.currentTime = 0; 
            s.play().catch(() => {}); 
        } 
    }
}

class UniversalPlayer {
    constructor(audioCtrl, isMobile) {
        this.audio = audioCtrl;
        this.isMobile = isMobile;
        this.currentIndex = 0;
        
        this.dom = {
            modal: document.getElementById('video-modal'),
            content: document.querySelector('.modal-content'),
            iframe: document.getElementById('lb-iframe'),
            video: document.getElementById('lb-video'),
            videoBg: document.getElementById('lb-video-bg'),
            blurContainer: document.querySelector('.lb-blur-bg'),
            loader: document.querySelector('.lb-loader'),
            hud: document.querySelector('.hud-controls'),
            progressTrack: document.querySelector('.progress-track'),
            progressFill: document.querySelector('.progress-fill'),
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

        if(this.dom.prevBtn) this.dom.prevBtn.addEventListener('click', () => this.prev());
        if(this.dom.nextBtn) this.dom.nextBtn.addEventListener('click', () => this.next());

        if(this.dom.playBtn) this.dom.playBtn.addEventListener('click', () => this.togglePlay());
        
        if(this.dom.progressTrack) {
            this.dom.progressTrack.addEventListener('click', (e) => this.seek(e));
        }

        this.dom.video.addEventListener('timeupdate', () => this.updateProgress());
        this.dom.video.addEventListener('waiting', () => { if(this.dom.loader) this.dom.loader.style.opacity = '1'; });
        this.dom.video.addEventListener('playing', () => { if(this.dom.loader) this.dom.loader.style.opacity = '0'; });
        this.dom.video.addEventListener('ended', () => {
             this.dom.playBtn.innerText = "►";
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
        this.dom.loader.style.opacity = '1';

        const ytID = getYouTubeID(item.link);

        if (ytID) {
            // YOUTUBE
            this.dom.content.style.aspectRatio = '16/9';
            let ytUrl = `https://www.youtube.com/embed/${ytID}?autoplay=1&modestbranding=1&rel=0&playsinline=1`;
            this.dom.iframe.src = ytUrl;
            this.dom.iframe.classList.add('active');
            this.dom.loader.style.opacity = '0';
        } else {
            // MP4
            this.dom.video.src = item.link;
            this.dom.video.classList.add('active');
            
            // Only play background video if NOT mobile (Performance fix)
            if (!this.isMobile && this.dom.videoBg) {
                this.dom.videoBg.src = item.link;
                this.dom.blurContainer.classList.add('active');
            }

            this.dom.playBtn.innerText = "❚❚";
            this.dom.video.play().catch(e => console.log("Autoplay blocked"));
            
            if (!this.isMobile && this.dom.videoBg) {
                this.dom.videoBg.play().catch(()=>{});
            }
        }
    }

    togglePlay() {
        if(this.dom.video.classList.contains('active')) {
            if(this.dom.video.paused) {
                this.dom.video.play();
                if(!this.isMobile) this.dom.videoBg.play();
                this.dom.playBtn.innerText = "❚❚";
            } else {
                this.dom.video.pause();
                if(!this.isMobile) this.dom.videoBg.pause();
                this.dom.playBtn.innerText = "►";
            }
        }
    }

    seek(e) {
        if(!this.dom.video.duration) return;
        const rect = this.dom.progressTrack.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        this.dom.video.currentTime = pos * this.dom.video.duration;
    }

    updateProgress() {
        const vid = this.dom.video;
        if(vid.duration) {
            const pct = (vid.currentTime / vid.duration) * 100;
            this.dom.progressFill.style.width = `${pct}%`;
            this.dom.timeCurrent.innerText = this.formatTime(vid.currentTime);
            this.dom.timeTotal.innerText = this.formatTime(vid.duration);
            
            // Sync BG video on desktop only
            if(!this.isMobile && Math.abs(this.dom.videoBg.currentTime - vid.currentTime) > 0.5) {
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
            if(this.dom.videoBg) {
                this.dom.videoBg.pause();
                this.dom.videoBg.src = "";
            }
        }, 300);
    }
}

document.addEventListener('DOMContentLoaded', () => new App());
