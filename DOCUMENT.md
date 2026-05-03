# Workout Log セットアップガイド

自重トレーニング記録アプリを使えるようにするための手順書です。

---

## 必要なもの
- Google アカウント
- GitHub アカウント（ユーザー名: `twoweller-hub`）
- Mac（アイコン生成用）

---

## Step 1: Google スプレッドシートを作成する

1. [Google スプレッドシート](https://sheets.google.com) を開き、新規スプレッドシートを作成
2. 名前は「Workout Log」など任意でOK
3. URL の `/d/` と `/edit` の間にある文字列をコピーしておく  
   例: `https://docs.google.com/spreadsheets/d/1-YP6ZvOeyjoT3BkmRgZwUDiLt48Rb94CzwRNFasIIrs/edit`  
   → これが**スプレッドシートID**

---

## Step 2: Google Apps Script を設定する

1. スプレッドシートのメニューから「拡張機能」→「Apps Script」を開く
2. エディタ左側の `コード.gs` を削除し、`gas/code.gs` の内容をすべて貼り付ける
3. 1行目の `YOUR_SPREADSHEET_ID` を Step 1 でコピーしたスプレッドシートIDに書き換える  
   ```
   const SPREADSHEET_ID = '12pZVt7aGA5NzBeRZN...（実際のID）';
   ```
4. 上部の関数選択プルダウンで `setupSpreadsheet` を選び、▶ 実行ボタンをクリック
   - 「権限を確認」→「許可」で進む
   - スプレッドシートに「種目リスト」「記録」の2シートが作成され、初期種目が追加される

---

## Step 3: GAS をウェブアプリとしてデプロイする

1. Apps Script エディタ右上の「デプロイ」→「新しいデプロイ」をクリック
2. 種類: **ウェブアプリ**
3. 設定:
   - 説明: 任意（例: Workout Log v1）
   - 次のユーザーとして実行: **自分**
   - アクセスできるユーザー: **全員**
4. 「デプロイ」をクリック → 表示されたURLをコピー（`https://script.google.com/macros/s/...` で始まる長いURL）

---

## Step 4: index.html に GAS URL を設定する

`index.html` をテキストエディタで開き、以下の行を書き換える:

```javascript
const GAS_URL = 'YOUR_GAS_URL';
```
↓
```javascript
const GAS_URL = 'https://script.google.com/macros/s/【Step3でコピーしたURL】/exec';
```

---

## Step 5: アイコン画像を生成する

ターミナルで以下を実行（workoutlog フォルダ内で）:

```
swift make_icons.swift
```

`icon-192.png` と `icon-512.png` が生成される。

---

## Step 6: GitHub にアップロードする

1. GitHub で `workoutlog` という名前のリポジトリを新規作成
   - 「Add a README file」はチェックしない
2. ターミナルで workoutlog フォルダに移動し、以下を実行:

```bash
git init
git add index.html sw.js manifest.webmanifest icon-192.png icon-512.png gas/code.gs
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/twoweller-hub/workoutlog.git
git push -u origin main
```

3. GitHub のリポジトリページで「Settings」→「Pages」→ Source を `main` ブランチ・`/ (root)` に設定
4. 数分後に `https://twoweller-hub.github.io/workoutlog/` でアクセスできるようになる

---

## Step 7: PWA としてホーム画面に追加する（Galaxy の場合）

1. Galaxy の Chrome ブラウザで `https://twoweller-hub.github.io/workoutlog/` を開く
2. 右上メニュー（⋮）→「ホーム画面に追加」
3. 名前は「WorkoutLog」のまま「追加」

---

## アプリを更新したとき

`index.html` を変更して GitHub にプッシュした場合:

1. `sw.js` の1行目のキャッシュバージョンを変更する（例: `v1` → `v2`）
2. `index.html` と `sw.js` を一緒にコミット・プッシュ
3. Galaxy で PWA を再度開くと自動的に新しいバージョンが反映される

---

## GAS のコードを変更したとき

GAS を修正した場合、**「デプロイ」→「デプロイを管理」→「編集（鉛筆アイコン）」→「バージョン: 新しいバージョン」** でデプロイを更新する。  
（再デプロイしないと変更が反映されない）

---

## スプレッドシートの構成

### 種目リストシート
| A列 | B列 |
|---|---|
| 種目名 | 絵文字 |
| スクワット | 🦵 |
| カーフレイズ | 🦶 |
| クランチ | 🔥 |

### 記録シート
| A列 | B列 | C列 | D列 | E列 | F列 | G列 | H列 | I列 |
|---|---|---|---|---|---|---|---|---|
| id | 日付 | 時刻 | 種目名 | 絵文字 | 回数 | セット数 | 合計回数 | メモ |
