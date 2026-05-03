# 自重トレーニング記録アプリ（Workout Log）

## ユーザーへの説明スタイル
- ユーザーはプログラマーではないため、説明は素人にもわかりやすい言葉で行う
- 実装手順を示す際は、Claudeが行うコード変更だけでなく、ユーザーが行う作業も手順として明記する
- 専門用語は避け、必要な場合は補足説明を加える

## 概要
自重トレーニング記録アプリ。HTMLファイル単体で動作し、Googleスプレッドシートにデータを蓄積する。PWA対応済み。

## 公開URL
- アプリ: `https://twoweller-hub.github.io/workoutlog/`
- リポジトリ: GitHub Pages でホスティング（`workoutlog` リポジトリ）

## 使用環境
- Galaxy スマートフォン（PWA としてホーム画面にインストール済み）
- Mac からもブラウザで利用可能
- 両端末から同じ Google スプレッドシートを参照

## 操作フロー
1. 「記録」タブで種目カードの回数・セット数を設定
2. 「記録する」ボタンをタップ → スプレッドシートに送信（楽観的UI）
3. 「履歴」タブで過去の記録を確認・削除
4. 「種目」タブで種目の追加・削除・並び替え

## スプレッドシートの列構成

### 種目リストシート
| 列 | 項目 |
|---|---|
| A列 | 種目名 |
| B列 | 絵文字 |

### 記録シート
| 列 | 項目 |
|---|---|
| A列 | id（タイムスタンプ数値） |
| B列 | 日付（yyyy-MM-dd） |
| C列 | 時刻（HH:mm） |
| D列 | 種目名 |
| E列 | 絵文字 |
| F列 | 回数 |
| G列 | セット数 |
| H列 | 合計回数（回数×セット数） |
| I列 | メモ |

## 技術構成
- フロントエンド: `index.html`（HTML + CSS + JS、1ファイル完結）
- バックエンド: Google Apps Script（`gas/code.gs`）
- データ保存先: Google スプレッドシート
- ライブラリ: SortableJS（CDN）
- レスポンシブ: モバイルはボトムナビ、デスクトップ（640px以上）はサイドバー

## GAS 通信パターン
- **GET（データ読み込み）**: JSONP 方式（CORS制限を回避するため）
  ```javascript
  const cb = 'cb_' + Date.now();
  window[cb] = function(data) { /* 処理 */ };
  script.src = GAS_URL + '?callback=' + cb;
  ```
- **POST（書き込み）**: `mode: 'no-cors'` fetch（レスポンスは読めないが送信は成功する）
  - 楽観的UI: ローカル状態を先に更新し、バックグラウンドでGASに送信

## localStorage の使い方
- `wl_reps`: 種目ごとの前回の回数（`{種目名: 回数}` のオブジェクト）
- `wl_sets`: 種目ごとの前回のセット数
- **あくまでUI補助のみ**。データはすべてスプレッドシートに保存する（マルチデバイス対応）

## Service Worker の fetch 戦略
- `index.html` → **ネットワーク優先**（常に最新を取得、オフライン時のみキャッシュ）
- 画像・マニフェスト → **キャッシュ優先**

## GAS コーディング上の注意
- `getValues()` で取得した日付セルの値は GAS V8 ランタイムで `instanceof Date` が `false` になる
- Date 型の判定は `typeof val.getTime === 'function'` を使うこと（コードで対応済み）

## 重要な設定値
- GAS URL: `index.html` 内の `GAS_URL` 定数に記載（デプロイ後にユーザーが設定する）
- スプレッドシート ID: `gas/code.gs` の `SPREADSHEET_ID` 定数に記載（ユーザーが設定する）
- Service Worker キャッシュバージョン: `sw.js` の `CACHE` 定数で管理（現在 v1）
- アプリ更新時は `CACHE` の値を変更してキャッシュを更新する

## 初回セットアップ手順（ユーザー向け）
1. Google スプレッドシートを新規作成
2. `gas/code.gs` の `SPREADSHEET_ID` にスプレッドシートIDを設定
3. GAS エディタで `setupSpreadsheet()` を実行（シートと初期種目を作成）
4. GAS をウェブアプリとしてデプロイ（全員アクセス可）
5. `index.html` の `GAS_URL` にデプロイURLを設定
6. GitHub の `workoutlog` リポジトリにプッシュ
7. `make_icons.swift` を実行してアイコン画像を生成・コミット
