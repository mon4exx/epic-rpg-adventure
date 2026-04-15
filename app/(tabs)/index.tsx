import { ScrollView, Text, View, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useGame } from "@/lib/game-context";
import { CharacterClass } from "@/lib/game-types";
import { useState } from "react";

export default function HomeScreen() {
  const router = useRouter();
  const { character, startNewGame } = useGame();
  const [showClassSelect, setShowClassSelect] = useState(false);

  const handleStartGame = (classType: CharacterClass) => {
    Alert.prompt(
      "Character Name",
      "Enter your character name:",
      [
        {
          text: "Cancel",
          onPress: () => setShowClassSelect(false),
        },
        {
          text: "Create",
          onPress: (name: string | undefined) => {
            if (name) {
              startNewGame(name, classType);
              router.push("/" as any);
            }
          },
        },
      ],
      "plain-text"
    );
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6 justify-center">
          {/* Title */}
          <View className="items-center gap-2 mb-4">
            <Text className="text-5xl font-bold text-foreground">⚔️ Epic RPG</Text>
            <Text className="text-lg text-muted">Adventure Awaits</Text>
          </View>

          {!character ? (
            <>
              {!showClassSelect ? (
                <TouchableOpacity
                  onPress={() => setShowClassSelect(true)}
                  className="bg-primary px-8 py-4 rounded-lg items-center active:opacity-70"
                >
                  <Text className="text-white text-lg font-bold">New Game</Text>
                </TouchableOpacity>
              ) : (
                <View className="gap-3">
                  <Text className="text-foreground font-bold text-center mb-2">Select Your Class</Text>
                  {[
                    { class: CharacterClass.WARRIOR, icon: "🛡️", name: "Warrior" },
                    { class: CharacterClass.MAGE, icon: "🔮", name: "Mage" },
                    { class: CharacterClass.ROGUE, icon: "🗡️", name: "Rogue" },
                    { class: CharacterClass.PALADIN, icon: "✨", name: "Paladin" },
                  ].map(({ class: classType, icon, name }) => (
                    <TouchableOpacity
                      key={classType}
                      onPress={() => handleStartGame(classType)}
                      className="bg-surface border border-border rounded-lg p-4 flex-row items-center gap-3 active:opacity-70"
                    >
                      <Text className="text-3xl">{icon}</Text>
                      <View className="flex-1">
                        <Text className="text-foreground font-bold">{name}</Text>
                        <Text className="text-muted text-sm">Select to begin</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    onPress={() => setShowClassSelect(false)}
                    className="bg-border px-6 py-2 rounded-lg items-center mt-2 active:opacity-70"
                  >
                    <Text className="text-foreground font-semibold">Back</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            <View className="gap-4">
              <View className="bg-surface rounded-lg p-4 items-center">
                <Text className="text-2xl font-bold text-foreground">{character.name}</Text>
                <Text className="text-muted">Level {character.level}</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/" as any)}
                className="bg-primary px-8 py-4 rounded-lg items-center active:opacity-70"
              >
                <Text className="text-white text-lg font-bold">Continue Game</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowClassSelect(true)}
                className="bg-border px-8 py-4 rounded-lg items-center active:opacity-70"
              >
                <Text className="text-foreground font-semibold">New Game</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
