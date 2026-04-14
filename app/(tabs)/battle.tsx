/**
 * Battle Screen - Turn-based Combat System
 */

import React, { useState, useEffect } from "react";
import { ScrollView, Text, View, Pressable, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useCharacter, useGame } from "@/lib/game-context";
import { CombatEngine, ProgressionEngine, EncounterSystem } from "@/lib/game-engine";
import { CombatParticipant, BattleState } from "@/lib/game-types";
import { enemies } from "@/lib/game-database";
import { useRouter } from "expo-router";

export default function BattleScreen() {
  const router = useRouter();
  const character = useCharacter();
  const { updateCharacter, saveGame } = useGame();
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);

  useEffect(() => {
    initializeBattle();
  }, []);

  const initializeBattle = () => {
    const effectiveStats = ProgressionEngine.getEffectiveStats(character);

    const player: CombatParticipant = {
      id: character.id,
      name: character.name,
      stats: effectiveStats,
      abilities: [],
      statusEffects: [],
      isEnemy: false,
      speed: effectiveStats.dexterity,
    };

    const enemyList = Object.values(enemies).filter((e) => !e.isBoss);
    const selectedEnemies = EncounterSystem.selectRandomEnemies(
      enemyList,
      character.level,
      Math.floor(Math.random() * 2) + 1
    );

    const battleEnemies: CombatParticipant[] = selectedEnemies.map((enemy) => ({
      id: enemy.id,
      name: enemy.name,
      stats: { ...enemy.stats },
      abilities: enemy.abilities,
      statusEffects: [],
      isEnemy: true,
      speed: enemy.stats.dexterity,
    }));

    const turnOrder = CombatEngine.calculateTurnOrder([player, ...battleEnemies]);

    setBattleState({
      id: `battle_${Date.now()}`,
      player,
      enemies: battleEnemies,
      currentTurn: 0,
      turnOrder,
      currentActorIndex: 0,
      combatLog: [],
      isPlayerTurn: turnOrder[0] === player.id,
      battleOver: false,
      playerWon: false,
      rewards: { experience: 0, gold: 0, items: [] },
    });
  };

  const handleAttack = () => {
    if (!battleState || selectedTarget === null) return;

    const player = battleState.player;
    const target = battleState.enemies[selectedTarget];

    if (!player.abilities[0]) {
      Alert.alert("Error", "No attack ability available");
      return;
    }

    const log = CombatEngine.executeAction(player, player.abilities[0], target);
    battleState.combatLog.push(log);

    if (target.stats.health <= 0) {
      battleState.enemies.splice(selectedTarget, 1);

      if (battleState.enemies.length === 0) {
        endBattle(true);
        return;
      }
    }

    setTimeout(() => {
      enemyTurn();
    }, 500);
  };

  const enemyTurn = () => {
    if (!battleState) return;

    for (const enemy of battleState.enemies) {
      if (enemy.stats.health <= 0) continue;

      const { ability, target } = CombatEngine.selectAIAbility(enemy, [battleState.player]);
      const log = CombatEngine.executeAction(enemy, ability, battleState.player);
      battleState.combatLog.push(log);

      if (battleState.player.stats.health <= 0) {
        endBattle(false);
        return;
      }
    }

    setSelectedTarget(null);
    setBattleState({ ...battleState });
  };

  const endBattle = async (playerWon: boolean) => {
    if (!battleState) return;

    if (playerWon) {
      const rewards = EncounterSystem.calculateRewards(
        battleState.enemies.map((e) => {
          const enemy = Object.values(enemies).find((en) => en.id === e.id);
          return enemy || ({} as any);
        })
      );

      character.experience += rewards.experience;
      character.gold += rewards.gold;

      const levelsGained = ProgressionEngine.addExperience(character, 0);

      updateCharacter(character);
      await saveGame();

      Alert.alert(
        "Victory!",
        `You defeated the enemies!\n\nExperience: +${rewards.experience}\nGold: +${rewards.gold}${
          levelsGained > 0 ? `\nLevels gained: +${levelsGained}` : ""
        }`,
        [
          {
            text: "Continue",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      Alert.alert("Defeat!", "You were defeated in battle!", [
        {
          text: "Return to Town",
          onPress: () => {
            character.stats.health = character.stats.maxHealth;
            character.stats.mana = character.stats.maxMana;
            updateCharacter(character);
            saveGame();
            router.back();
          },
        },
      ]);
    }
  };

  if (!battleState) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-foreground">Initializing battle...</Text>
      </ScreenContainer>
    );
  }

  const playerStats = battleState.player.stats;

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Player Info */}
          <View className="bg-surface rounded-lg p-4 gap-2">
            <Text className="text-lg font-bold text-foreground">{battleState.player.name}</Text>
            <HealthBar current={playerStats.health} max={playerStats.maxHealth} />
            <ManaBar current={playerStats.mana} max={playerStats.maxMana} />
          </View>

          {/* Enemies */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Enemies</Text>
            {battleState.enemies.map((enemy, index) => (
              <Pressable
                key={enemy.id}
                onPress={() => setSelectedTarget(index)}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.7 : 1,
                    backgroundColor: selectedTarget === index ? "#0a7ea4" : "#f5f5f5",
                  },
                ]}
                className="rounded-lg p-3"
              >
                <View className="gap-1">
                  <Text
                    className={`font-semibold ${
                      selectedTarget === index ? "text-white" : "text-foreground"
                    }`}
                  >
                    {enemy.name}
                  </Text>
                  <View className="h-3 bg-border rounded-full overflow-hidden">
                    <View
                      className="h-full bg-error"
                      style={{
                        width: `${Math.max(0, (enemy.stats.health / enemy.stats.maxHealth) * 100)}%`,
                      }}
                    />
                  </View>
                </View>
              </Pressable>
            ))}
          </View>

          {/* Combat Log */}
          <View className="bg-surface rounded-lg p-3">
            <Text className="text-xs font-semibold text-foreground mb-2">Battle Log</Text>
            <ScrollView>
              {battleState.combatLog.slice(-5).map((log, index) => (
                <Text key={index} className="text-xs text-muted mb-1">
                  {log.message}
                </Text>
              ))}
            </ScrollView>
          </View>

          {/* Actions */}
          <View className="gap-2">
            <Pressable
              onPress={handleAttack}
              disabled={selectedTarget === null || battleState.battleOver}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                  backgroundColor: selectedTarget !== null ? "#22C55E" : "#ccc",
                },
              ]}
              className="rounded-lg py-3 items-center"
            >
              <Text className="text-white font-bold">Attack</Text>
            </Pressable>

            <Pressable
              onPress={() => Alert.alert("Defend", "Defend action coming soon!")}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="rounded-lg py-3 items-center bg-warning"
            >
              <Text className="text-white font-bold">Defend</Text>
            </Pressable>

            <Pressable
              onPress={() => Alert.alert("Flee", "Flee action coming soon!")}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="rounded-lg py-3 items-center bg-error"
            >
              <Text className="text-white font-bold">Flee</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function HealthBar({ current, max }: { current: number; max: number }) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  return (
    <View className="gap-1">
      <View className="flex-row justify-between">
        <Text className="text-xs text-muted">Health</Text>
        <Text className="text-xs text-muted">
          {Math.round(current)} / {Math.round(max)}
        </Text>
      </View>
      <View className="h-4 bg-border rounded-full overflow-hidden">
        <View
          className="h-full bg-error"
          style={{
            width: `${percentage}%`,
          }}
        />
      </View>
    </View>
  );
}

function ManaBar({ current, max }: { current: number; max: number }) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  return (
    <View className="gap-1">
      <View className="flex-row justify-between">
        <Text className="text-xs text-muted">Mana</Text>
        <Text className="text-xs text-muted">
          {Math.round(current)} / {Math.round(max)}
        </Text>
      </View>
      <View className="h-4 bg-border rounded-full overflow-hidden">
        <View
          className="h-full bg-primary"
          style={{
            width: `${percentage}%`,
          }}
        />
      </View>
    </View>
  );
}
