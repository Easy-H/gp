import { Buffer } from 'buffer';
import crypto from 'crypto';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';

if (typeof window !== 'undefined' && !window.Buffer) {
  (window as Window & typeof globalThis & { Buffer?: typeof Buffer }).Buffer = Buffer;
}

if (typeof window !== 'undefined') {
  const win = window as Window & typeof globalThis & { crypto?: Crypto & { createHash?: typeof crypto.createHash } };
  if (!win.crypto) {
    win.crypto = crypto;
  } else if (!win.crypto.createHash) {
    try { win.crypto.createHash = crypto.createHash; } catch {
      /* read-only browser crypto */
    }
  }
}

interface FileStat {
  mode: number;
  size?: number;
  isDirectory(): boolean;
  isFile(): boolean;
}

interface VirtualFileSystem {
  promises: VirtualFileSystem;
  readFile(path: string): Promise<Uint8Array>;
  stat(path: string): Promise<FileStat>;
  lstat(path: string): Promise<FileStat>;
  readdir(path: string): Promise<string[]>;
  writeFile(path: string, data: Uint8Array): Promise<void>;
  mkdir(path: string): Promise<void>;
  rmdir(path: string): Promise<void>;
  unlink(path: string): Promise<void>;
  readlink(path: string): Promise<never>;
  symlink(path: string): Promise<never>;
}

export interface GitHistoryFilters {
  repoUrl: string;
  executors: string[];
  directory: string;
  branch: string;
  startCommit: string;
  endCommit: string;
}

export interface GitHistoryCommitPoint {
  oid: string;
  shortOid: string;
  message: string;
  executor: string;
  date: string;
  added: number;
  deleted: number;
  cumulative: number;
}

export interface GitHistoryCommitOption {
  oid: string;
  shortOid: string;
  message: string;
  executor: string;
  date: string;
}

export interface GitHistoryFileChange {
  path: string;
  added: number;
  deleted: number;
}

export interface GitHistoryRawCommit {
  oid: string;
  shortOid: string;
  message: string;
  executor: string;
  date: string;
  files: GitHistoryFileChange[];
}

export interface GitHistoryAnalysisResult {
  repoUrl?: string;
  executors: string[];
  branches: string[];
  commitOptions: GitHistoryCommitOption[];
  directoryOptions: string[];
  directory: string;
  branch: string;
  commits: GitHistoryCommitPoint[];
  rawCommits: GitHistoryRawCommit[];
}

const decoder = new TextDecoder();

const createNotFoundError = (): Error & { code: string } => {
  const err = new Error('ENOENT') as Error & { code: string };
  err.code = 'ENOENT';
  return err;
};

