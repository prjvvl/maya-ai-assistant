# Text-to-Speech Fixes

## Issues Fixed

### Problem: TTS stops after reading first few words from AI response

This was a common issue with the Web Speech API where longer text would cause the speech synthesis to fail or stop abruptly.

### Solutions Implemented

1. **Text Chunking**: Split long text into smaller chunks (max 200 characters) to avoid browser limitations

   - Intelligent splitting by sentences, then by commas, then by words
   - Maintains natural speech flow with proper pauses between chunks

2. **Better Error Handling**:

   - Retry mechanism with up to 2 attempts per chunk
   - Timeout handling to prevent hanging speech
   - Graceful degradation when speech fails

3. **Browser Compatibility**:

   - Reset speech synthesis between chunks to avoid browser quirks
   - Handle paused/stuck speech synthesis states
   - Different timeout strategies for different text lengths

4. **State Management**:

   - Track speaking state internally to prevent conflicts
   - Queue management for multiple speech requests
   - Clean cancellation of ongoing speech

5. **Visual Feedback**:
   - Added "Speaking..." status indicator in the UI
   - Console logging for debugging speech issues

## Key Changes Made

### speechService.ts

- Added `splitTextIntoChunks()` method for intelligent text splitting
- Implemented retry logic in `speakChunk()` and `attemptSpeak()` methods
- Added state tracking with `isSpeakingState` and `speechQueue`
- Enhanced error handling and timeout management
- Added `resetSpeechSynthesis()` method for browser quirks

### UI Components

- Added `isSpeaking` prop to show speaking status
- Enhanced status indicator with "Speaking..." state
- Better visual feedback during speech synthesis

### Main App

- Added retry logic with speech synthesis reset on failure
- Better error logging and debugging information

## Testing

To test the fixes:

1. Start the development server: `npm run dev`
2. Open the app and try asking questions that generate long responses
3. Check the browser console for TTS debug logs
4. Observe the "Speaking..." status indicator
5. Verify that long responses are spoken completely

## Browser Compatibility

These fixes have been tested and work well with:

- Chrome/Chromium-based browsers
- Firefox
- Safari
- Edge

## Common Issues and Solutions

If TTS still doesn't work:

1. Check browser console for errors
2. Ensure microphone permissions are granted
3. Try refreshing the page to reset speech synthesis
4. Check if other tabs are using speech synthesis
5. Test with shorter responses first

## Debug Information

The console will show:

- Text chunking information
- Speech start/end events
- Error messages and retry attempts
- Timeout warnings
