// ゲーム内で使用する画像のパス
const gameImages = [
  `${import.meta.env.BASE_URL}images/cat1.png`,  // スタート画面
  `${import.meta.env.BASE_URL}images/cat4.png`,  // ゲームオーバー
  `${import.meta.env.BASE_URL}images/cat3.png`,  // ステージクリア
  `${import.meta.env.BASE_URL}images/cat2.png`,  // ゲームクリア
];

export const preloadGameImages = (): Promise<void[]> => {
  const loadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  };

  return Promise.all(gameImages.map(loadImage));
};