/**
 * Character Stats Screen
 */

import React from "react";
import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useCharacter } from "@/lib/game-context";
import { ProgressionEngine } from "@/lib/game-engine";

export default function CharacterStatsScreen() {
  const character = useCharacter();
  const effectiveStats = ProgressionEngine.getEffectiveStats(character);

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="items-center gap-2 mb-4">
            <Text className="text-3xl font-bold text-foreground">{character.name}</Text>
            <Text className="text-lg text-muted">
              Level {character.level} {character.class}
            </Text>
          </View>

          {/* Primary Stats */}
          <View className="bg-surface rounded-lg p-4 gap-3">
            <Text className="text-lg font-semibold text-foreground mb-2">Primary Stats</Text>

            <StatDisplay label="Health" value={effectiveStats.health} max={effectiveStats.maxHealth} />
            <StatDisplay label="Mana" value={effectiveStats.mana} max={effectiveStats.maxMana} />
            <StatDisplay label="Experience" value={character.experience} max={character.experienceToNextLevel} />
          </View>

          {/* Attributes */}
          <View className="bg-surface rounded-lg p-4 gap-3">
            <Text className="text-lg font-semibold text-foreground mb-2">Attributes</Text>

            <StatRow label="Strength" value={effectiveStats.strength} />
            <StatRow label="Intelligence" value={effectiveStats.intelligence} />
            <StatRow label="Dexterity" value={effectiveStats.dexterity} />
            <StatRow label="Constitution" value={effectiveStats.constitution} />
            <StatRow label="Wisdom" value={effectiveStats.wisdom} />
            <StatRow label="Charisma" value={effectiveStats.charisma} />
          </View>

          {/* Combat Stats */}
          <View className="bg-surface rounded-lg p-4 gap-3">
            <Text className="text-lg font-semibold text-foreground mb-2">Combat Stats</Text>

            <StatRow label="Armor" value={Math.round(effectiveStats.armor)} />
            <StatRow label="Magic Resist" value={Math.round(effectiveStats.magicResist)} />
            <StatRow label="Critical Chance" value={Math.round(effectiveStats.critChance * 100)} suffix="%" />
            <StatRow label="Critical Damage" value={effectiveStats.critDamage.toFixed(1)} suffix="x" />
          </View>

          {/* Resources */}
          <View className="bg-surface rounded-lg p-4 gap-3">
            <Text className="text-lg font-semibold text-foreground mb-2">Resources</Text>

            <StatRow label="Gold" value={character.gold} />
            <StatRow label="Skill Points" value={character.skillPoints} />
            <StatRow label="Active Quests" value={character.questLog.length} />
            <StatRow label="Completed Quests" value={character.completedQuests.length} />
          </View>

          {/* Equipment Summary */}
          <View className="bg-surface rounded-lg p-4 gap-3">
            <Text className="text-lg font-semibold text-foreground mb-2">Equipment</Text>

            {Object.entries(character.equipment).map(([slot, item]) => (
              <View key={slot} className="flex-row justify-between items-center">
                <Text className="text-sm text-muted capitalize">{slot.replace(/_/g, " ")}</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {item ? item.name : "Empty"}
                </Text>
              </View>
            ))}
          </View>

          {/* Achievements */}
          <View className="bg-surface rounded-lg p-4 gap-3">
            <Text className="text-lg font-semibold text-foreground mb-2">Achievements</Text>

            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-muted">Unlocked</Text>
              <Text className="text-sm font-semibold text-foreground">
                {character.achievements.filter((a) => a.unlockedAt).length} / {character.achievements.length}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function StatDisplay({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <View className="gap-1">
      <View className="flex-row justify-between">
        <Text className="text-sm text-muted">{label}</Text>
        <Text className="text-sm font-semibold text-foreground">
          {Math.round(value)} / {Math.round(max)}
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

function StatRow({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number | string;
  suffix?: string;
}) {
  return (
    <View className="flex-row justify-between items-center">
      <Text className="text-sm text-muted">{label}</Text>
      <Text className="text-sm font-semibold text-foreground">
        {value}
        {suffix}
      </Text>
    </View>
  );
}
