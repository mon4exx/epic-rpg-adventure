/**
 * Shop Screen
 */

import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useCharacter, useGame } from "@/lib/game-context";
import { InventorySystem } from "@/lib/inventory-system";
import { items } from "@/lib/game-database";

export default function ShopScreen() {
  const character = useCharacter();
  const { updateCharacter, saveGame } = useGame();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const shopItems = Object.values(items).slice(0, 8);

  const handleBuy = (itemId: string) => {
    const item = Object.values(items).find((i) => i.id === itemId);
    if (!item) return;

    if (character.gold < item.value) {
      Alert.alert("Not enough gold", `You need ${item.value} gold to buy this item`);
      return;
    }

    character.gold -= item.value;
    InventorySystem.addItem(character, item, 1);
    updateCharacter(character);
    saveGame();

    Alert.alert("Success", `Bought ${item.name} for ${item.value} gold!`);
  };

  const handleSell = (itemId: string) => {
    const invItem = character.inventory.find((inv) => inv.item.id === itemId);
    if (!invItem) return;

    character.gold += invItem.item.value;
    InventorySystem.removeItem(character, itemId, 1);
    updateCharacter(character);
    saveGame();

    Alert.alert("Success", `Sold ${invItem.item.name} for ${invItem.item.value} gold!`);
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="items-center gap-2 mb-2">
            <Text className="text-3xl font-bold text-foreground">Shop</Text>
            <Text className="text-lg text-warning font-bold">{character.gold} Gold</Text>
          </View>

          {/* Buy Section */}
          <View className="gap-2">
            <Text className="text-lg font-semibold text-foreground">Buy Items</Text>
            {shopItems.map((item) => (
              <ShopItemCard
                key={item.id}
                item={item}
                onBuy={() => handleBuy(item.id)}
                action="Buy"
                price={item.value}
              />
            ))}
          </View>

          {/* Sell Section */}
          <View className="gap-2">
            <Text className="text-lg font-semibold text-foreground">Sell Items</Text>
            {character.inventory.length === 0 ? (
              <View className="bg-surface rounded-lg p-4 items-center">
                <Text className="text-muted">No items to sell</Text>
              </View>
            ) : (
              character.inventory.map((invItem) => (
                <ShopItemCard
                  key={invItem.item.id}
                  item={invItem.item}
                  onBuy={() => handleSell(invItem.item.id)}
                  action="Sell"
                  price={invItem.item.value}
                  quantity={invItem.quantity}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function ShopItemCard({
  item,
  onBuy,
  action,
  price,
  quantity,
}: {
  item: any;
  onBuy: () => void;
  action: string;
  price: number;
  quantity?: number;
}) {
  return (
    <View className="bg-surface rounded-lg p-3 gap-2">
      <View className="flex-row justify-between items-start gap-2">
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-lg">{item.icon}</Text>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground">{item.name}</Text>
              <Text className="text-xs text-muted">{item.description}</Text>
            </View>
          </View>
        </View>
        <View className="items-end gap-1">
          <Text className="text-lg font-bold text-warning">{price}G</Text>
          {quantity && <Text className="text-xs text-muted">x{quantity}</Text>}
        </View>
      </View>

      <Pressable
        onPress={onBuy}
        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
        className="bg-primary rounded-lg py-2 items-center"
      >
        <Text className="text-white text-sm font-semibold">{action}</Text>
      </Pressable>
    </View>
  );
}
