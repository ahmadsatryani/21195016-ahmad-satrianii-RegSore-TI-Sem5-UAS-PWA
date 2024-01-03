document.addEventListener('DOMContentLoaded', () => {
    const commentForm = document.getElementById('commentForm');
    const nameInput = document.getElementById('name');
    const komentarInput = document.getElementById('komentar');
    const komentarList = document.getElementById('komentarList');

    // Inisialisasi database IndexedDB
    const dbName = 'komentarDB';
    const storeName = 'komentarStore';
    const dbVersion = 1;
    let db;

    // Fungsi untuk membuka dan menginisialisasi database IndexedDB
    function openDB() {
        const request = indexedDB.open(dbName, dbVersion);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
        };

        request.onsuccess = () => {
            db = request.result;
            displayComments();
        };

        request.onerror = (event) => {
            console.error('Error opening database: ', event.target.error);
        };
    }

    // Fungsi untuk menambahkan komentar ke database IndexedDB
    function addComment(name, komentar) {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);

        const comment = {
            name: name,
            komentar: komentar,
            timestamp: new Date()
        };

        const request = store.add(comment);

        request.onsuccess = () => {
            nameInput.value = '';
            komentarInput.value = '';
            displayComments();
        };

        request.onerror = (event) => {
            console.error('Error adding comment: ', event.target.error);
        };
    }

    // Fungsi untuk menampilkan komentar dari database
    function displayComments() {
        while (komentarList.firstChild) {
            komentarList.removeChild(komentarList.firstChild);
        }

        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);

        const request = store.openCursor();

        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                const comment = cursor.value;
                const commentElement = document.createElement('div');
                commentElement.className = 'comment';
                commentElement.innerHTML = `
                <p></p>
                    <strong>${comment.name}:</strong>
                    <tr>${comment.komentar}</tr>
                    <small>${comment.timestamp.toLocaleString()}</small>
                `;
                komentarList.appendChild(commentElement);
                cursor.continue();
            }
        };

        request.onerror = (event) => {
            console.error('Error reading comments: ', event.target.error);
        };
    }

    // Handle submit form
    commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = nameInput.value;
        const komentar = komentarInput.value;

        if (name && komentar) {
            addComment(name, komentar);
        } else {
            alert('name dan komentar harus diisi.');
        }
    });

    // Fungsi untuk mengupdate komentar berdasarkan ID
function updateComment(id, updatedComment) {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    const request = store.get(id);

    request.onsuccess = (event) => {
        const data = event.target.result;
        data.komentar = updatedComment;
        const updateRequest = store.put(data);

        updateRequest.onsuccess = () => {
            displayComments();
        };

        updateRequest.onerror = (event) => {
            console.error('Error updating comment: ', event.target.error);
        };
    };
}

// Fungsi untuk menghapus komentar berdasarkan ID
function deleteComment(id) {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    const request = store.delete(id);

    request.onsuccess = () => {
        displayComments();
    };

    request.onerror = (event) => {
        console.error('Error deleting comment: ', event.target.error);
    };
}

    openDB();
});
