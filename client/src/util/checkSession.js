import { user } from "../stores/user.js";

export async function checkSession() {
    try {
        const response = await fetch("http://localhost:8080/users/session", {
            method: "GET",
            credentials: "include"
        });
        if (response.ok) {
            const userData = await response.json();
            user.set(userData);
            return userData;
        }
        return null;
    } catch (error) {
        return null;
    }
}

export default checkSession;