/**
 * Skill tree and crafting systems
 */

import { Character, Skill, Ability, CraftingRecipe, Item } from "./game-types";

export class SkillTreeSystem {
  /**
   * Unlock an ability
   */
  static unlockAbility(character: Character, ability: Ability): boolean {
    // Check if already unlocked
    if (character.skills.find((s) => s.ability.id === ability.id)) {
      return false;
    }

    // Check level requirement
    if (character.level < ability.levelRequired) {
      return false;
    }

    // Check class requirement
    if (ability.classRequired && ability.classRequired !== character.class) {
      return false;
    }

    // Check skill points
    if (character.skillPoints < 1) {
      return false;
    }

    const skill: Skill = {
      ability,
      level: 1,
      experience: 0,
      experienceToNextLevel: 100,
      currentCooldown: 0,
    };

    character.skills.push(skill);
    character.skillPoints--;

    return true;
  }

  /**
   * Upgrade a skill
   */
  static upgradeSkill(character: Character, abilityId: string): boolean {
    const skill = character.skills.find((s) => s.ability.id === abilityId);

    if (!skill) {
      return false;
    }

    if (character.skillPoints < 1) {
      return false;
    }

    skill.level++;
    skill.experience = 0;
    skill.experienceToNextLevel = Math.round(skill.experienceToNextLevel * 1.1);
    character.skillPoints--;

    return true;
  }

  /**
   * Add experience to skill
   */
  static addSkillExperience(character: Character, abilityId: string, amount: number): void {
    const skill = character.skills.find((s) => s.ability.id === abilityId);

    if (!skill) {
      return;
    }

    skill.experience += amount;

    while (skill.experience >= skill.experienceToNextLevel) {
      skill.experience -= skill.experienceToNextLevel;
      skill.level++;
      skill.experienceToNextLevel = Math.round(skill.experienceToNextLevel * 1.1);
    }
  }

  /**
   * Update ability cooldown
   */
  static updateCooldowns(character: Character, deltaTime: number = 1): void {
    for (const skill of character.skills) {
      if (skill.currentCooldown > 0) {
        skill.currentCooldown = Math.max(0, skill.currentCooldown - deltaTime);
      }
    }
  }

  /**
   * Check if ability is ready to use
   */
  static isAbilityReady(character: Character, abilityId: string): boolean {
    const skill = character.skills.find((s) => s.ability.id === abilityId);

    if (!skill) {
      return false;
    }

    return skill.currentCooldown <= 0;
  }

  /**
   * Use ability and set cooldown
   */
  static useAbility(character: Character, abilityId: string): boolean {
    const skill = character.skills.find((s) => s.ability.id === abilityId);

    if (!skill || !this.isAbilityReady(character, abilityId)) {
      return false;
    }

    // Check mana
    if (character.stats.mana < skill.ability.manaCost) {
      return false;
    }

    // Consume mana
    character.stats.mana -= skill.ability.manaCost;

    // Set cooldown
    skill.currentCooldown = skill.ability.cooldown;

    return true;
  }

  /**
   * Get all unlocked abilities
   */
  static getUnlockedAbilities(character: Character): Ability[] {
    return character.skills.map((s) => s.ability);
  }

  /**
   * Get available abilities to unlock
   */
  static getAvailableAbilities(character: Character, allAbilities: Record<string, Ability>): Ability[] {
    const unlockedIds = new Set(character.skills.map((s) => s.ability.id));

    return Object.values(allAbilities).filter(
      (ability) =>
        !unlockedIds.has(ability.id) &&
        character.level >= ability.levelRequired &&
        (!ability.classRequired || ability.classRequired === character.class)
    );
  }
}

export class CraftingSystem {
  /**
   * Check if recipe can be crafted
   */
  static canCraft(character: Character, recipe: CraftingRecipe): boolean {
    // Check level requirement
    if (character.level < recipe.level) {
      return false;
    }

    // Check materials
    for (const material of recipe.materials) {
      const quantity = character.inventory.find((inv) => inv.item.id === material.itemId)
        ?.quantity || 0;

      if (quantity < material.quantity) {
        return false;
      }
    }

    return true;
  }

  /**
   * Craft an item
   */
  static craft(character: Character, recipe: CraftingRecipe): boolean {
    if (!this.canCraft(character, recipe)) {
      return false;
    }

    // Consume materials
    for (const material of recipe.materials) {
      const index = character.inventory.findIndex((inv) => inv.item.id === material.itemId);

      if (index !== -1) {
        character.inventory[index].quantity -= material.quantity;

        if (character.inventory[index].quantity <= 0) {
          character.inventory.splice(index, 1);
        }
      }
    }

    // Add crafted item
    const existing = character.inventory.find((inv) => inv.item.id === recipe.resultItem.id);

    if (existing) {
      existing.quantity++;
    } else {
      character.inventory.push({
        item: recipe.resultItem,
        quantity: 1,
        equipped: false,
      });
    }

    // Add experience
    character.experience += recipe.experience;

    return true;
  }

  /**
   * Get available recipes
   */
  static getAvailableRecipes(character: Character, allRecipes: Record<string, CraftingRecipe>): CraftingRecipe[] {
    return Object.values(allRecipes).filter((recipe) => character.level >= recipe.level);
  }

  /**
   * Get craftable recipes
   */
  static getCraftableRecipes(character: Character, allRecipes: Record<string, CraftingRecipe>): CraftingRecipe[] {
    return this.getAvailableRecipes(character, allRecipes).filter((recipe) =>
      this.canCraft(character, recipe)
    );
  }
}
