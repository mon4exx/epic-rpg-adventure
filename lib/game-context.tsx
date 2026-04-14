/**
 * Game context and hooks for global game state management
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Character, GameState } from "./game-types";
import { GameStateManager } from "./game-engine";
import { classTemplates } from "./game-database";

// ============================================================================
// TYPES
// ============================================================================

export interface GameContextType {
  gameState: GameState | null;
  isLoading: boolean;
  error: string | null;
  startNewGame: (character: Character) => Promise<void>;
  loadGame: () => Promise<void>;
  saveGame: () => Promise<void>;
  updateGameState: (updates: Partial<GameState>) => void;
  updateCharacter: (updates: Partial<Character>) => void;
}

export type GameAction =
  | { type: "SET_GAME_STATE"; payload: GameState }
  | { type: "UPDATE_GAME_STATE"; payload: Partial<GameState> }
  | { type: "UPDATE_CHARACTER"; payload: Partial<Character> }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "RESET" };

// ============================================================================
// CONTEXT & PROVIDER
// ============================================================================

const GameContext = createContext<GameContextType | undefined>(undefined);

const initialState: GameContextType = {
  gameState: null,
  isLoading: false,
  error: null,
  startNewGame: async () => {},
  loadGame: async () => {},
  saveGame: async () => {},
  updateGameState: () => {},
  updateCharacter: () => {},
};

function gameReducer(state: GameContextType, action: GameAction): GameContextType {
  switch (action.type) {
    case "SET_GAME_STATE":
      return { ...state, gameState: action.payload, error: null };

    case "UPDATE_GAME_STATE":
      if (!state.gameState) return state;
      return {
        ...state,
        gameState: { ...state.gameState, ...action.payload },
      };

    case "UPDATE_CHARACTER":
      if (!state.gameState) return state;
      return {
        ...state,
        gameState: {
          ...state.gameState,
          character: { ...state.gameState.character, ...action.payload },
        },
      };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "RESET":
      return { ...initialState };

    default:
      return state;
  }
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Start new game
  const startNewGame = useCallback(async (character: Character) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const gameState = GameStateManager.createNewGameState(character);
      const serialized = GameStateManager.serializeGameState(gameState);
      await AsyncStorage.setItem("gameState", serialized);
      dispatch({ type: "SET_GAME_STATE", payload: gameState });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Failed to start new game",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // Load game
  const loadGame = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const saved = await AsyncStorage.getItem("gameState");
      if (saved) {
        const gameState = GameStateManager.deserializeGameState(saved);
        dispatch({ type: "SET_GAME_STATE", payload: gameState });
      }
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Failed to load game",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // Save game
  const saveGame = useCallback(async () => {
    try {
      if (!state.gameState) return;
      const serialized = GameStateManager.serializeGameState(state.gameState);
      await AsyncStorage.setItem("gameState", serialized);
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Failed to save game",
      });
    }
  }, [state.gameState]);

  // Update game state
  const updateGameState = useCallback((updates: Partial<GameState>) => {
    dispatch({ type: "UPDATE_GAME_STATE", payload: updates });
  }, []);

  // Update character
  const updateCharacter = useCallback((updates: Partial<Character>) => {
    dispatch({ type: "UPDATE_CHARACTER", payload: updates });
  }, []);

  const value: GameContextType = {
    ...state,
    startNewGame,
    loadGame,
    saveGame,
    updateGameState,
    updateCharacter,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// ============================================================================
// HOOKS
// ============================================================================

export function useGame(): GameContextType {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within GameProvider");
  }
  return context;
}

export function useGameState() {
  const { gameState } = useGame();
  if (!gameState) {
    throw new Error("Game state not initialized");
  }
  return gameState;
}

export function useCharacter() {
  const gameState = useGameState();
  return gameState.character;
}

export function usePlayerPosition() {
  const gameState = useGameState();
  return gameState.position;
}

export function useAutoSave() {
  const { gameState, saveGame } = useGame();

  useEffect(() => {
    if (!gameState?.settings.autoSave) return;

    const interval = setInterval(() => {
      saveGame();
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(interval);
  }, [gameState?.settings.autoSave, saveGame]);
}

// ============================================================================
// UTILITIES
// ============================================================================

export function createCharacterFromClass(
  name: string,
  classType: keyof typeof classTemplates
): Character {
  const template = classTemplates[classType];

  return {
    id: `char_${Date.now()}`,
    name,
    class: classType,
    level: 1,
    experience: 0,
    experienceToNextLevel: 100,
    stats: { ...template.baseStats },
    skills: [],
    skillPoints: 0,
    equipment: {
      head: null,
      chest: null,
      legs: null,
      feet: null,
      hands: null,
      main_hand: null,
      off_hand: null,
      ring_1: null,
      ring_2: null,
      amulet: null,
    },
    inventory: [],
    gold: 100,
    statusEffects: [],
    questLog: [],
    completedQuests: [],
    achievements: [],
    createdAt: Date.now(),
    lastSaved: Date.now(),
  };
}
