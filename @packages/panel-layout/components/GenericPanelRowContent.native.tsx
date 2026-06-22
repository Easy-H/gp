import React from 'react';
import { PanelGroup } from './PanelGroup.native';
import type { PanelLayoutColors } from './PanelGroup.native';
import { PanelItemLifecycleWrapper } from './PanelItemLifecycleWrapper';
import { GenericPanelLayoutProps } from './GenericPanelLayout';
import { useGenericPanelLayout } from '../hooks/useGenericPanelLayout';

interface GenericPanelRowContentProps<T> {
  cIdx: number;
  rIdx: number;
  row: { id: string; tabs: string[] };
  layout: ReturnType<typeof useGenericPanelLayout<T>>;
  externalProps: GenericPanelLayoutProps<T>;
  colors: PanelLayoutColors;
}

export function GenericPanelRowContent<T>({
  cIdx,
  rIdx,
  row,
  layout,
  externalProps,
  colors,
}: GenericPanelRowContentProps<T>) {
  const { itemsMap, activeTabMap, setActiveTabMap, handleRemoveItem } = layout;
  const { renderTabLabel, onAddItem, onItemInit, onItemCleanup, getItemDeps, renderItem } = externalProps;

  return (
    <PanelGroup
      cIdx={cIdx}
      rIdx={rIdx}
      group={row.tabs}
      itemsMap={itemsMap}
      activeTabId={activeTabMap[row.id]}
      onSelectTab={(id) => setActiveTabMap((prev) => ({ ...prev, [row.id]: id }))}
      onRemoveItem={(id) => handleRemoveItem(id, row.id, row.tabs)}
      renderTabLabel={(wrapped, isActive) =>
        renderTabLabel ? renderTabLabel(wrapped.data, isActive, wrapped.id) : null
      }
      onAddItem={onAddItem}
      renderItem={(wrapped, handlers) => (
        <PanelItemLifecycleWrapper
          item={wrapped.data}
          id={wrapped.id}
          onInit={onItemInit}
          onCleanup={onItemCleanup}
          deps={getItemDeps?.(wrapped.data, wrapped.id)}
        >
          {renderItem(wrapped.data, wrapped.id, handlers)}
        </PanelItemLifecycleWrapper>
      )}
      dragOverPos={null}
      dropZone={null}
      onPanelDragOver={() => {}}
      onPanelDrop={() => {}}
      onPanelDragLeave={() => {}}
      onTabDragStart={() => {}}
      onDragEnd={() => {}}
      colors={colors}
    />
  );
}
