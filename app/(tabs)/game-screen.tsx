import { ScrollView, Text, View, TouchableOpacity, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useCharacter, useGame } from "@/lib/game-context";
import { useState } from "react";
import { ProgressionEngine, EncounterSystem } from "@/lib/game-engine";
import { enemies } from "@/lib/game-database";

export default function GameScreen() {
  const character = useCharacter();
  const { gameState, updateCharacter } = useGame();
  const [selectedTile, setSelectedTile] = useState<{ x: number; y: number } | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);

  if (!character || !character.name) {
    return (
      <ScreenContainer className="p-6 items-center justify-center">
        <Text className="text-foreground text-lg">No character loaded</Text>
      </ScreenContainer>
    );
  }

  const handleMove = (x: number, y: number) => {
    setSelectedTile({ x, y });
    const hasEncounter = EncounterSystem.checkRandomEncounter(gameState.currentPosition.region, 0.3);
    if (hasEncounter) {
      setBattleLog(["⚔️ An enemy appears!"]);
    }
  };

  const handleLevelUp = () => {
    const newChar = { ...character };
    ProgressionEngine.addExperience(newChar, 100);
    updateCharacter(newChar);
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView>
        <View className="gap-4">
          {/* Character Info */}
          <View className="bg-surface rounded-lg p-4 border border-border">
            <Text className="text-2xl font-bold text-foreground">{character.name}</Text>
            <Text className="text-muted">Level {character.level} {character.class}</Text>
            <View className="mt-2 gap-1">
              <Text className="text-sm text-foreground">HP: {character.stats.health}/{character.stats.maxHealth}</Text>
              <Text className="text-sm text-foreground">Mana: {character.stats.mana}/{character.stats.maxMana}</Text>
              <Text className="text-sm text-foreground">Gold: {character.gold}</Text>
            </View>
          </View>

          {/* World Map */}
          <View className="bg-surface rounded-lg p-4 border border-border">
            <Text className="text-lg font-bold text-foreground mb-3">World Map</Text>
            <View className="gap-2">
              {Array.from({ length: 5 }).map((_, row) => (
                <View key={row} className="flex-row gap-2">
                  {Array.from({ length: 5 }).map((_, col) => (
                    <TouchableOpacity
                      key={`${row}-${col}`}
                      onPress={() => handleMove(col, row)}
                      className={`w-12 h-12 rounded items-center justify-center border ${
                        selectedTile?.x === col && selectedTile?.y === row
                          ? "bg-primary border-primary"
                          : "bg-border border-muted"
                      }`}
                    >
                      <Text className="text-lg">{row === 2 && col === 2 ? "🧙" : "🌲"}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          </View>

          {/* Battle Log */}
          {battleLog.length > 0 && (
            <View className="bg-surface rounded-lg p-4 border border-border">
              <Text className="text-lg font-bold text-foreground mb-2">Battle</Text>
              {battleLog.map((log, idx) => (
                <Text key={idx} className="text-sm text-foreground">
                  {log}
                </Text>
              ))}
            </View>
          )}

          {/* Actions */}
          <View className="gap-2">
            <TouchableOpacity className="bg-primary px-4 py-3 rounded-lg items-center active:opacity-70">
              <Text className="text-white font-bold">Inventory</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-primary px-4 py-3 rounded-lg items-center active:opacity-70">
              <Text className="text-white font-bold">Stats</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLevelUp} className="bg-success px-4 py-3 rounded-lg items-center active:opacity-70">
              <Text className="text-white font-bold">Gain XP (Test)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
