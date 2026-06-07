const webpush = require("web-push");
const { readCollection, writeCollection } = require("./storage/collections");

const PUSH_SUBS_KEY = "personal-pro-push-subscriptions-v1";

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

module.exports = {
  getVapidPublicKey,
  isVapidConfigured,
  initWebPush,
  savePushSubscription,
  removePushSubscriptionByEndpoint,
  removePushSubscriptionsByUser,
  sendPushToStudent,
  sendPushToManager
};
