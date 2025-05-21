export type AppState = {
  description: string;
  span: string;
  textColor: string;
  bgColor: string;
};

/**
 * Defines all possible application states and their associated UI configuration.
 *
 * Each key represents a specific state in the app's lifecycle or interaction flow,
 * typically related to a League of Legends session managed by ZoeTrack.
 */
export const STATES: { [key: string]: AppState } = {
  INACTIVE: {
    description: "ZoeTrack is now inactive",
    span: "Inactive",
    textColor: "white",
    bgColor: "red",
  },
  LOBBY: {
    description: "In the waiting room",
    span: "In Lobby",
    textColor: "white",
    bgColor: "purple",
  },
  QUEUE: {
    description: "Searching for match",
    span: "In Queue",
    textColor: "black",
    bgColor: "cyan",
  },
  LOBBY_WAITING: {
    description: "Waiting to create a LoL lobby...",
    span: "Waiting",
    textColor: "white",
    bgColor: "orange",
  },
  CLIENT_WAITING: {
    description: "Waiting for the game client to open...",
    span: "Client Waiting",
    textColor: "white",
    bgColor: "darkorange",
  },
  GAME_FOUND: {
    description: "Game has been found!",
    span: "Game Found",
    textColor: "black",
    bgColor: "yellow",
  },
  CHAMP_SELECT: {
    description: "In champion selection",
    span: "Champ Select",
    textColor: "white",
    bgColor: "teal",
  },
  IN_GAME: {
    description: "Game in progress",
    span: "In Game",
    textColor: "white",
    bgColor: "green",
  },
  ENDING: {
    description: "Game is ending",
    span: "Ending",
    textColor: "black",
    bgColor: "lightgray",
  },
};
