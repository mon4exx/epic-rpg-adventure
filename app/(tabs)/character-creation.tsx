/**
 * Character Creation Screen
 * Allows player to select class and enter character name
 */

import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, TextInput, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useGame } from "@/lib/game-context";
import { createCharacterFromClass } from "@/lib/game-context";
import { CharacterClass } from "@/lib/game-types";
import { classTemplates } from "@/lib/game-database";

const CLASSES = Object.values(CharacterClass);

export default function CharacterCreationScreen() {
  const router = useRouter();
  const { startNewGame } = useGame();
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
  const [characterName, setCharacterName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateCharacter = async () => {
    if (!selectedClass) {
      Alert.alert("Error", "Please select a class");
      return;
    }

    if (!characterName.trim()) {
      Alert.alert("Error", "Please enter a character name");
      return;
    }

    try {
      setIsLoading(true);
      const character = createCharacterFromClass(characterName, selectedClass);
      await startNewGame(character);
      router.replace("/");
    } catch (error) {
      Alert.alert("Error", "Failed to create character");
    } finally {
      setIsLoading(false);
    }
  };

  const template = selectedClass ? classTemplates[selectedClass] : null;

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Title */}
          <View className="items-center gap-2 mb-4">
            <Text className="text-4xl font-bold text-foreground">Create Character</Text>
            <Text className="text-sm text-muted">Choose your class and name</Text>
          </View>

          {/* Name Input */}
          <View className="gap-2">
            <Text className="text-lg font-semibold text-foreground">Character Name</Text>
            <TextInput
              placeholder="Enter character name"
              value={characterName}
              onChangeText={setCharacterName}
              maxLength={20}
              placeholderTextColor="#9BA1A6"
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
            />
          </View>

          {/* Class Selection */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Select Class</Text>
            <View className="gap-2">
              {CLASSES.map((classType) => {
                const tmpl = classTemplates[classType];
                const isSelected = selectedClass === classType;

                return (
                  <Pressable
                    key={classType}
                    onPress={() => setSelectedClass(classType)}
                    style={({ pressed }) => [
                      {
                        backgroundColor: isSelected ? tmpl.color : "#f5f5f5",
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                    className="rounded-lg p-4 border-2"
                  >
                    <View className="gap-1">
                      <Text
                        className={`text-lg font-bold ${
                          isSelected ? "text-white" : "text-foreground"
                        }`}
                      >
                        {classType.charAt(0).toUpperCase() + classType.slice(1)}
                      </Text>
                      <Text
                        className={`text-sm ${
                          isSelected ? "text-white opacity-90" : "text-muted"
                        }`}
                      >
                        {tmpl.description}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Class Stats Preview */}
          {template && (
            <View className="bg-surface rounded-lg p-4 gap-2">
              <Text className="text-lg font-semibold text-foreground mb-2">Base Stats</Text>
              <View className="gap-1">
                <StatRow label="Health" value={template.baseStats.maxHealth} />
                <StatRow label="Mana" value={template.baseStats.maxMana} />
                <StatRow label="Strength" value={template.baseStats.strength} />
                <StatRow label="Intelligence" value={template.baseStats.intelligence} />
                <StatRow label="Dexterity" value={template.baseStats.dexterity} />
                <StatRow label="Armor" value={template.baseStats.armor} />
              </View>
            </View>
          )}

          {/* Create Button */}
          <Pressable
            onPress={handleCreateCharacter}
            disabled={isLoading || !selectedClass || !characterName.trim()}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.8 : 1,
                backgroundColor: selectedClass ? "#0a7ea4" : "#ccc",
              },
            ]}
            className="rounded-lg py-4 items-center mt-4"
          >
            <Text className="text-white font-bold text-lg">
              {isLoading ? "Creating..." : "Create Character"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-row justify-between items-center">
      <Text className="text-sm text-muted">{label}</Text>
      <Text className="text-sm font-semibold text-foreground">{value}</Text>
    </View>
  );
}
