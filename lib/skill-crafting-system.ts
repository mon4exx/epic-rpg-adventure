/**
 * Skill tree and crafting systems
 */

import { Character, Ability, Item } from "./game-types";

export interface Recipe {
  id: string;
  name: string;
  level: number;
  materials: Array<{ itemId: string; quantity: number }>;
  resultItem: Item;
}

export class SkillSystem {
  static unlockAbility(character: Character, ability: Ability): boolean {
    if (character.skillPoints < 1 || character.level < ability.levelRequired) {
      return false;
    }

    if (ability.classRequired && ability.classRequired !== character.class) {
      return false;
    }

    if (!character.skills.find((s) => s.id === ability.id)) {
      character.skills.push(ability);
      character.skillPoints -= 1;
      return true;
    }

    return false;
  }

  static getAvailableAbilities(character: Character, allAbilities: Record<string, Ability>) {
    return Object.values(allAbilities).filter(
      (ability) => ability.levelRequired <= character.level && (!ability.classRequired || ability.classRequired === character.class)
    );
  }
}

export class CraftingSystem {
  static getAvailableRecipes(character: Character, recipes: Record<string, Recipe>) {
    return Object.values(recipes).filter((recipe) => recipe.level <= character.level);
  }

  static getCraftableRecipes(character: Character, recipes: Record<string, Recipe>) {
    return this.getAvailableRecipes(character, recipes).filter((recipe) => {
      return recipe.materials.every((material) => {
        const item = character.inventory.find((inv) => inv.item.id === material.itemId);
        return item && item.quantity >= material.quantity;
      });
    });
  }

  static craft(character: Character, recipe: Recipe): boolean {
    const canCraft = recipe.materials.every((material) => {
      const item = character.inventory.find((inv) => inv.item.id === material.itemId);
      return item && item.quantity >= material.quantity;
    });

    if (!canCraft) return false;

    recipe.materials.forEach((material) => {
      const idx = character.inventory.findIndex((inv) => inv.item.id === material.itemId);
      if (idx !== -1) {
        character.inventory[idx].quantity -= material.quantity;
        if (character.inventory[idx].quantity <= 0) {
          character.inventory.splice(idx, 1);
        }
      }
    });

    character.inventory.push({ item: recipe.resultItem, quantity: 1 });
    return true;
  }
}
