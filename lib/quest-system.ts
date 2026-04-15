/**
 * Quest and achievement systems
 */

import { Character, Quest, Achievement } from "./game-types";

export class QuestSystem {
  static acceptQuest(character: Character, quest: Quest) {
    if (!character.questLog.find((q) => q.id === quest.id)) {
      character.questLog.push({ ...quest });
    }
  }

  static updateObjective(character: Character, questId: string, objectiveId: string, amount: number) {
    const quest = character.questLog.find((q) => q.id === questId);
    if (quest) {
      const objective = quest.objectives.find((o) => o.id === objectiveId);
      if (objective) {
        objective.current = Math.min(objective.current + amount, objective.target);
        if (objective.current >= objective.target) {
          quest.completed = true;
        }
      }
    }
  }

  static completeQuest(character: Character, questId: string) {
    const quest = character.questLog.find((q) => q.id === questId);
    if (quest && quest.completed) {
      character.gold += quest.rewards.gold;
      character.experience += quest.rewards.experience;
      character.completedQuests.push(questId);
      character.questLog = character.questLog.filter((q) => q.id !== questId);
    }
  }
}

export class AchievementSystem {
  static unlockAchievement(character: Character, achievementId: string) {
    const achievement = character.achievements.find((a) => a.id === achievementId);
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      achievement.unlockedAt = Date.now();
    }
  }

  static checkAchievements(character: Character) {
    if (character.level >= 5) {
      this.unlockAchievement(character, "level_5");
    }
    if (character.level >= 10) {
      this.unlockAchievement(character, "level_10");
    }
    if (character.gold >= 1000) {
      this.unlockAchievement(character, "rich");
    }
  }
}
