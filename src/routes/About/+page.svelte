<script lang="ts">
    import { optionsData } from '$lib/options.js'; // make sure this file exists
</script>

<div class="min-h-screen bg-white-100 flex flex-col">

    <!-- Page Header -->
    <header class="bg-blue-900  p-6 mb-6">
        <h1 class="text-4xl font-bold text-white">About Us</h1>
        <p class="text-lg text-white mt-2">Learn more about our mission and contributors</p>
    </header>

    <!-- About Content -->
    <div class="container mx-auto px-4 flex-1">

        <!-- Section: Who Are We -->
        <div class="bg-white rounded-lg  p-8 mb-10">
            <h2 class="text-3xl font-semibold text-blue-800 mb-4">Who are we?</h2>
            <p class="text-xl text-gray-700 leading-relaxed text-justify">
                Kalaka is a platform designed to facilitate speech and text data collection for Malaysian languages. It serves as a valuable resource for linguists, researchers, and students interested in creating and managing their own language datasets and to preserve and revitalise indigenous languages in the country. Our mission is to provide a platform that fosters language preservation and enriches cultural knowledge. Currently, Kalaka is managed by postgraduate students and Dr Sarah Samson Juan.
            </p>
        </div>
        
        <div class="bg-white rounded-lg p-8 mb-10">
            <h2 class="text-3xl font-semibold text-blue-800 mb-4">How to Contribute?</h2>
            <p class="text-xl text-gray-700 leading-relaxed text-justify mb-10">
                Registered users can upload speech recordings, input speaker information, and write transcripts while listening to the uploaded audio files. Additionally, recordings stored in Kalaka are geotagged based on speaker details, enabling visualization through the interactive Language Map of Malaysia , which showcases the geographic distribution of languages across the country.
            </p>
            <a href="/Register" class="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Be a Contributor
            </a>
        </div>

        <!-- Loop over all options -->
        {#each optionsData as option}
            <div class="bg-white rounded-lg  p-8 mb-8">
                <!-- Show option name as section title (e.g., "Contributors") -->
                {#if option.name === 'Contributors'}
                    <h3 class="text-3xl font-semibold text-blue-700 mb-6">{option.name}</h3>
                {/if}
                
                <!-- Show the content inside the section -->
                <div class="text-lg text-gray-800">
                    {@html option.content}
                </div>
            </div>
        {/each}

    </div>
    

</div>
