/**
 * Core game engine - handles combat, movement, state management
 */

import {
  Ability,
  BattleRewards,
  BattleState,
  Character,
  CharacterStats,
  CombatAction,
  CombatLog,
  CombatParticipant,
  DamageType,
  Enemy,
  GameState,
  PlayerPosition,
  StatusEffect,
  StatusEffectInstance,
} from "./game-types";

// ============================================================================
// COMBAT ENGINE
// ============================================================================

export class CombatEngine {
  /**
   * Calculate damage with all modifiers (stats, abilities, critical strikes)
   */
  static calculateDamage(
    attacker: CombatParticipant,
    ability: Ability,
    defender: CombatParticipant,
    isCritical: boolean = false
  ): number {
    let baseDamage = ability.baseDamage;

    // Apply stat scaling
    for (const scaling of ability.scalingStats) {
      const statValue = attacker.stats[scaling.stat] || 0;
      baseDamage += statValue * scaling.multiplier;
    }

    // Apply critical multiplier
    if (isCritical) {
      baseDamage *= attacker.stats.critDamage;
    }

    // Apply armor/resistance
    let damageReduction = 0;
    if (ability.damageType === DamageType.PHYSICAL) {
      damageReduction = defender.stats.armor * 0.5; // 50% of armor value
    } else {
      damageReduction = defender.stats.magicResist * 0.5;
    }

    const finalDamage = Math.max(1, baseDamage - damageReduction);
    return Math.round(finalDamage);
  }

  /**
   * Check if attack hits (not dodged)
   */
  static checkHit(attacker: CombatParticipant, defender: CombatParticipant): boolean {
    // Base hit chance 85%, modified by dexterity
    const baseHitChance = 0.85;
    const dexterityModifier = (defender.stats.dexterity - attacker.stats.dexterity) * 0.01;
    const hitChance = Math.max(0.3, Math.min(0.95, baseHitChance - dexterityModifier));
    return Math.random() < hitChance;
  }

  /**
   * Check if attack is critical
   */
  static checkCritical(attacker: CombatParticipant): boolean {
    return Math.random() < attacker.stats.critChance;
  }

  /**
   * Apply status effects from ability
   */
  static applyStatusEffects(
    target: CombatParticipant,
    ability: Ability,
    source: string
  ): StatusEffect[] {
    const appliedEffects: StatusEffect[] = [];

    if (!ability.statusEffects) return appliedEffects;

    for (const effectData of ability.statusEffects) {
      if (Math.random() < effectData.chance) {
        const existing = target.statusEffects.find((e) => e.effect === effectData.effect);

        if (existing) {
          existing.stacks = Math.min(existing.stacks + 1, 5);
          existing.duration = Math.max(existing.duration, effectData.duration);
        } else {
          target.statusEffects.push({
            effect: effectData.effect,
            duration: effectData.duration,
            stacks: 1,
            source,
          });
        }

        appliedEffects.push(effectData.effect);
      }
    }

    return appliedEffects;
  }

  /**
   * Execute a combat action and return log entry
   */
  static executeAction(
    actor: CombatParticipant,
    ability: Ability,
    target: CombatParticipant
  ): CombatLog {
    const log: CombatLog = {
      action: {
        actorId: actor.id,
        type: "ability",
        targetId: target.id,
        abilityId: ability.id,
        timestamp: Date.now(),
      },
      critical: false,
      dodged: false,
      message: "",
    };

    // Check if attack hits
    if (!this.checkHit(actor, target)) {
      log.dodged = true;
      log.message = `${target.name} dodged ${actor.name}'s ${ability.name}!`;
      return log;
    }

    // Check critical
    log.critical = this.checkCritical(actor);

    // Calculate damage
    const damage = this.calculateDamage(actor, ability, target, log.critical);
    log.damage = damage;

    // Apply damage
    target.stats.health = Math.max(0, target.stats.health - damage);

    // Apply status effects
    const appliedEffects = this.applyStatusEffects(target, ability, actor.id);
    log.statusEffects = appliedEffects;

    // Build message
    const critText = log.critical ? " (CRITICAL)" : "";
    log.message = `${actor.name} used ${ability.name} on ${target.name} for ${damage} damage${critText}!`;

    if (appliedEffects.length > 0) {
      log.message += ` ${target.name} is now ${appliedEffects.join(", ")}!`;
    }

    return log;
  }

