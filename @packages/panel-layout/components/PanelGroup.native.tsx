import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

export interface PanelLayoutColors {
  background: string;
  box: string;
  surface: string;
  text: string;
  primary: string;
}

export interface PanelGroupProps<T> {
  cIdx: number;
  rIdx: number;
  group: string[];
  itemsMap: Record<string, T>;
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onAddItem?: () => void;
  onRemoveItem: (id: string) => void;
  renderItem: (item: T, handlers: any) => React.ReactNode;
  renderTabLabel?: (item: T, isActive: boolean) => React.ReactNode;
  dragOverPos: { cIdx: number; rIdx: number } | null;
  dropZone: string | null;
  onPanelDragOver: (cIdx: number, rIdx: number, e: any, zone?: 'center') => void;
  onPanelDrop: (cIdx: number, rIdx: number) => void;
  onPanelDragLeave: () => void;
  onTabDragStart: (iIdx: number, e: any) => void;
  onDragEnd: () => void;
  colors: PanelLayoutColors;
}

export function PanelGroup<T>({
  group,
  itemsMap,
  activeTabId,
  onSelectTab,
  onAddItem,
  onRemoveItem,
  renderItem,
  renderTabLabel,
  colors,
}: PanelGroupProps<T>) {
  const activeItem = itemsMap[activeTabId];

  return (
    <View style={{ flex: 1, minHeight: 0, minWidth: 0, backgroundColor: colors.background }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {group.map((id) => {
            const item = itemsMap[id];
            if (!item) return null;
            const isActive = activeTabId === id;
            return (
              <Pressable
                key={id}
                onPress={() => onSelectTab(id)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderBottomWidth: 2,
                  borderBottomColor: isActive ? colors.primary : 'transparent',
                  opacity: isActive ? 1 : 0.65,
                }}
              >
                {renderTabLabel ? (
                  renderTabLabel(item, isActive)
                ) : (
                  <Text style={{ color: colors.text, fontSize: 12 }}>
                    {(item as any).title ?? (item as any).name ?? id}
                  </Text>
                )}
                <Pressable onPress={() => onRemoveItem(id)} hitSlop={8}>
                  <Text style={{ color: colors.text, marginLeft: 8 }}>x</Text>
                </Pressable>
              </Pressable>
            );
          })}
          {onAddItem ? (
            <Pressable onPress={onAddItem} style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
              <Text style={{ color: colors.text }}>+</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>

      <View style={{ flex: 1, minHeight: 0 }}>
        {activeItem ? renderItem(activeItem, { onDragStart: () => {}, onDragEnd: () => {} }) : null}
      </View>
    </View>
  );
}
