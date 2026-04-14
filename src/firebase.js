const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;

if (!PROJECT_ID || !API_KEY) {
  console.error(
    "Firebase 환경변수가 설정되지 않았습니다.\n" +
    ".env.example 파일을 참고하여 .env.local 파일을 생성하세요."
  );
}

const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/classroom`;
const DB_ROOT = `projects/${PROJECT_ID}/databases/(default)/documents/classroom`;
const BATCH_GET_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:batchGet?key=${API_KEY}`;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function fromFields(fields) {
  if (!fields) return null;
  const out = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v.stringValue !== undefined) out[k] = v.stringValue;
    else if (v.integerValue !== undefined) out[k] = Number(v.integerValue);
    else if (v.doubleValue !== undefined) out[k] = v.doubleValue;
    else if (v.booleanValue !== undefined) out[k] = v.booleanValue;
  }
  return out;
}

function toFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) continue;
    if (typeof v === "string") fields[k] = { stringValue: v };
    else if (typeof v === "number") fields[k] = Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
    else if (typeof v === "boolean") fields[k] = { booleanValue: v };
  }
  return fields;
}

export async function fetchDoc(docId) {
  const res = await fetch(`${BASE}/${docId}?key=${API_KEY}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`문서 조회 실패 (${docId}): HTTP ${res.status}`);
  const json = await res.json();
  return fromFields(json.fields);
}

export async function batchGetDocs(docIds, { retries = 2 } = {}) {
  const documents = docIds.map(id => `${DB_ROOT}/${id}`);
  let attempt = 0;
  while (true) {
    const res = await fetch(BATCH_GET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documents })
    });
    if (res.ok) {
      const json = await res.json();
      const map = new Map();
      for (const item of json) {
        if (item.found) {
          const name = item.found.name;
          const id = name.slice(name.lastIndexOf("/") + 1);
          map.set(id, fromFields(item.found.fields));
        } else if (item.missing) {
          const id = item.missing.slice(item.missing.lastIndexOf("/") + 1);
          map.set(id, null);
        }
      }
      return docIds.map(id => map.get(id) ?? null);
    }
    if (res.status === 429 && attempt < retries) {
      await sleep(1000 * Math.pow(2, attempt));
      attempt++;
      continue;
    }
    throw new Error(`문서 조회 실패 (batch): HTTP ${res.status}`);
  }
}

export async function saveDoc(docId, data) {
  const res = await fetch(`${BASE}/${docId}?key=${API_KEY}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields: toFields(data) })
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`문서 저장 실패 (${docId}): HTTP ${res.status} ${text}`);
  }
  return res.json();
}