  /**
   * Update status effects (reduce duration, apply damage)
   */
  static updateStatusEffects(participant: CombatParticipant): void {
    for (let i = participant.statusEffects.length - 1; i >= 0; i--) {
      const effect = participant.statusEffects[i];
      effect.duration--;

      // Apply damage from status effects
      if (effect.effect === StatusEffect.POISON) {
        participant.stats.health = Math.max(0, participant.stats.health - 5 * effect.stacks);
      } else if (effect.effect === StatusEffect.BURN) {
        participant.stats.health = Math.max(0, participant.stats.health - 8 * effect.stacks);
      } else if (effect.effect === StatusEffect.REGENERATION) {
        participant.stats.health = Math.min(
          participant.stats.maxHealth,
          participant.stats.health + 10 * effect.stacks
        );
      }

      if (effect.duration <= 0) {
        participant.statusEffects.splice(i, 1);
      }
    }
  }

  /**
   * Determine turn order based on speed stat
   */
  static calculateTurnOrder(participants: CombatParticipant[]): string[] {
    return participants
      .sort((a, b) => b.speed - a.speed)
      .map((p) => p.id);
  }

  /**
   * Select best ability for AI
   */
  static selectAIAbility(
    actor: CombatParticipant,
    targets: CombatParticipant[]
  ): { ability: Ability; target: CombatParticipant } {
    // Filter available abilities (with mana)
    const available = actor.abilities.filter((a) => actor.stats.mana >= a.manaCost);

    if (available.length === 0) {
      // Use basic attack if no abilities available
      return {
        ability: actor.abilities[0] || ({} as Ability),
        target: targets[0],
      };
    }

    // Prefer high damage abilities
    const best = available.reduce((prev, curr) => {
      return curr.baseDamage > prev.baseDamage ? curr : prev;
    });

    return {
      ability: best,
      target: targets[Math.floor(Math.random() * targets.length)],
    };
  }
}

// ============================================================================
// MOVEMENT & WORLD ENGINE
// ============================================================================

export class MovementEngine {
  /**
   * Check if a position is valid and passable
   */
  static isPassable(x: number, y: number, mapWidth: number, mapHeight: number): boolean {
    return x >= 0 && x < mapWidth && y >= 0 && y < mapHeight;
  }

  /**
   * Get adjacent tiles (4-directional)
   */
  static getAdjacentTiles(
    x: number,
    y: number,
    mapWidth: number,
    mapHeight: number
  ): Array<{ x: number; y: number }> {
    const adjacent = [
      { x: x - 1, y },
      { x: x + 1, y },
      { x, y: y - 1 },
      { x, y: y + 1 },
    ];

    return adjacent.filter((tile) => this.isPassable(tile.x, tile.y, mapWidth, mapHeight));
  }

  /**
   * Calculate distance between two points
   */
  static calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2); // Manhattan distance
  }

  /**
   * Move player to adjacent tile
   */
  static movePlayer(
    currentPos: PlayerPosition,
    targetX: number,
    targetY: number,
    mapWidth: number,
    mapHeight: number
  ): PlayerPosition | null {
    // Check if target is adjacent
    const distance = this.calculateDistance(currentPos.x, currentPos.y, targetX, targetY);
    if (distance !== 1) {
      return null; // Not adjacent
    }

    // Check if passable
    if (!this.isPassable(targetX, targetY, mapWidth, mapHeight)) {
      return null;
    }

    return {
      x: targetX,
      y: targetY,
      region: currentPos.region,
    };
  }
}

// ============================================================================
// PROGRESSION ENGINE
// ============================================================================

export class ProgressionEngine {
  /**
   * Calculate experience needed for next level
   */
  static getExperienceForLevel(level: number): number {
    return Math.round(100 * Math.pow(1.1, level - 1));
  }

  /**
   * Add experience and handle leveling
   */
  static addExperience(character: Character, amount: number): number {
    character.experience += amount;
    let levelsGained = 0;

    while (character.experience >= character.experienceToNextLevel) {
      character.experience -= character.experienceToNextLevel;
      character.level++;
      levelsGained++;

      // Increase stats on level up
      this.increaseStats(character);

      // Add skill points
      character.skillPoints += 1;

      // Calculate new experience requirement
      character.experienceToNextLevel = this.getExperienceForLevel(character.level);
    }

    return levelsGained;
  }

