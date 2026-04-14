import React, { useEffect, useState } from "react";
import { ScrollView, Text, View, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useGame } from "@/lib/game-context";

export default function HomeScreen() {
  const router = useRouter();
  const { gameState, loadGame, isLoading } = useGame();
  const [hasExistingGame, setHasExistingGame] = useState(false);

  useEffect(() => {
    // Check if there's an existing game
    loadGame().then(() => {
      setHasExistingGame(!!gameState);
    });
  }, []);

  const handleNewGame = () => {
    router.push("/character-creation");
  };

  const handleContinueGame = () => {
    if (gameState) {
      router.push("/game-screen");
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-8 justify-center">
          {/* Title */}
          <View className="items-center gap-4">
            <Text className="text-5xl font-bold text-foreground">⚔️</Text>
            <Text className="text-4xl font-bold text-foreground">Epic RPG Adventure</Text>
            <Text className="text-base text-muted text-center">Experience an immersive fantasy adventure</Text>
          </View>

          {/* Main Buttons */}
          <View className="gap-3">
            {hasExistingGame && (
              <Pressable
                onPress={handleContinueGame}
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                className="bg-success rounded-lg py-4 px-6 items-center"
              >
                <Text className="text-white font-bold text-lg">Continue Game</Text>
              </Pressable>
            )}

            <Pressable
              onPress={handleNewGame}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              className="bg-primary rounded-lg py-4 px-6 items-center"
            >
              <Text className="text-white font-bold text-lg">New Game</Text>
            </Pressable>
          </View>

          {/* Features */}
          <View className="bg-surface rounded-lg p-6 gap-3">
            <Text className="text-lg font-semibold text-foreground mb-2">Features</Text>
            <FeatureItem icon="⚔️" text="Turn-based combat system" />
            <FeatureItem icon="📊" text="Character progression & leveling" />
            <FeatureItem icon="🎯" text="Quest system with rewards" />
            <FeatureItem icon="🏪" text="Shop & crafting system" />
            <FeatureItem icon="🐉" text="Boss battles & dungeons" />
            <FeatureItem icon="🏆" text="Achievements & prestige" />
          </View>

          {/* Footer */}
          <View className="items-center gap-1">
            <Text className="text-xs text-muted">Version 1.0.0</Text>
            <Text className="text-xs text-muted">Made with ❤️ using Expo & React Native</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View className="flex-row items-center gap-3">
      <Text className="text-xl">{icon}</Text>
      <Text className="text-sm text-foreground flex-1">{text}</Text>
    </View>
  );
}
