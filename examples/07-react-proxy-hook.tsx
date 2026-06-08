/**
 * Example 07: React Hook (Server Proxy)
 * @description Route requests through your own backend to keep the API key secret.
 *              Your proxy endpoint must forward to https://api.pruna.ai.
 */

import { useState } from 'react';
import { usePrunaProxy, type PrunaInput } from '@umituz/pruna-provider';

interface Props {
  proxyUrl: string;
}

export function ProxyImageGenerator({ proxyUrl }: Props) {
  const { result, isLoading, error, generate, cancel } = usePrunaProxy({
    proxyUrl,
    onSuccess: r => console.log('Image ready:', r.url),
    onError: e => console.error('Generation failed:', e.message),
  });

  const [prompt, setPrompt] = useState('A neon cyberpunk alley, rain, glowing signs');

  const handleGenerate = (): void => {
    const input: PrunaInput = { model: 'p-image', prompt };
    void generate(input);
  };

  return (
    <div>
      <input value={prompt} onChange={e => setPrompt(e.target.value)} disabled={isLoading} />
      <button onClick={handleGenerate} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate'}
      </button>
      {isLoading && <button onClick={cancel}>Cancel</button>}
      {error && <p style={{ color: 'crimson' }}>{error.message}</p>}
      {result && <img src={result.url} alt={prompt} />}
    </div>
  );
}
