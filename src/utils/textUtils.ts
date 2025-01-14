import { romajiMap } from '../constants/gameConstants';
import { DecomposedChar } from '../types/game';

// 促音（っ）の次の文字のローマ字の最初の子音を取得（配列対応）
function getFirstConsonant(romaji: string[]): string {
  // 最初のローマ字表記の最初の子音を取得
  const firstRomaji = romaji[0];
  const consonantMatch = firstRomaji.match(/^[^AIUEO]/);
  return consonantMatch ? consonantMatch[0] : '';
}

// 文字列を一文字ずつ分解し、ローマ字情報を付加する
export function decomposeText(text: string): DecomposedChar[] {
  const chars: DecomposedChar[] = [];
  let i = 0;
  
  while (i < text.length) {
    const char = text[i];
    const nextChar = text[i + 1];
    const nextNextChar = text[i + 2];

    // 促音（っ）のチェック
    if (char === 'っ' && nextChar) {
      // 次の文字が拗音の場合（例：しゃ、しゅ、しょ）
      if (nextNextChar && isSmallChar(nextNextChar)) {
        const combo = nextChar + nextNextChar;
        const romajiOptions = romajiMap[combo as keyof typeof romajiMap];
        if (romajiOptions) {
          const baseRomaji = combo === 'しゅ' ? ['SSHU', 'SSYU'] : [romajiOptions[0]];
          const consonant = getFirstConsonant(baseRomaji);
          chars.push({
            char: char + nextChar + nextNextChar,
            romaji: baseRomaji,
            isCompleted: false
          });
          i += 3;
          continue;
        }
      }

      // 通常の文字の場合
      const romajiOptions = romajiMap[nextChar as keyof typeof romajiMap];
      if (romajiOptions) {
        const baseRomaji = romajiOptions[0];
        const consonant = getFirstConsonant(baseRomaji);
        chars.push({
          char: char + nextChar,
          romaji: [consonant + baseRomaji],
          isCompleted: false
        });
        i += 2;
        continue;
      }
    } else if (nextChar && isSmallChar(nextChar)) {
      const combo = char + nextChar;
      if (romajiMap[combo as keyof typeof romajiMap]) {
        chars.push({
          char: combo,
          romaji: romajiMap[combo as keyof typeof romajiMap],
          isCompleted: false
        });
        i += 2;
        continue;
      }
    }
    
    // 特殊な文字の組み合わせ（ふぁ、ふぃ、ふぇ、ふぉ、しぇなど）
    else if (nextChar && romajiMap[(char + nextChar) as keyof typeof romajiMap]) {
      chars.push({
        char: char + nextChar,
        romaji: romajiMap[(char + nextChar) as keyof typeof romajiMap],
        isCompleted: false
      });
      i += 2;
      continue;
    }
    // 単一文字の処理
    else {
      if (romajiMap[char as keyof typeof romajiMap]) {
        chars.push({
          char: char,
          romaji: romajiMap[char as keyof typeof romajiMap],
          isCompleted: false
        });
      } else {
        chars.push({
          char: char,
          romaji: [char],
          isCompleted: false
        });
      }
      i++;
      continue;
    }
  }
  
  return chars;
}
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