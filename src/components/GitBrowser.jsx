import React, { useState, useEffect } from 'react';
import { GithubService } from '../services/GithubService';

const GitBrowser = () => {
  const [repoUrl, setRepoUrl] = useState('https://github.com/facebook/react');
  const [currentPath, setCurrentPath] = useState('');
  const [files, setFiles] = useState([]);
  const [selectedFileContent, setSelectedFileContent] = useState('');
  const [loading, setLoading] = useState(false);

  const browseRepo = async (path = '') => {
    setLoading(true);
    try {
      const { owner, repo } = GithubService.parseUrl(repoUrl);
      const data = await GithubService.getRepoContent(owner, repo, path);
      setFiles(data);
      setCurrentPath(path);
    } catch (err) {
      alert('레포지토리를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = async (file) => {
    if (file.type === 'dir') {
      browseRepo(file.path);
    } else if (file.download_url) {
      setLoading(true);
      const content = await GithubService.getFileRaw(file.download_url);
      setSelectedFileContent(content);
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
      <div style={{ display: 'flex', gap: '10px' }}>
        <input 
          style={{ flex: 1, padding: '8px' }}
          value={repoUrl} 
          onChange={(e) => setRepoUrl(e.target.value)} 
          placeholder="GitHub Repository URL (e.g., https://github.com/owner/repo)"
        />
        <button onClick={() => browseRepo('')}>불러오기</button>
      </div>

      <div style={{ display: 'flex', gap: '20px', height: '500px' }}>
        {/* 파일 트리 영역 */}
        <div style={{ flex: 1, border: '1px solid #ddd', overflowY: 'auto', backgroundColor: '#fcfcfc' }}>
          <div style={{ padding: '8px', backgroundColor: '#eee', fontWeight: 'bold' }}>
            Path: /{currentPath}
          </div>
          {files.map(file => (
            <div 
              key={file.path} 
              onClick={() => handleFileClick(file)}
              style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
            >
              {file.type === 'dir' ? '📁' : '📄'} {file.name}
            </div>
          ))}
        </div>

        {/* 코드 뷰어 영역 */}
        <div style={{ flex: 2, border: '1px solid #ddd', backgroundColor: '#282c34', color: '#fff', overflow: 'auto' }}>
          <pre style={{ margin: 0, padding: '15px', fontFamily: 'monospace' }}>
            {loading ? 'Loading...' : selectedFileContent || '파일을 선택하여 내용을 확인하세요.'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default GitBrowser;