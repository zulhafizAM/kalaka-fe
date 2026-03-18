<script lang="ts">
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
		Select,
		Pagination,
		Modal
	} from 'flowbite-svelte';
	import axios from 'axios';
	import { diarizeAudio } from '$lib/api.js';

	// import { speechData } from '../../backend/speech.js';
	const API_URL = import.meta.env.VITE_API_BASE_URL;
	const PYTHON_URL = import.meta.env.VITE_API_PYTHON_URL;
	let speechData = [];
	let isLoading = false;
	let error = null;
	let isSidebarOpen = true;
	let items = [];
	let searchTerm = '';
	let sortColumn = 'id';
	let sortAscending = true;
	let currentPage = 1;
	let itemsPerPage = 5;
	let totalItems = items.length;
	let showEditModal = false;
	let currentEditItem = null;

	// Audio Player (unchanged)
	let play = false;
	let time = 0;
	let progress = 0;
	let currentTime = 0;
	let audioPlayer: HTMLAudioElement;
	let loading = false;
	let diarized = false;

	// Initialize edit form data structure
	let editForm = {
		id: '',
		speaker_name: '',
		num_speakers: '',
		contact_no: '',
		origin: '',
		language: '',
		category: '',
		recordfile: '',
		rttm: '',
		textcontent: '',
		textgrid_url: '',
		recorded_date: '',
		kalaka_id: '',
		public: ''
	};
	async function handleDiarize(audioSrc, audio) {
		loading = true;
		error = null;
		try {
			console.log(1);
			const response = await fetch(audioSrc);
			console.log(2);
			console.log(response);
			if (!response.ok) throw new Error('Failed to fetch audio');

			const audioBlob = await response.blob();
			console.log('Fetched type:', audioBlob.type); // e.g. "audio/wav"
			// Use correct extension/type
			const ext = audioBlob.type.split('/')[1] || 'wav';
			const audioFile = new File([audioBlob], `audio.${ext}`, { type: audioBlob.type });

			const imageBlob = await diarizeAudio(audioFile);

			const uploadRTTMRequest = {
				name: audio.speaker_name,
				category: audio.category,
				date: audio.recorded_date,
				kalaka_id: audio.kalaka_id,
				language: audio.language,
				mobile: audio.contact_no,
				origin: audio.origin,
				recordfile: audio.recordfile,
				textgrid: audio.textgrid_url,
				rttm: imageBlob.rttm_url,
				textcontent: audio.textcontent,
				speakerno: audio.num_speakers,
				public: audio.public
			};

			await axios.put(`${API_URL}/speech/${audio.id}`, uploadRTTMRequest);

			editForm.rttm = imageBlob.rttm_url;

			const speechRes = await axios.post(`${API_URL}/speeches`);
			speechData = speechRes.data;

			diarized = true;
		} catch (err) {
			error = err.message;
			console.error('Diarization error:', err);
		} finally {
			loading = false;
		}
	}
	// Shared Functions
	function padTime(no: number) {
		return Math.floor(no).toString().padStart(2, '0');
	}

	function getTime(duration: number) {
		const minute = Math.floor(duration / 60);
		const second = duration % 60;
		return { minutes: padTime(minute), seconds: padTime(second) };
	}

	function updateProgress() {
		progress = (currentTime / time) * 100;
		if (progress >= 100) {
			audioPlayer.load();
			play = false;
		}
	}

	$: {
		currentTime;
		updateProgress();
	}

	function handleMetadata() {
		time = audioPlayer.duration || 0;
		currentTime = audioPlayer.currentTime;
	}

	async function load() {
		loading = false;
		diarized = true;
	}

	async function delay(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	onMount(async () => {
		try {
			// Fetch all needed data in parallel
			const [speechRes] = await Promise.all([axios.post(`${API_URL}/speeches`)]);

			speechData = speechRes.data;
		} catch (err) {
			error = err.response?.data?.message || err.message;
			console.error('Error fetching data:', err);
		} finally {
			isLoading = false;
		}
	});
	$: {
		items = speechData.map((item) => ({
			id: item.id,
			speaker_name: item.name,
			num_speakers: item.speakerno,
			contact_no: item.mobile,
			origin: item.origin,
			language: item.language,
			category: item.category,
			recordfile: item.recordfile,
			textgrid_url: item.textgrid,
			rttm: item.rttm,
			recorded_date: item.date,
			kalaka_id: item.kalaka_id,
			public: item.public,
			textcontent: item.textcontent
		}));
		sortTable();
	}

	$: filteredData = items.filter((file) =>
		file.speaker_name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	$: totalItems = filteredData.length;

	$: paginatedItems = filteredData.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	$: if (searchTerm !== undefined) currentPage = 1;

	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
	}

	function playAudio(audioUrl) {
		new Audio(audioUrl).play();
	}

	function sortTable() {
		items = [...items].sort((a, b) => {
			if (a[sortColumn] < b[sortColumn]) return sortAscending ? -1 : 1;
			if (a[sortColumn] > b[sortColumn]) return sortAscending ? 1 : -1;
			return 0;
		});
	}

	function printTable() {
		window.print();
	}

	function changePage(page) {
		currentPage = page;
	}

	// Open edit modal with item data
	function openEditModal(item) {
		currentEditItem = item;
		editForm = {
			id: item.id,
			speaker_name: item.speaker_name,
			num_speakers: item.num_speakers,
			contact_no: item.contact_no,
			origin: item.origin,
			language: item.language,
			category: item.category,
			recordfile: item.recordfile,
			rttm: item.rttm,
			textcontent: item.textcontent,
			textgrid_url: item.textgrid_url,
			recorded_date: item.recorded_date,
			kalaka_id: item.kalaka_id,
			public: item.public
		};
		showEditModal = true;
	}

	// Close edit modal
	function closeEditModal() {
		diarized = false;
		showEditModal = false;
		currentEditItem = null;
	}

	// Save edited data
	async function saveEdit() {
		const uploadRTTMRequest = {
			name: editForm.speaker_name,
			category: editForm.category,
			date: editForm.recorded_date,
			kalaka_id: editForm.kalaka_id,
			language: editForm.language,
			mobile: editForm.contact_no,
			origin: editForm.origin,
			recordfile: editForm.recordfile,
			textgrid: editForm.textgrid_url,
			rttm: editForm.rttm,
			textcontent: editForm.textcontent,
			speakerno: editForm.num_speakers,
			public: editForm.public
		};

		await axios.put(`${API_URL}/speech/${editForm.id}`, uploadRTTMRequest);

		const speechRes = await axios.post(`${API_URL}/speeches`);
		speechData = speechRes.data;

		closeEditModal();
	}

	// Delete item
	async function deleteItem(id) {
		if (confirm('Are you sure you want to delete this record?')) {
			await axios.delete(`${API_URL}/speech/${id}`);
			speechData = speechData.filter((item) => item.id !== id);
			// Adjust page if needed
			if (items.length <= (currentPage - 1) * itemsPerPage && currentPage > 1) {
				currentPage--;
			}
		}
	}
</script>

<div class="flex min-h-screen bg-gray-100">
	<!-- Sidebar (unchanged) -->
	<div
		class={`w-56 space-y-6 bg-blue-900 p-5 text-white transition-transform duration-300
        ${isSidebarOpen ? 'block' : '-translate-x-64 md:translate-x-0'}`}
	>
		<div class="flex items-center justify-between">
			<h2 class="text-2xl font-bold">Admin Dashboard</h2>
			<button class="text-white md:hidden" on:click={toggleSidebar}>✖</button>
		</div>
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
	<div
		class="flex w-[calc(100vw-250px)] min-w-[calc(100vw-250px)] max-w-[calc(100vw-250px)] flex-1 flex-col p-6"
	>
		<div class="flex items-center justify-between bg-white p-4 shadow">
			<button class="text-blue-900 md:hidden" on:click={toggleSidebar}>☰</button>
			<h1 class="text-xl font-bold">Speech Data</h1>
		</div>

		<div class="mb-4 flex gap-4">
			<Input
				type="text"
				placeholder="Search by speaker name"
				bind:value={searchTerm}
				class="w-full sm:w-1/4"
			/>
			<Select bind:value={sortColumn} on:change={sortTable} class="w-full sm:w-1/4">
				<option value="id">#</option>
				<option value="speaker_name">Speaker Name</option>
				<option value="num_speakers">No. of Speakers</option>
				<option value="contact_no">Contact No</option>
				<option value="origin">Origin</option>
				<option value="language">Language</option>
				<option value="category">Category</option>
				<option value="recorded_date">Recorded Date</option>
			</Select>
			<Select bind:value={sortAscending} on:change={sortTable} class="w-full sm:w-1/4">
				<option value={true}>Ascending</option>
				<option value={false}>Descending</option>
			</Select>
			<Button on:click={printTable} class="w-1/6 bg-gray-500 text-white">Print</Button>
		</div>

		<!-- Table Container with Horizontal Scroll -->
		<div class="mt-6 overflow-x-auto rounded-lg bg-white p-6 shadow">
			<div class="min-w-[1200px]">
				<!-- Set minimum width to accommodate all columns -->
				<Table class="w-full">
					<TableHead>
						<TableHeadCell class="w-12">#</TableHeadCell>
						<TableHeadCell class="w-32">Actions</TableHeadCell>
						<TableHeadCell class="min-w-[250px]">Speaker Name(s)</TableHeadCell>
						<TableHeadCell class="w-12">No. of Speakers</TableHeadCell>
						<TableHeadCell class="w-32">Contact No</TableHeadCell>
						<TableHeadCell class="min-w-[100px]">Origin</TableHeadCell>
						<TableHeadCell class="min-w-[100px]">Language</TableHeadCell>
						<TableHeadCell class="min-w-[100px]">Category</TableHeadCell>
						<TableHeadCell class="min-w-[200px]">Speech Audio</TableHeadCell>
						<TableHeadCell class="w-24">RTTM</TableHeadCell>
						<TableHeadCell class="w-24">TextGrid</TableHeadCell>
						<TableHeadCell class="w-32">Recorded Date</TableHeadCell>
					</TableHead>
					<TableBody tableBodyClass="divide-y">
						{#each paginatedItems as file, index}
							<TableBodyRow>
								<TableBodyCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableBodyCell>
								<TableBodyCell>
									<div class="flex space-x-2">
										<Button on:click={() => openEditModal(file)} color="blue" size="xs">Edit</Button
										>
										<Button on:click={() => deleteItem(file.id)} color="red" size="xs"
											>Delete</Button
										>
									</div>
								</TableBodyCell>
								<TableBodyCell class="max-w-[250px] truncate">{file.speaker_name}</TableBodyCell>
								<TableBodyCell>{file.num_speakers}</TableBodyCell>
								<TableBodyCell>{file.contact_no}</TableBodyCell>
								<TableBodyCell class="max-w-[100px] truncate">{file.origin}</TableBodyCell>
								<TableBodyCell class="max-w-[100px] truncate">{file.language}</TableBodyCell>
								<TableBodyCell class="max-w-[100px] truncate">{file.category}</TableBodyCell>
								<TableBodyCell>
									<audio controls class="w-full max-w-[200px]">
										<source src={`${API_URL}/audio/` + file.recordfile} type="audio/mpeg" />
									</audio>
								</TableBodyCell>
								<TableBodyCell>
									{#if file.rttm}
										<a
											href={`${PYTHON_URL}/static/${encodeURIComponent(file.rttm)}`}
											download
											class="rounded bg-blue-600 px-3 py-1 text-sm text-white shadow transition-all duration-150 hover:bg-blue-700"
										>
											View
										</a>
									{:else}
										N/A
									{/if}
								</TableBodyCell>

								<TableBodyCell>
									{#if file.textgrid_url}
										<a href={`${API_URL}/textgrid/${encodeURIComponent(file.textgrid_url)}`} download class="text-blue-600 hover:underline"
											>Download</a
										>
									{:else}
										N/A
									{/if}
								</TableBodyCell>
								<TableBodyCell>{file.recorded_date}</TableBodyCell>
							</TableBodyRow>
						{/each}
					</TableBody>
				</Table>
				<!-- Pagination Controls -->
				<div class="mt-4 flex items-center justify-between">
					<div class="text-sm text-gray-500">
						Showing <span class="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to
						<span class="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of
						<span class="font-medium">{totalItems}</span> results
					</div>

					<div class="flex space-x-2">
						<Button
							on:click={() => (currentPage = Math.max(1, currentPage - 1))}
							disabled={currentPage === 1}
							color="gray"
							size="sm"
						>
							Previous
						</Button>

						{#each Array.from({ length: Math.ceil(totalItems / itemsPerPage) }, (_, i) => i + 1) as page}
							{#if Math.abs(page - currentPage) < 3 || page === 1 || page === Math.ceil(totalItems / itemsPerPage)}
								<Button
									on:click={() => (currentPage = page)}
									color={page === currentPage ? 'blue' : 'gray'}
									size="sm"
								>
									{page}
								</Button>
							{/if}
						{/each}

						<Button
							on:click={() =>
								(currentPage = Math.min(Math.ceil(totalItems / itemsPerPage), currentPage + 1))}
							disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
							color="gray"
							size="sm"
						>
							Next
						</Button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Edit Modal -->
<Modal title="Edit Speech Information" bind:open={showEditModal} on:close={closeEditModal}>
	<div class="space-y-4">
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div>
				<label class="mb-2 block text-sm font-medium text-gray-900">Speaker Name</label>
				<Input bind:value={editForm.speaker_name} />
			</div>
			<div>
				<label class="mb-2 block text-sm font-medium text-gray-900">Number of Speakers</label>
				<Input type="number" bind:value={editForm.num_speakers} />
			</div>
			<div>
				<label class="mb-2 block text-sm font-medium text-gray-900">Contact Number</label>
				<Input bind:value={editForm.contact_no} />
			</div>
			<div>
				<label class="mb-2 block text-sm font-medium text-gray-900">Origin</label>
				<Input bind:value={editForm.origin} />
			</div>
			<div>
				<label class="mb-2 block text-sm font-medium text-gray-900">Language</label>
				<Input bind:value={editForm.language} />
			</div>
			<div>
				<label class="mb-2 block text-sm font-medium text-gray-900">Category</label>
				<Input bind:value={editForm.category} />
			</div>
			<div>
				<label class="mb-2 block text-sm font-medium text-gray-900">Audio URL</label>
				<Input bind:value={editForm.recordfile} />
			</div>
			<div>
				<label class="mb-2 block text-sm font-medium text-gray-900">TextGrid URL</label>
				<Input bind:value={editForm.textgrid_url} />
			</div>
			<div>
				<label class="mb-2 block text-sm font-medium text-gray-900">Recorded Date</label>
				<Input type="date" bind:value={editForm.recorded_date} />
			</div>
		</div>
		<!-- Transcription/Metadata -->
		<div class="grid grid-cols-1 gap-4 pt-4">
			<div class="md:col-span-1">
				<h3 class="text-sm font-semibold text-gray-700">Transcription/Metadata</h3>
			</div>
			<div class="md:col-span-3">
				<!-- Toolbar -->
				<div class="mb-2 space-x-2">
					<button on:click={() => document.execCommand('bold')} class="btn">Bold</button>
					<button on:click={() => document.execCommand('italic')} class="btn">Italic</button>
					<button on:click={() => document.execCommand('fontSize', false, '4')} class="btn"
						>Large</button
					>
					<button on:click={() => document.execCommand('fontSize', false, '2')} class="btn"
						>Small</button
					>
				</div>

				<!-- Editable Area -->
				<div
					contenteditable="true"
					bind:innerHTML={editForm.textcontent}
					class="max-h-96 overflow-auto rounded-lg border border-gray-200 bg-white p-4"
					on:input={(e) => (editForm.textcontent = e.currentTarget.innerHTML)}
				></div>
			</div>
		</div>
		<!-- Recording Section -->
		<div class="grid grid-cols-1 gap-4 pt-4">
			<div class="md:col-span-1">
				<h3 class="text-sm font-semibold text-gray-700">Recording</h3>
			</div>
			<div class="md:col-span-3">
				<div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
					<!-- Audio Player -->
					<div class="flex flex-col gap-4">
						<div class="flex items-center gap-4">
							<audio
								hidden={diarized || editForm.rttm}
								controls
								bind:this={audioPlayer}
								bind:duration={time}
								bind:currentTime
								on:loadedmetadata={handleMetadata}
								controlslist="play nodownload"
								class="w-full"
							>
								<source src="{API_URL}/audio/{editForm.recordfile}" />
							</audio>

							{#if !diarized && !editForm.rttm}
								<button
									on:click={() =>
										handleDiarize(`${API_URL}/audio/` + editForm.recordfile, editForm)}
									class="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-green-700"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-5 w-5"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fill-rule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
											clip-rule="evenodd"
										/>
									</svg>
									Diarize Speech
								</button>
							{/if}

							{#if loading}
								<div class="flex items-center gap-2 text-gray-600">
									<svg
										class="h-5 w-5 animate-spin text-green-600"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											class="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											stroke-width="4"
										></circle>
										<path
											class="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									Please wait...
								</div>
							{/if}
						</div>

						{#if diarized || editForm.rttm}
							<div class="space-y-4">
								<img
									src={`${PYTHON_URL}/static/${editForm.rttm.slice(0, -4)}png`}
									alt="Diarization visualization"
									class="w-full rounded-lg border border-gray-200"
								/>

								<div class="flex flex-col gap-2 pl-2 pr-1">
									<div class="relative h-2 w-full rounded-full bg-gray-200">
										<div
											class="absolute left-0 top-0 h-full rounded-full bg-gray-600"
											style="width: {progress}%"
										></div>
										<input
											type="range"
											min="0"
											max={time}
											bind:value={currentTime}
											class="absolute left-0 top-0 h-full w-full cursor-pointer opacity-0"
										/>
									</div>

									<div class="flex items-center justify-between">
										<div class="flex items-center gap-2">
											{#if !play}
												<button
													on:click={() => {
														play = true;
														audioPlayer.play();
													}}
													class="rounded-full bg-gray-800 p-2 text-white transition-colors duration-200 hover:bg-gray-900"
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														class="h-6 w-6"
														viewBox="0 0 20 20"
														fill="currentColor"
													>
														<path
															fill-rule="evenodd"
															d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
															clip-rule="evenodd"
														/>
													</svg>
												</button>
											{/if}
											{#if play}
												<button
													on:click={() => {
														play = false;
														audioPlayer.pause();
													}}
													class="rounded-full bg-gray-800 p-2 text-white transition-colors duration-200 hover:bg-gray-900"
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														class="h-6 w-6"
														viewBox="0 0 20 20"
														fill="currentColor"
													>
														<path
															fill-rule="evenodd"
															d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
															clip-rule="evenodd"
														/>
													</svg>
												</button>
											{/if}
											<button
												on:click={() => {
													currentTime = currentTime - 5;
													if (currentTime < 0) currentTime = 0;
												}}
												class="rounded-full bg-gray-200 p-2 transition-colors duration-200 hover:bg-gray-300"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-6 w-6"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M15 19l-7-7 7-7"
													/>
												</svg>
											</button>
											<button
												on:click={() => {
													currentTime = currentTime + 5;
													if (currentTime > time) currentTime = time;
												}}
												class="rounded-full bg-gray-200 p-2 transition-colors duration-200 hover:bg-gray-300"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-6 w-6"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M9 5l7 7-7 7"
													/>
												</svg>
											</button>

											<span class="text-sm text-gray-600">
												{getTime(currentTime).minutes}:{getTime(currentTime).seconds} /
												{getTime(time).minutes}:{getTime(time).seconds}
											</span>
										</div>
									</div>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
		<div class="flex justify-end space-x-3 pt-4">
			<Button on:click={closeEditModal} color="gray">Cancel</Button>
			<Button on:click={saveEdit} color="blue">Save Changes</Button>
		</div>
	</div>
</Modal>

<style>
	.animate-fadeIn {
		animation: fadeIn 0.3s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.active-letter {
		@apply bg-blue-600 text-white;
	}
	.modal-enter {
		opacity: 0;
	}
	.modal-enter-active {
		transition: opacity 200ms ease-out;
	}
	.modal-leave-active {
		transition: opacity 150ms ease-in;
		opacity: 0;
	}
</style>
