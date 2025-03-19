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

# 本番環境用の環境変数設定行を削除
# RUN cp .env.production .env

# Prismaクライアントを生成
RUN npx prisma generate

# 本番用に Next.js アプリをビルド（変更がない場合はキャッシュが有効）
RUN npm run build

# コンテナがリッスンするポート（Next.js はデフォルト3000）
EXPOSE 3000

# 起動スクリプトを作成
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'npx prisma migrate deploy' >> /app/start.sh && \
    echo 'npm run start' >> /app/start.sh && \
    chmod +x /app/start.sh

# 本番サーバーを起動（マイグレーションを実行してからサーバーを起動）
CMD ["/app/start.sh"]
