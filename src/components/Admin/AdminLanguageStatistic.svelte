<script>
	import { onMount } from 'svelte';
	import {
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Button,
		Input,
		Select
	} from 'flowbite-svelte';
	import axios from 'axios';

	const API_URL = import.meta.env.VITE_API_BASE_URL;

	let filterType = 'all';
	let filterValue = '';
	let genderFilter = '';
	let searchQuery = '';
	let sortDirection = 'asc';
	let sortColumn = 'name';

	let speakers = [];
	let languages = [];
	let categories = [];
	let locations = [];
	let tableData = [];
	let loading = true;

	onMount(async () => {
		const [speakerRes, speechRes, langRes, catRes, locRes] = await Promise.all([
			axios.post(`${API_URL}/speakers`),
			axios.post(`${API_URL}/speeches`),
			axios.get(`${API_URL}/languages`),
			axios.get(`${API_URL}/categories`),
			axios.post(`${API_URL}/locations`)
		]);

		speakers = speakerRes.data;
		const speeches = speechRes.data;
		languages = langRes.data;
		categories = catRes.data;
		locations = locRes.data;

		tableData = speakers.map((s, i) => {
			const speakerSpeeches = speeches.filter((sp) => sp.name === s.name);
			const speechFiles = speakerSpeeches.map((sp) => sp.recordfile).filter(Boolean);
			const transcriptions = speakerSpeeches.map((sp) => sp.textcontent).filter(Boolean);

			return {
				id: i + 1,
				name: s.name,
				age: s.age,
				origin: s.origin,
				language: s.language,
				category: speakerSpeeches[0]?.category || '',
				gender: s.gender,
				speechFiles,
				transcription: transcriptions
			};
		});

		loading = false;
	});

	$: filteredData = tableData
		.filter((item) => {
			if (filterType !== 'all' && filterValue !== '') {
				return item[filterType] === filterValue;
			}
			return true;
		})
		.filter((item) => (genderFilter ? item.gender === genderFilter : true))
		.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
		.sort((a, b) => {
			let valA = a[sortColumn];
			let valB = b[sortColumn];

			if (sortColumn === 'speechFiles') {
				valA = valA.length;
				valB = valB.length;
			}

			if (typeof valA === 'string') valA = valA.toLowerCase();
			if (typeof valB === 'string') valB = valB.toLowerCase();

			if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
			if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
			return 0;
		});

	function getOptions() {
		if (filterType === 'origin') return locations.map((l) => l.name);
		if (filterType === 'language') return languages.map((l) => l.name);
		if (filterType === 'category') return categories.map((c) => c.name);
		if (filterType === 'gender') return [...new Set(speakers.map((s) => s.gender))];
		return [];
	}

	$: maleCount = filteredData.filter((item) => item.gender === 'Male').length;
	$: femaleCount = filteredData.filter((item) => item.gender === 'Female').length;
	$: totalSpeech = filteredData.reduce((acc, item) => acc + item.speechFiles.length, 0);
	$: totalTranscription = filteredData.reduce((acc, item) => acc + item.transcription.length, 0);

	let currentPage = 1;
	const itemsPerPage = 10;

	$: totalPages = Math.ceil(filteredData.length / itemsPerPage);
	$: paginatedData = filteredData.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	function goToPage(page) {
		if (page >= 1 && page <= totalPages) currentPage = page;
	}

	function printTable() {
		window.scrollTo(0, 0);
		window.print();
	}
</script>

