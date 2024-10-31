<script>
    import { onMount, onDestroy } from "svelte";
    import { user } from "../stores/user";
    import io from "socket.io-client";
    import throttle from "lodash.throttle";
    import isEqual from "fast-deep-equal";
    import logOut from "../util/logOut"; 
    import { navigate } from "svelte-routing";

    let userId = $user.user._id;
    let noteId;
    let socket;
    let note = { title: "", content: "" };
    let lastSavedVersion = {}

    onMount(async () => {
        const url = new URL(window.location.href);
        noteId = url.pathname.split('/').pop();

        try {
            const response = await fetch(`http://localhost:8080/notes/${noteId}`, {
                method: "GET",
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("Failed to fetch note details");
            }
            
            note = await response.json();
        } catch (error) {
            console.error("Failed to fetch note details:", error);
        }

        socket = io("http://localhost:8080", {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5
        });
        socket.emit("register-user", userId);
        socket.emit("join-note", noteId)

        socket.on("note-update", (updatedNote) => {
            note = updatedNote;
        });
    });

    onDestroy(() => {
        socket?.disconnect();
    });

    const saveToDatabase = throttle(async (noteData) => {
        if (isEqual(noteData, lastSavedVersion)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/notes/${noteId}`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(noteData)
            });
            
            if (!response.ok) {
                throw new Error("Failed to save note");
            }
            
            lastSavedVersion = { ...noteData };
        } catch (error) {
            console.error("Failed to save note:", error);
        }
    }, 1000);

    function handleInputChange(event) {
        note[event.target.id] = event.target.value;
        socket.emit("update-note", noteId, note);

        saveToDatabase(note);
    }

    async function addNewCollaborator() {
        const response = await fetch(`http://localhost:8080/collaborators`, {

        }

        )}
</script>

<main>
    <nav class="navbar">
        <h2>
            NotePal
        </h2>
        <button class="home-button" on:click={() => navigate("/Home")}>Home</button>
        <button class="logout-button" on:click={logOut}>Log Out</button>
    </nav>
    <div class="paper">
        <input
            id="title"
            type="text"
            bind:value={note.title}
            class="title"
            placeholder="Untitled"
            on:input={handleInputChange}
        />
        <textarea
            id="content"
            bind:value={note.content}
            class="content"
            placeholder="Start typing your notes here..."
            on:input={handleInputChange}
        />
    </div>
</main>

<style>
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background-color: lightgrey;
      border-bottom: 2px solid black;
      padding: 10px;
      z-index: 1000;
    }


    :global(body) {
        margin: 0;
        padding: 0;
        background-color: #f0f0f0;
        font-family: 'Arial', sans-serif;
    }

    :global(main) {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        padding: 2rem;
        box-sizing: border-box;
    }

    :global(.paper) {
        width: 90%;
        max-width: 1400px; /* Increased even further */
        height: 90vh;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        position: relative;
    }

    :global(.paper::before) {
        content: '';
        position: absolute;
        top: 0;
        left: 40px;
        height: 100%;
        width: 2px;
        background: rgba(255, 0, 0, 0.1);
    }

    :global(.title),
    :global(.content) {
        border: none;
        outline: none;
        padding: 20px 60px;
        width: 100%;
        box-sizing: border-box;
    }

    :global(.title) {
        font-size: 24px;
        font-weight: bold;
        border-bottom: 1px solid #eee;
    }

    :global(.content) {
        flex-grow: 1;
        font-size: 16px;
        line-height: 1.6;
        resize: none;
    }

    :global(.title::placeholder),
    :global(.content::placeholder) {
        color: #aaa;
    }
</style>