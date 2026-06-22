import type { Language } from 'web-tree-sitter';

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
  children: string[];
}

export interface TreeSitterNodeLike {
  type: string;
  text: string;
  childCount: number;
  parent?: TreeSitterNodeLike | null;
  child(index: number): TreeSitterNodeLike;
  childForFieldName(name: string): TreeSitterNodeLike | null;
  children: TreeSitterNodeLike[];
}

export type TreeSitterLanguageLike = Language;
