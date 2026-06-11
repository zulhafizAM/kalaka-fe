<script lang="ts">
	import { diarizeAudio } from '$lib/api.js';
	import axios from 'axios';
	import {
		Button,
		Dropdown,
		Input,
		Search,
		Select,
		TabItem,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Tabs
	} from 'flowbite-svelte';
	import { ChevronDownOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	// import { speechData } from '../backend/speech.js';
	const API_URL = import.meta.env.VITE_API_BASE_URL;
	const PYTHON_URL = import.meta.env.VITE_API_PYTHON_URL;

	let speechData = [];
	let isLoading = false;
	let error = null;
	// Constants
	const PEOPLE = [
		{ name: 'Melayu Sarawak' },
		{ name: 'Iban' },
		{ name: 'Bidayuh' },
		{ name: 'Chinese' }
	];
	// Word of the Day (fetched from API)
	let words = [];

	// Glossary
	let expandedItem = null;
	let voices: SpeechSynthesisVoice[] = [];
	let isSpeaking = false;
	let selectedLetter = null;

	const glossaryItems = [
		{
			term: 'Kamek',
			pronunciation: '/ka.mek/',
			definition: 'I / Me in Sarawak Malay.',
			language: 'ms'
		},
		{
			term: 'Kitak',
			pronunciation: '/ki.tak/',
			definition: 'You in Sarawak Malay.',
			language: 'ms'
		},
		{
			term: 'Nang',
			pronunciation: '/naŋ/',
			definition: 'Indeed / True in Sarawak Malay.',
			language: 'ms'
		},
		{
			term: 'Aritok',
			pronunciation: '/a.ri.tok/',
			definition: 'Today in Sarawak Malay.',
			language: 'ms'
		},
		{
			term: 'Ari',
			pronunciation: '/a.ri/',
			definition: 'Day in Sarawak Malay.',
			language: 'ms'
		},
		{
			term: 'Sik',
			pronunciation: '/sik/',
			definition: 'No / Not in Sarawak Malay.',
			language: 'ms'
		},
		{
			term: 'Kelakar',
			pronunciation: '/kə.la.kar/',
			definition: 'To talk / speak in Sarawak Malay.',
			language: 'ms'
		}
	];

	// Quiz (fetched from API)
	let quizStarted = false;
	let currentQuestion = 0;
	let selectedAnswer: number | null = null;
	let score = 0;
	let quizCompleted = false;
	const quizDetails = {
		title: 'Sarawak Malay Language Quiz',
		description: 'Test your basic knowledge with these quick questions',
		estimatedTime: '3-5 minutes'
	};

	let questions: { options: string[]; correctAnswer: number }[] = [];

	// Audio Player (unchanged)
	let play = false;
	let time = 0;
	let progress = 0;
	let currentTime = 0;
	let audioPlayer: HTMLAudioElement;
	let loading = false;
	let diarized = false;
	let searchTerm = '';

	// Computed
	$: filteredItems1 = PEOPLE.filter((person) =>
		person.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	// Unified Speech Function
	async function speakText(text: string, language = 'ms-MY', rate = 0.9) {
		const synth = window.speechSynthesis;
		synth.cancel();

		const utterance = new SpeechSynthesisUtterance(text);
		utterance.lang = language;
		utterance.rate = rate;

		// Try to find matching voice
		const preferredVoice =
			voices.find((v) => v.lang === language) ||
			voices.find((v) => v.lang.startsWith(language.split('-')[0])) ||
			null;

		if (preferredVoice) utterance.voice = preferredVoice;

		utterance.onstart = () => (isSpeaking = true);
		utterance.onend = utterance.onerror = () => (isSpeaking = false);

		synth.speak(utterance);
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

	// Word of the Day Functions
	function refreshDailyWords() {
		const lastUpdate = localStorage.getItem('wordsLastUpdate');
		const today = new Date().toDateString();

		if (!lastUpdate || lastUpdate !== today) {
			localStorage.setItem('wordsLastUpdate', today);
		}
	}

	// Sort glossary alphabetically by term
	glossaryItems.sort((a, b) => a.term.localeCompare(b.term));

	// Glossary Functions
	function toggleItem(term: string) {
		expandedItem = expandedItem === term ? null : term;
	}

	async function loadVoices() {
		return new Promise<SpeechSynthesisVoice[]>((resolve) => {
			const synth = window.speechSynthesis;
			const voices = synth.getVoices();
			if (voices.length) resolve(voices);
			else {
				synth.onvoiceschanged = () => resolve(synth.getVoices());
			}
		});
	}

	// Quiz Functions (unchanged)
	function startQuiz() {
		quizStarted = true;
	}

	function handleAnswerSelect(answerIndex: number) {
		selectedAnswer = answerIndex;
	}

	function handleNextQuestion() {
		if (selectedAnswer === questions[currentQuestion].correctAnswer) {
			score++;
		}

		selectedAnswer = null;

		if (currentQuestion < questions.length - 1) {
			currentQuestion++;
		} else {
			quizCompleted = true;
		}
	}

	function restartQuiz() {
		quizStarted = false;
		currentQuestion = 0;
		score = 0;
		selectedAnswer = null;
		quizCompleted = false;
	}

	// Reactive statements

	const alphabet = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];

	$: filteredItems2 = selectedLetter
		? glossaryItems.filter((item) => item.term.charAt(0).toUpperCase() === selectedLetter)
		: glossaryItems;

	$: if (currentTime >= 0) updateProgress();

	let isSidebarOpen = true;
	let items = [];
	let searchTermm = '';
	let sortColumn = 'id';
	let sortAscending = true;
	let currentPage = 1;
	let itemsPerPage = 5;
	let totalItems = items.length;

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

	// Modal state
	let showDetailsModal = false;
	let selectedAudio = null;

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

			selectedAudio.rttm = imageBlob.rttm_url;

			const speechRes = await axios.post(`${API_URL}/speeches`);
			items = speechRes.data;

			diarized = true;
		} catch (err) {
			error = err.message;
			console.error('Diarization error:', err);
		} finally {
			loading = false;
		}
	}

	async function openDetailsModal(audio: { id: number | string; textcontent?: string | null; [key: string]: unknown }) {
		selectedAudio = audio;
		showDetailsModal = true;
		if (audio.textcontent === undefined) {
			const res = await axios.get(`${API_URL}/speech/${audio.id}`);
			selectedAudio = { ...selectedAudio, textcontent: res.data.data.textcontent };
		}
	}

	// Function to close modal
	function closeDetailsModal() {
		showDetailsModal = false;
		selectedAudio = null;
		diarized = false;
	}
	// Delete item
	function deleteItem(id) {
		if (confirm('Are you sure you want to delete this record?')) {
			items = items.filter((item) => item.id !== id);
			// Adjust page if needed
			if (items.length <= (currentPage - 1) * itemsPerPage && currentPage > 1) {
				currentPage--;
			}
		}
	}

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
	}

	$: filteredData = items.filter(
		(file) =>
			Number(file.public) === 2 &&
			file.speaker_name.toLowerCase().includes(searchTermm.toLowerCase())
	);

	$: totalItems = filteredData.length;

	$: paginatedItems = filteredData.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	$: if (searchTermm !== undefined) currentPage = 1;
	// Keep your data fetching onMount
	onMount(async () => {
		try {
			refreshDailyWords();
			voices = await loadVoices();

			if (!voices.some((v) => v.lang === 'ms-MY')) {
				console.warn('Malay voice not found, will use default voice');
			}

			// Fetch all needed data in parallel
			const [speechRes, wordsRes, quizzesRes] = await Promise.all([
				axios.post(`${API_URL}/speeches`),
				axios.get(`${API_URL}/words`),
				axios.get(`${API_URL}/quizzes`)
			]);
			speechData = speechRes.data;

			words = wordsRes.data.map((w: any) => ({
				term: w.word,
				definition: w.meaning,
				pronunciation: w.phoneme,
				language: 'ms-MY'
			}));

			questions = quizzesRes.data.map((q: any) => ({
				options: [q.option_a, q.option_b, q.option_c, q.option_d],
				correctAnswer: ['A', 'B', 'C', 'D'].indexOf(q.correct_answer)
			}));
		} catch (err) {
			error = err.response?.data?.message || err.message;
			console.error('Error fetching data:', err);
		} finally {
			isLoading = false;
		}
	});

	// Add this reactive statement to sort whenever items changes
	$: if (items.length > 0) sortTable();
