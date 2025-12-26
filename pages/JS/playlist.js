const library = document.querySelector(".library");
const createBtn = document.querySelector(".create-btn");
const searchInput = document.getElementById("searchInput");

/* Load playlists from localStorage */
let playlists = JSON.parse(localStorage.getItem("playlists")) || [
    { name: "My Playlist #1", owner: "VICHEKA HAV" }
];

/* Save to localStorage */
function savePlaylists() {
    localStorage.setItem("playlists", JSON.stringify(playlists));
}

/* Render playlists */
function renderPlaylists(list) {
    document.querySelectorAll(".playlist").forEach(p => p.remove());

    list.forEach((playlist, index) => {
        const div = document.createElement("div");
        div.className = "playlist";

        div.innerHTML = `
            <div class="icon">🎵</div>
            <div class="details" onclick="openPlaylist('${playlist.name}')">
                <div class="title">${playlist.name}</div>
                <div class="subtitle">Playlist • ${playlist.owner}</div>
            </div>
            <div class="actions">
                <button onclick="renamePlaylist(${index})">✏️</button>
                <button onclick="deletePlaylist(${index})">🗑️</button>
            </div>
        `;

        library.appendChild(div);
    });
}

/* Create playlist */
createBtn.addEventListener("click", () => {
    const name = prompt("Enter playlist name:");
    if (!name) return;

    playlists.push({ name, owner: "VICHEKA HAV" });
    savePlaylists();
    renderPlaylists(playlists);
});

/* Search playlists */
searchInput.addEventListener("input", () => {
    const value = searchInput.value.toLowerCase();
    const filtered = playlists.filter(p =>
        p.name.toLowerCase().includes(value)
    );
    renderPlaylists(filtered);
});

/* Open playlist */
function openPlaylist(name) {
    alert("Opening playlist: " + name);
}

/* Rename playlist */
function renamePlaylist(index) {
    const newName = prompt("Rename playlist:", playlists[index].name);
    if (!newName) return;

    playlists[index].name = newName;
    savePlaylists();
    renderPlaylists(playlists);
}

/* Delete playlist */
function deletePlaylist(index) {
    if (!confirm("Delete this playlist?")) return;

    playlists.splice(index, 1);
    savePlaylists();
    renderPlaylists(playlists);
}

/* Initial render */
renderPlaylists(playlists);

