document.addEventListener('DOMContentLoaded', () => {
    // 1. Preloader
    const preloader = document.getElementById('preloader');
    const progressBar = preloader.querySelector('.progress-bar');
    let loadProgress = 0;

    const animateProgressBar = () => {
        loadProgress += 2;
        progressBar.style.width = `${loadProgress}%`;
        if (loadProgress < 100) {
            requestAnimationFrame(animateProgressBar);
        } else {
            setTimeout(() => {
                preloader.style.opacity = '0';
                setTimeout(() => {
                    preloader.style.display = 'none';
                    document.body.style.overflow = '';
                }, 500);
            }, 500);
        }
    };
    animateProgressBar();

    // 2. Audio
    const audioCtx = {
        hover: document.getElementById('sound-hover'),
        click: document.getElementById('sound-click'),
        play(type) {
            const sound = this[type];
            if (sound) {
                sound.currentTime = 0;
                sound.volume = 0.5;
                sound.play().catch(() => {});
            }
        }
    };

    // 3. Elements
    const heroSection = document.getElementById('hero-section');
    const portfolioSection = document.getElementById('portfolio-section');
    const openPortfolioBtn = document.getElementById('open-portfolio');
    const backHomeBtn = document.getElementById('back-home');
    const grid = document.getElementById('grid-container');
    const follower = document.getElementById('cursor-follower');
    const modal = document.getElementById('video-modal');
    const modalContainer = document.getElementById('modal-video-container');
    const closeModalBtn = document.getElementById('close-modal');
    const customVideoControls = document.getElementById('custom-video-controls');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const progressBarVideo = document.getElementById('progress-bar');
    const volumeBar = document.getElementById('volume-bar');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    let currentVideoElement = null;

    // 4. Navigation & History
    function switchScreen(from, to, path) {
        from.classList.remove('active-screen');
        from.classList.add('hidden-screen');
        from.style.pointerEvents = 'none';
        if (path) history.pushState({ screen: path }, '', path);
        setTimeout(() => {
            from.style.display = 'none';
            to.style.display = 'flex';
            to.style.pointerEvents = 'all';
            setTimeout(() => {
                to.classList.remove('hidden-screen');
                to.classList.add('active-screen');
            }, 50);
        }, 500);
    }

    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.screen === '#portfolio') {
            switchScreen(heroSection, portfolioSection, null);
        } else {
            switchScreen(portfolioSection, heroSection, null);
        }
    });

    openPortfolioBtn.addEventListener('click', () => {
        audioCtx.play('click');
        switchScreen(heroSection, portfolioSection, '#portfolio');
    });

    backHomeBtn.addEventListener('click', () => {
        audioCtx.play('click');
        switchScreen(portfolioSection, heroSection, '#home');
    });

    // 5. Video Player Logic
    function getYouTubeId(url) {
        const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    function setupCustomVideoPlayer() {
        if (!currentVideoElement) return;
        playPauseBtn.classList.remove('playing');
        playPauseBtn.innerHTML = '&#9658;'; 
        currentVideoElement.controls = false;

        playPauseBtn.onclick = () => {
            if (currentVideoElement.paused) {
                currentVideoElement.play();
                playPauseBtn.classList.add('playing');
                playPauseBtn.innerHTML = '&#10074;&#10074;';
            } else {
                currentVideoElement.pause();
                playPauseBtn.classList.remove('playing');
                playPauseBtn.innerHTML = '&#9658;';
            }
        };

        currentVideoElement.ontimeupdate = () => {
            if (!currentVideoElement.duration) return;
            progressBarVideo.value = (currentVideoElement.currentTime / currentVideoElement.duration) * 100;
        };

        progressBarVideo.oninput = () => {
            currentVideoElement.currentTime = (progressBarVideo.value / 100) * currentVideoElement.duration;
        };

        volumeBar.oninput = () => {
            currentVideoElement.volume = volumeBar.value / 100;
        };
        volumeBar.value = currentVideoElement.volume * 100;

        fullscreenBtn.onclick = () => {
            if (currentVideoElement.requestFullscreen) currentVideoElement.requestFullscreen();
            else if (currentVideoElement.webkitRequestFullscreen) currentVideoElement.webkitRequestFullscreen();
        };

        currentVideoElement.onended = () => {
            playPauseBtn.classList.remove('playing');
            playPauseBtn.innerHTML = '&#9658;';
        };
    }

    function openModal(link) {
        modal.classList.remove('modal-hidden');
        modalContainer.innerHTML = '';
        customVideoControls.classList.add('hidden');
        currentVideoElement = null;

        const youtubeId = getYouTubeId(link);
        if (youtubeId) {
            modalContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/${youtubeId}?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
        } else if (link.includes('drive.google.com/embed')) {
            modalContainer.innerHTML = `<iframe src="${link}?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
        } else if (link.match(/\.(mp4|webm|ogg)$/i)) {
            const videoTag = document.createElement('video');
            videoTag.src = link;
            videoTag.autoplay = true;
            modalContainer.appendChild(videoTag);
            currentVideoElement = videoTag;
            customVideoControls.classList.remove('hidden');
            setupCustomVideoPlayer();
        } else {
            window.open(link, '_blank');
            closeModal();
            return;
        }
        
        const focusable = modal.querySelectorAll('button, input');
        if(focusable.length) focusable[0].focus();
    }

    function closeModal() {
        modal.classList.add('modal-hidden');
        modalContainer.innerHTML = '';
        customVideoControls.classList.add('hidden');
        currentVideoElement = null;
    }

    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === "Escape") closeModal(); });

    // 6. Grid Generation
    if (typeof videoList !== 'undefined' && grid) {
        grid.innerHTML = ''; 
        videoList.forEach(video => {
            const wrapper = document.createElement('div');
            wrapper.classList.add('card-wrapper');
            const card = document.createElement('a');
            card.classList.add('video-card');
            card.href = video.link;
            card.tabIndex = 0;
            if (video.image) card.style.backgroundImage = `url('${video.image}')`;
            
            const playIcon = document.createElement('div');
            playIcon.classList.add('play-icon');
            const text = document.createElement('span');
            text.classList.add('card-text');
            text.textContent = video.title;

            card.appendChild(playIcon);
            card.appendChild(text);
            wrapper.appendChild(card);
            grid.appendChild(wrapper);

            card.addEventListener('click', (e) => {
                e.preventDefault();
                openModal(video.link);
            });
        });

        // Hover Delegation
        grid.addEventListener('mouseenter', (e) => {
            if (e.target.closest('.video-card')) {
                audioCtx.play('hover');
                if (follower) {
                    follower.style.background = 'rgba(255, 249, 196, 0.3)';
                    follower.style.width = '240px'; 
                }
            }
        }, true);
        
        grid.addEventListener('mouseleave', (e) => {
            if (e.target.closest('.video-card')) {
                if (follower) follower.style.background = 'rgba(255, 234, 0, 0.25)';
            }
        }, true);
    }

    // 7. Fireflies
    const firefliesContainer = document.getElementById('fireflies-container');
    if (firefliesContainer) {
        for (let i = 0; i < 30; i++) {
            const firefly = document.createElement('div');
            firefly.classList.add('firefly');
            const size = Math.random() * 3 + 2;
            Object.assign(firefly.style, {
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                width: size + 'px', height: size + 'px',
                '--moveX': (Math.random() - 0.5) * 200 + 'px',
                '--moveY': (Math.random() - 0.5) * 200 + 'px',
                animation: `firefly-move ${Math.random() * 10 + 10}s linear infinite`,
                animationDelay: Math.random() * 5 + 's'
            });
            firefliesContainer.appendChild(firefly);
        }
    }

    // 8. Cursor & Tilt
    let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
    document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });

    function animateCursor() {
        if (follower) {
            cursorX += (mouseX - cursorX) * 0.2; 
            cursorY += (mouseY - cursorY) * 0.2;
            follower.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
        }
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    const buttons = document.querySelectorAll('.btn-apple');
    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            if (window.innerWidth < 768) return;
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `perspective(1000px) scale(1.05) rotateX(${-y / 5}deg) rotateY(${x / 10}deg)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'perspective(1000px) scale(1) rotateX(0) rotateY(0)';
            if(follower) follower.style.background = 'rgba(255, 234, 0, 0.25)';
        });
        btn.addEventListener('mouseenter', () => {
            audioCtx.play('hover');
            if(follower) follower.style.background = 'rgba(255, 234, 0, 0.4)';
        });
        btn.addEventListener('mousedown', () => btn.style.transform = 'scale(0.95)');
    });

    document.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('mouseenter', () => {
            follower.style.width = '70px'; follower.style.height = '70px';
            follower.style.borderColor = '#ffea00'; follower.style.backgroundColor = 'rgba(255, 234, 0, 0.03)';
        });
        el.addEventListener('mouseleave', () => {
            follower.style.width = '240px'; follower.style.height = '240px';
            follower.style.borderColor = 'transparent'; follower.style.backgroundColor = 'rgba(255, 234, 0, 0.25)';
        });
    });
});