<div class="bg-gray-40 flex min-h-screen">
	<!-- Sidebar -->
	<div class="sidebar w-56 space-y-6 bg-blue-900 p-5 text-white">
		<h2 class="text-2xl font-bold">Admin Dashboard</h2>
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
	<div class="flex min-h-screen flex-1 flex-col p-6">
		<div class="header flex items-center justify-between bg-white p-4 shadow">
			<h1 class="text-xl font-bold">Speech Statistics</h1>
		</div>

		<main class="flex-1 px-6 py-8">
			{#if loading}
				<p class="text-center text-gray-500">Loading data...</p>
			{:else}
				<!-- Filters -->
				<div class="hidden-print mb-4 flex flex-wrap gap-4">
					<Select bind:value={filterType} class="w-1/4">
						<option value="all">Show All</option>
						<option value="origin">Origin</option>
						<option value="language">Language</option>
						<option value="category">Category</option>
						<option value="gender">Gender</option>
					</Select>

					{#if filterType !== 'all'}
						<Select bind:value={filterValue} class="w-1/4">
							<option value="">-- Select --</option>
							{#each getOptions() as option}
								<option value={option}>{option}</option>
							{/each}
						</Select>
					{/if}
				</div>

				<!-- Summary Boxes -->
				<div class="summary-boxes hidden-print mb-6 flex flex-wrap gap-6">
					<div class="w-64 rounded-xl border border-yellow-300 bg-yellow-100 p-6 shadow">
						<h3 class="mb-2 text-xl font-bold text-yellow-800">Speech Files</h3>
						<p class="text-3xl font-semibold text-yellow-700">{totalSpeech}</p>
					</div>
					<div class="w-64 rounded-xl border border-green-300 bg-green-100 p-6 shadow">
						<h3 class="mb-2 text-xl font-bold text-green-800">Transcriptions</h3>
						<p class="text-3xl font-semibold text-green-700">{totalTranscription}</p>
					</div>
					<div class="w-64 rounded-xl border border-blue-300 bg-blue-100 p-6 shadow">
						<h3 class="mb-2 text-xl font-bold text-blue-800">Male Speakers</h3>
						<p class="text-3xl font-semibold text-blue-700">{maleCount}</p>
					</div>
					<div class="w-64 rounded-xl border border-pink-300 bg-pink-100 p-6 shadow">
						<h3 class="mb-2 text-xl font-bold text-pink-800">Female Speakers</h3>
						<p class="text-3xl font-semibold text-pink-700">{femaleCount}</p>
					</div>
				</div>

				<!-- Tools -->
				<div class="hidden-print mb-6 flex flex-wrap gap-4">
					{#if filterType !== 'gender'}
						<Select bind:value={genderFilter} class="w-1/6">
							<option value="">All Genders</option>
							<option value="Male">Male</option>
							<option value="Female">Female</option>
						</Select>
					{/if}

					<Input
						type="text"
						placeholder="Search by name..."
						bind:value={searchQuery}
						class="input w-1/3"
					/>

					<Select bind:value={sortDirection} class="w-1/6">
						<option value="asc">Ascending</option>
						<option value="desc">Descending</option>
					</Select>

					<Select bind:value={sortColumn} class="w-1/6">
						<option value="id">#</option>
						<option value="name">Name</option>
						<option value="age">Age</option>
						<option value="origin">Origin</option>
						<option value="speechFiles">Total Number of Recorded Speech</option>
					</Select>

					<Button on:click={printTable} class="w-1/8 bg-gray-500 text-white">Print</Button>
				</div>

				<!-- Paginated Table (Hidden in print) -->
				<div class="hidden-print mt-6 rounded-lg bg-white p-3 shadow">
					<Table>
						<TableHead>
							<TableHeadCell>#</TableHeadCell>
							<TableHeadCell>Name</TableHeadCell>
							<TableHeadCell>Age</TableHeadCell>
							<TableHeadCell>Origin</TableHeadCell>
							<TableHeadCell>Total Number of Recorded Speech</TableHeadCell>
						</TableHead>
						<TableBody tableBodyClass="divide-y">
							{#each paginatedData as item, index}
								<TableBodyRow>
									<TableBodyCell>{index + 1}</TableBodyCell>
									<TableBodyCell>{item.name}</TableBodyCell>
									<TableBodyCell>{item.age}</TableBodyCell>
									<TableBodyCell>{item.origin}</TableBodyCell>
									<TableBodyCell>{item.speechFiles.length}</TableBodyCell>
								</TableBodyRow>
							{/each}
						</TableBody>
					</Table>
				</div>

				<!-- Full Table (Visible only in print) -->
				<table class="print-only min-w-full table-auto border-collapse border">
					<thead class="bg-gray-200">
						<tr>
							<th class="border px-4 py-2 text-left">#</th>
							<th class="border px-4 py-2 text-left">Name</th>
							<th class="border px-4 py-2 text-left">Age</th>
							<th class="border px-4 py-2 text-left">Origin</th>
							<th class="border px-4 py-2 text-left">Total Number of Recorded Speech</th>
						</tr>
					</thead>
					<tbody>
						{#each filteredData as item, index}
							<tr class="hover:bg-gray-100">
								<td class="border px-4 py-2">{index + 1}</td>
								<td class="border px-4 py-2">{item.name}</td>
								<td class="border px-4 py-2">{item.age}</td>
								<td class="border px-4 py-2">{item.origin}</td>
								<td class="border px-4 py-2">{item.speechFiles.length}</td>
							</tr>
						{/each}
					</tbody>
				</table>

				<!-- Pagination Controls -->
				<div class="pagination-controls hidden-print mt-4 flex flex-wrap items-center gap-2">
					<button
						on:click={() => goToPage(currentPage - 1)}
						disabled={currentPage === 1}
						class="rounded bg-gray-300 px-3 py-1 disabled:opacity-50">Previous</button
					>

					{#if currentPage > 2}
						<button
							on:click={() => goToPage(1)}
							class="rounded border bg-white px-3 py-1 font-semibold">1</button
						>
					{/if}
					{#if currentPage > 3}
						<span class="px-2 text-gray-500">...</span>
					{/if}

					{#each [-2, -1, 0, 1, 2] as offset}
						{#if currentPage + offset > 0 && currentPage + offset <= totalPages}
							<button
								class="rounded border px-3 py-1 font-semibold {currentPage === currentPage + offset
									? 'bg-blue-500 text-white'
									: 'bg-white'}"
								on:click={() => goToPage(currentPage + offset)}>{currentPage + offset}</button
							>
						{/if}
					{/each}

					{#if currentPage < totalPages - 2}
						<span class="px-2 text-gray-500">...</span>
					{/if}
					{#if currentPage < totalPages - 1}
						<button
							on:click={() => goToPage(totalPages)}
							class="rounded border bg-white px-3 py-1 font-semibold">{totalPages}</button
						>
					{/if}

					<button
						on:click={() => goToPage(currentPage + 1)}
						disabled={currentPage === totalPages}
						class="rounded bg-gray-300 px-3 py-1 disabled:opacity-50">Next</button
					>
				</div>
			{/if}
		</main>
	</div>
</div>

<style>
	input,
	select,
	button {
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 0.25rem;
	}

	button:disabled {
		cursor: not-allowed;
	}

	@media print {
		:global(.navbar),
		:global(.breadcrumb),
		:global(.footer),
		.sidebar,
		.header,
		.hidden-print,
		.pagination-controls,
		.summary-boxes,
		input,
		select,
		button {
			display: none !important;
		}

		.print-only {
			display: table !important;
		}
	}

	.print-only {
		display: none;
	}
</style>
