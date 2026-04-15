/**
 * Core game type definitions
 */

export enum CharacterClass {
  WARRIOR = "warrior",
  MAGE = "mage",
  ROGUE = "rogue",
  PALADIN = "paladin",
}

export enum DamageType {
  PHYSICAL = "physical",
  MAGICAL = "magical",
  FIRE = "fire",
  COLD = "cold",
  LIGHTNING = "lightning",
}

export enum StatusEffect {
  POISON = "poison",
  STUN = "stun",
  BURN = "burn",
  FREEZE = "freeze",
  BLEED = "bleed",
  SHIELD = "shield",
  HASTE = "haste",
  REGENERATION = "regeneration",
}

export enum EquipmentSlot {
  HEAD = "head",
  CHEST = "chest",
  LEGS = "legs",
  FEET = "feet",
  HANDS = "hands",
  BACK = "back",
  MAIN_HAND = "main_hand",
  OFF_HAND = "off_hand",
  RING_1 = "ring_1",
  RING_2 = "ring_2",
}

export enum ItemType {
  WEAPON = "weapon",
  ARMOR = "armor",
  ACCESSORY = "accessory",
  CONSUMABLE = "consumable",
  MATERIAL = "material",
}

export enum AbilityType {
  ATTACK = "attack",
  SPELL = "spell",
  HEAL = "heal",
  BUFF = "buff",
  DEBUFF = "debuff",
  UTILITY = "utility",
}

export interface Stats {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  strength: number;
  intelligence: number;
  dexterity: number;
  constitution: number;
  wisdom: number;
  charisma: number;
  armor: number;
  magicResist: number;
  critChance: number;
  critDamage: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: ItemType;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  value: number;
  slot?: EquipmentSlot;
  statBonus?: Partial<Stats>;
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: AbilityType;
  damageType: DamageType;
  baseDamage: number;
  manaCost: number;
  cooldown: number;
  levelRequired: number;
  classRequired?: CharacterClass;
  effects: StatusEffect[];
}

export interface Character {
  id: string;
  name: string;
  class: CharacterClass;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  gold: number;
  skillPoints: number;
  stats: Stats;
  equipment: Record<EquipmentSlot, Item | null>;
  inventory: Array<{ item: Item; quantity: number }>;
  skills: Ability[];
  questLog: Quest[];
  completedQuests: string[];
  achievements: Achievement[];
}

export interface Enemy {
  id: string;
  name: string;
  level: number;
  type: string;
  stats: Stats;
  abilities: Ability[];
  loot: Array<{ item: Item; chance: number }>;
  experienceReward: number;
  goldReward: number;
  isBoss: boolean;
}

export interface CombatParticipant {
  id: string;
  name: string;
  stats: Stats;
  abilities: Ability[];
  statusEffects: Array<{ effect: StatusEffect; duration: number }>;
  isEnemy: boolean;
  speed: number;
}

export interface CombatLog {
  message: string;
  damage: number;
  healed?: number;
  critical?: boolean;
  statusEffect?: StatusEffect;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  objectives: Array<{
    id: string;
    description: string;
    target: number;
    current: number;
  }>;
  rewards: {
    experience: number;
    gold: number;
    items?: Item[];
  };
  level: number;
  completed: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface GameState {
  character: Character | null;
  currentPosition: { x: number; y: number; region: string };
  inBattle: boolean;
  currentEnemy: Enemy | null;
  combatLog: CombatLog[];
  gameTime: number;
  autoSaveTime: number;
}

export interface CharacterStats {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  strength: number;
  intelligence: number;
  dexterity: number;
  constitution: number;
  wisdom: number;
  charisma: number;
  armor: number;
  magicResist: number;
  critChance: number;
  critDamage: number;
  attackSpeed: number;
  castSpeed: number;
}
