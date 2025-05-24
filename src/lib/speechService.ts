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

			// Get available voices and select a female voice
			const voices = speechSynthesis.getVoices();

			// If voices aren't loaded yet, wait for them
			if (voices.length === 0) {
				speechSynthesis.onvoiceschanged = () => {
					this.setFemaleVoice(utterance);
					speechSynthesis.speak(utterance);
				};
			} else {
				this.setFemaleVoice(utterance);
				speechSynthesis.speak(utterance);
			}

			utterance.rate = 0.9;
			utterance.pitch = 1.1; // Slightly higher pitch for more feminine sound
			utterance.volume = 1;

			utterance.onend = () => resolve();
			utterance.onerror = () => resolve();
		});
	}

	private setFemaleVoice(utterance: SpeechSynthesisUtterance): void {
		const voices = speechSynthesis.getVoices();

		// Priority order for female voices
		const femaleVoiceNames = [
			'Samantha', // macOS
			'Google US English Female', // Chrome
			'Microsoft Zira Desktop', // Windows
			'Karen', // macOS
			'Google UK English Female', // Chrome
			'Microsoft Hazel Desktop', // Windows
			'Anna', // Various systems
			'Helena', // Various systems
			'Susan', // Various systems
			'Catherine' // Various systems
		];

		// First try to find voices by exact name match
		for (const voiceName of femaleVoiceNames) {
			const voice = voices.find((v) => v.name === voiceName);
			if (voice) {
				utterance.voice = voice;
				return;
			}
		}

		// Fallback: find any female voice by name patterns
		const femaleVoice = voices.find(
			(voice) =>
				voice.lang.startsWith('en') &&
				(voice.name.toLowerCase().includes('female') ||
					voice.name.toLowerCase().includes('woman') ||
					voice.name.toLowerCase().includes('zira') ||
					voice.name.toLowerCase().includes('hazel') ||
					voice.name.toLowerCase().includes('susan') ||
					voice.name.toLowerCase().includes('samantha') ||
					voice.name.toLowerCase().includes('karen') ||
					voice.name.toLowerCase().includes('catherine') ||
					voice.name.toLowerCase().includes('anna') ||
					voice.name.toLowerCase().includes('helena'))
		);

		if (femaleVoice) {
			utterance.voice = femaleVoice;
		}
	}

	getAvailableVoices(): SpeechSynthesisVoice[] {
		if (!browser || !('speechSynthesis' in window)) {
			return [];
		}
		return speechSynthesis.getVoices().filter((voice) => voice.lang.startsWith('en'));
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
