export interface GameSettings {
  selectedStages: number[];
  speed: number;
  isRandomMode: boolean;
  numStages: number;
  showHands: boolean;
  windowSize: number;
}

export interface ScorePopup {
  id: number;
  score: number;
  x: number;
  y: number;
}

export interface CurrentWord {
  id: number;
  text: string;
  x: number;
  y: number;
  speed: number;
  startTime: number;
  completedChars: number;  // 追加: 完了した文字数を追跡
  currentRomaji: string;   // 追加: 現在の文字のローマ字
  typedRomaji: string;    // 追加: 入力済みのローマ字
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
}

// 追加: 文字の分解結果を表す型
export interface DecomposedChar {
  char: string;
  romaji: string[];
  isCompleted: boolean;
}