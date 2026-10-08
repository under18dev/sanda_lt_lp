To install dependencies:
```sh
bun install
```

To run the development server and rebuild browser assets:
```sh
bun run dev
```

Open http://localhost:3000

To type-check and build the client assets:
```sh
bun run typecheck
bun run build
```

Available pages:

- `/`
- `/timetable`
- `/speakers`
- `/access`
- `/faq`
- `/sessions/:id`
- `/speakers/:id`

## Docker and Cloudflare Tunnel

The production container serves the Hono app on port `3000`. `cloudflared` runs as a separate Compose service and connects to the `web` service through the internal Docker network.

Each client asset build generates `dist/asset-version.txt`. The app adds this version to its CSS and JavaScript URLs so a newly built Docker image uses fresh cache keys. If Docker reuses the cached asset build layer, the assets and their version remain unchanged. Use `docker compose build --no-cache web` to force a fresh build of otherwise unchanged sources.

Copy `.env.example` to `.env`, set the dashboard-managed Cloudflare Tunnel token, and configure the public hostname origin as `http://web:3000` in Cloudflare Zero Trust.

```sh
cp .env.example .env
docker compose up -d --build
```

Productionでは`.env`の`DATA_DIR`をGit checkoutの外側に設定してください。今回のサーバーでは、`/home/unischool/sanda_lt/data`を使用します。

```sh
mkdir -p /home/unischool/sanda_lt/data/{uploads/speakers,uploads/event,ogp}
sudo chown -R "$(id -u):$(id -g)" /home/unischool/sanda_lt/data
```

`.env`の`DATA_DIR`、`ADMIN_PASSWORD_HASH`、`SESSION_SECRET`は必須です。未設定のまま起動すると、Composeが停止して初期DBを作ることもありません。

> **重要（podman / rootlessで必須）**: 上の`chown`を省くとコンテナが`/app/data`へ書き込めず、起動直後に`SQLITE_CANTOPEN`でクラッシュして`unhealthy`になります（`dependency failed to start: container ... is unhealthy`）。
>
> rootless podmanではコンテナ内の`root`がpodmanを実行するホストユーザーにマップされるため、`sudo mkdir`で作ったroot所有のディレクトリには書き込めません。データディレクトリをデプロイ実行ユーザー所有にしておく必要があります。Docker Desktopではコンテナがrootで動きマウントも書き込み可能なため、この問題は表面化しません。

管理画面のパスワードは平文ではなく、Bunでハッシュを生成して設定します。

```sh
bun -e "console.log(await Bun.password.hash(process.argv[1]))" 'change-this-password'
```

出力された値を`ADMIN_PASSWORD_HASH`へ、ランダムな長い値を`SESSION_SECRET`へ設定してください。管理画面は`/admin`です。

Do not commit `.env` or the tunnel token.

## MCP管理サーバー

イベント情報をAIクライアントから編集するためのstdio MCPサーバーを用意しています。公開Webコンテナには`MCP_API_TOKEN`で保護した管理APIを追加し、ローカルのMCPプロセスがそこへ接続します。

`.env`にはWebコンテナ側とMCPクライアント側で同じ長いランダム値を設定します。

```env
MCP_API_TOKEN=replace-with-a-long-random-token
```

ローカルのMCPクライアント設定例：

```json
{
  "mcpServers": {
    "sanda-lt-admin": {
      "command": "bun",
      "args": ["run", "/absolute/path/to/sanda_lt/landing/src/mcp-server.ts"],
      "env": {
        "SANDA_MCP_URL": "https://sglt.under18.dev",
        "SANDA_MCP_TOKEN": "同じMCP_API_TOKEN"
      }
    }
  }
}
```

イベント情報、セッションの追加・更新・削除・並べ替え、登壇者、FAQ、スポンサーの取得・更新に対応しています。画像アップロードは初期版では管理画面から行います。

## Admin and persistent uploads

登壇者やセッションは`/admin`から編集できます。画像は`/app/data/uploads`へWebPとして保存され、SQLiteの`event.db`にはファイルパスだけが保存されます。コンテナの再作成やGit更新では`/opt/sanda-lt/data`は削除されません。

## Automatic deployment and backup

サーバー側で5分ごとにGitHubの`main`を確認するsystemd timerを利用できます。

```sh
sudo cp deploy/sanda-lt-update.service deploy/sanda-lt-update.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now sanda-lt-update.timer
```

`deploy/pull-and-deploy.sh`は変更がある場合だけWebイメージを更新し、`/healthz`で確認します。cloudflaredは再起動しません。`deploy/backup.sh`はDB・画像・OGPをバックアップします。

## Speaker images and OGP

Place speaker assets under `public/images/`, then edit the matching speaker in `src/data/speakers.ts`:

```ts
{
  id: 'macchatee',
  // ...
  icon: '/images/speakers/macchatee.webp',
  ogpImage: '/images/ogp/speakers/macchatee.png',
}
```

`icon` is used in speaker cards and detail pages. `ogpImage` is used as the `og:image` and Twitter image for `/speakers/:id`. Paths are relative to `public/`, so rebuilding the site after editing the data automatically includes the new assets.

Pages without a page-specific OGP use `public/assets/ogp.jpg` via `event.defaultOgpImage`. The top page continues to use the generated speaker-based OGP at `public/ogp/event.png`.

The event top page OGP is generated from the same 1200x630 visual system as the speaker OGP generator. The selected speaker images are placed in the icon cards and the main speaker image. Change `event.ogpSpeakerIds` in `src/data/event.ts` to change the composition, then run `bun run generate:ogp` or `bun run build`.
