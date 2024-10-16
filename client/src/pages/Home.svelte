<script>
    import { onMount } from "svelte";
    import { navigate } from "svelte-routing";
    
    async function logOut() {
    try {
      const response = await fetch("http://localhost:8080/logout", {
        method: "POST",
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to log out");
      }
      navigate("/");
    } catch (err) {
      console.error("Logout Error: " + err.message);
    }
  }

  let ownNotes = [];
  let collabNotes = [];

  onMount(async() => {
    try {
      const response = await fetch("http://localhost:8080/notes", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch notes")
      }
      const data = await response.json();
      ownNotes = data.ownNotes;
      collabNotes = data.collabNotes;


    } catch (error) {
      throw new Error("Failed to fetch notes: " + error.message);
    }
  });
</script>

<main>
  <h2>Your Notes</h2>
  <ul>
      {#each ownNotes as note}
          <li>
              <a href={`/notes/${note._id}`}>{note.title}</a>
          </li>
      {/each}
  </ul>
  <h2>Collaborator's Notes</h2>
    <ul>
        {#each collabNotes as note}
            <li>
                <a href={`/notes/${note._id}`}>{note.title}</a>
            </li>
        {/each}
    </ul>
    <button class="logout-button" on:click={logOut}>Log Out</button>
</main>

<style>
    .logout-button {
        background-color: red;
    }
    .logout-button:hover {
        background-color: darkred;
    }
</style>
  
