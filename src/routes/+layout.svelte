<script lang="ts">
	import Navbar from '../components/Navbar.svelte';
	import BreadCrumb from '../components/BreadCrumb.svelte';
	import Footer from '../components/Footer.svelte';

	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Kalaka - Language Map of Malaysia</title>
	<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
</svelte:head>

<Navbar />

<BreadCrumb />

{@render children()}

<Footer />
