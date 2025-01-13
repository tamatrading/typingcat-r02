import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Heart, Dog, Volume2, VolumeX, Settings } from 'lucide-react';
import KeyboardHands from './KeyboardHands';
import KeyboardLayout from './KeyboardLayout';
import GameHeader from './game/GameHeader';
import GameScreen from './game/GameScreen';
import { GameSettings, ScorePopup, CurrentWord, Particle, DecomposedChar } from '../types/game';
import {
  stageBackgrounds,
  stageSets,
  romajiMap,
} from '../constants/gameConstants';
import { preloadGameImages } from '../utils/imagePreloader';
import {
  decomposeText,
  isValidRomaji,
  isInputComplete,
  handleSpecialN,
  getRomajiForChar
} from '../utils/textUtils';

interface Props {
  settings: GameSettings;
  onAdminRequest: () => void;
}

const TypingGame: React.FC<Props> = ({ settings, onAdminRequest }) => {
  const [stage, setStage] = useState(settings.selectedStages[0]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState('start');
  const [speedMultiplier, setSpeedMultiplier] = useState(settings.speed);
  const [currentWord, setCurrentWord] = useState<CurrentWord | null>(null);
  const [input, setInput] = useState('');
  const [life, setLife] = useState(10);
  const [questionCount, setQuestionCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [totalStagesCompleted, setTotalStagesCompleted] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [scoreAnimation, setScoreAnimation] = useState(false);
  const [shakeAnimation, setShakeAnimation] = useState(false);
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const [availableCharacters, setAvailableCharacters] = useState<string[]>([]);
  const [lastCharacter, setLastCharacter] = useState<string>('');
  const [showSuccessEffect, setShowSuccessEffect] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentBackground, setCurrentBackground] = useState<string>('');
  const [questionHistory, setQuestionHistory] = useState<string[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [characterFrequency, setCharacterFrequency] = useState<Record<string, number>>({});
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [decomposedChars, setDecomposedChars] = useState<DecomposedChar[]>([]);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [currentRomajiInput, setCurrentRomajiInput] = useState('');

  const audioContextRef = useRef<AudioContext | null>(null);
  const finalScoreRef = useRef<number>(0);
  const previousHighScoreRef = useRef<number>(0);
  const currentStageIndexRef = useRef(0);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gameStateRef = useRef(gameState);

  const getTimeoutDuration = (speed: number) => {
    switch (speed) {
      case 5: return 2000;
      case 4: return 4000;
      case 3: return 6000;
      case 2: return 8000;
      case 1: return 10000;
      default: return 6000;
    }
  };

  const QUESTION_TIMEOUT = getTimeoutDuration(speedMultiplier);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    const chars = settings.selectedStages.flatMap(
      (stageNum) => stageSets[stageNum as keyof typeof stageSets]
    );
    setAvailableCharacters(chars);
  }, [settings.selectedStages]);

  useEffect(() => {
    setSpeedMultiplier(settings.speed);
    setStage(settings.selectedStages[0]);
    currentStageIndexRef.current = 0;
    if (settings.isRandomMode) {
      const backgrounds = Object.values(stageBackgrounds);
      setCurrentBackground(
        backgrounds[Math.floor(Math.random() * backgrounds.length)]
      );
    }
  }, [settings]);

  const getRandomBackground = useCallback(() => {
    const backgrounds = Object.values(stageBackgrounds);
    return backgrounds[Math.floor(Math.random() * backgrounds.length)];
  }, []);

  const playSound = useCallback(
    (freq: number, type: OscillatorType, dur: number, vol = 0.3) => {
      if (isMuted || !audioContextRef.current) return;
      try {
        const osc = audioContextRef.current.createOscillator();
        const gain = audioContextRef.current.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, audioContextRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(
          0.01,
          audioContextRef.current.currentTime + dur
        );
        osc.connect(gain);
        gain.connect(audioContextRef.current.destination);
        osc.start();
        osc.stop(audioContextRef.current.currentTime + dur);
      } catch (e) {
        console.error(e);
      }
    },
    [isMuted]
  );

  const playTypeSound = useCallback(() => {
    playSound(1200, 'sine', 0.08, 0.15);
    setTimeout(() => playSound(2400, 'sine', 0.05, 0.05), 10);
  }, [playSound]);

  const playCorrectSound = useCallback(() => {
    playSound(1760, 'sine', 0.15, 0.2);
    setTimeout(() => playSound(2637, 'sine', 0.1, 0.1), 50);
    setTimeout(() => playSound(3520, 'sine', 0.08, 0.08), 100);
    setTimeout(() => playSound(4186, 'sine', 0.15, 0.05), 150);
  }, [playSound]);

  const playMissSound = useCallback(() => {
    playSound(220, 'sawtooth', 0.2, 0.2);
    playSound(233.08, 'sawtooth', 0.2, 0.2);
    setTimeout(() => {
      playSound(146.83, 'square', 0.15, 0.15);
      playSound(155.56, 'square', 0.15, 0.15);
    }, 50);
    setTimeout(() => {
      playSound(440, 'sawtooth', 0.1, 0.1);
      playSound(466.16, 'sawtooth', 0.1, 0.1);
    }, 100);
  }, [playSound]);

  const playStageClearSound = useCallback(() => {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
    notes.forEach((note, i) => {
      setTimeout(() => playSound(note, 'sine', 0.3, 0.2), i * 100);
      setTimeout(() => playSound(note * 2, 'sine', 0.2, 0.1), i * 100 + 50);
    });
  }, [playSound]);

  const playGameClearSound = useCallback(() => {
    const notes = [
      [523.25, 659.25, 783.99, 1046.5],
      [783.99, 987.77, 1174.66, 1567.98],
      [523.25, 659.25, 783.99, 1046.5],
      [783.99, 987.77, 1174.66, 1567.98],
      [698.46, 880.0, 1046.5, 1396.91],
      [783.99, 987.77, 1174.66, 1567.98],
      [1046.5, 1318.51, 1567.98, 2093.0],
    ];

    notes.forEach((chord, i) => {
      setTimeout(() => {
        chord.forEach((note) => {
          playSound(note, 'triangle', 0.8, 0.2);
          playSound(note * 2, 'sine', 0.4, 0.1);
          playSound(note * 3, 'sine', 0.3, 0.05);
        });

        if (i === 5) {
          chord.forEach((note) => {
            setTimeout(() => {
              playSound(note * 4, 'sine', 0.2, 0.08);
              playSound(note * 5, 'sine', 0.15, 0.05);
              playSound(note * 6, 'sine', 0.1, 0.03);
            }, 300);
          });
        }
      }, i * 500);
    });
  }, [playSound]);

  const playGameOverSound = useCallback(() => {
    const notes = [
      [392.0, 493.88, 587.33],
      [329.63, 392.0, 493.88],
      [261.63, 329.63, 392.0],
      [293.66, 369.99, 440.0],
      [329.63, 392.0, 493.88],
    ];

    notes.forEach((chord, i) => {
      setTimeout(() => {
        chord.forEach((note) => {
          playSound(note, 'sine', 1.0, 0.15);
          playSound(note * 1.5, 'sine', 0.8, 0.05);
        });
      }, i * 800);
    });
  }, [playSound]);

  const handleAdminRequest = useCallback(() => {
    if (gameState === 'playing') {
      if (questionTimerRef.current) {
        clearTimeout(questionTimerRef.current);
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
      setCurrentWord(null);
      setInput('');
      setGameState('start');
      setQuestionHistory([]);
    }
    onAdminRequest();
  }, [gameState, onAdminRequest]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameStateRef.current === 'start') {
        if (e.key === 'v') {
          onAdminRequest();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onAdminRequest]);

  useEffect(() => {
    const savedHighScore = localStorage.getItem('typingGameHighScore');
    if (savedHighScore) {
      const parsedHighScore = parseInt(savedHighScore, 10);
      setHighScore(parsedHighScore);
      previousHighScoreRef.current = parsedHighScore;
    }
  }, []);

  const updateHighScore = useCallback((finalScore: number) => {
    finalScoreRef.current = finalScore;
    return finalScore > previousHighScoreRef.current;
  }, []);

  const saveHighScoreToStorage = useCallback((score: number) => {
    if (score > previousHighScoreRef.current) {
      localStorage.setItem('typingGameHighScore', score.toString());
      previousHighScoreRef.current = score;
      setHighScore(score);
    }
  }, []);

  const initAudio = useCallback(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
  }, []);

  const startCountdown = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
    setCountdown(3);
    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
          }
          setGameState('playing');
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  const resetGame = useCallback(() => {
    initAudio();
    saveHighScoreToStorage(score);
    setScore(0);
    setStage(settings.selectedStages[0]);
    currentStageIndexRef.current = 0;
    setLife(10);
    setQuestionCount(0);
    setInput('');
    setGameState('countdown');
    setQuestionHistory([]);
    setTotalStagesCompleted(0);
    setCurrentWord(null);
    setCharacterFrequency({});
    setScorePopups([]);
    finalScoreRef.current = 0;
    setLastCharacter('');
    setDecomposedChars([]);
    setCurrentCharIndex(0);
    setCurrentRomajiInput('');
    startCountdown();
  }, [initAudio, saveHighScoreToStorage, score, settings.selectedStages, startCountdown]);

  const convertToRomaji = useCallback((word: string) => {
    if (!word) return [];
    return romajiMap[word as keyof typeof romajiMap] || [word];
  }, []);

  const calculateScore = useCallback(
    (elapsedTime: number) => {
      const maxScore = 8;
      const minScore = 1;
      const maxTime = QUESTION_TIMEOUT;

      return Math.max(
        minScore,
        Math.ceil(
          maxScore * (1 - elapsedTime / maxTime) * (1 + speedMultiplier * 0.2)
        )
      );
    },
    [speedMultiplier, QUESTION_TIMEOUT]
  );

  const createParticles = useCallback((x: number, y: number) => {
    const newParticles = Array.from({ length: 10 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      color: ['#60A5FA', '#34D399', '#FBBF24'][Math.floor(Math.random() * 3)],
    }));
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) =>
        prev.filter((p) => !newParticles.find((np) => np.id === p.id))
      );
    }, 1000);
  }, []);

  const createScorePopup = useCallback(
    (score: number, x: number, y: number) => {
      const newPopup = {
        id: Date.now(),
        score,
        x,
        y,
      };
      setScorePopups((prev) => [...prev, newPopup]);
      setTimeout(() => {
        setScorePopups((prev) =>
          prev.filter((popup) => popup.id !== newPopup.id)
        );
      }, 1000);
    },
    []
  );

  const gameOver = useCallback(() => {
    setGameState('gameover');
    setCurrentWord(null);
    updateHighScore(score);
    saveHighScoreToStorage(score);
    playGameOverSound();
  }, [playGameOverSound, score, updateHighScore, saveHighScoreToStorage]);

  const checkStageClear = useCallback(() => {
    if (questionCount >= 19) {
      currentStageIndexRef.current++;

      const shouldEndGame = settings.isRandomMode
        ? totalStagesCompleted + 1 >= settings.numStages
        : currentStageIndexRef.current >= settings.selectedStages.length;

      if (shouldEndGame) {
        setGameState('clear');
        updateHighScore(score);
        saveHighScoreToStorage(score);
        playGameClearSound();
      } else {
        setGameState('stageClear');
        playStageClearSound();
      }
      return true;
    }
    return false;
  }, [
    questionCount,
    totalStagesCompleted,
    settings.isRandomMode,
    settings.numStages,
    settings.selectedStages.length,
    playGameClearSound,
    playStageClearSound,
    score,
    updateHighScore,
    saveHighScoreToStorage,
  ]);

  const nextStage = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      if (settings.isRandomMode) {
        setCurrentBackground(getRandomBackground());
        setStage(
          settings.selectedStages[
            Math.floor(Math.random() * settings.selectedStages.length)
          ]
        );
      } else {
        setStage(settings.selectedStages[currentStageIndexRef.current]);
      }
      setQuestionCount(0);
      setInput('');
      setGameState('countdown');
      setQuestionHistory([]);
      setCurrentWord(null);
      setIsTransitioning(false);
      setTotalStagesCompleted((prev) => prev + 1);
      setLastCharacter('');
      setDecomposedChars([]);
      setCurrentCharIndex(0);
      setCurrentRomajiInput('');
      startCountdown();
    }, 500);
  }, [
    settings.selectedStages,
    settings.isRandomMode,
    getRandomBackground,
    startCountdown,
  ]);

  const createNewWord = useCallback(() => {
    let text;
    const currentSet = stageSets[stage as keyof typeof stageSets];
    const lastQuestions = questionHistory.slice(-3);
    const lastFJ = lastQuestions.find(q => q === 'F' || q === 'J');
    
    // F/Jを4問ごとに出題
    if (questionCount > 0 && questionCount % 4 === 3) {
      // F/Jの出現回数をカウント
      const fCount = questionHistory.filter(q => q === 'F').length;
      const jCount = questionHistory.filter(q => q === 'J').length;
      
      // 出現回数が少ない方を優先、同じ場合はランダム
      if (fCount < jCount) {
        text = 'F';
      } else if (jCount < fCount) {
        text = 'J';
      } else {
        text = Math.random() < 0.5 ? 'F' : 'J';
      }
      
      // 同じ文字が連続しないように調整
      if (lastFJ === text) {
        text = text === 'F' ? 'J' : 'F';
      }
    } else {
      if (settings.isRandomMode) {
        const availableWords = availableCharacters.filter(
          word => {
            // F/Jは4問ごとの時のみ出題
            if (word === 'F' || word === 'J') return false;
            // 直前の3問と同じ文字は避ける
            return !lastQuestions.includes(word);
          }
        );
        // 利用可能な文字がない場合は、履歴をリセット
        if (availableWords.length === 0) {
          setQuestionHistory([]);
          text = availableCharacters.filter(word => word !== 'F' && word !== 'J')[
            Math.floor(Math.random() * (availableCharacters.length - 2))
          ];
        } else {
          text = availableWords[Math.floor(Math.random() * availableWords.length)];
        }
      } else {
        const availableWords = currentSet.filter(
          word => {
            // F/Jは4問ごとの時のみ出題
            if (word === 'F' || word === 'J') return false;
            // 直前の3問と同じ文字は避ける
            return !lastQuestions.includes(word);
          }
        );
        // 利用可能な文字がない場合は、履歴をリセット
        if (availableWords.length === 0) {
          setQuestionHistory([]);
          text = currentSet.filter(word => word !== 'F' && word !== 'J')[
            Math.floor(Math.random() * (currentSet.length - 2))
          ];
        } else {
          text = availableWords[Math.floor(Math.random() * availableWords.length)];
        }
      }
    }

    if (text) {
      setQuestionHistory((prev) => [...prev, text]);
      setCharacterFrequency((prev) => ({
        ...prev,
        [text]: (prev[text] || 0) + 1,
      }));
      
      // 文字を分解してローマ字情報を付加
      const decomposed = decomposeText(text);
      setDecomposedChars(decomposed);
      setCurrentCharIndex(0);
      setCurrentRomajiInput('');
    }

    setLastCharacter(text);
    setQuestionStartTime(Date.now());

    if (questionTimerRef.current) {
      clearTimeout(questionTimerRef.current);
    }

    questionTimerRef.current = setTimeout(() => {
      if (gameStateRef.current === 'playing') {
        setInput('');
        setShakeAnimation(true);
        setTimeout(() => setShakeAnimation(false), 500);
        setLife((prev) => {
          const newLife = prev - 1;
          if (newLife <= 0) {
            gameOver();
          }
          return newLife;
        });
        setCurrentWord(createNewWord());
        playMissSound();
      }
    }, QUESTION_TIMEOUT);

    return {
      id: Date.now(),
      text,
      x: 50,
      y: 50,
      speed: 0,
      startTime: Date.now(),
      completedChars: 0,
      currentRomaji: decomposedChars[0]?.romaji[0] || '',
      typedRomaji: ''
    };
  }, [
    stage,
    questionCount,
    settings.isRandomMode,
    availableCharacters,
    questionHistory,
    playMissSound,
    gameOver,
    QUESTION_TIMEOUT,
    decomposedChars
  ]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (gameStateRef.current !== 'playing' || !currentWord || showSuccessEffect) return;

      if (e.isComposing) return;

      const key = e.key.toUpperCase();
      if (!/^[A-Z0-9\-.,;:@\[\]\\]$/.test(key)) return;

      // 現在の文字に対するローマ字入力を処理
      if (currentCharIndex < decomposedChars.length) {
        const currentChar = decomposedChars[currentCharIndex];
        const newInput = currentRomajiInput + key;

        // ローマ字入力が正しいかチェック
        if (isValidRomaji(newInput, currentChar.romaji)) {
          setCurrentRomajiInput(newInput);
          playTypeSound();

          // 現在の文字の入力が完了したかチェック
          if (isInputComplete(newInput, currentChar.romaji)) {
            // 文字を完了状態に更新
            const updatedChars = [...decomposedChars];
            updatedChars[currentCharIndex].isCompleted = true;
            setDecomposedChars(updatedChars);

            // 次の文字へ
            if (currentCharIndex + 1 < decomposedChars.length) {
              setCurrentCharIndex(currentCharIndex + 1);
              setCurrentRomajiInput('');
            } else {
              // 単語全体が完了
              const elapsedTime = Date.now() - questionStartTime;
              const pointsEarned = calculateScore(elapsedTime);
              setScore((prev) => prev + pointsEarned);
              setQuestionCount((prev) => prev + 1);
              playCorrectSound();

              if (currentWord) {
                createParticles(currentWord.x, currentWord.y);
                createScorePopup(pointsEarned, currentWord.x, currentWord.y);
                setShowSuccessEffect(true);

                setTimeout(() => {
                  setShowSuccessEffect(false);
                  if (!checkStageClear()) {
                    setCurrentWord(createNewWord());
                  }
                }, 600);
              }

              setScoreAnimation(true);
              setTimeout(() => setScoreAnimation(false), 300);
            }
          }
        } else {
          // 誤入力
          playMissSound();
          setLife((prev) => {
            const newLife = prev - 1;
            if (newLife <= 0) {
              gameOver();
            }
            return newLife;
          });
          setCurrentRomajiInput('');
          setShakeAnimation(true);
          setTimeout(() => setShakeAnimation(false), 500);
        }
      }
    },
    [
      currentWord,
      showSuccessEffect,
      decomposedChars,
      currentCharIndex,
      currentRomajiInput,
      questionStartTime,
      calculateScore,
      playTypeSound,
      playCorrectSound,
      playMissSound,
      createParticles,
      createScorePopup,
      checkStageClear,
      createNewWord,
      gameOver
    ]
  );

  useEffect(() => {
    if (gameState === 'playing') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [gameState, handleKeyDown]);

  useEffect(() => {
    preloadGameImages()
      .then(() => {
        setImagesLoaded(true);
      })
      .catch((error) => {
        console.error('Failed to preload images:', error);
        setImagesLoaded(true);
      });
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && !currentWord && !isTransitioning) {
      setCurrentWord(createNewWord());
    }
  }, [gameState, currentWord, createNewWord, isTransitioning]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (gameState === 'start') {
          resetGame();
        } else if (gameState === 'stageClear') {
          nextStage();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, resetGame, nextStage]);

  if (!imagesLoaded) {
    return (
      <div className="w-[780px] flex justify-center bg-gray-100 p-2">
        <div className="w-[700px] h-[525px] p-3 bg-gradient-to-b from-blue-100 to-blue-200 shadow-xl rounded-lg mx-auto flex items-center justify-center">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[780px] flex justify-center bg-gray-100 p-2">
      <div
        className="w-[700px] h-[525px] p-3 bg-gradient-to-b from-blue-100 to-blue-200 shadow-xl rounded-lg mx-auto"
        style={{
          transform: `scale(${settings.windowSize})`,
          transformOrigin: 'top center',
        }}
      >
        <GameHeader
          onAdminRequest={handleAdminRequest}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          totalStagesCompleted={totalStagesCompleted}
          questionCount={questionCount}
          gameState={gameState}
          life={life}
          score={score}
          highScore={highScore}
          scoreAnimation={scoreAnimation}
        />

        <GameScreen
          gameState={gameState}
          currentWord={currentWord}
          countdown={countdown}
          score={score}
          speedMultiplier={speedMultiplier}
          highScore={highScore}
          totalStagesCompleted={totalStagesCompleted}
          questionCount={questionCount}
          finalScoreRef={finalScoreRef}
          previousHighScoreRef={previousHighScoreRef}
          resetGame={resetGame}
          nextStage={nextStage}
          saveHighScoreToStorage={saveHighScoreToStorage}
          showSuccessEffect={showSuccessEffect}
          particles={particles}
          scorePopups={scorePopups}
          stage={stage}
          convertToRomaji={convertToRomaji}
          shakeAnimation={shakeAnimation}
          settings={settings}
          currentBackground={currentBackground}
          stageBackgrounds={stageBackgrounds}
          decomposedChars={decomposedChars}
          currentCharIndex={currentCharIndex}
        />

        {gameState === 'playing' && currentWord && settings.showHands && (
          <div className="absolute bottom-0 left-0 right-0 transform translate-y-[30%]">
            <KeyboardHands
              highlightedKey={decomposedChars[currentCharIndex]?.char || ''}
              currentInput={currentRomajiInput}
              show={true}
              showSuccessEffect={showSuccessEffect}
            />
            <div className="mt-2">
              <KeyboardLayout
                activeKey={decomposedChars[currentCharIndex]?.char || ''}
                currentInput={currentRomajiInput}
                showSuccessEffect={showSuccessEffect}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TypingGame;