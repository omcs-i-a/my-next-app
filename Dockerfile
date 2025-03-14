# Node.js 23系の軽量イメージをベースにする
FROM node:23-alpine

# 作業ディレクトリを設定
WORKDIR /app

# package.json と package-lock.json（存在する場合）を先にコピーしてキャッシュを有効活用
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# 残りのソースコードを全てコピー
COPY . .

# Next.js アプリを本番用にビルド
RUN npm run build

# コンテナがリッスンするポート（Next.js はデフォルト3000）
EXPOSE 3000

# 本番サーバーを起動（package.json の "start" スクリプトは "next start" を実行する想定）
CMD ["npm", "run", "start"]

