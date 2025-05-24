# Maya.IO - Talking AI Assistant

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a SvelteKit TypeScript project that creates a talking AI assistant using:

- **Frontend**: SvelteKit with TypeScript
- **Speech Recognition**: Web Speech API (speech-to-text)
- **Text-to-Speech**: Web Speech API (speechSynthesis)
- **AI Backend**: Google Gemini Pro API
- **Architecture**: Clean separation between frontend speech handling and backend AI processing

## Key Features
- Voice input through browser's speech recognition
- Real-time transcription display
- AI responses via Google Gemini
- Text-to-speech output for AI responses
- Responsive chat interface
- Error handling for speech and API failures

## Code Guidelines
- Use TypeScript for all new code
- Follow SvelteKit conventions for routing and API endpoints
- Maintain clean separation between speech services and UI components
- Handle browser compatibility gracefully (especially for speech APIs)
- Use proper error handling for network requests and speech APIs
- Follow accessibility best practices

## File Structure
- `/src/routes/` - SvelteKit pages and API endpoints
- `/src/lib/` - Reusable components and services
- `/src/app.html` - HTML template
- `/static/` - Static assets

## Environment Variables
- `GOOGLE_GEMINI_API_KEY` - Required for AI functionality
