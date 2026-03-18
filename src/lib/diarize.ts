// utils/diarize.ts
import axios from 'axios';

export async function diarizeAudio(file: File): Promise<Blob> {
	const formData = new FormData();
	formData.append('file', file);

	const PYTHON_URL = import.meta.env.VITE_API_PYTHON_URL;
	const response = await axios.post(`${PYTHON_URL}/diarize`, formData, {
		responseType: 'blob',
		headers: {
			'Content-Type': 'multipart/form-data'
		}
	});

	return response.data;
}
