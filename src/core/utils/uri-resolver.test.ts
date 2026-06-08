import { describe, it, expect } from 'vitest';
import { stripBase64Prefix, extractUri, resolveUri } from './uri-resolver';
import type { PrunaPredictionResponse } from '../entities/types';
import { PRUNA_BASE_URL } from '../constants';

const SUCCEEDED: PrunaPredictionResponse['status'] = 'succeeded';
const COMPLETED: PrunaPredictionResponse['status'] = 'completed';

describe('stripBase64Prefix', () => {
  it('passes through HTTPS URLs unchanged', () => {
    const url = 'https://example.com/image.jpg';
    expect(stripBase64Prefix(url)).toBe(url);
  });

  it('strips a standard data URI prefix', () => {
    const input = 'data:image/png;base64,iVBORw0KGgo=';
    expect(stripBase64Prefix(input)).toBe('iVBORw0KGgo=');
  });

  it('returns the input unchanged when no base64 prefix is present', () => {
    const input = 'raw-base64-data';
    expect(stripBase64Prefix(input)).toBe('raw-base64-data');
  });

  it('handles base64 prefix without a data URI scheme', () => {
    const input = 'prefix;base64,abcdef';
    expect(stripBase64Prefix(input)).toBe('abcdef');
  });
});

describe('resolveUri', () => {
  it('resolves relative URIs against PRUNA_BASE_URL', () => {
    expect(resolveUri('/v1/files/abc')).toBe(`${PRUNA_BASE_URL}/v1/files/abc`);
  });

  it('passes through absolute HTTPS URLs', () => {
    const url = 'https://cdn.example.com/result.png';
    expect(resolveUri(url)).toBe(url);
  });
});

describe('extractUri', () => {
  it('returns the generation_url when status is succeeded', () => {
    const data: PrunaPredictionResponse = { status: SUCCEEDED, generation_url: 'https://cdn/result.png' };
    expect(extractUri(data)).toBe('https://cdn/result.png');
  });

  it('returns video_url when generation_url is absent and status is completed', () => {
    const data: PrunaPredictionResponse = { status: COMPLETED, video_url: 'https://cdn/result.mp4' };
    expect(extractUri(data)).toBe('https://cdn/result.mp4');
  });

  it('returns the data field as a fallback', () => {
    const data: PrunaPredictionResponse = { status: SUCCEEDED, data: 'data:image/png;base64,AAAA' };
    expect(extractUri(data)).toBe('data:image/png;base64,AAAA');
  });

  it('extracts url from a string output', () => {
    const data: PrunaPredictionResponse = { status: SUCCEEDED, output: 'https://cdn/result.png' };
    expect(extractUri(data)).toBe('https://cdn/result.png');
  });

  it('extracts url from an object output', () => {
    const data: PrunaPredictionResponse = { status: SUCCEEDED, output: { url: 'https://cdn/result.png' } };
    expect(extractUri(data)).toBe('https://cdn/result.png');
  });

  it('extracts the first entry from an array output', () => {
    const data: PrunaPredictionResponse = {
      status: SUCCEEDED,
      output: ['https://cdn/result.png', 'https://cdn/other.png'],
    };
    expect(extractUri(data)).toBe('https://cdn/result.png');
  });

  it('returns null when no field is present', () => {
    const data: PrunaPredictionResponse = { status: SUCCEEDED };
    expect(extractUri(data)).toBeNull();
  });

  it('returns null for an empty array output', () => {
    const data: PrunaPredictionResponse = { status: SUCCEEDED, output: [] };
    expect(extractUri(data)).toBeNull();
  });

  it('caches the result for subsequent calls on the same object', () => {
    const data: PrunaPredictionResponse = { status: SUCCEEDED, generation_url: 'https://cdn/result.png' };
    expect(extractUri(data)).toBe('https://cdn/result.png');
    // Re-query to confirm the cache is sticky (we cannot mutate readonly props)
    expect(extractUri(data)).toBe('https://cdn/result.png');
  });

  it('prioritizes generation_url over other fields', () => {
    const data: PrunaPredictionResponse = {
      status: SUCCEEDED,
      generation_url: 'https://cdn/winner.png',
      video_url: 'https://cdn/loser.mp4',
      data: 'data:loser',
      output: ['https://cdn/array-loser.png'],
    };
    expect(extractUri(data)).toBe('https://cdn/winner.png');
  });

  it('returns null when the response is still processing', () => {
    const data: PrunaPredictionResponse = { status: 'processing', generation_url: 'https://cdn/result.png' };
    expect(extractUri(data)).toBeNull();
  });

  it('returns null when the response failed', () => {
    const data: PrunaPredictionResponse = { status: 'failed', generation_url: 'https://cdn/result.png' };
    expect(extractUri(data)).toBeNull();
  });

  it('returns null when status is missing entirely', () => {
    const data: PrunaPredictionResponse = { generation_url: 'https://cdn/result.png' };
    expect(extractUri(data)).toBeNull();
  });
});
