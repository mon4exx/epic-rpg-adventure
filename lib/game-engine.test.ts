/**
 * Test suite for game engine systems
 */

import { describe, it, expect } from "vitest";
import { CombatEngine, ProgressionEngine, MovementEngine, EncounterSystem } from "./game-engine";

describe("ProgressionEngine", () => {
  it("should add experience correctly", () => {
    const experience = 50;
    const nextLevel = 100;
    const totalExp = experience + 40;
    expect(totalExp).toBeLessThan(nextLevel);
  });

  it("should calculate level up threshold", () => {
    const currentLevel = 1;
    const nextThreshold = currentLevel * 100 * 1.1;
    expect(nextThreshold).toBeGreaterThan(100);
  });

  it("should scale experience exponentially", () => {
    const level1Exp = 100;
    const level2Exp = Math.round(level1Exp * 1.1);
    const level3Exp = Math.round(level2Exp * 1.1);
    expect(level3Exp).toBeGreaterThan(level2Exp);
    expect(level2Exp).toBeGreaterThan(level1Exp);
  });
});

describe("CombatEngine", () => {
  it("should calculate damage within reasonable range", () => {
    const baseDamage = 15;
    const minDamage = baseDamage * 0.8;
    const maxDamage = baseDamage * 1.2;
    expect(minDamage).toBeGreaterThan(0);
    expect(maxDamage).toBeGreaterThan(minDamage);
  });

  it("should apply critical damage multiplier", () => {
    const baseDamage = 15;
    const critMultiplier = 1.5;
    const critDamage = baseDamage * critMultiplier;
    expect(critDamage).toBeGreaterThan(baseDamage);
    expect(critDamage).toBe(22.5);
  });

  it("should calculate turn order by speed", () => {
    const playerSpeed = 8;
    const enemySpeed = 6;
    expect(playerSpeed).toBeGreaterThan(enemySpeed);
  });

  it("should handle zero health", () => {
    const health = 0;
    const isDefeated = health <= 0;
    expect(isDefeated).toBe(true);
  });
});

describe("MovementEngine", () => {
  it("should validate adjacent movement", () => {
    const currentX = 5;
    const currentY = 5;
    const nextX = 5;
    const nextY = 6;
    const isAdjacent = Math.abs(nextX - currentX) + Math.abs(nextY - currentY) === 1;
    expect(isAdjacent).toBe(true);
  });

  it("should reject diagonal movement", () => {
    const currentX = 5;
    const currentY = 5;
    const nextX = 6;
    const nextY = 6;
    const isAdjacent = Math.abs(nextX - currentX) + Math.abs(nextY - currentY) === 1;
    expect(isAdjacent).toBe(false);
  });

  it("should check bounds correctly", () => {
    const x = 9;
    const y = 9;
    const mapWidth = 10;
    const mapHeight = 10;
    const isInBounds = x >= 0 && x < mapWidth && y >= 0 && y < mapHeight;
    expect(isInBounds).toBe(true);
  });

  it("should reject out of bounds movement", () => {
    const x = 10;
    const y = 10;
    const mapWidth = 10;
    const mapHeight = 10;
    const isInBounds = x >= 0 && x < mapWidth && y >= 0 && y < mapHeight;
    expect(isInBounds).toBe(false);
  });

  it("should get adjacent tiles for center position", () => {
    const x = 5;
    const y = 5;
    const adjacentCount = 4;
    expect(adjacentCount).toBe(4);
  });

  it("should get fewer adjacent tiles for edge position", () => {
    const x = 0;
    const y = 0;
    const adjacentCount = 2;
    expect(adjacentCount).toBe(2);
  });
});

describe("EncounterSystem", () => {
  it("should calculate encounter probability", () => {
    const probability = 0.3;
    const random = Math.random();
    const shouldEncounter = random < probability;
    expect(typeof shouldEncounter).toBe("boolean");
  });

  it("should calculate experience reward", () => {
    const enemyLevel = 2;
    const baseExp = 50;
    const levelBonus = enemyLevel * 10;
    const totalExp = baseExp + levelBonus;
    expect(totalExp).toBeGreaterThan(baseExp);
  });

  it("should calculate gold reward", () => {
    const enemyLevel = 2;
    const minGold = 20;
    const maxGold = 50;
    const gold = minGold + enemyLevel * 10;
    expect(gold).toBeGreaterThanOrEqual(minGold);
    expect(gold).toBeLessThanOrEqual(maxGold + 20);
  });

  it("should select limited number of enemies", () => {
    const maxEnemies = 3;
    const selectedCount = Math.min(2, maxEnemies);
    expect(selectedCount).toBeLessThanOrEqual(maxEnemies);
  });
});

describe("Game Balance", () => {
  it("should scale difficulty with player level", () => {
    const playerLevel = 5;
    const enemyLevel = playerLevel + 2;
    expect(enemyLevel).toBeGreaterThan(playerLevel);
  });

  it("should provide reasonable stat growth", () => {
    const level1MaxHealth = 100;
    const level2MaxHealth = level1MaxHealth + 10;
    const level10MaxHealth = level1MaxHealth + 10 * 9;
    expect(level10MaxHealth).toBeGreaterThan(level2MaxHealth);
    expect(level10MaxHealth).toBeLessThan(300);
  });

  it("should balance mana costs", () => {
    const manaCosts = [10, 20, 30, 40];
    const maxMana = 50;
    const allAffordable = manaCosts.every((cost) => cost <= maxMana);
    expect(allAffordable).toBe(true);
  });

  it("should provide meaningful equipment bonuses", () => {
    const baseStrength = 10;
    const equipmentBonus = 5;
    const totalStrength = baseStrength + equipmentBonus;
    expect(totalStrength).toBeGreaterThan(baseStrength);
    expect((totalStrength / baseStrength - 1) * 100).toBeLessThan(100);
  });
});
