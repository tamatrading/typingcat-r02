import React from 'react';
import { X, HelpCircle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="w-8 h-8 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-800">タイピングたんご！の遊び方</h2>
          </div>

          <div className="space-y-6">
            <section>
              <h3 className="text-xl font-bold text-gray-700 mb-3">🎮 基本的な遊び方</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• まず左上の「管理」ボタンから、練習したい行を選んでください</li>
                <li>• 画面に表示される文字をキーボードで入力しましょう</li>
                <li>• 制限時間内に正しく入力できるとスコアが加算されます</li>
                <li>• 時間切れになるとライフが減ります</li>
                <li>• ライフが0になるとゲームオーバーです</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold text-gray-700 mb-3">💡 初心者向けのコツ</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• まずは「F」と「J」の位置を覚えましょう</li>
                <li>• キーボードを見ないで打てるようになることが上達のコツです</li>
                <li>• 正確に打つことを意識して、徐々にスピードを上げていきましょう</li>
                <li>• 疲れたら休憩を取ることも大切です</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold text-gray-700 mb-3">⚡ 上級者向けのテクニック</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• 早く正確に入力するほど高得点が獲得できます</li>
                <li>• 連続で成功すると高得点につながります</li>
                <li>• 管理画面でステージや難易度を調整できます</li>
                <li>• ハイスコアを目指して練習を重ねましょう</li>
              </ul>
            </section>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-700 text-center">
                さあ、かわいい猫と一緒に楽しくタイピングの練習を始めましょう！
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;