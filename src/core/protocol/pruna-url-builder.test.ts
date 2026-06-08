import { describe, it, expect } from 'vitest';
import {
  isAbsoluteHttpUrl,
  isHttpsUrl,
  buildPrunaApiUrl,
  buildFileUrlById,
} from './pruna-url-builder';
import { PRUNA_BASE_URL, PRUNA_FILES_URL } from '../constants/network';

describe('pruna url builder', () => {
  it('isHttpsUrl matches the https prefix', () => {
    expect(isHttpsUrl('https://cdn/x.jpg')).toBe(true);
    expect(isHttpsUrl('http://x')).toBe(false);
    expect(isHttpsUrl('/x')).toBe(false);
  });

  it('isAbsoluteHttpUrl matches both http and https', () => {
    expect(isAbsoluteHttpUrl('https://cdn/x.jpg')).toBe(true);
    expect(isAbsoluteHttpUrl('http://x')).toBe(true);
    expect(isAbsoluteHttpUrl('/x')).toBe(false);
  });

  it('buildPrunaApiUrl prepends the base to relative paths', () => {
    expect(buildPrunaApiUrl('/v1/x')).toBe(`${PRUNA_BASE_URL}/v1/x`);
  });

  it('buildPrunaApiUrl passes through absolute URLs', () => {
    expect(buildPrunaApiUrl('https://cdn/x.jpg')).toBe('https://cdn/x.jpg');
  });

  it('buildFileUrlById composes a file URL', () => {
    expect(buildFileUrlById('file-123')).toBe(`${PRUNA_FILES_URL}/file-123`);
  });
});
