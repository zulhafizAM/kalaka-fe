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
	import Sidebar from '../Sidebar.svelte';
	import TableControls from '../TableControls.svelte';
	import { sidebarOpen } from '$lib/stores/sidebar.js';

	const API_URL = import.meta.env.VITE_API_BASE_URL;
	let speakerData: Record<string, any>[] = [];
	let usersData: Record<string, any>[] = [];
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
				// Mirror the rendered fallback so search/filter match what's on screen.
				role: user.role ?? 'User',
				origin: speaker?.origin || 'Unknown',
				recordings: speaker?.recordings || 0
			};
		});
	}

	// Columns exposed to the dynamic search/filter toolbar.
	const tableColumns = [
		{ key: 'kalaka_id', label: 'User ID' },
		{ key: 'name', label: 'Name' },
		{ key: 'email', label: 'Email' },
		{ key: 'role', label: 'Role' },
		{ key: 'origin', label: 'Origin' },
		{ key: 'recordings', label: 'Recordings' },
		{ key: 'created_at', label: 'Created At' }
	];

	/** Rows after search + filters; sorting is applied on top. */
	let queried = [];

	$: filteredData = [...queried].sort((a, b) => {
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
	<Sidebar role="admin" />

	<div class="w-full min-w-0 flex-1 p-4 sm:p-6">
		<div class="header mb-4 flex items-center justify-between gap-3 bg-white p-4 shadow">
			<div class="flex items-center gap-3">
				<button
					type="button"
					class="text-blue-900 md:hidden"
					aria-label="Open menu"
					on:click={() => sidebarOpen.set(true)}
				>
					☰
				</button>
				<h1 class="text-xl font-bold">User Management</h1>
			</div>
			<Button on:click={openAddModal} class="bg-blue-600 text-white">+ Add User</Button>
		</div>

		<TableControls
			rows={mergedData}
			columns={tableColumns}
			bind:filtered={queried}
			searchPlaceholder="Search users..."
		>
			<Select bind:value={sortColumn} class="w-full sm:w-44">
				<option value="id">Sort: #</option>
				<option value="kalaka_id">Sort: User ID</option>
				<option value="name">Sort: Name</option>
				<option value="email">Sort: Email</option>
				<option value="role">Sort: Role</option>
				<option value="created_at">Sort: Created Date</option>
			</Select>
			<Select bind:value={sortDirection} class="w-full sm:w-36">
				<option value="asc">Ascending</option>
				<option value="desc">Descending</option>
			</Select>
			<Button on:click={printTable} class="shrink-0 bg-gray-500 text-white">Print</Button>
		</TableControls>

		<!-- User Table -->
		<div class="hidden-print overflow-x-auto rounded bg-white p-4 shadow">
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
