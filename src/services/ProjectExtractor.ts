import { Buffer } from 'buffer';
import crypto from 'crypto';
import JSZip from 'jszip';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';

// 브라우저 환경에서 isomorphic-git이 요구하는 Buffer 전역 객체 폴리필
if (typeof window !== 'undefined' && !window.Buffer) { 
  (window as any).Buffer = Buffer;
}

// isomorphic-git이 요구하는 Node.js crypto.createHash 폴리필
if (typeof window !== 'undefined') {
  const win = window as any;
  if (!win.crypto) {
    win.crypto = crypto;
  } else if (!win.crypto.createHash) {
    try { win.crypto.createHash = crypto.createHash; } catch (e) { /* 읽기 전용인 경우 무시 */ }
  }
}

import { CodeAnalyzer } from '../CodeAnalyzer';

export interface ExtractedFile {
  content: string;
  ext: string;
}

export interface ExtractionResult {
  projectMap: Map<string, ExtractedFile>;
  metadata: Map<string, string>;
}

export interface ProgressInfo {
  current: number;
  total: number;
  fileName: string;
}

export class ProjectExtractor {
  private readonly ignoreList = [
    'node_modules', 'dist', 'build', 'out', 'target', 'bin', 'obj',
    '.git', '.svn', '.vscode', '.idea', '__MACOSX', '.DS_Store'
  ];
  private readonly supportedExts = ['js', 'jsx', 'ts', 'tsx', 'java', 'py', 'cpp', 'h', 'hpp', 'cs'];

  private isSupported(path: string): boolean {
    const ext = path.split('.').pop()?.toLowerCase() || '';
    return this.supportedExts.includes(ext);
  }

  private shouldIgnore(path: string): boolean {
    const pathParts = path.split('/');
    return pathParts.some(part => this.ignoreList.includes(part) || (part.startsWith('.') && part.length > 1));
  }

  async fromZip(zipSource: File | Blob, analyzer: CodeAnalyzer, onProgress?: (info: ProgressInfo) => void): Promise<ExtractionResult> {
    const zip = await JSZip.loadAsync(zipSource);
    const projectMap = new Map<string, ExtractedFile>();
    const metadata = new Map<string, string>();

    const validFiles = Object.entries(zip.files).filter(([path, zipEntry]) => {
      return !zipEntry.dir && !this.shouldIgnore(path) && this.isSupported(path);
    });

    const total = validFiles.length;
    for (let i = 0; i < total; i++) {
      const [path, zipEntry] = validFiles[i];
      const ext = path.split('.').pop()!.toLowerCase();
      const content = await zipEntry.async('string');

      if (!content || content.length > 512 * 1024) continue;

      projectMap.set(path, { content, ext });
      
      if (onProgress) onProgress({ current: i + 1, total, fileName: `분석 중: ${path.split('/').pop()}` });

      await analyzer.loadLanguage(ext);
      const fileMetadata = analyzer.extractClassMetadata(content, ext);
      fileMetadata.forEach((type, name) => metadata.set(name, type));
    }

    return { projectMap, metadata };
  }

