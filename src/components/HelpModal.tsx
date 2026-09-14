import React from 'react';
import { X } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Step: React.FC<{ icon: string; children: React.ReactNode }> = ({ icon, children }) => (
  <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-3 mb-2">
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center text-lg shadow-sm">
      {icon}
    </div>
    <div className="flex-1 text-gray-700 leading-relaxed pt-1">{children}</div>
  </div>
);

const SectionHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-center font-black text-gray-500 my-4 tracking-wide">
    ── {children} ──
  </div>
);

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-black text-gray-800 mb-2">
            🐱 タイピングたんご！の あそびかた
          </h2>
          <p className="text-gray-600 leading-relaxed mb-2">
            「あいうえお」から 濁音・半濁音・促音まで、ひらがなの たんごを ローマ字で
            うちこむ れんしゅうゲームだよ。せいげん時間の 中で うち終えると、
            ねこと いっしょに ステージクリア！
          </p>

          <SectionHeading>あそびかた</SectionHeading>
          <Step icon="🖱">
            左上の「<b>管理</b>」ボタン（または <b>V キー</b>）で、練習したい行
            （あ行〜わ行・濁音・半濁音・促音）を選ぼう。
          </Step>
          <Step icon="⌨️">
            画面に出てくる たんごを、ローマ字で タイピングしよう。
          </Step>
          <Step icon="⏱">
            制限時間内に うち終えると <b>スコアGET</b>！ 時間切れや まちがいは
            ライフが 1へる。
          </Step>
          <Step icon="💔">
            ライフが 0になると ゲームオーバー。そこまでの スコアが
            <b> ハイスコア</b>に 記録されるよ。
          </Step>
          <Step icon="🏆">
            1つの行で 20問 終えると <b>ステージクリア</b>！
            次の行に進むと、背景も かわるよ。
          </Step>

          <SectionHeading>このゲームの しかけ</SectionHeading>
          <Step icon="🖐️">
            4問に 1回、<b>F と J</b>の ホームポジション練習が まざる。
            指の おきばしょを 体で おぼえよう。
          </Step>
          <Step icon="⚡">
            はやく 正確に うつほど 高得点！ 管理画面の
            「タイムアウト速度」を 上げると、ボーナス倍率も アップするよ。
          </Step>
          <Step icon="👀">
            「ローマ字ヒント」を <b>OFF</b>にすると、スコアが
            <b> 1.5倍</b>に！ ヒント無しで うてるようになったら 挑戦してみよう。
          </Step>
          <Step icon="🔤">
            ローマ字の <b>大文字／小文字</b>も、管理画面から 切りかえできる。
          </Step>
          <Step icon="🌟">
            ハイスコアは ブラウザに 自動で 保存される。次のプレイで
            自己ベスト更新を ねらおう！
          </Step>

          <SectionHeading>管理画面でできること</SectionHeading>
          <Step icon="⚙️">
            練習する行の えらびかた・出題モード（順番通り／ランダム）・
            キーボードの表示・ローマ字ヒント・大文字小文字・タイムアウト速度・
            画面の大きさまで、ぜんぶ この中で 調整できるよ。
          </Step>

          <div className="bg-yellow-50 rounded-xl p-3 text-sm text-gray-700 leading-relaxed mt-4">
            💡 まずは「F」と「J」の 位置を 体で おぼえよう。キーボードを
            見ないで うてるようになるのが、上達の 近道だよ！
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <p className="text-blue-700 text-center font-bold">
              さあ、かわいい猫と いっしょに 楽しく タイピングの 練習を
              はじめよう！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
