/**
 * Inventory Screen
 */

import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, Alert, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useCharacter, useGame } from "@/lib/game-context";
import { InventorySystem } from "@/lib/inventory-system";
import { ItemType } from "@/lib/game-types";

export default function InventoryScreen() {
  const character = useCharacter();
  const { updateCharacter, saveGame } = useGame();
  const [sortBy, setSortBy] = useState<"type" | "rarity">("type");

  const handleEquip = (itemId: string) => {
    const success = InventorySystem.equipItem(character, itemId);
    if (success) {
      updateCharacter(character);
      saveGame();
      Alert.alert("Success", "Item equipped!");
    } else {
      Alert.alert("Error", "Cannot equip this item");
    }
  };

  const handleUseConsumable = (itemId: string) => {
    const success = InventorySystem.useConsumable(character, itemId);
    if (success) {
      updateCharacter(character);
      saveGame();
      Alert.alert("Success", "Item used!");
    } else {
      Alert.alert("Error", "Cannot use this item");
    }
  };

  const sortedInventory = [...character.inventory];
  if (sortBy === "type") {
    InventorySystem.sortByType(character);
  } else {
    InventorySystem.sortByRarity(character);
  }

  const totalWeight = InventorySystem.getTotalWeight(character);
  const inventoryValue = InventorySystem.getInventoryValue(character);

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="items-center gap-2 mb-4">
            <Text className="text-3xl font-bold text-foreground">Inventory</Text>
          </View>

          {/* Stats */}
          <View className="bg-surface rounded-lg p-4 gap-2">
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Items</Text>
              <Text className="text-sm font-semibold text-foreground">{character.inventory.length}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Weight</Text>
              <Text className="text-sm font-semibold text-foreground">{totalWeight.toFixed(1)} kg</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Value</Text>
              <Text className="text-sm font-semibold text-foreground">{inventoryValue} Gold</Text>
            </View>
          </View>

          {/* Sort Options */}
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setSortBy("type")}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                  backgroundColor: sortBy === "type" ? "#0a7ea4" : "#f5f5f5",
                },
              ]}
              className="flex-1 rounded-lg py-2 px-3 items-center"
            >
              <Text className={sortBy === "type" ? "text-white font-semibold" : "text-foreground"}>
                By Type
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setSortBy("rarity")}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                  backgroundColor: sortBy === "rarity" ? "#0a7ea4" : "#f5f5f5",
                },
              ]}
              className="flex-1 rounded-lg py-2 px-3 items-center"
            >
              <Text className={sortBy === "rarity" ? "text-white font-semibold" : "text-foreground"}>
                By Rarity
              </Text>
            </Pressable>
          </View>

          {/* Items List */}
          {character.inventory.length === 0 ? (
            <View className="bg-surface rounded-lg p-6 items-center">
              <Text className="text-muted">Inventory is empty</Text>
            </View>
          ) : (
            <View className="gap-2">
              {character.inventory.map((invItem) => (
                <InventoryItemCard
                  key={invItem.item.id}
                  item={invItem}
                  onEquip={() => handleEquip(invItem.item.id)}
                  onUse={() => handleUseConsumable(invItem.item.id)}
                />
              ))}
            </View>
          )}

          {/* Equipment Section */}
          <View className="bg-surface rounded-lg p-4 gap-3 mt-4">
            <Text className="text-lg font-semibold text-foreground mb-2">Equipped Items</Text>

            {Object.entries(character.equipment).map(([slot, item]) => (
              <View key={slot} className="flex-row justify-between items-center">
                <Text className="text-sm text-muted capitalize">{slot.replace(/_/g, " ")}</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {item ? item.name : "Empty"}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function InventoryItemCard({
  item,
  onEquip,
  onUse,
}: {
  item: any;
  onEquip: () => void;
  onUse: () => void;
}) {
  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      common: "#687076",
      uncommon: "#22C55E",
      rare: "#3B82F6",
      epic: "#8B5CF6",
      legendary: "#F59E0B",
    };
    return colors[rarity] || "#687076";
  };

  const isEquippable = item.item.equipmentSlot;
  const isConsumable = item.item.type === ItemType.CONSUMABLE;

  return (
    <View className="bg-surface rounded-lg p-3 gap-2">
      <View className="flex-row justify-between items-start gap-2">
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-lg">{item.item.icon}</Text>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground">{item.item.name}</Text>
              <Text
                className="text-xs"
                style={{ color: getRarityColor(item.item.rarity) }}
              >
                {item.item.rarity}
              </Text>
            </View>
          </View>
          <Text className="text-xs text-muted mt-1">{item.item.description}</Text>
        </View>
        <Text className="text-sm font-bold text-foreground">x{item.quantity}</Text>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-2 mt-2">
        {isEquippable && (
          <Pressable
            onPress={onEquip}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            className="flex-1 bg-primary rounded-lg py-2 items-center"
          >
            <Text className="text-white text-xs font-semibold">Equip</Text>
          </Pressable>
        )}
        {isConsumable && (
          <Pressable
            onPress={onUse}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            className="flex-1 bg-success rounded-lg py-2 items-center"
          >
            <Text className="text-white text-xs font-semibold">Use</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
