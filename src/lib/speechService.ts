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
	private initPromise: Promise<boolean> | null = null;

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

	// Async method to check support with proper timing
	async checkSupportAsync(): Promise<boolean> {
		if (this.initPromise) {
			return this.initPromise;
		}

		this.initPromise = new Promise((resolve) => {
			if (this.isInitialized) {
				resolve(this.isSupported);
				return;
			}

			// Give the browser some time to initialize speech recognition
			setTimeout(() => {
				const result = this.init();
				resolve(result);
			}, 100);
		});

		return this.initPromise;
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
					this.setVoice(utterance);
					speechSynthesis.speak(utterance);
				};
			} else {
				this.setVoice(utterance);
				speechSynthesis.speak(utterance);
			}

			utterance.rate = 1.0;
			utterance.pitch = 1.3;
			utterance.volume = 1;

			utterance.onend = () => resolve();
			utterance.onerror = () => resolve();
		});
	}

	private setVoice(utterance: SpeechSynthesisUtterance): void {
		const voices = speechSynthesis.getVoices();

		// Priority order for voices
		const voiceNames = [
			'Google US English Female',
			'Microsoft Jenny Desktop',
			'Microsoft Aria Desktop',
			'Samantha',
			'Google UK English Female',
			'Microsoft Zira Desktop',
			'Karen',
			'Google English (US)',
			'Anna',
			'Microsoft Hazel Desktop',
			'Helena',
			'Susan',
			'Catherine'
		];

		// First try to find voices by exact name match
		for (const voiceName of voiceNames) {
			const voice = voices.find((v) => v.name === voiceName);
			if (voice) {
				utterance.voice = voice;
				return;
			}
		}

		// Fallback: find any voice by name patterns
		const fallbackVoice = voices.find(
			(voice) =>
				voice.lang.startsWith('en') &&
				(voice.name.toLowerCase().includes('jenny') ||
					voice.name.toLowerCase().includes('aria') ||
					voice.name.toLowerCase().includes('female') ||
					voice.name.toLowerCase().includes('google') ||
					voice.name.toLowerCase().includes('samantha') ||
					voice.name.toLowerCase().includes('zira') ||
					voice.name.toLowerCase().includes('anna') ||
					voice.name.toLowerCase().includes('karen'))
		);

		if (fallbackVoice) {
			utterance.voice = fallbackVoice;
		}
	}

	getAvailableVoices(): SpeechSynthesisVoice[] {
		if (!browser || !('speechSynthesis' in window)) {
			return [];
		}
		return speechSynthesis.getVoices().filter((voice) => voice.lang.startsWith('en'));
	}

	getVoices(): SpeechSynthesisVoice[] {
		if (!browser || !('speechSynthesis' in window)) {
			return [];
		}

		const voices = speechSynthesis.getVoices();
		const voiceNames = [
			'Google US English Female',
			'Microsoft Jenny Desktop',
			'Microsoft Aria Desktop',
			'Samantha',
			'Google UK English Female',
			'Microsoft Zira Desktop',
			'Karen',
			'Google English (US)',
			'Anna'
		];

		return voices.filter(
			(voice) =>
				voice.lang.startsWith('en') &&
				(voiceNames.includes(voice.name) ||
					voice.name.toLowerCase().includes('jenny') ||
					voice.name.toLowerCase().includes('aria') ||
					voice.name.toLowerCase().includes('female') ||
					voice.name.toLowerCase().includes('google'))
		);
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
