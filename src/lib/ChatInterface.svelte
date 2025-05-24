<script lang="ts">
	import type { Message } from './types';
	import { afterUpdate, createEventDispatcher, onMount } from 'svelte';
	import SpeechControls from './SpeechControls.svelte';
	export let messages: Message[] = [];
	export let isLoading = false;
	export let isListening = false;
	export let isSpeaking = false;

	const dispatch = createEventDispatcher();
	let messagesContainer: HTMLElement;

	function formatTime(date: Date): string {
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	function scrollToBottom() {
		if (messagesContainer) {
			messagesContainer.scrollTo({
				top: messagesContainer.scrollHeight,
				behavior: 'smooth'
			});
		}
	}

	function startNewChat() {
		dispatch('newChat');
	}

	function handleSpeechResult(event: CustomEvent) {
		dispatch('speechResult', event.detail);
	}

	function handleListeningChange(event: CustomEvent) {
		dispatch('listeningChange', event.detail);
	}

	// Scroll to bottom after each update
	afterUpdate(() => {
		scrollToBottom();
	});
</script>

<div class="chat-app">
	<!-- Header -->
	<div class="chat-header">
		<div class="header-background"></div>
		<div class="header-content">
			<div class="chat-info">
				<div class="chat-avatar">
					<img src="/images/maya.png" alt="Maya" class="header-avatar-image" />
					<div class="online-indicator"></div>
				</div>
				<div class="chat-details">
					<div class="app-title">
						<h1>maya</h1>
					</div>
					<div class="chat-status">
						<span
							class="status-dot {isListening ? 'listening' : isSpeaking ? 'speaking' : 'online'}"
						></span>
						<span class="status-text"
							>{isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Online'}</span
						>
					</div>
				</div>
			</div>
			<div class="chat-actions">
				{#if messages.length > 0}
					<button
						class="new-chat-btn"
						on:click={startNewChat}
						title="Start new conversation"
						aria-label="Start new conversation"
					>
						<svg
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M12 5v14m-7-7h14" />
						</svg>
					</button>
				{/if}
			</div>
		</div>
	</div>
	<!-- Messages -->
	<div class="messages-container" bind:this={messagesContainer}>
		{#if messages.length === 0}
			<div class="welcome-container">
				<div class="welcome-message">
					<div class="welcome-icon">🎙️</div>
					<p>
						Your intelligent voice assistant is ready to help. Click the microphone button to start
						a conversation!
					</p>
					<div class="feature-highlights">
						<div class="feature">
							<span class="feature-icon">🗣️</span>
							<span>Talk Directly</span>
						</div>
						<div class="feature">
							<span class="feature-icon">🤖</span>
							<span>AI Powered</span>
						</div>
						<div class="feature">
							<span class="feature-icon">🔊</span>
							<span>Text-to-Speech</span>
						</div>
					</div>
				</div>
			</div>
		{/if}

		{#each messages as message (message.id)}
			<div class="message-wrapper {message.sender}">
				{#if message.sender === 'assistant'}
					<div class="message-avatar">
						<img src="/images/maya.png" alt="Maya" class="avatar-image" />
					</div>
				{/if}
				<div class="message-bubble">
					<div class="message-text">{message.text}</div>
					<div class="message-time">{formatTime(message.timestamp)}</div>
				</div>
				{#if message.sender === 'user'}
					<div class="message-avatar">
						<img src="/images/user.png" alt="User" class="avatar-image" />
					</div>
				{/if}
			</div>
		{/each}

		{#if isLoading}
			<div class="message-wrapper assistant">
				<div class="message-avatar">
					<img src="/images/maya.png" alt="Maya" class="avatar-image" />
				</div>
				<div class="message-bubble">
					<div class="typing-indicator">
						<span></span>
						<span></span>
						<span></span>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Input Area -->
	<div class="input-area">
		<SpeechControls
			{isListening}
			on:speechResult={handleSpeechResult}
			on:listeningChange={handleListeningChange}
		/>
	</div>
</div>

<style>
	.chat-app {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: #ffffff;
		overflow: hidden;
	} /* Header */
	.chat-header {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
		color: white;
		padding: 0.75rem 1rem;
		box-shadow:
			0 4px 20px rgba(102, 126, 234, 0.3),
			0 8px 40px rgba(118, 75, 162, 0.2);
		z-index: 10;
		flex-shrink: 0;
		position: sticky;
		top: 0;
		overflow: hidden;
		position: relative;
		animation: slideInDown 0.6s ease-out;
	}

	.header-background {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background:
			radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
			radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%);
		pointer-events: none;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		max-width: 100%;
		position: relative;
		z-index: 1;
	}

	.chat-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
	}

	.chat-avatar {
		position: relative;
		width: 36px;
		height: 36px;
		flex-shrink: 0;
	}

	.header-avatar-image {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		border: 2px solid rgba(255, 255, 255, 0.3);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.online-indicator {
		position: absolute;
		bottom: 1px;
		right: 1px;
		width: 10px;
		height: 10px;
		background: #4ade80;
		border: 2px solid white;
		border-radius: 50%;
		box-shadow: 0 0 8px rgba(74, 222, 128, 0.6);
	}

	.chat-details {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.125rem;
		flex: 1;
	}

	.app-title {
		display: flex;
		align-items: center;
	}

	.chat-status {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.chat-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.app-title h1 {
		margin: 0;
		font-size: 1.75rem;
		font-weight: 600;
		font-family: 'Comic Neue', 'Trebuchet MS', 'Verdana', 'Georgia', 'Times New Roman', serif;
		background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		line-height: 1.1;
	}

	.subtitle {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.8);
		font-weight: 400;
		margin-top: 2px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		transition: all 0.3s ease;
		position: relative;
	}
	.status-dot.online {
		background: #4ade80;
		box-shadow: 0 0 6px rgba(74, 222, 128, 0.4);
	}

	.status-dot.listening {
		background: #f59e0b;
		box-shadow: 0 0 8px rgba(245, 158, 11, 0.6);
		animation: pulse-glow 1.5s infinite;
	}

	.status-dot.speaking {
		background: #3b82f6;
		box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
		animation: pulse-glow 1.5s infinite;
	}

	.status-dot.listening::after {
		content: '';
		position: absolute;
		top: -2px;
		left: -2px;
		right: -2px;
		bottom: -2px;
		border-radius: 50%;
		background: rgba(245, 158, 11, 0.3);
		animation: pulse-ring 1.5s infinite;
	}

	.status-text {
		font-size: 0.7rem;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.9);
		letter-spacing: 0.025em;
	}

	.new-chat-btn {
		background: rgba(255, 255, 255, 0.15);
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.2);
		padding: 0.5rem;
		border-radius: 10px;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		backdrop-filter: blur(10px);
		position: relative;
		overflow: hidden;
	}

	.new-chat-btn::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.6s ease;
	}

	.new-chat-btn:hover {
		background: rgba(255, 255, 255, 0.25);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.new-chat-btn:hover::before {
		left: 100%;
	}

	.new-chat-btn:active {
		transform: translateY(0);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}
	@keyframes pulse-glow {
		0%,
		100% {
			box-shadow: 0 0 8px rgba(74, 222, 128, 0.6);
		}
		50% {
			box-shadow:
				0 0 16px rgba(74, 222, 128, 0.8),
				0 0 24px rgba(74, 222, 128, 0.4);
		}
	}

	@keyframes pulse-ring {
		0% {
			transform: scale(1);
			opacity: 1;
		}
		100% {
			transform: scale(2);
			opacity: 0;
		}
	}
	@keyframes slideInDown {
		0% {
			opacity: 0;
			transform: translateY(-20px);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes bounce {
		0%,
		20%,
		50%,
		80%,
		100% {
			transform: translateY(0);
		}
		40% {
			transform: translateY(-10px);
		}
		60% {
			transform: translateY(-5px);
		}
	}

	@keyframes fadeIn {
		0% {
			opacity: 0;
			transform: translateY(20px);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
		}
	} /* Messages */
	.messages-container {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		padding: 1rem;
		background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-height: 0;
	}
	.welcome-message {
		text-align: center;
		color: #6b7280;
		padding: 2rem 1rem;
		margin: auto 0;
		animation: fadeIn 0.8s ease-out;
	}

	.welcome-container {
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1;
		min-height: 300px;
	}

	.welcome-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
		animation: bounce 2s infinite;
	}

	.welcome-message h2 {
		margin: 0 0 1rem 0;
		color: #374151;
		font-size: 1.5rem;
		font-weight: 600;
	}

	.welcome-message p {
		margin: 0 0 2rem 0;
		font-size: 1rem;
		line-height: 1.5;
		max-width: 300px;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 2rem;
	}

	.feature-highlights {
		display: flex;
		gap: 1.5rem;
		justify-content: center;
		flex-wrap: wrap;
		margin-top: 1rem;
	}

	.feature {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem;
		background: white;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		transition: all 0.3s ease;
		min-width: 100px;
	}

	.feature:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
	}

	.feature-icon {
		font-size: 1.5rem;
	}

	.feature span:last-child {
		font-size: 0.85rem;
		font-weight: 500;
		color: #374151;
	}

	.message-wrapper {
		display: flex;
		margin-bottom: 0.5rem;
		align-items: flex-end;
		gap: 0.5rem;
	}

	.message-wrapper.user {
		justify-content: flex-end;
	}

	.message-wrapper.assistant {
		justify-content: flex-start;
	}

	.message-avatar {
		width: 32px;
		height: 32px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.avatar-image {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s ease;
	}

	.avatar-image:hover {
		transform: scale(1.05);
	}
	.message-bubble {
		max-width: calc(80% - 40px);
		padding: 0.75rem 1rem;
		border-radius: 1.25rem;
		position: relative;
		word-wrap: break-word;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
		transition: all 0.2s ease;
	}

	.message-bubble:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
	}
	.message-wrapper.user .message-bubble {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-bottom-right-radius: 0.5rem;
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
	}

	.message-wrapper.assistant .message-bubble {
		background: white;
		color: #374151;
		border: 1px solid #e5e7eb;
		border-bottom-left-radius: 0.5rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.message-text {
		line-height: 1.4;
		margin-bottom: 0.25rem;
	}

	.message-time {
		font-size: 0.7rem;
		opacity: 0.7;
		text-align: right;
	}

	.message-wrapper.assistant .message-time {
		text-align: left;
	}

	.typing-indicator {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0;
	}

	.typing-indicator span {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #9ca3af;
		animation: typing 1.4s infinite ease-in-out;
	}

	.typing-indicator span:nth-child(1) {
		animation-delay: -0.32s;
	}

	.typing-indicator span:nth-child(2) {
		animation-delay: -0.16s;
	}
	/* Input Area */
	.input-area {
		background: white;
		border-top: 1px solid #e5e7eb;
		padding: 1rem;
		flex-shrink: 0;
		position: sticky;
		bottom: 0;
		z-index: 10;
	}

	/* Animations */
	@keyframes pulse-dot {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.7;
			transform: scale(1.2);
		}
	}

	@keyframes typing {
		0%,
		80%,
		100% {
			transform: scale(0.8);
			opacity: 0.5;
		}
		40% {
			transform: scale(1);
			opacity: 1;
		}
	}

	/* Scrollbar styling */
	.messages-container::-webkit-scrollbar {
		width: 4px;
	}

	.messages-container::-webkit-scrollbar-track {
		background: transparent;
	}

	.messages-container::-webkit-scrollbar-thumb {
		background: rgba(0, 0, 0, 0.2);
		border-radius: 2px;
	}
	/* Mobile optimizations */
	@media (max-width: 480px) {
		.chat-header {
			padding: 0.6rem 0.75rem;
		}

		.chat-info {
			gap: 0.6rem;
		}

		.chat-avatar {
			width: 32px;
			height: 32px;
		}

		.online-indicator {
			width: 8px;
			height: 8px;
			bottom: 0px;
			right: 0px;
		}

		.app-title h1 {
			font-size: 1.5rem;
		}

		.status-text {
			font-size: 0.65rem;
		}

		.new-chat-btn {
			width: 32px;
			height: 32px;
			padding: 0.4rem;
		}

		.messages-container {
			padding: 0.75rem;
		}

		.message-bubble {
			max-width: calc(85% - 40px);
		}

		.message-avatar {
			width: 28px;
			height: 28px;
		}

		.welcome-message {
			padding: 1.5rem 1rem;
		}

		.welcome-icon {
			font-size: 2.5rem;
		}

		.welcome-message h2 {
			font-size: 1.25rem;
		}

		.input-area {
			padding: 0.75rem;
		}
	}
	/* Tablet and desktop */
	@media (min-width: 768px) {
		.message-bubble {
			max-width: 65%;
		}

		.messages-container {
			padding: 2rem;
			gap: 1.25rem;
		}

		.message-wrapper {
			margin-bottom: 0.75rem;
		}

		.message-avatar {
			width: 36px;
			height: 36px;
		}

		.message-bubble {
			padding: 1rem 1.25rem;
			font-size: 0.95rem;
		}

		.chat-header {
			padding: 1rem 2rem;
		}

		.header-content {
			max-width: none;
		}
		.input-area {
			padding: 1.5rem 2rem;
			background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
		}

		.welcome-message {
			padding: 3rem 2rem;
		}

		.welcome-message h2 {
			font-size: 1.75rem;
		}

		.welcome-message p {
			max-width: 400px;
			font-size: 1.1rem;
		}

		.feature-highlights {
			gap: 2rem;
		}

		.feature {
			padding: 1.25rem;
			min-width: 120px;
		}
	}

	@media (min-width: 1024px) {
		.message-bubble {
			max-width: 60%;
		}

		.messages-container {
			padding: 2.5rem;
			gap: 1.5rem;
		}

		.message-bubble {
			padding: 1.25rem 1.5rem;
			font-size: 1rem;
			line-height: 1.6;
		}

		.message-wrapper {
			margin-bottom: 1rem;
		}

		.avatar-image {
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		}

		.chat-header {
			padding: 1.25rem 2.5rem;
		}

		.input-area {
			padding: 2rem 2.5rem;
		}
	}

	@media (min-width: 1200px) {
		.message-bubble {
			max-width: 55%;
		}

		.messages-container {
			padding: 3rem;
		}

		.chat-header {
			padding: 1.5rem 3rem;
		}

		.input-area {
			padding: 2rem 3rem;
		}

		.app-title h1 {
			font-size: 2rem;
		}

		.message-bubble {
			font-size: 1.05rem;
			padding: 1.5rem 1.75rem;
		}
		.message-avatar {
			width: 40px;
			height: 40px;
		}

		.welcome-message {
			padding: 4rem 3rem;
		}

		.welcome-message h2 {
			font-size: 2.25rem;
			margin-bottom: 1.5rem;
		}

		.welcome-message p {
			max-width: 500px;
			font-size: 1.2rem;
			margin-bottom: 3rem;
		}

		.welcome-icon {
			font-size: 4rem;
			margin-bottom: 1.5rem;
		}

		.feature-highlights {
			gap: 2.5rem;
		}

		.feature {
			padding: 1.5rem;
			min-width: 140px;
			border-radius: 16px;
		}

		.feature-icon {
			font-size: 2rem;
		}

		.feature span:last-child {
			font-size: 1rem;
		}
	}
</style>
