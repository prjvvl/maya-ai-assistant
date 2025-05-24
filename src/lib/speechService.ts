import { browser } from '$app/environment';
import type {
	SpeechRecognition,
	SpeechRecognitionEvent,
	SpeechRecognitionErrorEvent
} from './types';

class SpeechService {
	private recognition: SpeechRecognition | null = null;
	private isSupported = false;
	private isInitialized = false;

	init() {
		if (!browser) return false;

		const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

		if (!SpeechRecognition) {
			console.warn('Speech recognition not supported');
			return false;
		}

		this.recognition = new SpeechRecognition();
		this.recognition.continuous = false;
		this.recognition.interimResults = true;
		this.recognition.lang = 'en-US';
		this.recognition.maxAlternatives = 1;

		this.isSupported = true;
		this.isInitialized = true;
		return true;
	}

	startListening(
		onResult: (transcript: string, isFinal: boolean) => void,
		onError: (error: string) => void,
		onStart: () => void,
		onEnd: () => void
	): boolean {
		if (!this.isSupported || !this.recognition) {
			onError('Speech recognition not supported');
			return false;
		}

		this.recognition.onstart = () => {
			onStart();
		};

		this.recognition.onresult = (event: SpeechRecognitionEvent) => {
			let transcript = '';
			let isFinal = false;

			for (let i = event.resultIndex; i < event.results.length; i++) {
				const result = event.results[i];
				transcript += result[0].transcript;
				if (result.isFinal) {
					isFinal = true;
				}
			}

			onResult(transcript, isFinal);
		};

		this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
			let errorMessage = 'Speech recognition error';

			switch (event.error) {
				case 'no-speech':
					errorMessage = 'No speech detected. Please try speaking again.';
					break;
				case 'audio-capture':
					errorMessage = 'Microphone not available. Please check your microphone settings.';
					break;
				case 'not-allowed':
					errorMessage = 'Microphone access denied. Please allow microphone access.';
					break;
				case 'network':
					errorMessage = 'Network error. Please check your internet connection.';
					break;
				default:
					errorMessage = `Speech recognition error: ${event.error}`;
			}

			onError(errorMessage);
		};

		this.recognition.onend = () => {
			onEnd();
		};

		try {
			this.recognition.start();
			return true;
		} catch (error) {
			onError('Failed to start speech recognition');
			return false;
		}
	}

	stopListening(): void {
		if (this.recognition) {
			this.recognition.stop();
		}
	}

	async speak(text: string): Promise<void> {
		if (!browser || !('speechSynthesis' in window)) {
			console.warn('Text-to-speech not supported');
			return;
		}

		// Cancel any ongoing speech
		speechSynthesis.cancel();

		return new Promise((resolve) => {
			const utterance = new SpeechSynthesisUtterance(text);
			utterance.rate = 0.9;
			utterance.pitch = 1;
			utterance.volume = 1;

			utterance.onend = () => resolve();
			utterance.onerror = () => resolve();

			speechSynthesis.speak(utterance);
		});
	}
	stopSpeaking(): void {
		if (browser && 'speechSynthesis' in window) {
			speechSynthesis.cancel();
		}
	}

	stop(): void {
		this.stopListening();
		this.stopSpeaking();
	}
	get supported(): boolean {
		if (!this.isInitialized) {
			this.init();
		}
		return this.isSupported;
	}
}

// Create and initialize the service
const speechService = new SpeechService();
speechService.init();

export { speechService };
