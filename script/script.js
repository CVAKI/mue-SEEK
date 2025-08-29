// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyD7bMlRUVdcvu-AnQsHXF_ZbvCr_8SJMC0",
    authDomain: "mue-seek.firebaseapp.com",
    projectId: "mue-seek",
    storageBucket: "mue-seek.firebasestorage.app",
    messagingSenderId: "719138784829",
    appId: "1:719138784829:web:a673204bb45d9985f2cc54",
    measurementId: "G-9KVZG9MP52"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// Application State
let currentSongs = [];
let currentSongIndex = -1;
let isPlaying = false;
let audioPlayer = document.getElementById('audioPlayer');
let playerBar = document.getElementById('playerBar');

// DOM Elements
const musicFeed = document.getElementById('musicFeed');
const uploadBtn = document.getElementById('uploadBtn');
const uploadModal = document.getElementById('uploadModal');
const closeModal = document.getElementById('closeModal');
const uploadForm = document.getElementById('uploadForm');
const searchInput = document.getElementById('searchInput');

// Player Controls
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressSlider = document.getElementById('progressSlider');
const progressFill = document.getElementById('progressFill');
const currentTimeDisplay = document.getElementById('currentTime');
const totalTimeDisplay = document.getElementById('totalTime');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadMusicFeed();
    setupEventListeners();
});

function setupEventListeners() {
    // Modal Events
    uploadBtn.addEventListener('click', () => {
        uploadModal.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        uploadModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === uploadModal) {
            uploadModal.style.display = 'none';
        }
    });

    // Upload Form
    uploadForm.addEventListener('submit', handleMusicUpload);

    // Search
    searchInput.addEventListener('input', debounce(handleSearch, 300));

    // Player Events
    playPauseBtn.addEventListener('click', togglePlayPause);
    prevBtn.addEventListener('click', playPrevious);
    nextBtn.addEventListener('click', playNext);
    
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('loadedmetadata', updateDuration);
    audioPlayer.addEventListener('ended', playNext);
    
    progressSlider.addEventListener('input', seekAudio);
}

// Music Upload Handler
async function handleMusicUpload(e) {
    e.preventDefault();
    
    const musicFile = document.getElementById('musicFile').files[0];
    const songTitle = document.getElementById('songTitle').value;
    const artistName = document.getElementById('artistName').value;
    const albumName = document.getElementById('albumName').value;
    const coverImage = document.getElementById('coverImage').files[0];

    if (!musicFile || !songTitle || !artistName) {
        alert('Please fill in all required fields');
        return;
    }

    try {
        // Show loading
        const submitBtn = document.querySelector('.submit-btn');
        submitBtn.textContent = 'Uploading...';
        submitBtn.disabled = true;

        // Upload music file
        const musicRef = storage.ref().child(`music/${Date.now()}_${musicFile.name}`);
        const musicSnapshot = await musicRef.put(musicFile);
        const musicUrl = await musicSnapshot.ref.getDownloadURL();

        // Upload cover image if provided
        let coverUrl = '/api/placeholder/300/300';
        if (coverImage) {
            const coverRef = storage.ref().child(`covers/${Date.now()}_${coverImage.name}`);
            const coverSnapshot = await coverRef.put(coverImage);
            coverUrl = await coverSnapshot.ref.getDownloadURL();
        }

        // Save to Firestore
        const docRef = await db.collection('songs').add({
            title: songTitle,
            artist: artistName,
            album: albumName || 'Unknown Album',
            musicUrl: musicUrl,
            coverUrl: coverUrl,
            likes: 0,
            comments: [],
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            duration: 0 // Will be updated when audio loads
        });

        console.log('Song uploaded with ID: ', docRef.id);
        
        // Reset form and close modal
        uploadForm.reset();
        uploadModal.style.display = 'none';
        
        // Reload feed
        loadMusicFeed();

    } catch (error) {
        console.error('Error uploading song:', error);
        alert('Error uploading song. Please try again.');
    } finally {
        // Reset button
        const submitBtn = document.querySelector('.submit-btn');
        submitBtn.textContent = 'Upload Music';
        submitBtn.disabled = false;
    }
}

