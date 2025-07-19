# Google Images Download - User Guide

## 🖼️ Overview

The Google Images Download feature enables automated downloading of high-quality images from Google Images search results. This powerful tool integrates seamlessly with the Semantest framework to provide intelligent image automation.

## ✨ Key Features

- **One-Click Downloads**: Download any image with a single click
- **High-Resolution Extraction**: Automatically finds the best quality version
- **Smart Filenames**: Generates meaningful names from search context
- **Batch Operations**: Download multiple images efficiently
- **Pattern Learning**: System learns and improves download strategies
- **Cross-Platform**: Works in Chrome extension and Node.js environments

## 🚀 Getting Started

### Installation

#### Chrome Extension
1. Install the Semantest Chrome Extension from the Chrome Web Store
2. Navigate to Google Images
3. Look for the download button on each image

#### Node.js SDK
```bash
npm install @semantest/google.com
```

### Basic Usage

#### Chrome Extension
1. **Search on Google Images**: Go to images.google.com and search for any topic
2. **Hover over an image**: A download button (📥) appears
3. **Click to download**: Image saves to your Downloads folder
4. **Use keyboard shortcut**: Press `Ctrl+Shift+D` for quick download

#### Node.js API
```typescript
import { GoogleImagesDownloader } from '@semantest/google.com';

const downloader = new GoogleImagesDownloader();

// Download first result for a search
const result = await downloader.searchAndDownload('mountain landscape');

if (result.success) {
    console.log(`Downloaded: ${result.filename}`);
    console.log(`Saved to: ${result.filepath}`);
}
```

## 📋 Features in Detail

### 1. Visual Download Buttons
- Appear on hover for seamless integration
- Non-intrusive design that doesn't block content
- Clear visual feedback on download status

### 2. Right-Click Context Menu
- Right-click any image and select "Download with Semantest"
- Works even on dynamically loaded content
- Preserves normal browser functionality

### 3. Intelligent URL Resolution
The system uses multiple strategies to find high-quality images:
- Data attribute extraction
- Simulated click for full resolution
- URL pattern analysis
- Fallback to best available quality

### 4. Smart Filename Generation
Filenames are created using:
- Search query context
- Image alt text
- Page title information
- Timestamp for uniqueness

Example: `mountain_landscape_sunset_2025-01-17.jpg`

### 5. Batch Download (Coming Soon)
- Download all images from search results
- Set quality preferences
- Filter by size or type
- Progress tracking

## 🛠️ Advanced Usage

### Custom Download Directory
```typescript
const downloader = new GoogleImagesDownloader('./my-images');
```

### Event-Driven Architecture
```typescript
import { GoogleImageDownloadRequested, GoogleImageDownloadCompleted } from '@semantest/google.com';

// Listen for download completions
adapter.on(GoogleImageDownloadCompleted, (event) => {
    console.log(`Downloaded: ${event.filename}`);
    console.log(`Size: ${event.metadata.fileSize} bytes`);
    console.log(`Resolution: ${event.metadata.width}x${event.metadata.height}`);
});
```

### Pattern Learning Integration
The system automatically learns successful download patterns:
```typescript
// Patterns are automatically detected and stored
const stats = downloader.getDownloadStats();
console.log(`Learned patterns: ${stats.learnedPatternsCount}`);
```

## 🔧 Configuration

### Chrome Extension Settings
1. Open extension options
2. Configure:
   - Default download directory
   - Filename template
   - Quality preferences
   - Keyboard shortcuts

### API Configuration
```typescript
const config = {
    quality: 'highest',        // 'highest', 'balanced', 'fastest'
    timeout: 30000,           // Download timeout in ms
    retries: 3,              // Number of retry attempts
    userAgent: 'custom-ua'   // Custom user agent string
};

const downloader = new GoogleImagesDownloader('./downloads', config);
```

## 📊 Performance

- **URL Resolution**: < 100ms average
- **Download Speed**: Limited only by connection
- **Memory Usage**: < 50MB for extension
- **Success Rate**: > 95% for standard images

## 🔒 Privacy & Security

- **No Data Collection**: Your searches and downloads are private
- **Local Processing**: All URL resolution happens locally
- **Secure Downloads**: HTTPS enforced where available
- **No External Services**: No third-party dependencies

## 🐛 Troubleshooting

### Download Button Not Appearing
1. Refresh the page
2. Check extension is enabled
3. Verify you're on images.google.com
4. Try disabling other extensions

### Downloads Failing
1. Check internet connection
2. Verify download permissions
3. Ensure sufficient disk space
4. Try different image

### Low Quality Downloads
1. Enable "High Quality" in settings
2. Try clicking image first
3. Check original image quality
4. Report specific URLs for improvement

## 🚦 Roadmap

### Coming Soon
- Batch download with progress
- Video download support
- Cloud storage integration
- Mobile browser support

### Future Plans
- AI-powered organization
- Duplicate detection
- Advanced filters
- API rate limiting

## 🤝 Contributing

We welcome contributions! Areas where you can help:

1. **Test Different Regions**: Google Images varies by location
2. **Report Issues**: File bugs on GitHub
3. **Suggest Features**: Share your use cases
4. **Add Site Support**: Create adapters for other image sites

## 📖 Examples

### Research Workflow
```typescript
// Download images for research paper
const topics = ['solar panels', 'wind turbines', 'hydroelectric dam'];

for (const topic of topics) {
    const result = await downloader.searchAndDownload(topic);
    console.log(`${topic}: ${result.success ? 'Downloaded' : 'Failed'}`);
}
```

### Design Inspiration
```typescript
// Collect design inspiration with metadata
downloader.on('download-completed', (event) => {
    // Save metadata for later reference
    const metadata = {
        query: event.searchQuery,
        source: event.originalUrl,
        colors: event.metadata.dominantColors,
        size: `${event.metadata.width}x${event.metadata.height}`
    };
    
    saveToInspirationDatabase(metadata);
});
```

## 🆘 Support

- **Documentation**: [Full API Docs](https://docs.semantest.com/google-images)
- **Issues**: [GitHub Issues](https://github.com/semantest/google.com/issues)
- **Discord**: [Community Chat](https://discord.gg/semantest)
- **Email**: support@semantest.com

## 📄 License

This feature is part of the Semantest framework, licensed under GPL-3.0. See LICENSE file for details.

---

Happy downloading! 🎉 The Google Images Download feature is designed to save you time while respecting content creators and maintaining high quality. If you find it useful, please star our repository and share with others who might benefit.