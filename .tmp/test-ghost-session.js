const { chromium } = require("playwright");

const STUDENT = {
  id: "s-test",
  trainerId: "trainer-demo",
  name: "Teste Aluno",
  email: "teste@aluno.com",
  passwordHash: "fnv1a:8ccdb1fa", // Teste@2026
  hasPassword: true,
  accessStatus: "active",
  status: "active",
  goal: "Hipertrofia",
  createdAt: "2026-01-01T10:00:00.000Z"
};

const EXERCISE = {
  id: "ex1",
  trainerId: "trainer-demo",
  name: "Supino Reto",
  muscle: "Peito",
  status: "active"
};

const WORKOUT = {
  id: "w1",
  trainerId: "trainer-demo",
  studentId: "s-test",
  title: "Treino A",
  goal: "Hipertrofia",
  status: "published",
  updatedAt: "2026-06-01T10:00:00.000Z",
  exercises: [
    { id: "we1", exerciseId: "ex1", order: 1, sets: 2, targetReps: "10", suggestedLoad: "20", restSeconds: 30, coachNotes: "" }
  ]
};

// Rows congeladas pre-fix do snapshot: sem exerciseName/exerciseMuscle, nome cru.
function buildSession(startedAtIso) {
  return {
    id: "session-draft-ghost",
    trainerId: "trainer-demo",
    studentId: "s-test",
    workoutId: "w1",
    activityId: "",
    startedAt: startedAtIso,
    exercises: [
      {
        workoutExerciseId: "we1",
        exerciseId: "ex1",
        name: "Exercício",
        targetReps: "10",
        suggestedLoad: "20",
        restSeconds: 30,
        coachNotes: "",
        sets: [
          { index: 1, status: "pending", load: "", reps: "", volumeLoad: 0, startedAt: "", finishedAt: "" },
          { index: 2, status: "pending", load: "", reps: "", volumeLoad: 0, startedAt: "", finishedAt: "" }
        ]
      }
    ]
  };
}

// Contrato assinado para nao cair no gate de primeiro acesso.
const CONTRACT = {
  id: "c1",
  trainerId: "trainer-demo",
  studentId: "s-test",
  title: "Contrato Teste",
  status: "signed",
  signedAt: "2026-05-01T10:00:00.000Z",
  createdAt: "2026-05-01T10:00:00.000Z"
};

async function seed(page, session) {
  await page.evaluate(({ student, exercise, workout, contract, sess }) => {
    localStorage.clear();
    localStorage.setItem("personal-pro-students-v2", JSON.stringify([student]));
    localStorage.setItem("personal-pro-exercises-v1", JSON.stringify([exercise]));
    localStorage.setItem("personal-pro-workouts-v3", JSON.stringify([workout]));
    localStorage.setItem("personal-pro-contracts-v1", JSON.stringify([contract]));
    if (sess) localStorage.setItem("personal-pro-active-session-v1", JSON.stringify(sess));
  }, { student: STUDENT, exercise: EXERCISE, workout: WORKOUT, contract: CONTRACT, sess: session });
}



async function loginAsStudent(page) {
  await page.waitForSelector("#loginView:not([hidden])", { timeout: 8000 });
  await page.fill("#email", "teste@aluno.com");
  await page.fill("#password", "Teste@2026");
  await page.click("#loginForm button[type=submit]");
  await page.waitForSelector("#studentView:not([hidden])", { timeout: 10000 });
}

(async () => {
  let fail = 0;
  const check = (label, ok) => { console.log(`${ok ? "PASS" : "FAIL"} - ${label}`); if (!ok) fail += 1; };

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on("pageerror", (err) => console.error("[page error]", err.message));
  // Forca fallback local: bloqueia API local e remota
  await page.route(/\/api\//, (route) => route.abort());

  await page.goto("http://localhost:3000/");
  await page.waitForTimeout(500);

  // ===== Cenario A: sessao fantasma (3 dias atras) =====
  const old = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  await seed(page, buildSession(old));
  await page.reload();
  await loginAsStudent(page);
  await page.waitForTimeout(800);

  check("A: Inicio mostra dashboard (nao execucao)", Boolean(await page.$(".dashboard-home")) && !(await page.$(".execution-screen")));
  check("A: sem banner de treino em andamento", !(await page.$(".active-session-banner")));
  const storedA = await page.evaluate(() => localStorage.getItem("personal-pro-active-session-v1"));
  check("A: sessao fantasma removida do localStorage", storedA === null);

  // ===== Cenario B: sessao recente com rows congeladas =====
  const recent = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  await seed(page, buildSession(recent));
  await page.reload();
  await loginAsStudent(page);
  await page.waitForTimeout(800);

  check("B: Inicio mostra dashboard (nao execucao)", Boolean(await page.$(".dashboard-home")) && !(await page.$(".execution-screen")));
  const banner = await page.$(".active-session-banner");
  check("B: banner de treino em andamento presente", Boolean(banner));
  const bannerText = banner ? await banner.innerText() : "";
  check("B: banner mostra titulo e 0 de 2 series", bannerText.includes("Treino A") && bannerText.includes("0 de 2"));

  // Retomar abre a execucao na aba Treinos
  await page.click(".active-session-banner .asb-resume");
  await page.waitForTimeout(600);
  check("B: Retomar abre tela de execucao", Boolean(await page.$(".execution-screen")));
  const execText = await page.$eval("#studentContent", (el) => el.innerText);
  check("B: backfill do nome (Supino Reto, sem 'Exercício' cru)", execText.includes("Supino Reto"));
  const activeTab = await page.$eval("#studentBottomNav .is-active, [data-student-nav].is-active", (el) => el.dataset.studentNav).catch(() => "");
  check("B: aba ativa e Treinos", activeTab === "workouts");

  // Voltar ao Inicio: dashboard de novo, banner presente
  await page.click("[data-student-nav='today']");
  await page.waitForTimeout(600);
  check("B: voltar ao Inicio mantem dashboard", Boolean(await page.$(".dashboard-home")) && !(await page.$(".execution-screen")));
  check("B: banner segue no Inicio", Boolean(await page.$(".active-session-banner")));

  // Descartar encerra sem registrar
  page.once("dialog", (dialog) => dialog.accept());
  await page.click(".active-session-banner .asb-discard");
  await page.waitForTimeout(600);
  check("B: Descartar remove o banner", !(await page.$(".active-session-banner")));
  const storedB = await page.evaluate(() => localStorage.getItem("personal-pro-active-session-v1"));
  check("B: sessao removida do localStorage", storedB === null);
  const sessions = await page.evaluate(() => JSON.parse(localStorage.getItem("personal-pro-training-sessions-v1") || "[]"));
  check("B: nada registrado no historico", sessions.length === 0);

  await browser.close();
  console.log(fail ? `\n${fail} verificacao(oes) FALHARAM` : "\nTodos os cenarios passaram");
  process.exit(fail ? 1 : 0);
})();
