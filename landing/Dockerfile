FROM oven/bun:1

WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends fontconfig fonts-noto-cjk \
  && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["bun", "run", "start"]
