<script lang="ts">
	import { onMount } from 'svelte';
	import { Button, Input, Select } from 'flowbite-svelte';
	import { goto } from '$app/navigation';
	import { getSession } from '$lib/auth.ts';
	import axios from 'axios';

	const API_URL = import.meta.env.VITE_API_BASE_URL;

	let isSidebarOpen = true;
	let userID = '';
	let speakers = '';
	let selectedGender = '';
	let user_age = '';
	let mobile_no = '';
	let selectedOrigin = '';
	let selectedLang = '';
	let locations = [];
	let languages = [];
	let errorMessage = '';

	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
	}

	onMount(async () => {
		const session = await getSession();
		userID = session?.user?.kalaka_id || '';

		const [locRes, langRes] = await Promise.all([
			axios.post(`${API_URL}/locations`),
			axios.get(`${API_URL}/languages`)
		]);

		locations = locRes.data.map((o: any) => ({ value: o.name, name: o.name }));
		languages = langRes.data.map((l: any) => ({ value: l.name, name: l.name }));
	});

	async function handleSubmit(event) {
		event.preventDefault();
		errorMessage = '';

		try {
			await axios.post(`${API_URL}/speaker`, {
				name: speakers,
				gender: selectedGender,
				age: user_age,
				kalaka_id: userID,
				language: selectedLang,
				mobile: mobile_no,
				origin: selectedOrigin,
				recordings: '0',
				current: ''
			});

			alert('Speaker added successfully!');
			goto('/Speaker_Profile');
		} catch (err: any) {
			errorMessage = err.response?.data?.message || 'Failed to add speaker.';
		}
	}
</script>

<div class="flex min-h-screen bg-gray-100">
	<!-- Sidebar -->
	<div
		class={`w-56 space-y-6 bg-blue-900 p-5 text-white transition-transform duration-300
    ${isSidebarOpen ? 'block' : '-translate-x-64 md:translate-x-0'}`}
	>
		<div class="flex items-center justify-between">
			<h2 class="text-2xl font-bold">User Dashboard</h2>
			<button class="text-white md:hidden" on:click={toggleSidebar}>✖</button>
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
	<div class="flex flex-1 flex-col p-2">
		<div class="flex items-center justify-between bg-white p-4 shadow">
			<button class="text-blue-900 md:hidden" on:click={toggleSidebar}>☰</button>
			<h1 class="text-xl font-bold">Add Speaker</h1>
		</div>

		<!-- Form Section -->
		<div class="p-10">
			{#if errorMessage}
				<p class="mb-4 text-red-500">{errorMessage}</p>
			{/if}
			<form on:submit={handleSubmit} class="space-y-4 rounded-lg bg-white p-6 shadow-lg">
				<div>
					<label for="userID" class="block text-sm font-medium text-gray-700">Generated ID:</label>
					<Input id="userID" class="mb-6 bg-gray-300" bind:value={userID} disabled />
				</div>

				<div>
					<label for="speakers" class="block text-sm font-medium text-gray-700"
						>* Speaker's Name:</label
					>
					<Input id="speakers" bind:value={speakers} placeholder="Enter speaker's name" required />
				</div>

				<div>
					<label for="gender" class="block text-sm font-medium text-gray-700">* Gender:</label>
					<Select id="gender" bind:value={selectedGender} class="w-full" required>
						<option value="" disabled>Select Gender</option>
						<option value="Male">Male</option>
						<option value="Female">Female</option>
					</Select>
				</div>

				<div>
					<label for="user_age" class="block text-sm font-medium text-gray-700">* Age:</label>
					<Input
						id="user_age"
						type="number"
						bind:value={user_age}
						placeholder="Enter age"
						required
					/>
				</div>

				<div>
					<label for="mobile_no" class="block text-sm font-medium text-gray-700"
						>* Mobile Phone:</label
					>
					<Input
						id="mobile_no"
						type="tel"
						bind:value={mobile_no}
						placeholder="Enter phone number"
						required
					/>
				</div>

				<div>
					<label for="origin" class="block text-sm font-medium text-gray-700">* Origin:</label>
					<Select id="origin" bind:value={selectedOrigin} class="w-full" required>
						<option value="" disabled>Select Origin</option>
						{#each locations as location}
							<option value={location.value}>{location.name}</option>
						{/each}
					</Select>
				</div>

				<div>
					<label for="native_language" class="block text-sm font-medium text-gray-700"
						>* Native Language:</label
					>
					<Select id="native_language" bind:value={selectedLang} class="w-full" required>
						<option value="" disabled>Select Language</option>
						{#each languages as language}
							<option value={language.value}>{language.name}</option>
						{/each}
					</Select>
				</div>

				<div class="flex space-x-4">
					<Button type="submit" color="blue">Save</Button>
					<Button type="button" color="red" on:click={() => goto('/Dashboard')}>Cancel</Button>
				</div>
			</form>
		</div>
	</div>
</div>
