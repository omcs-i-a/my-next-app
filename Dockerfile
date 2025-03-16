# 開発中は本番ビルドは不要なので、Dockerfile は本番用として利用し、
# 開発中は docker-compose.yml のホットリロード環境を利用します。

# Node.js 23系の軽量な Alpine イメージを使用
FROM node:23-alpine

# 作業ディレクトリを /app に設定
WORKDIR /app

# package.json と package-lock.json を先にコピー（依存関係のキャッシュ利用のため）
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# 残りのソースコードを全てコピー
COPY . .

# Prismaクライアントを生成
RUN npx prisma generate

# 本番用に Next.js アプリをビルド（変更がない場合はキャッシュが有効）
RUN npm run build

# コンテナがリッスンするポート（Next.js はデフォルト3000）
EXPOSE 3000

# 本番サーバーを起動（"npm run start" は next start を実行する前提）
CMD ["npm", "run", "start"]
