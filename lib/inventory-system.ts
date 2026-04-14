/**
 * Inventory management system
 */

import { Character, EquipmentSlot, Item, InventoryItem } from "./game-types";

export class InventorySystem {
  /**
   * Add item to inventory
   */
  static addItem(character: Character, item: Item, quantity: number = 1): boolean {
    // Check if item already exists in inventory
    const existing = character.inventory.find((inv) => inv.item.id === item.id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      character.inventory.push({
        item,
        quantity,
        equipped: false,
      });
    }

    return true;
  }

  /**
   * Remove item from inventory
   */
  static removeItem(character: Character, itemId: string, quantity: number = 1): boolean {
    const index = character.inventory.findIndex((inv) => inv.item.id === itemId);

    if (index === -1) {
      return false;
    }

    character.inventory[index].quantity -= quantity;

    if (character.inventory[index].quantity <= 0) {
      character.inventory.splice(index, 1);
    }

    return true;
  }

  /**
   * Get item quantity in inventory
   */
  static getItemQuantity(character: Character, itemId: string): number {
    const item = character.inventory.find((inv) => inv.item.id === itemId);
    return item?.quantity || 0;
  }

  /**
   * Equip item
   */
  static equipItem(character: Character, itemId: string): boolean {
    const invItem = character.inventory.find((inv) => inv.item.id === itemId);

    if (!invItem || !invItem.item.equipmentSlot) {
      return false;
    }

    const slot = invItem.item.equipmentSlot as EquipmentSlot;

    // Unequip previous item in slot
    const previous = character.equipment[slot];
    if (previous) {
      this.addItem(character, previous, 1);
    }

    // Equip new item
    character.equipment[slot] = invItem.item;
    invItem.quantity--;

    if (invItem.quantity <= 0) {
      this.removeItem(character, itemId, 1);
    }

    return true;
  }

  /**
   * Unequip item
   */
  static unequipItem(character: Character, slot: EquipmentSlot): boolean {
    const item = character.equipment[slot];

    if (!item) {
      return false;
    }

    character.equipment[slot] = null;
    this.addItem(character, item, 1);

    return true;
  }

  /**
   * Get total inventory weight
   */
  static getTotalWeight(character: Character): number {
    let weight = 0;

    for (const invItem of character.inventory) {
      weight += invItem.item.weight * invItem.quantity;
    }

    for (const item of Object.values(character.equipment)) {
      if (item) {
        weight += item.weight;
      }
    }

    return weight;
  }

  /**
   * Use consumable item
   */
  static useConsumable(character: Character, itemId: string): boolean {
    const invItem = character.inventory.find((inv) => inv.item.id === itemId);

    if (!invItem || invItem.item.type !== "consumable") {
      return false;
    }

    // Apply effects
    if (invItem.item.effects) {
      for (const effect of invItem.item.effects) {
        if (effect.type === "healing") {
          character.stats.health = Math.min(
            character.stats.maxHealth,
            character.stats.health + effect.value
          );
        }
      }
    }

    // Remove from inventory
    return this.removeItem(character, itemId, 1);
  }

  /**
   * Get equipped item in slot
   */
  static getEquippedItem(character: Character, slot: EquipmentSlot): Item | null {
    return character.equipment[slot] || null;
  }

  /**
   * Get all equipped items
   */
  static getAllEquippedItems(character: Character): Item[] {
    return Object.values(character.equipment).filter((item) => item !== null) as Item[];
  }

  /**
   * Sort inventory by rarity
   */
  static sortByRarity(character: Character): void {
    const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };

    character.inventory.sort((a, b) => {
      return rarityOrder[b.item.rarity] - rarityOrder[a.item.rarity];
    });
  }

  /**
   * Sort inventory by type
   */
  static sortByType(character: Character): void {
    const typeOrder = { weapon: 0, armor: 1, accessory: 2, consumable: 3, material: 4 };

    character.inventory.sort((a, b) => {
      return typeOrder[a.item.type] - typeOrder[b.item.type];
    });
  }

  /**
   * Get inventory value (total gold if sold)
   */
  static getInventoryValue(character: Character): number {
    let value = 0;

    for (const invItem of character.inventory) {
      value += invItem.item.value * invItem.quantity;
    }

    return value;
  }

  /**
   * Sell all items
   */
  static sellAllItems(character: Character): number {
    const totalValue = this.getInventoryValue(character);
    character.gold += totalValue;
    character.inventory = [];
    return totalValue;
  }
}
