/**
 * Inventory management system
 */

import { Character, EquipmentSlot, Item } from "./game-types";

export class InventorySystem {
  static addItem(character: Character, item: Item, quantity: number = 1) {
    const existing = character.inventory.find((inv) => inv.item.id === item.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      character.inventory.push({ item, quantity });
    }
  }

  static removeItem(character: Character, itemId: string, quantity: number = 1): boolean {
    const idx = character.inventory.findIndex((inv) => inv.item.id === itemId);
    if (idx === -1) return false;

    character.inventory[idx].quantity -= quantity;
    if (character.inventory[idx].quantity <= 0) {
      character.inventory.splice(idx, 1);
    }
    return true;
  }

  static equipItem(character: Character, item: Item): boolean {
    if (!item.slot) return false;

    const existing = character.equipment[item.slot];
    if (existing) {
      this.addItem(character, existing, 1);
    }

    character.equipment[item.slot] = item;
    this.removeItem(character, item.id, 1);
    return true;
  }

  static unequipItem(character: Character, slot: EquipmentSlot): boolean {
    const item = character.equipment[slot];
    if (!item) return false;

    this.addItem(character, item, 1);
    character.equipment[slot] = null;
    return true;
  }

  static getInventoryValue(character: Character): number {
    return character.inventory.reduce((sum, inv) => sum + inv.item.value * inv.quantity, 0);
  }

  static getEquipmentValue(character: Character): number {
    return Object.values(character.equipment).reduce((sum, item) => sum + (item?.value || 0), 0);
  }

  static getTotalValue(character: Character): number {
    return this.getInventoryValue(character) + this.getEquipmentValue(character) + character.gold;
  }
}
