<script>
	import { userStore } from '../stores/userStore.js';
	import { getSession } from '$lib/auth.ts';
	import { onMount } from 'svelte';

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

<div class="flex h-screen bg-gray-100">
	<!-- Sidebar -->
	<div class="w-56 space-y-6 bg-blue-900 p-5 text-white">
		<div class="flex items-center justify-between">
			<h2 class="text-2xl font-bold">User Dashboard</h2>
		</div>

		<nav class="space-y-2">
			<a href="/Dashboard" class="block rounded px-4 py-2 hover:bg-blue-700">Home</a>
			<a href="/Speech_Data" class="block rounded px-4 py-2 hover:bg-blue-700">Speech Data</a>
			<a href="/Speaker_Profile" class="block rounded px-4 py-2 hover:bg-blue-700"
				>Speaker Profile</a
			>
			<a href="/Add_Speaker" class="block rounded px-4 py-2 hover:bg-blue-700">Add New Speaker</a>
			<a href="/Add_New_Speech" class="block rounded px-4 py-2 hover:bg-blue-700">Add New Speech</a>
			<a href="/Contact_Us" class="block rounded px-4 py-2 hover:bg-blue-700">Contact Us</a>
			<a href="/Kalaka_User_Manual.pdf" class="block rounded px-4 py-2 hover:bg-blue-700"
				>User Guide</a
			>
			<a href="/Profile" class="block rounded px-4 py-2 hover:bg-blue-700">Profile</a>
			<a href="/Logout" class="block rounded px-4 py-2 hover:bg-blue-700">Logout</a>
		</nav>
	</div>

	<!-- Main Content -->
	<div class="flex flex-1 flex-col">
		<div class="flex items-center justify-between bg-white p-4 shadow">
			<h1 class="text-xl font-bold">
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