// Load Music Feed
async function loadMusicFeed() {
    try {
        musicFeed.innerHTML = '<div class="loading"></div>';
        
        const snapshot = await db.collection('songs')
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();

        currentSongs = [];
        musicFeed.innerHTML = '';

        snapshot.forEach((doc, index) => {
            const song = { id: doc.id, ...doc.data() };
            currentSongs.push(song);
            createMusicCard(song, index);
        });

        if (currentSongs.length === 0) {
            musicFeed.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #aaaaaa;">
                    <i class="fas fa-music" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>No music uploaded yet. Be the first to share your favorite songs!</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading music feed:', error);
        musicFeed.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #ff6b6b;">
                <p>Error loading music feed. Please refresh the page.</p>
            </div>
        `;
    }
}

// Create Music Card
function createMusicCard(song, index) {
    const card = document.createElement('div');
    card.className = 'music-card';
    card.innerHTML = `
        <div class="music-header">
            <img src="${song.coverUrl}" alt="Cover" class="music-cover" onerror="this.src='/api/placeholder/80/80'">
            <div class="music-info">
                <div class="music-title">${escapeHtml(song.title)}</div>
                <div class="music-artist">${escapeHtml(song.artist)}</div>
                <div class="music-album">${escapeHtml(song.album)}</div>
            </div>
        </div>
        
        <div class="music-controls">
            <button class="play-button" onclick="playSong(${index})">
                <i class="fas fa-play"></i>
            </button>
            <span class="music-duration" id="duration-${song.id}">--:--</span>
        </div>
        
        <div class="music-actions">
            <div class="action-buttons">
                <button class="action-btn like-btn" onclick="toggleLike('${song.id}')" data-liked="false">
                    <i class="far fa-heart"></i>
                    <span class="like-count">${song.likes || 0}</span>
                </button>
                <button class="action-btn comment-btn" onclick="toggleComments('${song.id}')">
                    <i class="far fa-comment"></i>
                    <span class="comment-count">${song.comments ? song.comments.length : 0}</span>
                </button>
            </div>
        </div>
        
        <div class="comments-section hidden" id="comments-${song.id}">
            <div class="comment-input">
                <input type="text" placeholder="Add a comment..." id="comment-input-${song.id}" maxlength="500">
                <button class="comment-btn" onclick="addComment('${song.id}')">Post</button>
            </div>
            <div class="comments-list" id="comments-list-${song.id}">
                ${renderComments(song.comments || [])}
            </div>
        </div>
    `;
    
    musicFeed.appendChild(card);
    
    // Load audio duration
    loadAudioDuration(song.musicUrl, song.id);
}

// Render Comments
function renderComments(comments) {
    if (!comments || comments.length === 0) {
        return '<p style="color: #aaaaaa; text-align: center; padding: 1rem;">No comments yet</p>';
    }
    
    return comments.map(comment => `
        <div class="comment">
            <div class="comment-user">Anonymous User</div>
            <div class="comment-text">${escapeHtml(comment.text)}</div>
            <div class="comment-time">${formatTime(comment.timestamp)}</div>
        </div>
    `).join('');
}

// Load Audio Duration
function loadAudioDuration(url, songId) {
    const audio = new Audio();
    audio.addEventListener('loadedmetadata', () => {
        const duration = formatDuration(audio.duration);
        const durationElement = document.getElementById(`duration-${songId}`);
        if (durationElement) {
            durationElement.textContent = duration;
        }
    });
    audio.src = url;
}

// Play Song
function playSong(index) {
    if (currentSongIndex === index && !audioPlayer.paused) {
        // Pause current song
        audioPlayer.pause();
        updatePlayButton(false);
        return;
    }
    
    currentSongIndex = index;
    const song = currentSongs[index];
    
    audioPlayer.src = song.musicUrl;
    audioPlayer.load();
    
    audioPlayer.play().then(() => {
        updatePlayerBar(song);
        updatePlayButton(true);
        playerBar.style.display = 'flex';
    }).catch(error => {
        console.error('Error playing song:', error);
        alert('Error playing song. Please try again.');
    });
}

// Update Player Bar
function updatePlayerBar(song) {
    document.getElementById('playerCover').src = song.coverUrl;
    document.getElementById('playerTitle').textContent = song.title;
    document.getElementById('playerArtist').textContent = song.artist;
}

// Update Play Button
function updatePlayButton(playing) {
    const icon = playPauseBtn.querySelector('i');
    if (playing) {
        icon.className = 'fas fa-pause';
    } else {
        icon.className = 'fas fa-play';
    }
}

// Toggle Play/Pause
function togglePlayPause() {
    if (currentSongIndex === -1) return;
    
    if (audioPlayer.paused) {
        audioPlayer.play();
        updatePlayButton(true);
    } else {
        audioPlayer.pause();
        updatePlayButton(false);
    }
}

// Play Previous
function playPrevious() {
    if (currentSongIndex > 0) {
        playSong(currentSongIndex - 1);
    }
}

// Play Next
function playNext() {
    if (currentSongIndex < currentSongs.length - 1) {
        playSong(currentSongIndex + 1);
    }
}

// Update Progress
function updateProgress() {
    if (audioPlayer.duration) {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressFill.style.width = `${progress}%`;
        progressSlider.value = progress;
        currentTimeDisplay.textContent = formatDuration(audioPlayer.currentTime);
    }
}

// Update Duration Display
function updateDuration() {
    totalTimeDisplay.textContent = formatDuration(audioPlayer.duration);
}

// Seek Audio
function seekAudio() {
    const seekTime = (progressSlider.value / 100) * audioPlayer.duration;
    audioPlayer.currentTime = seekTime;
}

// Toggle Like
async function toggleLike(songId) {
    try {
        const likeBtn = document.querySelector(`[onclick="toggleLike('${songId}')"]`);
        const likeCountElement = likeBtn.querySelector('.like-count');
        const heartIcon = likeBtn.querySelector('i');
        
        const isLiked = likeBtn.dataset.liked === 'true';
        const increment = isLiked ? -1 : 1;
        
        // Update UI immediately
        likeBtn.dataset.liked = !isLiked;
        heartIcon.className = !isLiked ? 'fas fa-heart' : 'far fa-heart';
        likeBtn.classList.toggle('active', !isLiked);
        
        const currentCount = parseInt(likeCountElement.textContent) || 0;
        likeCountElement.textContent = currentCount + increment;
        
        // Update in database
        await db.collection('songs').doc(songId).update({
            likes: firebase.firestore.FieldValue.increment(increment)
        });
        
    } catch (error) {
        console.error('Error toggling like:', error);
        // Revert UI changes on error
        location.reload();
    }
}

// Toggle Comments Section
function toggleComments(songId) {
    const commentsSection = document.getElementById(`comments-${songId}`);
    commentsSection.classList.toggle('hidden');
}

// Add Comment
async function addComment(songId) {
    const commentInput = document.getElementById(`comment-input-${songId}`);
    const commentText = commentInput.value.trim();
    
    if (!commentText) return;
    
    try {
        const comment = {
            text: commentText,
            timestamp: new Date(),
            userId: 'anonymous' // In a real app, you'd have user authentication
        };
        
        // Update UI immediately
        const commentsList = document.getElementById(`comments-list-${songId}`);
        const commentElement = document.createElement('div');
        commentElement.innerHTML = `
            <div class="comment">
                <div class="comment-user">Anonymous User</div>
                <div class="comment-text">${escapeHtml(comment.text)}</div>
                <div class="comment-time">Just now</div>
            </div>
        `;
        
        if (commentsList.innerHTML.includes('No comments yet')) {
            commentsList.innerHTML = '';
        }
        commentsList.insertBefore(commentElement, commentsList.firstChild);
        
        // Update comment count
        const commentBtn = document.querySelector(`[onclick="toggleComments('${songId}')"]`);
        const countElement = commentBtn.querySelector('.comment-count');
        const currentCount = parseInt(countElement.textContent) || 0;
        countElement.textContent = currentCount + 1;
        
        // Clear input
        commentInput.value = '';
        
        // Update in database
        await db.collection('songs').doc(songId).update({
            comments: firebase.firestore.FieldValue.arrayUnion(comment)
        });
        
    } catch (error) {
        console.error('Error adding comment:', error);
        alert('Error adding comment. Please try again.');
    }
}

// Search Handler
async function handleSearch() {
    const query = searchInput.value.toLowerCase().trim();
    
    if (!query) {
        loadMusicFeed();
        return;
    }
    
    try {
        musicFeed.innerHTML = '<div class="loading"></div>';
        
        const snapshot = await db.collection('songs').get();
        const filteredSongs = [];
        
        snapshot.forEach((doc) => {
            const song = { id: doc.id, ...doc.data() };
            const title = song.title.toLowerCase();
            const artist = song.artist.toLowerCase();
            const album = song.album.toLowerCase();
            
            if (title.includes(query) || artist.includes(query) || album.includes(query)) {
                filteredSongs.push(song);
            }
        });
        
        currentSongs = filteredSongs;
        musicFeed.innerHTML = '';
        
        if (filteredSongs.length === 0) {
            musicFeed.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #aaaaaa;">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>No songs found matching "${query}"</p>
                </div>
            `;
        } else {
            filteredSongs.forEach((song, index) => {
                createMusicCard(song, index);
            });
        }
        
    } catch (error) {
        console.error('Error searching songs:', error);
    }
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDuration(seconds) {
    if (isNaN(seconds) || seconds === 0) return '--:--';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatTime(date) {
    if (!date) return '';
    
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle Enter key in comment inputs
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.id && e.target.id.startsWith('comment-input-')) {
        const songId = e.target.id.replace('comment-input-', '');
        addComment(songId);
    }
});