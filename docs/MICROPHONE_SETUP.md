# Microphone Access Setup Guide

## Problem

When accessing the CareScribe app from a local network IP address (like `192.168.20.78`), the browser blocks microphone access due to security restrictions. Modern browsers require HTTPS for accessing sensitive APIs like `getUserMedia` when not on localhost.

## Quick Fix Options

### Option 1: Use Localhost (Easiest)

Instead of accessing via IP address, use:
- http://localhost:3000
- http://127.0.0.1:3000

Microphone access works on these URLs even with HTTP.

### Option 2: Enable HTTPS (Recommended for Network Access)

If you need to access the app from other devices on your network:

1. **Run the HTTPS setup script:**
   ```bash
   npm run setup:https
   ```

2. **Start the HTTPS server:**
   ```bash
   npm run dev:https
   ```

3. **Access the app via HTTPS:**
   - https://localhost:3443
   - https://127.0.0.1:3443
   - https://192.168.20.78:3443 (your local IP)

### Option 3: Use a Different Browser

Firefox may be more permissive with local network IPs over HTTP. Try accessing the same URL in Firefox.

### Option 4: Use ngrok (For Remote Access)

For temporary public HTTPS access:

1. Install ngrok: `brew install ngrok`
2. Run: `ngrok http 3000`
3. Use the provided HTTPS URL

## Technical Details

The app now includes:

1. **Enhanced MediaDevices Detection**: Waits for the API to be available and attempts to polyfill if needed
2. **Better Error Messages**: Specific guidance based on the exact issue
3. **HTTPS Development Server**: Custom server that supports HTTPS with local certificates
4. **Automatic Fallbacks**: Legacy API support for older browsers

## Troubleshooting

### "MediaDevices API not available"
- Make sure you're using a modern browser (Chrome 53+, Firefox 36+, Safari 11+)
- Check if JavaScript is enabled
- Try refreshing the page

### "Permission Denied"
- Click the camera/microphone icon in the address bar
- Select "Allow" for microphone access
- Refresh the page

### "Microphone In Use"
- Close other apps using the microphone (Zoom, Teams, etc.)
- Check system audio settings
- Try again in a few seconds

### Certificate Issues
- Make sure mkcert is installed: `brew install mkcert`
- Run `mkcert -install` to trust the local CA
- Regenerate certificates if needed

## Browser Compatibility

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 53+ | Requires HTTPS for network IPs |
| Firefox | 36+ | More permissive with local IPs |
| Safari | 11+ | Requires HTTPS |
| Edge | 12+ | Requires HTTPS for network IPs |

## Security Notes

- The HTTPS certificates are for local development only
- Don't commit certificates to version control
- For production, use proper SSL certificates
- Always test microphone permissions in your target environment