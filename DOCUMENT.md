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
2. 画面左側に「コード.gs」というファイルが表示されているので、その中身をすべて削除する
3. `gas/code.gs` の内容をすべてコピーして貼り付ける
4. 貼り付けたコードの1行目にある `SPREADSHEET_ID` の値を、Step 1 でコピーしたIDに書き換える
   ```
   const SPREADSHEET_ID = '（ここにスプレッドシートIDを貼り付ける）';
   ```
5. 画面上部の保存ボタン（フロッピーディスクのアイコン）をクリックして保存する

---

## Step 3: setupSpreadsheet を実行する

スプレッドシートに必要なシートと初期データを作成します。

1. Apps Script エディタの画面上部中央に、関数名が表示されるプルダウンがある
   - 最初は「関数を選択」や「doGet」などと表示されている
2. そのプルダウンをクリックして、一覧から「**setupSpreadsheet**」を選ぶ
3. 選んだら左隣の「▶ 実行」ボタン（三角形のボタン）をクリックする
4. 「承認が必要です」という画面が出たら：
   - 「権限を確認」をクリック
   - Google アカウントを選択
   - 「詳細」→「Workout Log（安全ではないページ）に移動」をクリック
   - 「許可」をクリック
5. 実行が完了すると、スプレッドシートに「種目リスト」「記録」の2つのシートが作成される

---

## Step 4: GAS をウェブアプリとしてデプロイする

1. Apps Script エディタの右上にある青い「**デプロイ**」ボタンをクリック
2. 表示されたメニューから「**新しいデプロイ**」を選ぶ
3. 「種類の選択」の歯車アイコンをクリック → 「**ウェブアプリ**」を選ぶ
4. 以下のように設定する：
   - 説明: 任意（例: Workout Log v1）
   - 次のユーザーとして実行: **自分**
   - アクセスできるユーザー: **全員**
5. 「デプロイ」ボタンをクリック
6. 「ウェブアプリの URL」として表示された長いURL（`https://script.google.com/macros/s/...` で始まる）をコピーしておく

---

## Step 5: index.html に GAS URL を設定する

`index.html` をテキストエディタで開き、以下の行を書き換える:

```javascript
const GAS_URL = 'YOUR_GAS_URL';
```
↓
```javascript
const GAS_URL = 'https://script.google.com/macros/s/【Step4でコピーしたURL】/exec';
```

---

## Step 6: アイコン画像を生成する

ターミナルで以下を実行（workoutlog フォルダ内で）:

```
swift make_icons.swift
```

`icon-192.png` と `icon-512.png` が生成される。

---

## Step 7: GitHub にアップロードする

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

3. GitHub のリポジトリページで「Settings」→「Pages」を開く
4. 「Branch」のプルダウンで「main」を選び、その右のプルダウンで「/ (root)」を選んで「Save」
5. 数分後に `https://twoweller-hub.github.io/workoutlog/` でアクセスできるようになる

---

## Step 8: PWA としてホーム画面に追加する（Galaxy の場合）

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

GAS を修正した場合は、以下の手順で再デプロイしないと変更が反映されない：

1. Apps Script エディタ右上の青い「**デプロイ**」ボタンをクリック
2. 「**デプロイを管理**」を選ぶ
3. 表示されたデプロイの右側にある鉛筆アイコン（編集）をクリック
4. 「バージョン」のプルダウンで「**新しいバージョン**」を選ぶ
5. 「デプロイ」をクリック

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
