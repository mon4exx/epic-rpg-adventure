/**
 * Comprehensive type definitions for the Epic RPG Adventure game
 * Covers all game entities, mechanics, and state management
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum CharacterClass {
  WARRIOR = "warrior",
  MAGE = "mage",
  ROGUE = "rogue",
  PALADIN = "paladin",
}

export enum ItemType {
  WEAPON = "weapon",
  ARMOR = "armor",
  ACCESSORY = "accessory",
  CONSUMABLE = "consumable",
  MATERIAL = "material",
}

export enum EquipmentSlot {
  HEAD = "head",
  CHEST = "chest",
  LEGS = "legs",
  FEET = "feet",
  HANDS = "hands",
  MAIN_HAND = "main_hand",
  OFF_HAND = "off_hand",
  RING_1 = "ring_1",
  RING_2 = "ring_2",
  AMULET = "amulet",
}

export enum StatusEffect {
  POISON = "poison",
  STUN = "stun",
  BURN = "burn",
  FREEZE = "freeze",
  BLEED = "bleed",
  WEAKNESS = "weakness",
  SHIELD = "shield",
  HASTE = "haste",
  REGENERATION = "regeneration",
}

export enum AbilityType {
  PHYSICAL = "physical",
  MAGICAL = "magical",
  HEALING = "healing",
  BUFF = "buff",
  DEBUFF = "debuff",
  UTILITY = "utility",
}

export enum DamageType {
  PHYSICAL = "physical",
  FIRE = "fire",
  ICE = "ice",
  LIGHTNING = "lightning",
  HOLY = "holy",
  DARK = "dark",
}

export enum QuestStatus {
  AVAILABLE = "available",
  ACTIVE = "active",
  COMPLETED = "completed",
  FAILED = "failed",
}

export enum QuestObjectiveType {
  DEFEAT_ENEMIES = "defeat_enemies",
  COLLECT_ITEMS = "collect_items",
  REACH_LOCATION = "reach_location",
  TALK_TO_NPC = "talk_to_npc",
}

export enum RegionType {
  TOWN = "town",
  FOREST = "forest",
  MOUNTAIN = "mountain",
  DESERT = "desert",
  DUNGEON = "dungeon",
  BOSS_LAIR = "boss_lair",
}

export enum AchievementType {
  LEVEL_MILESTONE = "level_milestone",
  COMBAT_VICTORY = "combat_victory",
  BOSS_DEFEATED = "boss_defeated",
  QUEST_COMPLETED = "quest_completed",
  ITEM_CRAFTED = "item_crafted",
  GOLD_EARNED = "gold_earned",
  SKILL_UNLOCKED = "skill_unlocked",
}

// ============================================================================
// CHARACTER & STATS
// ============================================================================

export interface CharacterStats {
  maxHealth: number;
  health: number;
  maxMana: number;
  mana: number;
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

export interface Character {
  id: string;
  name: string;
  class: CharacterClass;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  stats: CharacterStats;
  skills: Skill[];
  skillPoints: number;
  equipment: Record<EquipmentSlot, Item | null>;
  inventory: InventoryItem[];
  gold: number;
  statusEffects: StatusEffectInstance[];
  questLog: Quest[];
  completedQuests: string[];
  achievements: Achievement[];
  createdAt: number;
  lastSaved: number;
}

export interface ClassTemplate {
  class: CharacterClass;
  baseStats: CharacterStats;
  startingAbilities: string[];
  description: string;
  color: string;
}

// ============================================================================
// ITEMS & EQUIPMENT
// ============================================================================

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  icon: string;
  value: number; // Sell price
  weight: number;
  equipmentSlot?: EquipmentSlot;
  stats?: Partial<CharacterStats>;
  effects?: ItemEffect[];
  craftingRecipeId?: string;
}

export interface ItemEffect {
  type: "stat_boost" | "healing" | "damage" | "status_effect";
  value: number;
  duration?: number;
  statusEffect?: StatusEffect;
}

export interface InventoryItem {
  item: Item;
  quantity: number;
  equipped: boolean;
}

export interface CraftingRecipe {
  id: string;
  name: string;
  resultItem: Item;
  materials: Array<{ itemId: string; quantity: number }>;
  level: number;
  experience: number;
}

// ============================================================================
// ABILITIES & SKILLS
// ============================================================================

export interface Ability {
  id: string;
  name: string;
  description: string;
  type: AbilityType;
  damageType: DamageType;
  baseDamage: number;
  manaCost: number;
  cooldown: number;
  range: number;
  targetCount: number; // 1 for single, -1 for all
  statusEffects?: Array<{ effect: StatusEffect; chance: number; duration: number }>;
  scalingStats: Array<{ stat: keyof CharacterStats; multiplier: number }>;
  icon: string;
  animation: string;
  sound: string;
  levelRequired: number;
  classRequired?: CharacterClass;
}

export interface Skill {
  ability: Ability;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  currentCooldown: number;
}

export interface SkillTreeNode {
  abilityId: string;
  level: number;
  requiredLevel: number;
  requiredPoints: number;
  prerequisites: string[];
  position: { x: number; y: number };
}

// ============================================================================
// COMBAT SYSTEM
// ============================================================================

export interface CombatParticipant {
  id: string;
  name: string;
  stats: CharacterStats;
  abilities: Ability[];
  statusEffects: StatusEffectInstance[];
  isEnemy: boolean;
  speed: number; // For turn order
}

export interface CombatAction {
  actorId: string;
  type: "attack" | "ability" | "item" | "defend" | "flee";
  targetId?: string;
  abilityId?: string;
  itemId?: string;
  timestamp: number;
}

export interface CombatLog {
  action: CombatAction;
  damage?: number;
  healing?: number;
  statusEffects?: StatusEffect[];
  critical: boolean;
  dodged: boolean;
  message: string;
}

export interface BattleState {
  id: string;
  player: CombatParticipant;
  enemies: CombatParticipant[];
  currentTurn: number;
  turnOrder: string[]; // IDs in order
  currentActorIndex: number;
  combatLog: CombatLog[];
  isPlayerTurn: boolean;
  battleOver: boolean;
  playerWon: boolean;
  rewards: BattleRewards;
}

export interface BattleRewards {
  experience: number;
  gold: number;
  items: Item[];
}

export interface StatusEffectInstance {
  effect: StatusEffect;
  duration: number;
  stacks: number;
  source: string; // Ability or item that caused it
}

// ============================================================================
// ENEMIES
// ============================================================================

export interface Enemy {
  id: string;
  name: string;
  type: string;
  level: number;
  stats: CharacterStats;
  abilities: Ability[];
  loot: Array<{ item: Item; chance: number; quantity: number }>;
  experienceReward: number;
  goldReward: number;
  icon: string;
  description: string;
  isBoss: boolean;
  bossPhasesHealth?: number[]; // Health thresholds for phase changes
}

export interface EnemyAIBehavior {
  enemyId: string;
  aggressionLevel: number; // 0-1, higher = more aggressive
  preferredAbilities: string[]; // Ability IDs in preference order
  fleeThreshold: number; // Health % to attempt flee
  targetingStrategy: "random" | "weakest" | "strongest" | "healer";
}

// ============================================================================
// WORLD & EXPLORATION
// ============================================================================

export interface MapTile {
  x: number;
  y: number;
  region: RegionType;
  terrain: "grass" | "water" | "mountain" | "sand" | "cave";
  passable: boolean;
  encounters: string[]; // Enemy IDs
  npcs: string[]; // NPC IDs
  questMarkers: string[]; // Quest IDs
  loot?: Item[];
  description: string;
}

export interface GameMap {
  width: number;
  height: number;
  tiles: MapTile[][];
  regions: Region[];
}

export interface Region {
  id: string;
  name: string;
  type: RegionType;
  bounds: { x1: number; y1: number; x2: number; y2: number };
  description: string;
  enemies: string[]; // Enemy IDs that spawn here
  npcs: string[]; // NPC IDs
  quests: string[]; // Quest IDs available here
  icon: string;
}

export interface PlayerPosition {
  x: number;
  y: number;
  region: string;
}

// ============================================================================
// QUESTS
// ============================================================================

export interface Quest {
  id: string;
  title: string;
  description: string;
  giver: string; // NPC ID
  status: QuestStatus;
  level: number;
  objectives: QuestObjective[];
  rewards: {
    experience: number;
    gold: number;
    items: Item[];
  };
  startedAt?: number;
  completedAt?: number;
  icon: string;
}

export interface QuestObjective {
  id: string;
  type: QuestObjectiveType;
  description: string;
  target: string; // Enemy ID, item ID, location, or NPC ID
  progress: number;
  required: number;
  completed: boolean;
}

// ============================================================================
// NPCS
// ============================================================================

export interface NPC {
  id: string;
  name: string;
  role: "quest_giver" | "merchant" | "blacksmith" | "healer" | "innkeeper";
  position: PlayerPosition;
  icon: string;
  dialogue: DialogueNode[];
  quests: string[]; // Quest IDs they offer
  shop?: Shop;
  services?: string[]; // "heal", "rest", "craft"
}

export interface DialogueNode {
  id: string;
  text: string;
  responses: DialogueResponse[];
  nextNodeId?: string;
}

export interface DialogueResponse {
  text: string;
  nextNodeId?: string;
  action?: "start_quest" | "complete_quest" | "open_shop";
}

export interface Shop {
  id: string;
  name: string;
  items: Array<{ item: Item; stock: number; price: number }>;
  buyback: boolean;
  restockInterval: number;
}

// ============================================================================
// DUNGEONS
// ============================================================================

export interface Dungeon {
  id: string;
  name: string;
  level: number;
  floors: DungeonFloor[];
  boss: Enemy;
  rewards: BattleRewards;
  description: string;
  icon: string;
}

export interface DungeonFloor {
  id: string;
  dungeonId: string;
  floorNumber: number;
  rooms: DungeonRoom[];
  currentRoomId?: string;
}

export interface DungeonRoom {
  id: string;
  floorId: string;
  type: "empty" | "combat" | "treasure" | "boss" | "trap";
  enemies?: Enemy[];
  treasure?: Item[];
  trap?: Trap;
  connections: string[]; // Adjacent room IDs
  visited: boolean;
  cleared: boolean;
}

export interface Trap {
  id: string;
  name: string;
  damage: number;
  dodgeChance: number;
  statusEffect?: StatusEffect;
}

// ============================================================================
// ACHIEVEMENTS
// ============================================================================

export interface Achievement {
  id: string;
  name: string;
  description: string;
  type: AchievementType;
  icon: string;
  unlockedAt?: number;
  progress: number;
  requirement: number;
  reward: {
    gold: number;
    experience: number;
  };
}

// ============================================================================
// GAME STATE
// ============================================================================

export interface GameState {
  character: Character;
  position: PlayerPosition;
  currentBattle?: BattleState;
  currentDungeon?: { dungeonId: string; floorId: string; roomId: string };
  gameTime: number;
  isPaused: boolean;
  difficulty: "easy" | "normal" | "hard" | "nightmare";
  settings: GameSettings;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  vibrationEnabled: boolean;
  autoSave: boolean;
  difficulty: "easy" | "normal" | "hard" | "nightmare";
  language: string;
}

// ============================================================================
// GAME DATABASE
// ============================================================================

export interface GameDatabase {
  characters: Record<string, Character>;
  enemies: Record<string, Enemy>;
  items: Record<string, Item>;
  abilities: Record<string, Ability>;
  quests: Record<string, Quest>;
  npcs: Record<string, NPC>;
  dungeons: Record<string, Dungeon>;
  recipes: Record<string, CraftingRecipe>;
  achievements: Record<string, Achievement>;
  classTemplates: Record<CharacterClass, ClassTemplate>;
  map: GameMap;
}
