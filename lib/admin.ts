import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

let app: App | undefined;

function getCred() {
  let json = process.env.FCM_SERVICE_ACCOUNT;
  if (!json && process.env.FCM_SERVICE_ACCOUNT_BASE64) {
    json = Buffer.from(process.env.FCM_SERVICE_ACCOUNT_BASE64, "base64").toString("utf8");
  }
  if (!json) throw new Error("FCM service account not set");
  return cert(JSON.parse(json));
}

if (!getApps().length) {
  app = initializeApp({ credential: getCred() });
} else {
  app = getApps()[0]!;
}

export const adminDb = getFirestore(app);
export const adminMessaging = getMessaging(app);
