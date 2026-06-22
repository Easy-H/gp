import React, { forwardRef, useMemo } from 'react';
import { View } from 'react-native';
import {
  GenericPanelLayoutHandle,
  SerializedPanelLayout,
  useGenericPanelLayout,
  PanelLayout,
} from '../hooks/useGenericPanelLayout';
import { GenericPanelRowContent } from './GenericPanelRowContent.native';
import type { PanelLayoutColors } from './PanelGroup.native';

export type { GenericPanelLayoutHandle, PanelLayout, SerializedPanelLayout };

export interface GenericPanelLayoutProps<T> {
  colors?: PanelLayoutColors;
  items: T[];
  renderItem: (
    item: T,
    id: string,
    handlers: { onDragStart: () => void; onDragEnd: () => void }
  ) => React.ReactNode;
  renderTabLabel?: (item: T, isActive: boolean, id: string) => React.ReactNode;
  onItemInit?: (item: T, id: string) => void;
  onItemCleanup?: (item: T, id: string) => void;
  getItemDeps?: (item: T, id: string) => any[];
  onRemoveItem?: (item: T, id: string) => void;
  onReorderItems?: (newItems: T[]) => void;
  onAddItem?: () => Promise<T | undefined>;
  emptyPlaceholder?: React.ReactNode;
  labels?: {
    toVertical: string;
    toHorizontal: string;
  };
  maxColumns?: number;
  maxRows?: number;
  layout?: SerializedPanelLayout;
  onLayoutChange?: (layoutJson: PanelLayout<T>) => void;
  onLayoutChangeEnd?: (layoutJson: PanelLayout<T>) => void;
}

function GenericPanelLayoutComponent<T>(props: GenericPanelLayoutProps<T>, ref: React.ForwardedRef<GenericPanelLayoutHandle<T>>) {
  const layoutResult = useGenericPanelLayout(props, ref);
  const { groups } = layoutResult;
  const colors = props.colors ?? {
    background: '#12151b',
    box: '#1a1f28',
    surface: '#2a3140',
    text: '#e7ebf3',
    primary: '#4f8cff',
  };

  const content = useMemo(() => {
    if (groups.length === 0) return props.emptyPlaceholder ?? null;
    return groups.map((column, cIdx) =>
      column.map((row, rIdx) => (
        <GenericPanelRowContent
          key={row.id}
          cIdx={cIdx}
          rIdx={rIdx}
          row={row}
          layout={layoutResult}
          externalProps={props}
          colors={colors}
        />
      ))
    );
  }, [groups, layoutResult, props]);

  return <View style={{ flex: 1 }}>{content}</View>;
}

export const GenericPanelLayout = forwardRef(GenericPanelLayoutComponent) as <T>(
  props: GenericPanelLayoutProps<T> & { ref?: React.Ref<GenericPanelLayoutHandle<T>> }
) => React.ReactElement;
