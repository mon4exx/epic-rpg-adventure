# Epic RPG Adventure - Design Document

## Overview
A feature-rich mobile RPG game featuring character progression, turn-based combat, exploration, inventory management, quests, dungeons, crafting, and boss battles.

## Screen List

### Core Gameplay Screens
1. **Home / Main Menu** - Game start, continue, new game, settings
2. **Character Creation** - Class selection, name, appearance
3. **World Map** - Explorable regions, fast travel, quest markers
4. **Town Hub** - NPCs, shops, quest board, inn
5. **Battle Screen** - Turn-based combat with abilities, items, enemy info
6. **Dungeon Screen** - Procedural dungeon exploration with encounters
7. **Boss Battle** - Special boss fight with phases and mechanics
8. **Inventory** - Item management, equipment, consumables
9. **Character Stats** - Level, experience, skills, attributes
10. **Skill Tree** - Ability progression and specialization
11. **Quest Log** - Active quests, rewards, objectives
12. **Crafting Workshop** - Combine materials into equipment
13. **Shop** - Buy/sell items, equipment, consumables
14. **Settings** - Sound, difficulty, controls, about

## Primary Content and Functionality

### Home Screen
- Display current character info (level, HP, gold)
- "Continue Game" button
- "New Game" button
- Settings icon
- Achievements summary

### Character Creation
- Class selection (Warrior, Mage, Rogue, Paladin)
- Each class has unique starting stats and abilities
- Name input field
- Color theme selection
- Confirm and start game

### World Map
- Grid-based exploration map
- Multiple regions (Forest, Mountain, Desert, Dungeon, Boss Lair)
- NPCs and quest markers
- Random encounters on movement
- Tap to move to adjacent tiles
- Region transitions

### Town Hub
- Central safe zone
- NPC interactions (quest givers, merchants)
- Quest board showing available quests
- Inn for resting (restore HP/Mana)
- Shop entrance
- Dungeon entrance

### Battle Screen
- Enemy display with HP bar, status effects
- Player character with HP/Mana bars
- Action menu: Attack, Skills, Items, Defend, Flee
- Combat log showing actions
- Turn indicator
- Rewards screen after victory

### Inventory
- Categorized items (Equipment, Consumables, Materials)
- Equip/unequip items
- Use consumables
- Drag to organize
- Item descriptions and stats

### Character Stats
- Level and experience bar
- Health, Mana, Stamina pools
- Attributes (Strength, Intelligence, Dexterity, Constitution)
- Resistances and bonuses
- Current equipment display

### Skill Tree
- Class-specific abilities
- Unlock requirements (level, points)
- Ability descriptions with cooldowns
- Skill points allocation
- Passive and active abilities

### Quest Log
- List of active quests
- Quest objectives and progress
- Rewards preview
- Quest completion tracking
- Completed quests history

### Crafting Workshop
- Recipe list with requirements
- Material inventory display
- Craft button with confirmation
- Success/failure feedback
- Crafted item preview

### Shop
- Buy items: weapons, armor, consumables
- Sell items from inventory
- Item descriptions and prices
- Gold display and transaction history

## Key User Flows

### New Game Flow
1. Tap "New Game"
2. Select class (Warrior/Mage/Rogue/Paladin)
3. Enter character name
4. Confirm and start
5. Tutorial message
6. Enter first town

### Exploration & Combat Flow
1. View world map
2. Tap adjacent tile to move
3. Random encounter triggers (30% chance per move)
4. Battle screen appears
5. Select action (Attack/Skill/Item/Defend/Flee)
6. Enemy takes turn
7. Repeat until victory or defeat
8. Gain experience and loot
9. Return to map

### Leveling & Progression
1. Defeat enemies to gain experience
2. Reach experience threshold → Level up
3. Gain skill points
4. Allocate points in Skill Tree
5. Unlock new abilities
6. Equip better gear from shops/dungeons

### Dungeon Exploration
1. Enter dungeon from town or map
2. Navigate procedural rooms
3. Encounter enemies and treasures
4. Boss at end of dungeon
5. Collect rewards
6. Exit dungeon

### Quest Completion
1. Accept quest from board
2. Follow objectives (defeat X enemies, collect items, reach location)
3. Return to quest giver
4. Receive rewards (gold, experience, items)
5. Unlock new quests

## Color Choices

- **Primary Brand**: Deep Blue (#0a7ea4) - Trust, adventure
- **Background**: White (#ffffff) light / Dark Gray (#151718) dark
- **Surface**: Light Gray (#f5f5f5) light / Charcoal (#1e2022) dark
- **Accent**: Emerald Green (#22C55E) - Success, progression
- **Warning**: Amber (#F59E0B) - Caution, special items
- **Danger**: Red (#EF4444) - Enemy, damage, error
- **Text Primary**: Dark (#11181C) light / Light (#ECEDEE) dark
- **Text Secondary**: Gray (#687076) light / Light Gray (#9BA1A6) dark

## Game Mechanics Summary

### Character Classes
- **Warrior**: High HP, strong physical attacks, shield abilities
- **Mage**: High Mana, powerful spells, elemental damage
- **Rogue**: High agility, critical strikes, stealth abilities
- **Paladin**: Balanced stats, healing, protection spells

### Combat System
- Turn-based with speed stat determining turn order
- Action points per turn
- Abilities with cooldowns
- Status effects (poison, stun, burn, freeze)
- Damage calculation based on stats

### Progression
- Experience-based leveling
- Skill points for ability unlocks
- Equipment upgrades
- Stat growth per level
- Prestige system (optional)

### Economy
- Gold currency from battles
- Shop for buying/selling
- Crafting costs materials
- Quest rewards

### Content
- 50+ enemies with variations
- 30+ equipment pieces
- 20+ consumable items
- 15+ craftable recipes
- 10+ quests
- 3+ dungeons
- 3+ boss battles
