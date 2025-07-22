# FigGen - AI Design Generator for Figma

FigGen is a powerful Figma plugin that leverages Google's generative AI API to automatically generate UI designs from text descriptions. Transform your ideas into fully-styled Figma designs with just a few words.

## Features

- 🎨 Generate complete UI designs from text descriptions
- 🔄 Auto-layout support for responsive designs
- 🎯 Modern UI patterns and components
- 💫 Automatic styling with shadows, colors, and spacing
- 🔒 Secure API key management
- 💾 Persistent settings across sessions

## Installation

1. Open Figma desktop app
2. Go to Menu > Plugins > Development > Import plugin from manifest...
3. Select the `manifest.json` file from this repository
4. The plugin will now be available in your Figma plugins

## Usage

1. Open the plugin in Figma
2. Enter your Google API key (required only once)
3. Type a description of the design you want to create
4. Click "Generate Design"
5. The plugin will create a new frame with your generated design

### Example Prompts 

- A login page with a logo, email input, password input, and a login button
- A dashboard with a sidebar, a header, and a main content area
- A chat interface with a message input, a send button, and a chat history

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Figma desktop app

### Setup

```bash
# Clone the repository
git clone https://github.com/mujahidinfo/fig-gen.git

# Install dependencies
npm install

# Start development build
npm run watch
```

### Building

```bash
# Create production build
npm run build
```

## Configuration

The plugin requires a Google API key to function. Users can enter their API key through the plugin interface, which is securely stored in Figma's client storage.

## Security

- API keys are stored securely using Figma's client storage
- No sensitive data is transmitted except to Google's API
- All network requests are made over HTTPS

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Mujahid Islam**
- GitHub: [@mujahidinfo](https://github.com/mujahidinfo)
- LinkedIn: [Mujahid Islam](https://linkedin.com/in/mujahidinfo)

## Acknowledgments

- Google for providing the generative AI API
- Figma for their excellent plugin API
- The Figma community for inspiration and support

---

Made with ❤️ by Mujahid Islam
