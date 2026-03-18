<script>
	import { onMount } from 'svelte';
	import { getSession } from '$lib/auth.ts';

	let isSidebarOpen = true;
	let fullName = '';

	onMount(async () => {
		const session = await getSession();
		fullName = session?.user?.full_name || '';
	});

	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
	}
</script>

<div class="flex h-screen bg-gray-100">
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

	<div class="flex min-h-screen flex-1 flex-col p-6">
		<div class="flex items-center justify-between bg-white p-4 shadow">
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
