<script>
	import { onMount } from 'svelte';
	import { getSession } from '$lib/auth.ts';
	import Sidebar from './Sidebar.svelte';
	import { sidebarOpen } from '$lib/stores/sidebar.js';

	let fullName = '';

	onMount(async () => {
		const session = await getSession();
		fullName = session?.user?.full_name || '';
	});
</script>

<div class="flex min-h-screen bg-gray-100">
	<Sidebar role="user" />

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
			<h1 class="text-xl font-bold">Contact Us</h1>
		</div>

		<div
			class="max-w-8xl mx-auto mt-6 flex w-full flex-col space-y-6 rounded-lg bg-white p-6 shadow"
		>
			<p class="text-lg">
				Having problems? Need help? Please <strong class="text-red-600">contact</strong> the project
				manager via <strong class="text-red-600">email</strong> given below.
			</p>

			<div class="flex flex-col rounded-lg bg-gray-50 p-6 shadow md:flex-row">
				<img
					src="http://www.w3schools.com/howto/img_avatar2.png"
					alt="Profile Picture"
					class="mx-auto h-32 w-32 rounded-full md:mx-0 md:mr-6"
				/>
				<div class="flex flex-col justify-center">
					<h2 class="border-b pb-2 text-2xl font-semibold">Dr Sarah Samson Juan</h2>
					<p class="mt-2"><i class="fa fa-envelope mr-2"></i> sjsflora@unimas.my</p>
				</div>
			</div>
		</div>
	</div>
</div>
