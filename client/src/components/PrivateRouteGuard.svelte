<script>
	import { navigate } from "svelte-routing";
	import { user } from "../stores/user.js";
    import { onMount } from "svelte";
    import checkSession from "../util/checkSession.js";
    let isLoading = true;
    let isError = false;
   

    onMount(async () => {
        try {
            const userData = await checkSession();
            if (!userData) {
                navigate("/", { replace: true });
            } else {
                user.set(userData);
            }
        } catch (error) {
            isError = true;
        } finally {
            isLoading = false;
        }
    });
</script>

{#if isLoading}
    <p>Loading...</p>
{:else if isError}
    <p>Error occurred during authentication</p>
{:else}        
    <slot />
{/if}
