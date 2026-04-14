/**
 * Quest and achievement management systems
 */

import { Character, Quest, QuestStatus, QuestObjective, Achievement, AchievementType } from "./game-types";

export class QuestSystem {
  /**
   * Accept a quest
   */
  static acceptQuest(character: Character, quest: Quest): boolean {
    // Check if already accepted
    if (character.questLog.find((q) => q.id === quest.id)) {
      return false;
    }

    // Check if already completed
    if (character.completedQuests.includes(quest.id)) {
      return false;
    }

    const newQuest = { ...quest };
    newQuest.status = QuestStatus.ACTIVE;
    newQuest.startedAt = Date.now();

    character.questLog.push(newQuest);
    return true;
  }

  /**
   * Update quest objective progress
   */
  static updateObjective(
    character: Character,
    questId: string,
    objectiveId: string,
    progress: number
  ): boolean {
    const quest = character.questLog.find((q) => q.id === questId);
    if (!quest) return false;

    const objective = quest.objectives.find((o) => o.id === objectiveId);
    if (!objective) return false;

    objective.progress = Math.min(progress, objective.required);

    if (objective.progress >= objective.required) {
      objective.completed = true;
    }

    return true;
  }

  /**
   * Check if quest is complete
   */
  static isQuestComplete(quest: Quest): boolean {
    return quest.objectives.every((obj) => obj.completed);
  }

  /**
   * Complete a quest
   */
  static completeQuest(character: Character, questId: string): boolean {
    const questIndex = character.questLog.findIndex((q) => q.id === questId);
    if (questIndex === -1) return false;

    const quest = character.questLog[questIndex];

    if (!this.isQuestComplete(quest)) {
      return false;
    }

    quest.status = QuestStatus.COMPLETED;
    quest.completedAt = Date.now();

    // Add rewards
    character.experience += quest.rewards.experience;
    character.gold += quest.rewards.gold;

    for (const item of quest.rewards.items) {
      character.gold += item.value;
    }

    // Move to completed quests
    character.completedQuests.push(questId);
    character.questLog.splice(questIndex, 1);

    return true;
  }

  /**
   * Abandon a quest
   */
  static abandonQuest(character: Character, questId: string): boolean {
    const index = character.questLog.findIndex((q) => q.id === questId);
    if (index === -1) return false;

    character.questLog.splice(index, 1);
    return true;
  }

  /**
   * Get active quests
   */
  static getActiveQuests(character: Character): Quest[] {
    return character.questLog.filter((q) => q.status === QuestStatus.ACTIVE);
  }

  /**
   * Get completed quests
   */
  static getCompletedQuests(character: Character): Quest[] {
    return character.questLog.filter((q) => q.status === QuestStatus.COMPLETED);
  }
}

export class AchievementSystem {
  /**
   * Unlock an achievement
   */
  static unlockAchievement(character: Character, achievementId: string): boolean {
    const achievement = character.achievements.find((a) => a.id === achievementId);

    if (!achievement) {
      return false;
    }

    if (achievement.unlockedAt) {
      return false;
    }

    achievement.unlockedAt = Date.now();
    character.gold += achievement.reward.gold;
    character.experience += achievement.reward.experience;

    return true;
  }

  /**
   * Update achievement progress
   */
  static updateProgress(
    character: Character,
    achievementId: string,
    progress: number
  ): boolean {
    const achievement = character.achievements.find((a) => a.id === achievementId);

    if (!achievement || achievement.unlockedAt) {
      return false;
    }

    achievement.progress = Math.min(progress, achievement.requirement);

    if (achievement.progress >= achievement.requirement) {
      return this.unlockAchievement(character, achievementId);
    }

    return true;
  }

  /**
   * Get unlocked achievements
   */
  static getUnlockedAchievements(character: Character): Achievement[] {
    return character.achievements.filter((a) => a.unlockedAt !== undefined);
  }

  /**
   * Get achievement progress
   */
  static getProgress(character: Character, achievementId: string): number {
    const achievement = character.achievements.find((a) => a.id === achievementId);
    return achievement?.progress || 0;
  }

  /**
   * Check level milestone
   */
  static checkLevelMilestone(character: Character): void {
    const milestones = [5, 10, 20, 50, 100];

    for (const milestone of milestones) {
      if (character.level === milestone) {
        const achievementId = `level_${milestone}`;
        const achievement = character.achievements.find((a) => a.id === achievementId);
        if (achievement) {
          this.unlockAchievement(character, achievementId);
        }
      }
    }
  }

  /**
   * Track combat victory
   */
  static trackCombatVictory(character: Character): void {
    const achievement = character.achievements.find((a) => a.id === "first_victory");
    if (achievement && !achievement.unlockedAt) {
      this.updateProgress(character, "first_victory", achievement.progress + 1);
    }
  }

  /**
   * Track boss defeat
   */
  static trackBossDefeat(character: Character, bossId: string): void {
    const achievement = character.achievements.find((a) => a.id === "dragon_slayer");
    if (achievement && bossId === "dragon" && !achievement.unlockedAt) {
      this.unlockAchievement(character, "dragon_slayer");
    }
  }
}
