<script>
	import { userStore } from '../stores/userStore.js';
	import { getSession } from '$lib/auth.ts';
	import { onMount } from 'svelte';
	import Sidebar from './Sidebar.svelte';
	import { sidebarOpen } from '$lib/stores/sidebar.js';

	const API_URL = import.meta.env.VITE_API_BASE_URL;

	let currentDate = '';
	let totalSpeeches = 0;
	let totalSpeakers = 0;

	onMount(async () => {
		currentDate = new Date().toLocaleDateString();

		const session = await getSession();
		userStore.set({
			email: session?.user?.email || '',
			username: session?.user?.full_name || '',
			lastLogin: currentDate,
			roles: session?.roles ?? [],
			kalaka_id: session?.user?.kalaka_id || ''
		});

		try {
			const kalakaId = session?.user?.kalaka_id;
			const res = await fetch(`${API_URL}/counts?kalaka_id=${kalakaId}`, { credentials: 'include' });
			if (res.ok) {
				const data = await res.json();
				totalSpeeches = data.total_speeches;
				totalSpeakers = data.total_speakers;
			}
		} catch (error) {
			console.error('Fetch error:', error);
		}
	});
</script>

<div class="flex min-h-screen bg-gray-100">
	<!-- Sidebar -->
	<Sidebar role="user" />

	<!-- Main Content -->
	<div class="flex w-full min-w-0 flex-1 flex-col">
		<div class="flex items-center gap-3 bg-white p-4 shadow">
			<button
				type="button"
				class="text-blue-900 md:hidden"
				aria-label="Open menu"
				on:click={() => sidebarOpen.set(true)}
			>
				☰
			</button>
			<h1 class="text-sm font-bold sm:text-lg md:text-xl">
				Welcome to Dashboard, {$userStore.username} | {currentDate} | Last Login: {$userStore.lastLogin}
			</h1>
		</div>

		<!-- Dashboard Boxes with Colored Backgrounds -->
		<div class="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
			<!-- Speech Files Box -->
			<div class="rounded-lg bg-red-600 p-6 text-center text-white shadow-lg">
				<h2 class="text-xl font-bold">Total Speech Files</h2>
				<p class="mt-2 text-4xl font-bold">{totalSpeeches}</p>
				<a
					href="/Speech_Data"
					class="mt-4 inline-block rounded-lg bg-white px-4 py-2 text-red-600 transition hover:bg-gray-200"
					>View Details</a
				>
			</div>

			<!-- Speakers Box -->
			<div class="rounded-lg bg-yellow-300 p-6 text-center text-white shadow-lg">
				<h2 class="text-xl font-bold">Total Speakers</h2>
				<p class="mt-2 text-4xl font-bold">{totalSpeakers}</p>
				<a
					href="/Speaker_Profile"
					class="mt-4 inline-block rounded-lg bg-white px-4 py-2 text-yellow-600 transition hover:bg-gray-200"
					>View Details</a
				>
			</div>
		</div>
	</div>
</div>
