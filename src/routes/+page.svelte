<script>
	import Map from '../components/Map.svelte';
  import { Card, Button } from "flowbite-svelte";
  import { ArrowRightOutline } from "flowbite-svelte-icons";
</script>

<div class="min-h-screen flex flex-col">
  <!-- Main Content -->
  <main class="flex-grow p-6 " style="background-color: #092e6d;">
    <div class="space-y-6">
      <!-- YouTube Caption Section -->
      <section class=" rounded p-6" style="background-color: #092e6d;">
        <div class="flex flex-col md:flex-row gap-6 items-start mb-10 mt-5">
          <!-- Left Column (Header + Paragraph) -->
          <div class="flex-1 space-y-4">
            <h2 class="text-3xl text-white font-semibold mb-4"><em class="italic">Kalaka</em></h2>
            <div class="text-xl text-white leading-relaxed text-justify">
              The <em class="italic">Kalaka</em> Language Repository at <em class="font-bold">Universiti Malaysia Sarawak (UNIMAS)</em> is a significant initiative aimed at preserving and studying Malaysia's linguistic diversity. It focuses on documenting and analyzing lesser-resourced languages, particularly those spoken in Sarawak. The repository serves as a comprehensive digital map and resource for understanding the geographical distribution and linguistic characteristics of languages within the region.
            </div>
          </div>

          <!-- Right Column (YouTube Video) -->
          <div class="flex w-full flex-col items-center md:w-auto md:flex-1">
            <iframe
                class="mb-4 aspect-video w-full max-w-md rounded-lg"
                src="https://www.youtube.com/embed/TesXslhuOEE?si=G39BGtWrECd-UJNL"
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen>
            </iframe>
            <p class="text-lg text-white leading-relaxed text-center">
                Learn more about <em class="italic">Kalaka</em> by watching this video.
            </p>
        </div>
        </div>  
      </section>

      <section>
      <div class="bg-gray-300 rounded-lg p-8 mb-10">
        <h2 class="text-3xl font-semibold mb-4">How to Contribute?</h2>
        <p class="text-xl text-gray-700 leading-relaxed text-justify mb-10">
          Registered users can upload speech recordings, input speaker information, and write transcripts while listening to the uploaded audio files. Additionally, recordings stored in Kalaka are geotagged based on speaker details, enabling visualization through the interactive Language Map of Malaysia , which showcases the geographic distribution of languages across the country.
        </p>
        <Button href="/Register" class="w-fit bg-blue-500 hover:bg-blue-700 text-white">
          Be a Contributor
      </Button>
    </div>
  </section>

  <section>
    <div class="mb-5 grid grid-cols-1 gap-6 p-4 sm:p-10 md:grid-cols-3">
      <Card class="p-4 sm:p-6 md:p-8">
          <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Expand Your Vocabulary with Our Word of the Day</h5>
          <p class="mb-3 leading-tight font-normal text-gray-700 dark:text-gray-400">Learn a new word each day and watch your vocabulary grow.</p>
          <Button href="/Languages" class="w-fit bg-blue-500 hover:bg-blue-700 text-white">
              Learn more <ArrowRightOutline class="ms-2 h-6 w-6 text-white" />
          </Button>
      </Card>
      <Card class="p-4 sm:p-6 md:p-8">
          <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Explore Our Essential Language Glossary</h5>
          <p class="mb-3 leading-tight font-normal text-gray-700 dark:text-gray-400">Navigate the world of language with ease using glossary of terms.</p>
          <Button href="/Languages" class="w-fit bg-blue-500 hover:bg-blue-700 text-white">
              Learn more <ArrowRightOutline class="ms-2 h-6 w-6 text-white" />
          </Button>
      </Card>
      <Card class="p-4 sm:p-6 md:p-8">
          <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Try Our Language Quiz to Test Your Knowledge</h5>
          <p class="mb-3 leading-tight font-normal text-gray-700 dark:text-gray-400">Challenge yourself with our engaging quizzes.</p>
          <Button href="/Languages" class="w-fit bg-blue-500 hover:bg-blue-700 text-white">
              Learn more <ArrowRightOutline class="ms-2 h-6 w-6 text-white" />
          </Button>
      </Card>
  </div>
  </section>

  <section>
    <div class=" rounded-lg p-8 mb-10">
      <h2 class="text-3xl font-semibold mb-4 text-white">Language Map of Malaysia</h2>
      <Map />
  </div>
</section>

<section>
  <div class="bg-gray-300 rounded-lg shadow-md p-8 mt-6 w-full mx-auto flex flex-col gap-2 items-center text-center">
    <img src="/email.png" alt="Email" class="w-48 h-25">
    <div>
        <p class="text-lg text-gray-700 mb-2">
            Having problems? Need help? Please contact the project manager via email below.
        </p>
        <h3 class="text-xl font-semibold text-gray-800">Dr Sarah Samson Juan</h3>
        <p class="text-gray-600"><strong class="text-blue-600"> sjsflora@unimas.my</strong></p>
    </div>
</div>
</section>
  </div>

  
  </main>
  
</div>



