export interface GithubFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  download_url: string | null;
}

export const GithubService = {
  /**
   * 특정 레포지토리의 특정 경로의 파일 목록을 가져옵니다.
   */
  getRepoContent: async (owner: string, repo: string, path: string = ''): Promise<GithubFile[]> => {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`);
    if (!response.ok) throw new Error('Failed to fetch repo content');
    return response.json();
  },

  /**
   * 파일의 raw 내용을 가져옵니다.
   */
  getFileRaw: async (downloadUrl: string): Promise<string> => {
    const response = await fetch(downloadUrl);
    if (!response.ok) throw new Error('Failed to fetch file content');
    return response.text();
  },

  /**
   * 레포지토리 URL에서 owner와 repo 이름을 파싱합니다.
   */
  parseUrl: (url: string) => {
    const parts = url.replace('https://github.com/', '').split('/');
    return { owner: parts[0], repo: parts[1] };
  }
};