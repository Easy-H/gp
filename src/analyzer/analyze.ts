import type { Language, Parser } from 'web-tree-sitter';
import type { LanguageConfig } from '../_future/configs';
import type { ClassInfo, TreeSitterNodeLike } from './types';
import { extractClassMetadata } from './metadata';

const extractVisibility = (node: TreeSitterNodeLike, ext: string, name: string): string => {
  if (ext === 'py') {
    if (name.startsWith('__')) return 'private';
    if (name.startsWith('_')) return 'protected';
    return 'public';
  }

  if (['js', 'ts', 'tsx'].includes(ext) && name.startsWith('#')) return 'private';

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
};

const getTypeIdentifiers = (node: TreeSitterNodeLike): string[] => {
  const results: string[] = [];
  const typeNodeTypes = ['qualified_name', 'type_identifier', 'identifier', 'generic_name', 'predefined_type', 'scoped_type_identifier', 'attribute', 'template_type'];

  const findTypes = (n: TreeSitterNodeLike) => {
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
};

export const analyzeSourceCode = (
  parser: Parser | null,
  lang: Language | undefined,
  config: LanguageConfig,
  sourceCode: string,
  ext: string = 'js',
  projectClassMetadata: Map<string, string> = new Map()
): ClassInfo[] => {
  if (!parser || !lang || !sourceCode) return [];

  try {
    parser.setLanguage(lang);
    const tree = parser.parse(sourceCode);
    const classes: ClassInfo[] = [];
    const effectiveMetadata = projectClassMetadata.size > 0 ? projectClassMetadata : extractClassMetadata(parser, lang, config, sourceCode);

    const extractAssociations = (node: TreeSitterNodeLike, classInfo: ClassInfo, isComposition = false) => {
      if (node.type === 'new_expression') {
        const constructorNode = node.childForFieldName('constructor');
        if (constructorNode || node.childForFieldName('type')) {
          const targetClass = (constructorNode?.text || node.childForFieldName('type')?.text || '').split('.').pop()!.replace(/[;()]/g, '').trim();
          if (effectiveMetadata.has(targetClass) && targetClass !== classInfo.name) {
            let label = '';
            let p = node.parent;
            while (p && p.type !== 'statement_block' && p.type !== 'class_body') {
              if (p.type === 'assignment_expression') { label = p.childForFieldName('left')?.text || ''; break; }
              if (p.type === 'variable_declarator') { label = p.childForFieldName('id')?.text || p.childForFieldName('name')?.text || ''; break; }
              if (p.type === 'field_definition' || p.type === 'public_instance_level_property_definition') { label = p.childForFieldName('name')?.text || ''; break; }
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

    const traverse = (node: TreeSitterNodeLike) => {
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
          parents: [],
          implements: [],
          methods: [],
          fields: [],
          associations: [],
          children: []
        };

        for (let i = 0; i < node.childCount; i++) {
          const child = node.child(i);
          if (config.extendsNodes?.includes(child.type)) {
            getTypeIdentifiers(child).forEach((id, index) => {
              const metaType = effectiveMetadata.get(id);
              if (metaType === 'interface') {
                if (!classInfo.implements.includes(id)) classInfo.implements.push(id);
              } else if (metaType === 'class') {
                if (!classInfo.parents.includes(id)) classInfo.parents.push(id);
              } else {
                if (classInfo.type === 'interface') {
                  if (!classInfo.implements.includes(id)) classInfo.implements.push(id);
                } else if (ext === 'cs') {
                  if (index === 0) {
                    if (!classInfo.parents.includes(id)) classInfo.parents.push(id);
                  } else if (!classInfo.implements.includes(id)) {
                    classInfo.implements.push(id);
                  }
                } else if (!classInfo.parents.includes(id)) {
                  classInfo.parents.push(id);
                }
              }
            });
          } else if (config.implementsNodes?.includes(child.type)) {
            classInfo.implements = Array.from(new Set([...classInfo.implements, ...getTypeIdentifiers(child)]));
          }
        }

        if (body) {
          for (let i = 0; i < body.childCount; i++) {
            const child = body.child(i);
            if (config.methodNodes.includes(child.type)) {
              const methodNameNode = child.childForFieldName('identifier') || child.childForFieldName('name');
              const returnTypeNode = child.childForFieldName('type') || child.childForFieldName('return_type');
              if (methodNameNode) {
                classInfo.methods.push({
                  name: methodNameNode.text.trim().replace(/[;()]/g, ''),
                  type: returnTypeNode ? returnTypeNode.text.trim() : '',
                  visibility: extractVisibility(child, ext, methodNameNode.text)
                });
                extractAssociations(child, classInfo, false);
              }
            } else if (config.fieldNodes.includes(child.type)) {
              let fieldNameNode = child.childForFieldName('identifier') || child.childForFieldName('name');
              const typeNode = child.childForFieldName('type');
              if (!fieldNameNode && child.type === 'field_declaration') {
                const declarator = child.children.find((c) => c.type === 'variable_declarator');
                if (declarator) fieldNameNode = declarator.childForFieldName('identifier') || declarator.childForFieldName('name');
              }
              if (fieldNameNode) {
                classInfo.fields.push({
                  name: fieldNameNode.text.trim().replace(/[;]/g, ''),
                  type: typeNode ? typeNode.text.trim() : '',
                  visibility: extractVisibility(child, ext, fieldNameNode.text)
                });
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
};