  async fromRemoteGit(url: string, analyzer: CodeAnalyzer, onProgress?: (info: ProgressInfo) => void): Promise<ExtractionResult> {
    const memFs = new Map<string, Uint8Array>();
    const folders = new Set(['/repo', '/repo/.git']);

    const fs: any = {
      writeFile: async (path: string, data: Uint8Array) => { memFs.set(path, data); },
      readFile: async (path: string) => {
        const data = memFs.get(path);
        if (!data) { const err: any = new Error('ENOENT'); err.code = 'ENOENT'; throw err; }
        return data;
      },
      mkdir: async (path: string) => { folders.add(path); },
      rmdir: async () => {},
      unlink: async () => {},
      readdir: async (path: string) => {
        const p = path.endsWith('/') ? path : path + '/';
        const entries = new Set<string>();
        for (const key of memFs.keys()) if (key.startsWith(p)) entries.add(key.substring(p.length).split('/')[0]);
        for (const key of folders) if (key !== path && key.startsWith(p)) entries.add(key.substring(p.length).split('/')[0]);
        return Array.from(entries);
      },
      stat: async (path: string) => {
        if (memFs.has(path)) return { mode: 0o100644, size: memFs.get(path)!.length, mtimeMs: Date.now(), isDirectory: () => false, isFile: () => true };
        const p = path.endsWith('/') ? path : path + '/';
        if (Array.from(memFs.keys()).some(k => k.startsWith(p)) || folders.has(path)) return { mode: 0o40000, size: 0, mtimeMs: Date.now(), isDirectory: () => true, isFile: () => false };
        const err: any = new Error('ENOENT'); err.code = 'ENOENT'; throw err;
      },
      lstat: function(path: string) { return this.stat(path); },
      readlink: async () => { throw new Error('Not implemented'); },
      symlink: async () => { throw new Error('Not implemented'); }
    };
    fs.promises = fs;

    await git.clone({ 
      fs, 
      http, 
      dir: '/repo', 
      url, 
      corsProxy: 'https://cors.isomorphic-git.org', 
      singleBranch: true, 
      depth: 1,
      onProgress: (evt) => {
        if (onProgress) onProgress({ current: evt.loaded, total: evt.total || 100, fileName: `Git ${evt.phase}: ${evt.loaded} ${evt.total ? '/ ' + evt.total : ''}` });
      }
    });

    const projectMap = new Map<string, ExtractedFile>();
    const metadata = new Map<string, string>();

    await git.walk({
      fs, dir: '/repo',
      trees: [git.TREE({ ref: 'HEAD' })],
      map: async (filepath, [entry]) => {
        if (entry === null || (await entry.type()) === 'tree' || !this.isSupported(filepath)) return;
        const ext = filepath.split('.').pop()!.toLowerCase();
        const content = new TextDecoder().decode(await entry.content());
        projectMap.set(filepath, { content, ext });
        
        await analyzer.loadLanguage(ext);
        analyzer.extractClassMetadata(content, ext).forEach((type, name) => metadata.set(name, type));
        return filepath;
      }
    });

    return { projectMap, metadata };
  }

  async fromLocalGit(files: File[], analyzer: CodeAnalyzer, onProgress?: (info: ProgressInfo) => void): Promise<ExtractionResult> {
    const gitEntries = files.filter(f => f.webkitRelativePath.includes('.git/'));
    if (gitEntries.length === 0) throw new Error('No .git directory found');

    const pathPrefix = gitEntries[0].webkitRelativePath.split('.git/')[0];
    const fs: any = {
      readFile: async (path: string) => {
        const targetPath = pathPrefix + path.replace(/^\//, '');
        const file = files.find(f => f.webkitRelativePath === targetPath);
        if (!file) { const err: any = new Error('ENOENT'); err.code = 'ENOENT'; throw err; }
        return new Uint8Array(await file.arrayBuffer());
      },
      stat: async (path: string) => {
        const targetPath = pathPrefix + path.replace(/^\//, '');
        const file = files.find(f => f.webkitRelativePath === targetPath);
        if (file) return { mode: 0o100644, size: file.size, isDirectory: () => false, isFile: () => true };
        const prefix = targetPath.endsWith('/') ? targetPath : targetPath + '/';
        if (files.some(f => f.webkitRelativePath.startsWith(prefix))) return { mode: 0o40000, isDirectory: () => true, isFile: () => false };
        const err: any = new Error('ENOENT'); err.code = 'ENOENT'; throw err;
      },
      readdir: async (path: string) => {
        const targetPath = pathPrefix + path.replace(/^\//, '');
        const prefix = targetPath.endsWith('/') ? targetPath : targetPath + '/';
        const entries = new Set<string>();
        files.forEach(f => {
          if (f.webkitRelativePath.startsWith(prefix)) entries.add(f.webkitRelativePath.substring(prefix.length).split('/')[0]);
        });
        return Array.from(entries);
      },
      lstat: function(path: string) { return this.stat(path); },
      writeFile: async () => {},
      mkdir: async () => {},
      rmdir: async () => {},
      unlink: async () => {},
      readlink: async () => {},
      symlink: async () => {}
    };
    fs.promises = fs;

    const head = await git.resolveRef({ fs, dir: '/.git', ref: 'HEAD' });
    const projectMap = new Map<string, ExtractedFile>();
    const metadata = new Map<string, string>();
    let count = 0;

    await git.walk({
      fs, dir: '/.git',
      trees: [git.TREE({ ref: head })],
      map: async (filepath, [entry]) => {
        if (entry === null || (await entry.type()) === 'tree' || !this.isSupported(filepath)) return;
        count++;
        if (onProgress) onProgress({ current: count, total: 100, fileName: `Git 복원 중: ${filepath}` });

        const ext = filepath.split('.').pop()!.toLowerCase();
        const content = new TextDecoder().decode(await entry.content());
        projectMap.set(filepath, { content, ext });
        
        await analyzer.loadLanguage(ext);
        analyzer.extractClassMetadata(content, ext).forEach((type, name) => metadata.set(name, type));
        return filepath;
      }
    });

    return { projectMap, metadata };
  }
}