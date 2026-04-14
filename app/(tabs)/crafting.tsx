/**
 * Crafting Screen
 */

import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useCharacter, useGame } from "@/lib/game-context";
import { CraftingSystem } from "@/lib/skill-crafting-system";
import { recipes } from "@/lib/game-database";

export default function CraftingScreen() {
  const character = useCharacter();
  const { updateCharacter, saveGame } = useGame();
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);

  const availableRecipes = CraftingSystem.getAvailableRecipes(character, recipes);
  const craftableRecipes = CraftingSystem.getCraftableRecipes(character, recipes);

  const handleCraft = async (recipeId: string) => {
    const recipe = recipes[recipeId];
    if (!recipe) return;

    const success = CraftingSystem.craft(character, recipe);

    if (success) {
      updateCharacter(character);
      await saveGame();
      Alert.alert("Success", `Crafted ${recipe.resultItem.name}!`);
      setSelectedRecipe(null);
    } else {
      Alert.alert("Error", "Cannot craft this item");
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="items-center gap-2 mb-2">
            <Text className="text-3xl font-bold text-foreground">Crafting Workshop</Text>
            <Text className="text-sm text-muted">Level {character.level}</Text>
          </View>

          {/* Recipes */}
          <View className="gap-2">
            {availableRecipes.length === 0 ? (
              <View className="bg-surface rounded-lg p-4 items-center">
                <Text className="text-muted">No recipes available at your level</Text>
              </View>
            ) : (
              availableRecipes.map((recipe) => {
                const canCraft = craftableRecipes.some((r) => r.id === recipe.id);

                return (
                  <Pressable
                    key={recipe.id}
                    onPress={() => setSelectedRecipe(recipe.id)}
                    style={({ pressed }) => [
                      {
                        opacity: pressed ? 0.7 : 1,
                        backgroundColor: selectedRecipe === recipe.id ? "#0a7ea4" : "#f5f5f5",
                      },
                    ]}
                    className="rounded-lg p-3"
                  >
                    <View className="gap-2">
                      <View className="flex-row justify-between items-start">
                        <View className="flex-1">
                          <Text
                            className={`font-semibold ${
                              selectedRecipe === recipe.id ? "text-white" : "text-foreground"
                            }`}
                          >
                            {recipe.name}
                          </Text>
                          <Text
                            className={`text-xs ${
                              selectedRecipe === recipe.id ? "text-white opacity-80" : "text-muted"
                            }`}
                          >
                            Level {recipe.level}
                          </Text>
                        </View>
                        <Text className="text-lg">{recipe.resultItem.icon}</Text>
                      </View>

                      {/* Materials */}
                      <View className="gap-1">
                        {recipe.materials.map((material) => {
                          const hasItem = character.inventory.find(
                            (inv) => inv.item.id === material.itemId
                          );
                          const quantity = hasItem?.quantity || 0;
                          const hasEnough = quantity >= material.quantity;

                          return (
                            <Text
                              key={material.itemId}
                              className={`text-xs ${
                                hasEnough
                                  ? selectedRecipe === recipe.id
                                    ? "text-white"
                                    : "text-success"
                                  : selectedRecipe === recipe.id
                                    ? "text-white opacity-60"
                                    : "text-error"
                              }`}
                            >
                              {material.quantity}x Material (Have: {quantity})
                            </Text>
                          );
                        })}
                      </View>

                      {/* Craft Button */}
                      {selectedRecipe === recipe.id && (
                        <Pressable
                          onPress={() => handleCraft(recipe.id)}
                          disabled={!canCraft}
                          style={({ pressed }) => [
                            {
                              opacity: pressed ? 0.7 : 1,
                              backgroundColor: canCraft ? "#22C55E" : "#ccc",
                            },
                          ]}
                          className="rounded-lg py-2 items-center mt-2"
                        >
                          <Text className="text-white text-sm font-semibold">
                            {canCraft ? "Craft" : "Cannot Craft"}
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
