import React from 'react';
import { CurrentWord, Particle, ScorePopup, DecomposedChar } from '../../types/game';
import TimeoutBar from './TimeoutBar';
import { useState, useEffect, useMemo } from 'react';
import { clearSentences } from '../../constants/gameConstants';

interface GameScreenProps {
  gameState: string;
  currentWord: CurrentWord | null;
  countdown: number | null;
  score: number;
  speedMultiplier: number;
  highScore: number;
  totalStagesCompleted: number;
  questionCount: number;
  finalScoreRef: React.MutableRefObject<number>;
  previousHighScoreRef: React.MutableRefObject<number>;
  resetGame: () => void;
  nextStage: () => void;
  saveHighScoreToStorage: (score: number) => void;
  showSuccessEffect: boolean;
  particles: Particle[];
  scorePopups: ScorePopup[];
  stage: number;
  convertToRomaji: (word: string) => string[];
  shakeAnimation: boolean;
  settings: {
    isRandomMode: boolean;
    windowSize: number;
    showHands: boolean;
  };
  currentBackground: string;
  stageBackgrounds: Record<number, string>;
  decomposedChars: DecomposedChar[];
  currentCharIndex: number;
}

const GameScreen: React.FC<GameScreenProps> = ({
  gameState,
  currentWord,
  countdown,
  score,
  speedMultiplier,
  highScore,
  totalStagesCompleted,
  questionCount,
  finalScoreRef,
  previousHighScoreRef,
  resetGame,
  nextStage,
  saveHighScoreToStorage,
  showSuccessEffect,
  particles,
  scorePopups,
  stage,
  convertToRomaji,
  shakeAnimation,
  settings,
  currentBackground,
  stageBackgrounds,
  decomposedChars,
  currentCharIndex,
}) => {
  const [successWord, setSuccessWord] = useState<string | null>(null);
  const clearMessage = useMemo(
    () => clearSentences[Math.floor(Math.random() * clearSentences.length)],
    [totalStagesCompleted]
  );

  useEffect(() => {
    if (showSuccessEffect && currentWord) {
      setSuccessWord(currentWord.text);
    } else {
      setSuccessWord(null);
    }
  }, [showSuccessEffect, currentWord]);

  return (
    <div
      className={`relative h-[22rem] bg-gradient-to-b ${
        settings.isRandomMode ? currentBackground : stageBackgrounds[stage]
      } rounded-lg mb-8 overflow-hidden ${
        shakeAnimation ? 'animate-[shake_0.5s_ease-in-out]' : ''
      }`}
    >
      {/* Start Screen */}
      {gameState === 'start' && (
        <div className="absolute inset-0 bg-gradient-radial from-blue-900 via-green-800 to-green-900 overflow-hidden">
          <div className="relative z-10 flex flex-col items-center justify-center h-full">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-cyan-300 animate-gradient-x -mb-2 font-cute">
                タイピングたんご！
              </h2>
              <button
                onClick={resetGame}
                className="group relative w-64 h-64 mx-auto mb-8 cursor-pointer transition-transform duration-300 hover:scale-105"
              >
                <img
                  src="/images/cat1.png"
                  alt="Typing cat"
                  className="w-full h-full object-contain"
                />
              </button>
            </div>

            <div className="-mt-16 space-y-1 text-center">
              <p className="text-sm text-cyan-200 animate-pulse">
                画像をクリックまたはスペースキーでスタート
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800 flex flex-col items-center justify-center text-white">
          <div className="w-full flex flex-col items-center">
            <h2 className="text-4xl mb-4 font-bold animate-bounce">
              ゲームオーバー
            </h2>

            <div className="flex items-center justify-center w-full gap-8">
              <div className="flex flex-col items-center">
                <p className="text-xl mb-2">最終スコア: {score}</p>
                {finalScoreRef.current > previousHighScoreRef.current && (
                  <p className="text-lg text-yellow-300 mb-2">
                    🎉 ハイスコア達成！ 🎉
                  </p>
                )}
                <p className="text-lg text-slate-300 mb-4">
                  ステージ {totalStagesCompleted + 1} - {questionCount}
                  /20問クリア
                </p>
              </div>

              <div className="relative w-48 h-48">
                <img
                  src="/images/cat2.png"
                  alt="Game Over"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <button
              onClick={resetGame}
              className="bg-slate-500 hover:bg-slate-600 text-white text-xl py-2 px-8 rounded-lg transform transition-all duration-300 hover:scale-110 mt-4"
            >
              もう一度チャレンジ！
            </button>
          </div>
        </div>
      )}

      {/* Stage Clear Screen */}
      {gameState === 'stageClear' && (
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-300 via-green-400 to-emerald-500 flex flex-col items-center justify-center text-white">
          <h2 className="text-4xl mb-2 font-bold animate-bounce">
            ステージクリア！
          </h2>
          <div className="relative">
            <button
              onClick={nextStage}
              className="group relative w-64 h-64 cursor-pointer transition-transform duration-300 hover:scale-110"
            >
              <img
                src="/images/cat3.png"
                alt="Stage Clear"
                className="w-full h-full object-contain"
              />
            </button>
            <div className="absolute -top-4 -left-18 transform -translate-x-full w-48">
              <div className="relative bg-white text-gray-800 p-4 rounded-2xl shadow-lg">
                <p className="text-lg text-center whitespace-pre-line">
                  {clearMessage}
                </p>
                <div
                  className="absolute -bottom-4 right-2 w-0 h-0 border-l-[24px] border-l-transparent border-t-[32px] border-t-white border-r-[24px] border-r-transparent"
                  style={{ transform: 'rotate(-30deg)' }}
                />
              </div>
            </div>
          </div>
          <p className="text-white -mt-2 animate-pulse">
            画像をクリックまたはスペースキーで次のステージへ
          </p>
        </div>
      )}

      {/* Game Clear Screen */}
      {gameState === 'clear' && (
        <div className="absolute inset-0 bg-gradient-radial from-yellow-300 via-amber-400 to-amber-500 flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-300/30 via-amber-400/20 to-amber-500/10 animate-spin-slow"></div>

          <div className="relative z-10 flex flex-col items-center w-full">
            <h2 className="text-3xl sm:text-4xl md:text-4xl mt-4 mb-4 text-white font-bold animate-bounce">
              🎉 全ステージクリア！ 🎉
            </h2>

            <div className="flex items-center justify-center w-full gap-8">
              <div className="flex flex-col items-center text-center">
                <p className="text-xl sm:text-2xl md:text-3xl text-white mb-3 animate-pulse">
                  おめでとうございます！
                </p>
                <p className="text-lg sm:text-xl md:text-2xl text-white mb-3">
                  最終スコア: {score}
                </p>
                {finalScoreRef.current > previousHighScoreRef.current && (
                  <div className="relative mb-3">
                    {(() => {
                      saveHighScoreToStorage(score);
                      return null;
                    })()}
                    <p className="text-base sm:text-lg md:text-xl text-red animate-pulse">
                      🏆 ハイスコア達成！ 🏆
                    </p>
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 rounded-lg blur opacity-75 animate-pulse"></div>
                  </div>
                )}
              </div>

              <div className="relative w-64 h-64 -mt-8">
                <img
                  src="/images/cat4.png"
                  alt="Game Clear"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <button
              onClick={resetGame}
              className="relative group bg-gradient-to-br from-amber-400 to-amber-600 text-white text-lg sm:text-xl md:text-2xl py-2 sm:py-3 px-6 sm:px-8 rounded-xl transform transition-all duration-300 hover:scale-110 hover:rotate-1 overflow-hidden -mt-2"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-amber-300 to-amber-500 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <span className="relative">最初から挑戦！</span>
            </button>
          </div>

          <div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-float-random text-xl sm:text-2xl"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              >
                {['🌟', '✨', '💫', '⭐'][Math.floor(Math.random() * 4)]}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Countdown */}
      {gameState === 'countdown' && countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-8xl font-bold text-white animate-pulse">
            {countdown}
          </div>
        </div>
      )}

      {/* Playing State */}
      {gameState === 'playing' && currentWord && (
        <div className="relative h-full flex flex-col items-center justify-center">
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-3/4 z-10">
            <TimeoutBar
              startTime={currentWord.startTime}
              timeout={(() => {
                switch (speedMultiplier) {
                  case 5: return 2000;
                  case 4: return 4000;
                  case 3: return 6000;
                  case 2: return 8000;
                  case 1: return 10000;
                  default: return 6000;
                }
              })()}
              isPaused={showSuccessEffect}
            />
          </div>

          <div className={`text-center mb-8 ${settings.showHands ? '-mt-16' : ''}`}>
            {!showSuccessEffect && decomposedChars.length > 0 && (
              <div className="flex items-center justify-center space-x-2">
                {decomposedChars.map((char, index) => (
                  <div
                    key={index}
                    className={`text-5xl font-bold transition-all duration-200 ${
                      index < currentCharIndex
                        ? 'text-green-300 opacity-50'
                        : index === currentCharIndex
                        ? 'text-white scale-110'
                        : 'text-gray-300 opacity-70'
                    }`}
                  >
                    {char.char}
                  </div>
                ))}
              </div>
            )}
            {currentWord && !showSuccessEffect && currentCharIndex < decomposedChars.length && (
              <div className="text-gray-200 text-xl mt-4">
                {decomposedChars[currentCharIndex].romaji.map((hint, index) => (
                  <div key={index}>{hint}</div>
                ))}
              </div>
            )}
          </div>

          {showSuccessEffect && successWord && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ transform: 'translateZ(0)' }}
            >
              <div className="w-32 h-32">
                <div
                  className="absolute inset-0 text-white text-6xl font-bold flex items-center justify-center"
                  style={{
                    animation:
                      'success-explosion 0.3s ease-out forwards, success-fall 0.3s ease-in forwards 0.3s',
                    willChange: 'transform, opacity',
                  }}
                >
                  {successWord}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-white/60"
                      style={{
                        transform: `rotate(${i * 45}deg) translateY(-16px)`,
                        animation: 'particle 0.3s ease-in forwards',
                        animationDelay: `${i * 0.06}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full animate-[particle_1s_ease-out_forwards]"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
          }}
        />
      ))}

      {/* Score Popups */}
      {scorePopups.map((popup) => (
        <div
          key={popup.id}
          className="absolute text-2xl font-bold text-yellow-300 animate-[scorePopup_1s_ease-out_forwards] whitespace-nowrap"
          style={{
            left: `calc(${popup.x}% + 4rem)`,
            top: `${popup.y}%`,
            transform: 'translateX(-50%)',
            textShadow: '0 0 10px rgba(0,0,0,0.5)',
          }}
        >
          +{popup.score}
        </div>
      ))}
    </div>
  );
};

export default GameScreen;