const createLocalGitFs = (files: File[], pathPrefix: string): VirtualFileSystem => {
  const fs: VirtualFileSystem = {
    promises: undefined as unknown as VirtualFileSystem,
    readFile: async (path) => {
      const targetPath = pathPrefix + path.replace(/^\//, '');
      const file = files.find((entry) => entry.webkitRelativePath === targetPath);
      if (!file) throw createNotFoundError();
      return new Uint8Array(await file.arrayBuffer());
    },
    stat: async (path) => {
      const targetPath = pathPrefix + path.replace(/^\//, '');
      const file = files.find((entry) => entry.webkitRelativePath === targetPath);
      if (file) return { mode: 0o100644, size: file.size, isDirectory: () => false, isFile: () => true };
      const prefix = targetPath.endsWith('/') ? targetPath : `${targetPath}/`;
      if (files.some((entry) => entry.webkitRelativePath.startsWith(prefix))) {
        return { mode: 0o40000, isDirectory: () => true, isFile: () => false };
      }
      throw createNotFoundError();
    },
    readdir: async (path) => {
      const targetPath = pathPrefix + path.replace(/^\//, '');
      const prefix = targetPath.endsWith('/') ? targetPath : `${targetPath}/`;
      const entries = new Set<string>();
      files.forEach((entry) => {
        if (entry.webkitRelativePath.startsWith(prefix)) {
          entries.add(entry.webkitRelativePath.substring(prefix.length).split('/')[0]);
        }
      });
      return Array.from(entries);
    },
    lstat: async (path) => fs.stat(path),
    writeFile: async () => {},
    mkdir: async () => {},
    rmdir: async () => {},
    unlink: async () => {},
    readlink: async () => { throw new Error('Not implemented'); },
    symlink: async () => { throw new Error('Not implemented'); },
  };
  fs.promises = fs;
  return fs;
};

const createBrowserFs = (memFs: Map<string, Uint8Array>, folders: Set<string>): VirtualFileSystem => {
  const fs: VirtualFileSystem = {
    promises: undefined as unknown as VirtualFileSystem,
    writeFile: async (path, data) => { memFs.set(path, data); },
    readFile: async (path) => {
      const data = memFs.get(path);
      if (!data) throw createNotFoundError();
      return data;
    },
    mkdir: async (path) => { folders.add(path); },
    rmdir: async () => {},
    unlink: async () => {},
    readdir: async (path) => {
      const p = path.endsWith('/') ? path : `${path}/`;
      const entries = new Set<string>();
      for (const key of memFs.keys()) if (key.startsWith(p)) entries.add(key.substring(p.length).split('/')[0]);
      for (const key of folders) if (key !== path && key.startsWith(p)) entries.add(key.substring(p.length).split('/')[0]);
      return Array.from(entries);
    },
    stat: async (path) => {
      if (memFs.has(path)) {
        return { mode: 0o100644, size: memFs.get(path)!.length, isDirectory: () => false, isFile: () => true };
      }
      const p = path.endsWith('/') ? path : `${path}/`;
      if (Array.from(memFs.keys()).some((key) => key.startsWith(p)) || folders.has(path)) {
        return { mode: 0o40000, isDirectory: () => true, isFile: () => false };
      }
      throw createNotFoundError();
    },
    lstat: async (path) => fs.stat(path),
    readlink: async () => { throw new Error('Not implemented'); },
    symlink: async () => { throw new Error('Not implemented'); },
  };
  fs.promises = fs;
  return fs;
};

const normalizeDirectory = (directory: string) =>
  directory.trim().replace(/^\/+|\/+$/g, '');

const isUnderDirectory = (filepath: string, directory: string) => {
  const normalized = normalizeDirectory(directory);
  return !normalized || filepath === normalized || filepath.startsWith(`${normalized}/`);
};

const addDirectoryOptions = (directories: Set<string>, filepath: string) => {
  const parts = filepath.split('/').filter(Boolean);
  parts.pop();
  let current = '';
  parts.forEach((part) => {
    current = current ? `${current}/${part}` : part;
    directories.add(current);
  });
};

const getCommitExecutor = (commit: {
  author: { name?: string; email?: string };
  committer: { name?: string; email?: string };
}) => commit.author.name || commit.author.email || commit.committer.name || commit.committer.email || 'Unknown';

const countLines = (content: string) => {
  if (!content) return 0;
  return content.endsWith('\n') ? content.split('\n').length - 1 : content.split('\n').length;
};

const diffLineCounts = (before: string, after: string) => {
  if (!before) return { added: countLines(after), deleted: 0 };
  if (!after) return { added: 0, deleted: countLines(before) };

  const oldLines = before.split('\n');
  const newLines = after.split('\n');
  if (oldLines.length * newLines.length > 250000) {
    const delta = newLines.length - oldLines.length;
    return { added: Math.max(delta, 0), deleted: Math.max(-delta, 0) };
  }

  const previous = new Array(newLines.length + 1).fill(0);
  const current = new Array(newLines.length + 1).fill(0);
  for (let i = 1; i <= oldLines.length; i += 1) {
    for (let j = 1; j <= newLines.length; j += 1) {
      current[j] = oldLines[i - 1] === newLines[j - 1]
        ? previous[j - 1] + 1
        : Math.max(previous[j], current[j - 1]);
    }
    previous.splice(0, previous.length, ...current);
    current.fill(0);
  }
  const common = previous[newLines.length];
  return {
    added: Math.max(newLines.length - common, 0),
    deleted: Math.max(oldLines.length - common, 0),
  };
};

const readEntryText = async (entry: unknown) => {
  if (!entry || typeof entry !== 'object' || !('content' in entry)) return '';
  try {
    const data = await (entry as { content(): Promise<Uint8Array> }).content();
    return decoder.decode(data);
  } catch {
    return '';
  }
};

export class GitHistoryAnalyzer {
  static getInitialFilters(): GitHistoryFilters {
    if (typeof window === 'undefined') {
      return { repoUrl: '', executors: [], directory: '', branch: 'HEAD', startCommit: '', endCommit: '' };
    }
    const params = new URLSearchParams(window.location.search);
    return {
      repoUrl: params.get('repo') || params.get('gitUrl') || '',
      executors: (params.get('executors') || params.get('authors') || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      directory: params.get('dir') || params.get('directory') || '',
      branch: params.get('branch') || 'HEAD',
      startCommit: params.get('start') || params.get('startCommit') || '',
      endCommit: params.get('end') || params.get('endCommit') || '',
    };
  }

  static async analyzeLocalFiles(
    files: File[],
    filters: GitHistoryFilters,
    onProgress?: (message: string) => void,
  ): Promise<GitHistoryAnalysisResult> {
    const gitEntries = files.filter((file) => file.webkitRelativePath.includes('.git/'));
    if (gitEntries.length === 0) throw new Error('No .git directory found');

    const pathPrefix = gitEntries[0].webkitRelativePath.split('.git/')[0];
    const fs = createLocalGitFs(files, pathPrefix);
    return this.analyzeFs(fs, '/.git', filters, onProgress);
  }

  static async analyzeRemoteRepo(
    repoUrl: string,
    filters: GitHistoryFilters,
    onProgress?: (message: string) => void,
  ): Promise<GitHistoryAnalysisResult> {
    const memFs = new Map<string, Uint8Array>();
    const folders = new Set(['/repo', '/repo/.git']);
    const fs = createBrowserFs(memFs, folders);
    const requestedBranch = filters.branch && filters.branch !== 'HEAD' ? filters.branch : undefined;

    await git.clone({
      fs,
      http,
      dir: '/repo',
      url: repoUrl,
      corsProxy: 'https://cors.isomorphic-git.org',
      singleBranch: true,
      ref: requestedBranch,
      depth: 10000,
      noCheckout: true,
      noTags: true,
      onProgress: (event) => {
        onProgress?.(`Git ${event.phase}: ${event.loaded}${event.total ? ` / ${event.total}` : ''}`);
      },
    });

    return this.analyzeFs(fs, '/repo', { ...filters, repoUrl }, onProgress);
  }

  static async listRemoteBranches(repoUrl: string): Promise<string[]> {
    const refs = await git.listServerRefs({
      http,
      url: repoUrl,
      corsProxy: 'https://cors.isomorphic-git.org',
      prefix: 'refs/heads/',
    });
    return refs
      .map((entry) => entry.ref.replace(/^refs\/heads\//, ''))
      .filter(Boolean)
      .sort();
  }

  static applyFilters(result: GitHistoryAnalysisResult, filters: GitHistoryFilters): GitHistoryAnalysisResult {
    const rawCommits = result.rawCommits || result.commits.map((commit) => ({
      oid: commit.oid,
      shortOid: commit.shortOid,
      message: commit.message,
      executor: commit.executor,
      date: commit.date,
      files: [{ path: result.directory === '/' ? '' : result.directory, added: commit.added, deleted: commit.deleted }],
    }));
    const startIndex = filters.startCommit
      ? rawCommits.findIndex((commit) => commit.oid.startsWith(filters.startCommit))
      : 0;
    const boundedStart = startIndex >= 0 ? startIndex : 0;
    const endIndex = filters.endCommit
      ? rawCommits.findIndex((commit) => commit.oid.startsWith(filters.endCommit))
      : rawCommits.length - 1;
    const boundedEnd = endIndex >= 0 ? endIndex : rawCommits.length - 1;
    const executorSet = new Set(filters.executors);
    let cumulative = 0;
    const commits = rawCommits
      .slice(Math.min(boundedStart, boundedEnd), Math.max(boundedStart, boundedEnd) + 1)
      .filter((commit) => executorSet.size === 0 || executorSet.has(commit.executor))
      .map((commit) => {
        const stat = commit.files
          .filter((file) => isUnderDirectory(file.path, filters.directory))
          .reduce((sum, file) => ({
            added: sum.added + file.added,
            deleted: sum.deleted + file.deleted,
          }), { added: 0, deleted: 0 });
        cumulative += stat.added - stat.deleted;
        return {
          oid: commit.oid,
          shortOid: commit.shortOid,
          message: commit.message,
          executor: commit.executor,
          date: commit.date,
          added: stat.added,
          deleted: stat.deleted,
          cumulative,
        };
      });

    return {
      ...result,
      directory: normalizeDirectory(filters.directory) || '/',
      branch: filters.branch || result.branch,
      commits,
      rawCommits,
    };
  }

  private static async analyzeFs(
    fs: VirtualFileSystem,
    dir: string,
    filters: GitHistoryFilters,
    onProgress?: (message: string) => void,
  ): Promise<GitHistoryAnalysisResult> {
    const branches = await git.listBranches({ fs, dir }).catch(() => []);
    const branch = filters.branch || 'HEAD';
    const logs = await git.log({ fs, dir, ref: branch, depth: 10000 });
    const newestFirst = logs.map((entry) => ({ ...entry.commit, oid: entry.oid }));
    const commitOptions = newestFirst.map((commit) => ({
      oid: commit.oid,
      shortOid: commit.oid.slice(0, 7),
      message: commit.message.split('\n')[0],
      executor: getCommitExecutor(commit),
      date: new Date((commit.committer.timestamp || commit.author.timestamp) * 1000).toISOString().slice(0, 10),
    }));
    const oldestFirst = [...newestFirst].reverse();
    const executors = Array.from(new Set(oldestFirst.map((commit) => getCommitExecutor(commit)).filter(Boolean))).sort();

    const directories = new Set<string>();
    const rawCommits: GitHistoryRawCommit[] = [];
    for (let index = 0; index < oldestFirst.length; index += 1) {
      const commit = oldestFirst[index];
      const oid = commit.oid;
      onProgress?.(`${index + 1}/${oldestFirst.length} ${oid.slice(0, 7)} 분석 중`);
      const parent = commit.parent[0];
      const files: GitHistoryFileChange[] = [];

      await git.walk({
        fs,
        dir,
        trees: parent
          ? [git.TREE({ ref: parent }), git.TREE({ ref: oid })]
          : [git.TREE({ ref: oid })],
        map: async (filepath, entries) => {
          if (filepath === '.') return;
          addDirectoryOptions(directories, filepath);
          if (!isUnderDirectory(filepath, filters.directory)) return;
          const [beforeEntry, afterEntry] = parent ? entries : [null, entries[0]];
          const beforeType = beforeEntry ? await beforeEntry.type() : null;
          const afterType = afterEntry ? await afterEntry.type() : null;
          if (beforeType === 'tree' || afterType === 'tree') return;
          const beforeOid = beforeEntry ? await beforeEntry.oid() : null;
          const afterOid = afterEntry ? await afterEntry.oid() : null;
          if (beforeOid && afterOid && beforeOid === afterOid) return;
          const before = await readEntryText(beforeEntry);
          const after = await readEntryText(afterEntry);
          const stat = diffLineCounts(before, after);
          if (stat.added > 0 || stat.deleted > 0) {
            files.push({ path: filepath, added: stat.added, deleted: stat.deleted });
          }
        },
      });

      rawCommits.push({
        oid,
        shortOid: oid.slice(0, 7),
        message: commit.message.split('\n')[0],
        executor: getCommitExecutor(commit),
        date: new Date((commit.committer.timestamp || commit.author.timestamp) * 1000).toISOString().slice(0, 10),
        files,
      });
    }

    const baseResult: GitHistoryAnalysisResult = {
      repoUrl: filters.repoUrl,
      executors,
      branches,
      commitOptions,
      directoryOptions: Array.from(directories).sort(),
      directory: normalizeDirectory(filters.directory) || '/',
      branch,
      commits: [],
      rawCommits,
    };
    return this.applyFilters(baseResult, filters);
  }
}
