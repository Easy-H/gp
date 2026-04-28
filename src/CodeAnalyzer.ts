import * as TreeSitter from 'web-tree-sitter';
import { Parser } from 'web-tree-sitter';
import { LANGUAGE_CONFIG, LanguageConfig } from './_future/configs';

export interface MemberInfo {
  name: string;
  type: string;
  visibility: string;
}

export interface AssociationInfo {
  target: string;
  label: string;
  relationType: 'composition' | 'association';
}

export interface ClassInfo {
  name: string;
  type: 'class' | 'interface';
  parents: string[];
  implements: string[];
  methods: MemberInfo[];
  fields: MemberInfo[];
  associations: AssociationInfo[];
  children: string[]; // 자신을 상속/구현하는 클래스 목록
}

export class CodeAnalyzer {
  private parser: Parser | null = null;
  private loadedLanguages: Map<string, TreeSitter.Language> = new Map();

  constructor() {
    this.parser = null;
    this.loadedLanguages = new Map();
  }

  async init(): Promise<void> {
    try {
      await Parser.init({
        locateFile: (scriptName: string) => {
          const baseUrl = (import.meta as any).env.BASE_URL;
          if (scriptName === 'tree-sitter.wasm') {
            return `${baseUrl}web-tree-sitter.wasm`;
          }
          return `${baseUrl}${scriptName}`;
        }
      });

      this.parser = new Parser();
      console.log("Tree-sitter Core initialized");
    } catch (err) {
      console.error("Tree-sitter initialization failed:", err);
      throw err;
    }
  }

  async loadLanguage(ext: string): Promise<LanguageConfig | undefined> {
    const config = LANGUAGE_CONFIG[ext] || LANGUAGE_CONFIG.js;
    if (this.loadedLanguages.has(config.name)) return config;

    try {
      const baseUrl = (import.meta as any).env.BASE_URL;
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
    if (!this.parser || !lang || !sourceCode) return new Map();

    try {
      this.parser.setLanguage(lang);
      const tree = this.parser.parse(sourceCode);
      const metadata = new Map<string, string>();

      const collect = (node: any) => {
        if (config.classNodes.includes(node.type)) {
          let nameNode = node.childForFieldName('identifier') || node.childForFieldName('name') || (node.parent?.type === 'assignment_expression' ? node.parent.childForFieldName('left') : null);
          if (nameNode) {
            const name = nameNode.text.split('.').pop()!.replace(/[;{}]/g, '').trim();
            const type = node.type.includes('interface') ? 'interface' : 'class';
            metadata.set(name, type);
          }
        }
        for (let i = 0; i < node.childCount; i++) collect(node.child(i));
      };

      if (tree == null) return new Map();
      collect(tree.rootNode);
      return metadata;
    } catch (err) {
      console.error("Error during extractClassNames:", err);
      return new Map();
    }
  }

  private extractVisibility(node: any, ext: string, name: string): string {
    if (ext === 'py') {
      if (name.startsWith('__')) return 'private';
      if (name.startsWith('_')) return 'protected';
      return 'public';
    }

    if (['js', 'ts', 'tsx'].includes(ext) && name.startsWith('#')) {
      return 'private';
    }

    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      const text = child.text.toLowerCase();

      if (['public', 'private', 'protected', 'internal', 'package'].includes(text)) {
        return text === 'package' ? 'internal' : text;
      }

      if (child.type.includes('modifier') || child.type === 'visibility') {
        const subText = child.text.toLowerCase();
        if (['public', 'private', 'protected', 'internal', 'package'].includes(subText)) {
          return subText === 'package' ? 'internal' : subText;
        }
      }

      if (['identifier', 'property_identifier', 'type', 'block', 'parameters', 'body'].includes(child.type)) break;
    }

    return (ext === 'cs' || ext === 'java') ? 'private' : 'public';
  }

  private getTypeIdentifiers(node: any): string[] {
    const results: string[] = [];
    const typeNodeTypes = [
      'qualified_name', 'type_identifier', 'identifier', 
      'generic_name', 'predefined_type', 'scoped_type_identifier',
      'attribute', 'template_type'
    ];

    const findTypes = (n: any) => {
      if (typeNodeTypes.includes(n.type)) {
        const fullText = n.text.trim();
        const className = fullText.split('.').pop()!.split('<')[0].split('[')[0].replace(/[;{}]/g, '').trim();

        if (className && !['extends', 'implements', 'interface', 'class'].includes(className.toLowerCase())) {
          results.push(className);
        }
        return;
      }
      for (let i = 0; i < n.childCount; i++) findTypes(n.child(i));
    };

    findTypes(node);
    return results;
  }

