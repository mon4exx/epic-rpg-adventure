import { describe, it, expect } from "vitest";
import { CombatEngine, ProgressionEngine, MovementEngine, EncounterSystem } from "./game-engine";
import { Character, CharacterClass, DamageType, CombatParticipant, Ability, AbilityType, StatusEffect, EquipmentSlot } from "./game-types";
import { abilities, enemies, characterTemplates } from "./game-database";

describe("CombatEngine", () => {
  it("should calculate damage correctly", () => {
    const attacker: CombatParticipant = {
      id: "player",
      name: "Player",
      stats: {
        health: 100,
        maxHealth: 100,
        mana: 50,
        maxMana: 50,
        strength: 10,
        intelligence: 5,
        dexterity: 5,
        constitution: 10,
        wisdom: 5,
        charisma: 5,
        armor: 5,
        magicResist: 2,
        critChance: 0.1,
        critDamage: 1.5,
      },
      abilities: [abilities.slash],
      statusEffects: [],
      isEnemy: false,
      speed: 5,
    };

    const defender: CombatParticipant = {
      id: "enemy",
      name: "Enemy",
      stats: {
        health: 50,
        maxHealth: 50,
        mana: 20,
        maxMana: 20,
        strength: 5,
        intelligence: 3,
        dexterity: 4,
        constitution: 5,
        wisdom: 3,
        charisma: 2,
        armor: 2,
        magicResist: 1,
        critChance: 0.05,
        critDamage: 1.2,
      },
      abilities: [abilities.slash],
      statusEffects: [],
      isEnemy: true,
      speed: 3,
    };

    const damage = CombatEngine.calculateDamage(attacker, abilities.slash, defender);
    expect(damage).toBeGreaterThan(0);
    expect(damage).toBeLessThan(50);
  });

  it("should calculate turn order by dexterity", () => {
    const participants: CombatParticipant[] = [
      {
        id: "slow",
        name: "Slow",
        stats: {
          health: 100,
          maxHealth: 100,
          mana: 50,
          maxMana: 50,
          strength: 10,
          intelligence: 5,
          dexterity: 2,
          constitution: 10,
          wisdom: 5,
          charisma: 5,
          armor: 5,
          magicResist: 2,
          critChance: 0.1,
          critDamage: 1.5,
        },
        abilities: [],
        statusEffects: [],
        isEnemy: false,
        speed: 2,
      },
      {
        id: "fast",
        name: "Fast",
        stats: {
          health: 100,
          maxHealth: 100,
          mana: 50,
          maxMana: 50,
          strength: 10,
          intelligence: 5,
          dexterity: 10,
          constitution: 10,
          wisdom: 5,
          charisma: 5,
          armor: 5,
          magicResist: 2,
          critChance: 0.1,
          critDamage: 1.5,
        },
        abilities: [],
        statusEffects: [],
        isEnemy: true,
        speed: 10,
      },
    ];

    const order = CombatEngine.calculateTurnOrder(participants);
    expect(order[0]).toBe("fast");
    expect(order[1]).toBe("slow");
  });
});

