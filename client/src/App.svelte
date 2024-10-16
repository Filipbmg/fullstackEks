<script>
  import { Router, Route } from 'svelte-routing';
  import Login from "./pages/Login.svelte";
  import Home from "./pages/Home.svelte";
  import NoteDetails from "./pages/NoteDetails.svelte";
  import PrivateRouteGuard from './components/PrivateRouteGuard.svelte';

</script>

<main>
<Router>
  <Route path="/" component={Login} />
  <Route path="/Home">
    <PrivateRouteGuard>
      <Home />
    </PrivateRouteGuard>
  </Route>
  <Route path="/notes/:id">
    <PrivateRouteGuard>
      <NoteDetails />
    </PrivateRouteGuard>
  </Route>    
</Router>
</main>
