<script>
	import { onMount } from 'svelte';
	import axios from 'axios';
	import Sidebar from '../Sidebar.svelte';
	import { sidebarOpen } from '$lib/stores/sidebar.js';

	const API_URL = import.meta.env.VITE_API_BASE_URL;

	let word = '';
	let phoneme = '';
	let meaning = '';
	let editingId = null;
	let searchQuery = '';
	let words = [];
	let isLoading = false;
	let error = null;

	onMount(async () => {
		await fetchWords();
	});

	async function fetchWords() {
		try {
			isLoading = true;
			const res = await axios.get(`${API_URL}/words`);
			words = res.data;
		} catch (err) {
			error = err.response?.data?.message || err.message;
		} finally {
			isLoading = false;
		}
	}

	$: filtered = searchQuery
		? words.filter(
				(entry) =>
					entry.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
					entry.phoneme.toLowerCase().includes(searchQuery.toLowerCase()) ||
					entry.meaning.toLowerCase().includes(searchQuery.toLowerCase())
			)
		: words;

	async function submitWord() {
		if (!word || !phoneme || !meaning) {
			alert('Please fill in all fields.');
			return;
		}

		const payload = { word, phoneme, meaning };

		try {
			if (editingId === null) {
				await axios.post(`${API_URL}/word`, payload);
			} else {
				await axios.put(`${API_URL}/word/${editingId}`, payload);
				editingId = null;
			}
			clearForm();
			await fetchWords();
		} catch (err) {
			alert(err.response?.data?.message || err.message);
		}
	}

	function editWord(entry) {
		word = entry.word;
		phoneme = entry.phoneme;
		meaning = entry.meaning;
		editingId = entry.id;
	}

	async function deleteWord(id) {
		if (confirm('Are you sure you want to delete this word?')) {
			try {
				await axios.delete(`${API_URL}/word/${id}`);
				words = words.filter((w) => w.id !== id);
			} catch (err) {
				alert(err.response?.data?.message || err.message);
			}
		}
	}

	function clearForm() {
		word = '';
		phoneme = '';
		meaning = '';
		editingId = null;
	}
</script>

<!-- Layout -->
<div class="flex min-h-screen bg-gray-50">
	<Sidebar role="admin" />

	<!-- Main Content -->
	<div class="flex w-full min-w-0 flex-1 flex-col p-4 sm:p-6">
		<div class="flex items-center gap-3 bg-white p-4 shadow">
			<button
				type="button"
				class="text-blue-900 md:hidden"
				aria-label="Open menu"
				on:click={() => sidebarOpen.set(true)}
			>
				☰
			</button>
			<h1 class="text-xl font-bold">Add & Manage Words</h1>
		</div>

		<main class="flex-1 px-2 py-10 sm:px-6">
			<div class="flex flex-col gap-6 lg:flex-row">
				<!-- Add/Edit Word Form -->
				<div class="flex-1 rounded-2xl bg-white p-6 shadow-lg">
					<h2 class="mb-4 text-lg font-semibold">
						{editingId === null ? 'Add Word' : 'Edit Word'}
					</h2>
					<div class="space-y-4">
						<div>
							<label for="word" class="mb-1 block text-sm font-medium text-gray-700">Word</label>
							<input
								id="word"
								type="text"
								bind:value={word}
								placeholder="Enter the word"
								class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div>
							<label for="phoneme" class="mb-1 block text-sm font-medium text-gray-700"
								>Phoneme</label
							>
							<input
								id="phoneme"
								type="text"
								bind:value={phoneme}
								placeholder="e.g., /ˈwɜːd/"
								class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div>
							<label for="meaning" class="mb-1 block text-sm font-medium text-gray-700"
								>Meaning</label
							>
							<textarea
								id="meaning"
								rows="3"
								bind:value={meaning}
								placeholder="Enter the meaning"
								class="w-full resize-none rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
							></textarea>
						</div>

						<div class="flex gap-2">
							<button
								on:click={submitWord}
								class="flex-1 rounded-lg bg-blue-600 py-2 font-semibold text-white shadow hover:bg-blue-700"
							>
								{editingId === null ? 'Save Word' : 'Update Word'}
							</button>
							{#if editingId !== null}
								<button
									on:click={clearForm}
									class="rounded-lg bg-gray-400 px-4 py-2 font-semibold text-white shadow hover:bg-gray-500"
									>Cancel</button
								>
							{/if}
						</div>
					</div>
				</div>

				<!-- Word List Table -->
				<div class="flex-1 overflow-hidden rounded-2xl bg-white p-6 shadow-lg">
					<h2 class="mb-4 text-lg font-semibold">Word List ({filtered.length})</h2>
					<div class="mb-4">
						<input
							type="text"
							bind:value={searchQuery}
							placeholder="Search words..."
							class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					{#if isLoading}
						<p class="py-8 text-center text-gray-500">Loading...</p>
					{:else if error}
						<p class="py-8 text-center text-red-500">{error}</p>
					{:else}
						<div class="h-96 overflow-y-auto">
							<table class="w-full table-auto border border-gray-300">
								<thead class="bg-gray-100">
									<tr>
										<th class="border p-2 text-left">Word</th>
										<th class="border p-2 text-left">Phoneme</th>
										<th class="border p-2 text-left">Meaning</th>
										<th class="border p-2 text-left">Actions</th>
									</tr>
								</thead>
								<tbody>
									{#each filtered as entry}
										<tr class="hover:bg-gray-50">
											<td class="border p-2">{entry.word}</td>
											<td class="border p-2">{entry.phoneme}</td>
											<td class="border p-2">{entry.meaning}</td>
											<td class="space-x-2 border p-2">
												<div class="flex gap-2">
													<button
														on:click={() => editWord(entry)}
														class="rounded-md bg-yellow-400 px-3 py-1 text-white hover:bg-yellow-600"
													>
														Edit
													</button>
													<button
														on:click={() => deleteWord(entry.id)}
														class="rounded-md bg-red-600 px-3 py-1 text-white hover:bg-red-700"
													>
														Delete
													</button>
												</div>
											</td>
										</tr>
									{:else}
										<tr
											><td colspan="4" class="text-center py-6 text-gray-500"
												>No words found{#if searchQuery}
													for "{searchQuery}"{:else}
													— add your first word!{/if}</td
											></tr
										>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}
				</div>
			</div>
		</main>
	</div>
</div>

<style>
	.overflow-y-auto::-webkit-scrollbar {
		width: 6px;
	}
	.overflow-y-auto::-webkit-scrollbar-track {
		background: #f1f1f1;
		border-radius: 10px;
	}
	.overflow-y-auto::-webkit-scrollbar-thumb {
		background: #cbd5e0;
		border-radius: 10px;
	}
	.overflow-y-auto::-webkit-scrollbar-thumb:hover {
		background: #a0aec0;
	}
</style>
