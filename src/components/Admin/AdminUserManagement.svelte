<script lang="ts">
	import axios from 'axios';
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
	import { onMount } from 'svelte';
	import { getSession } from '$lib/auth.ts';

	const API_URL = import.meta.env.VITE_API_BASE_URL;
	let speakerData: Record<string, any>[] = [];
	let usersData: Record<string, any>[] = [];
	let searchQuery = '';
	let sortColumn = 'id';
	let sortDirection = 'asc';
	let currentPage = 1;
	const itemsPerPage = 10;
	let mergedData = [];
	let filteredData = [];
	let currentUserId: number | null = null;

	let showModal = false;
	let showAddModal = false;
	let editItem = null;
	let isLoading = false;
	let error = null;

	let newUser = { full_name: '', email: '', password: '' };
	let addError = '';

	onMount(async () => {
		try {
			const [speakerRes, userRes, session] = await Promise.all([
				axios.post(`${API_URL}/speakers`),
				axios.post(`${API_URL}/users`),
				getSession()
			]);
			speakerData = speakerRes.data;
			usersData = userRes.data;
			currentUserId = session?.user?.id ?? null;
		} catch (err) {
			error = err.response?.data?.message || err.message;
			console.error('Error fetching data:', err);
		} finally {
			isLoading = false;
		}
	});

	async function refreshUsers() {
		const [speakerRes, userRes] = await Promise.all([
			axios.post(`${API_URL}/speakers`),
			axios.post(`${API_URL}/users`)
		]);
		speakerData = speakerRes.data;
		usersData = userRes.data;
	}

	// Merge speaker and user data by kalaka_id
	$: {
		mergedData = usersData.map((user) => {
			const speaker = speakerData.find((s) => s.kalaka_id === user.kalaka_id);
			return {
				...user,
				...speaker,
				name: user.full_name,
				origin: speaker?.origin || 'Unknown',
				recordings: speaker?.recordings || 0
			};
		});
	}

	$: filteredData = mergedData
		.filter((item) =>
			Object.values(item).some((value) =>
				String(value).toLowerCase().includes(searchQuery.toLowerCase())
			)
		)
		.sort((a, b) => {
			if (!sortColumn) return 0;
			const valA = a[sortColumn] ?? '';
			const valB = b[sortColumn] ?? '';
			if (sortDirection === 'asc') return valA > valB ? 1 : -1;
			else return valA < valB ? 1 : -1;
		});

	$: totalPages = Math.ceil(filteredData.length / itemsPerPage);
	$: paginatedData = filteredData.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	function goToPage(page) {
		if (page >= 1 && page <= totalPages) currentPage = page;
	}

	function printTable() {
		window.print();
	}

	function openEditModal(item) {
		editItem = { ...item };
		showModal = true;
	}

	function closeEditModal() {
		showModal = false;
		editItem = null;
	}

	function openAddModal() {
		newUser = { full_name: '', email: '', password: '' };
		addError = '';
		showAddModal = true;
	}

	function closeAddModal() {
		showAddModal = false;
		addError = '';
	}

	async function saveEdit() {
		await axios.put(`${API_URL}/user/${editItem.id}`, {
			full_name: editItem.name,
			email: editItem.email
		});
		await refreshUsers();
		closeEditModal();
	}

	async function addUser() {
		addError = '';
		try {
			await axios.post(`${API_URL}/user`, {
				full_name: newUser.full_name,
				email: newUser.email,
				password: newUser.password
			});
			await refreshUsers();
			closeAddModal();
		} catch (err) {
			addError = err.response?.data?.message || 'Failed to add user.';
		}
	}

	async function toggleRole(item) {
		const newRole = item.role === 'Admin' ? 'User' : 'Admin';
		const label = newRole === 'Admin' ? 'make this user an Admin' : 'revoke Admin from this user';
		if (!confirm(`Are you sure you want to ${label}?`)) return;
		await axios.put(`${API_URL}/user/${item.id}/role`, { role: newRole });
		usersData = usersData.map((u) => (u.id === item.id ? { ...u, role: newRole } : u));
	}

	async function deleteItem(id) {
		if (confirm('Are you sure you want to delete this user?')) {
			await axios.delete(`${API_URL}/user/${id}`);
			usersData = usersData.filter((u: any) => u.id !== id);
		}
	}
</script>

