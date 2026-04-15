/**
 * Game context and hooks for state management
 */

import React, { createContext, useContext, useReducer, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Character, CharacterClass, GameState, EquipmentSlot } from "./game-types";
import { characterTemplates } from "./game-database";

interface GameContextType {
  gameState: GameState;
  character: Character | null;
  updateCharacter: (character: Character) => void;
  startNewGame: (name: string, classType: CharacterClass) => void;
  saveGame: () => Promise<void>;
  loadGame: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);

  useEffect(() => {
    loadGame();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      saveGame();
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(interval);
  }, [gameState]);

  const startNewGame = (name: string, classType: CharacterClass) => {
    const template = characterTemplates[classType.toLowerCase() as keyof typeof characterTemplates];
    const character: Character = {
      id: `char_${Date.now()}`,
      name,
      class: classType,
      level: 1,
      experience: 0,
      experienceToNextLevel: 100,
      gold: 100,
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
      skills: template.startingAbilities,
      questLog: [],
      completedQuests: [],
      achievements: [],
    };

    dispatch({ type: "START_GAME", payload: character });
  };

  const updateCharacter = (character: Character) => {
    dispatch({ type: "UPDATE_CHARACTER", payload: character });
  };

  const saveGame = async () => {
    try {
      await AsyncStorage.setItem("game_state", JSON.stringify(gameState));
    } catch (error) {
      console.error("Failed to save game:", error);
    }
  };

  const loadGame = async () => {
    try {
      const saved = await AsyncStorage.getItem("game_state");
      if (saved) {
        dispatch({ type: "LOAD_GAME", payload: JSON.parse(saved) });
      }
    } catch (error) {
      console.error("Failed to load game:", error);
    }
  };

  return (
    <GameContext.Provider value={{ gameState, character: gameState.character, updateCharacter, startNewGame, saveGame, loadGame }}>
      {children}
    </GameContext.Provider>
  );
}

export function useCharacter() {
  const context = useContext(GameContext);
  if (!context) throw new Error("useCharacter must be used within GameProvider");
  return context.character || ({} as Character);
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within GameProvider");
  return context;
}

// ============ REDUCER ============

const initialGameState: GameState = {
  character: null,
  currentPosition: { x: 5, y: 5, region: "forest" },
  inBattle: false,
  currentEnemy: null,
  combatLog: [],
  gameTime: 0,
  autoSaveTime: Date.now(),
};

type GameAction =
  | { type: "START_GAME"; payload: Character }
  | { type: "UPDATE_CHARACTER"; payload: Character }
  | { type: "LOAD_GAME"; payload: GameState }
  | { type: "MOVE"; payload: { x: number; y: number; region: string } }
  | { type: "START_BATTLE"; payload: any }
  | { type: "END_BATTLE" };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME":
      return { ...state, character: action.payload };
    case "UPDATE_CHARACTER":
      return { ...state, character: action.payload };
    case "LOAD_GAME":
      return action.payload;
    case "MOVE":
      return { ...state, currentPosition: action.payload };
    case "START_BATTLE":
      return { ...state, inBattle: true, currentEnemy: action.payload };
    case "END_BATTLE":
      return { ...state, inBattle: false, currentEnemy: null, combatLog: [] };
    default:
      return state;
  }
}
