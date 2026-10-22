const PYTHON_URL = import.meta.env.VITE_API_PYTHON_URL;

export async function diarizeAudio(audioFile) {
    const formData = new FormData();
    
    // Make sure audioFile is a proper File or Blob object
    if (!(audioFile instanceof Blob)) {
        throw new Error('Invalid audio file format');
    }
    
    formData.append('file', audioFile, 'audio.wav');
    
    try {
        const response = await fetch(`${PYTHON_URL}/diarize`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            // kalaka-diarization returns failures as { error: "<message>" }.
            throw new Error(errorData.error || errorData.detail || `Server responded with ${response.status}`);
        }
        else
            return await response.json();
    } catch (err) {
        console.error('API Error:', err);
        throw new Error(err.message || 'Failed to process audio');
    }
}