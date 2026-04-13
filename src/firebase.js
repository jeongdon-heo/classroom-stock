const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;

if (!PROJECT_ID || !API_KEY) {
  console.error(
    "Firebase 환경변수가 설정되지 않았습니다.\n" +
    ".env.example 파일을 참고하여 .env.local 파일을 생성하세요."
  );
}

const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/classroom`;

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
