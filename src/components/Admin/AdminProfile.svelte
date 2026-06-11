<script>
	import { onMount } from 'svelte';
	import { getSession } from '$lib/auth.ts';
	import axios from 'axios';
	import Sidebar from '../Sidebar.svelte';
	import { sidebarOpen } from '$lib/stores/sidebar.js';

	const API_URL = import.meta.env.VITE_API_BASE_URL;

	let currentUser = null;
	let newPassword = '';
	let confirmPassword = '';
	let profileMessage = '';
	let passwordMessage = '';

	onMount(async () => {
		const session = await getSession();
		currentUser = session?.user ?? {};
	});

	async function saveProfile() {
		profileMessage = '';
		try {
			await axios.put(`${API_URL}/user/${currentUser.id}`, {
				full_name: currentUser.full_name,
				email: currentUser.email
			});
			profileMessage = 'Profile updated!';
		} catch (err) {
			profileMessage = err.response?.data?.message || 'Failed to update profile.';
		}
	}

	async function changePassword() {
		passwordMessage = '';
		if (!newPassword || !confirmPassword) {
			passwordMessage = 'Please fill in both fields.';
			return;
		}
		if (newPassword !== confirmPassword) {
			passwordMessage = 'Passwords do not match.';
			return;
		}
		try {
			await axios.put(`${API_URL}/user/${currentUser.id}/password`, {
				new_password: newPassword
			});
			passwordMessage = 'Password changed successfully!';
			newPassword = '';
			confirmPassword = '';
		} catch (err) {
			passwordMessage = err.response?.data?.message || 'Failed to change password.';
		}
	}
</script>

<div class="flex min-h-screen bg-gray-50">
	<Sidebar role="admin" />

	<!-- Main Content -->
	<div class="w-full min-w-0 flex-1 p-4 sm:p-6">
		<div class="mb-4 flex items-center gap-3 bg-white p-4 shadow">
			<button
				type="button"
				class="text-blue-900 md:hidden"
				aria-label="Open menu"
				on:click={() => sidebarOpen.set(true)}
			>
				☰
			</button>
			<h1 class="text-xl font-bold">Admin Profile</h1>
		</div>

		{#if currentUser}
			<div class="flex justify-center p-4 sm:p-8">
				<div class="flex w-full max-w-6xl flex-col gap-6 md:flex-row">
					<!-- Profile Section -->
					<div class="w-full space-y-6 rounded-lg bg-white p-6 shadow-lg md:w-1/2">
						<h2 class="text-center text-2xl font-bold">Admin Profile</h2>

						<div class="space-y-4">
							<div>
								<label for="uid" class="mb-1 block text-sm font-medium text-gray-700">UID</label>
								<input
									id="uid"
									type="text"
									value={currentUser.uid}
									class="w-full rounded-lg border border-gray-300 bg-gray-200 px-4 py-2"
									disabled
								/>
							</div>

							<div>
								<label for="fullName" class="mb-1 block text-sm font-medium text-gray-700"
									>Full Name</label
								>
								<input
									id="fullName"
									type="text"
									bind:value={currentUser.full_name}
									class="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none"
								/>
							</div>

							<div>
								<label for="email" class="mb-1 block text-sm font-medium text-gray-700">Email</label
								>
								<input
									id="email"
									type="email"
									value={currentUser.email}
									class="w-full rounded-lg border border-gray-300 bg-gray-200 px-4 py-2"
									disabled
								/>
							</div>

							{#if profileMessage}
								<p
									class="text-sm {profileMessage.includes('updated')
										? 'text-green-600'
										: 'text-red-500'}"
								>
									{profileMessage}
								</p>
							{/if}

							<div class="flex justify-end pt-4">
								<button
									on:click={saveProfile}
									class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
									>Save Profile</button
								>
							</div>
						</div>
					</div>

					<!-- Change Password Section -->
					<div class="w-full space-y-6 rounded-lg bg-white p-6 shadow-lg md:w-1/2">
						<h3 class="text-center text-2xl font-bold">Change Password</h3>

						<div class="space-y-4">
							<div>
								<label for="newPassword" class="mb-1 block text-sm font-medium text-gray-700"
									>New Password</label
								>
								<input
									id="newPassword"
									type="password"
									bind:value={newPassword}
									class="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none"
								/>
							</div>

							<div>
								<label for="confirmPassword" class="mb-1 block text-sm font-medium text-gray-700"
									>Confirm New Password</label
								>
								<input
									id="confirmPassword"
									type="password"
									bind:value={confirmPassword}
									class="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none"
								/>
							</div>

							{#if passwordMessage}
								<p
									class="text-sm {passwordMessage.includes('successfully')
										? 'text-green-600'
										: 'text-red-500'}"
								>
									{passwordMessage}
								</p>
							{/if}
						</div>

						<div class="flex justify-end pt-4">
							<button
								on:click={changePassword}
								class="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
								>Change Password</button
							>
						</div>
					</div>
				</div>
			</div>
		{:else}
			<div class="p-10 text-center">Loading profile...</div>
		{/if}
	</div>
</div>
