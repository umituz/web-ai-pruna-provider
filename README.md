# @umituz/pruna-provider

> Pruna AI generation client for web applications - text-to-image, image-to-image, and image-to-video generation.

## Features

- 🎨 **Text-to-Image** - Generate images from text prompts
- 🖼️ **Image-to-Image** - Edit images with text prompts
- 🎬 **Image-to-Video** - Animate images to videos
- 🔄 **Two-step Pipeline** - Text → Image → Video generation
- ⚛️ **React Hooks** - Easy integration with React apps
- 🌐 **Universal** - Works in browser and Node.js (18+)

## Installation

```bash
npm install @umituz/pruna-provider
```

## Usage

### Core Functions

```typescript
import { generate, generateImageThenVideo } from '@umituz/pruna-provider/core';

// Text to Image
const result = await generate(apiKey, {
  model: 'p-image',
  prompt: 'A beautiful sunset over mountains',
  aspect_ratio: '16:9'
});

// Image to Video
const videoResult = await generate(apiKey, {
  model: 'p-video',
  prompt: 'Gentle camera movement',
  image: 'https://example.com/image.jpg',
  duration: 5,
  resolution: '720p'
});

// Two-step pipeline: Text → Image → Video
const video = await generateImageThenVideo(apiKey, {
  prompt: 'A serene lake at dawn',
  aspect_ratio: '16:9',
  duration: 5
});
```

### React Hooks

```typescript
import { usePrunaGeneration } from '@umituz/pruna-provider/hooks';

function ImageGenerator() {
  const { result, isLoading, error, generate } = usePrunaGeneration(apiKey, {
    onSuccess: (result) => console.log('Generated:', result.url),
    onError: (error) => console.error('Error:', error.message),
    onProgress: (stage) => console.log('Stage:', stage)
  });

  return (
    <button onClick={() => generate({ model: 'p-image', prompt: '...' })}>
      {isLoading ? 'Generating...' : 'Generate'}
    </button>
  );
}
```

## Subpath Exports

Use subpath imports for better tree-shaking:

```typescript
// Core functions (browser + Node.js)
import { generate } from '@umituz/pruna-provider/core';

// React hooks (browser only)
import { usePrunaGeneration } from '@umituz/pruna-provider/hooks';

// Generation domain
import { generateImageThenVideo } from '@umituz/pruna-provider/generation';
```

## API Reference

### Models

- `p-image` - Text-to-image generation
- `p-image-edit` - Image-to-image editing
- `p-video` - Image-to-video animation

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `aspect_ratio` | `'16:9' \| '9:16' \| '1:1' \| '4:3' \| '3:4' \| '3:2' \| '2:3'` | `'16:9'` | Output aspect ratio |
| `resolution` | `'720p' \| '1080p'` | `'720p'` | Video resolution |
| `duration` | `number` | `5` | Video duration in seconds |
| `seed` | `number` | - | Random seed for reproducibility |
| `draft` | `boolean` | `false` | Draft quality (faster) |

## License

MIT

## Repository

https://github.com/umituz/web-ai-pruna-provider
