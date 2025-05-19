export type AppState = {
  description: string;
  span: string;
  textColor: string;
  bgColor: string;
};

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
  WAITING: {
    description: "Waiting for the game client...",
    span: "Waiting",
    textColor: "white",
    bgColor: "orange",
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
