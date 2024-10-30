import { navigate } from "svelte-routing";

export async function logOut() {
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

export default logOut;