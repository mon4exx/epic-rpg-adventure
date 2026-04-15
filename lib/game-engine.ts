/**
 * Core game engine: combat, movement, progression
 */

import { Ability, Character, CombatLog, CombatParticipant, DamageType, Enemy, StatusEffect } from "./game-types";

export class CombatEngine {
  static calculateDamage(attacker: CombatParticipant, ability: Ability, defender: CombatParticipant): number {
    let damage = ability.baseDamage;

    // Add stat scaling
    if (ability.damageType === DamageType.PHYSICAL) {
      damage += attacker.stats.strength * 0.5;
    } else {
      damage += attacker.stats.intelligence * 0.5;
    }

    // Random variance
    damage *= 0.8 + Math.random() * 0.4;

    // Critical hit
    if (Math.random() < attacker.stats.critChance) {
      damage *= attacker.stats.critDamage;
    }

    // Defense reduction
    if (ability.damageType === DamageType.PHYSICAL) {
      damage -= defender.stats.armor * 0.3;
    } else {
      damage -= defender.stats.magicResist * 0.3;
    }

    return Math.max(1, Math.round(damage));
  }

  static calculateTurnOrder(participants: CombatParticipant[]): string[] {
    return participants.sort((a, b) => b.stats.dexterity - a.stats.dexterity).map((p) => p.id);
  }

  static executeAction(attacker: CombatParticipant, ability: Ability, defender: CombatParticipant): CombatLog {
    const damage = this.calculateDamage(attacker, ability, defender);
    defender.stats.health = Math.max(0, defender.stats.health - damage);

    const log: CombatLog = {
      message: `${attacker.name} used ${ability.name} on ${defender.name}!`,
      damage,
    };

    if (ability.effects.length > 0) {
      const effect = ability.effects[0];
      defender.statusEffects.push({ effect, duration: 3 });
      log.statusEffect = effect;
    }

    return log;
  }
}

export class ProgressionEngine {
  static addExperience(character: Character, amount: number): number {
    character.experience += amount;
    let levelsGained = 0;

    while (character.experience >= character.experienceToNextLevel) {
      character.experience -= character.experienceToNextLevel;
      character.level += 1;
      character.skillPoints += 1;
      levelsGained += 1;

      // Increase stats on level up
      character.stats.maxHealth += 10;
      character.stats.health = character.stats.maxHealth;
      character.stats.maxMana += 5;
      character.stats.mana = character.stats.maxMana;

      // Update next level threshold
      character.experienceToNextLevel = Math.round(100 * Math.pow(1.1, character.level - 1));
    }

    return levelsGained;
  }

  static getEffectiveStats(character: Character) {
    const stats = { ...character.stats };

    // Apply equipment bonuses
    Object.values(character.equipment).forEach((item) => {
      if (item?.statBonus) {
        Object.entries(item.statBonus).forEach(([key, value]) => {
          stats[key as keyof typeof stats] += value;
        });
      }
    });

    return stats;
  }
}

export class MovementEngine {
  static movePlayer(
    currentPos: { x: number; y: number; region: string },
    newX: number,
    newY: number,
    mapWidth: number,
    mapHeight: number
  ) {
    // Check if movement is adjacent
    const distance = Math.abs(newX - currentPos.x) + Math.abs(newY - currentPos.y);
    if (distance !== 1) return null;

    // Check bounds
    if (newX < 0 || newX >= mapWidth || newY < 0 || newY >= mapHeight) return null;

    return { x: newX, y: newY, region: currentPos.region };
  }

  static getAdjacentTiles(x: number, y: number, mapWidth: number, mapHeight: number) {
    const tiles = [];
    const directions = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];

    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < mapWidth && ny >= 0 && ny < mapHeight) {
        tiles.push({ x: nx, y: ny });
      }
    }

    return tiles;
  }
}

export class EncounterSystem {
  static checkRandomEncounter(region: string, probability: number): boolean {
    return Math.random() < probability;
  }

  static selectRandomEnemies(enemies: Enemy[], count: number, playerLevel: number): Enemy[] {
    const selected: Enemy[] = [];
    const available = [...enemies];

    for (let i = 0; i < Math.min(count, available.length); i++) {
      const idx = Math.floor(Math.random() * available.length);
      selected.push(available[idx]);
      available.splice(idx, 1);
    }

    return selected;
  }

  static calculateRewards(enemies: Enemy[]) {
    const totalExp = enemies.reduce((sum, e) => sum + e.experienceReward, 0);
    const totalGold = enemies.reduce((sum, e) => sum + e.goldReward, 0);

    return {
      experience: totalExp,
      gold: totalGold,
    };
  }
}
