// Netlify Scheduled Function: processes queued notifications
const admin = require("firebase-admin");

function getAdmin() {
  if (admin.apps && admin.apps.length) return { db: admin.firestore(), messaging: admin.messaging() };
  let json = process.env.FCM_SERVICE_ACCOUNT;
  if (!json && process.env.FCM_SERVICE_ACCOUNT_BASE64) {
    json = Buffer.from(process.env.FCM_SERVICE_ACCOUNT_BASE64, "base64").toString("utf8");
  }
  if (!json) throw new Error("FCM service account not configured");
  const cred = admin.credential.cert(JSON.parse(json));
  admin.initializeApp({ credential: cred });
  return { db: admin.firestore(), messaging: admin.messaging() };
}

exports.handler = async () => {
  const { db, messaging } = getAdmin();
  const now = Date.now();

  const snap = await db.collection("notifications")
    .where("status", "==", "queued")
    .where("scheduledAtUTC", "<=", now)
    .limit(50).get();

  let sent = 0, failed = 0;
  const batch = db.batch();

  for (const doc of snap.docs) {
    const n = doc.data();
    try {
      await messaging.send({
        topic: n.topic,
        notification: { title: n.title || "AlterStudies", body: n.body || "" },
        data: n.data || {}
      });
      batch.update(doc.ref, { status: "sent", sentAt: now });
      sent++;
    } catch (e) {
      batch.update(doc.ref, { status: "failed", error: String(e?.message || e), triedAt: now });
      failed++;
    }
  }
  if (sent + failed > 0) await batch.commit();

  return { statusCode: 200, body: JSON.stringify({ checked: snap.size, sent, failed, now }) };
};
