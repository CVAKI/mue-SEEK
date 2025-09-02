// Futuristic Music Player JavaScript
class FuturisticMusicPlayer {
    constructor() {
        this.currentSongIndex = -1;
        this.songs = [];
        this.isShuffled = false;
        this.isPlaying = false;
        this.volume = 0.8;
        this.isMuted = false;
        this.previousVolume = 0.8;
        
        this.init();
        this.loadPredefinedSongs();
    }

    init() {
        this.initializeAOS();
        this.setupLoadingScreen();
        this.setupCustomCursor();
        this.setupNavbar();
        this.setupBackToTop();
        this.setupAudioPlayer();
        this.setupProgressBar();
        this.setupVolumeControls();
        this.setupKeyboardControls();
        this.setupUploadArea();
        this.startAnimations();
    }

    // Initialize AOS (Animate On Scroll)
    initializeAOS() {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-in-out',
                once: true,
                mirror: false
            });
        }
    }

    // Loading Screen
    setupLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        window.addEventListener('load', () => {
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
            }, 2000);
        });
    }

    // Custom Cursor
    setupCustomCursor() {
        const cursor = document.querySelector('.custom-cursor');
        const cursorFollower = document.querySelector('.cursor-follower');
        
        if (!cursor || !cursorFollower) return;
        
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            
            setTimeout(() => {
                cursorFollower.style.left = e.clientX + 'px';
                cursorFollower.style.top = e.clientY + 'px';
            }, 100);
        });

        const interactiveElements = document.querySelectorAll('a, button, .nav-link, .control-btn, .song-item, .upload-area');
        
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.transform = 'scale(1.5)';
                cursorFollower.style.transform = 'scale(1.2)';
                cursorFollower.style.borderColor = 'rgba(138, 43, 226, 0.8)';
            });
            
            el.addEventListener('mouseleave', () => {
                cursor.style.transform = 'scale(1)';
                cursorFollower.style.transform = 'scale(1)';
                cursorFollower.style.borderColor = 'rgba(138, 43, 226, 0.5)';
            });
        });
    }

    // Navbar effects
    setupNavbar() {
        const navbar = document.getElementById('navbar');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Back to top button
    setupBackToTop() {
        const backToTopBtn = document.getElementById('backToTop');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Audio Player Setup
    setupAudioPlayer() {
        this.audioPlayer = document.getElementById('audioPlayer');
        this.playBtn = document.getElementById('playBtn');
        this.playIcon = document.getElementById('playIcon');
        
        this.audioPlayer.addEventListener('loadedmetadata', () => {
            this.updateTotalTime();
            this.updateProgressBar();
        });

        this.audioPlayer.addEventListener('timeupdate', () => {
            this.updateCurrentTime();
            this.updateProgressBar();
        });

        this.audioPlayer.addEventListener('ended', () => {
            this.nextSong();
        });

        this.audioPlayer.addEventListener('play', () => {
            this.isPlaying = true;
            this.updatePlayButton();
            this.startEqualizer();
        });

        this.audioPlayer.addEventListener('pause', () => {
            this.isPlaying = false;
            this.updatePlayButton();
            this.stopEqualizer();
        });

        this.audioPlayer.volume = this.volume;
    }

    // Progress Bar Controls
    setupProgressBar() {
        this.progressBar = document.getElementById('progressBar');
        this.progressFill = document.getElementById('progressFill');
        this.progressHandle = document.getElementById('progressHandle');

        this.progressBar.addEventListener('click', (e) => {
            if (!this.audioPlayer.duration) return;
            
            const rect = this.progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            const newTime = percent * this.audioPlayer.duration;
            
            this.audioPlayer.currentTime = newTime;
            this.updateProgressBar();
        });

        let isDragging = false;

        this.progressHandle.addEventListener('mousedown', (e) => {
            isDragging = true;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging || !this.audioPlayer.duration) return;
            
            const rect = this.progressBar.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const newTime = percent * this.audioPlayer.duration;
            
            this.audioPlayer.currentTime = newTime;
            this.updateProgressBar();
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    // Volume Controls
    setupVolumeControls() {
        this.volumeSlider = document.getElementById('volumeSlider');
        this.volumeFill = document.getElementById('volumeFill');
        this.volumeHandle = document.getElementById('volumeHandle');
        this.volumeBtn = document.getElementById('volumeBtn');
        this.volumeIcon = document.getElementById('volumeIcon');

        this.volumeSlider.addEventListener('click', (e) => {
            const rect = this.volumeSlider.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            this.setVolume(percent);
        });

        let isVolumeDragging = false;

        this.volumeHandle.addEventListener('mousedown', (e) => {
            isVolumeDragging = true;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isVolumeDragging) return;
            
            const rect = this.volumeSlider.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            this.setVolume(percent);
        });

        document.addEventListener('mouseup', () => {
            isVolumeDragging = false;
        });

        this.updateVolumeDisplay();
    }

    // Keyboard Controls
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') return;
            
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    this.togglePlayPause();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextSong();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousSong();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.setVolume(Math.min(1, this.volume + 0.1));
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.setVolume(Math.max(0, this.volume - 0.1));
                    break;
                case 'KeyM':
                    e.preventDefault();
                    this.toggleMute();
                    break;
                case 'KeyS':
                    e.preventDefault();
                    this.shufflePlaylist();
                    break;
            }
        });
    }

    // Upload Area Setup
    setupUploadArea() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.background = 'rgba(138, 43, 226, 0.2)';
            uploadArea.style.borderColor = '#8a2be2';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.background = 'rgba(255, 255, 255, 0.05)';
            uploadArea.style.borderColor = 'rgba(138, 43, 226, 0.4)';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.background = 'rgba(255, 255, 255, 0.05)';
            uploadArea.style.borderColor = 'rgba(138, 43, 226, 0.4)';
            
            const files = Array.from(e.dataTransfer.files);
            this.handleFiles(files);
        });
    }

    // Start Animations
    startAnimations() {
        this.animateParticles();
        this.animateEqualizer();
        this.setupParallax();
    }

    // Animate particles
    animateParticles() {
        const particles = document.querySelectorAll('.particle');
        particles.forEach((particle, index) => {
            const randomX = Math.random() * 100;
            const randomY = Math.random() * 100;
            const randomDelay = Math.random() * 5;
            const randomDuration = 15 + Math.random() * 10;
            
            particle.style.left = `${randomX}%`;
            particle.style.top = `${randomY}%`;
            particle.style.animationDelay = `${randomDelay}s`;
            particle.style.animationDuration = `${randomDuration}s`;
        });
    }

    // Equalizer animation
    animateEqualizer() {
        this.equalizerBars = document.querySelectorAll('.equalizer .bar');
        this.equalizerInterval = null;
    }

    startEqualizer() {
        if (this.equalizerInterval) return;
        
        this.equalizerInterval = setInterval(() => {
            this.equalizerBars.forEach(bar => {
                const randomHeight = Math.floor(Math.random() * 60) + 20;
                bar.style.height = `${randomHeight}px`;
            });
        }, 150);
    }

    stopEqualizer() {
        if (this.equalizerInterval) {
            clearInterval(this.equalizerInterval);
            this.equalizerInterval = null;
        }
        
        this.equalizerBars.forEach((bar, index) => {
            const baseHeights = [40, 60, 35, 70, 25, 55, 45];
            bar.style.height = `${baseHeights[index] || 40}px`;
        });
    }

    // Parallax effects
    setupParallax() {
        window.addEventListener('scroll', () => {
            const scrollPosition = window.scrollY;
            
            document.querySelectorAll('.orb').forEach((orb, index) => {
                const speed = 0.05 * (index + 1);
                orb.style.transform = `translateY(${scrollPosition * speed}px)`;
            });
            
            document.querySelectorAll('.shape').forEach((shape, index) => {
                const speed = 0.03 * (index + 1);
                shape.style.transform = `translateY(${scrollPosition * speed}px)`;
            });
        });
    }

    // Load predefined songs
    loadPredefinedSongs() {
        const commonMusicFiles = [
            '24Kgoldn - Mood __Cute version[Slowed reverb](MP3_320K).mp3',
            'Ainsi bas la vida(MP3_160K).mp3',
            'Alan Walker - On My Way (Slowed_ Reverb_ Underwater)(MP3_160K).mp3',
            'Alan Walker On my way 8DAudio (Slowed Reverb Underwater)(MP3_160K).mp3',
            'Alan Walker * Ava Max - Alone* Pt. II (slowed reverb)(MP3_160K).mp3',
            'All Comes Crashing (Official Lyric Video)(MP3_160K).mp3',
            'Apna Bana Le - Bhediya * Varun Dhawan* Kriti Sanon_ Sachin-Jigar_ Arijit Singh_ Amitabh Bhattacharya(MP3_160K).mp3',
            'Braden Ross - unalive [OFFICIAL AUDIO](MP3_160K).mp3',
            'Clandestina (Cover)(MP3_160K).mp3',
            'Dub_L U - Coolin_(MP3_160K).mp3',
            'Ek Din Pyar * Slowed N Reverb * MC STAN Γ£¿(MP3_320K).mp3',
            'Home - Machine Gun Kelly_ X Ambassadors * Bebe Rexha (Lyrics) --(MP3*160K).mp3',
            'Indila - Dernière Danse (Clip Officiel)(MP3_160K).mp3',
            'Marshmello ft. Khalid - Silence (Official Lyric Video)(MP3_160K).mp3',
            'Melanie Martinez - Brain * Heart (Lyrics)(MP3*160K).mp3',
            'NEFFEX - Cold [Copyright Free] No.60(MP3_160K).mp3',
            'NF - If You Want Love(MP3_160K).mp3',
            'Skylar Grey - Last One Standing ft. Polo G_ Mozzy_ * Eminem [Official Audio](MP3*160K).mp3',
            'kamin.mp3',
            'tomato song__ tomato song btstomato songtomato song lyrics tomato song jungkook__ tomato song lofi__(MP3_320K).mp3',
            'we don_t talk anymore but it_s that part u heard on tiktok (instrumental looped)(MP3_160K).mp3',
            'wiz khalifa_ charlie puth - see you again (slowed down)(MP3_160K).mp3'
        ];

        this.songs = [];
        
        commonMusicFiles.forEach(async fileName => {
            try {
                const response = await fetch(`../music/${encodeURIComponent(fileName)}`, { method: 'HEAD' });
                if (response.ok) {
                    this.songs.push({
                        name: this.cleanSongName(fileName),
                        path: `../music/${encodeURIComponent(fileName)}`,
                        file: null,
                        originalName: fileName,
                        duration: 0
                    });
                }
            } catch (error) {
                console.log(`File ${fileName} not found`);
            }
        });

        setTimeout(() => {
            this.updatePlaylistDisplay();
            this.updateStats();
        }, 1000);
    }

    // Clean song names
    cleanSongName(fileName) {
        return fileName
            .replace('.mp3', '')
            .replace(/\(MP3_\d+K\)/g, '')
            .replace(/[\[\]]/g, '')
            .replace(/[_-]{2,}/g, ' - ')
            .replace(/[_]/g, ' ')
            .replace(/\*/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // Handle file upload
    handleFiles(files) {
        files.forEach(file => {
            if (file.type === 'audio/mpeg' || file.type === 'audio/mp3') {
                const url = URL.createObjectURL(file);
                this.songs.push({
                    name: this.cleanSongName(file.name),
                    path: url,
                    file: file,
                    originalName: file.name,
                    duration: 0
                });
            }
        });

        this.updatePlaylistDisplay();
        this.updateStats();
        
        // Show success notification
        this.showNotification(`Added ${files.length} track(s) to your collection!`, 'success');
    }

    // Update playlist display
    updatePlaylistDisplay() {
        const songList = document.getElementById('songList');
        
        if (this.songs.length === 0) {
            songList.innerHTML = `
                <div class="no-songs">
                    <div class="no-songs-icon">
                        <i class="fas fa-music"></i>
                    </div>
                    <h3>No tracks loaded</h3>
                    <p>Add some music files to start your journey</p>
                </div>
            `;
            return;
        }

        songList.innerHTML = this.songs.map((song, index) => `
            <div class="song-item ${index === this.currentSongIndex ? 'active' : ''}" 
                 onclick="player.playSong(${index})" 
                 title="${song.originalName || song.name}"
                 data-aos="fade-up" 
                 data-aos-delay="${index * 50}">
                <div class="song-info">
                    <div class="song-name">${song.name}</div>
                    <div class="song-path">${song.file ? 'Uploaded file' : 'Music folder'}</div>
                </div>
                <button class="play-button" onclick="event.stopPropagation(); player.playSong(${index})">
                    ${index === this.currentSongIndex ? (this.isPlaying ? '⏸️ Pause' : '▶️ Play') : '▶️ Play'}
                </button>
            </div>
        `).join('');

        // Reinitialize AOS for new elements
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }

    // Update stats
    updateStats() {
        document.getElementById('totalTracks').textContent = this.songs.length;
        document.getElementById('currentIndex').textContent = this.currentSongIndex >= 0 ? this.currentSongIndex + 1 : '-';
        
        // Calculate total duration (simplified)
        const estimatedDuration = this.songs.length * 210; // Assume 3.5 minutes per song
        const hours = Math.floor(estimatedDuration / 3600);
        const minutes = Math.floor((estimatedDuration % 3600) / 60);
        document.getElementById('totalDuration').textContent = hours > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}:00` : `${minutes}:00`;
    }

    // Play a specific song
    playSong(index) {
        if (index < 0 || index >= this.songs.length) return;

        this.currentSongIndex = index;
        const song = this.songs[index];
        
        this.audioPlayer.src = song.path;
        this.updateSongDisplay(song);
        
        this.audioPlayer.play().catch(error => {
            console.error('Error playing audio:', error);
            this.showNotification('Unable to play this track', 'error');
        });

        this.updatePlaylistDisplay();
        this.updateStats();
        
        // Update artwork animation
        this.updateArtworkAnimation();
    }

    // Toggle play/pause
    togglePlayPause() {
        if (this.currentSongIndex < 0 && this.songs.length > 0) {
            this.playSong(0);
            return;
        }

        if (this.isPlaying) {
            this.audioPlayer.pause();
        } else {
            this.audioPlayer.play().catch(error => {
                console.error('Error playing audio:', error);
                this.showNotification('Unable to play this track', 'error');
            });
        }
    }

    // Previous song
    previousSong() {
        if (this.songs.length === 0) return;
        
        let newIndex = this.currentSongIndex - 1;
        if (newIndex < 0) {
            newIndex = this.songs.length - 1;
        }
        this.playSong(newIndex);
    }

    // Next song
    nextSong() {
        if (this.songs.length === 0) return;
        
        let newIndex = this.currentSongIndex + 1;
        if (newIndex >= this.songs.length) {
            newIndex = 0;
        }
        this.playSong(newIndex);
    }

    // Shuffle playlist
    shufflePlaylist() {
        if (this.songs.length < 2) return;

        const currentSong = this.currentSongIndex >= 0 ? this.songs[this.currentSongIndex] : null;
        
        // Fisher-Yates shuffle
        for (let i = this.songs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.songs[i], this.songs[j]] = [this.songs[j], this.songs[i]];
        }

        // Update current song index if a song was playing
        if (currentSong) {
            this.currentSongIndex = this.songs.findIndex(song => song.path === currentSong.path);
        }

        this.isShuffled = !this.isShuffled;
        this.updatePlaylistDisplay();
        this.showNotification('Playlist shuffled!', 'success');
        
        // Update shuffle button state
        const shuffleBtn = document.getElementById('shuffleBtn');
        if (this.isShuffled) {
            shuffleBtn.classList.add('active');
        } else {
            shuffleBtn.classList.remove('active');
        }
    }

    // Toggle mute
    toggleMute() {
        if (this.isMuted) {
            this.audioPlayer.volume = this.previousVolume;
            this.volume = this.previousVolume;
            this.isMuted = false;
            this.volumeIcon.className = this.volume > 0.5 ? 'fas fa-volume-up' : 'fas fa-volume-down';
        } else {
            this.previousVolume = this.volume;
            this.audioPlayer.volume = 0;
            this.volume = 0;
            this.isMuted = true;
            this.volumeIcon.className = 'fas fa-volume-mute';
        }
        
        this.updateVolumeDisplay();
    }

    // Set volume
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.audioPlayer.volume = this.volume;
        
        if (this.volume > 0 && this.isMuted) {
            this.isMuted = false;
        }
        
        // Update volume icon
        if (this.volume === 0) {
            this.volumeIcon.className = 'fas fa-volume-mute';
        } else if (this.volume > 0.5) {
            this.volumeIcon.className = 'fas fa-volume-up';
        } else {
            this.volumeIcon.className = 'fas fa-volume-down';
        }
        
        this.updateVolumeDisplay();
    }

    // Update volume display
    updateVolumeDisplay() {
        const volumePercent = this.volume * 100;
        this.volumeFill.style.width = `${volumePercent}%`;
        this.volumeHandle.style.left = `${volumePercent}%`;
    }

    // Update song display
    updateSongDisplay(song) {
        document.getElementById('songTitle').textContent = song.name;
        document.getElementById('songArtist').textContent = 'Curated by 𝗖𝗩♞𝗞𝗜';
        
        // Update artwork icon based on song type
        const artworkIcon = document.getElementById('artworkIcon');
        if (song.name.toLowerCase().includes('chill') || song.name.toLowerCase().includes('slow')) {
            artworkIcon.className = 'fas fa-moon artwork-icon';
        } else if (song.name.toLowerCase().includes('dance') || song.name.toLowerCase().includes('energy')) {
            artworkIcon.className = 'fas fa-fire artwork-icon';
        } else {
            artworkIcon.className = 'fas fa-music artwork-icon';
        }
    }

    // Update play button
    updatePlayButton() {
        if (this.isPlaying) {
            this.playIcon.className = 'fas fa-pause';
            this.playBtn.classList.add('active');
        } else {
            this.playIcon.className = 'fas fa-play';
            this.playBtn.classList.remove('active');
        }
    }

    // Update progress bar
    updateProgressBar() {
        if (!this.audioPlayer.duration) return;
        
        const progress = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
        this.progressFill.style.width = `${progress}%`;
        this.progressHandle.style.left = `${progress}%`;
    }

    // Update current time
    updateCurrentTime() {
        const current = this.formatTime(this.audioPlayer.currentTime);
        document.getElementById('currentTime').textContent = current;
    }

    // Update total time
    updateTotalTime() {
        const total = this.formatTime(this.audioPlayer.duration);
        document.getElementById('totalTime').textContent = total;
    }

    // Format time
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Update artwork animation
    updateArtworkAnimation() {
        const artworkContainer = document.querySelector('.artwork-container');
        
        // Add a pulse effect when song changes
        artworkContainer.style.animation = 'none';
        setTimeout(() => {
            artworkContainer.style.animation = 'artworkFloat 6s ease-in-out infinite';
        }, 10);
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'error' ? 'rgba(255, 69, 58, 0.9)' : 'rgba(138, 43, 226, 0.9)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            backdrop-filter: blur(20px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 10001;
            transform: translateX(400px);
            transition: all 0.3s ease;
            max-width: 300px;
            font-weight: 500;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Global functions for HTML onclick handlers
let player;

function togglePlayPause() {
    player.togglePlayPause();
}

function previousSong() {
    player.previousSong();
}

function nextSong() {
    player.nextSong();
}

function shufflePlaylist() {
    player.shufflePlaylist();
}

function toggleMute() {
    player.toggleMute();
}

function handleFileUpload(event) {
    const files = Array.from(event.target.files);
    player.handleFiles(files);
    event.target.value = ''; // Clear the input
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    player = new FuturisticMusicPlayer();
});
