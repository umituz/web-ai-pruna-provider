/**
 * Example 06: React Hook (Direct API key)
 * @description Drop-in React component for in-browser image generation.
 */

import { useState } from 'react';
import { usePrunaGeneration, type PrunaInput, CancellationError } from '@umituz/pruna-provider';

interface Props {
  apiKey: string;
}

export function ImageGenerator({ apiKey }: Props) {
  const { result, isLoading, error, generate, cancel, reset } = usePrunaGeneration(apiKey, {
    onSuccess: r => console.log('Image ready:', r.url),
    onError: e => console.error('Generation failed:', e.message),
    onProgress: stage => console.log('Stage:', stage),
  });

  const [prompt, setPrompt] = useState('A serene lake at dawn');

  const handleGenerate = (): void => {
    const input: PrunaInput = { model: 'p-image', prompt };
    void generate(input);
  };

  return (
    <div style={{ display: 'grid', gap: 12, maxWidth: 480 }}>
      <label>
        Prompt
        <input
          type="text"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          disabled={isLoading}
          style={{ width: '100%', padding: 8 }}
        />
      </label>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handleGenerate} disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
        {isLoading && <button onClick={cancel}>Cancel</button>}
        {!isLoading && (result || error) && <button onClick={reset}>Reset</button>}
      </div>

      {error && (
        <p style={{ color: 'crimson' }}>
          {error instanceof CancellationError ? 'Cancelled' : error.message}
        </p>
      )}

      {result && (
        <a href={result.url} target="_blank" rel="noreferrer">
          <img src={result.url} alt={prompt} style={{ width: '100%', borderRadius: 8 }} />
        </a>
      )}
    </div>
  );
}