  /**
   * Increase character stats on level up
   */
  static increaseStats(character: Character): void {
    const statIncrease = {
      maxHealth: 10,
      maxMana: 5,
      strength: 1,
      intelligence: 1,
      dexterity: 1,
      constitution: 1,
      wisdom: 1,
      charisma: 1,
      armor: 0.5,
      magicResist: 0.5,
    };

    character.stats.maxHealth += statIncrease.maxHealth;
    character.stats.health = character.stats.maxHealth;
    character.stats.maxMana += statIncrease.maxMana;
    character.stats.mana = character.stats.maxMana;
    character.stats.strength += statIncrease.strength;
    character.stats.intelligence += statIncrease.intelligence;
    character.stats.dexterity += statIncrease.dexterity;
    character.stats.constitution += statIncrease.constitution;
    character.stats.wisdom += statIncrease.wisdom;
    character.stats.charisma += statIncrease.charisma;
    character.stats.armor += statIncrease.armor;
    character.stats.magicResist += statIncrease.magicResist;
  }

  /**
   * Calculate total stat modifiers from equipment
   */
  static calculateEquipmentBonus(character: Character): Partial<CharacterStats> {
    const bonus: Partial<CharacterStats> = {};

    for (const item of Object.values(character.equipment)) {
      if (item?.stats) {
        for (const stat in item.stats) {
          const key = stat as keyof CharacterStats;
          bonus[key] = (bonus[key] || 0) + (item.stats[key] || 0);
        }
      }
    }

    return bonus;
  }

  /**
   * Get effective stats (base + equipment bonus)
   */
  static getEffectiveStats(character: Character): CharacterStats {
    const bonus = this.calculateEquipmentBonus(character);
    const effective = { ...character.stats };

    for (const stat in bonus) {
      const key = stat as keyof CharacterStats;
      effective[key] = (effective[key] || 0) + (bonus[key] || 0);
    }

    return effective;
  }
}

// ============================================================================
// GAME STATE MANAGER
// ============================================================================

export class GameStateManager {
  /**
   * Create new game state
   */
  static createNewGameState(character: Character): GameState {
    return {
      character,
      position: { x: 5, y: 5, region: "town" },
      gameTime: 0,
      isPaused: false,
      difficulty: "normal",
      settings: {
        soundEnabled: true,
        musicVolume: 0.7,
        sfxVolume: 0.8,
        vibrationEnabled: true,
        autoSave: true,
        difficulty: "normal",
        language: "en",
      },
    };
  }

  /**
   * Save game state to storage
   */
  static serializeGameState(gameState: GameState): string {
    return JSON.stringify(gameState);
  }

  /**
   * Load game state from storage
   */
  static deserializeGameState(data: string): GameState {
    return JSON.parse(data);
  }

  /**
   * Update game time
   */
  static updateGameTime(gameState: GameState, deltaTime: number): void {
    gameState.gameTime += deltaTime;
  }

  /**
   * Pause/unpause game
   */
  static togglePause(gameState: GameState): void {
    gameState.isPaused = !gameState.isPaused;
  }
}

// ============================================================================
// ENCOUNTER SYSTEM
// ============================================================================

export class EncounterSystem {
  /**
   * Calculate random encounter chance
   */
  static checkRandomEncounter(
    region: string,
    encounterRate: number = 0.3
  ): boolean {
    return Math.random() < encounterRate;
  }

  /**
   * Select random enemies for encounter
   */
  static selectRandomEnemies(
    availableEnemies: Enemy[],
    playerLevel: number,
    count: number = 1
  ): Enemy[] {
    // Filter enemies close to player level (within 2 levels)
    const validEnemies = availableEnemies.filter(
      (e) => Math.abs(e.level - playerLevel) <= 2
    );

    if (validEnemies.length === 0) {
      return availableEnemies.slice(0, count);
    }

    const selected: Enemy[] = [];
    for (let i = 0; i < count; i++) {
      const enemy = validEnemies[Math.floor(Math.random() * validEnemies.length)];
      selected.push({ ...enemy }); // Create copy to avoid modifying original
    }

    return selected;
  }

  /**
   * Calculate battle rewards
   */
  static calculateRewards(enemies: Enemy[]): BattleRewards {
    let totalExp = 0;
    let totalGold = 0;
    const items: any[] = [];

    for (const enemy of enemies) {
      totalExp += enemy.experienceReward;
      totalGold += enemy.goldReward;

      // Roll for loot
      for (const lootEntry of enemy.loot) {
        if (Math.random() < lootEntry.chance) {
          items.push(...Array(lootEntry.quantity).fill(lootEntry.item));
        }
      }
    }

    return {
      experience: totalExp,
      gold: totalGold,
      items,
    };
  }
}