describe("ProgressionEngine", () => {
  it("should add experience and level up character", () => {
    const template = characterTemplates.warrior;
    const character: Character = {
      id: "test",
      name: "Test",
      class: CharacterClass.WARRIOR,
      level: 1,
      experience: 0,
      experienceToNextLevel: 100,
      gold: 0,
      skillPoints: 0,
      stats: template.stats,
      equipment: {
        [EquipmentSlot.HEAD]: null,
        [EquipmentSlot.CHEST]: null,
        [EquipmentSlot.LEGS]: null,
        [EquipmentSlot.FEET]: null,
        [EquipmentSlot.HANDS]: null,
        [EquipmentSlot.BACK]: null,
        [EquipmentSlot.MAIN_HAND]: null,
        [EquipmentSlot.OFF_HAND]: null,
        [EquipmentSlot.RING_1]: null,
        [EquipmentSlot.RING_2]: null,
      },
      inventory: [],
      skills: [],
      questLog: [],
      completedQuests: [],
      achievements: [],
    };

    const levelsGained = ProgressionEngine.addExperience(character, 100);
    expect(levelsGained).toBe(1);
    expect(character.level).toBe(2);
    expect(character.skillPoints).toBe(1);
  });

  it("should apply equipment bonuses to stats", () => {
    const template = characterTemplates.warrior;
    const character: Character = {
      id: "test",
      name: "Test",
      class: CharacterClass.WARRIOR,
      level: 1,
      experience: 0,
      experienceToNextLevel: 100,
      gold: 0,
      skillPoints: 0,
      stats: template.stats,
      equipment: {
        [EquipmentSlot.HEAD]: null,
        [EquipmentSlot.CHEST]: null,
        [EquipmentSlot.LEGS]: null,
        [EquipmentSlot.FEET]: null,
        [EquipmentSlot.HANDS]: null,
        [EquipmentSlot.BACK]: null,
        [EquipmentSlot.MAIN_HAND]: null,
        [EquipmentSlot.OFF_HAND]: null,
        [EquipmentSlot.RING_1]: null,
        [EquipmentSlot.RING_2]: null,
      },
      inventory: [],
      skills: [],
      questLog: [],
      completedQuests: [],
      achievements: [],
    };

    const baseStrength = character.stats.strength;
    character.equipment[EquipmentSlot.MAIN_HAND] = {
      id: "iron_sword",
      name: "Iron Sword",
      description: "A basic iron sword",
      icon: "🗡️",
      type: "weapon" as any,
      rarity: "common",
      value: 50,
      slot: EquipmentSlot.MAIN_HAND,
      statBonus: { strength: 3 },
    };

    const effectiveStats = ProgressionEngine.getEffectiveStats(character);
    expect(effectiveStats.strength).toBe(baseStrength + 3);
  });
});

describe("MovementEngine", () => {
  it("should allow adjacent movement", () => {
    const currentPos = { x: 5, y: 5, region: "forest" };
    const newPos = MovementEngine.movePlayer(currentPos, 5, 6, 10, 10);
    expect(newPos).not.toBeNull();
    expect(newPos?.y).toBe(6);
  });

  it("should prevent out of bounds movement", () => {
    const currentPos = { x: 0, y: 0, region: "forest" };
    const newPos = MovementEngine.movePlayer(currentPos, -1, 0, 10, 10);
    expect(newPos).toBeNull();
  });

  it("should prevent non-adjacent movement", () => {
    const currentPos = { x: 5, y: 5, region: "forest" };
    const newPos = MovementEngine.movePlayer(currentPos, 7, 5, 10, 10);
    expect(newPos).toBeNull();
  });

  it("should get adjacent tiles", () => {
    const tiles = MovementEngine.getAdjacentTiles(5, 5, 10, 10);
    expect(tiles.length).toBe(4);
    expect(tiles).toContainEqual({ x: 5, y: 6 });
    expect(tiles).toContainEqual({ x: 5, y: 4 });
    expect(tiles).toContainEqual({ x: 6, y: 5 });
    expect(tiles).toContainEqual({ x: 4, y: 5 });
  });
});

describe("EncounterSystem", () => {
  it("should check random encounter", () => {
    const result1 = EncounterSystem.checkRandomEncounter("forest", 0);
    expect(result1).toBe(false);

    const result2 = EncounterSystem.checkRandomEncounter("forest", 1);
    expect(result2).toBe(true);
  });

  it("should select random enemies", () => {
    const selectedEnemies = EncounterSystem.selectRandomEnemies(Object.values(enemies), 2, 1);
    expect(selectedEnemies.length).toBeLessThanOrEqual(2);
  });

  it("should calculate rewards", () => {
    const selectedEnemies = [enemies.goblin];
    const rewards = EncounterSystem.calculateRewards(selectedEnemies);
    expect(rewards.experience).toBe(enemies.goblin.experienceReward);
    expect(rewards.gold).toBe(enemies.goblin.goldReward);
  });
});
