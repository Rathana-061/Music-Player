// script.js - Full Featured Music Player (Playlists + Recently Played + Add Song Button)
// December 2025 - Complete Version

class MusicPlayer {
    constructor() {
        // Main song library
        this.songs = [
            { id: 1, title: "thank u, next", artist: "Ariana Grande", cover: "https://i.ytimg.com/vi/QUme0h-uPP4/mqdefault.jpg", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
            { id: 2, title: "7 rings", artist: "Ariana Grande", cover: "https://i.ytimg.com/vi/0thySV8uyL8/hq720.jpg", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
            { id: 3, title: "positions", artist: "Ariana Grande", cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3MWTg71I66Ump5CVvQOg0cNLdFZOL6DfGUw&s", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
            { id: 4, title: "no tears left to cry", artist: "Ariana Grande", cover: "https://i.ytimg.com/vi/fFuQfcAbCIA/maxresdefault.jpg", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
            { id: 5, title: "into you", artist: "Ariana Grande", cover: "https://i.ytimg.com/vi/WHHkVUaOxe4/maxresdefault.jpg", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" }
        ];

        this.currentIndex = 0;
        this.isPlaying = false;
        this.audio = new Audio();
        this.audio.volume = 0.7;

        // Playlists & Recently Played
        this.playlists = this.loadPlaylists(); // [{name: "Favorites", songs: [...]}, ...]
        this.currentPlaylistName = null; // name of currently playing playlist (null = main library)
        this.recentlyPlayed = [];
        this.maxRecentDisplay = 5;

        // DOM Elements
        this.elements = {
            masterPlay: document.querySelector('.master_play'),
            coverImg: document.querySelector('.master_play img'),
            title: document.querySelector('#masterTitle'),
            artist: document.querySelector('#masterArtist'),
            addToPlaylistBtn: document.querySelector('#addToPlaylistBtn'),
            prevBtn: document.querySelector('.fa-backward-step'),
            nextBtn: document.querySelector('.fa-forward-step'),
            playPauseIcon: null, // will be set later
            progressBar: document.querySelector('#seek'),
            progressFill: document.querySelector('#bar2'),
            progressDot: document.querySelector('.bar .dot'),
            currentTime: document.querySelector('#currentStart'),
            durationTime: document.querySelector('#currentEnd'),
            volumeBar: document.querySelector('#vol'),
            volumeFill: document.querySelector('.vol_bar'),
            volumeDot: document.querySelector('#vol_dot'),
            volumeIcon: document.querySelector('.vol .fa-solid'),
            songItems: document.querySelectorAll('.pop_song .songItem'),
            scrollContainer: document.querySelector('.pop_song'),
            scrollLeft: document.querySelector('#left_scroll'),
            scrollRight: document.querySelector('#right_scroll'),
            wave: document.querySelector('.wave'),

            // Sidebar
            userPlaylists: document.querySelector('.user_playlists'),
            createPlaylistBtn: document.querySelector('#createPlaylistBtn'),
            recentList: document.querySelector('.recent_list'),
            viewAllRecentBtn: document.querySelector('#viewAllRecent')
        };

        this.init();
    }

    init() {
        this.elements.playPauseIcon = this.elements.masterPlay.querySelector('.icon i:nth-child(2)'); // middle play/pause icon
        this.updateSongDisplay();
        this.updateSongListVisuals();
        this.renderPlaylists();
        this.renderRecentSidebar();
        this.createModals();
        this.bindEvents();
    }

    // LocalStorage for Playlists
    loadPlaylists() {
        const saved = localStorage.getItem('musicPlayerPlaylists');
        return saved ? JSON.parse(saved) : [];
    }

    savePlaylists() {
        localStorage.setItem('musicPlayerPlaylists', JSON.stringify(this.playlists));
    }

    // Modals
    createModals() {
        // Recent Played Full List Modal
        const recentModal = document.createElement('div');
        recentModal.className = 'recent_modal';
        recentModal.innerHTML = `
            <div class="recent_modal_content">
                <span class="close_modal">&times;</span>
                <h3>All Recently Played</h3>
                <div class="recent_full_list"></div>
            </div>
        `;
        document.body.appendChild(recentModal);
        this.elements.recentModal = recentModal;
        this.elements.recentFullList = recentModal.querySelector('.recent_full_list');

        // Add to Playlist Modal
        const addModal = document.createElement('div');
        addModal.className = 'add_to_playlist_modal';
        addModal.innerHTML = `
            <div class="add_to_playlist_content">
                <span class="close_add_modal">&times;</span>
                <h3>Add to Playlist</h3>
                <div class="add_playlist_options"></div>
            </div>
        `;
        document.body.appendChild(addModal);
        this.elements.addToPlaylistModal = addModal;
        this.elements.addPlaylistOptions = addModal.querySelector('.add_playlist_options');

        // Close handlers
        recentModal.querySelector('.close_modal').onclick = () => recentModal.style.display = 'none';
        recentModal.onclick = e => e.target === recentModal && (recentModal.style.display = 'none');

        addModal.querySelector('.close_add_modal').onclick = () => addModal.style.display = 'none';
        addModal.onclick = e => e.target === addModal && (addModal.style.display = 'none');

        this.elements.viewAllRecentBtn.onclick = () => {
            this.renderFullRecentList();
            recentModal.style.display = 'flex';
        };
    }

    // Playlist Functions
    renderPlaylists() {
        this.elements.userPlaylists.innerHTML = '';
        if (this.playlists.length === 0) {
            this.elements.userPlaylists.innerHTML = '<p style="color:lightslategray;font-size:13px;margin-left:10px;">No playlists yet</p>';
            return;
        }

        this.playlists.forEach((playlist, index) => {
            const item = document.createElement('div');
            item.className = `playlist_item ${this.currentPlaylistName === playlist.name ? 'active_playlist' : ''}`;
            item.innerHTML = `
                <span class="name" title="${playlist.name}">${playlist.name} (${playlist.songs.length})</span>
                <div class="actions">
                    <i class="fa-solid fa-pen-to-square edit_playlist" data-index="${index}"></i>
                    <i class="fa-solid fa-trash delete_playlist" data-index="${index}"></i>
                </div>
            `;
            item.querySelector('.name').onclick = () => this.playPlaylist(playlist);
            item.querySelector('.edit_playlist').onclick = e => {
                e.stopPropagation();
                this.editPlaylist(index);
            };
            item.querySelector('.delete_playlist').onclick = e => {
                e.stopPropagation();
                this.deletePlaylist(index);
            };
            this.elements.userPlaylists.appendChild(item);
        });
    }

    createPlaylist() {
        const name = prompt("Enter playlist name:");
        if (!name || name.trim() === "") return;
        const trimmed = name.trim();
        if (this.playlists.some(p => p.name === trimmed)) {
            alert("Playlist name already exists!");
            return;
        }
        this.playlists.push({ name: trimmed, songs: [] });
        this.savePlaylists();
        this.renderPlaylists();
    }

    editPlaylist(index) {
        const newName = prompt("New name:", this.playlists[index].name);
        if (!newName || newName.trim() === "") return;
        const trimmed = newName.trim();
        if (this.playlists.some((p, i) => p.name === trimmed && i !== index)) {
            alert("Name already exists!");
            return;
        }
        this.playlists[index].name = trimmed;
        if (this.currentPlaylistName === this.playlists[index].name) this.currentPlaylistName = trimmed;
        this.savePlaylists();
        this.renderPlaylists();
    }

    deletePlaylist(index) {
        if (confirm(`Delete "${this.playlists[index].name}"?`)) {
            if (this.currentPlaylistName === this.playlists[index].name) {
                this.currentPlaylistName = null;
                this.restoreMainLibrary();
            }
            this.playlists.splice(index, 1);
            this.savePlaylists();
            this.renderPlaylists();
        }
    }

    playPlaylist(playlist) {
        if (playlist.songs.length === 0) return alert("Playlist is empty!");
        this.currentPlaylistName = playlist.name;
        this.songs = playlist.songs; // temporarily replace main list
        this.currentIndex = 0;
        this.updateSongDisplay();
        this.updateSongListVisuals();
        this.renderPlaylists();
        this.playCurrent();
    }

    restoreMainLibrary() {
        this.songs = [
            { id: 1, title: "thank u, next", artist: "Ariana Grande", cover: "https://i.ytimg.com/vi/QUme0h-uPP4/mqdefault.jpg", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
            { id: 2, title: "7 rings", artist: "Ariana Grande", cover: "https://i.ytimg.com/vi/0thySV8uyL8/hq720.jpg", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
            { id: 3, title: "positions", artist: "Ariana Grande", cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3MWTg71I66Ump5CVvQOg0cNLdFZOL6DfGUw&s", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
            { id: 4, title: "no tears left to cry", artist: "Ariana Grande", cover: "https://i.ytimg.com/vi/fFuQfcAbCIA/maxresdefault.jpg", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
            { id: 5, title: "into you", artist: "Ariana Grande", cover: "https://i.ytimg.com/vi/WHHkVUaOxe4/maxresdefault.jpg", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" }
        ];
        this.updateSongListVisuals();
    }

    showAddToPlaylistModal() {
        const currentSong = this.songs[this.currentIndex];
        this.elements.addPlaylistOptions.innerHTML = '';

        if (this.playlists.length === 0) {
            this.elements.addPlaylistOptions.innerHTML = '<p style="color:lightslategray;text-align:center;">No playlists yet.<br>Create one first!</p>';
        } else {
            this.playlists.forEach(playlist => {
                const opt = document.createElement('div');
                opt.className = 'playlist_option';
                opt.textContent = playlist.name;
                const alreadyIn = playlist.songs.some(s => s.id === currentSong.id);
                if (alreadyIn) opt.style.opacity = '0.5';
                opt.onclick = () => {
                    if (alreadyIn) {
                        alert("Song already in this playlist");
                        return;
                    }
                    playlist.songs.push({ ...currentSong });
                    this.savePlaylists();
                    alert(`Added to "${playlist.name}"`);
                    this.elements.addToPlaylistModal.style.display = 'none';
                    this.renderPlaylists();
                };
                this.elements.addPlaylistOptions.appendChild(opt);
            });
        }
        this.elements.addToPlaylistModal.style.display = 'flex';
    }

    // Recently Played
    addToRecentlyPlayed(index) {
        const song = this.songs[index];
        this.recentlyPlayed = this.recentlyPlayed.filter(s => s.id !== song.id);
        this.recentlyPlayed.unshift(song);
        this.renderRecentSidebar();
    }

    renderRecentSidebar() {
        this.elements.recentList.innerHTML = '';
        const display = this.recentlyPlayed.slice(0, this.maxRecentDisplay);
        display.forEach(song => {
            const item = document.createElement('div');
            item.className = 'recent_item';
            item.innerHTML = `
                <img src="${song.cover}" alt="${song.title}">
                <div class="info">
                    <h5>${song.title}</h5>
                    <div class="subtitle">${song.artist}</div>
                </div>
            `;
            const idx = this.songs.findIndex(s => s.id === song.id);
            item.onclick = () => this.playSpecific(idx >= 0 ? idx : 0);
            this.elements.recentList.appendChild(item);
        });
        const hasRecent = this.recentlyPlayed.length > 0;
        this.elements.recentList.style.display = hasRecent ? 'block' : 'none';
        this.elements.viewAllRecentBtn.style.display = hasRecent ? 'block' : 'none';
    }

    renderFullRecentList() {
        this.elements.recentFullList.innerHTML = '';
        if (this.recentlyPlayed.length === 0) {
            this.elements.recentFullList.innerHTML = '<p style="color:lightslategray;text-align:center;">No songs played yet</p>';
            return;
        }
        this.recentlyPlayed.forEach(song => {
            const item = document.createElement('div');
            item.className = 'recent_item';
            item.style.marginBottom = '15px';
            item.innerHTML = `
                <img src="${song.cover}" alt="${song.title}">
                <div class="info">
                    <h5>${song.title}</h5>
                    <div class="subtitle">${song.artist}</div>
                </div>
            `;
            const idx = this.songs.findIndex(s => s.id === song.id);
            item.onclick = () => {
                this.playSpecific(idx >= 0 ? idx : 0);
                this.elements.recentModal.style.display = 'none';
            };
            this.elements.recentFullList.appendChild(item);
        });
    }

    // Playback Controls
    updateSongDisplay() {
        const song = this.songs[this.currentIndex];
        this.elements.coverImg.src = song.cover;
        this.elements.title.textContent = song.title;
        this.elements.artist.textContent = song.artist;
        this.audio.src = song.src;
    }

    updateSongListVisuals() {
        this.elements.songItems.forEach((item, i) => {
            if (i < this.songs.length) {
                const song = this.songs[i];
                item.querySelector('img').src = song.cover;
                item.querySelector('h5').textContent = song.title;
                item.querySelector('.subtitle').textContent = song.artist;
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    playCurrent() {
        this.audio.play().catch(e => console.error("Playback error:", e));
        this.isPlaying = true;
        this.elements.playPauseIcon.classList.replace('fa-play', 'fa-pause');
        this.elements.wave.classList.add('active2');
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.audio.pause();
            this.elements.playPauseIcon.classList.replace('fa-pause', 'fa-play');
            this.elements.wave.classList.remove('active2');
        } else {
            this.playCurrent();
        }
        this.isPlaying = !this.isPlaying;
    }

    playSpecific(index) {
        this.currentIndex = index;
        this.updateSongDisplay();
        this.updateSongListVisuals();
        this.addToRecentlyPlayed(index);
        this.playCurrent();
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.songs.length;
        this.updateSongDisplay();
        this.updateSongListVisuals();
        this.addToRecentlyPlayed(this.currentIndex);
        if (this.isPlaying) this.audio.play();
    }

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.songs.length) % this.songs.length;
        this.updateSongDisplay();
        this.updateSongListVisuals();
        this.addToRecentlyPlayed(this.currentIndex);
        if (this.isPlaying) this.audio.play();
    }

    updateProgress() {
        if (!this.audio.duration) return;
        const percent = (this.audio.currentTime / this.audio.duration) * 100;
        this.elements.progressBar.value = percent;
        this.elements.progressFill.style.width = `${percent}%`;
        this.elements.progressDot.style.left = `${percent}%`;
        this.elements.currentTime.textContent = this.formatTime(this.audio.currentTime);
        this.elements.durationTime.textContent = this.formatTime(this.audio.duration);
    }

    updateVolumeUI(volume) {
        const percent = volume * 100;
        this.elements.volumeFill.style.width = `${percent}%`;
        this.elements.volumeDot.style.left = `${percent}%`;
        this.elements.volumeIcon.className = volume === 0 ? 'fa-solid fa-volume-mute' : 'fa-solid fa-volume-high';
    }

    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    // Event Listeners
    bindEvents() {
        // Play/Pause
        this.elements.masterPlay.querySelector('.icon').addEventListener('click', e => {
            if (e.target.classList.contains('fa-play') || e.target.classList.contains('fa-pause')) {
                this.togglePlayPause();
            }
        });

        this.elements.prevBtn.parentElement.addEventListener('click', e => {
            if (e.target === this.elements.prevBtn) this.prev();
        });
        this.elements.nextBtn.parentElement.addEventListener('click', e => {
            if (e.target === this.elements.nextBtn) this.next();
        });

        // Seek & Volume
        this.elements.progressBar.addEventListener('input', e => {
            this.audio.currentTime = (e.target.value / 100) * this.audio.duration;
        });
        this.elements.volumeBar.addEventListener('input', e => {
            const vol = e.target.value / 100;
            this.audio.volume = vol;
            this.updateVolumeUI(vol);
        });
        this.elements.volumeIcon.addEventListener('click', () => {
            if (this.audio.volume > 0) {
                this.audio.volume = 0;
                this.elements.volumeBar.value = 0;
            } else {
                this.audio.volume = 0.7;
                this.elements.volumeBar.value = 70;
            }
            this.updateVolumeUI(this.audio.volume);
        });

        // Song clicks
        this.elements.songItems.forEach((item, i) => {
            item.addEventListener('click', () => this.playSpecific(i));
        });

        // Scroll
        this.elements.scrollLeft.addEventListener('click', () => this.elements.scrollContainer.scrollBy({ left: -300, behavior: 'smooth' }));
        this.elements.scrollRight.addEventListener('click', () => this.elements.scrollContainer.scrollBy({ left: 300, behavior: 'smooth' }));

        // Playlist buttons
        this.elements.createPlaylistBtn.addEventListener('click', () => this.createPlaylist());
        this.elements.addToPlaylistBtn.addEventListener('click', () => this.showAddToPlaylistModal());

        // Audio events
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.next());
    }
}

// Start the player
document.addEventListener('DOMContentLoaded', () => {
    window.player = new MusicPlayer();
});