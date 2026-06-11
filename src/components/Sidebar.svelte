<script lang="ts">
	import { sidebarOpen } from '$lib/stores/sidebar.js';

	/** Which navigation set to render. */
	export let role: 'user' | 'admin' = 'user';

	type NavLink = { href: string; label: string };

	const userLinks: NavLink[] = [
		{ href: '/Dashboard', label: 'Home' },
		{ href: '/Speech_Data', label: 'Speech Data' },
		{ href: '/Speaker_Profile', label: 'Speaker Profile' },
		{ href: '/Add_Speaker', label: 'Add New Speaker' },
		{ href: '/Add_New_Speech', label: 'Add New Speech' },
		{ href: '/Contact_Us', label: 'Contact Us' },
		{ href: '/Kalaka_User_Manual.pdf', label: 'User Guide' },
		{ href: '/Profile', label: 'Profile' },
		{ href: '/Logout', label: 'Logout' }
	];

	const adminLinks: NavLink[] = [
		{ href: '/AdminDashboard', label: 'Home' },
		{ href: '/AdminLanguageStatistic', label: 'Speaker Statistics' },
		{ href: '/AdminAddWord', label: 'Add New Word' },
		{ href: '/AdminAddQuiz', label: 'Add New Quiz' },
		{ href: '/AdminUserManagement', label: 'User Management' },
		{ href: '/AdminSpeechData', label: 'Speech Data' },
		{ href: '/AdminSpeakerProfile', label: 'Speaker Profile' },
		{ href: '/AdminAddSpeaker', label: 'Add New Speaker' },
		{ href: '/AdminAddSpeech', label: 'Add New Speech' },
		{ href: '/Kalaka_Admin_Manual.pdf', label: 'Admin Guide' },
		{ href: '/AdminProfile', label: 'Profile' },
		{ href: '/Logout', label: 'Logout' }
	];

	$: links = role === 'admin' ? adminLinks : userLinks;
	$: title = role === 'admin' ? 'Admin Dashboard' : 'User Dashboard';

	function close() {
		sidebarOpen.set(false);
	}
</script>

<!-- Backdrop: only on mobile, only while the drawer is open -->
{#if $sidebarOpen}
	<button
		type="button"
		aria-label="Close menu"
		class="fixed inset-0 z-30 bg-black/50 md:hidden"
		on:click={close}
	></button>
{/if}

<aside
	class="sidebar fixed inset-y-0 left-0 z-40 w-56 transform space-y-6 overflow-y-auto bg-blue-900 p-5 text-white transition-transform duration-300 md:static md:z-auto md:translate-x-0 {$sidebarOpen
		? 'translate-x-0'
		: '-translate-x-full'}"
>
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-bold">{title}</h2>
		<button type="button" class="text-white md:hidden" aria-label="Close menu" on:click={close}>
			✖
		</button>
	</div>

	<nav class="space-y-2">
		{#each links as link}
			<a href={link.href} on:click={close} class="block rounded px-4 py-2 hover:bg-blue-700">
				{link.label}
			</a>
		{/each}
	</nav>
</aside>

<style>
	@media print {
		.sidebar {
			display: none !important;
		}
	}
</style>
