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
      console.log(newNote)
      navigate(`/notes/${newNote._id}`);
    } catch (error) {
      throw new Error("Failed to create note: " + error.message);
    }
  }
</script>

<main>
  <nav class="navbar">
    <button class="logout-button" on:click={logOut}>Log Out</button>
  </nav>
  <h2>Your Notes</h2>
  <ul>
    {#each ownNotes as note}
      <li>
        <button on:click={() => navigate(`/notes/${note._id}`)}>
          { note.title || "Untitled Note" }
        </button>
      </li>
    {/each}
  </ul>

  <h2>Collaborator's Notes</h2>
  <ul>
    {#each collabNotes as note}
      <li>
        <button on:click={() => navigate(`/notes/${note._id}`)}>
          { note.title || "Untitled Note" }
        </button>
      </li>
    {/each}
  </ul>
  <button on:click={createNewNote}>Create New Note</button>
</main>

<style>
    .logout-button {
        background-color: red;
    }
    .logout-button:hover {
        background-color: darkred;
    }
</style>
  
