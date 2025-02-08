import React, { useState, useEffect, useRef } from 'react';
import TypingGame from './components/TypingGame';
import AdminScreen from './components/AdminScreen';
import HelpButton from './components/HelpButton';
import HelpModal from './components/HelpModal';

const ASPECT_RATIO = 4 / 3; // ゲームの縦横比を固定

function App() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [currentGameState, setCurrentGameState] = useState('start');
  const [gameSettings, setGameSettings] = useState({
    selectedStages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
    speed: 2,
    isRandomMode: false,
    numStages: 3,
    showHands: true,
    windowSize: 1
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const calculateScale = () => {
    if (!containerRef.current) return 1;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // コンテナの90%のサイズを計算
    const maxWidth = containerWidth * 0.85;
    const maxHeight = containerHeight * 0.85;

    // ゲームの基本サイズ
    const baseWidth = 780;
    const baseHeight = baseWidth / ASPECT_RATIO;

    // 90%サイズでのアスペクト比を計算
    const containerAspect = maxWidth / maxHeight;

    // スケールを計算
    let newScale;
    if (containerAspect > ASPECT_RATIO) {
      // 高さに合わせる
      newScale = maxHeight / baseHeight;
    } else {
      // 幅に合わせる
      newScale = maxWidth / baseWidth;
    }

    // スケールの最小値を設定して小さすぎないようにする
    return Math.max(0.5, newScale);
  };

  useEffect(() => {
    const handleResize = () => {
      setScale(calculateScale());
    };

    handleResize(); // 初期化時に実行
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return showAdmin ? (
    <AdminScreen
      onBack={() => setShowAdmin(false)}
      onSettingsChange={setGameSettings}
      currentSettings={gameSettings}
    />
  ) : (
    <div className="relative w-full h-screen bg-gray-900">
      <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden">
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
          <TypingGame
            settings={gameSettings}
            onAdminRequest={() => setShowAdmin(true)}
            onHelpRequest={() => setShowHelp(true)}
            onGameStateChange={setCurrentGameState}
          />
          {currentGameState !== 'countdown' && currentGameState !== 'playing' && (
            <HelpButton onClick={() => setShowHelp(true)} />
          )}
        </div>
      </div>
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}

export default App;