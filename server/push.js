const webpush = require("web-push");
const { readCollection, writeCollection } = require("./storage/collections");

const PUSH_SUBS_KEY = "personal-pro-push-subscriptions-v1";
const NOTIF_PREFS_KEY = "personal-pro-notification-prefs-v1";
const NOTIF_SENT_KEY = "personal-pro-notification-sent-v1";

function getVapidPublicKey() {
  return process.env.VAPID_PUBLIC_KEY || "";
}

function isVapidConfigured() {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT);
}

function initWebPush() {
  if (!isVapidConfigured()) return;
  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  } catch (_error) {
    // silencia erro de VAPID inválido em dev
  }
}

async function savePushSubscription(sub) {
  const subs = await readCollection(PUSH_SUBS_KEY, []);
  const idx = subs.findIndex((s) => s.endpoint === sub.endpoint);
  if (idx >= 0) {
    subs[idx] = { ...subs[idx], ...sub, updatedAt: new Date().toISOString() };
  } else {
    subs.push({ ...sub, createdAt: new Date().toISOString() });
  }
  await writeCollection(PUSH_SUBS_KEY, subs);
}

async function removePushSubscriptionByEndpoint(endpoint) {
  const subs = await readCollection(PUSH_SUBS_KEY, []);
  await writeCollection(PUSH_SUBS_KEY, subs.filter((s) => s.endpoint !== endpoint));
}

async function removePushSubscriptionsByUser(userId, role) {
  const subs = await readCollection(PUSH_SUBS_KEY, []);
  await writeCollection(PUSH_SUBS_KEY, subs.filter((s) => !(s.userId === userId && s.role === role)));
}

async function sendToSubscription(sub, payload) {
  try {
    await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, JSON.stringify(payload));
  } catch (err) {
    if (err.statusCode === 410 || err.statusCode === 404) {
      await removePushSubscriptionByEndpoint(sub.endpoint).catch(() => {});
    }
  }
}

async function sendPushToStudent(studentId, payload) {
  if (!isVapidConfigured()) return;
  const subs = await readCollection(PUSH_SUBS_KEY, []);
  const targets = subs.filter((s) => s.studentId === studentId && s.role === "student");
  await Promise.all(targets.map((sub) => sendToSubscription(sub, payload)));
}

async function sendPushToManager(payload) {
  if (!isVapidConfigured()) return;
  const subs = await readCollection(PUSH_SUBS_KEY, []);
  const targets = subs.filter((s) => s.role === "manager");
  await Promise.all(targets.map((sub) => sendToSubscription(sub, payload)));
}

async function getNotificationPrefs(trainerId) {
  const all = await readCollection(NOTIF_PREFS_KEY, []);
  const found = all.find((p) => p.trainerId === trainerId);
  return found || {
    trainerId,
    checkinPending: { enabled: false, daysWithout: 7 },
    paymentDueSoon: { enabled: false, daysBefore: 3 },
    paymentOverdue: { enabled: false }
  };
}

async function saveNotificationPrefs(trainerId, prefs) {
  const all = await readCollection(NOTIF_PREFS_KEY, []);
  const idx = all.findIndex((p) => p.trainerId === trainerId);
  const record = {
    trainerId,
    checkinPending: {
      enabled: Boolean(prefs?.checkinPending?.enabled),
      daysWithout: Math.max(1, Math.min(30, Number(prefs?.checkinPending?.daysWithout || 7)))
    },
    paymentDueSoon: {
      enabled: Boolean(prefs?.paymentDueSoon?.enabled),
      daysBefore: Math.max(1, Math.min(14, Number(prefs?.paymentDueSoon?.daysBefore || 3)))
    },
    paymentOverdue: { enabled: Boolean(prefs?.paymentOverdue?.enabled) },
    updatedAt: new Date().toISOString()
  };
  if (idx >= 0) all[idx] = record;
  else all.push(record);
  await writeCollection(NOTIF_PREFS_KEY, all);
}

async function getAllNotificationPrefs() {
  return readCollection(NOTIF_PREFS_KEY, []);
}

async function sendPushToManagerByTrainerId(trainerId, payload) {
  if (!isVapidConfigured()) return;
  const subs = await readCollection(PUSH_SUBS_KEY, []);
  const targets = subs.filter((s) => s.role === "manager" && s.userId === trainerId);
  await Promise.all(targets.map((sub) => sendToSubscription(sub, payload)));
}

async function wasNotificationSent(key) {
  const log = await readCollection(NOTIF_SENT_KEY, []);
  return log.some((e) => e.key === key);
}

async function markNotificationSent(key) {
  const log = await readCollection(NOTIF_SENT_KEY, []);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffStr = cutoff.toISOString();
  const cleaned = log.filter((e) => e.sentAt >= cutoffStr);
  cleaned.push({ key, sentAt: new Date().toISOString() });
  await writeCollection(NOTIF_SENT_KEY, cleaned);
}

module.exports = {
  getVapidPublicKey,
  isVapidConfigured,
  initWebPush,
  savePushSubscription,
  removePushSubscriptionByEndpoint,
  removePushSubscriptionsByUser,
  sendPushToStudent,
  sendPushToManager,
  getNotificationPrefs,
  saveNotificationPrefs,
  getAllNotificationPrefs,
  sendPushToManagerByTrainerId,
  wasNotificationSent,
  markNotificationSent
};
