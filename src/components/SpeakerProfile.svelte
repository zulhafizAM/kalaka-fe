<script lang="ts">
	import { getSession } from '$lib/auth.ts';
	import axios from 'axios';
	import {
		Button,
		Input,
		Select,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import Sidebar from './Sidebar.svelte';
	import TableControls from './TableControls.svelte';
	import { sidebarOpen } from '$lib/stores/sidebar.js';

	// import { speakerData } from '../backend/speakers.js';
	const API_URL = import.meta.env.VITE_API_BASE_URL;
	let speakerData = [];
	let error = null;
	let currentPage = 1;
	let itemsPerPage = 10;
	let items = [];
	let editItem: Record<string, any> | null = null;
	let showModal = false;
	let isLoading = false;

	let sortColumn = 'name';
	let sortAscending = true;

	let currentUser: Record<string, any> = {};
	onMount(async () => {
		const session = await getSession();
		currentUser = session?.user ?? {};
		try {
			// Fetch all needed data in parallel
			const [speakerRes] = await Promise.all([axios.post(`${API_URL}/speakers`)]);

			speakerData = speakerRes.data.filter((e: any) => e.kalaka_id === currentUser.kalaka_id);
		} catch (err) {
			error = err.response?.data?.message || err.message;
			console.error('Error fetching data:', err);
		} finally {
			isLoading = false;
		}
	});
	$: {
		items = [...speakerData];
	}

	// Columns exposed to the dynamic search/filter toolbar.
	const tableColumns = [
		{ key: 'name', label: 'Name' },
		{ key: 'gender', label: 'Gender' },
		{ key: 'age', label: 'Age' },
		{ key: 'mobile', label: 'Mobile' },
		{ key: 'origin', label: 'Place of Origin' },
		{ key: 'language', label: 'Language' },
		{ key: 'recordings', label: 'Total Recordings' }
	];

	/** Rows after search + filters; sorting is applied on top. */
	let queried = [];

	$: filteredData = [...queried].sort((a, b) => {
		const valA = a[sortColumn]?.toString().toLowerCase() ?? '';
		const valB = b[sortColumn]?.toString().toLowerCase() ?? '';
		if (valA < valB) return sortAscending ? -1 : 1;
		if (valA > valB) return sortAscending ? 1 : -1;
		return 0;
	});

	$: totalPages = Math.ceil(filteredData.length / itemsPerPage);

	$: paginatedItems = filteredData.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	function goToPage(page) {
		if (page >= 1 && page <= totalPages) currentPage = page;
	}

	function openEditModal(speaker) {
		editItem = { ...speaker };
		showModal = true;
	}

	function closeEditModal() {
		showModal = false;
		editItem = null;
	}

	async function saveEdit() {
		const request = {
			kalaka_id: editItem!.kalaka_id,
			name: editItem!.name,
			gender: editItem!.gender,
			age: editItem!.age,
			mobile: editItem!.mobile,
			origin: editItem!.origin,
			language: editItem!.language,
			recordings: editItem!.recordings
		};

		await axios.put(`${API_URL}/speaker/${editItem!.id}`, request);

		const speakerRes = await axios.post(`${API_URL}/speakers`);
		speakerData = speakerRes.data.filter((e: any) => e.kalaka_id === currentUser.kalaka_id);
		closeEditModal();
	}

	async function deleteItem(id) {
		if (confirm('Are you sure you want to delete this speaker?')) {
			await axios.delete(`${API_URL}/speaker/${id}`);
			speakerData = speakerData.filter((s: any) => s.id !== id);
		}
	}

	function printTable() {
		window.print();
	}
</script>

<!-- Layout -->
<div class="bg-gray-45 flex min-h-screen">
	<Sidebar role="user" />

	<!-- Main Content -->
	<div class="w-full min-w-0 flex-1 p-4 sm:p-6">
		<div class="header mb-4 flex items-center gap-3 bg-white p-4 shadow">
			<button
				type="button"
				class="text-blue-900 md:hidden"
				aria-label="Open menu"
				on:click={() => sidebarOpen.set(true)}
			>
				☰
			</button>
			<h1 class="text-xl font-bold">Speaker Profile</h1>
		</div>

		<TableControls
			rows={items}
			columns={tableColumns}
			bind:filtered={queried}
			searchPlaceholder="Search speakers..."
		>
			<Select bind:value={sortColumn} class="w-full sm:w-44">
				<option value="id">Sort: #</option>
				<option value="name">Sort: Name</option>
				<option value="gender">Sort: Gender</option>
				<option value="age">Sort: Age</option>
				<option value="mobile">Sort: Mobile</option>
				<option value="origin">Sort: Place of Origin</option>
				<option value="language">Sort: Language</option>
				<option value="recordings">Sort: Total Recordings</option>
			</Select>
			<Select bind:value={sortAscending} class="w-full sm:w-36">
				<option value={true}>Ascending</option>
				<option value={false}>Descending</option>
			</Select>
			<Button on:click={printTable} class="shrink-0 bg-gray-600 text-white">Print</Button>
		</TableControls>

		<!-- Table -->
		<div class="hidden-print overflow-x-auto rounded bg-white p-4 shadow">
			<Table>
				<TableHead>
					<TableHeadCell>#</TableHeadCell>
					<TableHeadCell>Action</TableHeadCell>
					<TableHeadCell>Name</TableHeadCell>
					<TableHeadCell>Gender</TableHeadCell>
					<TableHeadCell>Age</TableHeadCell>
					<TableHeadCell>Mobile</TableHeadCell>
					<TableHeadCell>Place of Origin</TableHeadCell>
					<TableHeadCell>Language</TableHeadCell>
					<TableHeadCell>Total Recordings</TableHeadCell>
				</TableHead>
				<TableBody>
					{#each paginatedItems as speaker, i}
						<TableBodyRow>
							<TableBodyCell>{(currentPage - 1) * itemsPerPage + i + 1}</TableBodyCell>
							<TableBodyCell>
								<div class="flex gap-2">
									<Button size="xs" color="blue" on:click={() => openEditModal(speaker)}
										>Edit</Button
									>
									<Button size="xs" color="red" on:click={() => deleteItem(speaker.id)}
										>Delete</Button
									>
								</div>
							</TableBodyCell>
							<TableBodyCell>{speaker.name}</TableBodyCell>
							<TableBodyCell>{speaker.gender}</TableBodyCell>
							<TableBodyCell>{speaker.age}</TableBodyCell>
							<TableBodyCell>{speaker.mobile}</TableBodyCell>
							<TableBodyCell>{speaker.origin}</TableBodyCell>
							<TableBodyCell>{speaker.language}</TableBodyCell>
							<TableBodyCell>{speaker.recordings}</TableBodyCell>
						</TableBodyRow>
					{/each}
				</TableBody>
			</Table>
		</div>

		<!-- Print Table -->
		<table class="print-only min-w-full table-auto border-collapse border">
			<thead class="bg-gray-200">
				<tr>
					<th class="border px-4 py-2">No</th>
					<th class="border px-4 py-2">Name</th>
					<th class="border px-4 py-2">Gender</th>
					<th class="border px-4 py-2">Age</th>
					<th class="border px-4 py-2">Mobile</th>
					<th class="border px-4 py-2">Place of Origin</th>
					<th class="border px-4 py-2">Language</th>
					<th class="border px-4 py-2">Total Recordings</th>
				</tr>
			</thead>
			<tbody>
				{#each filteredData as speaker, index}
					<tr class="hover:bg-gray-100">
						<td class="border px-4 py-2">{index + 1}</td>
						<td class="border px-4 py-2">{speaker.name}</td>
						<td class="border px-4 py-2">{speaker.gender}</td>
						<td class="border px-4 py-2">{speaker.age}</td>
						<td class="border px-4 py-2">{speaker.mobile}</td>
						<td class="border px-4 py-2">{speaker.origin}</td>
						<td class="border px-4 py-2">{speaker.language}</td>
						<td class="border px-4 py-2">{speaker.recordings}</td>
					</tr>
				{/each}
			</tbody>
		</table>

		<!-- Pagination -->
		<div class="hidden-print mt-4 flex flex-wrap items-center gap-2">
			<button
				on:click={() => goToPage(currentPage - 1)}
				disabled={currentPage === 1}
				class="rounded bg-gray-300 px-3 py-1 disabled:opacity-50">Previous</button
			>
			{#if currentPage > 2}<button
					on:click={() => goToPage(1)}
					class="rounded border bg-white px-3 py-1 font-semibold">1</button
				>{/if}
			{#if currentPage > 3}<span class="px-2 text-gray-500">...</span>{/if}
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
			{#if currentPage < totalPages - 2}<span class="px-2 text-gray-500">...</span>{/if}
			{#if currentPage < totalPages - 1}<button
					on:click={() => goToPage(totalPages)}
					class="rounded border bg-white px-3 py-1 font-semibold">{totalPages}</button
				>{/if}
			<button
				on:click={() => goToPage(currentPage + 1)}
				disabled={currentPage === totalPages}
				class="rounded bg-gray-300 px-3 py-1 disabled:opacity-50">Next</button
			>
		</div>
	</div>
</div>

<!-- Edit Modal -->
{#if showModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
		<div class="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow-lg">
			<h2 class="mb-4 text-xl font-semibold">Edit Speaker</h2>
			<div class="space-y-4">
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<label class="block">
						<span class="text-gray-700">Name</span>
						<input class="w-full rounded border px-3 py-2" bind:value={editItem.name} />
					</label>
					<label class="block">
						<span class="text-gray-700">Gender</span>
						<input class="w-full rounded border px-3 py-2" bind:value={editItem.gender} />
					</label>
					<label class="block">
						<span class="text-gray-700">Age</span>
						<input
							class="w-full rounded border px-3 py-2"
							type="number"
							bind:value={editItem.age}
						/>
					</label>
					<label class="block">
						<span class="text-gray-700">Mobile</span>
						<input class="w-full rounded border px-3 py-2" bind:value={editItem.mobile} />
					</label>
					<label class="block">
						<span class="text-gray-700">Place of Origin</span>
						<input class="w-full rounded border px-3 py-2" bind:value={editItem.origin} />
					</label>
					<label class="block">
						<span class="text-gray-700">Language</span>
						<input class="w-full rounded border px-3 py-2" bind:value={editItem.language} />
					</label>
					<label class="block">
						<span class="text-gray-700">Total Recordings</span>
						<input
							class="w-full rounded border px-3 py-2"
							type="number"
							disabled
							bind:value={editItem.recordings}
						/>
					</label>
				</div>
			</div>
			<div class="mt-4 flex justify-end gap-2">
				<Button color="gray" on:click={closeEditModal}>Cancel</Button>
				<Button color="blue" on:click={saveEdit}>Save</Button>
			</div>
		</div>
	</div>
{/if}

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
		.header,
		.searchfilter,
		.hidden-print,
		.pagination-controls,
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