  analyze(sourceCode: string, ext: string = 'js', projectClassMetadata: Map<string, string> = new Map()): ClassInfo[] {
    const config = LANGUAGE_CONFIG[ext] || LANGUAGE_CONFIG.js;
    const lang = this.loadedLanguages.get(config.name);
    if (!this.parser || !lang || !sourceCode) return [];

    try {
      this.parser.setLanguage(lang);
      const tree = this.parser.parse(sourceCode);
      let classes: ClassInfo[] = [];
      const effectiveMetadata = (projectClassMetadata && projectClassMetadata.size > 0) ? projectClassMetadata : this.extractClassMetadata(sourceCode, ext);

      const extractAssociations = (node: any, classInfo: ClassInfo, isComposition: boolean = false) => {
        if (node.type === 'new_expression') {
          const constructorNode = node.childForFieldName('constructor');
          if (constructorNode || node.childForFieldName('type')) {
            const targetClass = (constructorNode?.text || node.childForFieldName('type')?.text || '').split('.').pop()!.replace(/[;()]/g, '').trim();
            if (effectiveMetadata.has(targetClass) && targetClass !== classInfo.name) {
              let label = '';
              let p = node.parent;
              while (p && p.type !== 'statement_block' && p.type !== 'class_body') {
                if (p.type === 'assignment_expression') { label = p.childForFieldName('left')?.text || ''; break; }
                else if (p.type === 'variable_declarator') { label = p.childForFieldName('id')?.text || p.childForFieldName('name')?.text || ''; break; }
                else if (p.type === 'field_definition' || p.type === 'public_instance_level_property_definition') { label = p.childForFieldName('name')?.text || ''; break; }
                p = p.parent;
              }
              label = label.replace(/^this\./, '').split('[')[0].replace(/[;]/g, '').trim();
              if (!classInfo.associations.some(a => a.target === targetClass && a.label === label)) {
                classInfo.associations.push({ target: targetClass, label, relationType: isComposition ? 'composition' : 'association' });
              }
            }
          }
        }
        for (let i = 0; i < node.childCount; i++) extractAssociations(node.child(i), classInfo, isComposition);
      };

      const traverse = (node: any) => {
        if (config.classNodes.includes(node.type)) {
          let nameNode = node.childForFieldName('identifier') || node.childForFieldName('name');
          if (!nameNode) {
            const p = node.parent;
            if (p?.type === 'assignment_expression') nameNode = p.childForFieldName('left');
            else if (p?.type === 'variable_declarator') nameNode = p.childForFieldName('name') || p.childForFieldName('id');
          }
          if (!nameNode) return;
          let body = node.childForFieldName('body');
          if (!body) {
            for (let i = 0; i < node.childCount; i++) {
              const c = node.child(i);
              if (['class_body', 'interface_body', 'block', 'declaration_list'].includes(c.type)) { body = c; break; }
            }
          }
          const classInfo: ClassInfo = {
            name: nameNode.text.split('.').pop()!.replace(/[<>[\];{}]/g, '').trim(),
            type: node.type.includes('interface') ? 'interface' : 'class',
            parents: [], implements: [], methods: [], fields: [], associations: [],
            children: []
          };
          for (let i = 0; i < node.childCount; i++) {
            const child = node.child(i);
            if (config.extendsNodes?.includes(child.type)) {
              this.getTypeIdentifiers(child).forEach((id, index) => {
                const metaType = effectiveMetadata.get(id);
                if (metaType === 'interface') { if (!classInfo.implements.includes(id)) classInfo.implements.push(id); }
                else if (metaType === 'class') { if (!classInfo.parents.includes(id)) classInfo.parents.push(id); }
                else {
                  if (classInfo.type === 'interface') { if (!classInfo.implements.includes(id)) classInfo.implements.push(id); }
                  else if (ext === 'cs') { if (index === 0) { if (!classInfo.parents.includes(id)) classInfo.parents.push(id); } else { if (!classInfo.implements.includes(id)) classInfo.implements.push(id); } }
                  else { if (!classInfo.parents.includes(id)) classInfo.parents.push(id); }
                }
              });
            } else if (config.implementsNodes?.includes(child.type)) {
              classInfo.implements = Array.from(new Set([...classInfo.implements, ...this.getTypeIdentifiers(child)]));
            }
          }
          if (body) {
            for (let i = 0; i < body.childCount; i++) {
              const child = body.child(i);
              if (config.methodNodes.includes(child.type)) {
                const methodNameNode = child.childForFieldName('identifier') || child.childForFieldName('name');
                const returnTypeNode = child.childForFieldName('type') || child.childForFieldName('return_type');
                if (methodNameNode) {
                  classInfo.methods.push({ name: methodNameNode.text.trim().replace(/[;()]/g, ''), type: returnTypeNode ? returnTypeNode.text.trim() : '', visibility: this.extractVisibility(child, ext, methodNameNode.text) });
                  extractAssociations(child, classInfo, false);
                }
              } else if (config.fieldNodes.includes(child.type)) {
                let fieldNameNode = child.childForFieldName('identifier') || child.childForFieldName('name');
                const typeNode = child.childForFieldName('type');
                if (!fieldNameNode && child.type === 'field_declaration') {
                  const declarator = child.children.find((c:any) => c.type === 'variable_declarator');
                  if (declarator) fieldNameNode = declarator.childForFieldName('identifier') || declarator.childForFieldName('name');
                }
                if (fieldNameNode) {
                  classInfo.fields.push({ name: fieldNameNode.text.trim().replace(/[;]/g, ''), type: typeNode ? typeNode.text.trim() : '', visibility: this.extractVisibility(child, ext, fieldNameNode.text) });
                  extractAssociations(child, classInfo, true);
                }
              }
            }
          }
          classes.push(classInfo);
        }
        for (let i = 0; i < node.childCount; i++) traverse(node.child(i));
      };
      if (tree == null) return [];
      traverse(tree.rootNode);
      return classes;
    } catch (err) {
      console.error(`Analysis aborted for a file with extension .${ext}:`, err);
      return [];
    }
  }
}