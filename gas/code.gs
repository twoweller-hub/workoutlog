const SPREADSHEET_ID = '1-YP6ZvOeyjoT3BkmRgZwUDiLt48Rb94CzwRNFasIIrs';
const EXERCISES_SHEET = '種目リスト';
const RECORDS_SHEET = '記録';

function doGet(e) {
  const callback = e.parameter.callback || 'callback';
  try {
    const data = getData();
    const json = JSON.stringify(data);
    return ContentService.createTextOutput(callback + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } catch (err) {
    const json = JSON.stringify({ error: err.message });
    return ContentService.createTextOutput(callback + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    if (action === 'addRecord') return addRecord(data);
    if (action === 'updateRecord') return updateRecord(data);
    if (action === 'deleteRecord') return deleteRecord(data);
    if (action === 'addExercise') return addExercise(data);
    if (action === 'updateExercise') return updateExercise(data);
    if (action === 'deleteExercise') return deleteExercise(data);
    if (action === 'reorderExercises') return reorderExercises(data);
    return errorResponse('Unknown action: ' + action);
  } catch (err) {
    return errorResponse(err.message);
  }
}

function getData() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const exSheet = ss.getSheetByName(EXERCISES_SHEET);
  const exData = exSheet.getDataRange().getValues();
  const exercises = [];
  for (let i = 1; i < exData.length; i++) {
    if (exData[i][0]) {
      exercises.push({ name: String(exData[i][0]), emoji: String(exData[i][1] || ''), unit: String(exData[i][2] || '回') });
    }
  }

  const recSheet = ss.getSheetByName(RECORDS_SHEET);
  const recData = recSheet.getDataRange().getValues();
  const records = [];
  for (let i = 1; i < recData.length; i++) {
    if (!recData[i][0]) continue;
    const rawDate = recData[i][1];
    const dateStr = (typeof rawDate.getTime === 'function')
      ? Utilities.formatDate(rawDate, 'Asia/Tokyo', 'yyyy-MM-dd')
      : String(rawDate);
    const rawTime = recData[i][2];
    const timeStr = (typeof rawTime.getTime === 'function')
      ? Utilities.formatDate(rawTime, 'Asia/Tokyo', 'HH:mm')
      : String(rawTime);
    records.push({
      id: Number(recData[i][0]),
      date: dateStr,
      time: timeStr,
      name: String(recData[i][3] || ''),
      emoji: String(recData[i][4] || ''),
      reps: Number(recData[i][5] || 0),
      sets: Number(recData[i][6] || 0),
      totalReps: Number(recData[i][7] || 0),
      memo: String(recData[i][8] || '')
    });
  }

  const today = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd');
  const todayCount = records.filter(r => r.date === today).length;
  const totalCount = records.length;

  const dateSet = new Set(records.map(r => r.date));
  let streak = 0;
  const d = new Date();
  if (!dateSet.has(today)) d.setDate(d.getDate() - 1);
  for (let i = 0; i < 3650; i++) {
    const ds = Utilities.formatDate(d, 'Asia/Tokyo', 'yyyy-MM-dd');
    if (!dateSet.has(ds)) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }

  return { exercises, records, stats: { todayCount, totalCount, streak } };
}

function addRecord(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(RECORDS_SHEET);
  sheet.appendRow([
    data.id, data.date, data.time,
    data.name, data.emoji,
    data.reps, data.sets, data.totalReps,
    data.memo || ''
  ]);
  return okResponse();
}

function updateRecord(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(RECORDS_SHEET);
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(data.id)) {
      sheet.getRange(i + 1, 6, 1, 4).setValues([[data.reps, data.sets, data.totalReps, data.memo || '']]);
      break;
    }
  }
  return okResponse();
}

function deleteRecord(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(RECORDS_SHEET);
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(data.id)) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
  return okResponse();
}

function addExercise(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(EXERCISES_SHEET);
  sheet.appendRow([data.name, data.emoji || '', data.unit || '回']);
  return okResponse();
}

function updateExercise(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(EXERCISES_SHEET);
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(data.name)) {
      sheet.getRange(i + 1, 2, 1, 2).setValues([[data.emoji || '', data.unit || '回']]);
      break;
    }
  }
  return okResponse();
}

function deleteExercise(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(EXERCISES_SHEET);
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(data.name)) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
  return okResponse();
}

function reorderExercises(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(EXERCISES_SHEET);
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) sheet.deleteRows(2, lastRow - 1);
  data.exercises.forEach(ex => sheet.appendRow([ex.name, ex.emoji || '', ex.unit || '回']));
  return okResponse();
}

function okResponse() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(msg) {
  return ContentService.createTextOutput(JSON.stringify({ error: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}

function setupSpreadsheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  let exSheet = ss.getSheetByName(EXERCISES_SHEET);
  if (!exSheet) exSheet = ss.insertSheet(EXERCISES_SHEET);
  exSheet.clearContents();
  exSheet.appendRow(['種目名', '絵文字']);
  exSheet.appendRow(['スクワット', '🦵']);
  exSheet.appendRow(['カーフレイズ', '🦶']);
  exSheet.appendRow(['クランチ', '🔥']);

  let recSheet = ss.getSheetByName(RECORDS_SHEET);
  if (!recSheet) recSheet = ss.insertSheet(RECORDS_SHEET);
  recSheet.clearContents();
  recSheet.appendRow(['id', '日付', '時刻', '種目名', '絵文字', '回数', 'セット数', '合計回数', 'メモ']);

  Logger.log('セットアップ完了');
}
