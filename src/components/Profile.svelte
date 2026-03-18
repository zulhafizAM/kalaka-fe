<script lang="ts">
	import { onMount } from 'svelte';
	import { getSession } from '$lib/auth.ts';
	import axios from 'axios';

	const API_URL = import.meta.env.VITE_API_BASE_URL;

	let currentUser: Record<string, any> = {};
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
		} catch (err: any) {
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
		} catch (err: any) {
			passwordMessage = err.response?.data?.message || 'Failed to change password.';
		}
	}
</script>

<div class="flex min-h-screen bg-gray-50">
	<!-- Sidebar -->
	<div class="w-56 space-y-6 bg-blue-900 p-5 text-white">
		<h2 class="text-2xl font-bold">Dashboard</h2>
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
	<div class="flex-1 p-6">
		<div class="mb-4 flex items-center justify-between bg-white p-4 shadow">
			<h1 class="text-xl font-bold">Profile</h1>
		</div>

		{#if currentUser}
			<div class="flex justify-center p-8">
				<div class="flex w-full max-w-6xl gap-6">
					<!-- Profile Section -->
					<div class="w-1/2 space-y-6 rounded-lg bg-white p-6 shadow-lg">
						<h2 class="text-center text-2xl font-bold">Profile</h2>

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
									bind:value={currentUser.email}
									class="w-full rounded-lg border border-gray-300 px-4 py-2"
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
					<div class="w-1/2 space-y-6 rounded-lg bg-white p-6 shadow-lg">
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