<div class="bg-gray-45 flex min-h-screen">
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

	<div class="flex-1 p-6">
		<div class="header mb-4 flex items-center justify-between bg-white p-4 shadow">
			<h1 class="text-xl font-bold">User Management</h1>
			<Button on:click={openAddModal} class="bg-blue-600 text-white">+ Add User</Button>
		</div>

		<div class="searchfilter mb-4 flex gap-4">
			<Input
				type="text"
				placeholder="Search by name, email, etc."
				bind:value={searchQuery}
				class="w-1/3"
			/>
			<Select bind:value={sortDirection} class="w-1/6">
				<option value="asc">Ascending</option>
				<option value="desc">Descending</option>
			</Select>
			<Select bind:value={sortColumn} class="w-1/4">
				<option value="id">#</option>
				<option value="kalaka_id">User ID</option>
				<option value="name">Name</option>
				<option value="email">Email</option>
				<option value="created_at">Created Date</option>
			</Select>
			<Button on:click={printTable} class="bg-gray-500 text-white">Print</Button>
		</div>

		<!-- User Table -->
		<div class="hidden-print rounded bg-white p-4 shadow">
			<Table>
				<TableHead>
					<TableHeadCell>No</TableHeadCell>
					<TableHeadCell>User ID</TableHeadCell>
					<TableHeadCell>Name</TableHeadCell>
					<TableHeadCell>Email</TableHeadCell>
					<TableHeadCell>Role</TableHeadCell>
					<TableHeadCell>Created At</TableHeadCell>
					<TableHeadCell>Action</TableHeadCell>
				</TableHead>
				<TableBody>
					{#each paginatedData as item, index}
						<TableBodyRow>
							<TableBodyCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableBodyCell>
							<TableBodyCell>{item.kalaka_id}</TableBodyCell>
							<TableBodyCell>{item.name}</TableBodyCell>
							<TableBodyCell>{item.email}</TableBodyCell>
							<TableBodyCell>
								<span
									class="rounded px-2 py-1 text-xs font-semibold {item.role === 'Admin'
										? 'bg-purple-100 text-purple-700'
										: 'bg-gray-100 text-gray-600'}"
								>
									{item.role ?? 'User'}
								</span>
							</TableBodyCell>
							<TableBodyCell>{item.created_at}</TableBodyCell>
							<TableBodyCell>
								<div class="flex gap-2">
									<Button size="xs" color="blue" on:click={() => openEditModal(item)}>Edit</Button>
									{#if item.id !== currentUserId && item.name !== 'Admin'}
										<Button
											size="xs"
											color={item.role === 'Admin' ? 'yellow' : 'purple'}
											on:click={() => toggleRole(item)}
										>
											{item.role === 'Admin' ? 'Revoke Admin' : 'Make Admin'}
										</Button>
										<Button size="xs" color="red" on:click={() => deleteItem(item.id)}
											>Delete</Button
										>
									{/if}
								</div>
							</TableBodyCell>
						</TableBodyRow>
					{/each}
				</TableBody>
			</Table>
		</div>

		<!-- Print Table -->
		<table class="print-only min-w-full table-auto border-collapse border">
			<thead class="bg-gray-200">
				<tr>
					<th class="border px-4 py-2 text-left">No</th>
					<th class="border px-4 py-2 text-left">User ID</th>
					<th class="border px-4 py-2 text-left">Name</th>
					<th class="border px-4 py-2 text-left">Email</th>
					<th class="border px-4 py-2 text-left">Role</th>
					<th class="border px-4 py-2 text-left">Created At</th>
				</tr>
			</thead>
			<tbody>
				{#each filteredData as item, index}
					<tr class="hover:bg-gray-100">
						<td class="border px-4 py-2">{index + 1}</td>
						<td class="border px-4 py-2">{item.kalaka_id}</td>
						<td class="border px-4 py-2">{item.name}</td>
						<td class="border px-4 py-2">{item.email}</td>
						<td class="border px-4 py-2">{item.role ?? 'User'}</td>
						<td class="border px-4 py-2">{item.created_at}</td>
					</tr>
				{/each}
			</tbody>
		</table>

		<div class="pagination-controls hidden-print mt-4 flex flex-wrap items-center gap-2">
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
			<h2 class="mb-4 text-xl font-semibold">Edit User</h2>
			<div class="space-y-2">
				<label class="block">
					<span class="text-gray-700">UID</span>
					<input
						class="w-full rounded border bg-gray-200 px-3 py-2"
						bind:value={editItem.uid}
						disabled
					/>
				</label>
				<label class="block">
					<span class="text-gray-700">User ID</span>
					<input
						class="w-full rounded border bg-gray-200 px-3 py-2"
						bind:value={editItem.kalaka_id}
						disabled
					/>
				</label>
				<label class="block">
					<span class="text-gray-700">User Name</span>
					<input class="w-full rounded border px-3 py-2" bind:value={editItem.name} />
				</label>
				<label class="block">
					<span class="text-gray-700">Email</span>
					<input
						class="w-full rounded border bg-gray-200 px-3 py-2"
						bind:value={editItem.email}
						disabled
					/>
				</label>
				<label class="block">
					<span class="text-gray-700">Account Created</span>
					<input
						class="w-full rounded border bg-gray-200 px-3 py-2"
						bind:value={editItem.created_at}
						disabled
					/>
				</label>
				<label class="block">
					<span class="text-gray-700">Origin</span>
					<input
						class="w-full rounded border bg-gray-200 px-3 py-2"
						bind:value={editItem.origin}
						disabled
					/>
				</label>
				<label class="block">
					<span class="text-gray-700">Recordings</span>
					<input
						class="w-full rounded border bg-gray-200 px-3 py-2"
						bind:value={editItem.recordings}
						disabled
					/>
				</label>
			</div>
			<div class="flex justify-end gap-2 pt-4">
				<Button on:click={closeEditModal} class="bg-gray-300">Cancel</Button>
				<Button on:click={saveEdit} class="bg-blue-500 text-white">Update</Button>
			</div>
		</div>
	</div>
{/if}

<!-- Add User Modal -->
{#if showAddModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
		<div class="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow-lg">
			<h2 class="mb-4 text-xl font-semibold">Add New User</h2>
			{#if addError}
				<p class="text-sm text-red-500">{addError}</p>
			{/if}
			<div class="space-y-2">
				<label class="block">
					<span class="text-gray-700">Full Name</span>
					<input class="w-full rounded border px-3 py-2" bind:value={newUser.full_name} />
				</label>
				<label class="block">
					<span class="text-gray-700">Email</span>
					<input
						class="w-full rounded border px-3 py-2"
						type="email"
						bind:value={newUser.email}
					/>
				</label>
				<label class="block">
					<span class="text-gray-700">Password</span>
					<input
						class="w-full rounded border px-3 py-2"
						type="password"
						bind:value={newUser.password}
					/>
				</label>
			</div>
			<div class="flex justify-end gap-2 pt-4">
				<Button on:click={closeAddModal} class="bg-gray-300">Cancel</Button>
				<Button on:click={addUser} class="bg-blue-500 text-white">Add User</Button>
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
		.sidebar,
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
