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
    let collaboratorEmail = "";
    let collaboratorList = [];
    let note = { title: "", content: "" };
    let showCollaboratorsMenu = false;
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
            collaboratorList = note.collaborators || [];
        } catch (error) {
            throw new Error("Failed to fetch note details:", error);
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
                body: JSON.stringify(noteData)
            });
            
            if (!response.ok) {
                throw new Error("Failed to save note");
            }
            
            lastSavedVersion = { ...noteData };
        } catch (error) {
            throw new Error("Failed to save note:", error.message);
        }
    }, 1000);

    function handleInputChange(event) {
        note[event.target.id] = event.target.value;
        socket.emit("update-note", noteId, note);

        saveToDatabase(note);
    }

    async function addNewCollaborator() {
        if (!collaboratorEmail) {
            return;
        }
        try {
            const response = await fetch(`http://localhost:8080/collaborators`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ noteId: noteId, email: collaboratorEmail })
            });
            
            if (!response.ok) {
                throw new Error("Failed to add collaborator");
            }

            collaboratorList = [...collaboratorList, { email: collaboratorEmail }];
            collaboratorEmail = "";

        } catch (error) {
            throw new Error("Failed to add collaborator: " + error.message);
        }
    }

    async function removeCollaborator(email) {
        try {
            const response = await fetch(`http://localhost:8080/collaborators/remove`, {
                method: "DELETE",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ noteId: noteId, email: email })
            });

            if (!response.ok) {
                throw new Error("Failed to remove collaborator");
            }

            collaboratorList = collaboratorList.filter(collaborator => collaborator.email !== email);
        } catch (error) {
            throw new Error("Failed to remove collaborator: " + error.message);
        }
    }
</script>

<main>
    <nav class="navbar">
        <h2>
            NotePal
        </h2>
        <div class="left-buttons">
            <button class="nav-button" on:click={() => navigate("/Home")}>Home</button>
            <div class="dropdown">
                <button class="nav-button" 
                on:click={() => showCollaboratorsMenu = !showCollaboratorsMenu}
                aria-haspopup="true"
                aria-expanded={showCollaboratorsMenu}
                >Manage Collaborators</button>
                {#if showCollaboratorsMenu}
                    <div class="dropdown-menu">
                        <h3>Collaborators</h3>
                            <ul class="collaborator-list">
                                {#each collaboratorList as collaborator}
                                    <li class="collaborator-item">
                                        <span>
                                            {collaborator.email}
                                        </span>
                                        <button class="remove-button" on:click={() => removeCollaborator(collaborator.email)}>✖</button>
                                    </li>
                                {/each}
                            </ul>
                            <input
                                type="email"
                                bind:value={collaboratorEmail}
                                placeholder="Add collaborator email"
                            />
                            <button class="collaborator-button" on:click={addNewCollaborator}>Add Collaborator</button>
                    </div>
                {/if}
            </div>
        </div>

        <div class="right-buttons">
            <button class="logout-button" on:click={logOut}>Log Out</button>
        </div>
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
    :global(body) {
        margin: 0;
        padding: 0;
        background-color: #f0f0f0;
        font-family: 'Arial', sans-serif;
    }

    :global(main) {
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        padding: 2rem;
        box-sizing: border-box;
        display: flex;
    }


    .navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background-color: lightgrey;
        border-bottom: 2px solid black;
        padding: 10px;
        z-index: 1000;
    }

/* Container for left-aligned buttons */
    .left-buttons {
        display: flex;
        align-items: center;
    }

/* Space out the nav buttons */
    .nav-button {
        padding: 8px;
        margin-right: 10px;
    }

    
    /* Dropdown container styling */
    .dropdown {
        position: relative;
        display: inline-block;
    }
    
    /* Dropdown menu styling */
    .dropdown-menu {
        display: block;
        position: absolute;
        top: 100%; /* Positions below the button */
        left: 0;
        margin-top: 5px;
        padding: 15px;
        background-color: #ffffff;
        border: 1px solid #ddd;
        border-radius: 5px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        width: 200px;
        z-index: 10;
    }

    .dropdown-menu h3 {
        margin-top: 0;
    }

    .collaborator-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .collaborator-item {
        display: flex;
        justify-content: space-between; /* Ensures spacing between email and button */
        align-items: center; /* Vertically centers the elements */
        margin-bottom: 10px; /* Adds some space between the items */
    }

    input[type="email"] {
    width: 100%;
    padding: 10px;
    margin-bottom: 15px; /* Adds space between the input and button */
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    box-sizing: border-box;
    background-color: #f9f9f9;
    transition: border-color 0.3s ease;
    }

    input[type="email"]:focus {
    border-color: #0056b3; /* Changes border color when focused */
    outline: none;
    }

/* Style for the Add Collaborator button */
    .collaborator-button {
        width: 100%; /* Makes the button span the full width */
        padding: 10px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

/* Button hover effect */
    .collaborator-button:hover {
        background-color: #45a049; /* Darker shade when hovered */
    }


    .paper {
        width: 100%;
        max-width: 700px; /* Increased even further */
        height: 90vh;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        position: fixed;
    }

    .paper::before {
        content: '';
        position: absolute;
        top: 0;
        left: 40px;
        height: 100%;
        width: 2px;
        background: rgba(255, 0, 0, 0.1);
    }

    .title,
    .content {
        border: none;
        outline: none;
        padding: 20px 60px;
        width: 100%;
        box-sizing: border-box;
    }

    .title {
        font-size: 24px;
        font-weight: bold;
        border-bottom: 1px solid #eee;
    }

    .content {
        flex-grow: 1;
        font-size: 16px;
        line-height: 1.6;
        resize: none;
    }

    .title::placeholder,
    .content::placeholder {
        color: #aaa;
    }

    .logout-button {
        background-color: red;
        color: white;
    }

    .logout-button:hover {
      background-color: darkred;
    }

    .remove-button {
        margin-left: 8px;
        padding: 2px 5px; /* Reduced padding for even spacing */
        background-color: red;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        flex-shrink: 0;
        display: flex; /* Ensures icon is centered within the button */
        align-items: center; /* Centers the icon vertically */
        justify-content: center; /* Centers the icon horizontally */
    }
</style>