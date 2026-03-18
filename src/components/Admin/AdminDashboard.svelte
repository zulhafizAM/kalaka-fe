<script>
	import { userStore } from '../../stores/userStore.js';
	import { getSession } from '$lib/auth.ts';
	import { onMount } from 'svelte';

	const API_URL = import.meta.env.VITE_API_BASE_URL;

	let currentDate = '';
	let totalSpeeches = 0;
	let totalSpeakers = 0;

	onMount(async () => {
		currentDate = new Date().toLocaleDateString();

		const session = await getSession();
		if (session) {
			userStore.set({
				email: String(session.user.email ?? ''),
				username: String(session.user.full_name ?? ''),
				lastLogin: currentDate,
				roles: session.roles,
				kalaka_id: String(session.user.kalaka_id ?? '')
			});
		}

		try {
			const res = await fetch(`${API_URL}/counts`);
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
	<div class="w-56 space-y-6 bg-blue-900 p-5 text-white">
		<div class="flex items-center justify-between">
			<h2 class="text-2xl font-bold">Admin Dashboard</h2>
		</div>
		<nav class="space-y-2">
			<a href="/AdminDashboard" class="block rounded px-4 py-2 hover:bg-blue-700">Home</a>
			<a href="/AdminLanguageStatistic" class="block rounded px-4 py-2 hover:bg-blue-700"
				>Speaker Statistics</a
			>
			<a href="/AdminAddWord" class="block rounded px-4 py-2 hover:bg-blue-700">Add New Word</a>
			<a href="/AdminAddQuiz" class="block rounded px-4 py-2 hover:bg-blue-700">Add New Quiz</a>
			<a href="/AdminUserManagement" class="block rounded px-4 py-2 hover:bg-blue-700"
				>User Management</a
			>
			<a href="/AdminSpeechData" class="block rounded px-4 py-2 hover:bg-blue-700">Speech Data</a>
			<a href="/AdminSpeakerProfile" class="block rounded px-4 py-2 hover:bg-blue-700"
				>Speaker Profile</a
			>
			<a href="/AdminAddSpeaker" class="block rounded px-4 py-2 hover:bg-blue-700"
				>Add New Speaker</a
			>
			<a href="/AdminAddSpeech" class="block rounded px-4 py-2 hover:bg-blue-700">Add New Speech</a>
			<a href="/Kalaka_Admin_Manual.pdf" class="block rounded px-4 py-2 hover:bg-blue-700"
				>Admin Guide</a
			>
			<a href="/AdminProfile" class="block rounded px-4 py-2 hover:bg-blue-700">Profile</a>
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
					href="/AdminSpeechData"
					class="mt-4 inline-block rounded-lg bg-white px-4 py-2 text-red-600 transition hover:bg-gray-200"
					>View Details</a
				>
			</div>

			<!-- Speakers Box -->
			<div class="rounded-lg bg-yellow-300 p-6 text-center text-white shadow-lg">
				<h2 class="text-xl font-bold">Total Speakers</h2>
				<p class="mt-2 text-4xl font-bold">{totalSpeakers}</p>
				<a
					href="/AdminSpeakerProfile"
					class="mt-4 inline-block rounded-lg bg-white px-4 py-2 text-yellow-600 transition hover:bg-gray-200"
					>View Details</a
				>
			</div>
		</div>
	</div>
</div>
