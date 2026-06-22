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

const addAssociation = (
  classInfo: ClassInfo,
  effectiveMetadata: Map<string, string>,
  targetClass: string,
  label: string,
  relationType: 'composition' | 'association'
) => {
  if (!targetClass || targetClass === classInfo.name) return;
  if (!effectiveMetadata.has(targetClass)) return;
  if (!classInfo.associations.some(a => a.target === targetClass && a.label === label)) {
    classInfo.associations.push({ target: targetClass, label, relationType });
  }
};

const findFirstNodeOfTypes = (node: TreeSitterNodeLike, types: string[]): TreeSitterNodeLike | null => {
  if (!types || types.length === 0) return null;
  if (types.includes(node.type)) return node;
  for (let i = 0; i < node.childCount; i++) {
    const found = findFirstNodeOfTypes(node.child(i), types);
    if (found) return found;
  }
  return null;
};

const getParameterInfo = (param: TreeSitterNodeLike) => {
  const nameNode = param.childForFieldName('name') || param.childForFieldName('identifier');
  const typeNode = param.childForFieldName('type') || param.childForFieldName('value');
  return {
    label: nameNode?.text?.trim().replace(/[;]/g, '') ?? '',
    targetClass: typeNode?.text?.split('.').pop()?.replace(/[<>\[\];{}]/g, '').trim() ?? '',
  };
};

const getAssignmentFieldInfo = (node: TreeSitterNodeLike) => {
  if (node.type !== 'assignment_expression') return null;
  const leftNode = node.childForFieldName('left');
  const rightNode = node.childForFieldName('right');
  const leftText = leftNode?.text?.trim() ?? '';
  if (!leftText.startsWith('this.')) return null;

  const fieldName = leftText.replace(/^this\./, '').replace(/[;]/g, '').trim();
  const rightText = rightNode?.text?.trim() ?? '';
  const constructorNode = rightNode?.childForFieldName('constructor') || rightNode?.childForFieldName('type');
  const targetClass = (constructorNode?.text || rightText)
    .split('.')
    .pop()
    ?.replace(/[<>\[\];{}()]/g, '')
    .trim() ?? '';

  return {
    fieldName,
    targetClass,
    isNewExpression: rightNode?.type === 'new_expression' || rightText.startsWith('new '),
  };
};

const walkForAssignmentFields = (
  node: TreeSitterNodeLike,
  classInfo: ClassInfo,
  effectiveMetadata: Map<string, string>
) => {
  const visit = (n: TreeSitterNodeLike) => {
    const info = getAssignmentFieldInfo(n);
    if (info && info.isNewExpression) {
      if (!classInfo.fields.some(f => f.name === info.fieldName)) {
        classInfo.fields.push({
          name: info.fieldName,
          type: info.targetClass,
          visibility: 'private'
        });
      }
      addAssociation(classInfo, effectiveMetadata, info.targetClass, info.fieldName, 'composition');
    }
    for (let i = 0; i < n.childCount; i++) visit(n.child(i));
  };
  visit(node);
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

                const paramContainer = findFirstNodeOfTypes(child, config.parameterNodes ?? []);
                if (paramContainer) {
                  for (let p = 0; p < paramContainer.childCount; p++) {
                    const param = paramContainer.child(p);
                    const { targetClass, label } = getParameterInfo(param);
                    addAssociation(classInfo, effectiveMetadata, targetClass, label, 'association');
                  }
                }

                if (ext === 'js' || ext === 'jsx' || ext === 'ts' || ext === 'tsx') {
                  walkForAssignmentFields(child, classInfo, effectiveMetadata);
                }
              }
              continue;
            }

            if (config.fieldNodes.includes(child.type)) {
              let fieldNameNode = child.childForFieldName('identifier') || child.childForFieldName('name');
              const typeNode = child.childForFieldName('type');
              if (!fieldNameNode && child.type === 'field_declaration') {
                const declarator = child.children.find((c) => c.type === 'variable_declarator');
                if (declarator) fieldNameNode = declarator.childForFieldName('identifier') || declarator.childForFieldName('name');
              }
              if (fieldNameNode) {
                const fieldName = fieldNameNode.text.trim().replace(/[;]/g, '');
                classInfo.fields.push({
                  name: fieldName,
                  type: typeNode ? typeNode.text.trim() : '',
                  visibility: extractVisibility(child, ext, fieldNameNode.text)
                });

                const fieldType = typeNode?.text?.split('.').pop()?.replace(/[<>\[\];{}]/g, '').trim() ?? '';
                addAssociation(classInfo, effectiveMetadata, fieldType, fieldName, 'composition');
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
