<script>
	import { onMount } from 'svelte';
	import { Button, Input, Textarea } from 'flowbite-svelte';
	import { goto } from '$app/navigation';
	import axios from 'axios';

	const API_URL = import.meta.env.VITE_API_BASE_URL;

	let userID = '';
	let selectedSpeaker1 = '';
	let selectedSpeaker2 = '';
	let selectedSpeaker3 = '';
	let selectedCategory = '';
	let selectedLanguage = '';
	let speechFile = null;
	let textGridFile = null;
	let transcriptText = '';
	let speechDate = '';
	let errorMessage = '';
	let isSubmitting = false;

	let speakerData = [];
	let categoryData = [];
	let languageData = [];

	// Search terms for each dropdown
	let speakerSearch1 = '';
	let speakerSearch2 = '';
	let speakerSearch3 = '';
	let categorySearch = '';
	let languageSearch = '';

	// Dropdown open states
	let isSpeaker1Open = false;
	let isSpeaker2Open = false;
	let isSpeaker3Open = false;
	let isCategoryOpen = false;
	let isLanguageOpen = false;

	// Filter functions that exclude already selected speakers
	$: filteredSpeakers1 = speakerSearch1
		? speakerData.filter(
				(s) =>
					s.name.toLowerCase().includes(speakerSearch1.toLowerCase()) &&
					s.name !== selectedSpeaker2 &&
					s.name !== selectedSpeaker3
			)
		: speakerData.filter((s) => s.name !== selectedSpeaker2 && s.name !== selectedSpeaker3);

	$: filteredSpeakers2 = speakerSearch2
		? speakerData.filter(
				(s) =>
					s.name.toLowerCase().includes(speakerSearch2.toLowerCase()) &&
					s.name !== selectedSpeaker1 &&
					s.name !== selectedSpeaker3
			)
		: speakerData.filter((s) => s.name !== selectedSpeaker1 && s.name !== selectedSpeaker3);

	$: filteredSpeakers3 = speakerSearch3
		? speakerData.filter(
				(s) =>
					s.name.toLowerCase().includes(speakerSearch3.toLowerCase()) &&
					s.name !== selectedSpeaker1 &&
					s.name !== selectedSpeaker2
			)
		: speakerData.filter((s) => s.name !== selectedSpeaker1 && s.name !== selectedSpeaker2);

	$: filteredCategories = categorySearch
		? categoryData.filter((c) => c.name.toLowerCase().includes(categorySearch.toLowerCase()))
		: categoryData;

	$: filteredLanguages = languageSearch
		? languageData.filter((l) => l.name.toLowerCase().includes(languageSearch.toLowerCase()))
		: languageData;

	onMount(async () => {
		try {
			const userResponse = await axios.get(`${API_URL}/me`);
			userID = userResponse.data.user.kalaka_id;

			const [speakersRes, categoriesRes, languagesRes] = await Promise.all([
				axios.post(`${API_URL}/speakers`),
				axios.get(`${API_URL}/categories`),
				axios.get(`${API_URL}/languages`)
			]);

			// Only show speakers that belong to this user
			speakerData = speakersRes.data.filter((s) => s.kalaka_id === userID);
			categoryData = categoriesRes.data;
			languageData = languagesRes.data;
		} catch (err) {
			errorMessage = err.response?.data?.message || err.message;
			console.error('Error fetching data:', err);
		}
	});

	async function handleSubmit(e) {
		e.preventDefault();
		errorMessage = '';

		if (!selectedSpeaker1) {
			errorMessage = 'Speaker 1 is required.';
			return;
		}
		if (!speechFile) {
			errorMessage = 'Speech file is required.';
			return;
		}

		const speaker1Obj = speakerData.find((s) => s.name === selectedSpeaker1);
		const speakerno = [selectedSpeaker1, selectedSpeaker2, selectedSpeaker3].filter(Boolean).length;

		isSubmitting = true;
		try {
			const formData = new FormData();
			formData.append('name', [selectedSpeaker1, selectedSpeaker2, selectedSpeaker3].filter(Boolean).join(', '));
			formData.append('category', selectedCategory);
			formData.append('date', speechDate);
			formData.append('kalaka_id', userID);
			formData.append('language', selectedLanguage);
			formData.append('mobile', speaker1Obj?.mobile || '');
			formData.append('origin', speaker1Obj?.origin || '');
			formData.append('recordfile', speechFile);
			formData.append('speakerno', speakerno);
			formData.append('public', 1);
			if (textGridFile) formData.append('textgrid', textGridFile);
			if (transcriptText.trim()) formData.append('textcontent', transcriptText);

			await axios.post(`${API_URL}/speech`, formData);
			goto('/Speech_Data');
		} catch (err) {
			errorMessage = err.response?.data?.message || 'Failed to submit speech.';
		} finally {
			isSubmitting = false;
		}
	}

	function clickOutside(node, callback) {
		const handleClick = (event) => {
			if (node && !node.contains(event.target)) {
				callback();
			}
		};
		document.addEventListener('click', handleClick, true);
		return {
			destroy() {
				document.removeEventListener('click', handleClick, true);
			}
		};
	}

	function validateSpeakerSelections() {
		if (selectedSpeaker1 && selectedSpeaker2 && selectedSpeaker1 === selectedSpeaker2) {
			selectedSpeaker2 = '';
		}
		if (selectedSpeaker1 && selectedSpeaker3 && selectedSpeaker1 === selectedSpeaker3) {
			selectedSpeaker3 = '';
		}
		if (selectedSpeaker2 && selectedSpeaker3 && selectedSpeaker2 === selectedSpeaker3) {
			selectedSpeaker3 = '';
		}
	}

	$: validateSpeakerSelections();
