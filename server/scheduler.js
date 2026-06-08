const { readCollection } = require("./storage/collections");
const {
  getAllNotificationPrefs,
  sendPushToManagerByTrainerId,
  wasNotificationSent,
  markNotificationSent
} = require("./push");

const STUDENTS_KEY = "personal-pro-students-v2";
const SESSIONS_KEY = "personal-pro-training-sessions-v1";
const PAYMENTS_KEY = "personal-pro-payments-v1";

async function runNotificationChecks() {
  try {
    const [allPrefs, allStudents, allSessions, allPayments] = await Promise.all([
      getAllNotificationPrefs(),
      readCollection(STUDENTS_KEY, []),
      readCollection(SESSIONS_KEY, []),
      readCollection(PAYMENTS_KEY, [])
    ]);

    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    for (const prefs of allPrefs) {
      const { trainerId } = prefs;
      const students = allStudents.filter((s) => s.trainerId === trainerId && s.status !== "inactive");

      if (prefs.checkinPending?.enabled) {
        const daysWithout = Math.max(1, Number(prefs.checkinPending.daysWithout || 7));
        const cutoff = new Date(today);
        cutoff.setDate(cutoff.getDate() - daysWithout);
        const cutoffStr = cutoff.toISOString().slice(0, 10);

        for (const student of students) {
          const lastSession = allSessions
            .filter((s) => s.studentId === student.id && s.finishedAt)
            .sort((a, b) => b.finishedAt.localeCompare(a.finishedAt))[0];

          const lastDate = lastSession ? lastSession.finishedAt.slice(0, 10) : null;
          if (!lastDate || lastDate < cutoffStr) {
            const key = `checkin-${trainerId}-${student.id}-${todayStr}`;
            if (!(await wasNotificationSent(key))) {
              const daysSince = lastDate
                ? Math.floor((today - new Date(lastDate)) / 86400000)
                : daysWithout;
              await sendPushToManagerByTrainerId(trainerId, {
                title: "Check-in pendente",
                body: `${student.name || "Aluno"} não treina há ${daysSince} dia${daysSince !== 1 ? "s" : ""}.`,
                url: "/"
              });
              await markNotificationSent(key);
            }
          }
        }
      }

      if (prefs.paymentDueSoon?.enabled) {
        const daysBefore = Math.max(1, Number(prefs.paymentDueSoon.daysBefore || 3));
        const limit = new Date(today);
        limit.setDate(limit.getDate() + daysBefore);
        const limitStr = limit.toISOString().slice(0, 10);

        const dueSoon = allPayments.filter(
          (p) => p.trainerId === trainerId && !p.paidAt && p.dueDate >= todayStr && p.dueDate <= limitStr
        );

        for (const payment of dueSoon) {
          const key = `paydue-${trainerId}-${payment.id}-${todayStr}`;
          if (!(await wasNotificationSent(key))) {
            const student = students.find((s) => s.id === payment.studentId);
            await sendPushToManagerByTrainerId(trainerId, {
              title: "Mensalidade vencendo",
              body: `${student?.name || "Aluno"}: vence em ${payment.dueDate}.`,
              url: "/"
            });
            await markNotificationSent(key);
          }
        }
      }

      if (prefs.paymentOverdue?.enabled) {
        const overdue = allPayments.filter(
          (p) => p.trainerId === trainerId && !p.paidAt && p.dueDate && p.dueDate < todayStr
        );

        for (const payment of overdue) {
          const key = `payover-${trainerId}-${payment.id}-${todayStr}`;
          if (!(await wasNotificationSent(key))) {
            const student = students.find((s) => s.id === payment.studentId);
            const daysLate = Math.floor((today - new Date(payment.dueDate)) / 86400000);
            await sendPushToManagerByTrainerId(trainerId, {
              title: "Mensalidade atrasada",
              body: `${student?.name || "Aluno"}: ${daysLate} dia${daysLate !== 1 ? "s" : ""} em atraso.`,
              url: "/"
            });
            await markNotificationSent(key);
          }
        }
      }
    }
  } catch (_err) {
    // silencia erros para não derrubar o servidor
  }
}

function initScheduler() {
  // aguarda 1 min no boot, depois roda a cada hora
  setTimeout(() => {
    runNotificationChecks();
    setInterval(runNotificationChecks, 60 * 60 * 1000);
  }, 60 * 1000);
}

module.exports = { initScheduler };
