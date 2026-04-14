/**
 * Main Game Screen - World Map & Exploration
 */

import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useGame, useGameState, useCharacter } from "@/lib/game-context";
import { MovementEngine, EncounterSystem, ProgressionEngine } from "@/lib/game-engine";
import { enemies } from "@/lib/game-database";
import { useRouter } from "expo-router";

const MAP_WIDTH = 10;
const MAP_HEIGHT = 10;
const ENCOUNTER_RATE = 0.3;

export default function GameScreen() {
  const router = useRouter();
  const { gameState, updateGameState, updateCharacter, saveGame } = useGame();
  const character = useCharacter();
  const [selectedTile, setSelectedTile] = useState<{ x: number; y: number } | null>(null);

  if (!gameState) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-foreground">Loading...</Text>
      </ScreenContainer>
    );
  }

  const handleMove = async (x: number, y: number) => {
    const newPos = MovementEngine.movePlayer(
      gameState.position,
      x,
      y,
      MAP_WIDTH,
      MAP_HEIGHT
    );

    if (!newPos) {
      Alert.alert("Invalid Move", "Cannot move there");
      return;
    }

    updateGameState({ position: newPos });
    setSelectedTile(null);

    if (EncounterSystem.checkRandomEncounter(newPos.region, ENCOUNTER_RATE)) {
      const enemyList = Object.values(enemies).filter((e) => !e.isBoss);
      const encounterEnemies = EncounterSystem.selectRandomEnemies(
        enemyList,
        character.level,
        Math.floor(Math.random() * 2) + 1
      );

      Alert.alert(
        "Battle!",
        `You encountered ${encounterEnemies.map((e) => e.name).join(", ")}!`,
        [
          {
            text: "Fight",
            onPress: () => {
              // Battle not yet implemented
              Alert.alert("Battle", "Battle system coming soon!");
            },
          },
        ]
      );
    }

    await saveGame();
  };

  const adjacentTiles = MovementEngine.getAdjacentTiles(
    gameState.position.x,
    gameState.position.y,
    MAP_WIDTH,
    MAP_HEIGHT
  );

  const effectiveStats = ProgressionEngine.getEffectiveStats(character);

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Character Info */}
          <View className="bg-surface rounded-lg p-4 gap-2">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-xl font-bold text-foreground">{character.name}</Text>
                <Text className="text-sm text-muted">
                  Level {character.level} {character.class}
                </Text>
              </View>
              <Text className="text-lg font-bold text-warning">{character.gold} Gold</Text>
            </View>

            {/* Health & Mana Bars */}
            <View className="gap-1">
              <ProgressBar
                label="HP"
                current={effectiveStats.health}
                max={effectiveStats.maxHealth}
                color="#EF4444"
              />
              <ProgressBar
                label="Mana"
                current={effectiveStats.mana}
                max={effectiveStats.maxMana}
                color="#3B82F6"
              />
            </View>

            {/* Experience */}
            <View className="gap-1">
              <View className="flex-row justify-between">
                <Text className="text-xs text-muted">Experience</Text>
                <Text className="text-xs text-muted">
                  {character.experience} / {character.experienceToNextLevel}
                </Text>
              </View>
              <View className="h-2 bg-border rounded-full overflow-hidden">
                <View
                  className="h-full bg-success"
                  style={{
                    width: `${(character.experience / character.experienceToNextLevel) * 100}%`,
                  }}
                />
              </View>
            </View>
          </View>

          {/* Map Display */}
          <View className="bg-surface rounded-lg p-4 gap-3">
            <Text className="text-lg font-semibold text-foreground">Position</Text>
            <Text className="text-sm text-muted">
              X: {gameState.position.x}, Y: {gameState.position.y}
            </Text>

            {/* Adjacent Tiles */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Move To:</Text>
              <View className="flex-row flex-wrap gap-2">
                {adjacentTiles.map((tile) => (
                  <Pressable
                    key={`${tile.x}-${tile.y}`}
                    onPress={() => handleMove(tile.x, tile.y)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                    className="bg-primary rounded-lg px-4 py-2 flex-1 min-w-[45%]"
                  >
                    <Text className="text-white text-center font-semibold">
                      ({tile.x}, {tile.y})
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="gap-2">
            <Pressable
              onPress={() => Alert.alert("Inventory", "Coming soon!")}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="bg-surface rounded-lg p-4"
            >
              <Text className="text-foreground font-semibold">📦 Inventory</Text>
            </Pressable>
            <Pressable
              onPress={() => Alert.alert("Stats", "Coming soon!")}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="bg-surface rounded-lg p-4"
            >
              <Text className="text-foreground font-semibold">📊 Stats</Text>
            </Pressable>
            <Pressable
              onPress={() => Alert.alert("Quests", "Coming soon!")}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="bg-surface rounded-lg p-4"
            >
              <Text className="text-foreground font-semibold">📋 Quests</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function ProgressBar({
  label,
  current,
  max,
  color,
}: {
  label: string;
  current: number;
  max: number;
  color: string;
}) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  return (
    <View className="gap-1">
      <View className="flex-row justify-between">
        <Text className="text-xs text-muted">{label}</Text>
        <Text className="text-xs text-muted">
          {Math.round(current)} / {Math.round(max)}
        </Text>
      </View>
      <View className="h-4 bg-border rounded-full overflow-hidden">
        <View
          className="h-full"
          style={{
            backgroundColor: color,
            width: `${percentage}%`,
          }}
        />
      </View>
    </View>
  );
}
