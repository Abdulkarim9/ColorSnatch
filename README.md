# ColorSnatch Chrome Extension

A simple Chrome extension that lets you grab the background color from any element on a webpage with a single click.

## Features

- One-click color extraction from any webpage element
- Supports solid colors RGB
- Copy colors directly to the clipboard
- Simple toast notification with the captured color value
- Keyboard shortcut support (Alt+S)
- Right-click context menu option

## Installation

### From Source (Developer Mode)

1. Clone or download this repository to your local machine
2. Add your own icons to the `icons` directory (16px, 48px, and 128px sizes)
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode" in the top-right corner
5. Click "Load unpacked" and select the directory containing the extension files
6. The extension should now be installed and ready to use

## Usage

There are three ways to activate ColorSnatch:

1. **Click the extension icon** in your browser toolbar
2. **Use the keyboard shortcut** `Alt+S` (configurable in extension settings)
3. **Right-click** on any webpage and select "Snatch color" from the context menu

Once activated:
- Your cursor will change to a crosshair
- Click on any element to capture its background color or gradient
- The color will be copied to your clipboard automatically
- A toast notification will show the captured color value
- Press `ESC` to cancel the selection

## Project Structure

- `manifest.json` - Extension configuration
- `background.js` - Service worker for background tasks
- `content.js` - Main functionality script
- `popup.html` - Extension popup with instructions
- `toast.css` - Styling for toast notifications
- `icons/` - Directory for extension icons

## License

This project is open source and available under the MIT License. 
