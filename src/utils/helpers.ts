import * as crypto from 'crypto';
import * as path from 'path';
import { parse } from 'url';

export const generateRequestId = (): string => {
  return crypto.randomUUID();
};

export const getFileNameFromUrl = (url: string): string => {
  const parsedUrl = parse(url);
  return path.basename(parsedUrl.pathname || '');
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};