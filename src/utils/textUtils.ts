import { romajiMap } from '../constants/gameConstants';
import { DecomposedChar } from '../types/game';

// 文字列を一文字ずつ分解し、ローマ字情報を付加する
export function decomposeText(text: string): DecomposedChar[] {
  const chars: DecomposedChar[] = [];
  let i = 0;
  
  while (i < text.length) {
    let char = text[i];
    let nextChar = text[i + 1];
    
    // 小文字（ょ、ゅ、ゃ）のチェック
    if (nextChar && isSmallChar(nextChar)) {
      char = char + nextChar;
      i += 2;
    }
    // 促音（っ）のチェック
    else if (char === 'っ' && nextChar) {
      // 促音の場合は次の文字の最初の子音を重ねる
      const nextRomaji = getRomajiForChar(nextChar)[0];
      const firstConsonant = nextRomaji[0];
      chars.push({
        char: 'っ',
        romaji: [firstConsonant],
        isCompleted: false
      });
      i++;
      continue;
    }
    else {
      i++;
    }
    
    chars.push({
      char: char,
      romaji: getRomajiForChar(char),
      isCompleted: false
    });
  }
  
  return chars;
}

// 小文字（ょ、ゅ、ゃ）かどうかをチェック
function isSmallChar(char: string): boolean {
  return ['ょ', 'ゅ', 'ゃ'].includes(char);
}

// 文字のローマ字表記を取得
export function getRomajiForChar(char: string): string[] {
  return romajiMap[char as keyof typeof romajiMap] || [char];
}

// 入力されたローマ字が正しいかチェック
export function isValidRomaji(input: string, target: string[]): boolean {
  return target.some(romaji => 
    romaji.startsWith(input.toUpperCase())
  );
}

// 入力が完了したかチェック
export function isInputComplete(input: string, target: string[]): boolean {
  return target.includes(input.toUpperCase());
}

// 「ん」の処理 - NNのみを許可
export function handleSpecialN(char: string, input: string, nextChar: string | null): boolean {
  if (char !== 'ん') return false;
  return input.toUpperCase() === 'NN';
}