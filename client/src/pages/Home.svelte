<script>
  import { onMount } from "svelte";
  import logOut from "../util/logOut";
  import { navigate } from "svelte-routing";

  let ownNotes = [];
  let collabNotes = [];

  async function fetchNotes() {
        try {
            const response = await fetch("http://localhost:8080/notes", {
                method: "GET",
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("Failed to fetch notes");
            }
            const data = await response.json();
            ownNotes = data.ownNotes;
            collabNotes = data.collabNotes;

        } catch (error) {
            throw new Error("Failed to fetch notes: " + error.message);
        }
    }

  onMount(fetchNotes);

  async function createNewNote() {
    try {
      const response = await fetch("http://localhost:8080/notes", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        throw new Error("Failed to create note")
      }

      const newNote = await response.json();
      navigate(`/notes/${newNote._id}`);
    } catch (error) {
      throw new Error("Failed to create note: " + error.message);
    }
  }

  async function deleteNote(noteId) {
    try {
      const response = await fetch(`http://localhost:8080/notes`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: noteId })
      });

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }

      fetchNotes();
    } catch (error) {
      throw new Error("Failed to delete note: " + error.message);
    }
  }

  async function leaveNote(noteId) {
    try {
      const response = await fetch(`http://localhost:8080/collaborators/self`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: noteId })
      });

      if (!response.ok) {
        throw new Error("Failed to leave note");
      }

      fetchNotes();
    } catch (error) {
      throw new Error("Failed to leave note: " + error.message);
    }
  }

</script>

<main>
  <nav class="navbar">
    <h2>
      NotePal
    </h2>
    <button class="logout-button" on:click={logOut}>Log Out</button>
  </nav>

  <div class="notes-section">
    <div class="notes-container">
      <h2>Your Notes</h2>
      <ul>
        {#each ownNotes as note}
          <li class="note-item">
            <button class="note-button" on:click={() => navigate(`/notes/${note._id}`)}>
              { note.title || "Untitled Note" }
            </button>
            <button class="delete-button" on:click={() => deleteNote(note._id)}>
              ✖
            </button>
          </li>
        {/each}
      </ul>
      <button class="create-note-button" on:click={createNewNote}>Create New Note</button>
    </div>

    <div class="notes-container">
      <h2>Collaborator's Notes</h2>
      <ul>
        {#each collabNotes as note}
          <li class="note-item">
            <button class="note-button" on:click={() => navigate(`/notes/${note._id}`)}>
              { note.title || "Untitled Note" }
            </button>
            <button class="leave-button" on:click={() => leaveNote(note._id)}>
              ✖
            </button>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</main>

<style>
  .notes-section {
    display: flex;
    gap: 20px; /* Space between Your Notes and Collaborator's Notes */
    justify-content: space-around; /* Center and distribute containers */
    margin-bottom: 60px;
  }

  .notes-container ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
    border: 1px solid #ccc;
    padding: 15px;
    border-radius: 5px;
    background-color: #f9f9f9;
    min-width: 300px;
  }

  .note-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }

  .note-button {
    flex-grow: 1;
    padding: 10px;
    text-align: left;
    background-color: transparent;
    border: none;
    cursor: pointer;
    color: #333;
  }

  .note-button:hover {
    color: #000;
    text-decoration: underline;
  }

  .delete-button,
  .leave-button {
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

  .delete-button:hover,
  .leave-button:hover {
    background-color: darkred;
  }

  .create-note-button {
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  .create-note-button:hover {
    background-color: #45a049;
  }

  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background-color: lightgrey;
    border-bottom: 2px solid black;
    padding: 10px;
    z-index: 1000;
    display: flex; /* Enables flexbox */
    justify-content: space-between; /* Spaces items to left and right */
    align-items: center; /* Centers items vertically */
  }

  .logout-button {
    background-color: red;
    color: white;
  }

  .logout-button:hover {
      background-color: darkred;
  }

  main {
    padding-top: 60px;
  }
</style>
  
