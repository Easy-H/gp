import * as TreeSitter from 'web-tree-sitter';
import { Parser } from 'web-tree-sitter';
import { LANGUAGE_CONFIG, type LanguageConfig } from './_future/configs';
import type { ClassInfo, MemberInfo, AssociationInfo } from './analyzer/types';
import { extractClassMetadata } from './analyzer/metadata';
import { analyzeSourceCode } from './analyzer/analyze';

interface ViteEnv {
  BASE_URL: string;
}

const getBaseUrl = (): string => (import.meta as ImportMeta & { env: ViteEnv }).env.BASE_URL;

export type { ClassInfo, MemberInfo, AssociationInfo };

export class CodeAnalyzer {
  private parser: Parser | null = null;
  private loadedLanguages: Map<string, TreeSitter.Language> = new Map();

  async init(): Promise<void> {
    try {
      await Parser.init({
        locateFile: (scriptName: string) => {
          const baseUrl = getBaseUrl();
          if (scriptName === 'tree-sitter.wasm') return `${baseUrl}web-tree-sitter.wasm`;
          return `${baseUrl}${scriptName}`;
        }
      });

      this.parser = new Parser();
      console.log('Tree-sitter Core initialized');
    } catch (err) {
      console.error('Tree-sitter initialization failed:', err);
      throw err;
    }
  }

  async loadLanguage(ext: string): Promise<LanguageConfig | undefined> {
    const config = LANGUAGE_CONFIG[ext] || LANGUAGE_CONFIG.js;
    if (this.loadedLanguages.has(config.name)) return config;

    try {
      const baseUrl = getBaseUrl();
      const Lang = await TreeSitter.Language.load(`${baseUrl}tree-sitter-${config.wasm}.wasm`);
      this.loadedLanguages.set(config.name, Lang);
      return config;
    } catch (err) {
      console.error(`Failed to load WASM for ${config.name}:`, err);
      return LANGUAGE_CONFIG.js;
    }
  }

  extractClassMetadata(sourceCode: string, ext: string = 'js'): Map<string, string> {
    const config = LANGUAGE_CONFIG[ext] || LANGUAGE_CONFIG.js;
    const lang = this.loadedLanguages.get(config.name);
    return extractClassMetadata(this.parser, lang, config, sourceCode);
  }

  analyze(sourceCode: string, ext: string = 'js', projectClassMetadata: Map<string, string> = new Map()): ClassInfo[] {
    const config = LANGUAGE_CONFIG[ext] || LANGUAGE_CONFIG.js;
    const lang = this.loadedLanguages.get(config.name);
    return analyzeSourceCode(this.parser, lang, config, sourceCode, ext, projectClassMetadata);
  }
}