</script>

<div class="flex min-h-screen bg-gray-50">
	<!-- Sidebar -->
	<div class="sidebar w-56 space-y-6 bg-blue-900 p-5 text-white">
		<h2 class="text-2xl font-bold">User Dashboard</h2>
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

	<div class="flex min-h-screen flex-1 flex-col p-6">
		<div class="header flex items-center justify-between bg-white p-4 shadow">
			<h1 class="text-xl font-bold">Add New Speech</h1>
		</div>

		<main class="flex-1 px-6 py-8">
			<form on:submit={handleSubmit} class="space-y-6 rounded-lg bg-white p-6 shadow">
				<div>
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="mb-1 block text-sm font-medium">Generated ID:</label>
					<Input bind:value={userID} class="bg-gray-50" disabled />
				</div>

				<!-- Speaker 1 Dropdown -->
				<div>
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="mb-1 block text-sm font-medium">*Speaker 1 Name:</label>
					<div class="relative" use:clickOutside={() => (isSpeaker1Open = false)}>
						<button
							type="button"
							class="w-full rounded-md border bg-white px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 {!selectedSpeaker1
								? 'text-gray-400'
								: ''}"
							on:click={() => {
								isSpeaker1Open = !isSpeaker1Open;
								if (isSpeaker1Open) speakerSearch1 = '';
							}}
						>
							{selectedSpeaker1 || "Choose speaker's name"}
						</button>

						{#if isSpeaker1Open}
							<div
								class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white py-1 shadow-lg"
							>
								<div class="border-b p-2">
									<input
										type="text"
										bind:value={speakerSearch1}
										placeholder="Search speakers..."
										class="w-full rounded border p-2"
										on:click|stopPropagation
									/>
								</div>
								{#each filteredSpeakers1 as s}
									<button
										type="button"
										class="w-full px-3 py-2 text-left hover:bg-gray-100"
										on:click={() => {
											selectedSpeaker1 = s.name;
											isSpeaker1Open = false;
										}}
									>
										{s.name}
									</button>
								{:else}
									<div class="px-3 py-2 text-gray-500">No available speakers</div>
								{/each}
							</div>
						{/if}
					</div>
					<p class="mt-1 text-sm text-gray-500">
						Please add new speaker if there is no option here.
					</p>
				</div>

				<!-- Speaker 2 Dropdown -->
				<div>
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="mb-1 block text-sm font-medium">Speaker 2 Name (Optional):</label>
					<div class="relative" use:clickOutside={() => (isSpeaker2Open = false)}>
						<button
							type="button"
							class="w-full rounded-md border bg-white px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 {!selectedSpeaker2
								? 'text-gray-400'
								: ''}"
							on:click={() => {
								isSpeaker2Open = !isSpeaker2Open;
								if (isSpeaker2Open) speakerSearch2 = '';
							}}
						>
							{selectedSpeaker2 || "Choose speaker's name"}
							{selectedSpeaker1 === selectedSpeaker2 && selectedSpeaker2 !== ''
								? ' (Cannot select same speaker)'
								: ''}
						</button>

						{#if isSpeaker2Open}
							<div
								class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white py-1 shadow-lg"
							>
								<div class="border-b p-2">
									<input
										type="text"
										bind:value={speakerSearch2}
										placeholder="Search speakers..."
										class="w-full rounded border p-2"
										on:click|stopPropagation
									/>
								</div>
								{#each filteredSpeakers2 as s}
									<button
										type="button"
										class="w-full px-3 py-2 text-left hover:bg-gray-100"
										on:click={() => {
											selectedSpeaker2 = s.name;
											isSpeaker2Open = false;
										}}
									>
										{s.name}
									</button>
								{:else}
									<div class="px-3 py-2 text-gray-500">No available speakers</div>
								{/each}
							</div>
						{/if}
					</div>
					{#if selectedSpeaker1 === selectedSpeaker2 && selectedSpeaker2 !== ''}
						<p class="mt-1 text-sm text-red-500">Error: Cannot select the same speaker twice</p>
					{/if}
					<p class="mt-1 text-sm text-gray-500">
						Please add new speaker if there is no option here.
					</p>
				</div>

				<!-- Speaker 3 Dropdown -->
				<div>
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="mb-1 block text-sm font-medium">Speaker 3 Name (Optional):</label>
					<div class="relative" use:clickOutside={() => (isSpeaker3Open = false)}>
						<button
							type="button"
							class="w-full rounded-md border bg-white px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 {!selectedSpeaker3
								? 'text-gray-400'
								: ''}"
							on:click={() => {
								isSpeaker3Open = !isSpeaker3Open;
								if (isSpeaker3Open) speakerSearch3 = '';
							}}
						>
							{selectedSpeaker3 || "Choose speaker's name"}
							{(selectedSpeaker1 === selectedSpeaker3 || selectedSpeaker2 === selectedSpeaker3) &&
							selectedSpeaker3 !== ''
								? ' (Cannot select same speaker)'
								: ''}
						</button>

						{#if isSpeaker3Open}
							<div
								class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white py-1 shadow-lg"
							>
								<div class="border-b p-2">
									<input
										type="text"
										bind:value={speakerSearch3}
										placeholder="Search speakers..."
										class="w-full rounded border p-2"
										on:click|stopPropagation
									/>
								</div>
								{#each filteredSpeakers3 as s}
									<button
										type="button"
										class="w-full px-3 py-2 text-left hover:bg-gray-100"
										on:click={() => {
											selectedSpeaker3 = s.name;
											isSpeaker3Open = false;
										}}
									>
										{s.name}
									</button>
								{:else}
									<div class="px-3 py-2 text-gray-500">No available speakers</div>
								{/each}
							</div>
						{/if}
					</div>
					{#if (selectedSpeaker1 === selectedSpeaker3 || selectedSpeaker2 === selectedSpeaker3) && selectedSpeaker3 !== ''}
						<p class="mt-1 text-sm text-red-500">Error: Cannot select the same speaker twice</p>
					{/if}
					<p class="mt-1 text-sm text-gray-500">
						Please add new speaker if there is no option here.
					</p>
				</div>

				<!-- Dropdown for Category -->
				<div>
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="mb-1 block text-sm font-medium">*Speech's Category:</label>
					<div class="relative" use:clickOutside={() => (isCategoryOpen = false)}>
						<button
							type="button"
							class="w-full rounded-md border bg-white px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
							on:click={() => {
								isCategoryOpen = !isCategoryOpen;
								if (isCategoryOpen) categorySearch = '';
							}}
						>
							{selectedCategory || 'Select Category'}
						</button>

						{#if isCategoryOpen}
							<div
								class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white py-1 shadow-lg"
							>
								<div class="border-b p-2">
									<input
										type="text"
										bind:value={categorySearch}
										placeholder="Search categories..."
										class="w-full rounded border p-2"
										on:click|stopPropagation
									/>
								</div>
								{#each filteredCategories as c}
									<button
										type="button"
										class="w-full px-3 py-2 text-left hover:bg-gray-100"
										on:click={() => {
											selectedCategory = c.name;
											isCategoryOpen = false;
										}}
									>
										{c.name}
									</button>
								{/each}
							</div>
						{/if}
					</div>
				</div>

				<!-- Dropdown for Language -->
				<div>
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="mb-1 block text-sm font-medium">*Language Used in the Speech:</label>
					<div class="relative" use:clickOutside={() => (isLanguageOpen = false)}>
						<button
							type="button"
							class="w-full rounded-md border bg-white px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
							on:click={() => {
								isLanguageOpen = !isLanguageOpen;
								if (isLanguageOpen) languageSearch = '';
							}}
						>
							{selectedLanguage || 'Select Language'}
						</button>

						{#if isLanguageOpen}
							<div
								class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white py-1 shadow-lg"
							>
								<div class="border-b p-2">
									<input
										type="text"
										bind:value={languageSearch}
										placeholder="Search languages..."
										class="w-full rounded border p-2"
										on:click|stopPropagation
									/>
								</div>
								{#each filteredLanguages as l}
									<button
										type="button"
										class="w-full px-3 py-2 text-left hover:bg-gray-100"
										on:click={() => {
											selectedLanguage = l.name;
											isLanguageOpen = false;
										}}
									>
										{l.name}
									</button>
								{/each}
							</div>
						{/if}
					</div>
				</div>

				<div>
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="mb-1 block text-sm font-medium">*Select Speech File:</label>
					<input
						type="file"
						accept=".wav,.mp3,.wma,.3gp"
						on:change={(e) => (speechFile = e.target.files[0])}
						required
					/>
					<p class="mt-1 text-sm text-gray-500">(wav/mp3/wma/3gp audio only)</p>
				</div>

				<div>
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="mb-1 block text-sm font-medium">Upload TextGrid (Optional):</label>
					<input
						type="file"
						accept=".TextGrid"
						on:change={(e) => (textGridFile = e.target.files[0])}
					/>
					<p class="mt-1 text-sm text-gray-500">(TextGrid only)</p>
				</div>

				<div>
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="mb-1 block text-sm font-medium">Insert Metadata (Optional):</label>
					<Textarea
						rows="4"
						class="bg-white-100"
						bind:value={transcriptText}
						placeholder="Enter transcript or notes..."
					/>
				</div>

				<div>
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="mb-1 block text-sm font-medium">*Speech Recorded Date:</label>
					<Input type="date" class="bg-white-100" bind:value={speechDate} required />
				</div>

				{#if errorMessage}
					<p class="text-sm text-red-500">{errorMessage}</p>
				{/if}

				<div class="flex space-x-4">
					<Button type="submit" color="blue" disabled={isSubmitting}
						>{isSubmitting ? 'Saving...' : 'Save'}</Button
					>
					<Button type="button" color="red" on:click={() => goto('/Speech_Data')}>Cancel</Button>
				</div>
			</form>
		</main>
	</div>
</div>
