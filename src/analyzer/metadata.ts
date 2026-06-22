import type { Language, Parser } from 'web-tree-sitter';
import type { LanguageConfig } from '../_future/configs';
import type { TreeSitterNodeLike } from './types';

export const extractClassMetadata = (
  parser: Parser | null,
  lang: Language | undefined,
  config: LanguageConfig,
  sourceCode: string
): Map<string, string> => {
  if (!parser || !lang || !sourceCode) return new Map();

  try {
    parser.setLanguage(lang);
    const tree = parser.parse(sourceCode);
    const metadata = new Map<string, string>();

    const collect = (node: TreeSitterNodeLike) => {
      if (config.classNodes.includes(node.type)) {
        const nameNode =
          node.childForFieldName('identifier') ||
          node.childForFieldName('name') ||
          (node.parent?.type === 'assignment_expression' ? node.parent.childForFieldName('left') : null);

        if (nameNode) {
          const name = nameNode.text.split('.').pop()?.replace(/[;{}]/g, '').trim() ?? '';
          const type = node.type.includes('interface') ? 'interface' : 'class';
          if (name) metadata.set(name, type);
        }
      }

      for (let i = 0; i < node.childCount; i++) collect(node.child(i));
    };

    if (tree == null) return new Map();
    collect(tree.rootNode);
    return metadata;
  } catch (err) {
    console.error('Error during extractClassMetadata:', err);
    return new Map();
  }
};