</script>

<Tabs>
	<Button
		class="ml-5 text-black dark:text-black"
		style="border: 1px solid gray; border-radius: 15px;"
	>
		Choose Language
		<ChevronDownOutline class="ms-2 h-6 w-6 text-black dark:text-black" />
	</Button>

	<Dropdown class="h-44 overflow-y-auto px-3 pb-3 text-sm">
		<!-- Slot for search bar -->
		<div slot="header" class="p-3">
			<Search size="md" bind:value={searchTerm} />
		</div>

		<!-- Loop through filteredItems and make them clickable -->
		{#each filteredItems1 as person (person.name)}
			<li class="cursor-pointer rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
				{person.name}
			</li>
		{/each}
	</Dropdown>

	<TabItem open title="Words of the Day">
		<div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
			<div class="mb-10 text-center">
				<h1 class="text-3xl font-bold text-gray-900">Words of the Day</h1>
				<p class="mt-2 text-gray-500">
					{new Date().toLocaleDateString('en-US', {
						weekday: 'long',
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})}
				</p>
			</div>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<!-- Left Column -->
				<div class="space-y-6">
					{#each words.slice(0, 3) as word}
						<div class="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
							<div class="flex items-start justify-between">
								<div>
									<h3 class="text-xl font-semibold text-gray-800">{word.term}</h3>
									<p class="mt-1 text-sm text-gray-500">{word.pronunciation}</p>
									<p class="mt-3 text-gray-700">{word.definition}</p>
								</div>
								<button
									on:click|stopPropagation={() => speakText(word.term, word.language)}
									class="rounded-full p-2 hover:bg-gray-100"
									aria-label="Pronounce word"
								>
									<svg
										class="h-6 w-6 text-blue-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
										/>
									</svg>
								</button>
							</div>
						</div>
					{/each}
				</div>

				<!-- Right Column -->
				<div class="space-y-6">
					{#each words.slice(3, 6) as word}
						<div class="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
							<div class="flex items-start justify-between">
								<div>
									<h3 class="text-xl font-semibold text-gray-800">{word.term}</h3>
									<p class="mt-1 text-sm text-gray-500">{word.pronunciation}</p>
									<p class="mt-3 text-gray-700">{word.definition}</p>
								</div>
								<button
									on:click|stopPropagation={() => speakText(word.term, word.language)}
									class="rounded-full p-2 hover:bg-gray-100"
									aria-label="Pronounce word"
								>
									<svg
										class="h-6 w-6 text-blue-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
										/>
									</svg>
								</button>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<div class="mt-8 text-center text-sm text-gray-500">
				<p>New words refresh daily at midnight</p>
			</div>
		</div>
	</TabItem>
	<TabItem title="Glossary">
		<div class="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
			<h1 class="mb-8 text-center text-3xl font-bold text-gray-900">Glossary</h1>

			<!-- Alphabetical Pagination -->
			<div class="mb-6 flex flex-wrap justify-center gap-2">
				{#each alphabet as letter}
					<button
						on:click={() => (selectedLetter = letter)}
						class="rounded-md border px-3 py-1 text-sm font-medium
						 transition hover:bg-blue-500 hover:text-white
						 {selectedLetter === letter ? 'active-letter' : 'bg-white text-gray-700'}"
					>
						{letter}
					</button>
				{/each}
				<button
					on:click={() => (selectedLetter = null)}
					class="rounded-md border bg-gray-200 px-3 py-1 text-sm
					   font-medium text-gray-800 hover:bg-gray-300"
				>
					All
				</button>
			</div>

			<!-- Glossary List -->
			<div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow">
				{#if filteredItems2.length > 0}
					{#each filteredItems2 as item}
						<div class="px-6 py-4">
							<div
								class="flex cursor-pointer items-center justify-between"
								on:click={() => toggleItem(item.term)}
							>
								<div>
									<h3 class="text-lg font-medium text-gray-900">{item.term}</h3>
									<p class="mt-1 text-sm text-gray-500">{item.pronunciation}</p>
								</div>
								<button
									on:click|stopPropagation={() => speakText(item.term, item.language)}
									class="rounded-full p-2 hover:bg-gray-100 focus:outline-none"
									disabled={isSpeaking}
									aria-label="Dengarkan sebutan"
								>
									<svg
										class={`h-6 w-6 ${isSpeaking ? 'text-gray-400' : 'text-blue-600'}`}
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
										/>
									</svg>
								</button>
							</div>

							{#if expandedItem === item.term}
								<div class="animate-fadeIn mt-4 border-t border-gray-200 pt-4">
									<p class="text-gray-700">{item.definition}</p>
								</div>
							{/if}
						</div>
					{/each}
				{:else}
					<div class="px-6 py-4 text-center text-gray-500">
						No terms found for "{selectedLetter}"
					</div>
				{/if}
			</div>
		</div>
	</TabItem>
	<TabItem title="Quiz">
		<div class="min-h-screen bg-gray-100 px-4 py-12 transition-all duration-300 sm:px-6 lg:px-8">
			{#if questions.length === 0}
				<p class="text-center text-gray-500 py-16">Loading quiz...</p>
			{:else}
			<div
				class="mx-auto max-w-md overflow-hidden rounded-xl bg-white shadow-md transition-all md:max-w-2xl"
			>
				<div class="p-8">
					{#if !quizStarted && !quizCompleted}
						<!-- Welcome Screen -->
						<div class="text-center">
							<h1 class="mb-4 text-2xl font-bold text-gray-800">Welcome to {quizDetails.title}!</h1>
							<p class="mb-6 text-gray-600">{quizDetails.description}</p>

							<div class="mb-6 rounded-lg bg-blue-50 p-4 text-left">
								<div class="mb-2 flex items-center">
									<svg
										class="mr-2 h-5 w-5 text-blue-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										></path>
									</svg>
									<span class="font-medium">Quiz Details:</span>
								</div>
								<ul class="space-y-2 text-sm text-gray-700">
									<li class="flex items-center">
										<svg
											class="mr-2 h-4 w-4 text-blue-600"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M5 13l4 4L19 7"
											></path>
										</svg>
										{questions.length} questions
									</li>
									<li class="flex items-center">
										<svg
											class="mr-2 h-4 w-4 text-blue-600"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M5 13l4 4L19 7"
											></path>
										</svg>
										Takes about {quizDetails.estimatedTime}
									</li>
									<li class="flex items-center">
										<svg
											class="mr-2 h-4 w-4 text-blue-600"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M5 13l4 4L19 7"
											></path>
										</svg>
										No pressure - try anytime!
									</li>
								</ul>
							</div>

							<div class="flex flex-col justify-center gap-4 sm:flex-row">
								<button
									on:click={startQuiz}
									class="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
								>
									Start Quiz Now
								</button>
							</div>
						</div>
					{:else if quizStarted && !quizCompleted}
						<!-- Quiz Questions Screen -->
						<div class="mb-6">
							<h2 class="mb-2 text-xl font-bold text-gray-800">
								Question {currentQuestion + 1}/{questions.length}
							</h2>
							<div class="h-2.5 w-full rounded-full bg-gray-200">
								<div
									class="h-2.5 rounded-full bg-blue-600 transition-all duration-300"
									style={`width: ${((currentQuestion + 1) / questions.length) * 100}%`}
								></div>
							</div>
						</div>

						<h3 class="mb-6 text-lg font-semibold text-gray-700">
							Choose the correct answer:
						</h3>

						<div class="mb-8 space-y-3">
							{#each questions[currentQuestion].options as option, index}
								<button
									on:click={() => handleAnswerSelect(index)}
									class={`w-full rounded-lg border p-4 text-left transition-all
						  ${selectedAnswer === index ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300'}`}
								>
									{option}
								</button>
							{/each}
						</div>

						<button
							on:click={handleNextQuestion}
							disabled={selectedAnswer === null}
							class={`w-full rounded-md px-4 py-3 font-medium text-white transition-colors
					  ${selectedAnswer === null ? 'cursor-not-allowed bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
						>
							{currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
						</button>
					{:else}
						<!-- Results Screen -->
						<div class="text-center">
							<h2 class="mb-4 text-2xl font-bold text-gray-800">Quiz Completed!</h2>
							<p class="mb-6 text-lg">You scored {score} out of {questions.length}</p>

							<div class="mb-8">
								{#if score === questions.length}
									<div
										class="inline-flex items-center rounded-full bg-green-100 px-4 py-2 text-green-800"
									>
										<svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M5 13l4 4L19 7"
											></path>
										</svg>
										Perfect! 🎉
									</div>
								{:else if score >= questions.length / 2}
									<div
										class="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-blue-800"
									>
										<svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M5 13l4 4L19 7"
											></path>
										</svg>
										Good job! 👍
									</div>
								{:else}
									<div
										class="inline-flex items-center rounded-full bg-orange-100 px-4 py-2 text-orange-800"
									>
										<svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
											></path>
										</svg>
										Keep practicing! 💪
									</div>
								{/if}
							</div>

							<button
								on:click={restartQuiz}
								class="w-full rounded-md bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700"
							>
								Take Quiz Again
							</button>
						</div>
					{/if}
				</div>
			</div>
			{/if}
		</div>
	</TabItem>
	<TabItem title="Audios">
		<div class="mb-4 flex gap-4">
			<Input
				type="text"
				placeholder="Search by speaker name"
				bind:value={searchTermm}
				class="w-full sm:w-1/4"
			/>
			<Select bind:value={sortColumn} on:change={sortTable} class="w-full sm:w-1/4">
				<option value="id">#</option>
				<option value="speaker_name">Speaker Name</option>
				<option value="origin">Origin</option>
				<option value="language">Language</option>
				<option value="recorded_date">Recorded Date</option>
			</Select>
			<Select bind:value={sortAscending} on:change={sortTable} class="w-full sm:w-1/4">
				<option value={true}>Ascending</option>
				<option value={false}>Descending</option>
			</Select>
			<Button on:click={printTable} class="w-1/6 bg-gray-500 text-white">Print</Button>
		</div>

		<div class="mt-6 overflow-x-auto rounded-lg bg-white p-6 shadow">
			<div class="min-w-[1200px]">
				<!-- Set minimum width to accommodate all columns -->
				<Table class="w-full">
					<TableHead>
						<TableHeadCell class="w-12">#</TableHeadCell>
						<TableHeadCell class="min-w-[250px]">Speaker Name(s)</TableHeadCell>
						<TableHeadCell class="min-w-[100px]">Origin</TableHeadCell>
						<TableHeadCell class="min-w-[100px]">Language</TableHeadCell>
						<TableHeadCell class="min-w-[200px]">Speech Audio</TableHeadCell>
						<TableHeadCell class="w-32">Recorded Date</TableHeadCell>
						<TableHeadCell class="w-32">Actions</TableHeadCell>
					</TableHead>
					<TableBody tableBodyClass="divide-y">
						{#each paginatedItems as file (file.id)}
							<TableBodyRow>
								<TableBodyCell>{file.id}</TableBodyCell>
								<TableBodyCell class="max-w-[250px] truncate">{file.speaker_name}</TableBodyCell>
								<TableBodyCell class="max-w-[100px] truncate">{file.origin}</TableBodyCell>
								<TableBodyCell class="max-w-[100px] truncate">{file.language}</TableBodyCell>
								<TableBodyCell>
									<audio controls class="w-full max-w-[200px]" src={`${API_URL}/audio/` + file.recordfile}></audio>
								</TableBodyCell>
								<TableBodyCell>{file.recorded_date}</TableBodyCell>
								<TableBodyCell>
									<div class="flex space-x-2">
										<Button on:click={() => openDetailsModal(file)} color="blue" size="xs">
											More Details
										</Button>
									</div>
								</TableBodyCell>
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
	</TabItem>
	<TabItem title="Info">
		<section class="rounded bg-white p-4 shadow-md">
			<h2 class="mb-4 text-xl font-semibold">Geography</h2>
			<div class="aspect-w-16 aspect-h-9">
				<p class="text-md text-gray-500 dark:text-gray-400">
					Sarawak is the largest state in Malaysia, located on the island of Borneo. Covering an
					area of approximately 124,450 square kilometers, it accounts for nearly 37.5% of
					Malaysia's total landmass. It is bordered by Sabah to the northeast, Kalimantan
					(Indonesia) to the south, and the South China Sea to the northwest. Its strategic location
					makes it a hub of biodiversity and cultural diversity. The state's capital, Kuching, is
					its most populous city and an administrative and cultural center. Other major towns
					include Miri, Sibu, and Bintulu. Sarawak is traversed by numerous rivers, with the Rajang
					River being the longest in Malaysia.
				</p>
			</div>
		</section>
		<section class="rounded bg-white p-4 shadow-md">
			<h2 class="mb-4 text-xl font-semibold">History</h2>
			<div class="aspect-w-16 aspect-h-9">
				<p class="text-md text-gray-500 dark:text-gray-400">
					Sarawak's history is rich and complex, spanning ancient times to its modern-day status as
					part of Malaysia.<br /><br />

					<b>Ancient and Indigenous Era</b><br />
					The indigenous peoples of Sarawak, such as the Iban, Bidayuh, and Orang Ulu, have inhabited
					the region for centuries. Evidence of human habitation, such as the Niah Caves, dates back
					over 40,000 years, making it one of Southeast Asia's most significant archaeological sites.<br
					/><br />

					<b>The Brooke Dynasty (White Rajahs)</b><br />
					In 1841, James Brooke, an Englishman, was granted the title of Rajah by the Sultan of Brunei
					for his assistance in suppressing a rebellion. This marked the beginning of the Brooke Dynasty,
					which ruled Sarawak for over a century. The Brooke family established a relatively autonomous
					governance system, focusing on trade and suppressing piracy.<br /><br />

					<b>World War II and Japanese Occupation</b><br />
					During World War II, Sarawak was occupied by the Japanese from 1941 to 1945. After the war,
					the last White Rajah, Charles Vyner Brooke, ceded Sarawak to the British Crown, making it a
					British colony in 1946.<br /><br />

					<b>Joining Malaysia</b><br />
					On September 16, 1963, Sarawak, along with Sabah and Singapore, joined the Federation of Malaysia.
					This decision faced some resistance, but Sarawak eventually became an integral part of the
					country.<br /><br />
				</p>
			</div>
		</section>
		<section class="rounded bg-white p-4 shadow-md">
			<h2 class="mb-4 text-xl font-semibold">People and Culture</h2>
			<div class="aspect-w-16 aspect-h-9">
				<p class="text-md text-gray-500 dark:text-gray-400">
					Sarawak is known for its incredible cultural diversity. Its population is made up of over
					40 ethnic groups, each with its unique traditions, languages, and festivals.<br /><br />

					<b>Major Ethnic Groups</b><br /><br />
					<b>Iban</b>: The largest indigenous group, known for their longhouses and vibrant
					festivals like Gawai Dayak.<br /><br />
					<b>Chinese</b>: Significant contributions in trade and commerce; festivals like Chinese
					New Year are widely celebrated.<br /><br />
					<b>Malay</b>: The traditional Malay population practices Islam and celebrates events like
					Hari Raya.<br /><br />
					<b>Bidayuh</b>: Known as the "Land Dayaks," they are famed for their bamboo craftsmanship
					and farming traditions.<br /><br />
					<b>Orang Ulu</b>: A collective term for smaller indigenous groups like the Kayan, Kenyah,
					and Penan, known for their sape (a traditional lute) and intricate beadwork.<br /><br />
					<b>Melanau</b>: Traditionally fishermen and sago producers, the Melanau people celebrate
					the Kaul Festival.<br /><br />
				</p>
			</div>
		</section>
	</TabItem>
	<!-- Audio Details Modal -->
	{#if showDetailsModal && selectedAudio}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
			<div class="w-full max-w-4xl rounded-lg bg-white shadow-xl">
				<!-- Modal Header -->
				<div class="flex items-center justify-between border-b p-4">
					<h3 class="text-xl font-semibold text-gray-900">Audio Details</h3>
					<!-- svelte-ignore a11y_consider_explicit_label -->
					<button
						on:click={closeDetailsModal}
						class="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
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
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				<!-- Modal Body -->
				<div class="h-[75vh] overflow-auto bg-gray-50">
					<div class="container mx-auto">
						<div class="overflow-hidden rounded-xl bg-white shadow-lg">
							<!-- Content Card -->
							<div class="p-8">
								<!-- Metadata Section -->
								<div class="space-y-6 divide-y divide-gray-200">
									<!-- Speaker -->
									<div class="grid grid-cols-1 gap-4 pt-4 first:pt-0 md:grid-cols-4">
										<div class="md:col-span-1">
											<h3 class="text-lg font-semibold text-gray-700">Speaker:</h3>
										</div>
										<div class="text-gray-800 md:col-span-3">
											{selectedAudio.speaker_name}
										</div>
									</div>

									<!-- Date -->
									<div class="grid grid-cols-1 gap-4 pt-4 md:grid-cols-4">
										<div class="md:col-span-1">
											<h3 class="text-lg font-semibold text-gray-700">Date:</h3>
										</div>
										<div class="text-gray-800 md:col-span-3">{selectedAudio.recorded_date}</div>
									</div>

									<!-- Language -->
									<div class="grid grid-cols-1 gap-4 pt-4 md:grid-cols-4">
										<div class="md:col-span-1">
											<h3 class="text-lg font-semibold text-gray-700">Language:</h3>
										</div>
										<div class="text-gray-800 md:col-span-3">{selectedAudio.language}</div>
									</div>

									<!-- Transcription/Metadata -->
									<div class="grid grid-cols-1 gap-4 pt-4 md:grid-cols-4">
										<div class="md:col-span-1">
											<h3 class="text-lg font-semibold text-gray-700">Transcription/Metadata:</h3>
										</div>
										<div class="md:col-span-3">
											<div
												class="max-h-96 overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-4"
											>
												{@html selectedAudio.textcontent}
											</div>
										</div>
									</div>

									<!-- Recording Section -->
									<div class="grid grid-cols-1 gap-4 pt-4 md:grid-cols-4">
										<div class="md:col-span-1">
											<h3 class="text-lg font-semibold text-gray-700">Recording:</h3>
										</div>
										<div class="md:col-span-3">
											<div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
												<!-- Audio Player -->
												<div class="flex flex-col gap-4">
													<div class="flex items-center gap-4">
														<audio
															hidden={diarized || selectedAudio.rttm}
															controls
															bind:this={audioPlayer}
															bind:duration={time}
															bind:currentTime
															on:loadedmetadata={handleMetadata}
															controlslist="play nodownload"
															class="w-full"
														>
															<source src="{API_URL}/audio/{selectedAudio.recordfile}" />
														</audio>

														{#if !diarized && !selectedAudio.rttm}
															<button
																on:click={() =>
																	handleDiarize(
																		`${API_URL}/audio/` + selectedAudio.recordfile,
																		selectedAudio
																	)}
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

													{#if diarized || selectedAudio.rttm}
														<div class="space-y-4">
															<img
																src={`${PYTHON_URL}/static/${selectedAudio.rttm.slice(0, -4)}png`}
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
													{#if error}
														<div class="rounded-lg bg-red-100 p-4 text-red-700">
															Error: {error}
														</div>
													{/if}
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Modal Footer -->
				<div class="flex justify-end border-t p-4">
					<Button on:click={closeDetailsModal} color="light" class="mr-2">Close</Button>
				</div>
			</div>
		</div>
	{/if}
</Tabs>

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
