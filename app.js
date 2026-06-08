(function () {
  const TRAINER_ID = "trainer-demo";
  const ADMIN = {
    email: "admin@personalpro.app",
    passwordHash: hashPassword("Admin@2026")
  };

  const keys = {
    installed: "personal-pro-installed",
    students: "personal-pro-students-v2",
    exercises: "personal-pro-exercises-v1",
    workouts: "personal-pro-workouts-v3",
    activities: "personal-pro-activities-v2",
    sessions: "personal-pro-training-sessions-v1",
    updates: "personal-pro-updates-v1",
    contracts: "personal-pro-contracts-v1",
    messages: "personal-pro-messages-v1",
    payments: "personal-pro-payments-v1",
    diets: "personal-pro-diets-v1",
    settings: "personal-pro-settings-v1",
    activeSession: "personal-pro-active-session-v1",
    authToken: "elite-as-auth-token-v1",
    rememberAuth: "elite-as-remember-auth-v1",
    localAuthSession: "elite-as-local-auth-session-v1"
  };

  const REMOTE_API_BASE = "https://personal-pro-pwa-production.up.railway.app/api";
  const collectionMap = [
    ["students", keys.students],
    ["exercises", keys.exercises],
    ["workouts", keys.workouts],
    ["activities", keys.activities],
    ["sessions", keys.sessions],
    ["updates", keys.updates],
    ["contracts", keys.contracts],
    ["messages", keys.messages],
    ["payments", keys.payments],
    ["diets", keys.diets],
    ["settings", keys.settings]
  ];

  const state = {
    currentUser: null,
    managerMenu: "home",
    studentMenu: "today",
    profileTab: "summary",
    activeStudentProfileId: "",
    currentUpdateId: "",
    agendaDate: todayISO(),
    agendaView: "day",
    search: "",
    studentFilters: { status: "all", goal: "all", contract: "all" },
    exerciseFilters: { q: "", muscle: "", equipment: "", status: "active", video: "all" },
    workoutFilters: { q: "", status: "all", goal: "all", level: "all" },
    updateFilters: { studentId: "", status: "all", period: "all", date: "" },
    contractFilters: { status: "all", studentId: "", plan: "all" },
    contractFilterOpen: false,
    messageFilters: { q: "", status: "all" },
    financeFilters: { q: "", status: "all", month: todayISO().slice(0, 7) },
    financeFilterOpen: false,
    dietFilters: { q: "", status: "all", objective: "all" },
    dietFilterOpen: false,
    studentDietQ: "",
    mealChecks: {},
    relatorioFilters: { period: "mes" },
    workoutFilterOpen: false,
    activeSession: null,
    rest: null,
    restTimer: null,
    apiAvailable: false,
    apiBase: "",
    rememberSession: localStorage.getItem("elite-as-remember-auth-v1") === "true",
    authToken: localStorage.getItem("elite-as-auth-token-v1") || sessionStorage.getItem("elite-as-auth-token-v1") || "",
    syncTimer: null,
    syncInFlight: false,
    syncAgain: false,
    offlinePending: false,
    lastSyncAt: "",
    socket: null,
    socketReady: false,
    pendingContractToken: "",
    videoObjectUrls: {},
    deferredPrompt: null,
    toastTimer: null,
    lastDoneKey: null,
    data: {
      students: [],
      exercises: [],
      workouts: [],
      activities: [],
      sessions: [],
      updates: [],
      contracts: [],
      messages: [],
      payments: [],
      diets: [],
      settings: {}
    }
  };

  const elements = {
    body: document.body,
    loginView: document.getElementById("loginView"),
    managerView: document.getElementById("managerView"),
    studentView: document.getElementById("studentView"),
    managerTitle: document.getElementById("managerTitle"),
    studentTitle: document.getElementById("studentTitle"),
    managerContent: document.getElementById("managerContent"),
    studentContent: document.getElementById("studentContent"),
    managerSideNav: document.getElementById("managerSideNav"),
    managerBottomNav: document.getElementById("managerBottomNav"),
    studentSideNav: document.getElementById("studentSideNav"),
    studentBottomNav: document.getElementById("studentBottomNav"),
    loginForm: document.getElementById("loginForm"),
    email: document.getElementById("email"),
    password: document.getElementById("password"),
    rememberMe: document.getElementById("rememberMe"),
    fillAdminDemo: document.getElementById("fillAdminDemo"),
    forgotPassword: document.getElementById("forgotPassword"),
    modal: document.getElementById("formModal"),
    modalTitle: document.getElementById("modalTitle"),
    modalBody: document.getElementById("modalBody"),
    installStatus: document.getElementById("installStatus"),
    installSheet: document.getElementById("installSheet"),
    installSheetMessage: document.getElementById("installSheetMessage"),
    enviarLinkSheet: document.getElementById("enviarLinkSheet"),
    agendarSheet: document.getElementById("agendarSheet"),
    agSheetBody: document.getElementById("agSheetBody"),
    agSheetTitle: document.getElementById("agSheetTitle"),
    agSheetFooter: document.getElementById("agSheetFooter"),
    detSheet: document.getElementById("detSheet"),
    detSheetBody: document.getElementById("detSheetBody"),
    detSheetStripe: document.getElementById("detSheetStripe"),
    detSheetFooter: document.getElementById("detSheetFooter"),
    workoutSheet: document.getElementById("workoutSheet"),
    workoutSheetBody: document.getElementById("workoutSheetBody"),
    workoutSheetTitle: document.getElementById("workoutSheetTitle"),
    workoutSheetFooter: document.getElementById("workoutSheetFooter"),
    apSheet: document.getElementById("apSheet"),
    apSheetBody: document.getElementById("apSheetBody"),
    apSheetTitle: document.getElementById("apSheetTitle"),
    apSheetFooter: document.getElementById("apSheetFooter"),
    exerciseSheet: document.getElementById("exerciseSheet"),
    exerciseSheetBody: document.getElementById("exerciseSheetBody"),
    exerciseSheetTitle: document.getElementById("exerciseSheetTitle"),
    mealPlanSheet: document.getElementById("mealPlanSheet"),
    mealPlanSheetBody: document.getElementById("mealPlanSheetBody"),
    mealPlanSheetTitle: document.getElementById("mealPlanSheetTitle"),
    mpSheetFooter: document.getElementById("mpSheetFooter"),
    contractFormSheet: document.getElementById("contractFormSheet"),
    contractFormSheetBody: document.getElementById("contractFormSheetBody"),
    contractFormTitle: document.getElementById("contractFormTitle"),
    contractFormSheetFooter: document.getElementById("contractFormSheetFooter"),
    contractViewSheet: document.getElementById("contractViewSheet"),
    contractViewSheetBody: document.getElementById("contractViewSheetBody"),
    contractViewTitle: document.getElementById("contractViewTitle"),
    contractViewSheetFooter: document.getElementById("contractViewSheetFooter"),
    videoModal: document.getElementById("videoModal"),
    videoModalTitle: document.getElementById("videoModalTitle"),
    videoModalBody: document.getElementById("videoModalBody"),
    videoModalFooter: document.getElementById("videoModalFooter"),
    usarTreinoSheet: document.getElementById("usarTreinoSheet"),
    utSheetBody: document.getElementById("utSheetBody"),
    utSheetFooter: document.getElementById("utSheetFooter"),
    enviarVideoSheet: document.getElementById("enviarVideoSheet"),
    evSheetBody: document.getElementById("evSheetBody"),
    evSheetFooter: document.getElementById("evSheetFooter"),
    paymentFormSheet: document.getElementById("paymentFormSheet"),
    pfSheetTitle: document.getElementById("pfSheetTitle"),
    pfSheetBody: document.getElementById("pfSheetBody"),
    pfSheetFooter: document.getElementById("pfSheetFooter"),
    paymentDetailSheet: document.getElementById("paymentDetailSheet"),
    pdSheetTitle: document.getElementById("pdSheetTitle"),
    pdSheetBody: document.getElementById("pdSheetBody"),
    pdSheetFooter: document.getElementById("pdSheetFooter"),
    cobrarSheet: document.getElementById("cobrarSheet"),
    cobrarSheetTitle: document.getElementById("cobrarSheetTitle"),
    cobrarSheetBody: document.getElementById("cobrarSheetBody"),
    cobrarSheetFooter: document.getElementById("cobrarSheetFooter"),
    threadSheet: document.getElementById("threadSheet"),
    threadSheetHd: document.getElementById("threadSheetHd"),
    threadSheetBd: document.getElementById("threadSheetBd"),
    threadSheetFt: document.getElementById("threadSheetFt"),
    installSteps: document.getElementById("installSteps"),
    retryInstall: document.getElementById("retryInstall"),
    toast: document.getElementById("toast"),
    drawerBackdrop: document.querySelector("[data-manager-drawer-backdrop]")
  };

  const icons = {
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/></svg>',
    students: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 11a4 4 0 1 0-8 0M4 21a8 8 0 0 1 16 0"/></svg>',
    agenda: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v4M17 3v4M4 8h16M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/></svg>',
    workouts: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12"/></svg>',
    layers: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
    library: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19.5V5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-1.5ZM8 7h7M8 11h5"/></svg>',
    updates: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/></svg>',
    progress: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V5M4 19h16M8 16v-5M13 16V8M18 16v-9"/></svg>',
    settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2 2-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-3v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-2-2 .1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4v-3h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2-2 .1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3h3v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 2 2-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v3h-.2a1.7 1.7 0 0 0-1.6 1Z"/></svg>',
    today: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>',
    profile: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0"/></svg>',
    messages: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H7l-3 3zM8 9h8M8 13h5"/></svg>',
    contracts: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l4 4v14H7zM14 3v5h4M9 13h6M9 17h6"/></svg>',
    finance: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    diet: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3v8M5 3v8M11 3v8M5 11h6l-1 10H6zM16 4c3 1 4 4 3 7-1 4-5 5-7 3 0-4 1-8 4-10Z"/></svg>',
    more: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM19 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/></svg>',
    goal: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>',
    logout: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>',
    reports: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3v18h18M7 16v-5M12 16V8M17 16v-9"/></svg>'
  };

  const FOOD_DB = [
    { name: "Ovo inteiro", qty: "1 unidade", kcal: 70, protein: 6, carbs: 0, fat: 5 },
    { name: "Clara de ovo", qty: "1 unidade", kcal: 17, protein: 4, carbs: 0, fat: 0 },
    { name: "Frango grelhado", qty: "100g", kcal: 165, protein: 31, carbs: 0, fat: 4 },
    { name: "Arroz branco cozido", qty: "100g", kcal: 130, protein: 3, carbs: 28, fat: 0 },
    { name: "Feijão cozido", qty: "100g", kcal: 77, protein: 5, carbs: 14, fat: 0 },
    { name: "Batata doce cozida", qty: "100g", kcal: 86, protein: 2, carbs: 20, fat: 0 },
    { name: "Aveia em flocos", qty: "40g", kcal: 148, protein: 5, carbs: 27, fat: 3 },
    { name: "Banana", qty: "1 unidade (100g)", kcal: 89, protein: 1, carbs: 23, fat: 0 },
    { name: "Maçã", qty: "1 unidade (150g)", kcal: 78, protein: 0, carbs: 21, fat: 0 },
    { name: "Leite desnatado", qty: "200ml", kcal: 68, protein: 7, carbs: 10, fat: 0 },
    { name: "Iogurte grego", qty: "100g", kcal: 97, protein: 9, carbs: 4, fat: 5 },
    { name: "Queijo cottage", qty: "100g", kcal: 98, protein: 11, carbs: 3, fat: 4 },
    { name: "Pão integral", qty: "1 fatia (30g)", kcal: 79, protein: 3, carbs: 14, fat: 1 },
    { name: "Whey protein", qty: "30g", kcal: 120, protein: 24, carbs: 3, fat: 1 },
    { name: "Amendoim", qty: "30g", kcal: 176, protein: 7, carbs: 5, fat: 15 },
    { name: "Azeite de oliva", qty: "1 col. sopa (10g)", kcal: 88, protein: 0, carbs: 0, fat: 10 },
    { name: "Salmão", qty: "100g", kcal: 208, protein: 20, carbs: 0, fat: 13 },
    { name: "Atum em lata (escorrido)", qty: "100g", kcal: 109, protein: 24, carbs: 0, fat: 1 },
    { name: "Brócolis cozido", qty: "100g", kcal: 34, protein: 3, carbs: 5, fat: 0 },
    { name: "Carne moída cozida", qty: "100g", kcal: 218, protein: 26, carbs: 0, fat: 13 },
    { name: "Mamão", qty: "100g", kcal: 43, protein: 1, carbs: 11, fat: 0 },
    { name: "Castanha-do-pará", qty: "3 unidades (15g)", kcal: 98, protein: 2, carbs: 2, fat: 10 }
  ];

  let _mpDraft = null;

  const MUSCLE_GROUPS = [
    "Peito",
    "Costas",
    "Ombros",
    "Bíceps",
    "Tríceps",
    "Quadríceps",
    "Posterior de coxa",
    "Glúteos",
    "Panturrilhas",
    "Abdômen",
    "Core",
    "Lombar",
    "Cardio",
    "Mobilidade",
    "Corpo todo"
  ];

  const WORKOUT_LEVELS = [
    { value: "", label: "Não definido" },
    { value: "beginner", label: "Iniciante" },
    { value: "intermediate", label: "Intermediário" },
    { value: "advanced", label: "Avançado" }
  ];

  const EQUIPMENT_OPTIONS = [
    "Peso corporal",
    "Halteres",
    "Barra",
    "Cabo",
    "Máquina",
    "Elástico",
    "Kettlebell",
    "TRX / Suspensão",
    "Outros"
  ];

  const managerMenus = [
    { id: "home", label: "Dashboard", icon: icons.home, group: "Visão geral" },
    { id: "students", label: "Alunos", icon: icons.students, group: "Operação" },
    { id: "agenda", label: "Agenda", icon: icons.agenda, group: "Operação" },
    { id: "library", label: "Biblioteca de exercícios", icon: icons.library, group: "Treinos" },
    { id: "workouts", label: "Padrões de treino", icon: icons.workouts, group: "Treinos" },
    { id: "updates", label: "Atualizações", icon: icons.updates, group: "Acompanhamento" },
    { id: "diet", label: "Dieta", icon: icons.diet, group: "Acompanhamento" },
    { id: "messages", label: "Mensagens", icon: icons.messages, group: "Relacionamento" },
    { id: "contracts", label: "Contratos", icon: icons.contracts, group: "Relacionamento" },
    { id: "finance", label: "Financeiro", icon: icons.finance, group: "Relacionamento" },
    { id: "reports", label: "Relatórios", icon: icons.reports, group: "Análises" },
    { id: "settings", label: "Configurações", icon: icons.settings, group: "Sistema" }
  ];

  const managerBottomMenus = [
    { id: "home", label: "Dashboard", icon: icons.home },
    { id: "students", label: "Alunos", icon: icons.students },
    { id: "agenda", label: "Agenda", icon: icons.agenda },
    { id: "workouts", label: "Padrões", icon: icons.layers },
    { id: "more", label: "Mais", icon: icons.more }
  ];

  const studentMenus = [
    { id: "today", label: "Início", icon: icons.today },
    { id: "workouts", label: "Treinos", icon: icons.workouts },
    { id: "diet", label: "Dieta", icon: icons.diet },
    { id: "progress", label: "Progresso", icon: icons.progress },
    { id: "updates", label: "Atualizações", icon: icons.updates },
    { id: "chat", label: "Chat", icon: icons.messages },
    { id: "profile", label: "Mais", icon: icons.profile }
  ];

  const studentBottomMenus = [
    { id: "today", label: "Início", icon: icons.today },
    { id: "workouts", label: "Treinos", icon: icons.workouts },
    { id: "diet", label: "Dieta", icon: icons.diet },
    { id: "chat", label: "Chat", icon: icons.messages },
    { id: "profile", label: "Mais", icon: icons.more }
  ];

  function hashPassword(value) {
    let hash = 2166136261;
    const input = `personal-pro-demo:${String(value || "")}`;
    for (let index = 0; index < input.length; index += 1) {
      hash ^= input.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return `fnv1a:${(hash >>> 0).toString(16).padStart(8, "0")}`;
  }

  function readList(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (error) {
      return [];
    }
  }

  function readObject(key, fallback = {}) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      return value && typeof value === "object" && !Array.isArray(value) ? value : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function sameOriginApiBase() {
    return new URL("./api", window.location.href).href.replace(/\/$/, "");
  }

  function getApiBases() {
    const host = window.location.hostname;
    const sameOrigin = sameOriginApiBase();
    if (host.endsWith("github.io") || host === "127.0.0.1" || host === "localhost" || window.location.protocol === "file:") {
      return [REMOTE_API_BASE, sameOrigin].filter((value, index, list) => value && list.indexOf(value) === index);
    }
    return [sameOrigin, REMOTE_API_BASE].filter((value, index, list) => value && list.indexOf(value) === index);
  }

  function apiUrl(path) {
    const base = state.apiBase || getApiBases()[0] || "./api";
    return `${base}${path.startsWith("/") ? path : `/${path}`}`;
  }

  function apiOrigin() {
    try {
      return new URL(state.apiBase || getApiBases()[0]).origin;
    } catch (error) {
      return window.location.origin;
    }
  }

  async function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    const { timeoutMs: _timeoutMs, ...fetchOptions } = options;
    try {
      return await fetch(url, { ...fetchOptions, signal: controller.signal, cache: "no-store" });
    } finally {
      window.clearTimeout(timer);
    }
  }

  async function fetchJsonFromApi(path, options = {}) {
    const bases = [state.apiBase, ...getApiBases()].filter((value, index, list) => value && list.indexOf(value) === index);
    let lastError = null;
    const { timeoutMs = 5000, skipAuth = false, headers = {}, ...requestOptions } = options;
    const requestHeaders = new Headers(headers);
    if (!skipAuth && state.authToken) requestHeaders.set("Authorization", `Bearer ${state.authToken}`);
    for (const base of bases) {
      try {
        const response = await fetchWithTimeout(
          `${base}${path}`,
          {
            ...requestOptions,
            headers: requestHeaders
          },
          timeoutMs
        );
        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}`;
          try {
            const payload = await response.json();
            if (payload?.error) errorMessage = payload.error;
          } catch (_error) {
            // Keep the HTTP status when the API does not return JSON.
          }
          const error = new Error(errorMessage);
          error.status = response.status;
          throw error;
        }
        state.apiBase = base;
        state.apiAvailable = true;
        return await response.json();
      } catch (error) {
        lastError = error;
      }
    }
    state.apiAvailable = false;
    throw lastError || new Error("API indisponivel.");
  }

  async function readRemoteCollection(key, fallback) {
    const payload = await fetchJsonFromApi(`/collections/${encodeURIComponent(key)}`, { timeoutMs: 4500 });
    return payload == null ? fallback : payload;
  }

  async function writeRemoteCollection(key, value) {
    await fetchJsonFromApi(`/collections/${encodeURIComponent(key)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
      timeoutMs: 7000
    });
  }

  async function readRemoteCollections() {
    const result = {};
    await Promise.all(
      collectionMap.map(async ([name, key]) => {
        try {
          result[name] = await readRemoteCollection(key, name === "settings" ? {} : []);
        } catch (error) {
          result[name] = null;
        }
      })
    );
    return result;
  }

  function localSnapshot() {
    return {
      students: readList(keys.students),
      legacyStudents: readList("personal-pro-demo-students"),
      exercises: readList(keys.exercises),
      workouts: readList(keys.workouts),
      activities: readList(keys.activities),
      sessions: readList(keys.sessions),
      updates: readList(keys.updates),
      contracts: readList(keys.contracts),
      messages: readList(keys.messages),
      payments: readList(keys.payments),
      diets: readList(keys.diets),
      settings: readObject(keys.settings, {})
    };
  }

  function pickCollection(remoteValue, localValue, fallbackValue) {
    const localHasValue = Array.isArray(localValue) ? localValue.length > 0 : localValue && Object.keys(localValue).length > 0;
    const remoteHasValue = Array.isArray(remoteValue) ? remoteValue.length > 0 : remoteValue && typeof remoteValue === "object" && Object.keys(remoteValue).length > 0;
    if (remoteHasValue) return remoteValue;
    if (localHasValue) return localValue;
    return fallbackValue;
  }

  function currentDataSnapshot() {
    return {
      students: state.data.students,
      exercises: state.data.exercises,
      workouts: state.data.workouts,
      activities: state.data.activities,
      sessions: state.data.sessions,
      updates: state.data.updates,
      contracts: state.data.contracts,
      messages: state.data.messages,
      payments: state.data.payments,
      diets: state.data.diets,
      settings: state.data.settings
    };
  }

  function scheduleRemoteSync(delay = 500) {
    window.clearTimeout(state.syncTimer);
    state.syncTimer = window.setTimeout(flushRemoteSync, delay);
  }

  async function flushRemoteSync() {
    if (!state.authToken) return;
    if (state.syncInFlight) {
      state.syncAgain = true;
      return;
    }

    state.syncInFlight = true;
    renderOfflineBanner();
    try {
      const snapshot = currentDataSnapshot();
      await Promise.all(collectionMap.map(([name, key]) => writeRemoteCollection(key, snapshot[name])));
      state.lastSyncAt = new Date().toISOString();
      state.offlinePending = false;
    } catch (error) {
      state.apiAvailable = false;
      state.offlinePending = true;
      console.warn("Sincronizacao remota indisponivel. Mantendo fallback local.", error);
    } finally {
      state.syncInFlight = false;
      renderOfflineBanner();
      if (state.syncAgain) {
        state.syncAgain = false;
        scheduleRemoteSync(250);
      }
    }
  }

  function renderOfflineBanner() {
    const banner = document.getElementById("offlinePendingBanner");
    if (!banner) return;
    if (!state.offlinePending) { banner.hidden = true; return; }
    banner.hidden = false;
    const lbl = banner.querySelector(".offline-banner-label");
    const spin = banner.querySelector(".offline-banner-syncing");
    if (lbl) lbl.hidden = state.syncInFlight;
    if (spin) spin.hidden = !state.syncInFlight;
  }

  function createId(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function todayISO() {
    return toISODate(new Date());
  }

  function toISODate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function parseISODate(isoDate) {
    const [year, month, day] = String(isoDate || todayISO()).split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function addDays(isoDate, amount) {
    const date = parseISODate(isoDate);
    date.setDate(date.getDate() + amount);
    return toISODate(date);
  }

  function addMonths(isoDate, amount) {
    const date = parseISODate(isoDate);
    date.setDate(1);
    date.setMonth(date.getMonth() + amount);
    return toISODate(date);
  }

  function startOfWeek(isoDate) {
    const date = parseISODate(isoDate);
    const diff = date.getDay() === 0 ? -6 : 1 - date.getDay();
    date.setDate(date.getDate() + diff);
    return toISODate(date);
  }

  function startOfMonth(isoDate) {
    const date = parseISODate(isoDate);
    date.setDate(1);
    return toISODate(date);
  }

  function monthLabel(isoDate) {
    return parseISODate(isoDate).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  }

  function calendarMonthDays(isoDate) {
    const firstDay = startOfWeek(startOfMonth(isoDate));
    return Array.from({ length: 42 }, (_, index) => addDays(firstDay, index));
  }

  function formatDate(isoDate) {
    return parseISODate(isoDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", weekday: "short" });
  }

  function formatLongDate(isoDate) {
    return parseISODate(isoDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", weekday: "long" });
  }

  function formatShortDate(isoDate) {
    return parseISODate(isoDate).toLocaleDateString("pt-BR");
  }

  function dayName(isoDate) {
    return parseISODate(isoDate).toLocaleDateString("pt-BR", { weekday: "long" });
  }

  function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  const mojibakeReplacements = [
    ["\u00c3\u00a3", "\u00e3"],
    ["\u00c3\u00a7", "\u00e7"],
    ["\u00c3\u00b5", "\u00f5"],
    ["\u00c3\u00a1", "\u00e1"],
    ["\u00c3\u00a9", "\u00e9"],
    ["\u00c3\u00aa", "\u00ea"],
    ["\u00c3\u00ad", "\u00ed"],
    ["\u00c3\u00b3", "\u00f3"],
    ["\u00c3\u00b4", "\u00f4"],
    ["\u00c3\u00ba", "\u00fa"],
    ["\u00c3\u00a2", "\u00e2"],
    ["\u00c3\u00a0", "\u00e0"],
    ["\u00c3\u00a8", "\u00e8"],
    ["\u00c3\u00b9", "\u00f9"],
    ["\u00c3\u0083", "\u00c3"],
    ["\u00c3\u0087", "\u00c7"],
    ["\u00c3\u0095", "\u00d5"],
    ["\u00c3\u0081", "\u00c1"],
    ["\u00c3\u0089", "\u00c9"],
    ["\u00c3\u008a", "\u00ca"],
    ["\u00c3\u008d", "\u00cd"],
    ["\u00c3\u0093", "\u00d3"],
    ["\u00c3\u0094", "\u00d4"],
    ["\u00c3\u009a", "\u00da"],
    ["\u00c3\u0082", "\u00c2"],
    ["\u00c2\u00b7", "\u00b7"],
    ["\u00e2\u20ac\u201c", "\u2013"],
    ["\u00e2\u20ac\u201d", "\u2014"],
    ["\u00e2\u20ac\u00a2", "\u2022"],
    ["\u00e2\u2020\u2018", "\u2191"],
    ["\u00e2\u2020\u2019", "\u2192"],
    ["\u00e2\u2020\u201c", "\u2193"]
  ]

  function fixMojibake(value) {
    let output = String(value ?? "");
    mojibakeReplacements.forEach(([from, to]) => {
      output = output.split(from).join(to);
    });
    return output;
  }

  function escapeHtml(value) {
    return fixMojibake(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function scrubVisibleText(root = document.body) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach((node) => {
      const fixed = fixMojibake(node.nodeValue || "");
      if (fixed !== node.nodeValue) node.nodeValue = fixed;
    });
    root.querySelectorAll?.("[placeholder], [aria-label], [title], input:not([type='hidden']), textarea, option").forEach((element) => {
      ["placeholder", "aria-label", "title"].forEach((attr) => {
        if (!element.hasAttribute?.(attr)) return;
        const current = element.getAttribute(attr) || "";
        const fixed = fixMojibake(current);
        if (fixed !== current) element.setAttribute(attr, fixed);
      });
      if (element.matches("input:not([type='hidden']), textarea")) {
        const fixed = fixMojibake(element.value || "");
        if (fixed !== element.value) element.value = fixed;
      }
    });
  }

  function numberValue(value) {
    const parsed = Number(String(value || "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function normalizeStringList(value) {
    const raw = Array.isArray(value) ? value : String(value || "").split(",");
    return [...new Set(raw.map((item) => String(item || "").trim()).filter(Boolean))];
  }

  function normalizeStudentAccessStatus(value, hasPassword = false) {
    const status = String(value || "").trim();
    if (["active", "invite_pending", "awaiting_activation"].includes(status)) return status;
    return hasPassword ? "active" : "invite_pending";
  }

  function normalizeStudent(student = {}) {
    const passwordHash = student.passwordHash || (student.password ? hashPassword(student.password) : "");
    const hasPassword = Boolean(passwordHash || student.hasPassword);
    const accessStatus = normalizeStudentAccessStatus(student.accessStatus, hasPassword);
    return {
      id: student.id || createId("student"),
      trainerId: student.trainerId || TRAINER_ID,
      name: student.name || "Aluno sem nome",
      email: normalizeEmail(student.email),
      passwordHash,
      hasPassword,
      phone: student.phone || "",
      goal: student.goal || "Condicionamento",
      status: student.status || "active",
      accessStatus,
      inviteSentAt: student.inviteSentAt || "",
      inviteExpiresAt: student.inviteExpiresAt || "",
      inviteAcceptedAt: student.inviteAcceptedAt || "",
      passwordUpdatedAt: student.passwordUpdatedAt || "",
      internalNotes: student.internalNotes || "",
      createdAt: student.createdAt || new Date().toISOString()
    };
  }

  function getStudentAccessState(student = {}) {
    if (student.status === "inactive") {
      return {
        value: "inactive",
        label: "Acesso inativo",
        tone: "danger",
        detail: "Aluno inativo no cadastro"
      };
    }

    const hasPassword = Boolean(student.passwordHash || student.hasPassword);
    const status = normalizeStudentAccessStatus(student.accessStatus, hasPassword);
    if (status === "active" && hasPassword) {
      return {
        value: "active",
        label: "Acesso ativo",
        tone: "success",
        detail: student.inviteAcceptedAt ? `Ativado em ${formatShortDate(String(student.inviteAcceptedAt).slice(0, 10))}` : "Senha criada pelo aluno"
      };
    }

    if (status === "awaiting_activation") {
      return {
        value: "awaiting_activation",
        label: "Aguardando ativação",
        tone: "warning",
        detail: "Aluno ainda não criou a senha"
      };
    }

    return {
      value: "invite_pending",
      label: "Convite pendente",
      tone: "warning",
      detail: student.inviteSentAt ? `Enviado em ${formatShortDate(String(student.inviteSentAt).slice(0, 10))}` : "Envie o link de acesso"
    };
  }

  function getExercisePrimaryMuscle(exercise = {}) {
    return String(exercise.primaryMuscle || exercise.muscle || exercise.muscleGroup || "Geral").trim() || "Geral";
  }

  function getExerciseSecondaryMuscles(exercise = {}) {
    const primaryMuscle = getExercisePrimaryMuscle(exercise);
    return normalizeStringList(exercise.secondaryMuscles).filter((item) => item !== primaryMuscle);
  }

  function getExerciseMuscleGroups(exercise = {}) {
    return [getExercisePrimaryMuscle(exercise), ...getExerciseSecondaryMuscles(exercise)];
  }

  function hasExerciseVideo(exercise = {}) {
    return Boolean(exercise.videoUrl || exercise.videoName || exercise.videoKey);
  }

  function formatFileSize(bytes) {
    const size = Number(bytes || 0);
    if (!size) return "";
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
    return `${(size / 1024 / 1024).toFixed(size < 10 * 1024 * 1024 ? 1 : 0)} MB`;
  }

  function exerciseMuscleOptions(selected = "", extras = []) {
    const values = uniqueOptions([...MUSCLE_GROUPS, ...extras, ...state.data.exercises.flatMap(getExerciseMuscleGroups)]);
    return `<option value="">Selecione</option>${values
      .map((item) => `<option value="${escapeHtml(item)}" ${selected === item ? "selected" : ""}>${escapeHtml(item)}</option>`)
      .join("")}`;
  }

  function exerciseSecondaryMuscleChoices(selected = [], primary = "") {
    const selectedList = normalizeStringList(selected);
    const values = uniqueOptions([...MUSCLE_GROUPS, ...selectedList, ...state.data.exercises.flatMap(getExerciseMuscleGroups)]).filter((item) => item !== primary);
    return values
      .map(
        (item) => `
          <label class="check-chip">
            <input type="checkbox" name="secondaryMuscles" value="${escapeHtml(item)}" ${selectedList.includes(item) ? "checked" : ""} />
            <span>${escapeHtml(item)}</span>
          </label>
        `
      )
      .join("");
  }

  function equipmentOptions(selected = "Peso corporal") {
    const all = uniqueOptions([...EQUIPMENT_OPTIONS, ...(selected && !EQUIPMENT_OPTIONS.includes(selected) ? [selected] : [])]);
    return all.map((opt) => `<option value="${escapeHtml(opt)}" ${opt === selected ? "selected" : ""}>${escapeHtml(opt)}</option>`).join("");
  }

  function exerciseTagChips(selected = [], primary = "") {
    const selectedList = normalizeStringList(selected);
    const values = uniqueOptions([...MUSCLE_GROUPS, ...selectedList, ...state.data.exercises.flatMap(getExerciseMuscleGroups)]).filter((item) => item !== primary);
    return values.map((item) => `<label class="radio-chip"><input type="checkbox" name="secondaryMuscles" value="${escapeHtml(item)}" ${selectedList.includes(item) ? "checked" : ""} /><span>${escapeHtml(item)}</span></label>`).join("");
  }

  function workoutLevelLabel(level = "") {
    return WORKOUT_LEVELS.find((item) => item.value === level)?.label || "Não definido";
  }

  function workoutLevelOptions(selected = "") {
    return WORKOUT_LEVELS.map((item) => `<option value="${escapeHtml(item.value)}" ${selected === item.value ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("");
  }

  function workoutStatusOptions(selected = "draft", isPattern = false) {
    const options = [
      { value: "draft", label: "Rascunho" },
      { value: "published", label: isPattern ? "Disponível" : "Publicado" },
      { value: "archived", label: "Arquivado" }
    ];
    return options.map((item) => `<option value="${item.value}" ${selected === item.value ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("");
  }

  function cloneWorkoutExercises(exercises = []) {
    return exercises.map((item, index) =>
      normalizeWorkoutExercise({
        ...item,
        id: createId("workout-exercise"),
        order: item.order || index + 1
      })
    );
  }

  function buildStudentWorkoutFromPattern(pattern, studentId, overrides = {}) {
    return normalizeWorkout({
      ...pattern,
      ...overrides,
      id: overrides.id || createId("workout"),
      studentId,
      sourcePatternId: pattern.id,
      sourcePatternTitle: pattern.title,
      status: overrides.status || "draft",
      publishedAt: overrides.status === "published" ? new Date().toISOString() : "",
      appliedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      exercises: cloneWorkoutExercises(pattern.exercises)
    });
  }

  async function loadData() {
    const local = localSnapshot();
    const remote = await readRemoteCollections();
    const selectedStudents = pickCollection(remote.students, local.students.length ? local.students : local.legacyStudents, []);
    state.data.students = selectedStudents.map(normalizeStudent);

    state.data.exercises = pickCollection(remote.exercises, local.exercises, []).map(normalizeExercise);
    if (state.data.exercises.length === 0) {
      state.data.exercises = seedExercises();
    }

    state.data.workouts = pickCollection(remote.workouts, local.workouts, []).map(normalizeWorkout);
    state.data.activities = pickCollection(remote.activities, local.activities, []).map(normalizeActivity);
    state.data.sessions = pickCollection(remote.sessions, local.sessions, []).map(normalizeSession);
    state.data.updates = pickCollection(remote.updates, local.updates, []).map(normalizeUpdate);
    state.data.contracts = pickCollection(remote.contracts, local.contracts, []).map(normalizeContract);
    state.data.messages = pickCollection(remote.messages, local.messages, []).map(normalizeMessage);
    state.data.payments = pickCollection(remote.payments, local.payments, []).map(normalizePayment);
    state.data.diets = pickCollection(remote.diets, local.diets, []).map(normalizeDietPlan);
    state.data.settings = normalizeSettings(pickCollection(remote.settings, local.settings, {}));
    migrateOldWorkoutData();
    state.data.students.forEach((student) => ensureNextUpdatePending(student.id, todayISO()));
    state.data.diets.forEach(ensureDietReviewActivity);
    persistData();
    state.activeSession = readActiveSession();
  }

  function normalizeExercise(exercise) {
    const primaryMuscle = getExercisePrimaryMuscle(exercise);
    const secondaryMuscles = getExerciseSecondaryMuscles({ ...exercise, primaryMuscle });
    return {
      id: exercise.id || createId("exercise"),
      trainerId: exercise.trainerId || TRAINER_ID,
      name: exercise.name || "Exercício",
      muscle: primaryMuscle,
      primaryMuscle,
      secondaryMuscles,
      equipment: exercise.equipment || "Peso corporal",
      description: exercise.description || "",
      technicalNotes: exercise.technicalNotes || "",
      videoUrl: exercise.videoUrl || "",
      videoStorage: exercise.videoStorage || (exercise.videoUrl ? "remote" : ""),
      videoKey: exercise.videoKey || "",
      videoName: exercise.videoName || "",
      videoSize: Number(exercise.videoSize || 0),
      videoUploadedAt: exercise.videoUploadedAt || "",
      defaultSets: Number(exercise.defaultSets) || 3,
      defaultRepsMin: Number(exercise.defaultRepsMin) || 8,
      defaultRepsMax: Number(exercise.defaultRepsMax) || 12,
      defaultRestSeconds: Number(exercise.defaultRestSeconds) || 60,
      status: exercise.status || "active",
      createdAt: exercise.createdAt || new Date().toISOString(),
      updatedAt: exercise.updatedAt || new Date().toISOString()
    };
  }

  function normalizeWorkout(workout) {
    return {
      id: workout.id || createId("workout"),
      trainerId: workout.trainerId || TRAINER_ID,
      studentId: workout.studentId || "",
      title: workout.title || "Treino",
      description: workout.description || "",
      focus: workout.focus || "",
      level: workout.level || workout.difficulty || "",
      status: workout.status || "draft",
      exercises: Array.isArray(workout.exercises) ? workout.exercises.map(normalizeWorkoutExercise) : [],
      sourcePatternId: workout.sourcePatternId || "",
      sourcePatternTitle: workout.sourcePatternTitle || "",
      appliedAt: workout.appliedAt || "",
      createdAt: workout.createdAt || new Date().toISOString(),
      updatedAt: workout.updatedAt || new Date().toISOString(),
      publishedAt: workout.publishedAt || ""
    };
  }

  function normalizeWorkoutExercise(item, index = 0) {
    return {
      id: item.id || createId("workout-exercise"),
      exerciseId: item.exerciseId || "",
      exerciseName: item.exerciseName || "",
      order: Number(item.order || index + 1),
      sets: Number(item.sets || 3),
      targetReps: String(item.targetReps || item.reps || "10"),
      suggestedLoad: String(item.suggestedLoad || item.load || ""),
      restSeconds: Number(item.restSeconds || 60),
      coachNotes: item.coachNotes || item.notes || ""
    };
  }

  function normalizeActivity(activity) {
    return {
      id: activity.id || createId("activity"),
      trainerId: activity.trainerId || TRAINER_ID,
      studentId: activity.studentId || "",
      type: activity.type || "workout",
      title: activity.title || "Atividade",
      date: activity.date || todayISO(),
      time: activity.time || "08:00",
      duration: String(activity.duration || "60"),
      status: activity.status || "scheduled",
      workoutId: activity.workoutId || "",
      updateId: activity.updateId || "",
      contractId: activity.contractId || "",
      dietPlanId: activity.dietPlanId || "",
      completedSessionId: activity.completedSessionId || "",
      notes: activity.notes || "",
      createdAt: activity.createdAt || new Date().toISOString()
    };
  }

  function normalizeSession(session) {
    return {
      id: session.id || createId("session"),
      trainerId: session.trainerId || TRAINER_ID,
      studentId: session.studentId || "",
      workoutId: session.workoutId || "",
      activityId: session.activityId || "",
      startedAt: session.startedAt || new Date().toISOString(),
      finishedAt: session.finishedAt || "",
      exercises: Array.isArray(session.exercises) ? session.exercises : [],
      totalVolumeLoad: Number(session.totalVolumeLoad || 0)
    };
  }

  function normalizeUpdate(update) {
    return {
      id: update.id || createId("update"),
      trainerId: update.trainerId || TRAINER_ID,
      studentId: update.studentId || "",
      dueDate: update.dueDate || todayISO(),
      status: update.status || "pending",
      submittedAt: update.submittedAt || "",
      weight: update.weight || "",
      photos: Array.isArray(update.photos) ? update.photos : [],
      trainingNotes: update.trainingNotes || "",
      dietNotes: update.dietNotes || "",
      generalNotes: update.generalNotes || "",
      energy: update.energy || "",
      pain: update.pain || "",
      trainerComment: update.trainerComment || "",
      viewedAt: update.viewedAt || "",
      createdAt: update.createdAt || new Date().toISOString()
    };
  }

  function normalizeContract(contract) {
    return {
      id: contract.id || createId("contract"),
      trainerId: contract.trainerId || TRAINER_ID,
      studentId: contract.studentId || "",
      title: contract.title || "Contrato de prestação de serviço",
      body: contract.body || "",
      pdfUrl: contract.pdfUrl || "",
      version: contract.version || "1.0",
      status: contract.status || "pending",
      cpf: contract.cpf || "",
      plan: contract.plan || "",
      value: contract.value || "",
      startDate: contract.startDate || "",
      endDate: contract.endDate || "",
      classCount: contract.classCount || "",
      createdAt: contract.createdAt || new Date().toISOString(),
      viewedAt: contract.viewedAt || "",
      signedAt: contract.signedAt || "",
      signedVersion: contract.signedVersion || "",
      technicalId: contract.technicalId || "",
      signatureIp: contract.signatureIp || "",
      signatureUserAgent: contract.signatureUserAgent || "",
      signatureMeta: contract.signatureMeta || "",
      emailSentAt: contract.emailSentAt || "",
      linkSentAt: contract.linkSentAt || "",
      contractLinkExpiresAt: contract.contractLinkExpiresAt || "",
      canceledAt: contract.canceledAt || ""
    };
  }

  function normalizeMessage(message) {
    return {
      id: message.id || createId("message"),
      trainerId: message.trainerId || TRAINER_ID,
      studentId: message.studentId || "",
      senderRole: message.senderRole || "student",
      body: message.body || "",
      createdAt: message.createdAt || new Date().toISOString(),
      readAt: message.readAt || ""
    };
  }

  function normalizePayment(payment = {}) {
    return {
      id: payment.id || createId("payment"),
      trainerId: payment.trainerId || TRAINER_ID,
      studentId: payment.studentId || "",
      contractId: payment.contractId || "",
      plan: payment.plan || "",
      referenceMonth: payment.referenceMonth || todayISO().slice(0, 7),
      amount: payment.amount || "",
      dueDate: payment.dueDate || "",
      paidAt: payment.paidAt || "",
      paymentMethod: payment.paymentMethod || "",
      status: payment.status || (payment.paidAt ? "paid" : "pending"),
      note: payment.note || "",
      receiptCode: payment.receiptCode || "",
      createdAt: payment.createdAt || new Date().toISOString(),
      updatedAt: payment.updatedAt || payment.createdAt || new Date().toISOString()
    };
  }

  function normalizeFoodItem(item = {}, index = 0) {
    return {
      id: item.id || createId("fi"),
      name: String(item.name || `Alimento ${index + 1}`).trim(),
      qty: String(item.qty || "").trim(),
      kcal: Number(item.kcal) || 0,
      protein: Number(item.protein) || 0,
      carbs: Number(item.carbs) || 0,
      fat: Number(item.fat) || 0
    };
  }

  function normalizeDietMeal(meal = {}, index = 0) {
    return {
      id: meal.id || createId("meal"),
      name: meal.name || `Refeição ${index + 1}`,
      time: meal.time || "",
      items: meal.items || "",
      foodItems: Array.isArray(meal.foodItems) ? meal.foodItems.map(normalizeFoodItem) : [],
      notes: meal.notes || ""
    };
  }

  function normalizeDietPlan(plan = {}) {
    const meals = Array.isArray(plan.meals) ? plan.meals : [];
    return {
      id: plan.id || createId("diet"),
      trainerId: plan.trainerId || TRAINER_ID,
      studentId: plan.studentId || "",
      title: plan.title || "",
      objective: plan.objective || "",
      protocol: plan.protocol || "",
      calories: plan.calories || "",
      mealCount: plan.mealCount || (meals.length ? String(meals.length) : ""),
      startDate: plan.startDate || todayISO(),
      lastUpdatedAt: plan.lastUpdatedAt || plan.updatedAt || plan.createdAt || new Date().toISOString(),
      nextReviewDate: plan.nextReviewDate || "",
      status: plan.status || "draft",
      notes: plan.notes || "",
      instructions: plan.instructions || "",
      meals: meals.map(normalizeDietMeal),
      linkSentAt: plan.linkSentAt || "",
      archivedAt: plan.archivedAt || "",
      createdAt: plan.createdAt || new Date().toISOString(),
      updatedAt: plan.updatedAt || plan.createdAt || new Date().toISOString()
    };
  }

  function normalizeSettings(settings) {
    return {
      trainerName: settings.trainerName || "Personal",
      trainerPhone: settings.trainerPhone || "",
      contactEmail: settings.contactEmail || "",
      whatsappTemplate:
        settings.whatsappTemplate ||
        "Olá, {aluno}! Passando para lembrar da atividade {atividade}, marcada para {data} às {hora}.",
      contractEmailSubject: settings.contractEmailSubject || "Contrato para aceite - Elite AS",
      contractEmailMessage:
        settings.contractEmailMessage ||
        "Olá, {aluno}. Seu contrato com {personal} está pronto para aceite interno. Acesse: {link_contrato}",
      contractEmailSignature: settings.contractEmailSignature || "Equipe Elite AS",
      contractTemplate:
        settings.contractTemplate ||
        "CONTRATO DE PRESTAÇÃO DE SERVIÇOS\n\nAluno: {aluno}\nCPF: {cpf}\nTelefone: {telefone}\nE-mail: {email}\nPersonal: {personal}\nPlano: {plano}\nValor: {valor}\nInício: {data_inicio}\nFim: {data_fim}\nQuantidade de aulas: {quantidade_aulas}\n\nDeclaro estar ciente das condições de acompanhamento, treinos, comunicação e orientações definidas pelo personal.\n\nData de aceite: {data_assinatura}"
    };
  }

  function seedExercises() {
    return [
      normalizeExercise({
        id: "seed-agachamento-livre",
        name: "Agachamento livre",
        muscle: "Pernas",
        equipment: "Barra",
        description: "Desça mantendo tronco firme, joelhos alinhados e pés apoiados.",
        technicalNotes: "Evitar colapsar joelhos para dentro.",
        videoUrl: "",
        videoStorage: "",
        status: "active"
      }),
      normalizeExercise({
        id: "seed-supino-reto",
        name: "Supino reto",
        muscle: "Peito",
        equipment: "Banco e barra",
        description: "Controle a descida até a linha do peito e empurre sem perder escápulas.",
        technicalNotes: "Manter punhos neutros e pés firmes.",
        videoUrl: "",
        videoStorage: "",
        status: "active"
      }),
      normalizeExercise({
        id: "seed-remada-baixa",
        name: "Remada baixa",
        muscle: "Costas",
        equipment: "Máquina",
        description: "Puxe o cabo em direção ao abdômen mantendo coluna neutra.",
        technicalNotes: "Não compensar com balanço do tronco.",
        videoUrl: "",
        videoStorage: "",
        status: "active"
      })
    ];
  }

  function migrateOldWorkoutData() {
    const oldWorkouts = readList("personal-pro-workouts");
    if (!oldWorkouts.length || state.data.workouts.length) return;
    const fallbackExercise = state.data.exercises[0];
    state.data.workouts = oldWorkouts.map((workout) =>
      normalizeWorkout({
        ...workout,
        status: "published",
        exercises: Array.isArray(workout.exercises)
          ? workout.exercises.map((item, index) => ({
              exerciseId: fallbackExercise?.id || "",
              order: index + 1,
              sets: item.sets || 3,
              targetReps: item.reps || "10",
              suggestedLoad: item.load || "",
              restSeconds: 60,
              coachNotes: item.name || ""
            }))
          : []
      })
    );
  }

  function persistData() {
    write(keys.students, state.data.students);
    write(keys.exercises, state.data.exercises);
    write(keys.workouts, state.data.workouts);
    write(keys.activities, state.data.activities);
    write(keys.sessions, state.data.sessions);
    write(keys.updates, state.data.updates);
    write(keys.contracts, state.data.contracts);
    write(keys.messages, state.data.messages);
    write(keys.payments, state.data.payments);
    write(keys.diets, state.data.diets);
    write(keys.settings, state.data.settings);
    scheduleRemoteSync();
  }

  function readActiveSession() {
    try {
      const session = JSON.parse(localStorage.getItem(keys.activeSession) || "null");
      if (!session || !session.workoutId) return null;
      return session;
    } catch (error) {
      return null;
    }
  }

  function persistActiveSession() {
    if (state.activeSession) write(keys.activeSession, state.activeSession);
    else localStorage.removeItem(keys.activeSession);
  }

  function getStudent(id) {
    return state.data.students.find((student) => student.id === id && student.trainerId === TRAINER_ID);
  }

  function getStudentName(id) {
    return getStudent(id)?.name || "Aluno removido";
  }

  function getExercise(id) {
    return state.data.exercises.find((exercise) => exercise.id === id);
  }

  function getWorkout(id) {
    return state.data.workouts.find((workout) => workout.id === id && workout.trainerId === TRAINER_ID);
  }

  function getCurrentStudent() {
    if (state.currentUser?.role !== "student") return null;
    return getStudent(state.currentUser.studentId);
  }

  function isWorkoutPattern(workout) {
    return !workout?.studentId;
  }

  function getWorkoutPatterns() {
    return state.data.workouts
      .filter(isWorkoutPattern)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  function getAvailableWorkoutPatterns() {
    return getWorkoutPatterns().filter((workout) => workout.status !== "archived");
  }

  function workoutPatternOptions(selected = "") {
    const patterns = getAvailableWorkoutPatterns();
    if (!patterns.length) return '<option value="">Crie um padrão primeiro</option>';
    return patterns
      .map((workout) => `<option value="${escapeHtml(workout.id)}" ${workout.id === selected ? "selected" : ""}>${escapeHtml(workout.title)} · ${escapeHtml(workout.focus || "Sem foco")}</option>`)
      .join("");
  }

  function getStudentWorkouts(studentId, options = {}) {
    return state.data.workouts
      .filter((workout) => workout.studentId === studentId)
      .filter((workout) => (options.publishedOnly ? workout.status === "published" : true))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  function getStudentSessions(studentId) {
    return state.data.sessions.filter((session) => session.studentId === studentId).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  }

  function getLastSubmittedUpdate(studentId) {
    return state.data.updates
      .filter((update) => update.studentId === studentId && update.status !== "pending")
      .sort((a, b) => String(b.submittedAt || b.dueDate).localeCompare(String(a.submittedAt || a.dueDate)))[0];
  }

  function getContractSummary(studentId) {
    const contracts = getStudentContracts(studentId);
    const pending = contracts.find((contract) => contract.status === "pending" || contract.status === "viewed");
    const signed = contracts.find((contract) => contract.status === "signed");
    if (pending) return { label: contractStatusLabel(pending.status), tone: "info", contract: pending };
    if (signed) return { label: "Assinado", tone: "success", contract: signed };
    if (contracts.length) return { label: contractStatusLabel(contracts[0].status), tone: contracts[0].status === "canceled" ? "danger" : "info", contract: contracts[0] };
    return { label: "Sem contrato", tone: "", contract: null };
  }

  function getStudentProfileStats(student) {
    const sessions = getStudentSessions(student.id);
    const workouts = getStudentWorkouts(student.id);
    const nextActivity = getNextActivityForStudent(student.id);
    const pendingUpdate = getUpdateForStudent(student.id, "pending");
    const lastUpdate = getLastSubmittedUpdate(student.id);
    const contract = getContractSummary(student.id);
    const recentVolume = sessions.slice(0, 4).reduce((sum, session) => sum + Number(session.totalVolumeLoad || 0), 0);
    const pendingCount =
      (pendingUpdate ? 1 : 0) +
      getStudentContracts(student.id).filter((item) => item.status === "pending" || item.status === "viewed").length +
      state.data.activities.filter((activity) => activity.studentId === student.id && activity.date < todayISO() && activity.status !== "done" && activity.status !== "sent" && activity.status !== "canceled").length;
    return {
      sessions,
      workouts,
      nextActivity,
      pendingUpdate,
      lastUpdate,
      contract,
      recentVolume,
      pendingCount,
      sessionsWeek: sessionsThisWeek(student.id),
      sessionsMonth: sessionsThisMonth(student.id),
      lastSession: sessions[0],
      publishedWorkouts: workouts.filter((workout) => workout.status === "published")
    };
  }

  function parseStudentProfileHash() {
    const match = window.location.hash.match(/^#\/gestor\/alunos\/([^/]+)$/);
    return match ? decodeURIComponent(match[1]) : "";
  }

  function updateStudentProfileHash(studentId) {
    const nextHash = `#/gestor/alunos/${encodeURIComponent(studentId)}`;
    if (window.location.hash !== nextHash) window.history.pushState(null, "", nextHash);
  }

  function clearStudentProfileHash() {
    if (parseStudentProfileHash()) window.history.pushState(null, "", `${window.location.pathname}${window.location.search}`);
  }

  function applyRouteFromHash() {
    if (state.currentUser?.role !== "manager") return false;
    const studentId = parseStudentProfileHash();
    const student = studentId ? getStudent(studentId) : null;
    if (!student) return false;
    state.activeStudentProfileId = student.id;
    state.managerMenu = "studentProfile";
    return true;
  }

  function isSameDay(isoDateTime, isoDate) {
    return String(isoDateTime || "").slice(0, 10) === isoDate;
  }

  function sessionsThisWeek(studentId) {
    const start = startOfWeek(todayISO());
    const end = addDays(start, 7);
    return getStudentSessions(studentId).filter((session) => session.finishedAt.slice(0, 10) >= start && session.finishedAt.slice(0, 10) < end);
  }

  function sessionsThisMonth(studentId) {
    const prefix = todayISO().slice(0, 7);
    return getStudentSessions(studentId).filter((session) => session.finishedAt.startsWith(prefix));
  }

  function getUpdateForStudent(studentId, status) {
    return state.data.updates
      .filter((update) => update.studentId === studentId)
      .filter((update) => (status ? update.status === status : true))
      .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""))[0];
  }

  function getStudentContracts(studentId) {
    return state.data.contracts
      .filter((contract) => contract.studentId === studentId && contract.trainerId === TRAINER_ID)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  function getBlockingContractForStudent(studentId) {
    return getStudentContracts(studentId).find((contract) => contract.status === "pending" || contract.status === "viewed") || null;
  }

  function getRequiredContractForStudent(studentId) {
    const student = getStudent(studentId);
    if (!student || student.status !== "active") return null;
    const blocking = getBlockingContractForStudent(studentId);
    if (blocking) return blocking;
    const hasSigned = getStudentContracts(studentId).some((contract) => contract.status === "signed");
    if (hasSigned) return null;
    const created = ensureDefaultContractForStudent(studentId);
    if (created) persistData();
    return created;
  }

  function getContractDefaults(student = {}) {
    return {
      cpf: "",
      plan: student.goal || "Acompanhamento personalizado",
      value: "",
      startDate: todayISO(),
      endDate: "",
      classCount: ""
    };
  }

  function contractVariables(student = {}, contract = {}, contractUrl = "") {
    return {
      aluno: student.name || "",
      cpf: contract.cpf || "",
      telefone: student.phone || "",
      email: student.email || "",
      personal: state.data.settings.trainerName || "Personal",
      plano: contract.plan || "",
      valor: contract.value || "",
      data_inicio: contract.startDate ? formatShortDate(contract.startDate) : "",
      data_fim: contract.endDate ? formatShortDate(contract.endDate) : "",
      quantidade_aulas: contract.classCount || "",
      data_assinatura: contract.signedAt ? new Date(contract.signedAt).toLocaleString("pt-BR") : "pendente",
      link_contrato: contractUrl,
      data: formatShortDate(todayISO())
    };
  }

  function renderTemplate(template, variables) {
    return String(template || "").replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key) => variables[key] ?? match);
  }

  function buildContractBody(student, values = {}) {
    return renderTemplate(state.data.settings.contractTemplate, contractVariables(student, values));
  }

  function ensureDefaultContractForStudent(studentId) {
    const student = getStudent(studentId);
    if (!student) return null;
    const existing = getStudentContracts(studentId).find((contract) => contract.status !== "canceled");
    if (existing) return existing;
    const defaults = getContractDefaults(student);
    const contract = normalizeContract({
      studentId,
      title: "Contrato de prestação de serviço",
      version: "1.0",
      status: "pending",
      ...defaults,
      body: buildContractBody(student, defaults),
      createdAt: new Date().toISOString()
    });
    state.data.contracts.unshift(contract);
    return contract;
  }

  function markContractViewed(contract) {
    if (!contract || contract.status !== "pending") return false;
    contract.status = "viewed";
    contract.viewedAt = contract.viewedAt || new Date().toISOString();
    return true;
  }

  function getStudentMessages(studentId) {
    return state.data.messages
      .filter((message) => message.studentId === studentId && message.trainerId === TRAINER_ID)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  function getRecentMessages(limit = 4) {
    return [...state.data.messages]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  function getNextActivityForStudent(studentId) {
    return state.data.activities
      .filter((activity) => activity.studentId === studentId && activity.status !== "done" && activity.status !== "sent" && activity.status !== "canceled")
      .filter((activity) => activity.date >= todayISO())
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))[0];
  }

  function isExerciseUsed(exerciseId) {
    return (
      state.data.workouts.some((workout) => workout.exercises.some((exercise) => exercise.exerciseId === exerciseId)) ||
      state.data.sessions.some((session) => session.exercises.some((exercise) => exercise.exerciseId === exerciseId))
    );
  }

  function sanitizePhone(value) {
    let digits = String(value || "").replace(/\D/g, "");
    if (!digits) return "";
    if (digits.length <= 11) digits = `55${digits}`;
    return digits;
  }

  function buildWhatsAppMessage(activity, student) {
    const settings = state.data.settings;
    const template = settings.whatsappTemplate || normalizeSettings({}).whatsappTemplate;
    const replacements = {
      aluno: student?.name || "aluno",
      data: formatShortDate(activity?.date || todayISO()),
      hora: activity?.time || "--:--",
      atividade: activity?.title || "atividade",
      personal: settings.trainerName || "Personal",
      dia_semana: dayName(activity?.date || todayISO())
    };
    return template.replace(/\{(aluno|data|hora|atividade|personal|dia_semana)\}/g, (_, key) => replacements[key]);
  }

  function buildWhatsAppUrl(activityId, studentId = "") {
    const activity = state.data.activities.find((item) => item.id === activityId) || getNextActivityForStudent(studentId);
    const student = getStudent(activity?.studentId || studentId);
    const phone = sanitizePhone(student?.phone);
    if (!phone) return "";
    const message = buildWhatsAppMessage(activity || { title: "atividade", date: todayISO(), time: "--:--" }, student);
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  function whatsappButton(activityId, studentId = "") {
    const activity = state.data.activities.find((item) => item.id === activityId) || getNextActivityForStudent(studentId);
    const id = activity?.id || "";
    const targetStudentId = activity?.studentId || studentId;
    return `<button class="mini-button whatsapp-button" type="button" data-whatsapp-activity="${escapeHtml(id)}" data-whatsapp-student="${escapeHtml(targetStudentId)}">WhatsApp</button>`;
  }

  function moneyValue(value) {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    const clean = String(value || "")
      .replace(/[^\d,.-]/g, "")
      .replace(/\.(?=\d{3}(\D|$))/g, "")
      .replace(",", ".");
    const parsed = Number(clean);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function currencyValue(value) {
    return moneyValue(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  }

  function currencyExact(value) {
    return moneyValue(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function financeMonthStart(referenceMonth = todayISO().slice(0, 7)) {
    const [year, month] = String(referenceMonth || todayISO().slice(0, 7)).split("-").map(Number);
    return `${year || new Date().getFullYear()}-${String(month || new Date().getMonth() + 1).padStart(2, "0")}-01`;
  }

  function financeMonthEnd(referenceMonth = todayISO().slice(0, 7)) {
    const start = parseISODate(financeMonthStart(referenceMonth));
    start.setMonth(start.getMonth() + 1);
    start.setDate(0);
    return toISODate(start);
  }

  function financeMonthLabel(referenceMonth = todayISO().slice(0, 7)) {
    return monthLabel(`${referenceMonth}-01`).replace(/^./, (letter) => letter.toUpperCase());
  }

  function getContractMonthlyAmount(contract = {}) {
    return moneyValue(contract.value);
  }

  function getBillableContractForStudent(studentId, referenceMonth = todayISO().slice(0, 7)) {
    const start = financeMonthStart(referenceMonth);
    const end = financeMonthEnd(referenceMonth);
    return getStudentContracts(studentId).find((contract) => {
      if (contract.status !== "signed") return false;
      if (!getContractMonthlyAmount(contract)) return false;
      if (contract.startDate && contract.startDate > end) return false;
      if (contract.endDate && contract.endDate < start) return false;
      return true;
    });
  }

  function financeDueDateForContract(contract = {}, referenceMonth = todayISO().slice(0, 7)) {
    const end = financeMonthEnd(referenceMonth);
    const lastDay = Number(end.slice(8, 10));
    const baseDay = contract.startDate ? Number(contract.startDate.slice(8, 10)) : 5;
    const day = Math.min(Math.max(baseDay || 5, 1), lastDay);
    return `${referenceMonth}-${String(day).padStart(2, "0")}`;
  }

  function financeStatusKey(record = {}) {
    const status = String(record.status || "").toLowerCase();
    if (status === "paid" || record.paidAt) return "paid";
    if (status === "canceled") return "canceled";
    if (status === "exempt") return "exempt";
    if (status === "partial") return "partial";
    if (status === "overdue") return "overdue";
    if (record.dueDate && record.dueDate < todayISO()) return "overdue";
    return "pending";
  }

  function financeStatusMeta(record = {}) {
    const key = financeStatusKey(record);
    const map = {
      paid: { key, label: "Pago", tone: "success", className: "is-paid", action: "Recibo" },
      pending: { key, label: "Pendente", tone: "warning", className: "is-pending", action: "Cobrar" },
      overdue: { key, label: "Atrasado", tone: "danger", className: "is-overdue", action: "Cobrar" },
      canceled: { key, label: "Cancelado", tone: "", className: "is-canceled", action: "Visualizar" },
      exempt: { key, label: "Isento", tone: "info", className: "is-exempt", action: "Visualizar" },
      partial: { key, label: "Parcial", tone: "warning", className: "is-partial", action: "Visualizar" }
    };
    return map[key] || map.pending;
  }

  function buildFinanceRecords(referenceMonth = state.financeFilters.month || todayISO().slice(0, 7)) {
    const month = String(referenceMonth || todayISO().slice(0, 7));
    const payments = state.data.payments
      .filter((payment) => payment.trainerId === TRAINER_ID && payment.referenceMonth === month && getStudent(payment.studentId))
      .map((payment) => ({ ...payment, amountNumber: moneyValue(payment.amount), virtual: false }));
    const existingStudentIds = new Set(payments.map((payment) => payment.studentId));
    const projections = state.data.students
      .filter((student) => student.trainerId === TRAINER_ID && student.status === "active" && !existingStudentIds.has(student.id))
      .map((student) => {
        const contract = getBillableContractForStudent(student.id, month);
        if (!contract) return null;
        const amount = getContractMonthlyAmount(contract);
        return {
          id: `projected-${student.id}-${month}`,
          trainerId: TRAINER_ID,
          studentId: student.id,
          contractId: contract.id,
          plan: contract.plan || student.goal || "Plano Elite AS",
          referenceMonth: month,
          amount: String(amount),
          amountNumber: amount,
          dueDate: financeDueDateForContract(contract, month),
          paidAt: "",
          paymentMethod: "",
          status: "pending",
          note: "Projeção mensal gerada pelo contrato assinado.",
          createdAt: contract.createdAt,
          updatedAt: contract.createdAt,
          virtual: true
        };
      })
      .filter(Boolean);
    return [...payments, ...projections].sort((a, b) => {
      const first = financeStatusKey(a) === "overdue" ? "0" : financeStatusKey(a) === "pending" ? "1" : "2";
      const second = financeStatusKey(b) === "overdue" ? "0" : financeStatusKey(b) === "pending" ? "1" : "2";
      return `${first}-${a.dueDate || a.paidAt || ""}`.localeCompare(`${second}-${b.dueDate || b.paidAt || ""}`);
    });
  }

  function findFinanceRecord(recordId) {
    const payment = state.data.payments.find((item) => item.id === recordId);
    if (payment) return { ...payment, amountNumber: moneyValue(payment.amount), virtual: false };
    return buildFinanceRecords(state.financeFilters.month).find((record) => record.id === recordId) || null;
  }

  function financeStats(records = []) {
    const paid = records.filter((record) => financeStatusKey(record) === "paid");
    const pending = records.filter((record) => financeStatusKey(record) === "pending");
    const overdue = records.filter((record) => financeStatusKey(record) === "overdue");
    const totalExpected = records.reduce((sum, record) => sum + moneyValue(record.amount), 0);
    return {
      paidTotal: paid.reduce((sum, record) => sum + moneyValue(record.amount), 0),
      pendingTotal: pending.reduce((sum, record) => sum + moneyValue(record.amount), 0),
      overdueTotal: overdue.reduce((sum, record) => sum + moneyValue(record.amount), 0),
      expectedTotal: totalExpected,
      payingStudents: new Set(paid.map((record) => record.studentId)).size,
      pendingCount: pending.length,
      overdueCount: overdue.length,
      ticket: records.length ? Math.round(totalExpected / records.length) : 0,
      delinquency: records.length ? Math.round((overdue.length / records.length) * 100) : 0
    };
  }

  function financePreviousMonth(referenceMonth = state.financeFilters.month || todayISO().slice(0, 7)) {
    return addMonths(`${referenceMonth}-01`, -1).slice(0, 7);
  }

  function financeNextMonth(referenceMonth = state.financeFilters.month || todayISO().slice(0, 7)) {
    return addMonths(`${referenceMonth}-01`, 1).slice(0, 7);
  }

  function financeChargeUrl(record) {
    const student = getStudent(record?.studentId);
    const phone = sanitizePhone(student?.phone);
    if (!phone) return "";
    const template =
      state.data.settings.financeChargeTemplate ||
      "Olá, {aluno}! Passando para lembrar da mensalidade do plano {plano}, no valor de {valor}, com vencimento em {vencimento}.";
    const replacements = {
      aluno: student?.name || "aluno",
      valor: currencyExact(record?.amount || 0),
      vencimento: record?.dueDate ? formatShortDate(record.dueDate) : "sem vencimento definido",
      plano: record?.plan || "plano Elite AS",
      personal: state.data.settings.trainerName || "Personal"
    };
    const message = template.replace(/\{(aluno|valor|vencimento|plano|personal)\}/g, (_, key) => replacements[key]);
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  function getDietPlan(planId) {
    return state.data.diets.find((plan) => plan.id === planId && plan.trainerId === TRAINER_ID);
  }

  function getStudentDietPlans(studentId) {
    return state.data.diets
      .filter((plan) => plan.studentId === studentId && plan.trainerId === TRAINER_ID)
      .sort((a, b) => String(b.updatedAt || b.lastUpdatedAt).localeCompare(String(a.updatedAt || a.lastUpdatedAt)));
  }

  function getCurrentDietPlanForStudent(studentId) {
    return getStudentDietPlans(studentId).find((plan) => !["archived"].includes(dietStatusKey(plan))) || null;
  }

  function dietStatusKey(plan = {}) {
    const status = String(plan.status || "").toLowerCase();
    if (status === "archived") return "archived";
    if (status === "draft") return "draft";
    if (status === "expired") return "expired";
    if (status === "review_pending") return "review_pending";
    if (plan.nextReviewDate && plan.nextReviewDate < todayISO()) return "review_pending";
    return "active";
  }

  function dietStatusMeta(plan = {}) {
    const key = dietStatusKey(plan);
    const map = {
      active: { key, label: "Ativo", tone: "success", className: "is-active" },
      review_pending: { key, label: "Revisão pendente", tone: "warning", className: "is-review" },
      expired: { key, label: "Vencido", tone: "danger", className: "is-expired" },
      draft: { key, label: "Rascunho", tone: "info", className: "is-draft" },
      archived: { key, label: "Arquivado", tone: "", className: "is-archived" }
    };
    return map[key] || map.active;
  }

  function dietStats(plans = state.data.diets) {
    const visible = plans.filter((plan) => plan.trainerId === TRAINER_ID && getStudent(plan.studentId));
    const active = visible.filter((plan) => dietStatusKey(plan) === "active");
    const reviews = visible.filter((plan) => dietStatusKey(plan) === "review_pending");
    const upcoming = visible.filter((plan) => plan.nextReviewDate && plan.nextReviewDate >= todayISO() && plan.nextReviewDate <= addDays(todayISO(), 7) && dietStatusKey(plan) !== "archived");
    const studentsWithPlan = new Set(visible.filter((plan) => dietStatusKey(plan) !== "archived").map((plan) => plan.studentId));
    const activeStudents = state.data.students.filter((student) => student.status === "active");
    return {
      active: active.length,
      reviews: reviews.length,
      upcoming: upcoming.length,
      withoutPlan: activeStudents.filter((student) => !studentsWithPlan.has(student.id)).length,
      expired: visible.filter((plan) => dietStatusKey(plan) === "expired").length
    };
  }

  function dietPlanMatchesFilters(plan, filters = state.dietFilters) {
    const student = getStudent(plan.studentId);
    if (!student) return false;
    if (filters.status && filters.status !== "all" && dietStatusKey(plan) !== filters.status) return false;
    if (filters.objective && filters.objective !== "all" && normalizeFilterText(plan.objective || student.goal) !== normalizeFilterText(filters.objective)) return false;
    if (filters.q) {
      const haystack = [student.name, student.email, student.goal, plan.title, plan.objective, plan.protocol, plan.status].map(normalizeFilterText).join(" ");
      if (!haystack.includes(normalizeFilterText(filters.q))) return false;
    }
    return true;
  }

  function dietLinkUrl(planId) {
    const plan = getDietPlan(planId);
    const student = getStudent(plan?.studentId);
    const phone = sanitizePhone(student?.phone);
    if (!plan || !phone) return "";
    const template =
      state.data.settings.dietMessageTemplate ||
      "Olá, {aluno}! Seu plano alimentar {plano} está disponível no app Elite AS. Próxima revisão: {data}.";
    const replacements = {
      aluno: student?.name || "aluno",
      plano: plan.title || plan.protocol || "plano alimentar",
      data: plan.nextReviewDate ? formatShortDate(plan.nextReviewDate) : "a definir",
      personal: state.data.settings.trainerName || "Personal"
    };
    const message = template.replace(/\{(aluno|plano|data|personal)\}/g, (_, key) => replacements[key]);
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  function videoActionHtml(exercise) {
    if (exercise.videoUrl) {
      const label = exercise.videoName || (exercise.videoStorage === "external" ? "Link cadastrado" : "Vídeo cadastrado");
      const size = formatFileSize(exercise.videoSize);
      return `<span class="video-meta"><a class="video-link" href="${escapeHtml(exercise.videoUrl)}" target="_blank" rel="noreferrer">Abrir vídeo</a><span class="small-text">${escapeHtml(label)}${size ? ` · ${escapeHtml(size)}` : ""}</span></span>`;
    }
    if (exercise.videoStorage === "indexeddb" && exercise.videoKey) {
      return `<span class="video-meta"><button class="mini-button" type="button" data-open-local-video="${escapeHtml(exercise.id)}">Abrir vídeo local</button><span class="small-text">Vídeo local deste aparelho: ${escapeHtml(exercise.videoName || "arquivo local")}${exercise.videoSize ? ` · ${escapeHtml(formatFileSize(exercise.videoSize))}` : ""}</span></span>`;
    }
    return `<span class="small-text video-meta">Sem vídeo cadastrado.</span>`;
  }

  function openVideoStore() {
    return new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) return reject(new Error("IndexedDB indisponível."));
      const request = indexedDB.open("personal-pro-media", 1);
      request.onupgradeneeded = () => request.result.createObjectStore("videos");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function saveLocalVideo(key, file) {
    const db = await openVideoStore();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("videos", "readwrite");
      tx.objectStore("videos").put(file, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function readLocalVideo(key) {
    const db = await openVideoStore();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("videos", "readonly");
      const request = tx.objectStore("videos").get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async function uploadExerciseVideo(file, exerciseId) {
    if (!file || !file.size) return null;
    const maxSize = 200 * 1024 * 1024;
    if (file.size > maxSize) throw new Error("O vídeo deve ter até 200 MB.");
    const allowed = ["video/mp4", "video/webm", "video/quicktime"];
    if (file.type && !allowed.includes(file.type)) throw new Error("Use vídeo MP4, WebM ou MOV.");

    try {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("exerciseId", exerciseId);
      formData.append("trainerId", TRAINER_ID);
      const headers = {};
      if (state.authToken) headers.Authorization = `Bearer ${state.authToken}`;
      const response = await fetchWithTimeout(apiUrl("/uploads/exercises"), { method: "POST", body: formData, headers }, 60000);
      if (!response.ok) throw new Error("Upload remoto indisponível.");
      const payload = await response.json();
      state.apiAvailable = true;
      const remoteVideoUrl = String(payload.url || "").startsWith("http") ? payload.url : `${apiOrigin()}${payload.url || ""}`;
      return {
        videoUrl: remoteVideoUrl,
        videoStorage: "remote",
        videoKey: "",
        videoName: payload.originalName || file.name,
        videoSize: payload.size || file.size,
        videoUploadedAt: new Date().toISOString()
      };
    } catch (error) {
      const videoKey = `exercise-video-${exerciseId}`;
      await saveLocalVideo(videoKey, file);
      return {
        videoUrl: "",
        videoStorage: "indexeddb",
        videoKey,
        videoName: file.name,
        videoSize: file.size,
        videoUploadedAt: new Date().toISOString()
      };
    }
  }

  function technicalId() {
    return `${navigator.userAgent || "browser"} | ${Intl.DateTimeFormat().resolvedOptions().timeZone || "timezone"}`;
  }

  async function loadSocketClient() {
    if (window.io) return true;
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = `${apiOrigin()}/socket.io/socket.io.js`;
      script.async = true;
      script.onload = () => resolve(Boolean(window.io));
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  }

  async function connectRealtime() {
    if (!state.authToken) return;
    const available = await loadSocketClient();
    if (!available || state.socket) return;
    state.socket = window.io(apiOrigin(), { transports: ["websocket", "polling"], auth: { token: state.authToken } });
    state.socket.on("connect", () => {
      state.socketReady = true;
      state.socket.emit("join", { trainerId: TRAINER_ID, role: state.currentUser?.role || "guest", studentId: state.currentUser?.studentId || "" });
    });
    state.socket.on("disconnect", () => {
      state.socketReady = false;
    });
    state.socket.on("message:new", (message) => {
      const normalized = normalizeMessage(message);
      if (!state.data.messages.some((item) => item.id === normalized.id)) {
        state.data.messages.push(normalized);
        persistData();
        const sheet = elements.threadSheet;
        const form = document.getElementById("threadForm");
        if (sheet && !sheet.hidden && form?.dataset?.studentId === normalized.studentId) {
          _refreshThreadBd(normalized.studentId);
          if (state.currentUser?.role === "student") _updateStudentChatBadge();
        } else {
          renderApp();
        }
      }
    });
  }

  function syncRealtimeRoom() {
    if (!state.socketReady || !state.socket) return;
    state.socket.emit("join", { trainerId: TRAINER_ID, role: state.currentUser?.role || "guest", studentId: state.currentUser?.studentId || "" });
  }

  function ensureNextUpdatePending(studentId, fromDate) {
    const existing = state.data.updates.find((update) => update.studentId === studentId && update.status === "pending");
    if (existing) {
      ensureUpdateActivity(existing);
      return existing;
    }

    const dueDate = addDays(fromDate || todayISO(), 15);
    const update = normalizeUpdate({
      studentId,
      dueDate,
      status: "pending",
      createdAt: new Date().toISOString()
    });
    state.data.updates.push(update);
    ensureUpdateActivity(update);
    return update;
  }

  function ensureUpdateActivity(update) {
    let activity = state.data.activities.find((item) => item.updateId === update.id);
    if (!activity) {
      activity = normalizeActivity({
        studentId: update.studentId,
        type: "update",
        title: "Atualização quinzenal",
        date: update.dueDate,
        time: "09:00",
        duration: "15",
        status: update.status === "sent" || update.status === "viewed" ? "sent" : "pending",
        updateId: update.id,
        notes: "Peso, fotos e observações do aluno"
      });
      state.data.activities.push(activity);
    } else {
      activity.date = update.dueDate;
      activity.status = update.status === "sent" || update.status === "viewed" ? "sent" : "pending";
    }
  }

  function ensureDietReviewActivity(plan) {
    if (!plan || !plan.id) return null;
    const activity = state.data.activities.find((item) => item.dietPlanId === plan.id);
    if (plan.status === "archived") {
      if (activity) activity.status = "canceled";
      return activity || null;
    }
    if (!plan.nextReviewDate) return activity || null;
    const nextStatus = plan.nextReviewDate < todayISO() ? "pending" : "scheduled";
    if (!activity) {
      const created = normalizeActivity({
        studentId: plan.studentId,
        type: "other",
        title: "Revisao de dieta",
        date: plan.nextReviewDate,
        time: "09:30",
        duration: "30",
        status: nextStatus,
        dietPlanId: plan.id,
        notes: plan.protocol || plan.title || "Plano alimentar"
      });
      state.data.activities.push(created);
      return created;
    }
    activity.studentId = plan.studentId;
    activity.title = "Revisao de dieta";
    activity.date = plan.nextReviewDate;
    activity.status = nextStatus;
    activity.notes = plan.protocol || plan.title || activity.notes || "Plano alimentar";
    return activity;
  }

  function setRememberSession(remember) {
    state.rememberSession = Boolean(remember);
    if (state.rememberSession) localStorage.setItem(keys.rememberAuth, "true");
    else localStorage.removeItem(keys.rememberAuth);
    if (elements.rememberMe) elements.rememberMe.checked = state.rememberSession;
  }

  function setAuthToken(token, persist = state.rememberSession) {
    state.authToken = String(token || "");
    sessionStorage.removeItem(keys.authToken);
    localStorage.removeItem(keys.authToken);
    if (!state.authToken) return;
    const storage = persist ? localStorage : sessionStorage;
    storage.setItem(keys.authToken, state.authToken);
  }

  function sessionUserPayload(user) {
    if (!user || typeof user !== "object" || !user.role) return null;
    return {
      role: String(user.role || ""),
      name: String(user.name || ""),
      email: String(user.email || ""),
      trainerId: String(user.trainerId || TRAINER_ID),
      studentId: String(user.studentId || "")
    };
  }

  function setStoredUserSession(user, persist = state.rememberSession) {
    sessionStorage.removeItem(keys.localAuthSession);
    localStorage.removeItem(keys.localAuthSession);
    const payloadUser = sessionUserPayload(user);
    if (!payloadUser) return;
    const payload = JSON.stringify({
      trainerId: TRAINER_ID,
      user: payloadUser,
      savedAt: new Date().toISOString()
    });
    const storage = persist ? localStorage : sessionStorage;
    storage.setItem(keys.localAuthSession, payload);
  }

  function getStoredUserSession() {
    const raw = localStorage.getItem(keys.localAuthSession) || sessionStorage.getItem(keys.localAuthSession);
    if (!raw) return null;
    try {
      const session = JSON.parse(raw);
      const user = sessionUserPayload(session?.user);
      if (session?.trainerId !== TRAINER_ID || !user) throw new Error("Sessao local invalida.");
      if (user.role === "student" && !getStudent(user.studentId)) throw new Error("Aluno nao encontrado.");
      return user;
    } catch (error) {
      sessionStorage.removeItem(keys.localAuthSession);
      localStorage.removeItem(keys.localAuthSession);
      return null;
    }
  }

  function clearStoredAuth() {
    state.authToken = "";
    state.rememberSession = false;
    sessionStorage.removeItem(keys.authToken);
    localStorage.removeItem(keys.authToken);
    sessionStorage.removeItem(keys.localAuthSession);
    localStorage.removeItem(keys.localAuthSession);
    localStorage.removeItem(keys.rememberAuth);
    if (elements.rememberMe) elements.rememberMe.checked = false;
  }

  async function authenticateRemote(email, password) {
    const result = await fetchJsonFromApi("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalizeEmail(email), password }),
      timeoutMs: 9000,
      skipAuth: true
    });
    if (!result?.token || !result?.user) throw new Error("Login remoto indisponivel.");
    setAuthToken(result.token);
    await loadData();
    return result.user;
  }

  function authenticateLocal(email, password) {
    const normalizedEmail = normalizeEmail(email);
    const passwordHash = hashPassword(password);
    const adminPasswordHash = state.data.settings.adminPasswordHash || ADMIN.passwordHash;
    if (normalizedEmail === ADMIN.email && passwordHash === adminPasswordHash) {
      return { role: "manager", name: "Admin", trainerId: TRAINER_ID };
    }
    const student = state.data.students.find((item) => item.email === normalizedEmail && item.passwordHash === passwordHash && item.status === "active");
    if (!student) return null;
    if (getStudentAccessState(student).value !== "active") return null;
    return { role: "student", name: student.name, studentId: student.id, trainerId: TRAINER_ID };
  }

  async function authenticateUser(email, password) {
    try {
      return await authenticateRemote(email, password);
    } catch (error) {
      if (error.status === 401 || error.status === 403) throw error;
      const localUser = authenticateLocal(email, password);
      if (localUser) return localUser;
      throw error;
    }
  }

  function getLoginAccessMessage(email) {
    const student = state.data.students.find((item) => item.email === normalizeEmail(email));
    if (!student) return "";
    const access = getStudentAccessState(student);
    if (access.value === "inactive") return "Este acesso esta inativo. Fale com o personal para regularizar.";
    if (access.value !== "active") return "Acesso ainda nao ativado. Use o link de convite para criar sua senha.";
    return "";
  }

  async function requestPasswordReset() {
    const email = normalizeEmail(elements.email.value);
    if (!email) {
      elements.email.focus();
      return showToast("Preencha o e-mail da conta para receber o link.");
    }

    try {
      await fetchJsonFromApi("/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          appUrl: `${window.location.origin}${window.location.pathname}`
        }),
        timeoutMs: 9000,
        skipAuth: true
      });
      showToast("Enviamos um link de redefinição para o e-mail informado.");
    } catch (error) {
      const message = String(error.message || "");
      if (message.includes("404")) return showToast("Esse e-mail ainda não tem uma conta cadastrada.");
      if (message.includes("503")) return showToast("Envio de e-mail ainda não configurado no servidor.");
      showToast("Não foi possível enviar o link agora. Tente novamente.");
    }
  }

  function openPasswordResetModal(token) {
    if (!token) return;
    openModal(
      "Criar senha de acesso",
      `
        <form class="form-grid" id="resetPasswordForm" data-token="${escapeHtml(token)}">
          <p class="small-text">Digite uma senha segura para acessar sua conta no app. O personal não visualiza essa senha.</p>
          <label class="field"><span>Nova senha</span><input name="password" type="password" autocomplete="new-password" minlength="8" required /></label>
          <label class="field"><span>Confirmar senha</span><input name="confirmPassword" type="password" autocomplete="new-password" minlength="8" required /></label>
          <button class="primary-action" type="submit">Salvar nova senha</button>
        </form>
      `
    );
  }

  async function handleResetPasswordForm(form) {
    const data = new FormData(form);
    const password = String(data.get("password") || "");
    const confirmPassword = String(data.get("confirmPassword") || "");
    if (password.length < 8) return showToast("A senha deve ter pelo menos 8 caracteres.");
    if (password !== confirmPassword) return showToast("As senhas nao conferem.");

    try {
      await fetchJsonFromApi("/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: form.dataset.token,
          password
        }),
        timeoutMs: 9000,
        skipAuth: true
      });
      await loadData();
      closeModal();
      elements.password.value = "";
      const url = new URL(window.location.href);
      url.searchParams.delete("reset");
      window.history.replaceState({}, "", url.toString());
      showToast("Senha salva. Entre com sua nova senha.");
    } catch (error) {
      showToast("Link inválido ou expirado. Solicite um novo link.");
    }
  }

  function handleIncomingPasswordResetLink() {
    const token = new URLSearchParams(window.location.search).get("reset");
    if (token) openPasswordResetModal(token);
  }

  function handleIncomingContractLink() {
    const token = new URLSearchParams(window.location.search).get("contract");
    if (!token) return;
    state.pendingContractToken = token;
    showToast("Entre com sua conta de aluno para assinar o contrato.");
  }

  async function openPendingContractAfterLogin() {
    if (!state.pendingContractToken || state.currentUser?.role !== "student") return;
    try {
      const result = await fetchJsonFromApi("/auth/contract-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: state.pendingContractToken }),
        timeoutMs: 7000,
        skipAuth: true
      });
      if (result.studentId !== state.currentUser.studentId) {
        showToast("Este link de contrato pertence a outro aluno.");
        return;
      }
      const url = new URL(window.location.href);
      url.searchParams.delete("contract");
      window.history.replaceState({}, "", url.toString());
      state.pendingContractToken = "";
      renderStudent();
      openContract(result.contractId);
    } catch (error) {
      showToast("Link de contrato inválido ou expirado.");
    }
  }

  function showToast(message, type = "default") {
    window.clearTimeout(state.toastTimer);
    const el = elements.toast;
    el.innerHTML = "";
    el.textContent = fixMojibake(message);
    el.classList.toggle("is-success", type === "success");
    el.classList.remove("has-action");
    el.classList.add("is-visible");
    state.toastTimer = window.setTimeout(() => {
      el.classList.remove("is-visible", "is-success");
    }, 3200);
  }

  function showSuccessToast(message) {
    showToast(message, "success");
  }

  function showActionToast(message, actionLabel, onAction) {
    window.clearTimeout(state.toastTimer);
    const el = elements.toast;
    el.innerHTML = "";
    const span = document.createElement("span");
    span.textContent = fixMojibake(message);
    const btn = document.createElement("button");
    btn.className = "toast-action-btn";
    btn.type = "button";
    btn.textContent = actionLabel;
    btn.onclick = () => { clearToast(); onAction(); };
    el.append(span, btn);
    el.classList.remove("is-success");
    el.classList.add("is-visible", "has-action");
    state.toastTimer = window.setTimeout(clearToast, 5000);
  }

  function clearToast() {
    window.clearTimeout(state.toastTimer);
    const el = elements.toast;
    el.classList.remove("is-visible", "is-success", "has-action");
    el.innerHTML = "";
  }

  function showView(viewName) {
    // Pre-populate nav before unhiding it — prevents the "empty nav flash" on first entry
    if (viewName === "manager") {
      const active = state.managerMenu === "studentProfile"
        ? "students"
        : managerBottomMenus.some((i) => i.id === state.managerMenu)
          ? state.managerMenu
          : "more";
      renderNav(elements.managerBottomNav, managerBottomMenus, active, "data-manager-nav");
    } else if (viewName === "student") {
      const active = studentBottomMenus.some((i) => i.id === state.studentMenu) ? state.studentMenu : "profile";
      renderNav(elements.studentBottomNav, _buildStudentBottomMenus(), active, "data-student-nav");
    }
    elements.loginView.hidden = viewName !== "login";
    elements.managerView.hidden = viewName !== "manager";
    elements.studentView.hidden = viewName !== "student";
    elements.managerBottomNav.hidden = viewName !== "manager";
    elements.studentBottomNav.hidden = viewName !== "student";
    elements.body.classList.toggle("is-manager-view", viewName === "manager");
    elements.body.classList.toggle("is-student-view", viewName === "student");
    closeManagerDrawer();
    window.scrollTo({ top: 0, behavior: "auto" });
    // Animate only the login view; manager/student content is animated by renderManager/renderStudent.
    // Keeping the transform off the whole .view prevents any reflow side-effect on the fixed bottom nav.
    if (viewName === "login") {
      elements.loginView.classList.remove("is-entering");
      void elements.loginView.offsetWidth;
      elements.loginView.classList.add("is-entering");
    }
  }

  function renderNav(target, menus, activeId, attribute) {
    const existing = target.querySelectorAll(".nav-button");
    if (existing.length === menus.length) {
      existing.forEach((btn, i) => {
        btn.classList.toggle("is-active", menus[i].id === activeId);
        const badge = btn.querySelector(".nav-dot-badge");
        if (badge) badge.hidden = !menus[i].badge;
        if (badge && menus[i].badge) badge.textContent = menus[i].badge > 9 ? "9+" : String(menus[i].badge);
      });
      return;
    }
    target.innerHTML = menus
      .map(
        (menu) => `
          <button class="nav-button ${menu.id === activeId ? "is-active" : ""}" type="button" ${attribute}="${menu.id}">
            ${menu.icon}
            <span>${menu.label}</span>
            ${menu.badge ? `<b class="nav-dot-badge">${menu.badge > 9 ? "9+" : menu.badge}</b>` : `<b class="nav-dot-badge" hidden></b>`}
          </button>
        `
      )
      .join("");
  }

  function renderSideNav(target, menus, activeId, attribute) {
    let currentGroup = "";
    target.innerHTML = menus
      .map((menu) => {
        const group = menu.group && menu.group !== currentGroup ? `<span class="nav-group">${menu.group}</span>` : "";
        if (menu.group) currentGroup = menu.group;
        return `
          ${group}
          <button class="nav-button ${menu.id === activeId ? "is-active" : ""}" type="button" ${attribute}="${menu.id}">
            ${menu.icon}
            <span>${menu.label}</span>
          </button>
        `;
      })
      .join("");
  }

  function renderManagerSideNav() {
    renderSideNav(elements.managerSideNav, managerMenus, state.managerMenu, "data-manager-nav");
    elements.managerSideNav.insertAdjacentHTML(
      "afterbegin",
      `<div class="side-nav-header">
        <span class="side-nav-title">Módulos</span>
        <button class="icon-button side-nav-close" type="button" data-manager-drawer-backdrop aria-label="Fechar menu">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>`
    );
    elements.managerSideNav.insertAdjacentHTML(
      "beforeend",
      `
        <span class="nav-group nav-group-system">Conta</span>
        <button class="nav-button is-logout" type="button" data-logout>
          ${icons.logout}
          <span>Sair</span>
        </button>
      `
    );
  }

  function openManagerDrawer() {
    elements.managerSideNav.classList.add("open");
    elements.drawerBackdrop.classList.add("visible");
  }

  function closeManagerDrawer() {
    elements.managerSideNav.classList.remove("open");
    elements.drawerBackdrop.classList.remove("visible");
  }

  function pageHeader(title, subtitle, action = "") {
    return `
      <section class="page-head">
        <div>
          <span class="eyebrow">Elite AS</span>
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(subtitle)}</p>
        </div>
        ${action ? `<div class="page-actions">${action}</div>` : ""}
      </section>
    `;
  }

  function quickLink(label, description, navId, role = "manager") {
    const attr = role === "manager" ? "data-manager-nav" : "data-student-nav";
    return `
      <button class="quick-link" type="button" ${attr}="${navId}">
        <strong>${escapeHtml(label)}</strong>
        <span>${escapeHtml(description)}</span>
      </button>
    `;
  }

  function statusBadge(label, tone = "") {
    return `<span class="badge ${tone ? `is-${tone}` : ""}">${escapeHtml(label)}</span>`;
  }

  function initialsFromName(name = "") {
    const parts = String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    return (parts.length ? `${parts[0][0] || ""}${parts[1]?.[0] || ""}` : "AS").toUpperCase();
  }

  function studentAvatar(student) {
    return `<span class="entity-avatar" aria-hidden="true">${escapeHtml(initialsFromName(student?.name))}</span>`;
  }

  function renderApp() {
    if (state.currentUser?.role === "manager") renderManager();
    if (state.currentUser?.role === "student") renderStudent();
    scrubVisibleText(elements.managerView.hidden ? elements.studentView : elements.managerView);
  }

  const SKELETON_TABS = new Set(["students", "agenda", "workouts", "diet", "messages", "contracts"]);
  const STUDENT_SKELETON_TABS = new Set(["workouts", "diet", "progress", "updates"]);

  function buildTabSkeleton(menuId) {
    const card    = (h = "4.5rem") => `<div class="skeleton skeleton-card" style="height:${h}"></div>`;
    const rows    = (n, h) => Array(n).fill(card(h)).join("");
    const metric  = () => `<div class="skeleton skeleton-metric"></div>`;
    const g2      = (n) => `<div class="skeleton-grid-2">${Array(n).fill(metric()).join("")}</div>`;

    if (menuId === "messages") {
      return `<div class="skeleton-wrap">${rows(7, "6rem")}</div>`;
    }
    if (menuId === "students") {
      return `<div class="skeleton-wrap">${rows(8)}</div>`;
    }
    if (menuId === "agenda") {
      return `<div class="skeleton-wrap">${card("2.5rem")}${rows(6, "4rem")}</div>`;
    }
    if (menuId === "contracts") {
      return `<div class="skeleton-wrap">${g2(2)}<div style="margin-top:0.25rem"></div>${rows(5, "5.5rem")}</div>`;
    }
    return `<div class="skeleton-wrap">${g2(2)}<div style="margin-top:0.25rem"></div>${rows(5)}</div>`;
  }

  function renderManager() {
    const menu = managerMenus.find((item) => item.id === state.managerMenu) || (state.managerMenu === "evaluateUpdate" ? { label: "Avaliar check-in" } : null) || { id: "studentProfile", label: "Perfil do aluno" };
    elements.managerTitle.textContent = fixMojibake(menu.label);
    renderManagerSideNav();
    const managerBottomActive =
      state.managerMenu === "studentProfile"
        ? "students"
        : managerBottomMenus.some((item) => item.id === state.managerMenu)
          ? state.managerMenu
          : "more";
    renderNav(elements.managerBottomNav, managerBottomMenus, managerBottomActive, "data-manager-nav");

    const renderers = {
      home: renderManagerHomeV2,
      students: renderStudentsScreen,
      newStudent: renderNewStudentScreen,
      agenda: () => renderAgendaScreen(),
      workouts: renderManagerWorkouts,
      library: renderExerciseLibrary,
      updates: renderManagerUpdates,
      evaluateUpdate: renderEvaluateUpdate,
      diet: renderManagerDiet,
      messages: renderManagerMessages,
      contracts: renderManagerContracts,
      finance: renderManagerFinance,
      reports: renderManagerRelatorios,
      studentProfile: renderManagerStudentProfile,
      more: renderManagerMore,
      settings: renderSettings
    };

    const html = fixMojibake((renderers[state.managerMenu] || renderManagerHomeV2)());

    const applyContent = () => {
      elements.managerContent.classList.remove("is-entering");
      void elements.managerContent.offsetWidth;
      elements.managerContent.innerHTML = html;
      elements.managerContent.classList.add("is-entering");
      // Mede altura do manager-header para o offset sticky do cabeçalho do perfil
      requestAnimationFrame(() => {
        const mh = elements.managerView.querySelector(".manager-header");
        if (mh) document.documentElement.style.setProperty("--mgr-header-h", mh.offsetHeight + "px");
      });
    };

    if (SKELETON_TABS.has(state.managerMenu) && document.body.classList.contains("app-ready")) {
      const version = ++skeletonRenderVersion;
      elements.managerContent.classList.remove("is-entering");
      void elements.managerContent.offsetWidth;
      elements.managerContent.innerHTML = buildTabSkeleton(state.managerMenu);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (skeletonRenderVersion !== version) return;
        applyContent();
      }));
    } else {
      applyContent();
    }
  }

  function renderStudent() {
    const blockingContract = getRequiredContractForStudent(getCurrentStudent()?.id);
    if (blockingContract) {
      if (markContractViewed(blockingContract)) persistData();
      elements.studentTitle.textContent = "Contrato";
      elements.studentSideNav.innerHTML = "";
      elements.studentBottomNav.innerHTML = "";
      elements.studentContent.classList.remove("is-entering");
      void elements.studentContent.offsetWidth;
      elements.studentContent.innerHTML = fixMojibake(renderStudentContractGate(blockingContract));
      elements.studentContent.classList.add("is-entering");
      return;
    }

    const menu = studentMenus.find((item) => item.id === state.studentMenu) || studentMenus[0];
    elements.studentTitle.textContent = fixMojibake(menu.label);
    renderSideNav(elements.studentSideNav, studentMenus.map((item) => ({ ...item, group: item.id === "today" ? "Aluno" : "" })), state.studentMenu, "data-student-nav");
    const studentBottomActive = studentBottomMenus.some((item) => item.id === state.studentMenu) ? state.studentMenu : "profile";
    renderNav(elements.studentBottomNav, _buildStudentBottomMenus(), studentBottomActive, "data-student-nav");

    const renderers = {
      today: renderStudentToday,
      agenda: () => renderAgendaScreen(getCurrentStudent()?.id),
      workouts: renderStudentWorkouts,
      diet: renderStudentDiet,
      updates: renderStudentUpdates,
      progress: renderStudentProgress,
      profile: renderStudentProfile,
      chat: () => { const s = getCurrentStudent(); if (s) openThreadSheet(s.id); return ""; }
    };

    const applyStudentContent = () => {
      elements.studentContent.classList.remove("is-entering");
      void elements.studentContent.offsetWidth;
      elements.studentContent.innerHTML = fixMojibake((renderers[state.studentMenu] || renderStudentToday)());
      elements.studentContent.classList.add("is-entering");
      _updateStudentChatBadge();
    };

    if (STUDENT_SKELETON_TABS.has(state.studentMenu) && document.body.classList.contains("app-ready")) {
      const version = ++skeletonRenderVersion;
      elements.studentContent.classList.remove("is-entering");
      void elements.studentContent.offsetWidth;
      elements.studentContent.innerHTML = buildTabSkeleton(state.studentMenu);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (skeletonRenderVersion !== version) return;
        applyStudentContent();
      }));
    } else {
      applyStudentContent();
    }
  }

  function metricCard(label, value) {
    return `<article class="metric-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`;
  }

  function dashboardMetricCard({ label, value, subtext = "", icon = icons.home, nav = "", tone = "" }) {
    const tag = nav ? "button" : "article";
    const navAttr = nav ? ` type="button" data-manager-nav="${escapeHtml(nav)}"` : "";
    return `
      <${tag} class="metric-card dashboard-metric ${tone ? `is-${tone}` : ""}"${navAttr}>
        <div class="metric-top-row">
          <span class="metric-icon">${icon}</span>
          <span class="metric-label">${escapeHtml(label)}</span>
        </div>
        <strong>${escapeHtml(String(value))}</strong>
        ${subtext ? `<small>${escapeHtml(subtext)}</small>` : ""}
      </${tag}>
    `;
  }

  function stdMetricCard(label, value, sub, tone) {
    const cls = tone ? ` is-${tone}` : "";
    return `<article class="metric-card${cls}"><span class="mc-label">${escapeHtml(label)}</span><strong class="mc-value">${escapeHtml(String(value))}</strong>${sub ? `<small class="mc-sub">${escapeHtml(sub)}</small>` : ""}</article>`;
  }

  function emptyState(title, description, icon = "") {
    const iconHtml = icon ? `<span class="empty-state-icon">${icon}</span>` : "";
    return `<div class="empty-state">${iconHtml}<strong>${escapeHtml(title)}</strong><span>${escapeHtml(description)}</span></div>`;
  }

  function renderOperationalItem(item) {
    return `
      <article class="entity-row compact-row">
        <div class="entity-main">
          <strong>${escapeHtml(item.title)}</strong>
          <span>${escapeHtml(item.meta || "")}</span>
          <div class="badge-row">${statusBadge(item.tone === "danger" ? "Atenção" : "Pendente", item.tone)}</div>
        </div>
        <div class="row-actions">${item.action || ""}</div>
      </article>
    `;
  }

  function renderManagerHomeV2() {
    const today = todayISO();
    const activeStudents = state.data.students.filter((student) => student.status === "active").length;
    const todayWorkoutActivities = state.data.activities.filter((item) => item.type === "workout" && item.date === today);
    const completedToday = state.data.sessions.filter((session) => isSameDay(session.finishedAt, today)).length;
    const pendingUpdates = state.data.updates.filter((update) => update.status === "pending").length;
    const overdueUpdates = state.data.updates.filter((update) => update.status === "pending" && update.dueDate < today);
    const unsignedContracts = state.data.contracts.filter((contract) => contract.status === "pending" || contract.status === "viewed");
    const studentsWithoutWorkout = state.data.students.filter((student) => student.status === "active" && !getStudentWorkouts(student.id, { publishedOnly: true }).length);
    const studentsWithoutAccess = state.data.students.filter((student) => student.status === "active" && getStudentAccessState(student).value !== "active");
    const recentMessages = getRecentMessages(4);
    const unreadMessageTotal = state.data.messages.filter((message) => message.senderRole === "student" && !message.readAt && getStudent(message.studentId)).length;
    const unansweredMessages = state.data.students
      .map((student) => ({ student, messages: getStudentMessages(student.id) }))
      .filter((item) => item.messages.some((message) => message.senderRole === "student" && !message.readAt) || (item.messages.length && item.messages[item.messages.length - 1].senderRole === "student"));
    const draftWorkouts = state.data.workouts.filter((workout) => workout.status === "draft");
    const agendaToday = getAgendaItemsForDate(today);
    const overduePayments = buildFinanceRecords(today.slice(0, 7)).filter((record) => financeStatusKey(record) === "overdue");
    const dietReviewPlans = state.data.diets.filter((plan) => getStudent(plan.studentId) && dietStatusKey(plan) === "review_pending");
    const studentsWithoutDiet = state.data.students.filter((student) => student.status === "active" && !getCurrentDietPlanForStudent(student.id));
    // Pendências agrupadas por categoria (não individualmente)
    const aggregatedPending = [];
    if (overduePayments.length) {
      aggregatedPending.push({
        title: "Pagamentos em atraso",
        context: `${overduePayments.length} ${overduePayments.length === 1 ? "aluno" : "alunos"} com pagamento atrasado`,
        icon: icons.finance,
        tone: "danger",
        clickAttr: 'data-manager-nav="finance"'
      });
    }
    if (pendingUpdates > 0) {
      aggregatedPending.push({
        title: "Atualizações de treino",
        context: `${pendingUpdates} ${pendingUpdates === 1 ? "aluno" : "alunos"} com treinos para atualizar`,
        icon: icons.updates,
        tone: overdueUpdates.length ? "danger" : "warning",
        clickAttr: 'data-manager-nav="updates"'
      });
    }
    if (studentsWithoutWorkout.length) {
      aggregatedPending.push({
        title: "Novos alunos sem treino",
        context: `${studentsWithoutWorkout.length} ${studentsWithoutWorkout.length === 1 ? "cadastro" : "cadastros"} aguardando avaliação`,
        icon: icons.students,
        tone: "warning",
        clickAttr: 'data-manager-nav="students"'
      });
    }
    if (unsignedContracts.length) {
      aggregatedPending.push({
        title: "Contratos pendentes",
        context: `${unsignedContracts.length} ${unsignedContracts.length === 1 ? "contrato" : "contratos"} aguardando assinatura`,
        icon: icons.contracts,
        tone: "warning",
        clickAttr: 'data-manager-nav="students"'
      });
    }
    if (unreadMessageTotal > 0) {
      aggregatedPending.push({
        title: "Mensagens não lidas",
        context: `${unreadMessageTotal} ${unreadMessageTotal === 1 ? "nova mensagem" : "novas mensagens"} de alunos`,
        icon: icons.messages,
        tone: "info",
        clickAttr: 'data-manager-nav="messages"'
      });
    }
    const pendingItems = aggregatedPending.slice(0, 4);

    return `
      <div class="content-stack dashboard-home">
        <section class="dashboard-hero">
          <div>
            <span class="eyebrow">Elite AS</span>
            <h3>Dashboard</h3>
            <p>Visão geral da operação da sua assessoria.</p>
          </div>
          <button class="primary-action" type="button" data-open-activity-form>${icons.agenda}<span>Agendar atividade</span></button>
        </section>

        <div class="metrics-row metrics-row--3" aria-label="Indicadores principais">
          ${dashboardMetricCard({ label: "Alunos ativos", value: activeStudents, subtext: "Cadastros em acompanhamento", icon: icons.students, nav: "students" })}
          ${dashboardMetricCard({ label: "Treinos hoje", value: todayWorkoutActivities.length, subtext: "Atividades programadas", icon: icons.workouts, nav: "agenda" })}
          ${dashboardMetricCard({ label: "Concluídos hoje", value: completedToday, subtext: completedToday ? "Sessões finalizadas" : "Nenhum treino finalizado", icon: icons.today, nav: "agenda", tone: "success" })}
        </div>
        <div class="metrics-row metrics-row--2">
          ${dashboardMetricCard({ label: "Atualizações pendentes", value: pendingUpdates, subtext: overdueUpdates.length ? `${overdueUpdates.length} atrasada(s)` : "Aguardando envio", icon: icons.updates, nav: "updates", tone: overdueUpdates.length ? "warning" : "" })}
          ${dashboardMetricCard({ label: "Mensagens não lidas", value: unreadMessageTotal, subtext: unreadMessageTotal ? "Novas mensagens" : "Conversas em dia", icon: icons.messages, nav: "messages" })}
        </div>

        <section class="panel dashboard-panel dashboard-pending-panel">
          <div class="section-title">
            <div>
              <h3>Pendências</h3>
            </div>
            <button class="section-link" type="button" data-manager-nav="updates">Ver todas ›</button>
          </div>
          ${pendingItems.length ? `<div class="entity-list dashboard-pending-list">${pendingItems.map(renderDashboardPendingItem).join("")}</div>` : emptyState("Nenhuma pendência", "Tudo certo por enquanto.")}
        </section>

        <section class="dashboard-grid dashboard-main-grid">
          <div class="panel dashboard-panel dashboard-agenda-panel">
            <div class="section-title">
              <div>
                <h3>Agenda de hoje</h3>
              </div>
              <button class="section-link" type="button" data-manager-nav="agenda">Ver agenda ›</button>
            </div>
            ${agendaToday.length ? `<div class="dashboard-agenda-list">${agendaToday.slice(0, 3).map(renderDashboardAgendaItem).join("")}</div>` : emptyState("Agenda livre hoje", "Novos treinos e atualizações aparecerão aqui.")}
          </div>

          <div class="panel dashboard-panel">
            <div class="section-title">
              <div>
                <h3>Ações rápidas</h3>
              </div>
            </div>
            <div class="quick-grid dashboard-quick-grid">
              <button class="quick-link dashboard-quick-link" type="button" data-manager-nav="newStudent">${icons.students}<strong>Novo aluno</strong><span>Cadastrar e liberar acesso</span></button>
              <button class="quick-link dashboard-quick-link" type="button" data-open-workout-form>${icons.workouts}<strong>Criar treino</strong><span>Criar padrão de treino</span></button>
              <button class="quick-link dashboard-quick-link" type="button" data-manager-nav="messages">${icons.messages}<strong>Enviar mensagem</strong><span>Conversa direta com aluno</span></button>
              <button class="quick-link dashboard-quick-link" type="button" data-manager-nav="finance">${icons.progress}<strong>Relatórios</strong><span>Resultados e finanças</span></button>
            </div>
          </div>
        </section>

        ${renderWeeklySummary()}
      </div>
    `;
  }

  function renderDashboardPendingItem(item) {
    const priorityLabel = item.tone === "danger" ? "Alta prioridade" : item.tone === "warning" ? "Média prioridade" : "Baixa prioridade";
    const priorityTone = item.tone === "danger" ? "danger" : item.tone === "warning" ? "warning" : "success";
    return `
      <button class="entity-row compact-row dashboard-pending-item" type="button" ${item.clickAttr || ""}>
        <span class="dashboard-pending-icon is-${escapeHtml(item.tone || "info")}" aria-hidden="true">${item.icon || icons.updates}</span>
        <div class="entity-main">
          <strong>${escapeHtml(item.title)}</strong>
          <span>${escapeHtml(item.context || "")}</span>
        </div>
        <div class="dashboard-pending-actions">
          ${statusBadge(priorityLabel, priorityTone)}
        </div>
      </button>
    `;
  }

  function renderDashboardAgendaItem(item) {
    return `
      <button class="dashboard-timeline-item" type="button" data-open-agenda-detail="${escapeHtml(item.id)}" data-agenda-date="${escapeHtml(item.date)}" data-agenda-student="${escapeHtml(item.studentId)}">
        <div class="timeline-time">${escapeHtml(item.time || "--:--")}</div>
        <div class="timeline-body">
          <strong>${escapeHtml(activityLabel(item.type))}</strong>
          <span>${escapeHtml(getStudentName(item.studentId))}</span>
        </div>
      </button>
    `;
  }

  function renderWeeklySummary() {
    const today = todayISO();
    const start = startOfWeek(today);
    const days = Array.from({ length: 7 }, (_, index) => addDays(start, index));
    const planned = days.reduce((sum, day) => sum + state.data.activities.filter((item) => item.type === "workout" && item.date === day).length, 0);
    const completed = days.reduce((sum, day) => sum + state.data.sessions.filter((session) => isSameDay(session.finishedAt, day)).length, 0);
    const previousStart = addDays(start, -7);
    const previousDays = Array.from({ length: 7 }, (_, index) => addDays(previousStart, index));
    const previousCompleted = previousDays.reduce((sum, day) => sum + state.data.sessions.filter((session) => isSameDay(session.finishedAt, day)).length, 0);
    const dayCounts = days.map((day) => state.data.sessions.filter((session) => isSameDay(session.finishedAt, day)).length);
    const maxDayValue = Math.max(1, ...dayCounts);
    const adherence = planned ? Math.min(100, Math.round((completed / planned) * 100)) : completed ? 100 : 0;
    const delta = completed - previousCompleted;
    const weeklyCaption = planned
      ? `${completed} concluído(s) de ${planned} treino(s) programado(s)`
      : "Sem treinos programados nesta semana";
    const chartPoints = dayCounts.map((count, index) => {
      const x = 8 + index * 14;
      const y = count ? 66 - (count / maxDayValue) * 46 : 62;
      return { x, y, count, day: days[index] };
    });
    const linePoints = chartPoints.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
    const areaPoints = `${linePoints} 92,74 8,74`;

    const deltaSign = delta >= 0 ? "↑" : "↓";
    const deltaClass = delta >= 0 ? "is-up" : "is-down";
    return `
      <section class="panel dashboard-panel weekly-summary">
        <div class="section-title">
          <div>
            <h3>Resumo semanal</h3>
            <span class="small-text">${formatDate(start)} a ${formatDate(addDays(start, 6))}</span>
          </div>
        </div>
        <div class="weekly-summary-body">
          <div class="weekly-chart-card" aria-label="Treinos concluídos na semana">
            <svg class="weekly-line-chart" viewBox="0 0 100 84" preserveAspectRatio="none" aria-hidden="true">
              <path class="weekly-grid-line" d="M8 22H92M8 44H92M8 66H92" />
              <polygon class="weekly-area" points="${areaPoints}" />
              <polyline class="weekly-line" points="${linePoints}" />
              ${chartPoints
                .map((point) => `<circle class="weekly-point ${point.day === today ? "is-today" : ""} ${point.count ? "" : "is-empty"}" cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="${point.count ? 1.9 : 1.15}" />`)
                .join("")}
            </svg>
            <div class="weekly-days">
              ${days.map((day) => `<span class="${day === today ? "is-today" : ""}">${escapeHtml(dayName(day).slice(0, 3))}</span>`).join("")}
            </div>
          </div>
          <div class="weekly-kpi">
            <strong>${adherence}%</strong>
            <span>Adesão média</span>
            <span class="kpi-delta-badge ${deltaClass}">${deltaSign} ${Math.abs(delta)} vs. sem. anterior</span>
            <small>${escapeHtml(weeklyCaption)}</small>
          </div>
        </div>
      </section>
    `;
  }

  function renderManagerMessages() {
    const filters = state.messageFilters;
    const conversations = buildMessageConversations();
    const filteredConversations = conversations.filter((conversation) => messageMatchesFilters(conversation, filters));
    const unreadTotal = conversations.reduce((total, conversation) => total + conversation.unreadCount, 0);

    // Alunos sem conversa que batem com a busca
    const query = normalizeFilterText(filters.q || "");
    const existingIds = new Set(conversations.map((c) => c.student.id));
    const newStudents = query
      ? state.data.students.filter((s) => s.trainerId === TRAINER_ID && !existingIds.has(s.id) && normalizeFilterText(`${s.name} ${s.email} ${s.goal}`).includes(query))
      : [];

    const hasResults = filteredConversations.length > 0 || newStudents.length > 0;
    return `
      <div class="wa-inbox">
        <div class="wa-inbox-header">
          <h3>Mensagens</h3>
          ${unreadTotal ? `<span class="wa-inbox-badge">${unreadTotal}</span>` : ""}
        </div>
        <label class="wa-inbox-search">
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
          <input type="search" data-message-filter="q" placeholder="Buscar ou iniciar conversa..." value="${escapeHtml(filters.q)}" />
        </label>
        ${!hasResults
          ? emptyState(
              conversations.length ? "Nenhuma conversa encontrada" : "Nenhuma conversa ainda",
              conversations.length ? "Tente buscar pelo nome do aluno para iniciar uma conversa." : "Busque pelo nome do aluno para enviar a primeira mensagem.",
              icons.messages
            )
          : ""}
        ${filteredConversations.length ? `${newStudents.length ? '<p class="wa-section-label">Conversas</p>' : ""}<div class="wa-conv-list">${filteredConversations.map(renderConversationCard).join("")}</div>` : ""}
        ${newStudents.length
          ? `<p class="wa-section-label">Iniciar nova conversa</p><div class="wa-conv-list">${newStudents.map(renderNewConversationCard).join("")}</div>`
          : ""}
      </div>
    `;
  }

  function renderNewConversationCard(student) {
    return `
      <button class="wa-conv-card wa-conv-card--new" type="button" data-open-messages="${escapeHtml(student.id)}">
        ${studentAvatar(student)}
        <span class="wa-conv-body">
          <span class="wa-conv-top">
            <strong>${escapeHtml(student.name)}</strong>
            <span class="wa-new-label">Iniciar conversa</span>
          </span>
          <span class="wa-conv-bottom">
            <small>${escapeHtml(student.goal || student.email || "Aluno cadastrado")}</small>
          </span>
        </span>
      </button>
    `;
  }

  function buildMessageConversations() {
    return state.data.students
      .map((student) => {
        const messages = getStudentMessages(student.id);
        const last = messages[messages.length - 1];
        const unreadCount = messages.filter((message) => message.senderRole === "student" && !message.readAt).length;
        return { student, messages, last, unreadCount };
      })
      .filter((conversation) => conversation.messages.length)
      .sort((a, b) => b.last.createdAt.localeCompare(a.last.createdAt));
  }

  function messageMatchesFilters(conversation, filters = state.messageFilters) {
    const query = normalizeFilterText(filters.q || "");
    if (query) {
      const haystack = [conversation.student.name, conversation.student.email, conversation.student.goal, conversation.last?.body || ""].map(normalizeFilterText).join(" ");
      if (!haystack.includes(query)) return false;
    }
    if (filters.status === "unread") return conversation.unreadCount > 0;
    if (filters.status === "waiting") return conversation.last?.senderRole === "student";
    if (filters.status === "answered") return conversation.last?.senderRole === "manager";
    if (filters.status === "recent") return (conversation.last?.createdAt || "").slice(0, 10) >= addDays(todayISO(), -7);
    return true;
  }

  function messageMetricCard({ icon, title, value, subtitle, tone = "" }) {
    return `
      <article class="message-summary-card ${tone ? `is-${tone}` : ""}">
        <span class="message-summary-icon">${icon}</span>
        <span>${escapeHtml(title)}</span>
        <strong>${escapeHtml(value)}</strong>
        <small>${escapeHtml(subtitle)}</small>
      </article>
    `;
  }

  function messageFilterSelect(name, label, icon, options, selected = "") {
    return `
      <label class="message-filter">
        <span class="message-filter-icon">${icon}</span>
        <span class="message-filter-label">${escapeHtml(label)}</span>
        <select data-message-filter="${escapeHtml(name)}">
          ${options.map(([value, text]) => `<option value="${escapeHtml(value)}" ${String(selected || "") === String(value) ? "selected" : ""}>${escapeHtml(text)}</option>`).join("")}
        </select>
      </label>
    `;
  }

  function messageMomentLabel(isoDate = "") {
    const date = String(isoDate || "").slice(0, 10);
    if (!date) return "-";
    if (date === todayISO()) return new Date(isoDate).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    if (date === addDays(todayISO(), -1)) return "Ontem";
    if (date >= addDays(todayISO(), -6)) return dayName(date);
    return formatShortDate(date);
  }

  function renderConversationCard(conversation) {
    const last = conversation.last;
    return `
      <button class="wa-conv-card ${conversation.unreadCount ? "has-unread" : ""}" type="button" data-open-messages="${escapeHtml(conversation.student.id)}">
        ${studentAvatar(conversation.student)}
        <span class="wa-conv-body">
          <span class="wa-conv-top">
            <strong>${escapeHtml(conversation.student.name)}</strong>
            <time class="wa-conv-time">${escapeHtml(messageMomentLabel(last?.createdAt))}</time>
          </span>
          <span class="wa-conv-bottom">
            <small>${escapeHtml(last?.body || "Sem mensagem registrada.")}</small>
            ${conversation.unreadCount ? `<b class="wa-unread-badge">${escapeHtml(String(conversation.unreadCount))}</b>` : ""}
          </span>
        </span>
      </button>
    `;
  }

  function renderRecentMessageCard(message) {
    const student = getStudent(message.studentId);
    if (!student) return "";
    const unread = message.senderRole === "student" && !message.readAt;
    return `
      <button class="recent-message-card ${unread ? "has-unread" : ""}" type="button" data-open-messages="${escapeHtml(message.studentId)}">
        ${studentAvatar(student)}
        <span class="conversation-copy">
          <strong>${escapeHtml(student.name)}</strong>
          <small>${escapeHtml(message.body || "Mensagem sem conteúdo.")}</small>
        </span>
        <span class="conversation-meta">
          <time>${escapeHtml(messageMomentLabel(message.createdAt))}</time>
          ${unread ? "<b>1</b>" : ""}
        </span>
      </button>
    `;
  }

  function renderManagerContracts() {
    const filters = state.contractFilters;
    const allContracts = state.data.contracts.filter((contract) => getStudent(contract.studentId)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const contracts = allContracts.filter((contract) => contractMatchesFilters(contract, filters));
    const pending = allContracts.filter((contract) => contractStatusMeta(contract).key === "pending");
    const signed = allContracts.filter((contract) => contractStatusMeta(contract).key === "signed" || contractStatusMeta(contract).key === "upcoming");
    const upcoming = allContracts.filter((contract) => contractStatusMeta(contract).key === "upcoming");
    const plans = [...new Set(allContracts.map((contract) => contract.plan).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const hasActiveFilters = filters.status !== "all" || filters.studentId !== "" || filters.plan !== "all";
    const activeFilterCount = [filters.status !== "all", filters.studentId !== "", filters.plan !== "all"].filter(Boolean).length;
    const filterPanelOpen = state.contractFilterOpen || hasActiveFilters;
    return `
      <div class="content-stack contracts-workspace">
        <section class="contracts-hero">
          <div>
            <span class="eyebrow">Elite AS</span>
            <h3>Contratos</h3>
            <p>Aceites digitais e planos</p>
          </div>
        </section>
        <section class="metrics-row metrics-row--3">
          ${stdMetricCard("Pendentes", pending.length, "Aguardando assinatura", "warning")}
          ${stdMetricCard("Assinados", signed.length, "Ativos", "success")}
          ${stdMetricCard("Próx. vencimentos", upcoming.length, "30 dias", upcoming.length ? "warning" : "")}
        </section>
        <details class="contracts-filter-details" ${filterPanelOpen ? "open" : ""}>
          <summary class="contracts-filter-toggle">
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M7 12h10M10 18h4"/></svg>
            <span>Filtrar</span>
            ${hasActiveFilters ? `<span class="filter-active-pill">${activeFilterCount}</span>` : ""}
            <svg class="filter-chevron" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
          </summary>
          <div class="contract-filter-grid">
            ${contractFilterSelect("status", "Status", icons.updates, [
              ["all", "Todos os contratos"],
              ["pending", "Pendentes"],
              ["signed", "Assinados"],
              ["upcoming", "Próximos vencimentos"],
              ["expired", "Vencidos"],
              ["canceled", "Cancelados"]
            ], filters.status)}
            ${contractFilterSelect("studentId", "Aluno", icons.students, [["", "Todos os alunos"], ...state.data.students.map((student) => [student.id, student.name])], filters.studentId)}
            ${contractFilterSelect("plan", "Plano", icons.contracts, [["all", "Todos os planos"], ...plans.map((plan) => [plan, plan])], filters.plan)}
          </div>
        </details>
        <section class="contracts-list-panel">
          <div class="section-title">
            <div>
              <h3>Lista de contratos</h3>
              <span class="small-text">${contracts.length} contrato(s) encontrado(s)</span>
            </div>
          </div>
          ${contracts.length ? `<div class="contract-card-list">${contracts.map(renderContractCard).join("")}</div>` : emptyState("Nenhum contrato encontrado", "Tente ajustar os filtros ou crie um contrato para formalizar o plano do aluno.", icons.contracts)}
          ${renderNewContractCard()}
        </section>
      </div>
    `;
  }

  function contractMetricCard({ icon, title, value, subtitle, tone = "" }) {
    return `
      <article class="contract-summary-card ${tone ? `is-${tone}` : ""}">
        <span class="contract-summary-icon">${icon}</span>
        <span>${escapeHtml(title)}</span>
        <strong>${escapeHtml(value)}</strong>
        <small>${escapeHtml(subtitle)}</small>
      </article>
    `;
  }

  function contractFilterSelect(name, label, icon, options, selected = "") {
    return `
      <label class="contract-filter">
        <span class="contract-filter-icon">${icon}</span>
        <span class="contract-filter-label">${escapeHtml(label)}</span>
        <select data-contract-filter="${escapeHtml(name)}">
          ${options.map(([value, text]) => `<option value="${escapeHtml(value)}" ${String(selected || "") === String(value) ? "selected" : ""}>${escapeHtml(text)}</option>`).join("")}
        </select>
      </label>
    `;
  }

  function renderContractCard(contract) {
    const student = getStudent(contract.studentId);
    const meta = contractStatusMeta(contract);
    const canResend = contract.status !== "signed" && contract.status !== "canceled" && contract.status !== "draft";
    const canPDF = contract.status === "signed";
    return `
      <article class="contract-card ${meta.className}">
        <div class="contract-card-main">
          ${studentAvatar(student)}
          <div class="contract-student-info">
            <strong>${escapeHtml(getStudentName(contract.studentId))}</strong>
            <span>${escapeHtml(contract.plan || contract.title || "Plano não informado")}</span>
            ${contract.value ? `<b>${escapeHtml(currencyExact(contract.value) + "/mês")}</b>` : `<b class="contract-missing-info">Valor a definir</b>`}
          </div>
          <div class="contract-validity">
            <span class="badge ${meta.badgeClass}">${escapeHtml(meta.label)}</span>
            <small>${contract.endDate ? "Válido até " + escapeHtml(formatShortDate(contract.endDate)) : "Sem vencimento"}</small>
          </div>
        </div>
        <div class="contract-card-actions">
          <button class="contract-action-btn" type="button" data-open-contract="${escapeHtml(contract.id)}">
            ${icons.contracts}<span>Visualizar</span>
          </button>
          ${canResend ? `<button class="contract-action-btn is-brand" type="button" data-contract-resend-inline="${escapeHtml(contract.id)}">
            ${icons.messages}<span>Reenviar</span>
          </button>` : ""}
          ${canPDF ? `<button class="contract-action-btn is-brand" type="button" data-contract-pdf="${escapeHtml(contract.id)}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6ZM14 2v6h6M8 13h8M8 17h4"/></svg><span>Gerar PDF</span>
          </button>` : ""}
        </div>
      </article>
    `;
  }

  function renderNewContractCard() {
    return `
      <button class="new-contract-card" type="button" data-open-contract-form="">
        <span class="new-contract-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></span>
        <span><strong>Novo contrato</strong><small>Criar um novo contrato para aluno</small></span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
      </button>
    `;
  }

  function renderManagerFinance() {
    const filters = state.financeFilters;
    const month = filters.month || todayISO().slice(0, 7);
    const allRecords = buildFinanceRecords(month);
    const records = allRecords.filter((record) => financeRecordMatchesFilters(record, filters));
    const stats = financeStats(allRecords);
    const previousStats = financeStats(buildFinanceRecords(financePreviousMonth(month)));
    const paidDelta = previousStats.paidTotal ? Math.round(((stats.paidTotal - previousStats.paidTotal) / previousStats.paidTotal) * 100) : stats.paidTotal ? 100 : 0;
    const hasActiveFilters = filters.status !== "all";
    const filterPanelOpen = state.financeFilterOpen || hasActiveFilters;
    return `
      <div class="content-stack finance-workspace">
        <section class="finance-hero">
          <div>
            <h3>Financeiro</h3>
            <p>Acompanhe mensalidades, faturamento e recebimentos</p>
          </div>
          <button class="btn-action-header" type="button" data-open-payment-form>${icons.finance}<span>Registrar pagamento</span></button>
        </section>

        <section class="metrics-row">
          ${stdMetricCard("Recebido no mês", currencyValue(stats.paidTotal), `${paidDelta >= 0 ? "+" : ""}${paidDelta}% vs. mês anterior`, "success")}
          ${stdMetricCard("A receber", currencyValue(stats.pendingTotal), `${stats.pendingCount} cobrança(s) pendente(s)`, "warning")}
          ${stdMetricCard("Em atraso", currencyValue(stats.overdueTotal), `${stats.overdueCount} aluno(s) inadimplente(s)`, "danger")}
          ${stdMetricCard("Alunos pagantes", stats.payingStudents, "ativos neste mês", "")}
        </section>

        <div class="search-filter-row" aria-label="Busca e filtros financeiros">
          <label class="finance-search-field search-input-wrap">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 21l-4.3-4.3M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z"/></svg>
            <input type="search" data-finance-filter="q" placeholder="Buscar aluno ou pagamento..." value="${escapeHtml(filters.q)}" />
          </label>
          <button class="filter-btn" type="button" data-toggle-finance-filter>
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M7 12h10M10 18h4"/></svg>
            <span>Filtrar</span>
            ${hasActiveFilters ? `<span class="filter-active-pill">1</span>` : ""}
            <svg class="filter-chevron${filterPanelOpen ? " is-open" : ""}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div>
        ${filterPanelOpen ? `<div class="finance-filter-grid">${financeFilterSelect("status", "Status", icons.updates, [["all", "Todos"], ["paid", "Pago"], ["pending", "Pendente"], ["overdue", "Atrasado"], ["upcoming", "Próximos vencimentos"]], filters.status)}</div>` : ""}

        <section class="finance-month-panel">
          <div class="section-title">
            <div>
              <h3>Visão do mês</h3>
              <span class="small-text">Projeção por contratos e pagamentos registrados</span>
            </div>
            <div class="finance-month-controls">
              <button class="icon-button" type="button" data-finance-month-shift="-1" aria-label="Mês anterior"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg></button>
              <label>
                <span class="sr-only">Mês de referência</span>
                <input type="month" data-finance-filter="month" value="${escapeHtml(month)}" />
              </label>
              <button class="icon-button" type="button" data-finance-month-shift="1" aria-label="Próximo mês"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></button>
            </div>
          </div>
          <div class="finance-month-body">
            ${renderFinanceChart(month)}
            <div class="finance-month-kpis">
              ${financeMonthKpi(icons.finance, "Faturamento", currencyValue(stats.expectedTotal), stats.expectedTotal ? "previsto no mês" : "sem previsão", "success")}
              ${financeMonthKpi(icons.progress, "Ticket médio", currencyValue(stats.ticket), "por mensalidade", "warning")}
              ${financeMonthKpi(icons.updates, "Inadimplência", `${stats.delinquency}%`, `${stats.overdueCount} atraso(s)`, stats.overdueCount ? "danger" : "success")}
            </div>
          </div>
        </section>

        <section class="finance-list-panel">
          <div class="section-title">
            <div>
              <h3>Mensalidades dos alunos</h3>
              <span class="small-text">${records.length} registro(s) em ${escapeHtml(financeMonthLabel(month))}</span>
            </div>
            <button class="text-action" type="button" data-finance-show-all>Ver todas</button>
          </div>
          ${records.length ? `<div class="finance-record-list">${records.map(renderFinanceRecordCard).join("")}</div>` : emptyState(allRecords.length ? "Nenhum pagamento encontrado" : "Nenhuma mensalidade configurada", allRecords.length ? "Tente ajustar os filtros ou buscar outro aluno." : "Vincule contratos assinados ou registre pagamentos para acompanhar o financeiro.", icons.finance)}
        </section>

        <section class="finance-insights-panel">
          <div class="section-title">
            <div>
              <h3>Análises rápidas</h3>
              <span class="small-text">Sinais úteis para a operação financeira</span>
            </div>
          </div>
          <div class="finance-insights-grid">
            ${financeInsightCard(icons.today, "Melhor semana", bestFinanceWeek(month), "recebidos", "success")}
            ${financeInsightCard(icons.agenda, "Próximos vencimentos", `${upcomingFinanceRecords(allRecords).length} cobrança(s)`, "nos próximos 7 dias", "warning")}
          </div>
        </section>
      </div>
    `;
  }

  function relatorioRange(period) {
    const today = todayISO();
    const days = period === "semana" ? 7 : period === "trimestre" ? 90 : 30;
    return { start: addDays(today, -(days - 1)), end: today, days };
  }

  function relatorioSessions(start, end) {
    return state.data.sessions.filter((s) => {
      const d = String(s.finishedAt || "").slice(0, 10);
      return d >= start && d <= end;
    });
  }

  function relatorioActivities(start, end) {
    return state.data.activities.filter((a) => a.date >= start && a.date <= end);
  }

  function relatorioPaidPayments(start, end) {
    return state.data.payments.filter((p) => {
      const d = String(p.paidAt || "").slice(0, 10);
      return d >= start && d <= end && p.trainerId === TRAINER_ID;
    });
  }

  function relatorioNovosAlunos(start, end) {
    return state.data.students.filter((s) => {
      const d = String(s.createdAt || "").slice(0, 10);
      return d >= start && d <= end && s.trainerId === TRAINER_ID;
    }).length;
  }

  function relatorioAdeSaoChartData(period) {
    const today = todayISO();
    const points = period === "semana" ? 7 : period === "trimestre" ? 12 : 8;
    const stepDays = period === "semana" ? 1 : 7;
    return Array.from({ length: points }, (_, i) => {
      const end = addDays(today, -(points - 1 - i) * stepDays);
      const start = stepDays > 1 ? addDays(end, -(stepDays - 1)) : end;
      const sessions = state.data.sessions.filter((s) => {
        const d = String(s.finishedAt || "").slice(0, 10);
        return d >= start && d <= end;
      }).length;
      const activities = state.data.activities.filter((a) => a.date >= start && a.date <= end).length;
      const label = period === "semana" ? `${end.slice(8, 10)}/${end.slice(5, 7)}` : i === points - 1 ? "Hoje" : `S${i + 1}`;
      return { label, pct: activities ? Math.min(100, Math.round((sessions / activities) * 100)) : 0 };
    });
  }

  function relatorioFaturamentoChartData(period) {
    const today = todayISO();
    const points = period === "semana" ? 7 : period === "trimestre" ? 12 : 8;
    const stepDays = period === "semana" ? 1 : 7;
    return Array.from({ length: points }, (_, i) => {
      const end = addDays(today, -(points - 1 - i) * stepDays);
      const start = stepDays > 1 ? addDays(end, -(stepDays - 1)) : end;
      const total = state.data.payments
        .filter((p) => {
          const d = String(p.paidAt || "").slice(0, 10);
          return d >= start && d <= end && p.trainerId === TRAINER_ID;
        })
        .reduce((sum, p) => sum + moneyValue(p.amount), 0);
      const label = period === "semana" ? `${end.slice(8, 10)}/${end.slice(5, 7)}` : i === points - 1 ? "Hoje" : `S${i + 1}`;
      return { label, total };
    });
  }

  function relatorioByObjetivo() {
    const counts = {};
    state.data.students
      .filter((s) => s.status === "active" && s.trainerId === TRAINER_ID)
      .forEach((s) => {
        const goal = s.goal || "Não informado";
        counts[goal] = (counts[goal] || 0) + 1;
      });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }

  function renderRelatorioLineChart(data) {
    const n = data.length;
    const W = 560;
    const H = 180;
    const pad = 28;
    const stepX = n > 1 ? (W - 2 * pad) / (n - 1) : 0;
    const toY = (pct) => H - 12 - Math.round((pct / 100) * (H - 32));
    const points = data.map((d, i) => `${pad + i * stepX},${toY(d.pct)}`).join(" ");
    const areaClose = `L${pad + (n - 1) * stepX} ${H - 12} L${pad} ${H - 12} Z`;
    return `
      <div class="rpt-chart-wrap">
        <svg viewBox="0 0 ${W} ${H}" role="img" aria-hidden="true">
          <path class="rpt-grid" d="M${pad} ${Math.round(H * 0.22)}H${W - pad}M${pad} ${Math.round(H * 0.5)}H${W - pad}M${pad} ${Math.round(H * 0.78)}H${W - pad}"/>
          <path class="rpt-area rpt-area--green" d="M${points} ${areaClose}"/>
          <polyline class="rpt-line rpt-line--green" points="${points}"/>
          ${data.map((d, i) => `<circle class="rpt-dot rpt-dot--green" cx="${pad + i * stepX}" cy="${toY(d.pct)}" r="4"/>`).join("")}
        </svg>
        <div class="rpt-chart-labels">${data.map((d) => `<span>${escapeHtml(d.label)}</span>`).join("")}</div>
      </div>
    `;
  }

  function renderRelatorioAreaChart(data) {
    const n = data.length;
    const max = Math.max(1, ...data.map((d) => d.total));
    const W = 560;
    const H = 180;
    const pad = 28;
    const stepX = n > 1 ? (W - 2 * pad) / (n - 1) : 0;
    const toY = (val) => H - 12 - Math.round((val / max) * (H - 32));
    const points = data.map((d, i) => `${pad + i * stepX},${toY(d.total)}`).join(" ");
    const areaClose = `L${pad + (n - 1) * stepX} ${H - 12} L${pad} ${H - 12} Z`;
    return `
      <div class="rpt-chart-wrap">
        <svg viewBox="0 0 ${W} ${H}" role="img" aria-hidden="true">
          <path class="rpt-grid" d="M${pad} ${Math.round(H * 0.22)}H${W - pad}M${pad} ${Math.round(H * 0.5)}H${W - pad}M${pad} ${Math.round(H * 0.78)}H${W - pad}"/>
          <path class="rpt-area rpt-area--blue" d="M${points} ${areaClose}"/>
          <polyline class="rpt-line rpt-line--blue" points="${points}"/>
          ${data.map((d, i) => `<circle class="rpt-dot rpt-dot--blue" cx="${pad + i * stepX}" cy="${toY(d.total)}" r="4"/>`).join("")}
        </svg>
        <div class="rpt-chart-labels">${data.map((d) => `<span>${escapeHtml(d.label)}</span>`).join("")}</div>
      </div>
    `;
  }

  function renderRelatorioObjetivoChart(data) {
    const maxCount = data.length ? data[0][1] : 1;
    return `
      <div class="rpt-objetivo-bars">
        ${data.map(([goal, count]) => `
          <div class="rpt-objetivo-row">
            <span class="rpt-objetivo-label">${escapeHtml(goal)}</span>
            <div class="rpt-objetivo-track"><div class="rpt-objetivo-fill" style="width:${Math.round((count / maxCount) * 100)}%"></div></div>
            <span class="rpt-objetivo-count">${count}</span>
          </div>
        `).join("")}
      </div>
    `;
  }

  function exportarRelatorio() {
    const period = state.relatorioFilters?.period || "mes";
    const { start, end } = relatorioRange(period);
    const sessions = relatorioSessions(start, end);
    const activities = relatorioActivities(start, end);
    const adesao = activities.length ? Math.min(100, Math.round((sessions.length / activities.length) * 100)) : 0;
    const paidPayments = relatorioPaidPayments(start, end);
    const faturamento = paidPayments.reduce((sum, p) => sum + moneyValue(p.amount), 0);
    const novos = relatorioNovosAlunos(start, end);
    const periodLabel = { semana: "Semana", mes: "Mes", trimestre: "Trimestre" }[period] || period;
    const rows = [
      ["Relatorio Elite AS"],
      ["Periodo", periodLabel, "De", start, "Ate", end],
      [],
      ["KPI", "Valor"],
      ["Adesao media", `${adesao}%`],
      ["Treinos concluidos", sessions.length],
      ["Atividades programadas", activities.length],
      ["Novos alunos", novos],
      ["Faturamento recebido", currencyExact(faturamento)],
      [],
      ["Pagamentos no periodo"],
      ["Aluno", "Valor", "Data de pagamento"],
      ...paidPayments.map((p) => [getStudentName(p.studentId), currencyExact(p.amount), p.paidAt ? formatShortDate(p.paidAt.slice(0, 10)) : ""])
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-elite-as-${period}-${start}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Relatório exportado com sucesso.");
  }

  function renderManagerRelatorios() {
    const period = state.relatorioFilters?.period || "mes";
    const { start, end, days } = relatorioRange(period);
    const sessions = relatorioSessions(start, end);
    const activities = relatorioActivities(start, end);
    const adesaoMedia = activities.length ? Math.min(100, Math.round((sessions.length / activities.length) * 100)) : 0;
    const adesaoTone = adesaoMedia >= 75 ? "success" : adesaoMedia >= 50 ? "warning" : "danger";
    const paidPayments = relatorioPaidPayments(start, end);
    const faturamento = paidPayments.reduce((sum, p) => sum + moneyValue(p.amount), 0);
    const prevEnd = addDays(start, -1);
    const prevStart = addDays(prevEnd, -(days - 1));
    const prevFaturamento = state.data.payments
      .filter((p) => {
        const d = String(p.paidAt || "").slice(0, 10);
        return d >= prevStart && d <= prevEnd && p.trainerId === TRAINER_ID;
      })
      .reduce((sum, p) => sum + moneyValue(p.amount), 0);
    const faturDelta = prevFaturamento ? Math.round(((faturamento - prevFaturamento) / prevFaturamento) * 100) : faturamento ? 100 : 0;
    const novosAlunos = relatorioNovosAlunos(start, end);
    const adeSaoData = relatorioAdeSaoChartData(period);
    const faturData = relatorioFaturamentoChartData(period);
    const objetivoData = relatorioByObjetivo();
    const periodLabels = { semana: "Semana", mes: "Mês", trimestre: "Trimestre" };
    return `
      <div class="content-stack reports-workspace">
        <section class="reports-hero">
          <div>
            <h3>Relatórios</h3>
            <p>Visão consolidada de adesão, treinos e faturamento</p>
          </div>
          <button class="reports-export-btn" type="button" data-exportar-relatorio>
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            <span>Exportar</span>
          </button>
        </section>

        <div class="reports-period-tabs" role="tablist" aria-label="Período do relatório">
          ${["semana", "mes", "trimestre"].map((p) => `<button class="reports-period-tab${p === period ? " is-active" : ""}" type="button" data-relatorio-period="${p}" role="tab" aria-selected="${p === period}">${escapeHtml(periodLabels[p])}</button>`).join("")}
        </div>

        <section class="metrics-row">
          ${stdMetricCard("Adesão média", `${adesaoMedia}%`, `${sessions.length} treino(s) no período`, adesaoTone)}
          ${stdMetricCard("Treinos concluídos", sessions.length, `de ${activities.length} programado(s)`, sessions.length >= activities.length * 0.75 ? "success" : "warning")}
          ${stdMetricCard("Novos alunos", novosAlunos, novosAlunos ? "no período" : "nenhum novo", novosAlunos ? "success" : "")}
          ${stdMetricCard("Faturamento", currencyValue(faturamento), `${faturDelta >= 0 ? "+" : ""}${faturDelta}% vs. período anterior`, faturDelta >= 0 ? "success" : "danger")}
        </section>

        <div class="reports-chart-row">
          <section class="reports-chart-section">
            <div class="reports-chart-title">
              <h4>Adesão semanal</h4>
              <small>% de treinos concluídos</small>
            </div>
            ${renderRelatorioLineChart(adeSaoData)}
          </section>
          <section class="reports-chart-section">
            <div class="reports-chart-title">
              <h4>Faturamento</h4>
              <small>Recebimentos no período</small>
            </div>
            ${renderRelatorioAreaChart(faturData)}
          </section>
        </div>

        <section class="reports-chart-section">
          <div class="reports-chart-title">
            <h4>Alunos por objetivo</h4>
            <small>${state.data.students.filter((s) => s.status === "active" && s.trainerId === TRAINER_ID).length} aluno(s) ativo(s)</small>
          </div>
          ${objetivoData.length ? renderRelatorioObjetivoChart(objetivoData) : emptyState("Sem dados de objetivo", "Cadastre o objetivo dos alunos para visualizar este gráfico.", icons.reports)}
        </section>
      </div>
    `;
  }

  function financeRecordMatchesFilters(record, filters = state.financeFilters) {
    const query = normalizeFilterText(filters.q || "");
    if (query) {
      const student = getStudent(record.studentId);
      const haystack = [student?.name, student?.email, record.plan, record.amount, record.dueDate, record.paidAt, financeStatusMeta(record).label].map(normalizeFilterText).join(" ");
      if (!haystack.includes(query)) return false;
    }
    if (filters.status && filters.status !== "all") {
      if (filters.status === "upcoming") return upcomingFinanceRecords([record]).length > 0;
      if (financeStatusKey(record) !== filters.status) return false;
    }
    return true;
  }

  function financeMetricCard({ icon, title, value, subtitle, tone = "" }) {
    return `
      <article class="finance-summary-card ${tone ? `is-${tone}` : ""}">
        <span class="finance-summary-icon">${icon}</span>
        <span>${escapeHtml(title)}</span>
        <strong>${escapeHtml(value)}</strong>
        <small>${escapeHtml(subtitle)}</small>
      </article>
    `;
  }

  function financeFilterSelect(name, label, icon, options, selected = "") {
    return `
      <label class="finance-filter">
        <span class="finance-filter-icon">${icon}</span>
        <span class="finance-filter-label">${escapeHtml(label)}</span>
        <select data-finance-filter="${escapeHtml(name)}">
          ${options.map(([value, text]) => `<option value="${escapeHtml(value)}" ${String(selected || "") === String(value) ? "selected" : ""}>${escapeHtml(text)}</option>`).join("")}
        </select>
      </label>
    `;
  }

  function renderFinanceChart(month) {
    const months = Array.from({ length: 6 }, (_, index) => addMonths(`${month}-01`, index - 5).slice(0, 7));
    const values = months.map((item) => financeStats(buildFinanceRecords(item)).expectedTotal);
    const max = Math.max(1, ...values);
    const points = values.map((value, index) => `${42 + index * 96},${170 - Math.round((value / max) * 132)}`).join(" ");
    return `
      <div class="finance-chart" aria-label="Faturamento dos últimos meses">
        <svg viewBox="0 0 560 200" role="img" aria-label="Gráfico de faturamento">
          <path class="finance-chart-grid" d="M34 38H535M34 82H535M34 126H535M34 170H535"/>
          <path class="finance-chart-area" d="M${points} L522 170 L42 170 Z"/>
          <polyline class="finance-chart-line" points="${points}"/>
          ${values.map((value, index) => `<circle class="finance-chart-dot ${months[index] === month ? "is-active" : ""}" cx="${42 + index * 96}" cy="${170 - Math.round((value / max) * 132)}" r="5"/>`).join("")}
        </svg>
        <div class="finance-chart-labels">
          ${months.map((item) => `<span class="${item === month ? "is-active" : ""}">${escapeHtml(monthLabel(`${item}-01`).slice(0, 3).toUpperCase())}</span>`).join("")}
        </div>
      </div>
    `;
  }

  function financeMonthKpi(icon, title, value, subtitle, tone = "") {
    return `
      <article class="finance-month-kpi ${tone ? `is-${tone}` : ""}">
        <span>${icon}</span>
        <div>
          <small>${escapeHtml(title)}</small>
          <strong>${escapeHtml(value)}</strong>
          <em>${escapeHtml(subtitle)}</em>
        </div>
      </article>
    `;
  }

  function renderFinanceRecordCard(record) {
    const student = getStudent(record.studentId);
    const meta = financeStatusMeta(record);
    const dateLabel = meta.key === "paid" && record.paidAt ? "Pago em" : "Vencimento";
    const dateValue = meta.key === "paid" && record.paidAt ? formatShortDate(record.paidAt.slice(0, 10)) : record.dueDate ? formatShortDate(record.dueDate) : "Sem data";
    const primaryAction =
      meta.key === "paid"
        ? `<button class="finance-primary-action" type="button" data-open-payment-receipt="${escapeHtml(record.id)}">${icons.contracts}<span>Recibo</span></button>`
        : `<button class="finance-primary-action" type="button" data-finance-charge="${escapeHtml(record.id)}">${icons.messages}<span>Cobrar</span></button>`;
    return `
      <article class="finance-record-card ${meta.className}">
        ${studentAvatar(student)}
        <div class="finance-record-student">
          <strong>${escapeHtml(getStudentName(record.studentId))}</strong>
          <span>${escapeHtml(record.plan || "Plano não informado")}</span>
          ${record.virtual ? '<small>Projetado pelo contrato</small>' : '<small>Registro manual</small>'}
        </div>
        <div class="finance-record-amount">
          <span>${icons.finance}</span>
          <strong>${escapeHtml(currencyExact(record.amount))}</strong>
          <small>${escapeHtml(record.referenceMonth)}</small>
        </div>
        <div class="finance-record-date">
          <span>${icons.agenda}</span>
          <small>${escapeHtml(dateLabel)}</small>
          <strong>${escapeHtml(dateValue)}</strong>
        </div>
        <div class="finance-record-actions">
          <span class="badge ${meta.tone ? `is-${meta.tone}` : ""}">${escapeHtml(meta.label)}</span>
          <button class="finance-secondary-action" type="button" data-open-payment-detail="${escapeHtml(record.id)}">${icons.contracts}<span>Visualizar</span></button>
          ${primaryAction}
        </div>
      </article>
    `;
  }

  function upcomingFinanceRecords(records = []) {
    const today = todayISO();
    const limit = addDays(today, 7);
    return records.filter((record) => {
      const key = financeStatusKey(record);
      return key === "pending" && record.dueDate >= today && record.dueDate <= limit;
    });
  }

  function bestFinanceWeek(month) {
    const records = buildFinanceRecords(month).filter((record) => financeStatusKey(record) === "paid" && record.paidAt);
    if (!records.length) return "Sem recebimentos";
    const weeks = [0, 0, 0, 0, 0];
    records.forEach((record) => {
      const day = Number(String(record.paidAt).slice(8, 10)) || 1;
      const index = Math.min(4, Math.floor((day - 1) / 7));
      weeks[index] += moneyValue(record.amount);
    });
    const bestIndex = weeks.reduce((best, value, index) => (value > weeks[best] ? index : best), 0);
    return `${bestIndex + 1}ª semana · ${currencyValue(weeks[bestIndex])}`;
  }

  function financeInsightCard(icon, title, value, subtitle, tone = "") {
    return `
      <article class="finance-insight-card ${tone ? `is-${tone}` : ""}">
        <span>${icon}</span>
        <div>
          <strong>${escapeHtml(title)}</strong>
          <small>${escapeHtml(value)}</small>
          <em>${escapeHtml(subtitle)}</em>
        </div>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
      </article>
    `;
  }

  function renderManagerDiet() {
    const filters = state.dietFilters;
    const allPlans = state.data.diets
      .filter((plan) => plan.trainerId === TRAINER_ID && getStudent(plan.studentId))
      .sort((a, b) => String(b.updatedAt || b.lastUpdatedAt).localeCompare(String(a.updatedAt || a.lastUpdatedAt)));
    const plans = allPlans.filter((plan) => dietPlanMatchesFilters(plan, filters));
    const stats = dietStats(allPlans);
    const hasActiveFilters = filters.status !== "all" || filters.objective !== "all";
    const activeFilterCount = [filters.status !== "all", filters.objective !== "all"].filter(Boolean).length;
    const filterPanelOpen = state.dietFilterOpen || hasActiveFilters;
    return `
      <div class="content-stack diet-workspace">
        <section class="diet-hero">
          <div>
            <span class="eyebrow">Elite AS</span>
            <h3>Dieta</h3>
            <p>Organize planos alimentares e acompanhamento</p>
          </div>
        </section>

        <button class="diet-new-btn" type="button" data-open-diet-form>
          <span aria-hidden="true">🍎</span><span>Novo plano alimentar</span>
        </button>

        <section class="metrics-row metrics-row--3">
          ${stdMetricCard("Planos ativos", stats.active, stats.active ? "em acompanhamento" : "nenhum ativo", "success")}
          ${stdMetricCard("Revisões pendentes", stats.reviews, stats.reviews ? "Aguardando" : "Em dia", stats.reviews ? "warning" : "success")}
          ${stdMetricCard("Próximas entregas", stats.upcoming, "Até 7 dias", "warning")}
        </section>

        <div class="search-filter-row" aria-label="Busca e filtros de dieta">
          <label class="diet-search-field search-input-wrap">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 21l-4.3-4.3M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z"/></svg>
            <input type="search" data-diet-filter="q" placeholder="Buscar plano alimentar..." value="${escapeHtml(filters.q)}" />
          </label>
          <button class="filter-btn" type="button" data-toggle-diet-filter>
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M7 12h10M10 18h4"/></svg>
            <span>Filtrar</span>
            ${hasActiveFilters ? `<span class="filter-active-pill">${activeFilterCount}</span>` : ""}
            <svg class="filter-chevron${filterPanelOpen ? " is-open" : ""}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div>
        ${filterPanelOpen ? `
        <div class="diet-filter-grid">
          ${dietFilterSelect("status", "Status", icons.updates, [
            ["all", "Todos"],
            ["active", "Ativo"],
            ["review_pending", "Revisão pendente"],
            ["expired", "Vencido"],
            ["draft", "Rascunho"],
            ["archived", "Arquivado"]
          ], filters.status)}
          ${dietFilterSelect("objective", "Objetivo", icons.progress, [
            ["all", "Todos"],
            ["Hipertrofia", "Hipertrofia"],
            ["Emagrecimento", "Emagrecimento"],
            ["Manutenção", "Manutenção"],
            ["Performance", "Performance"],
            ["Reeducação alimentar", "Reeducação alimentar"],
            ["Condicionamento", "Condicionamento"],
            ["Outro", "Outro"]
          ], filters.objective)}
        </div>` : ""}

        <section class="diet-list-panel">
          <div class="section-title">
            <div>
              <h3>Planos alimentares</h3>
              <span class="small-text">${plans.length} plano(s) encontrado(s)</span>
            </div>
            <button class="text-action" type="button" data-diet-show-all>Ver todos</button>
          </div>
          ${
            plans.length
              ? `<div class="diet-plan-list">${plans.map(renderDietPlanCard).join("")}</div>`
              : emptyState(allPlans.length ? "Nenhum plano encontrado" : "Nenhum plano alimentar criado", allPlans.length ? "Tente ajustar os filtros ou criar um novo plano." : "Crie planos alimentares para organizar o acompanhamento dos alunos.", icons.diet)
          }
        </section>

        <section class="diet-insights-panel">
          <div class="section-title">
            <div>
              <h3>Acompanhamento</h3>
              <span class="small-text">Sinais úteis para revisão e entrega</span>
            </div>
          </div>
          <div class="diet-insights-grid">
            ${dietInsightCard(icons.updates, "Próxima revisão", nextDietReviewLabel(allPlans), "prioridade da semana", stats.reviews ? "warning" : "success")}
            ${dietInsightCard(icons.students, "Sem plano ativo", `${stats.withoutPlan} aluno(s)`, "cadastros ativos", stats.withoutPlan ? "warning" : "success")}
          </div>
        </section>
      </div>
    `;
  }

  function dietMetricCard({ icon, title, value, subtitle, tone = "" }) {
    return `
      <article class="diet-summary-card ${tone ? `is-${tone}` : ""}">
        <span class="diet-summary-icon">${icon}</span>
        <span>${escapeHtml(title)}</span>
        <strong>${escapeHtml(String(value))}</strong>
        <small>${escapeHtml(subtitle)}</small>
      </article>
    `;
  }

  function dietFilterSelect(name, label, icon, options, selected = "") {
    return `
      <label class="diet-filter">
        <span class="diet-filter-icon">${icon}</span>
        <span class="diet-filter-label">${escapeHtml(label)}</span>
        <select data-diet-filter="${escapeHtml(name)}">
          ${options.map(([value, text]) => `<option value="${escapeHtml(value)}" ${String(selected || "") === String(value) ? "selected" : ""}>${escapeHtml(text)}</option>`).join("")}
        </select>
      </label>
    `;
  }

  function renderDietPlanCard(plan) {
    const student = getStudent(plan.studentId);
    const meta = dietStatusMeta(plan);
    const nextReview = plan.nextReviewDate ? formatShortDate(plan.nextReviewDate) : "A definir";
    const mealCount = plan.mealCount || plan.meals.length || "-";
    return `
      <article class="diet-plan-card ${meta.className}">
        <div class="diet-plan-head">
          ${studentAvatar(student)}
          <div class="diet-plan-title">
            <strong>${escapeHtml(getStudentName(plan.studentId))}</strong>
            <span>${icons.progress}${escapeHtml(plan.objective || student?.goal || "Objetivo não informado")}</span>
          </div>
          <span class="badge ${meta.tone ? `is-${meta.tone}` : ""}">${escapeHtml(meta.label)}</span>
          <details class="action-menu">
            <summary aria-label="Mais ações">${icons.more}</summary>
            <div>
              <button class="mini-button" type="button" data-open-diet-form="${escapeHtml(plan.id)}" data-prefill-student="${escapeHtml(plan.studentId)}">Editar plano</button>
              <button class="mini-button" type="button" data-duplicate-diet="${escapeHtml(plan.id)}">Duplicar</button>
              <button class="mini-button" type="button" data-open-student-profile="${escapeHtml(plan.studentId)}">Abrir perfil</button>
              <button class="mini-button" type="button" data-archive-diet="${escapeHtml(plan.id)}">Arquivar</button>
            </div>
          </details>
        </div>
        <div class="diet-plan-grid">
          <article>${icons.agenda}<span>Protocolo / kcal</span><strong>${escapeHtml(plan.protocol || plan.title || "Plano alimentar")}${plan.calories ? ` · ${escapeHtml(String(plan.calories))} kcal` : ""}</strong></article>
          <article>${icons.diet}<span>Refeições/dia</span><strong>${escapeHtml(String(mealCount))}</strong></article>
          <article>${icons.today}<span>Última atualização</span><strong>${formatShortDate(String(plan.lastUpdatedAt || plan.updatedAt).slice(0, 10))}</strong></article>
          <article>${icons.agenda}<span>Próxima revisão</span><strong>${escapeHtml(nextReview)}</strong></article>
        </div>
        <div class="diet-plan-actions">
          <button class="diet-secondary-action" type="button" data-open-diet-detail="${escapeHtml(plan.id)}">${icons.diet}<span>Visualizar</span></button>
          <button class="diet-primary-action" type="button" data-send-diet-link="${escapeHtml(plan.id)}">${icons.messages}<span>Enviar link</span></button>
        </div>
      </article>
    `;
  }

  function nextDietReviewLabel(plans = []) {
    const upcoming = plans
      .filter((plan) => plan.nextReviewDate && dietStatusKey(plan) !== "archived")
      .sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate))[0];
    if (!upcoming) return "Sem revisão marcada";
    return `${getStudentName(upcoming.studentId)} · ${formatShortDate(upcoming.nextReviewDate)}`;
  }

  function dietInsightCard(icon, title, value, subtitle, tone = "") {
    return `
      <article class="diet-insight-card ${tone ? `is-${tone}` : ""}">
        <span>${icon}</span>
        <div>
          <strong>${escapeHtml(title)}</strong>
          <small>${escapeHtml(value)}</small>
          <em>${escapeHtml(subtitle)}</em>
        </div>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
      </article>
    `;
  }

  function renderManagerMore() {
    return `
      <div class="content-stack">
        ${pageHeader("Mais", "Módulos complementares e configurações")}
        <section class="panel">
          <div class="section-title"><h3>Módulos</h3><span class="small-text">Acesso organizado</span></div>
          <div class="quick-grid more-grid">
            ${quickLink("Biblioteca de exercícios", "Exercícios, vídeos e status", "library")}
            ${quickLink("Padrões de treino", "Modelos base", "workouts")}
            ${quickLink("Atualizações", "Pendências quinzenais", "updates")}
            ${quickLink("Mensagens", "Conversa direta com alunos", "messages")}
            ${quickLink("Contratos", "Aceites digitais", "contracts")}
            ${quickLink("Financeiro", "Mensalidades e recebimentos", "finance")}
            ${quickLink("Dieta", "Planos alimentares", "diet")}
            ${quickLink("Configurações", "Personal e WhatsApp", "settings")}
            <button class="quick-link" type="button" data-install-trigger><strong>Baixar app</strong><span>Instalar como aplicativo</span></button>
          </div>
        </section>
      </div>
    `;
  }

  function renderStudentsScreen() {
    const q = state.search.toLowerCase();
    const filters = state.studentFilters;
    const students = state.data.students
      .filter((student) => `${student.name} ${student.email} ${student.goal}`.toLowerCase().includes(q))
      .filter((student) => studentMatchesStudentFilters(student, filters))
      .sort((a, b) => a.name.localeCompare(b.name));

    return `
      <div class="content-stack students-workspace">
        <section class="students-hero">
          <div>
            <h3>Alunos</h3>
            <p>Gerencie alunos, treinos e evolução.</p>
          </div>
          <button class="primary-action" type="button" data-manager-nav="newStudent">${icons.students}<span>Novo aluno</span></button>
        </section>

        <section class="student-search-panel" aria-label="Busca e filtros de alunos">
          <label class="student-search-field">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 21l-4.3-4.3M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z"/></svg>
            <input type="search" data-student-search placeholder="Buscar aluno por nome..." value="${escapeHtml(state.search)}" />
          </label>
          <div class="student-filter-grid">
            ${studentFilterSelect("status", "Status", filters.status, [
              ["all", "Todos"],
              ["active", "Ativo"],
              ["pending", "Pendente"],
              ["inactive", "Inativo"],
              ["access_pending", "Acesso pendente"],
              ["contract_pending", "Contrato pendente"],
              ["no_workout", "Sem treino publicado"],
              ["update_overdue", "Atualização atrasada"]
            ], icons.students)}
            ${studentFilterSelect("goal", "Objetivo", filters.goal, [
              ["all", "Todos"],
              ["hipertrofia", "Hipertrofia"],
              ["emagrecimento", "Emagrecimento"],
              ["condicionamento", "Condicionamento"],
              ["performance", "Performance"],
              ["forca", "Força"],
              ["reabilitacao", "Reabilitação"],
              ["qualidade_de_vida", "Qualidade de vida"],
              ["outro", "Outro"]
            ], icons.progress)}
            ${studentFilterSelect("contract", "Contrato", filters.contract, [
              ["all", "Todos"],
              ["active", "Ativo"],
              ["pending", "Pendente"],
              ["expired", "Vencido"],
              ["upcoming", "Próximo do vencimento"],
              ["none", "Sem contrato"]
            ], icons.contracts)}
          </div>
        </section>

        <div class="students-list-panel">
          ${students.length ? `<div class="student-card-list">${students.map(renderStudentRow).join("")}</div>` : emptyState("Nenhum aluno encontrado", state.search ? "Ajuste a busca ou os filtros para ver mais alunos." : "Crie um aluno para publicar treinos e acompanhar evolução.", icons.students)}
        </div>
      </div>
    `;
  }

  function studentFilterSelect(name, label, selected, options, icon) {
    return `
      <label class="student-filter">
        <span class="student-filter-icon">${icon}</span>
        <span class="student-filter-label">${escapeHtml(label)}</span>
        <select data-student-filter="${escapeHtml(name)}" aria-label="${escapeHtml(label)}">
          ${options.map(([value, optionLabel]) => `<option value="${escapeHtml(value)}" ${selected === value ? "selected" : ""}>${escapeHtml(optionLabel)}</option>`).join("")}
        </select>
      </label>
    `;
  }

  function renderNewStudentScreen() {
    const goalOptions = [
      ["hipertrofia", "Hipertrofia"],
      ["emagrecimento", "Emagrecimento"],
      ["condicionamento", "Condicionamento"],
      ["performance", "Performance"],
      ["forca", "Força"],
      ["reabilitacao", "Reabilitação"],
      ["qualidade_de_vida", "Qualidade de vida"]
    ];
    const sexOptions = [
      ["masculino", "Masculino"],
      ["feminino", "Feminino"],
      ["outro", "Outro"]
    ];
    const levelOptions = [
      ["beginner", "Iniciante"],
      ["intermediate", "Intermediario"],
      ["advanced", "Avancado"]
    ];
    const today = todayISO();
    return `
      <div class="new-student-screen">
        <div class="ns-topbar">
          <button class="icon-button ns-close" type="button" data-manager-nav="students" aria-label="Cancelar">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
          <h3>Novo aluno</h3>
          <div class="ns-topbar-spacer"></div>
        </div>

        <form class="ns-form" id="newStudentForm" novalidate>

          <section class="ns-section">
            <h4 class="ns-section-title">Dados pessoais</h4>

            <div class="ns-avatar-block">
              <div class="entity-avatar ns-avatar-preview" id="nsAvatarPreview" aria-hidden="true">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <button class="ns-avatar-btn" type="button" aria-label="Adicionar foto" tabindex="-1">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              </button>
            </div>

            <label class="field">
              <span>Nome completo <span class="ns-required" aria-hidden="true">*</span></span>
              <input name="name" type="text" placeholder="Ex: Maria Silva" autocomplete="name" required />
            </label>

            <div class="ns-row">
              <label class="field">
                <span>Telefone <span class="ns-required" aria-hidden="true">*</span></span>
                <input name="phone" type="tel" inputmode="numeric" placeholder="(11) 99999-9999" autocomplete="tel" required data-phone-mask />
              </label>
              <label class="field">
                <span>Nascimento</span>
                <input name="birthdate" type="date" max="${today}" />
              </label>
            </div>

            <label class="field">
              <span>E-mail</span>
              <input name="email" type="email" inputmode="email" placeholder="aluno@exemplo.com" autocomplete="email" />
            </label>

            <div class="ns-chip-label">Sexo</div>
            <div class="ns-chip-group" role="group" aria-label="Sexo">
              ${sexOptions.map(([value, label]) => `<label class="radio-chip"><input type="radio" name="sex" value="${value}" /><span>${label}</span></label>`).join("")}
            </div>
          </section>

          <section class="ns-section">
            <h4 class="ns-section-title">Objetivo</h4>
            <div class="ns-chip-group" role="group" aria-label="Objetivo">
              ${goalOptions.map(([value, label]) => `<label class="radio-chip"><input type="radio" name="goal" value="${value}" /><span>${label}</span></label>`).join("")}
            </div>
          </section>

          <section class="ns-section">
            <h4 class="ns-section-title">Contrato</h4>
            <div class="ns-row">
              <label class="field">
                <span>Plano</span>
                <select name="contractType">
                  <option value="">Sem contrato</option>
                  <option value="elite">Elite</option>
                  <option value="performance">Performance</option>
                  <option value="custom">Custom</option>
                </select>
              </label>
              <label class="field">
                <span>Valor / mes (R$)</span>
                <input name="contractValue" type="number" inputmode="decimal" placeholder="350" min="0" step="0.01" />
              </label>
            </div>
            <label class="field">
              <span>Inicio</span>
              <input name="contractStart" type="date" value="${today}" />
            </label>
          </section>

          <section class="ns-section">
            <h4 class="ns-section-title">Nivel</h4>
            <div class="ns-chip-group" role="group" aria-label="Nivel">
              ${levelOptions.map(([value, label]) => `<label class="radio-chip"><input type="radio" name="level" value="${value}" /><span>${label}</span></label>`).join("")}
            </div>
          </section>

          <section class="ns-section">
            <h4 class="ns-section-title">Observações internas</h4>
            <label class="field">
              <span class="sr-only">Observações</span>
              <textarea name="internalNotes" rows="4" placeholder="Anotações privadas sobre o aluno, histórico, restrições..."></textarea>
            </label>
          </section>

          <div class="ns-footer-spacer"></div>
        </form>

        <div class="ns-footer">
          <button class="secondary-action ns-cancel-btn" type="button" data-manager-nav="students">Cancelar</button>
          <div class="ns-footer-primary">
            <button class="primary-action" type="submit" form="newStudentForm">Salvar aluno</button>
            <button class="ghost-button ns-send-link-btn" type="button" data-ns-save-and-send>Salvar e enviar link</button>
          </div>
        </div>
      </div>
    `;
  }

  function normalizeFilterText(value = "") {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  function getStudentContractState(studentId) {
    const contracts = getStudentContracts(studentId);
    const today = todayISO();
    const active = contracts.find((contract) => contract.status === "signed");
    const pending = contracts.find((contract) => contract.status === "pending" || contract.status === "viewed");
    const current = pending || active || contracts[0] || null;
    if (!current) return { value: "none", label: "Sem contrato", tone: "warning", contract: null, plan: "Sem contrato" };
    const endDate = current.endDate || current.expiresAt || "";
    if (current.status === "signed" && endDate && endDate < today) return { value: "expired", label: "Vencido", tone: "danger", contract: current, plan: current.plan || "Contrato" };
    if (current.status === "signed" && endDate && endDate <= addDays(today, 30)) return { value: "upcoming", label: "Próx. vencimento", tone: "warning", contract: current, plan: current.plan || "Contrato" };
    if (current.status === "signed") return { value: "active", label: "Ativo", tone: "success", contract: current, plan: current.plan || "Contrato ativo" };
    if (current.status === "pending" || current.status === "viewed") return { value: "pending", label: "Pendente", tone: "warning", contract: current, plan: current.plan || "Contrato pendente" };
    return { value: current.status || "none", label: contractStatusLabel(current.status), tone: current.status === "canceled" ? "danger" : "", contract: current, plan: current.plan || "Contrato" };
  }

  function getStudentOperationalStatus(student) {
    const access = getStudentAccessState(student);
    const contract = getStudentContractState(student.id);
    const pendingUpdate = getUpdateForStudent(student.id, "pending");
    const publishedWorkouts = getStudentWorkouts(student.id, { publishedOnly: true });
    if (student.status === "inactive") return { value: "inactive", label: "Inativo", tone: "danger" };
    if (pendingUpdate && pendingUpdate.dueDate < todayISO()) return { value: "update_overdue", label: "Atualização atrasada", tone: "danger" };
    if (contract.value === "pending") return { value: "contract_pending", label: "Contrato pendente", tone: "warning" };
    if (access.value !== "active") return { value: "access_pending", label: "Acesso pendente", tone: "warning" };
    if (!publishedWorkouts.length) return { value: "no_workout", label: "Sem treino", tone: "warning" };
    return { value: "active", label: "Ativo", tone: "success" };
  }

  function studentMatchesStudentFilters(student, filters = state.studentFilters) {
    const status = getStudentOperationalStatus(student);
    const access = getStudentAccessState(student);
    const contract = getStudentContractState(student.id);
    const goal = normalizeFilterText(student.goal || "");
    if (filters.status && filters.status !== "all") {
      if (filters.status === "active" && student.status !== "active") return false;
      else if (filters.status === "pending" && !["access_pending", "contract_pending", "no_workout", "update_overdue"].includes(status.value) && access.value === "active") return false;
      else if (filters.status !== "active" && filters.status !== "pending" && status.value !== filters.status) return false;
    }
    if (filters.goal && filters.goal !== "all") {
      if (filters.goal === "outro") {
        const known = ["hipertrofia", "emagrecimento", "condicionamento", "performance", "forca", "reabilitacao", "qualidade_de_vida"];
        if (known.includes(goal)) return false;
      } else if (goal !== filters.goal) return false;
    }
    if (filters.contract && filters.contract !== "all" && contract.value !== filters.contract) return false;
    return true;
  }

  function renderStudentInfoBlock(icon, label, value) {
    return `
      <div class="student-info-block">
        <span class="student-info-icon">${icon}</span>
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
      </div>
    `;
  }

  function renderStudentRow(student) {
    const sessions = getStudentSessions(student.id);
    const pendingUpdate = getUpdateForStudent(student.id, "pending");
    const lastSession = sessions[0];
    const access = getStudentAccessState(student);
    const status = getStudentOperationalStatus(student);
    const contract = getStudentContractState(student.id);
    const nextUpdateLabel = pendingUpdate ? formatShortDate(pendingUpdate.dueDate) : "Em dia";
    const lastWorkoutLabel = lastSession ? formatShortDate(lastSession.finishedAt.slice(0, 10)) : "Nunca";
    const inviteLabel = access.value === "active" ? "Enviar link" : "Reenviar convite";
    const inviteAttr = access.value === "active"
      ? `data-open-send-link-sheet="${student.id}"`
      : `data-send-student-invite="${student.id}"`;
    return `
      <article class="student-card">
        <div class="student-card-top">
          ${studentAvatar(student)}
          <div class="student-card-main">
            <strong>${escapeHtml(student.name)}</strong>
            <span class="student-goal">${icons.goal}<span>${escapeHtml(student.goal || "Sem objetivo")}</span></span>
          </div>
          <div class="student-card-side">
            ${statusBadge(status.label, status.tone)}
          </div>
        </div>
        <div class="student-card-info">
          ${renderStudentInfoBlock(icons.agenda, "Próx. atualização", nextUpdateLabel)}
          ${renderStudentInfoBlock(icons.workouts, "Último treino", lastWorkoutLabel)}
          ${renderStudentInfoBlock(icons.contracts, "Contrato", contract.plan || contract.label)}
        </div>
        <div class="student-card-actions">
          <button class="secondary-action student-primary-link" type="button" data-open-student-profile="${student.id}">${icons.profile}<span>Abrir perfil</span></button>
          <button class="secondary-action student-secondary-link" type="button" ${inviteAttr}>${icons.link}<span>${escapeHtml(inviteLabel)}</span></button>
        </div>
      </article>
    `;
  }

  function renderMessagePreview(message) {
    const student = getStudent(message.studentId);
    return `
      <article class="entity-row">
        ${studentAvatar(student)}
        <div class="entity-main">
          <strong>${escapeHtml(getStudentName(message.studentId))}</strong>
          <span>${message.senderRole === "manager" ? "Personal" : "Aluno"} · ${new Date(message.createdAt).toLocaleString("pt-BR")}</span>
          <span>${escapeHtml(message.body)}</span>
        </div>
        <div class="row-actions">
          <button class="mini-button" type="button" data-open-messages="${escapeHtml(message.studentId)}">Abrir conversa</button>
        </div>
      </article>
    `;
  }

  function renderExerciseLibrary() {
    const muscles = uniqueOptions(state.data.exercises.flatMap(getExerciseMuscleGroups));
    const equipments = uniqueOptions(state.data.exercises.map((exercise) => exercise.equipment));
    const filters = state.exerciseFilters;
    const query = filters.q.toLowerCase();
    const exercises = state.data.exercises
      .filter((exercise) => (filters.status === "all" ? true : exercise.status === filters.status))
      .filter((exercise) => (filters.muscle ? getExerciseMuscleGroups(exercise).includes(filters.muscle) : true))
      .filter((exercise) => (filters.equipment ? exercise.equipment === filters.equipment : true))
      .filter((exercise) => {
        if (filters.video === "with") return hasExerciseVideo(exercise);
        if (filters.video === "without") return !hasExerciseVideo(exercise);
        return true;
      })
      .filter((exercise) =>
        `${exercise.name} ${getExerciseMuscleGroups(exercise).join(" ")} ${exercise.equipment} ${exercise.description} ${exercise.technicalNotes} ${exercise.videoName || exercise.videoUrl}`
          .toLowerCase()
          .includes(query)
      )
      .sort((a, b) => a.name.localeCompare(b.name));

    return renderExerciseLibraryPremium(exercises, filters, muscles, equipments);

    return `
      <div class="content-stack">
        ${pageHeader("Biblioteca de exercícios", "Cadastre exercícios com grupos musculares, equipamento e vídeo", '<button class="primary-action" type="button" data-open-exercise-form>Novo exercício</button>')}
        <section class="toolbar">
          <div class="toolbar-group">
            <input type="search" data-exercise-filter="q" placeholder="Pesquisar exercício" value="${escapeHtml(filters.q)}" />
            <select data-exercise-filter="muscle"><option value="">Grupo muscular</option>${muscles.map((item) => `<option value="${escapeHtml(item)}" ${filters.muscle === item ? "selected" : ""}>${escapeHtml(item)}</option>`).join("")}</select>
            <select data-exercise-filter="equipment"><option value="">Equipamento</option>${equipments.map((item) => `<option value="${escapeHtml(item)}" ${filters.equipment === item ? "selected" : ""}>${escapeHtml(item)}</option>`).join("")}</select>
            <select data-exercise-filter="status">
              <option value="active" ${filters.status === "active" ? "selected" : ""}>Ativos</option>
              <option value="inactive" ${filters.status === "inactive" ? "selected" : ""}>Inativos</option>
              <option value="all" ${filters.status === "all" ? "selected" : ""}>Todos</option>
            </select>
            <select data-exercise-filter="video">
              <option value="all" ${filters.video === "all" ? "selected" : ""}>Todos os vídeos</option>
              <option value="with" ${filters.video === "with" ? "selected" : ""}>Com vídeo</option>
              <option value="without" ${filters.video === "without" ? "selected" : ""}>Sem vídeo</option>
            </select>
          </div>
          <div class="toolbar-group"><span class="small-text">${exercises.length} exercício(s)</span></div>
        </section>
        <section class="panel">
          <div class="section-title"><h3>Exercícios cadastrados</h3><span class="small-text">Editar, inativar ou excluir com segurança</span></div>
          ${exercises.length ? `<div class="entity-list">${exercises.map(renderExerciseCard).join("")}</div>` : emptyState("Nenhum exercício encontrado", "Ajuste os filtros ou cadastre um novo exercício.", icons.library)}
        </section>
      </div>
    `;
  }

  function uniqueOptions(values) {
    return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }

  function renderExerciseLibraryPremium(exercises, filters, muscles, equipments) {
    const allExercises = state.data.exercises;
    const total = allExercises.length;
    const withVideo = allExercises.filter(hasExerciseVideo).length;
    const categoryCount = uniqueOptions(allExercises.flatMap(getExerciseMuscleGroups)).length;
    const monthKey = todayISO().slice(0, 7);
    const createdThisMonth = allExercises.filter((exercise) => String(exercise.createdAt || "").slice(0, 7) === monthKey).length;
    const videoPercent = total ? Math.round((withVideo / total) * 100) : 0;

    return `
      <div class="content-stack exercise-library-page">
        <section class="library-hero">
          <div>
            <span class="eyebrow">Elite AS</span>
            <h2>Biblioteca de exercícios</h2>
            <p>Gerencie exercícios e vídeos de execução</p>
          </div>
          <button class="primary-action library-primary-action" type="button" data-open-exercise-form>${icons.plus || "+"}<span>Novo exercício</span></button>
        </section>

        <section class="library-stat-grid" aria-label="Resumo da biblioteca">
          ${renderLibraryStatCard(icons.workouts, "Exercícios cadastrados", total, createdThisMonth ? `↑ ${createdThisMonth} este mês` : "Na biblioteca")}
          ${renderLibraryStatCard(icons.agenda, "Com vídeo", withVideo, `${videoPercent}% do total`)}
          ${renderLibraryStatCard(icons.more, "Categorias", categoryCount, "Ativas")}
        </section>

        <section class="library-search-row">
          <label class="library-search-field">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 21-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z"/></svg>
            <input type="search" data-exercise-filter="q" placeholder="Buscar exercício..." value="${escapeHtml(filters.q)}" />
          </label>
          <details class="library-filter-menu">
            <summary>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16l-6 7v5l-4 2v-7z"/></svg>
              <span>Filtrar</span>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>
            </summary>
            <div class="library-filter-panel">
              <label><span>Grupo muscular</span><select data-exercise-filter="muscle"><option value="">Todos</option>${muscles.map((item) => `<option value="${escapeHtml(item)}" ${filters.muscle === item ? "selected" : ""}>${escapeHtml(item)}</option>`).join("")}</select></label>
              <label><span>Equipamento</span><select data-exercise-filter="equipment"><option value="">Todos</option>${equipments.map((item) => `<option value="${escapeHtml(item)}" ${filters.equipment === item ? "selected" : ""}>${escapeHtml(item)}</option>`).join("")}</select></label>
              <label><span>Status</span><select data-exercise-filter="status">
                <option value="active" ${filters.status === "active" ? "selected" : ""}>Publicado</option>
                <option value="inactive" ${filters.status === "inactive" ? "selected" : ""}>Arquivado</option>
                <option value="all" ${filters.status === "all" ? "selected" : ""}>Todos</option>
              </select></label>
              <label><span>Vídeo</span><select data-exercise-filter="video">
                <option value="all" ${filters.video === "all" ? "selected" : ""}>Todos</option>
                <option value="with" ${filters.video === "with" ? "selected" : ""}>Com vídeo</option>
                <option value="without" ${filters.video === "without" ? "selected" : ""}>Sem vídeo</option>
              </select></label>
            </div>
          </details>
        </section>

        ${exercises.length ? `<section class="library-card-list">${exercises.map(renderPremiumExerciseCard).join("")}</section>` : emptyState("Nenhum exercício encontrado", "Ajuste os filtros ou cadastre um novo exercício.", icons.library)}
      </div>
    `;
  }

  function renderLibraryStatCard(icon, label, value, detail) {
    return `
      <article class="library-stat-card">
        <span class="library-stat-icon">${icon}</span>
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(String(value))}</strong>
        <small>${escapeHtml(detail)}</small>
      </article>
    `;
  }

  function renderPremiumExerciseCard(exercise) {
    const primaryMuscle = getExercisePrimaryMuscle(exercise);
    const equipment = exercise.equipment || "Livre";
    const hasVideo = hasExerciseVideo(exercise);
    const used = isExerciseUsed(exercise.id);
    const tag = exercise.category || exercise.tag || exercise.focus || primaryMuscle;
    const updated = exercise.updatedAt || exercise.createdAt ? formatShortDate(String(exercise.updatedAt || exercise.createdAt).slice(0, 10)) : "-";
    const status = exercise.status === "active"
      ? { label: "Publicado", tone: "success" }
      : { label: "Rascunho", tone: "muted" };
    const params = exercise.defaultSets || exercise.defaultReps || exercise.defaultRest
      ? `${escapeHtml(exercise.defaultSets || "3")} séries • ${escapeHtml(exercise.defaultReps || "10-12")} reps • ${escapeHtml(exercise.defaultRest || "60s")} descanso`
      : "Parâmetros definidos no treino";

    return `
      <article class="library-exercise-card ${hasVideo ? "has-video" : "is-missing-video"}">
        <div class="library-exercise-media">
          ${exerciseMediaHtml(exercise, primaryMuscle)}
        </div>
        <div class="library-exercise-content">
          <div class="library-exercise-header">
            <div>
              <h3>${escapeHtml(exercise.name)}</h3>
              <div class="library-exercise-meta">
                <span>${icons.agenda}${escapeHtml(primaryMuscle)}</span>
                <span>${icons.workouts}${escapeHtml(equipment)}</span>
              </div>
            </div>
            <div class="library-exercise-side">
              ${statusBadge(status.label, status.tone)}
              <details class="action-menu library-card-menu">
                <summary aria-label="Mais ações">${icons.more}</summary>
                <div>
                  ${hasVideo ? `<button class="mini-button" type="button" data-remove-exercise-video="${escapeHtml(exercise.id)}">Remover vídeo</button>` : `<button class="mini-button" type="button" data-vm-enviar-video="${escapeHtml(exercise.id)}">Enviar vídeo</button>`}
                  <button class="mini-button" type="button" data-toggle-exercise-status="${escapeHtml(exercise.id)}">${exercise.status === "active" ? "Arquivar" : "Publicar"}</button>
                  <button class="mini-button is-danger" type="button" data-delete-exercise="${escapeHtml(exercise.id)}">Excluir</button>
                </div>
              </details>
            </div>
          </div>
          <span class="library-tag">${escapeHtml(tag)}</span>
          <div class="library-exercise-detail">
            <span>${icons.today}${params}</span>
            <span>${icons.agenda}Editado em ${escapeHtml(updated)}</span>
            ${used ? `<span>${icons.library}Em uso em treinos</span>` : ""}
          </div>
        </div>
        ${hasVideo ? "" : renderExerciseVideoCallout(exercise)}
        <div class="library-exercise-actions">
          <button class="secondary-action" type="button" data-open-exercise-video="${escapeHtml(exercise.id)}">${icons.today}<span>Ver vídeo</span></button>
          <button class="secondary-action" type="button" data-open-exercise-form="${escapeHtml(exercise.id)}">${icons.settings}<span>Editar</span></button>
          <button class="primary-action" type="button" data-use-exercise-workout="${escapeHtml(exercise.id)}">${icons.workouts}<span>Usar no treino</span></button>
        </div>
      </article>
    `;
  }

  function exerciseMediaHtml(exercise, primaryMuscle) {
    const hasVideo = hasExerciseVideo(exercise);
    const thumbnail = exercise.thumbnailUrl || exercise.coverUrl || "";
    return `
      <button class="library-thumbnail ${hasVideo ? "has-video" : "is-placeholder"}" type="button" data-open-exercise-video="${escapeHtml(exercise.id)}" aria-label="Ver vídeo de ${escapeHtml(exercise.name)}">
        ${thumbnail ? `<img src="${escapeHtml(thumbnail)}" alt="" loading="lazy" />` : `<span class="library-thumbnail-fallback">${escapeHtml(String(primaryMuscle || "Elite").slice(0, 2).toUpperCase())}</span>`}
        <span class="library-play-badge"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span>
      </button>
    `;
  }

  function renderExerciseVideoCallout(exercise) {
    return `
      <div class="library-video-callout">
        <span class="library-callout-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/><path d="M7 17a4 4 0 0 1-1-7.9A5 5 0 0 1 15.7 7 4.5 4.5 0 0 1 17 16h-2"/></svg></span>
        <div>
          <strong>Envie seu vídeo de execução</strong>
          <span>Adicione um vídeo próprio para este exercício e personalize sua biblioteca.</span>
        </div>
        <button class="mini-button" type="button" data-vm-enviar-video="${escapeHtml(exercise.id)}">Enviar vídeo</button>
      </div>
    `;
  }

  function openExerciseVideo(exerciseId) { openVideoModal(exerciseId); }

  function openUseExerciseInWorkout(exerciseId) { openUsarTreinoSheet(exerciseId); }

  function handleUseExerciseForm(form) { handleUtForm(form); }

  async function openVideoModal(exerciseId) {
    const exercise = getExercise(exerciseId);
    if (!exercise) return showToast("Exercício não encontrado.");
    const modal = elements.videoModal;
    if (!modal) return;
    elements.videoModalTitle.textContent = exercise.name || "Exercício";
    const body = elements.videoModalBody;
    const footer = elements.videoModalFooter;
    const poster = exercise.thumbnailUrl || exercise.coverUrl || "";

    const placeholderHtml = (msg, btnLabel) => `
      <div class="vm-placeholder">
        <div class="vm-placeholder-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m10 9 6 3-6 3V9Z"/></svg>
        </div>
        <p class="vm-placeholder-text">${escapeHtml(msg)}</p>
        <button class="primary-action vm-upload-btn" type="button" data-vm-enviar-video="${escapeHtml(exerciseId)}">${escapeHtml(btnLabel)}</button>
      </div>`;

    function renderVideoPlayer(src) {
      body.innerHTML = `<div class="vm-player-wrap"><video class="vm-player" controls playsinline${poster ? ` poster="${escapeHtml(poster)}"` : ""}></video></div>`;
      const video = body.querySelector(".vm-player");
      video.addEventListener("error", () => {
        body.innerHTML = placeholderHtml("Não foi possível carregar o vídeo.", "Reenviar vídeo");
      });
      video.src = src;
    }

    function renderYouTubeEmbed(url) {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/);
      if (!match) { renderVideoPlayer(url); return; }
      const embedUrl = `https://www.youtube.com/embed/${match[1]}?rel=0`;
      body.innerHTML = `<div class="vm-player-wrap"><iframe class="vm-player" src="${escapeHtml(embedUrl)}" allow="autoplay; encrypted-media" allowfullscreen frameborder="0" title="${escapeHtml(exercise.name || "Vídeo")}"></iframe></div>`;
    }

    if (!hasExerciseVideo(exercise)) {
      body.innerHTML = placeholderHtml("Nenhum vídeo cadastrado", "Enviar vídeo");
    } else if (exercise.videoStorage === "indexeddb" && exercise.videoKey) {
      try {
        const blob = await readLocalVideo(exercise.videoKey);
        if (blob) {
          if (state.videoObjectUrls[exerciseId]) URL.revokeObjectURL(state.videoObjectUrls[exerciseId]);
          const url = URL.createObjectURL(blob);
          state.videoObjectUrls[exerciseId] = url;
          renderVideoPlayer(url);
        } else {
          body.innerHTML = placeholderHtml("Vídeo local não encontrado.", "Reenviar vídeo");
        }
      } catch {
        body.innerHTML = placeholderHtml("Erro ao carregar o vídeo.", "Reenviar vídeo");
      }
    } else if (exercise.videoStorage === "external" && exercise.videoUrl) {
      if (/youtube\.com|youtu\.be/.test(exercise.videoUrl)) {
        renderYouTubeEmbed(exercise.videoUrl);
      } else {
        renderVideoPlayer(exercise.videoUrl);
      }
    } else if (exercise.videoUrl) {
      renderVideoPlayer(exercise.videoUrl);
    } else {
      body.innerHTML = placeholderHtml("Nenhum vídeo cadastrado", "Enviar vídeo");
    }

    footer.innerHTML = `
      <button class="secondary-action" type="button" data-vm-usar-treino="${escapeHtml(exerciseId)}">Usar no treino</button>
      <button class="primary-action" type="button" data-vm-editar="${escapeHtml(exerciseId)}">Editar</button>`;
    _openSheet(modal);
    document.body.style.overflow = "hidden";
  }

  function closeVideoModal() {
    const modal = elements.videoModal;
    if (!modal || modal.hidden) return;
    const video = elements.videoModalBody?.querySelector("video");
    if (video) { video.pause(); video.src = ""; }
    _closeSheet(modal, () => {
      elements.videoModalBody.innerHTML = "";
      elements.videoModalFooter.innerHTML = "";
      document.body.style.overflow = "";
    });
  }

  function openUsarTreinoSheet(exerciseId) {
    const exercise = getExercise(exerciseId);
    if (!exercise) return showToast("Exercício não encontrado.");
    const sheet = elements.usarTreinoSheet;
    const body = elements.utSheetBody;
    if (!sheet || !body) return;
    const patterns = getAvailableWorkoutPatterns();
    body.innerHTML = `
      <form class="form-grid ut-form" id="utForm" data-exercise-id="${escapeHtml(exerciseId)}">
        <div class="ut-exercise-header">
          <span class="ut-exercise-name">${escapeHtml(exercise.name)}</span>
        </div>
        <div class="search-filter-row">
          <input class="search-input" type="search" id="utSearch" placeholder="Buscar padrão…" autocomplete="off" />
        </div>
        <div class="ut-pattern-list" id="utPatternList" role="radiogroup" aria-label="Selecionar padrão">
          <label class="ut-radio-item">
            <input type="radio" name="patternId" value="__new__" checked>
            <span class="ut-radio-label">
              <span class="ut-radio-name">Novo padrão de treino</span>
              <span class="ut-radio-sub">Cria um rascunho com este exercício</span>
            </span>
          </label>
          ${patterns.map((p) => `
            <label class="ut-radio-item" data-pattern-name="${escapeHtml(p.title.toLowerCase())}">
              <input type="radio" name="patternId" value="${escapeHtml(p.id)}">
              <span class="ut-radio-label">
                <span class="ut-radio-name">${escapeHtml(p.title)}</span>
                <span class="ut-radio-sub">${p.exercises?.length || 0} exercício${(p.exercises?.length || 0) !== 1 ? "s" : ""}</span>
              </span>
            </label>`).join("")}
        </div>
        <details class="ut-params-details">
          <summary class="ut-params-summary">Configurar séries e repetições</summary>
          <div class="ut-params-grid">
            <label class="field"><span>Séries</span><input type="number" name="sets" min="1" max="20" value="3" /></label>
            <label class="field"><span>Reps</span><input type="text" name="reps" value="10" placeholder="ex: 8-12" /></label>
            <label class="field"><span>Descanso (s)</span><input type="number" name="rest" min="10" max="600" value="60" /></label>
          </div>
        </details>
      </form>`;
    const utFooter = elements.utSheetFooter;
    if (utFooter) utFooter.innerHTML = `
      <div class="ut-footer-row">
        <button class="secondary-action" type="button" data-close-ut-sheet>Cancelar</button>
        <button class="primary-action" type="submit" form="utForm">Adicionar</button>
      </div>`;
    document.getElementById("utSearch").addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase().trim();
      document.querySelectorAll("#utPatternList .ut-radio-item[data-pattern-name]").forEach((item) => {
        item.hidden = q ? !item.dataset.patternName.includes(q) : false;
      });
    });
    _openSheet(sheet);
    document.body.style.overflow = "hidden";
  }

  function closeUsarTreinoSheet() {
    const sheet = elements.usarTreinoSheet;
    if (!sheet || sheet.hidden) return;
    _closeSheet(sheet, () => {
      if (elements.utSheetBody) elements.utSheetBody.innerHTML = "";
      document.body.style.overflow = "";
    });
  }

  function handleUtForm(form) {
    const exerciseId = form.dataset.exerciseId;
    const exercise = getExercise(exerciseId);
    if (!exercise) return showToast("Exercício não encontrado.");
    const patternId = form.elements.patternId?.value;
    const sets = parseInt(form.elements.sets?.value) || 3;
    const reps = (form.elements.reps?.value || "10").trim();
    const rest = parseInt(form.elements.rest?.value) || 60;
    const exerciseRow = normalizeWorkoutExercise({ exerciseId, exerciseName: exercise.name, sets, targetReps: reps, restSeconds: rest }, 0);
    if (patternId === "__new__") {
      const newId = createId("workout");
      state.data.workouts.unshift(normalizeWorkout({
        id: newId,
        trainerId: TRAINER_ID,
        studentId: "",
        title: exercise.name,
        description: `Padrão criado a partir de ${exercise.name}.`,
        focus: getExercisePrimaryMuscle(exercise),
        level: "",
        status: "draft",
        exercises: [exerciseRow],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      persistData();
      closeUsarTreinoSheet();
      closeVideoModal();
      showToast("Padrão criado. Abrindo montador…");
      openWorkoutForm(newId);
      return;
    }
    const workout = getWorkout(patternId);
    if (!workout) return showToast("Selecione um padrão.");
    workout.exercises = Array.isArray(workout.exercises) ? workout.exercises : [];
    workout.exercises.push(normalizeWorkoutExercise({ ...exerciseRow, order: workout.exercises.length + 1 }, workout.exercises.length));
    workout.updatedAt = new Date().toISOString();
    persistData();
    closeUsarTreinoSheet();
    closeVideoModal();
    showToast("Exercício adicionado ao padrão.");
    openWorkoutForm(patternId);
  }

  function openEnviarVideoSheet(exerciseId) {
    const exercise = getExercise(exerciseId);
    if (!exercise) return showToast("Exercício não encontrado.");
    const sheet = elements.enviarVideoSheet;
    const body = elements.evSheetBody;
    if (!sheet || !body) return;
    let selectedFile = null;
    let previewUrl = null;

    const evFooter = elements.evSheetFooter;

    function renderEmpty() {
      body.innerHTML = `
        <div class="ev-body">
          <label class="ev-drop-area">
            <input type="file" class="ev-file-input" accept="video/mp4,video/webm,video/quicktime" />
            <div class="ev-drop-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
            </div>
            <p class="ev-drop-label">Toque para selecionar ou arraste o vídeo</p>
            <p class="ev-drop-sub">MP4, MOV ou WebM · máx 200 MB</p>
          </label>
        </div>`;
      body.querySelector(".ev-file-input").addEventListener("change", (e) => {
        if (e.target.files[0]) handleFileSelected(e.target.files[0]);
      });
      if (evFooter) evFooter.innerHTML = `
        <div class="ut-footer-row">
          <button class="secondary-action" type="button" data-close-ev-sheet>Cancelar</button>
          <button class="primary-action" type="button" disabled>Salvar</button>
        </div>`;
    }

    function renderSelected() {
      body.innerHTML = `
        <div class="ev-body">
          <div class="ev-preview-wrap">
            <video class="ev-preview-video" src="${previewUrl}" playsinline muted></video>
          </div>
          <div class="ev-file-info">
            <span class="ev-file-name">${escapeHtml(selectedFile.name)}</span>
            <span class="ev-file-size">${formatFileSize(selectedFile.size)}</span>
          </div>
          <div class="ev-progress-wrap" id="evProgressWrap" style="display:none">
            <div class="ev-progress-bar" id="evProgressBar" style="width:0%"></div>
          </div>
          <div class="ev-error" id="evError" style="display:none"></div>
          <div class="ev-file-actions" id="evFileActions">
            <label class="secondary-action ev-replace-label">
              <input type="file" class="ev-file-input" accept="video/mp4,video/webm,video/quicktime" />
              Substituir
            </label>
            <button class="ghost-button" type="button" id="evRemoveBtn">Remover</button>
          </div>
        </div>`;
      body.querySelector(".ev-file-input").addEventListener("change", (e) => {
        if (e.target.files[0]) handleFileSelected(e.target.files[0]);
      });
      document.getElementById("evRemoveBtn").addEventListener("click", () => {
        if (previewUrl) { URL.revokeObjectURL(previewUrl); previewUrl = null; }
        selectedFile = null;
        renderEmpty();
      });
      if (evFooter) {
        evFooter.innerHTML = `
          <div class="ut-footer-row">
            <button class="secondary-action" type="button" data-close-ev-sheet>Cancelar</button>
            <button class="primary-action" type="button" id="evSaveBtn">Salvar</button>
          </div>`;
        evFooter.querySelector("#evSaveBtn").addEventListener("click", handleSave);
      }
    }

    function handleFileSelected(file) {
      const allowed = ["video/mp4", "video/webm", "video/quicktime"];
      if (file.type && !allowed.includes(file.type)) { showToast("Use vídeo MP4, WebM ou MOV."); return; }
      if (file.size > 200 * 1024 * 1024) { showToast("O vídeo deve ter até 200 MB."); return; }
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      selectedFile = file;
      previewUrl = URL.createObjectURL(file);
      renderSelected();
    }

    async function handleSave() {
      if (!selectedFile) return;
      const saveBtn = document.getElementById("evSaveBtn");
      const progressWrap = document.getElementById("evProgressWrap");
      const progressBar = document.getElementById("evProgressBar");
      const errorEl = document.getElementById("evError");
      const fileActions = document.getElementById("evFileActions");
      saveBtn.disabled = true;
      if (fileActions) fileActions.style.display = "none";
      errorEl.style.display = "none";
      progressWrap.style.display = "block";
      let prog = 0;
      const timer = setInterval(() => {
        prog = Math.min(prog + (85 - prog) * 0.1, 85);
        progressBar.style.width = prog + "%";
      }, 120);
      try {
        const videoData = await uploadExerciseVideo(selectedFile, exercise.id);
        clearInterval(timer);
        progressBar.style.width = "100%";
        Object.assign(exercise, videoData);
        exercise.updatedAt = new Date().toISOString();
        persistData();
        showToast("Vídeo salvo.");
        if (previewUrl) { URL.revokeObjectURL(previewUrl); previewUrl = null; }
        closeEnviarVideoSheet();
        setTimeout(() => openVideoModal(exercise.id), 150);
      } catch (err) {
        clearInterval(timer);
        progressBar.style.width = "0%";
        progressWrap.style.display = "none";
        if (fileActions) fileActions.style.display = "flex";
        saveBtn.disabled = false;
        const msg = err?.message || "Erro ao enviar vídeo.";
        errorEl.innerHTML = `${escapeHtml(msg)} <button class="ghost-button ev-retry-btn" type="button">Tentar de novo</button>`;
        errorEl.style.display = "flex";
        errorEl.querySelector(".ev-retry-btn").addEventListener("click", handleSave);
      }
    }

    renderEmpty();
    _openSheet(sheet);
    document.body.style.overflow = "hidden";
  }

  function closeEnviarVideoSheet() {
    const sheet = elements.enviarVideoSheet;
    if (!sheet || sheet.hidden) return;
    _closeSheet(sheet, () => {
      if (elements.evSheetBody) elements.evSheetBody.innerHTML = "";
      document.body.style.overflow = "";
    });
  }

  function renderExerciseCard(exercise) {
    const used = isExerciseUsed(exercise.id);
    const primaryMuscle = getExercisePrimaryMuscle(exercise);
    const secondaryMuscles = getExerciseSecondaryMuscles(exercise);
    const videoLabel = hasExerciseVideo(exercise) ? "Com vídeo" : "Sem vídeo";
    return `
      <article class="entity-row compact-row library-row">
        <div class="entity-main">
          <strong>${escapeHtml(exercise.name)}</strong>
          <span><b>Principal:</b> ${escapeHtml(primaryMuscle)} · ${escapeHtml(exercise.equipment)}</span>
          <div class="muscle-chip-row">
            ${secondaryMuscles.length ? secondaryMuscles.map((item) => `<span class="subtle-chip">${escapeHtml(item)}</span>`).join("") : '<span class="small-text">Sem grupos secundários.</span>'}
          </div>
          <span>${escapeHtml(exercise.description || "Sem descrição cadastrada.")}</span>
          <div class="badge-row">
            <span class="badge ${exercise.status === "active" ? "is-success" : "is-danger"}">${exercise.status === "active" ? "Ativo" : "Inativo"}</span>
            ${statusBadge(videoLabel, hasExerciseVideo(exercise) ? "info" : "")}
            ${used ? statusBadge("Em uso") : ""}
          </div>
          ${videoActionHtml(exercise)}
        </div>
        <div class="row-actions library-actions">
          <button class="mini-button" type="button" data-open-exercise-form="${exercise.id}">Editar</button>
          <details class="action-menu">
            <summary>Mais ações</summary>
            <div>
              ${hasExerciseVideo(exercise) ? `<button class="mini-button" type="button" data-remove-exercise-video="${exercise.id}">Remover vídeo</button>` : ""}
              <button class="mini-button" type="button" data-toggle-exercise-status="${exercise.id}">${exercise.status === "active" ? "Inativar" : "Ativar"}</button>
              <button class="mini-button is-danger" type="button" data-delete-exercise="${exercise.id}">Excluir</button>
            </div>
          </details>
        </div>
      </article>
    `;
  }

  function renderManagerWorkouts() {
    const allPatterns = getWorkoutPatterns();
    const filters = state.workoutFilters;
    const query = normalizeFilterText(filters.q);
    const workouts = allPatterns
      .filter((workout) => (filters.status === "all" ? true : workout.status === filters.status))
      .filter((workout) => {
        const goalFilter = filters.goal || "all";
        if (goalFilter === "all") return true;
        return normalizeFilterText(workout.focus || workout.goal || "") === normalizeFilterText(goalFilter);
      })
      .filter((workout) => {
        if (filters.level === "all") return true;
        if (filters.level === "none") return !workout.level;
        return workout.level === filters.level;
      })
      .filter((workout) => {
        if (!query) return true;
        const haystack = [
          workout.title,
          workout.description,
          workout.focus,
          workout.goal,
          workoutLevelLabel(workout.level),
          ...workout.exercises.map((row) => getExercise(row.exerciseId)?.name || row.exerciseName || "")
        ];
        return haystack.some((item) => normalizeFilterText(item).includes(query));
      });
    const uniqueExercises = new Set(allPatterns.flatMap((workout) => workout.exercises.map((exercise) => exercise.exerciseId)).filter(Boolean));
    return `
      <div class="content-stack patterns-workspace">
        <section class="patterns-hero">
          <div class="patterns-hero-text">
            <span class="eyebrow">Elite AS</span>
            <h3>Padrões de treino</h3>
            <p>Modelos reutilizáveis para treinos</p>
          </div>
          <button class="patterns-new-btn" type="button" data-open-workout-form>
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
            <span>Novo padrão</span>
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </section>
        <section class="metrics-row metrics-row--3">
          ${stdMetricCard("Total de padrões", allPatterns.length, "Modelos criados", "")}
          ${stdMetricCard("Rascunhos", allPatterns.filter((workout) => workout.status === "draft").length, "Em edição", "warning")}
          ${stdMetricCard("Publicados", allPatterns.filter((workout) => workout.status === "published").length, "Disponíveis", "success")}
        </section>
        ${(() => {
          const hasActiveFilters = filters.status !== "all" || (filters.goal || "all") !== "all" || filters.level !== "all";
          const activeFilterCount = [filters.status !== "all", (filters.goal || "all") !== "all", filters.level !== "all"].filter(Boolean).length;
          const filterPanelOpen = state.workoutFilterOpen || hasActiveFilters;
          return `
          <div class="search-filter-row" aria-label="Busca e filtros de padrões">
            <label class="pattern-search-field search-input-wrap">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 21-4.3-4.3M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z"/></svg>
              <input type="search" data-workout-filter="q" placeholder="Buscar padrões de treino..." value="${escapeHtml(filters.q)}" />
            </label>
            <button class="filter-btn" type="button" data-toggle-workout-filter>
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M7 12h10M10 18h4"/></svg>
              <span>Filtrar</span>
              ${hasActiveFilters ? `<span class="filter-active-pill">${activeFilterCount}</span>` : ""}
              <svg class="filter-chevron${filterPanelOpen ? " is-open" : ""}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
            </button>
          </div>
          ${filterPanelOpen ? `
          <div class="pattern-filter-grid">
            ${patternFilterSelect("status", "Status", icons.profile, [["all", "Todos"],["published", "Publicado"],["draft", "Rascunho"],["archived", "Arquivado"]], filters.status)}
            ${patternFilterSelect("goal", "Objetivo", icons.goal, patternGoalOptions(), filters.goal || "all")}
            ${patternFilterSelect("level", "Nível", icons.workouts, [["all", "Todos"],["beginner", "Iniciante"],["intermediate", "Intermediário"],["advanced", "Avançado"],["none", "Não definido"]], filters.level)}
          </div>` : ""}
          `;
        })()}
        <section class="patterns-list-panel">
          ${state.data.exercises.some((exercise) => exercise.status === "active") ? "" : emptyState("Biblioteca vazia", "Cadastre exercícios ativos antes de montar um padrão.", icons.library)}
          ${workouts.length ? `<div class="pattern-card-list">${workouts.map(renderPatternCard).join("")}</div>` : emptyState(allPatterns.length ? "Nenhum padrão encontrado" : "Nenhum padrão criado ainda", allPatterns.length ? "Tente ajustar os filtros ou criar um novo modelo." : "Crie modelos base para agilizar a montagem dos treinos dos alunos.", icons.workouts)}
        </section>
      </div>
    `;
  }

  function patternGoalOptions() {
    const baseGoals = ["Hipertrofia", "Emagrecimento", "Condicionamento", "Performance", "Força", "Mobilidade", "Adaptação", "Reabilitação", "Outro"];
    const currentGoals = getWorkoutPatterns().map((workout) => workout.focus || workout.goal || "").filter(Boolean);
    const goals = [...new Set([...baseGoals, ...currentGoals])];
    return [["all", "Todos"], ...goals.map((goal) => [goal, goal])];
  }

  function patternFilterSelect(name, label, icon, options, selected = "all") {
    return `
      <label class="pattern-filter">
        <span class="pattern-filter-icon">${icon}</span>
        <span class="pattern-filter-label">${escapeHtml(label)}</span>
        <select data-workout-filter="${escapeHtml(name)}">
          ${options.map(([value, text]) => `<option value="${escapeHtml(value)}" ${String(selected || "all") === String(value) ? "selected" : ""}>${escapeHtml(text)}</option>`).join("")}
        </select>
      </label>
    `;
  }

  function renderPatternCard(workout) {
    const exerciseCount = workout.exercises.length;
    const goal = workout.focus || workout.goal || "Sem objetivo";
    const updatedAt = workout.updatedAt ? formatDate(workout.updatedAt.slice(0, 10)) : workout.createdAt ? formatDate(workout.createdAt.slice(0, 10)) : "-";
    return `
      <article class="pattern-card">
        <div class="pattern-card-head">
          <span class="pattern-icon">${icons.workouts}</span>
          <div class="pattern-card-title-wrap">
            <h3 class="pattern-name">${escapeHtml(workout.title)}</h3>
            <span class="badge ${patternStatusClass(workout.status)}">${patternStatusLabel(workout.status)}</span>
          </div>
        </div>
        <ul class="pattern-meta-lines">
          <li><span class="pml-label">Objetivo</span><span class="pml-value">${escapeHtml(goal)}</span></li>
          <li><span class="pml-label">Nível</span><span class="pml-value">${escapeHtml(workoutLevelLabel(workout.level))}</span></li>
          <li><span class="pml-label">Exercícios</span><span class="pml-value">${exerciseCount}</span></li>
          <li><span class="pml-label">Última edição</span><span class="pml-value">${escapeHtml(updatedAt)}</span></li>
        </ul>
        <div class="pattern-card-actions">
          <button class="secondary-action pattern-apply-button" type="button" data-open-apply-pattern-form="${escapeHtml(workout.id)}">
            <span>Aplicar</span>
          </button>
          <details class="action-menu pattern-action-menu">
            <summary aria-label="Mais ações">${icons.more}</summary>
            <div>
              <button class="mini-button" type="button" data-open-workout-form="${escapeHtml(workout.id)}">Visualizar/editar</button>
              <button class="mini-button" type="button" data-duplicate-workout="${escapeHtml(workout.id)}">Duplicar</button>
              ${workout.status === "archived" ? `<button class="mini-button" type="button" data-restore-workout="${escapeHtml(workout.id)}">Reativar</button>` : `<button class="mini-button" type="button" data-archive-workout="${escapeHtml(workout.id)}">Arquivar</button>`}
              <button class="mini-button is-danger" type="button" data-delete-workout="${escapeHtml(workout.id)}">Remover</button>
            </div>
          </details>
        </div>
      </article>
    `;
  }

  function patternMetaInline(icon, label, value) {
    return `
      <span class="pattern-meta-item">
        <span class="pattern-meta-icon">${icon}</span>
        <small>${escapeHtml(label)}</small>
        <strong>${escapeHtml(value || "-")}</strong>
      </span>
    `;
  }

  function patternExercisePreviewLine(workout) {
    if (!workout.exercises.length) return "";
    const rows = [...workout.exercises].sort((a, b) => a.order - b.order);
    const names = rows.slice(0, 3).map((r) => getExercise(r.exerciseId)?.name || r.exerciseName || "?").join(" · ");
    const extra = rows.length > 3 ? ` +${rows.length - 3}` : "";
    return `<p class="pattern-exercise-preview">${escapeHtml(names + extra)}</p>`;
  }

  function patternMetaItem(icon, label, value) {
    return `
      <article class="pattern-meta-item">
        <span>${icon}</span>
        <small>${escapeHtml(label)}</small>
        <strong>${escapeHtml(value || "-")}</strong>
      </article>
    `;
  }

  function renderPatternExercisePreview(workout) {
    if (!workout.exercises.length) {
      return `<div class="pattern-preview is-empty"><strong>Sem exercícios</strong><span>Use a Biblioteca de exercícios para montar este padrão.</span></div>`;
    }
    const rows = [...workout.exercises].sort((a, b) => a.order - b.order);
    const visibleRows = rows.slice(0, 3);
    const extra = rows.length - visibleRows.length;
    return `
      <div class="pattern-preview">
        ${visibleRows
          .map((row, index) => {
            const exercise = getExercise(row.exerciseId);
            const name = exercise?.name || row.exerciseName || "Exercício indisponível";
            const target = `${escapeHtml(row.sets)}x${escapeHtml(row.targetReps)} · ${escapeHtml(row.restSeconds)}s${row.suggestedLoad ? ` · ${escapeHtml(row.suggestedLoad)}` : ""}`;
            return `<span><b>${index + 1}. ${escapeHtml(name)}</b><small>${target}</small></span>`;
          })
          .join("")}
        ${extra > 0 ? `<span class="pattern-preview-extra">+${extra} exercício(s)</span>` : ""}
      </div>
    `;
  }

  function patternStatusLabel(status) {
    return { draft: "Rascunho", published: "Publicado", archived: "Arquivado" }[status] || "Rascunho";
  }

  function patternStatusClass(status) {
    return { draft: "is-info", published: "is-success", archived: "is-muted" }[status] || "is-info";
  }

  function renderWorkoutExercisePreview(workout) {
    if (!workout.exercises.length) return emptyState("Nenhum exercício", "Adicione exercícios para montar este treino.", icons.workouts);
    const rows = [...workout.exercises].sort((a, b) => a.order - b.order);
    const visibleRows = rows.slice(0, 4);
    const extra = rows.length - visibleRows.length;
    return `
      <div class="workout-exercise-preview">
        ${visibleRows
          .map((row, index) => {
            const exercise = getExercise(row.exerciseId);
            const name = exercise?.name || row.exerciseName || "Exercício indisponível";
            return `<span>${index + 1}. ${escapeHtml(name)} · ${escapeHtml(row.sets)}x${escapeHtml(row.targetReps)} · ${escapeHtml(row.restSeconds)}s</span>`;
          })
          .join("")}
        ${extra > 0 ? `<span>+${extra} exercício(s)</span>` : ""}
      </div>
    `;
  }

  function renderWorkoutCard(workout, isManager) {
    const isPattern = isWorkoutPattern(workout);
    const lastSession = isPattern ? null : getStudentSessions(workout.studentId).find((session) => session.workoutId === workout.id);
    const exerciseCount = workout.exercises.length;
    const ownerLabel = isPattern ? "Padrão de treino" : getStudentName(workout.studentId);
    const levelLabel = workoutLevelLabel(workout.level);
    const originLabel = isPattern ? "Modelo base" : workout.sourcePatternTitle ? `A partir de ${workout.sourcePatternTitle}` : "Criado do zero";
    const createdLabel = workout.createdAt ? formatDate(workout.createdAt.slice(0, 10)) : "-";
    const executionLabel = isPattern ? "não se aplica" : lastSession ? formatDate(lastSession.finishedAt.slice(0, 10)) : "nunca";
    return `
      <article class="workout-row">
        <div class="workout-main">
          <strong>${escapeHtml(workout.title)}</strong>
          <span>${escapeHtml(ownerLabel)} · ${escapeHtml(workout.focus || "Sem foco")} · ${escapeHtml(levelLabel)} · ${exerciseCount} exercício(s)</span>
          <span>${escapeHtml(workout.description || "Sem descrição.")}</span>
          <span>Criado em ${escapeHtml(createdLabel)} · Última execução: ${escapeHtml(executionLabel)} · ${escapeHtml(originLabel)}</span>
          ${renderWorkoutExercisePreview(workout)}
          <div class="badge-row">
            <span class="badge ${workout.status === "published" ? "is-success" : workout.status === "archived" ? "is-danger" : "is-info"}">${statusWorkout(workout.status, isPattern)}</span>
            ${
              isPattern
                ? statusBadge("Modelo base", "info")
                : `<span class="badge">Última vez: ${lastSession ? formatDate(lastSession.finishedAt.slice(0, 10)) : "nunca"}</span>`
            }
          </div>
        </div>
        <div class="row-actions workout-actions">
          ${
            isManager
              ? `
                ${isPattern ? `<button class="mini-button" type="button" data-open-apply-pattern-form="${workout.id}">Aplicar</button>` : ""}
                ${!isPattern && workout.status === "draft" ? `<button class="mini-button" type="button" data-publish-workout="${workout.id}">Publicar</button>` : ""}
                ${!isPattern && workout.status !== "draft" ? `<button class="mini-button" type="button" data-open-workout-form="${workout.id}">Editar</button>` : ""}
                <details class="action-menu">
                  <summary>Mais ações</summary>
                  <div>
                    <button class="mini-button" type="button" data-open-workout-form="${workout.id}">Editar</button>
                    <button class="mini-button" type="button" data-duplicate-workout="${workout.id}">Duplicar</button>
                    ${
                      workout.status === "archived"
                        ? `<button class="mini-button" type="button" data-restore-workout="${workout.id}">Reativar</button>`
                        : `<button class="mini-button" type="button" data-archive-workout="${workout.id}">Arquivar</button>`
                    }
                    <button class="mini-button is-danger" type="button" data-delete-workout="${workout.id}">Remover</button>
                  </div>
                </details>
              `
              : workout.status === "published"
                ? `<button class="primary-action" type="button" data-start-workout="${workout.id}">Iniciar treino</button>`
                : ""
          }
        </div>
      </article>
    `;
  }

  function statusWorkout(status, isPattern = false) {
    return { draft: "Rascunho", published: isPattern ? "Disponível" : "Publicado", archived: "Arquivado" }[status] || "Rascunho";
  }

  function renderStudentWorkouts() {
    if (state.activeSession) return renderWorkoutExecution();
    const student = getCurrentStudent();
    const workouts = getStudentWorkouts(student?.id, { publishedOnly: true });
    return `
      <div class="content-stack">
        ${pageHeader("Treinos", "Escolha um treino publicado pelo personal")}
        <section class="panel">
          <div class="section-title"><h3>Treinos publicados</h3><span class="small-text">${workouts.length} treino(s)</span></div>
          ${workouts.length ? `<div class="workout-list">${workouts.map((workout) => renderWorkoutCard(workout, false)).join("")}</div>` : emptyState("Nenhum treino publicado", "Quando o personal publicar um treino, ele aparece aqui.", icons.workouts)}
        </section>
      </div>
    `;
  }

  function renderStudentToday() {
    if (state.activeSession) return renderWorkoutExecution();
    const student = getCurrentStudent();
    const agenda = getAgendaItemsForDate(todayISO(), student?.id);
    const workouts = getStudentWorkouts(student?.id, { publishedOnly: true });
    const sessions = getStudentSessions(student?.id);
    const nextWorkout = agenda.find((item) => item.type === "workout" && item.workoutId && item.status !== "done") || null;
    const nextWorkoutData = nextWorkout ? getWorkout(nextWorkout.workoutId) : null;
    const nextUpdate = state.data.updates.find((item) => item.studentId === student?.id && item.status === "pending") || null;

    const nextWorkoutCard = nextWorkout
      ? `<section class="next-workout-card">
          <div class="next-workout-card__info">
            <span class="next-workout-card__label">Próximo treino</span>
            <strong class="next-workout-card__name">${escapeHtml(nextWorkoutData?.title || nextWorkout.title || "Treino")}</strong>
            <span class="next-workout-card__meta">${formatDate(nextWorkout.date)} · ${nextWorkout.time}</span>
          </div>
          <button class="primary-action" type="button" data-start-workout="${nextWorkout.workoutId}" data-activity-id="${nextWorkout.id}">Iniciar</button>
        </section>`
      : `<section class="next-workout-card next-workout-card--empty">
          <div class="next-workout-card__info">
            <span class="next-workout-card__label">Próximo treino</span>
            <strong class="next-workout-card__name">Nenhum treino agendado para hoje</strong>
          </div>
          <button class="primary-action" type="button" data-student-nav="workouts">Ver treinos</button>
        </section>`;

    return `
      <div class="content-stack">
        <section class="dashboard-hero">
          <div>
            <h3>Início</h3>
            <p>${escapeHtml(student?.name || "Aluno")} · ${agenda.length} item(ns) na agenda hoje</p>
          </div>
        </section>
        ${nextWorkoutCard}
        <section class="metric-grid">
          ${metricCard("Treinos na semana", sessionsThisWeek(student?.id).length)}
          ${metricCard("Treinos no mês", sessionsThisMonth(student?.id).length)}
          ${metricCard("Volume último treino", sessions[0] ? sessions[0].totalVolumeLoad : 0)}
          ${metricCard("Atualizações pendentes", state.data.updates.filter((item) => item.studentId === student?.id && item.status === "pending").length)}
        </section>
        ${
          nextUpdate
            ? `<section class="panel action-panel"><div><strong>Atualização quinzenal pendente</strong><span class="small-text">Vencimento ${formatDate(nextUpdate.dueDate)}</span></div><button class="primary-action" type="button" data-open-update-form="${nextUpdate.id}">Enviar atualização</button></section>`
            : ""
        }
        <section class="panel">
          <div class="section-title"><h3>Agenda de hoje</h3></div>
          ${renderAgendaList(agenda, false)}
        </section>
      </div>
    `;
  }

  function getAgendaItemsForDate(isoDate, studentId = "") {
    const activities = state.data.activities
      .filter((item) => item.date === isoDate)
      .filter((item) => (studentId ? item.studentId === studentId : true));
    const contractItems = state.data.contracts
      .filter((contract) => contract.status === "pending" || contract.status === "viewed")
      .filter((contract) => (studentId ? contract.studentId === studentId : true))
      .filter((contract) => getContractAgendaDate(contract) === isoDate)
      .map((contract) =>
        normalizeActivity({
          id: `contract-agenda-${contract.id}`,
          studentId: contract.studentId,
          type: "contract",
          title: `Contrato pendente: ${contract.title}`,
          date: isoDate,
          time: "09:00",
          duration: "",
          status: "contract_pending",
          notes: "Aceite obrigatório antes do acesso completo.",
          contractId: contract.id
        })
      );
    const unlinkedSessions = state.data.sessions
      .filter((session) => isSameDay(session.finishedAt, isoDate))
      .filter((session) => !session.activityId)
      .filter((session) => !activities.some((activity) => activity.completedSessionId === session.id))
      .filter((session) => (studentId ? session.studentId === studentId : true))
      .map((session) =>
        normalizeActivity({
          id: `session-agenda-${session.id}`,
          studentId: session.studentId,
          type: "workout",
          title: `Treino concluído: ${getWorkout(session.workoutId)?.title || "Treino"}`,
          date: isoDate,
          time: new Date(session.finishedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          duration: "",
          status: "done",
          completedSessionId: session.id
        })
      );
    return [...activities, ...contractItems, ...unlinkedSessions].sort((a, b) => String(a.time).localeCompare(String(b.time)));
  }

  function getAgendaItemsForWeek(isoDate, studentId = "") {
    const start = startOfWeek(isoDate);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index)).flatMap((day) => getAgendaItemsForDate(day, studentId));
  }

  function getAgendaItemsForMonth(isoDate, studentId = "") {
    return calendarMonthDays(isoDate).flatMap((day) => getAgendaItemsForDate(day, studentId));
  }

  function getContractAgendaDate(contract) {
    const createdDate = String(contract.createdAt || todayISO()).slice(0, 10);
    return createdDate < todayISO() ? todayISO() : createdDate;
  }

  function renderAgendaScreen(studentId = "") {
    const items =
      state.agendaView === "month"
        ? getAgendaItemsForMonth(state.agendaDate, studentId)
        : state.agendaView === "week"
          ? getAgendaItemsForWeek(state.agendaDate, studentId)
          : getAgendaItemsForDate(state.agendaDate, studentId);
    const isManager = state.currentUser?.role === "manager";
    const title = agendaPeriodLabel();
    const selectedDayItems = getAgendaItemsForDate(state.agendaDate, studentId);
    const isDayView = state.agendaView === "day";
    return `
      <div class="content-stack agenda-workspace">
        <section class="agenda-hero">
          <div>
            <h3>Agenda</h3>
            <p>${isManager ? "Planeje treinos, avaliações e retornos." : "Acompanhe suas atividades e treinos."}</p>
          </div>
          ${isManager ? `<button class="btn-action-header" type="button" data-open-activity-form>${icons.agenda}<span>Agendar atividade</span></button>` : ""}
        </section>

        <section class="agenda-control-panel">
          <div class="agenda-view-tabs" aria-label="Visualização da agenda">
            <button class="${state.agendaView === 'day' ? 'is-active' : ''}" type="button" data-agenda-view="day">Dia</button>
            <button class="${state.agendaView === 'week' ? 'is-active' : ''}" type="button" data-agenda-view="week">Semana</button>
            <button class="${state.agendaView === 'month' ? 'is-active' : ''}" type="button" data-agenda-view="month">Mês</button>
          </div>

          <div class="agenda-period-nav">
            <button class="icon-button" type="button" data-agenda-shift="-1" aria-label="Período anterior">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div class="agenda-period-label">
              <strong>${escapeHtml(title)}</strong>
            </div>
            <button class="icon-button" type="button" data-agenda-shift="1" aria-label="Próximo período">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
            </button>
            <button class="mini-button agenda-today-button" type="button" data-agenda-today>Hoje</button>
          </div>
        </section>

        ${isDayView ? "" : `
        <section class="panel agenda-calendar-panel" aria-label="Calendário da agenda">
          ${state.agendaView === 'week' ? renderWeekCalendar(studentId) : renderMonthCalendar(studentId)}
          ${renderAgendaLegend()}
        </section>
        `}

        <section class="panel agenda-day-panel">
          <div class="section-title">
            <div>
              <h3>Itens do dia</h3>
              <span class="small-text">${formatLongDate(state.agendaDate)} · ${selectedDayItems.length} item(ns)</span>
            </div>
          </div>
          ${renderAgendaList(selectedDayItems, isManager)}
        </section>
      </div>
    `;
  }

  function agendaPeriodLabel() {
    if (state.agendaView === "month") return monthLabel(state.agendaDate);
    if (state.agendaView === "week") {
      const start = startOfWeek(state.agendaDate);
      return formatAgendaWeekRange(start, addDays(start, 6));
    }
    return formatLongDate(state.agendaDate);
  }

  function formatAgendaDayMonth(isoDate) {
    const date = parseISODate(isoDate);
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  function formatAgendaWeekRange(startIso, endIso) {
    const start = parseISODate(startIso);
    const end = parseISODate(endIso);
    const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
    const endLabel = end.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    if (sameMonth) return `${start.getDate()} a ${end.getDate()} de ${endLabel}`;
    return `${start.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })} a ${end.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}`;
  }

  function renderWeekCalendar(studentId) {
    const start = startOfWeek(state.agendaDate);
    const labels = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];
    const days = Array.from({ length: 7 }, (_, index) => addDays(start, index));
    const hours = agendaHourSlots(days, studentId);
    return `
      <div class="calendar-board week-view agenda-week-board">
        <div class="agenda-week-grid agenda-week-head" style="--agenda-hours:${hours.length}">
          <span class="agenda-time-head"></span>
          ${days
            .map(
              (day, index) => `
                <button class="agenda-week-day ${day === todayISO() ? "is-today" : ""} ${day === state.agendaDate ? "is-selected" : ""}" type="button" data-select-date="${day}">
                  <strong>${labels[index]}</strong>
                  <span>${formatAgendaDayMonth(day)}</span>
                </button>
              `
            )
            .join("")}
        </div>
        <div class="agenda-week-grid agenda-week-body" style="--agenda-hours:${hours.length}">
          ${hours
            .map(
              (hour) => `
                <div class="agenda-hour-label">${hour}</div>
                ${days
                  .map((day) => {
                    const items = getAgendaItemsForDate(day, studentId).filter((item) => agendaItemHour(item) === hour);
                    return `
                    <div class="agenda-week-slot ${day === state.agendaDate ? "is-selected-day" : ""}" data-select-date="${day}">
                      ${items.slice(0, 2).map((item) => renderCalendarEventBlock(item, "week")).join("")}
                      ${items.length > 2 ? `<button class="day-event is-more" type="button" data-select-date="${day}">+${items.length - 2}</button>` : ""}
                    </div>
                  `;
                  })
                  .join("")}
              `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  function agendaHourSlots(days, studentId = "") {
    const base = ["07:00", "08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
    const fromItems = days
      .flatMap((day) => getAgendaItemsForDate(day, studentId))
      .map((item) => agendaItemHour(item))
      .filter(Boolean);
    return [...new Set([...base, ...fromItems])].sort((a, b) => a.localeCompare(b));
  }

  function agendaItemHour(item) {
    const value = String(item?.time || "08:00").slice(0, 5);
    return /^\d{2}:\d{2}$/.test(value) ? value : "08:00";
  }

  function renderMonthCalendar(studentId) {
    const labels = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];
    const currentMonth = state.agendaDate.slice(0, 7);
    return `
      <div class="calendar-board month-view agenda-month-board">
        <div class="calendar-head">${labels.map((label) => `<span>${label}</span>`).join("")}</div>
        <div class="calendar-grid">
          ${calendarMonthDays(state.agendaDate)
            .map((day) => {
              const items = getAgendaItemsForDate(day, studentId);
              return `
                <div class="day-cell ${day === todayISO() ? "is-today" : ""} ${day === state.agendaDate ? "is-selected" : ""} ${day.slice(0, 7) !== currentMonth ? "is-outside" : ""}" data-select-date="${day}">
                  <button class="day-select" type="button" data-select-date="${day}">
                    <span class="day-number">${parseISODate(day).getDate()}</span>
                  </button>
                  <div class="month-dots">${items.slice(0, 4).map((item) => `<span class="agenda-dot ${agendaItemClass(item)}" aria-hidden="true"></span>`).join("")}</div>
                  ${items.length ? `<button class="month-count" type="button" data-select-date="${day}">${items.length} ${items.length === 1 ? "item" : "itens"}</button>` : ""}
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    `;
  }

  function renderDaySchedule(studentId) {
    const items = getAgendaItemsForDate(state.agendaDate, studentId);
    return `
      <div class="day-schedule agenda-day-schedule">
        ${items.length ? renderAgendaList(items, state.currentUser?.role === "manager") : emptyState("Nenhum item na agenda", "Treinos, avaliações e atualizações aparecerão aqui.", icons.agenda)}
      </div>
    `;
  }

  function renderCalendarEventBlock(item, mode = "") {
    const studentName = getStudentName(item.studentId);
    return `
      <button class="day-event ${mode ? `is-${mode}` : ""} ${agendaItemClass(item)}" type="button" data-open-agenda-detail="${escapeHtml(item.id)}" data-agenda-date="${escapeHtml(item.date)}" data-agenda-student="${escapeHtml(item.studentId)}">
        <strong>${escapeHtml(activityLabel(item.type))}</strong>
        <span>${escapeHtml(item.time || "--:--")}${studentName ? ` · ${escapeHtml(shortName(studentName))}` : ""}</span>
      </button>
    `;
  }

  function renderAgendaList(items, manager) {
    if (!items.length) return emptyState("Nenhuma atividade neste dia", "Treinos, avaliações e atualizações aparecerão aqui.", icons.agenda);
    return `
      <div class="agenda-list">
        ${items
          .map((item) => {
            const studentName = getStudentName(item.studentId);
            const canWA = manager && canEditAgendaItem(item);
            const canStart = item.type === "workout" && item.workoutId && state.currentUser?.role === "student" && item.status !== "done";
            return `
              <article class="agenda-item ${agendaItemClass(item)}">
                <button class="agenda-item-overlay" type="button"
                  data-open-agenda-detail="${escapeHtml(item.id)}"
                  data-agenda-date="${escapeHtml(item.date)}"
                  data-agenda-student="${escapeHtml(item.studentId)}"
                  aria-label="Ver detalhes"></button>
                <div class="agenda-avatar">${escapeHtml(initialsFromName(studentName))}</div>
                <span class="agenda-type-dot ${agendaItemClass(item)}" aria-hidden="true"></span>
                <div class="agenda-time">${escapeHtml(item.time || "--:--")}</div>
                <div class="agenda-main">
                  <strong>${escapeHtml(activityLabel(item.type))}</strong>
                  <span>${escapeHtml(studentName)}</span>
                </div>
                <div class="agenda-status">${statusBadge(agendaStatusLabel(item.status), agendaStatusTone(item.status))}</div>
                <div class="agenda-item-actions">
                  ${canWA ? whatsappButton(item.id, item.studentId) : ""}
                  ${canStart ? `<button class="mini-button" type="button" data-start-workout="${escapeHtml(item.workoutId)}" data-activity-id="${escapeHtml(item.id)}">Iniciar</button>` : ""}
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function renderAgendaLegend() {
    const items = [
      ["workout", "Treino"],
      ["assessment", "Avaliação"],
      ["update", "Atualização"],
      ["return", "Retorno"],
      ["contract", "Contrato"]
    ];
    return `<div class="agenda-legend">${items.map(([type, label]) => `<span><i class="agenda-type-dot is-type-${type}" aria-hidden="true"></i>${label}</span>`).join("")}</div>`;
  }

  function renderStudentAgendaRows(items) {
    if (!items.length) return emptyState("Nenhuma atividade neste dia", "Treinos, avaliações e atualizações aparecerão aqui.", icons.agenda);
    return `
      <div class="agenda-list">
        ${items.map((item) => {
          const canStart = item.type === "workout" && item.workoutId && item.status !== "done";
          const statusLabel = item.status === "done" ? "Completo" : agendaStatusLabel(item.status);
          return `
            <article class="student-agenda-row ${agendaItemClass(item)}">
              <button class="agenda-item-overlay" type="button"
                data-open-agenda-detail="${escapeHtml(item.id)}"
                data-agenda-date="${escapeHtml(item.date)}"
                data-agenda-student="${escapeHtml(item.studentId)}"
                aria-label="Ver detalhes"></button>
              <span class="agenda-type-dot ${agendaItemClass(item)}" aria-hidden="true"></span>
              <div class="student-agenda-row__info">
                <strong>${escapeHtml(activityLabel(item.type))}</strong>
                <span>${escapeHtml(item.time || "--:--")}</span>
              </div>
              <div class="student-agenda-row__badge">
                ${statusBadge(statusLabel, agendaStatusTone(item.status))}
                ${canStart ? `<button class="mini-button" type="button" data-start-workout="${escapeHtml(item.workoutId)}" data-activity-id="${escapeHtml(item.id)}">Iniciar</button>` : ""}
              </div>
            </article>
          `;
        }).join("")}
      </div>
    `;
  }

  function shortName(name = "") {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "";
    return parts.length === 1 ? parts[0] : `${parts[0]} ${parts[parts.length - 1][0]}.`;
  }

  function renderAgendaCompact(item, manager = false) {
    return `
      <article class="entity-row compact-row ${agendaItemClass(item)}">
        <div class="agenda-time">${escapeHtml(item.time || "--:--")}</div>
        <div class="entity-main">
          <strong>${escapeHtml(item.title)}</strong>
          <span>${escapeHtml(getStudentName(item.studentId))} · ${activityLabel(item.type)}</span>
          <div class="badge-row">${statusBadge(agendaStatusLabel(item.status), agendaStatusTone(item.status))}</div>
        </div>
        <div class="row-actions">
          <button class="mini-button" type="button" data-open-agenda-detail="${escapeHtml(item.id)}" data-agenda-date="${escapeHtml(item.date)}" data-agenda-student="${escapeHtml(item.studentId)}">Detalhes</button>
          ${manager && canEditAgendaItem(item) ? whatsappButton(item.id, item.studentId) : ""}
          ${item.type === "workout" && item.workoutId && state.currentUser?.role === "student" && item.status !== "done" ? `<button class="mini-button" type="button" data-start-workout="${item.workoutId}" data-activity-id="${item.id}">Iniciar</button>` : ""}
        </div>
      </article>
    `;
  }

  function activityLabel(type) {
    return {
      workout: "Treino",
      assessment: "Avaliação",
      reassessment: "Reavaliação",
      update: "Atualização",
      return: "Retorno",
      contract: "Contrato",
      other: "Outro evento"
    }[type] || "Atividade";
  }

  function activityTypeColor(type) {
    return {
      workout: "var(--treino, #10B981)",
      assessment: "var(--aval, #8B5CF6)",
      reassessment: "var(--aval, #8B5CF6)",
      update: "var(--atualiza, #3B82F6)",
      return: "var(--retorno, #F97316)",
      contract: "var(--dourado, #F59E0B)",
      other: "#6B7280"
    }[type] || "#6B7280";
  }

  function agendaStatusLabel(status) {
    return { scheduled: "Confirmado", pending: "Pendente", done: "Concluído", sent: "Enviado", canceled: "Cancelado", missed: "Não realizado", contract_pending: "Contrato pendente" }[status] || "Confirmado";
  }

  function agendaStatusTone(status) {
    if (status === "done" || status === "sent") return "success";
    if (status === "canceled" || status === "missed") return "danger";
    if (status === "pending" || status === "contract_pending") return "warning";
    return "info";
  }

  function agendaItemClass(item) {
    const status = String(item.status || "scheduled").replace(/[^a-z0-9_-]/gi, "-");
    const type = String(item.type || "activity").replace(/[^a-z0-9_-]/gi, "-");
    return `is-status-${status} is-type-${type}`;
  }

  function canEditAgendaItem(item) {
    const id = String(item.id || "");
    return !id.startsWith("session-agenda-") && !id.startsWith("contract-agenda-");
  }

  function findAgendaItem(itemId, date = "", studentId = "") {
    const dates = date ? [date] : [state.agendaDate, todayISO()];
    for (const day of [...new Set(dates)]) {
      const item = getAgendaItemsForDate(day, studentId).find((entry) => entry.id === itemId);
      if (item) return item;
    }
    return state.data.activities.find((activity) => activity.id === itemId) || null;
  }

  function openAgendaItemDetail(itemId, date = "", studentId = "") {
    openEventDetailSheet(itemId, date, studentId);
  }

  function renderStudentUpdates() {
    const student = getCurrentStudent();
    const updates = state.data.updates.filter((item) => item.studentId === student?.id).sort((a, b) => b.dueDate.localeCompare(a.dueDate));
    const pending = updates.find((item) => item.status === "pending");
    return `
      <div class="content-stack">
        ${pageHeader("Atualizações", "Peso, fotos e observações quinzenais")}
        <section class="panel">
          <div class="section-title"><h3>Atualização quinzenal</h3><span class="small-text">${pending ? `Pendente para ${formatDate(pending.dueDate)}` : "Sem pendência"}</span></div>
          ${pending ? `<button class="primary-action" type="button" data-open-update-form="${pending.id}">Enviar atualização</button>` : emptyState("Nenhuma atualização pendente", "A próxima pendência será criada automaticamente.", icons.updates)}
        </section>
        <section class="panel">
          <div class="section-title"><h3>Histórico de atualizações</h3><span class="small-text">${updates.length} registro(s)</span></div>
          ${updates.length ? `<div class="entity-list">${updates.map(renderUpdateRow).join("")}</div>` : emptyState("Nenhum histórico de atualizações", "Suas atualizações enviadas aparecerão aqui.", icons.updates)}
        </section>
      </div>
    `;
  }

  function renderManagerUpdates() {
    const filters = state.updateFilters;
    const students = state.data.students;
    const allUpdates = state.data.updates.filter((update) => getStudent(update.studentId));
    const updates = allUpdates
      .filter((update) => (filters.studentId ? update.studentId === filters.studentId : true))
      .filter((update) => updateMatchesStatusFilter(update, filters.status))
      .filter((update) => updateMatchesPeriodFilter(update, filters.period || "all", filters.date))
      .sort((a, b) => updateSortDate(b).localeCompare(updateSortDate(a)));
    const receivedCount = allUpdates.filter((update) => update.status === "sent").length;
    const pendingCount = allUpdates.filter((update) => update.status === "pending" && !isUpdateLate(update)).length;
    const lateCount = allUpdates.filter(isUpdateLate).length;
    return `
      <div class="content-stack updates-workspace updates-page">
        <section class="updates-hero">
          <div>
            <span class="eyebrow">Elite AS</span>
            <h3>Atualizações</h3>
            <p>Acompanhe peso, fotos e observações.</p>
          </div>
        </section>
        <div class="metrics-row metrics-row--3">
          ${stdMetricCard("Recebidas", receivedCount, receivedCount ? "Aguardam avaliação" : "Sem novos envios", "success")}
          ${stdMetricCard("Pendentes", pendingCount, "Aguardando", "warning")}
          ${stdMetricCard("Atrasadas", lateCount, lateCount ? "Requerem atenção" : "Em dia", "danger")}
        </div>
        <div class="update-filter-grid" style="display:flex;gap:10px;overflow-x:auto;padding-bottom:4px;">
          ${updateFilterSelect("studentId", "Aluno", icons.students, [["", "Todos os alunos"], ...students.map((student) => [student.id, student.name])], filters.studentId)}
          ${updateFilterSelect("status", "Status", icons.updates, [
            ["all", "Todos os status"],
            ["sent", "Recebida"],
            ["pending", "Pendente"],
            ["late", "Atrasada"],
            ["viewed", "Avaliada"]
          ], filters.status)}
          ${updateFilterSelect("period", "Período", icons.agenda, [
            ["all", "Todo período"],
            ["today", "Hoje"],
            ["week", "Esta semana"],
            ["month", "Este mês"],
            ["custom", "Data exata"]
          ], filters.period || "all")}
        </div>
        ${filters.period === "custom" ? `<label class="update-filter update-date-filter" style="margin-top:8px;display:flex;align-items:center;gap:8px;"><span class="update-filter-icon">${icons.agenda}</span><span class="update-filter-label">Data</span><input type="date" data-update-filter="date" value="${escapeHtml(filters.date)}" /></label>` : ""}
        <section class="updates-list-panel">
          <div class="section-title">
            <div>
              <h3>Atualizações dos alunos</h3>
              <span class="small-text">${updates.length} registro(s) encontrado(s)</span>
            </div>
          </div>
          ${updates.length ? `<div class="update-card-list">${updates.map(renderUpdateCard).join("")}</div>` : emptyState("Nenhuma atualização encontrada", "As atualizações dos alunos aparecerão aqui. Ajuste os filtros ou aguarde novos envios.", icons.updates)}
        </section>
      </div>
    `;
  }

  function renderEvaluateUpdate() {
    const update = state.data.updates.find((item) => item.id === state.currentUpdateId);
    if (!update) {
      return `
        <div class="content-stack evaluate-page">
          <div class="evaluate-topbar">
            <button class="evaluate-back-btn" type="button" data-back-to-updates>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
              Atualizações
            </button>
          </div>
          ${emptyState("Atualização não encontrada", "Volte para a lista de atualizações.", icons.updates)}
        </div>
      `;
    }
    const student = getStudent(update.studentId);
    const meta = updateStatusMeta(update);
    const weight = updateWeightMeta(update);
    const isPending = update.status === "pending";
    const prevUpdate = previousWeightUpdate(update);
    const photos = Array.isArray(update.photos) ? update.photos : [];
    const prevPhotos = Array.isArray(prevUpdate?.photos) ? prevUpdate.photos : [];
    const photoLabels = ["Frente", "Lado", "Costas"];
    const suggestChips = [
      "Ótima evolução! Continue assim.",
      "Ajuste a hidratação diária.",
      "Foque na qualidade do sono.",
      "Intensifique o treino de força.",
      "Reveja a alimentação pré-treino.",
      "Excelente comprometimento!",
      "Reduza o cardio nesta semana.",
      "Aumente a carga progressivamente."
    ];
    const badgeClass = meta.className === "is-late" ? "is-danger" : meta.className === "is-pending" ? "is-warning" : meta.className === "is-viewed" ? "is-neutral" : "is-success";
    const deltaArrow = weight.className === "is-up" ? "↑" : weight.className === "is-down" ? "↓" : "";
    const currentRating = update.evaluationRating || 0;
    return `
      <div class="content-stack evaluate-page">
        <div class="evaluate-topbar">
          <button class="evaluate-back-btn" type="button" data-back-to-updates>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
            Atualizações
          </button>
          <span class="badge ${badgeClass}">${escapeHtml(meta.label)}</span>
        </div>

        <section class="evaluate-card evaluate-student-card">
          ${studentAvatar(student)}
          <div class="evaluate-student-info">
            <strong>${escapeHtml(getStudentName(update.studentId))}</strong>
            <span>${escapeHtml(updateMomentLabel(update))}</span>
            ${meta.extra ? `<small>${escapeHtml(meta.extra)}</small>` : ""}
          </div>
        </section>

        ${isPending ? `
          <div class="empty-state compact-note">
            <strong>Atualização ainda não enviada</strong>
            <span>Quando o aluno enviar peso, fotos e observações, a avaliação ficará disponível aqui.</span>
          </div>
          ${student ? `<button class="secondary-action" type="button" data-open-student-profile="${escapeHtml(student.id)}">Abrir perfil do aluno</button>` : ""}
        ` : `
          <section class="evaluate-card">
            <div class="evaluate-card-head">
              <div>
                <h3>Fotos da evolução</h3>
                <span class="small-text">${photos.length ? `${photos.length} foto(s) enviada(s)` : "Nenhuma foto enviada"}</span>
              </div>
              ${prevPhotos.length ? `
                <button class="evaluate-compare-btn" type="button" data-compare-toggle="photos">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
                  Comparar
                </button>
              ` : ""}
            </div>
            <div class="evaluate-photos-wrap">
              <div class="evaluate-photo-row">
                ${photoLabels.map((label, i) => {
                  const photo = photos[i];
                  return `
                    <div class="evaluate-photo-col">
                      <span class="evaluate-photo-label">Atual · ${escapeHtml(label)}</span>
                      <button class="update-photo-frame ${photo ? "has-photo" : "is-empty"}" type="button"${photo ? ` data-zoom-photo="${escapeHtml(photo)}" data-photo-label="${escapeHtml(label)}"` : ""}>
                        ${photo
                          ? `<img src="${escapeHtml(photo)}" alt="Foto ${escapeHtml(label)}" loading="lazy" />`
                          : `<span class="update-photo-placeholder"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h4l2-3h4l2 3h4v12H4z"/><path d="M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/></svg></span>`}
                        <small>${escapeHtml(label)}</small>
                      </button>
                    </div>
                  `;
                }).join("")}
              </div>
              ${prevPhotos.length ? `
                <div class="evaluate-photo-row is-compare-row" hidden>
                  <div class="evaluate-compare-label">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v20M2 12h20"/></svg>
                    Fotos anteriores
                  </div>
                  ${photoLabels.map((label, i) => {
                    const photo = prevPhotos[i];
                    return `
                      <div class="evaluate-photo-col">
                        <span class="evaluate-photo-label">Anterior · ${escapeHtml(label)}</span>
                        <button class="update-photo-frame ${photo ? "has-photo" : "is-empty"}" type="button"${photo ? ` data-zoom-photo="${escapeHtml(photo)}" data-photo-label="${escapeHtml(label)} (anterior)"` : ""}>
                          ${photo
                            ? `<img src="${escapeHtml(photo)}" alt="Foto anterior ${escapeHtml(label)}" loading="lazy" />`
                            : `<span class="update-photo-placeholder"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h4l2-3h4l2 3h4v12H4z"/><path d="M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/></svg></span>`}
                          <small>${escapeHtml(label)}</small>
                        </button>
                      </div>
                    `;
                  }).join("")}
                </div>
              ` : ""}
            </div>
          </section>

          <section class="evaluate-card evaluate-weight-card">
            <h3>Variação de peso</h3>
            <div class="evaluate-weight-main">
              <strong class="evaluate-weight-delta ${weight.className}">${deltaArrow} ${escapeHtml(weight.deltaLabel)}</strong>
            </div>
            <div class="evaluate-weight-row">
              <div class="evaluate-weight-col">
                <span>Atual</span>
                <strong>${escapeHtml(weight.currentLabel)}</strong>
              </div>
              <div class="evaluate-weight-divider"></div>
              <div class="evaluate-weight-col">
                <span>Anterior</span>
                <strong>${escapeHtml(weight.previousLabel)}</strong>
              </div>
              ${update.energy ? `
                <div class="evaluate-weight-divider"></div>
                <div class="evaluate-weight-col">
                  <span>Energia</span>
                  <strong>${escapeHtml(update.energy)}/5</strong>
                </div>
              ` : ""}
              ${update.pain ? `
                <div class="evaluate-weight-divider"></div>
                <div class="evaluate-weight-col">
                  <span>Dor</span>
                  <strong>${escapeHtml(update.pain)}/5</strong>
                </div>
              ` : ""}
            </div>
            ${update.trainingNotes || update.dietNotes || update.generalNotes ? `
              <div class="evaluate-notes-section">
                ${update.trainingNotes ? `<div class="evaluate-note-item"><span>Treino</span><p>${escapeHtml(update.trainingNotes)}</p></div>` : ""}
                ${update.dietNotes ? `<div class="evaluate-note-item"><span>Dieta</span><p>${escapeHtml(update.dietNotes)}</p></div>` : ""}
                ${update.generalNotes ? `<div class="evaluate-note-item"><span>Observações</span><p>${escapeHtml(update.generalNotes)}</p></div>` : ""}
              </div>
            ` : ""}
          </section>

          <section class="evaluate-card evaluate-feedback-card">
            <h3>Feedback do personal</h3>
            <form id="evaluateUpdateForm" data-id="${escapeHtml(update.id)}">
              <div class="evaluate-rating-row">
                <span>Nota da evolução</span>
                <div class="evaluate-stars" id="evaluateStars">
                  ${[1, 2, 3, 4, 5].map((n) => `
                    <button class="evaluate-star${currentRating >= n ? " is-active" : ""}" type="button" data-set-rating="${n}" aria-label="${n} estrela${n > 1 ? "s" : ""}">
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>
                    </button>
                  `).join("")}
                </div>
                <input type="hidden" name="evaluationRating" id="evaluateRatingInput" value="${escapeHtml(String(currentRating))}" />
              </div>
              ${student ? `
                <div class="evaluate-quick-actions">
                  <button class="evaluate-quick-btn" type="button" data-quick-action="workout" data-student-id="${escapeHtml(student.id)}">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6.5h11M6.5 12h11M6.5 17.5h11"/></svg>
                    Ajustar treino
                  </button>
                  <button class="evaluate-quick-btn" type="button" data-quick-action="diet" data-student-id="${escapeHtml(student.id)}">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 1 0 20 10 10 0 0 1 0-20M12 6v6l4 2"/></svg>
                    Ajustar dieta
                  </button>
                </div>
              ` : ""}
              <div class="evaluate-chips">
                ${suggestChips.map((chip) => `<button class="evaluate-chip" type="button" data-insert-suggestion="${escapeHtml(chip)}">${escapeHtml(chip)}</button>`).join("")}
              </div>
              <label class="field">
                <span>Avaliação</span>
                <textarea name="trainerComment" id="evaluateCommentArea" rows="5" placeholder="Registre orientações, ajustes de treino ou observações para o aluno.">${escapeHtml(update.trainerComment || "")}</textarea>
              </label>
            </form>
          </section>

          <div class="evaluate-footer-spacer"></div>
        `}
      </div>

      ${!isPending ? `
        <div class="evaluate-footer">
          <button class="secondary-action evaluate-footer-btn" type="button" data-send-feedback="${escapeHtml(update.id)}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 2 11 13M22 2 15 22l-4-9-9-4z"/></svg>
            Enviar feedback
          </button>
          <button class="primary-action evaluate-footer-btn" type="button" data-save-evaluation="${escapeHtml(update.id)}">
            Salvar avaliação
          </button>
        </div>
      ` : ""}
    `;
  }

  function handleEvaluateSave(updateId, sendFeedback) {
    const update = state.data.updates.find((item) => item.id === updateId);
    if (!update) return;
    const form = document.getElementById("evaluateUpdateForm");
    if (!form) return;
    const data = new FormData(form);
    update.trainerComment = String(data.get("trainerComment") || "").trim();
    update.evaluationRating = Number(data.get("evaluationRating") || 0) || 0;
    if (update.status !== "viewed") {
      update.status = "viewed";
      update.viewedAt = new Date().toISOString();
      ensureUpdateActivity(update);
    }
    persistData();
    state.managerMenu = "updates";
    renderApp();
    showToast(sendFeedback ? "Avaliação salva e feedback registrado." : "Avaliação salva.");
  }

  function updateMetricCard({ icon, title, value, subtitle, tone = "" }) {
    return `
      <article class="update-summary-card ${tone ? `is-${tone}` : ""}">
        <span class="update-summary-icon">${icon}</span>
        <span>${escapeHtml(title)}</span>
        <strong>${escapeHtml(value)}</strong>
        <small>${escapeHtml(subtitle)}</small>
      </article>
    `;
  }

  function updateFilterSelect(name, label, icon, options, selected = "") {
    return `
      <label class="update-filter">
        <span class="update-filter-icon">${icon}</span>
        <span class="update-filter-label">${escapeHtml(label)}</span>
        <select data-update-filter="${escapeHtml(name)}">
          ${options.map(([value, text]) => `<option value="${escapeHtml(value)}" ${String(selected || "") === String(value) ? "selected" : ""}>${escapeHtml(text)}</option>`).join("")}
        </select>
      </label>
    `;
  }

  function renderUpdateCard(update) {
    const student = getStudent(update.studentId);
    const meta = updateStatusMeta(update);
    const weight = updateWeightMeta(update);
    const actionLabel = updatePrimaryActionLabel(update);
    return `
      <article class="update-card ${meta.className}">
        <div class="update-card-head">
          ${studentAvatar(student)}
          <div class="update-title-block">
            <strong>${escapeHtml(getStudentName(update.studentId))}</strong>
            <span><i class="${meta.dotClass}"></i>${escapeHtml(meta.label)} <em>•</em> ${escapeHtml(updateMomentLabel(update))}</span>
          </div>
          <details class="action-menu update-card-menu">
            <summary aria-label="Mais ações">${icons.more}</summary>
            <div>
              <button class="mini-button" type="button" data-open-update-comment="${escapeHtml(update.id)}">Ver detalhes</button>
              ${student ? `<button class="mini-button" type="button" data-open-student-profile="${escapeHtml(student.id)}">Abrir perfil</button>` : ""}
              ${state.currentUser?.role === "manager" && update.status === "sent" ? `<button class="mini-button" type="button" data-mark-update-viewed="${escapeHtml(update.id)}">Marcar avaliada</button>` : ""}
            </div>
          </details>
        </div>
        <div class="update-card-body">
          <div class="update-weight-panel">
            <span>Variação de peso</span>
            <strong class="${weight.className}">${escapeHtml(weight.deltaLabel)}</strong>
            ${
              weight.hasCurrent
                ? `<small>Atual: ${escapeHtml(weight.currentLabel)}</small><small>Anterior: ${escapeHtml(weight.previousLabel)}</small>${meta.extra ? `<small>${escapeHtml(meta.extra)}</small>` : ""}`
                : `<small>${escapeHtml(meta.extra || "Aguardando envio do aluno")}</small>`
            }
          </div>
          ${renderUpdatePhotoStrip(update)}
        </div>
        ${renderUpdateCardNotes(update)}
        <button class="update-primary-action" type="button" data-open-update-comment="${escapeHtml(update.id)}">
          <span>${escapeHtml(actionLabel)}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </article>
    `;
  }

  function renderUpdateCardNotes(update) {
    const notes = [update.trainingNotes, update.dietNotes, update.generalNotes].filter(Boolean);
    if (!notes.length && update.status === "pending") return "";
    if (!notes.length) return `<p class="update-card-note">Sem observações do aluno.</p>`;
    return `<p class="update-card-note">${escapeHtml(notes[0])}</p>`;
  }

  function updatePrimaryActionLabel(update) {
    if (update.status === "sent") return "Avaliar";
    if (isUpdateLate(update)) return "Abrir";
    if (update.status === "viewed") return "Ver detalhes";
    return "Abrir";
  }

  function updatePeriodFilterLabel(period = "all") {
    const labels = {
      all: "Todo período",
      today: "Hoje",
      week: "Esta semana",
      month: "Este mês",
      custom: "Data exata"
    };
    return labels[period] || labels.all;
  }

  function renderUpdatePhotoStrip(update, detail = false) {
    const labels = ["Frente", "Lado", "Costas"];
    const photos = Array.isArray(update.photos) ? update.photos : [];
    return `
      <div class="${detail ? "update-photo-grid-detail" : "update-photo-strip"}">
        ${labels
          .map((label, index) => {
            const photo = photos[index];
            return `
              <button class="update-photo-frame ${photo ? "has-photo" : "is-empty"}" type="button" data-open-update-comment="${escapeHtml(update.id)}">
                ${
                  photo
                    ? `<img src="${escapeHtml(photo)}" alt="Foto ${escapeHtml(label)} da atualização" loading="lazy" />`
                    : `<span class="update-photo-placeholder"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h4l2-3h4l2 3h4v12H4z"/><path d="M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/></svg></span>`
                }
                <small>${escapeHtml(label)}</small>
              </button>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function updateStatusMeta(update) {
    if (isUpdateLate(update)) {
      return {
        label: "Atrasada",
        className: "is-late",
        dotClass: "is-danger",
        extra: `${daysBetween(update.dueDate, todayISO())} dia(s) de atraso`
      };
    }
    if (update.status === "pending") return { label: "Pendente", className: "is-pending", dotClass: "is-warning", extra: "Aguardando envio do aluno" };
    if (update.status === "viewed") return { label: "Avaliada", className: "is-viewed", dotClass: "is-success", extra: update.viewedAt ? `Avaliada em ${formatShortDate(update.viewedAt.slice(0, 10))}` : "" };
    return { label: "Recebida", className: "is-received", dotClass: "is-success", extra: "Aguardando avaliação" };
  }

  function isUpdateLate(update) {
    return update.status === "pending" && update.dueDate < todayISO();
  }

  function updateMatchesStatusFilter(update, status = "all") {
    if (status === "all") return true;
    if (status === "late") return isUpdateLate(update);
    if (status === "pending") return update.status === "pending" && !isUpdateLate(update);
    return update.status === status;
  }

  function updateMatchesPeriodFilter(update, period = "all", exactDate = "") {
    const referenceDate = updateSortDate(update).slice(0, 10);
    if (period === "custom") return exactDate ? referenceDate === exactDate : true;
    if (period === "today") return referenceDate === todayISO();
    if (period === "week") {
      const start = startOfWeek(todayISO());
      const end = addDays(start, 7);
      return referenceDate >= start && referenceDate < end;
    }
    if (period === "month") return referenceDate.startsWith(todayISO().slice(0, 7));
    return true;
  }

  function updateSortDate(update) {
    return String(update.submittedAt || update.dueDate || update.createdAt || "");
  }

  function updateMomentLabel(update) {
    const dateSource = update.status === "pending" ? update.dueDate : String(update.submittedAt || update.dueDate).slice(0, 10);
    const time = update.submittedAt ? new Date(update.submittedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "";
    if (dateSource === todayISO()) return time ? `Hoje, ${time}` : `Hoje`;
    if (dateSource === addDays(todayISO(), -1)) return time ? `Ontem, ${time}` : "Ontem";
    return update.status === "pending" ? `Vence ${formatDate(dateSource)}` : formatShortDate(dateSource);
  }

  function daysBetween(startDate, endDate) {
    const start = parseISODate(startDate);
    const end = parseISODate(endDate);
    return Math.max(0, Math.round((end - start) / 86400000));
  }

  function updateWeightMeta(update) {
    const current = parseWeight(update.weight);
    const previousUpdate = previousWeightUpdate(update);
    const previous = parseWeight(previousUpdate?.weight);
    if (!Number.isFinite(current)) {
      return {
        deltaLabel: "— —",
        currentLabel: "—",
        previousLabel: previousUpdate ? formatWeight(previous) : "—",
        className: "is-pending",
        hasCurrent: false
      };
    }
    if (!Number.isFinite(previous)) {
      return {
        deltaLabel: "—",
        currentLabel: formatWeight(current),
        previousLabel: "Sem registro",
        className: "is-neutral",
        hasCurrent: true
      };
    }
    const delta = current - previous;
    return {
      deltaLabel: `${delta > 0 ? "+" : ""}${formatWeight(delta)}`,
      currentLabel: formatWeight(current),
      previousLabel: formatWeight(previous),
      className: delta < 0 ? "is-down" : delta > 0 ? "is-up" : "is-neutral",
      hasCurrent: true
    };
  }

  function parseWeight(value) {
    if (value === null || value === undefined || value === "") return NaN;
    const parsed = Number(String(value).replace(",", "."));
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  function formatWeight(value) {
    if (!Number.isFinite(value)) return "—";
    return `${value.toLocaleString("pt-BR", { minimumFractionDigits: Math.abs(value % 1) > 0 ? 1 : 0, maximumFractionDigits: 1 })} kg`;
  }

  function previousWeightUpdate(update) {
    const currentDate = updateSortDate(update);
    return state.data.updates
      .filter((candidate) => candidate.id !== update.id && candidate.studentId === update.studentId && candidate.status !== "pending" && candidate.weight)
      .filter((candidate) => updateSortDate(candidate) < currentDate)
      .sort((a, b) => updateSortDate(b).localeCompare(updateSortDate(a)))[0];
  }

  function renderUpdateRow(update) {
    const isLate = update.status === "pending" && update.dueDate < todayISO();
    const student = getStudent(update.studentId);
    return `
      <article class="entity-row update-row">
        ${studentAvatar(student)}
        <div class="entity-main">
          <strong>${escapeHtml(getStudentName(update.studentId))}</strong>
          <span>Vencimento: ${formatDate(update.dueDate)}${update.submittedAt ? ` · Enviada em ${formatDate(update.submittedAt.slice(0, 10))}` : ""}</span>
          ${update.weight ? `<span>Peso: ${escapeHtml(update.weight)} kg · Energia: ${escapeHtml(update.energy || "-")}/5 · Dor: ${escapeHtml(update.pain || "-")}/5</span>` : ""}
          ${update.trainingNotes ? `<span>Treino: ${escapeHtml(update.trainingNotes)}</span>` : ""}
          ${update.dietNotes ? `<span>Dieta: ${escapeHtml(update.dietNotes)}</span>` : ""}
          ${update.generalNotes ? `<span>Geral: ${escapeHtml(update.generalNotes)}</span>` : ""}
          ${update.trainerComment ? `<span>Comentário do personal: ${escapeHtml(update.trainerComment)}</span>` : ""}
          ${update.photos?.length ? `<div class="photo-grid">${update.photos.map((photo) => `<img src="${photo}" alt="Foto de evolução" />`).join("")}</div>` : ""}
          <div class="badge-row">
            <span class="badge ${isLate ? "is-danger" : update.status === "pending" ? "is-info" : "is-success"}">${isLate ? "Atrasada" : updateStatusLabel(update.status)}</span>
          </div>
        </div>
        <div class="row-actions">
          ${state.currentUser?.role === "manager" && update.status !== "pending" ? `<button class="mini-button" type="button" data-open-update-comment="${update.id}">Responder</button>${update.status === "sent" ? `<button class="mini-button" type="button" data-mark-update-viewed="${update.id}">Avaliada</button>` : ""}` : ""}
        </div>
      </article>
    `;
  }

  function updateStatusLabel(status) {
    return { pending: "Pendente", sent: "Recebida", viewed: "Avaliada" }[status] || status;
  }

  function renderStudentProgress() {
    const student = getCurrentStudent();
    return renderProgressForStudent(student?.id);
  }

  function renderProgressForStudent(studentId) {
    const isStudentView = state.currentUser?.role === "student";
    const sessions = getStudentSessions(studentId);
    const updateWeights = state.data.updates
      .filter((update) => update.studentId === studentId && update.weight && update.status !== "pending")
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const exerciseProgress = buildExerciseProgress(studentId);

    const allUpdates = isStudentView
      ? state.data.updates.filter((item) => item.studentId === studentId).sort((a, b) => b.dueDate.localeCompare(a.dueDate))
      : [];
    const pendingUpdate = allUpdates.find((item) => item.status === "pending");
    const sentUpdates = allUpdates.filter((u) => u.status !== "pending");

    return `
      <div class="content-stack">
        ${isStudentView ? pageHeader("Progresso", "Atualizações e evolução") : ""}

        ${isStudentView ? `
          <section class="panel">
            <div class="section-title">
              <h3>Enviar</h3>
              <span class="small-text">${pendingUpdate ? `Vencimento ${formatDate(pendingUpdate.dueDate)}` : "Sem pendência"}</span>
            </div>
            ${pendingUpdate
              ? `<button class="primary-action" type="button" data-open-update-form="${pendingUpdate.id}">Enviar atualização quinzenal</button>`
              : emptyState("Sem atualização pendente", "A próxima será gerada automaticamente.", icons.updates)
            }
          </section>

          <section class="panel">
            <div class="section-title"><h3>Histórico de envios</h3><span class="small-text">${sentUpdates.length} registro(s)</span></div>
            ${sentUpdates.length
              ? `<div class="entity-list">${sentUpdates.map((u) => `
                  <article class="entity-row">
                    <div class="entity-main">
                      <strong>${formatDate(u.dueDate)}</strong>
                      <span>${u.weight ? `Peso: ${escapeHtml(String(u.weight))} kg · ` : ""}Energia: ${escapeHtml(String(u.energy || "—"))}/5 · Dor: ${escapeHtml(String(u.pain || "—"))}/5</span>
                      ${u.trainerComment ? `<span>Personal: ${escapeHtml(u.trainerComment)}</span>` : ""}
                      <div class="badge-row"><span class="badge ${u.status === "viewed" ? "is-success" : "is-info"}">${updateStatusLabel(u.status)}</span></div>
                    </div>
                  </article>`).join("")}</div>`
              : emptyState("Nenhum histórico", "Suas atualizações enviadas aparecerão aqui.", icons.updates)
            }
          </section>
        ` : ""}

        <section class="metric-grid">
          ${metricCard("Semana", sessionsThisWeek(studentId).length)}
          ${metricCard("Mês", sessionsThisMonth(studentId).length)}
          ${metricCard("Treinos realizados", sessions.length)}
          ${metricCard("Volume total", sessions.reduce((sum, session) => sum + Number(session.totalVolumeLoad || 0), 0))}
        </section>
        <section class="panel">
          <div class="section-title"><h3>Últimos treinos</h3><span class="small-text">Volume load</span></div>
          ${sessions.length ? `<div class="entity-list">${sessions.slice(0, 8).map(renderSessionRow).join("")}</div>` : emptyState("Nenhum treino finalizado", "Finalize um treino para gerar histórico e evolução.", icons.progress)}
        </section>
        <section class="panel">
          <div class="section-title"><h3>Evolução por exercício</h3><span class="small-text">Maior carga registrada</span></div>
          ${exerciseProgress.length ? `<div class="entity-list">${exerciseProgress.map((item) => `<article class="entity-row"><div class="entity-main"><strong>${escapeHtml(item.name)}</strong><span>Maior carga: ${item.maxLoad} · Volume acumulado: ${item.volume}</span></div></article>`).join("")}</div>` : emptyState("Nenhum dado de carga", "Registre carga e repetições durante a execução do treino.", icons.progress)}
        </section>
        <section class="panel">
          <div class="section-title"><h3>Peso corporal</h3><span class="small-text">Atualizações</span></div>
          ${updateWeights.length ? `<div class="entity-list">${updateWeights.map((item) => `<article class="entity-row"><div class="entity-main"><strong>${escapeHtml(String(item.weight))} kg</strong><span>${formatDate(item.dueDate)}</span></div></article>`).join("")}</div>` : emptyState("Nenhum peso registrado", "O peso informado nas atualizações aparecerá aqui.", icons.updates)}
        </section>
      </div>
    `;
  }

  function buildExerciseProgress(studentId) {
    const map = new Map();
    getStudentSessions(studentId).forEach((session) => {
      session.exercises.forEach((exercise) => {
        const current = map.get(exercise.exerciseId) || { name: exercise.name, maxLoad: 0, volume: 0 };
        exercise.sets.forEach((set) => {
          current.maxLoad = Math.max(current.maxLoad, Number(set.load || 0));
          current.volume += Number(set.volumeLoad || 0);
        });
        map.set(exercise.exerciseId, current);
      });
    });
    return [...map.values()].sort((a, b) => b.volume - a.volume);
  }

  function renderSessionRow(session) {
    const workout = getWorkout(session.workoutId);
    return `
      <article class="entity-row">
        <div class="entity-main">
          <strong>${escapeHtml(workout?.title || "Treino realizado")}</strong>
          <span>${escapeHtml(getStudentName(session.studentId))} · ${formatDate(session.finishedAt.slice(0, 10))}</span>
          <div class="badge-row"><span class="badge is-success">Volume load ${session.totalVolumeLoad}</span></div>
        </div>
      </article>
    `;
  }

  function contractStatusMeta(contract) {
    if (!contract) return { key: "pending", label: "Pendente assinatura", className: "is-pending", badgeClass: "is-warning" };
    if (contract.status === "canceled") return { key: "canceled", label: "Cancelado", className: "is-canceled", badgeClass: "is-danger" };
    if (contract.status === "pending" || contract.status === "viewed") return { key: "pending", label: "Pendente assinatura", className: "is-pending", badgeClass: "is-warning" };
    if (contract.status === "signed") {
      if (contract.endDate && contract.endDate < todayISO()) return { key: "expired", label: "Vencido", className: "is-expired", badgeClass: "is-danger" };
      if (contract.endDate && contract.endDate <= addDays(todayISO(), 30)) return { key: "upcoming", label: "Próximo vencimento", className: "is-upcoming", badgeClass: "is-warning" };
      return { key: "signed", label: "Assinado", className: "is-signed", badgeClass: "is-success" };
    }
    return { key: "draft", label: contractStatusLabel(contract.status), className: "is-draft", badgeClass: "is-info" };
  }

  function contractPrimaryAction(contract, meta = contractStatusMeta(contract)) {
    if (meta.key === "pending") {
      return { label: "Reenviar", icon: icons.messages, attr: `data-send-contract-link="${escapeHtml(contract.id)}"` };
    }
    if (meta.key === "expired") {
      return { label: "Visualizar", icon: icons.contracts, attr: `data-open-contract="${escapeHtml(contract.id)}"` };
    }
    return { label: meta.key === "signed" ? "Visualizar" : "Visualizar", icon: icons.contracts, attr: `data-open-contract="${escapeHtml(contract.id)}"` };
  }

  function contractMatchesFilters(contract, filters = {}) {
    const meta = contractStatusMeta(contract);
    if (filters.status && filters.status !== "all") {
      if (filters.status === "signed") {
        if (meta.key !== "signed" && meta.key !== "upcoming") return false;
      } else if (meta.key !== filters.status) {
        return false;
      }
    }
    if (filters.studentId && contract.studentId !== filters.studentId) return false;
    if (filters.plan && filters.plan !== "all" && contract.plan !== filters.plan) return false;
    return true;
  }

  function renderContractRow(contract, manager = false) {
    const student = getStudent(contract.studentId);
    const meta = contractStatusMeta(contract);
    return `
      <article class="entity-row">
        ${studentAvatar(student)}
        <div class="entity-main">
          <strong>${escapeHtml(manager ? getStudentName(contract.studentId) : contract.title)}</strong>
          <span>${escapeHtml(contract.title)} · Versão ${escapeHtml(contract.version)}</span>
          <span>Criado em ${formatDate(contract.createdAt.slice(0, 10))}${contract.signedAt ? ` · Assinado em ${formatDate(contract.signedAt.slice(0, 10))}` : ""}${contract.emailSentAt || contract.linkSentAt ? ` · Link enviado em ${formatDate(String(contract.emailSentAt || contract.linkSentAt).slice(0, 10))}` : ""}</span>
          <div class="badge-row"><span class="badge ${meta.badgeClass}">${escapeHtml(meta.label)}</span></div>
        </div>
        <div class="row-actions contract-actions">
          <button class="mini-button" type="button" data-open-contract="${escapeHtml(contract.id)}">Abrir</button>
          ${
            manager && contract.status !== "signed" && contract.status !== "canceled"
              ? `<details class="action-menu"><summary>Mais ações</summary><div><button class="mini-button" type="button" data-open-contract-form="${escapeHtml(contract.studentId)}" data-contract-id="${escapeHtml(contract.id)}">Editar</button><button class="mini-button" type="button" data-send-contract-link="${escapeHtml(contract.id)}">Enviar link</button><button class="mini-button is-danger" type="button" data-cancel-contract="${escapeHtml(contract.id)}">Cancelar</button></div></details>`
              : ""
          }
        </div>
      </article>
    `;
  }

  function contractStatusLabel(status) {
    return { pending: "Pendente assinatura", viewed: "Pendente assinatura", signed: "Assinado", canceled: "Cancelado" }[status] || "Pendente assinatura";
  }

  function renderStudentContractGate(contract) {
    return `
      <div class="content-stack contract-gate">
        <section class="hero-panel">
          <div>
            <p>Acesso aguardando aceite</p>
            <h3>${escapeHtml(contract.title)}</h3>
            <span>Leia e aceite o contrato para liberar o app completo.</span>
          </div>
          ${statusBadge(contractStatusLabel(contract.status), "info")}
        </section>
        <section class="panel">
          <div class="section-title">
            <h3>Contrato pendente</h3>
            <span class="small-text">Versão ${escapeHtml(contract.version)}</span>
          </div>
          <p class="contract-body">${escapeHtml(contract.body)}</p>
          <div class="form-actions">
            <button class="primary-action" type="button" data-open-contract="${escapeHtml(contract.id)}">Ler e assinar contrato</button>
            <button class="ghost-button" type="button" data-logout>Sair</button>
          </div>
          <p class="small-text">Leia o contrato completo antes de assinar. O aceite registra data/hora, IP e identificação técnica.</p>
        </section>
      </div>
    `;
  }

  function renderConversation(studentId, compact = false) {
    const messages = getStudentMessages(studentId);
    if (!messages.length) return emptyState("Nenhuma mensagem", "Use o campo abaixo para iniciar a conversa.", icons.messages);
    const visible = compact ? messages.slice(-4) : messages;
    return `
      <div class="wa-bubble-list ${compact ? "is-compact" : ""}">
        ${visible
          .map(
            (message) => `
              <div class="wa-bubble ${message.senderRole === "manager" ? "is-manager" : "is-student"}">
                <p>${escapeHtml(message.body)}</p>
                <time>${escapeHtml(messageMomentLabel(message.createdAt))}</time>
              </div>
            `
          )
          .join("")}
      </div>
    `;
  }

  function renderStudentDiet() {
    const student = getCurrentStudent();
    const allPlans = getStudentDietPlans(student?.id).filter((p) => !["archived", "draft"].includes(dietStatusKey(p)));

    if (!allPlans.length) {
      return `
        <div class="content-stack">
          ${pageHeader("Dieta", "Plano alimentar publicado pelo personal")}
          <section class="panel">
            ${emptyState("Nenhum plano alimentar", "Quando o personal publicar um plano alimentar, ele aparecerá aqui.", icons.diet)}
          </section>
        </div>
      `;
    }

    const currentPlan = allPlans.find((p) => dietStatusKey(p) === "active") || allPlans[0];
    const q = (state.studentDietQ || "").toLowerCase().trim();
    const filteredPlans = allPlans.filter((p) => {
      if (!q) return true;
      return [p.title, p.objective, p.protocol, p.notes, p.instructions].join(" ").toLowerCase().includes(q);
    });
    const showSearch = allPlans.length > 1;

    return `
      <div class="content-stack">
        ${pageHeader("Dieta", escapeHtml(currentPlan.title || currentPlan.protocol || "Plano alimentar"))}
        ${renderStudentDietProtocolHero(currentPlan)}
        ${showSearch ? `
          <div class="search-filter-row" aria-label="Busca de planos alimentares">
            <label class="diet-search-field search-input-wrap">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 21l-4.3-4.3M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z"/></svg>
              <input type="search" data-student-diet-q placeholder="Buscar plano..." value="${escapeHtml(state.studentDietQ || "")}" />
            </label>
          </div>
        ` : ""}
        ${filteredPlans.length
          ? filteredPlans.map((plan) => renderStudentDietPlanCard(plan)).join("")
          : `<section class="panel">${emptyState("Nenhum plano encontrado", "Tente outros termos na busca.", icons.diet)}</section>`
        }
      </div>
    `;
  }

  function renderStudentProfile() {
    const student = getCurrentStudent();
    const contracts = getStudentContracts(student?.id);
    const pendingContracts = contracts.filter((contract) => contract.status === "pending" || contract.status === "viewed");
    const stats = student ? getStudentProfileStats(student) : null;
    const weekCount = stats ? stats.sessionsWeek.length : 0;
    const volumeLabel = stats ? `${Number(stats.recentVolume || 0).toLocaleString("pt-BR")} kg` : "0 kg";
    const nextAct = stats?.nextActivity;
    const contractSummary = stats?.contract || { label: "Sem contrato", tone: "" };
    const selectedDayItems = getAgendaItemsForDate(state.agendaDate, student?.id);
    const isDayView = state.agendaView === "day";
    const title = agendaPeriodLabel();
    return `
      <div class="content-stack">
        ${pageHeader("Mais", "Perfil, agenda e configurações", '<button class="pill-button" type="button" data-install-trigger>Baixar app</button>')}
        <section class="panel">
          <div class="profile-hero">
            <div>
              <h3>${escapeHtml(student?.name || "Aluno")}</h3>
              <p>${escapeHtml(student?.goal || "Sem objetivo cadastrado")}</p>
            </div>
            ${statusBadge(student?.status === "active" ? "Ativo" : "Inativo", student?.status === "active" ? "success" : "danger")}
          </div>
          <div class="profile-overview-grid student-summary-grid">
            ${profileSummaryCard(icons.workouts, "Treinos na semana", String(weekCount), weekCount ? "Concluídos esta semana" : "Sem treino concluído")}
            ${profileSummaryCard(icons.progress, "Volume recente", volumeLabel, "Últimos 4 treinos")}
            ${profileSummaryCard(icons.agenda, "Próxima atividade", nextAct ? formatShortDate(nextAct.date) : "Sem agenda", nextAct ? `${activityLabel(nextAct.type)} · ${nextAct.time || "--:--"}` : "Nenhuma marcada")}
            ${profileSummaryCard(icons.contracts, "Contrato", contractSummary.label, contractSummary.contract?.endDate ? `Até ${formatShortDate(contractSummary.contract.endDate)}` : "Status do contrato", contractSummary.tone)}
          </div>
          <button class="quick-link" type="button" data-open-messages="${escapeHtml(student?.id || "")}"><strong>Mensagens</strong><span>${state.socketReady ? "Tempo real ativo" : "Modo local"}</span></button>
        </section>

        <section class="agenda-control-panel">
          <div class="agenda-view-tabs" aria-label="Visualização da agenda">
            <button class="${state.agendaView === 'day' ? 'is-active' : ''}" type="button" data-agenda-view="day">Dia</button>
            <button class="${state.agendaView === 'week' ? 'is-active' : ''}" type="button" data-agenda-view="week">Semana</button>
            <button class="${state.agendaView === 'month' ? 'is-active' : ''}" type="button" data-agenda-view="month">Mês</button>
          </div>
          <div class="agenda-period-nav">
            <button class="icon-button" type="button" data-agenda-shift="-1" aria-label="Período anterior">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div class="agenda-period-label">
              <strong>${escapeHtml(title)}</strong>
            </div>
            <button class="icon-button" type="button" data-agenda-shift="1" aria-label="Próximo período">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
            </button>
            <button class="mini-button agenda-today-button" type="button" data-agenda-today>Hoje</button>
          </div>
        </section>

        ${isDayView ? "" : `
        <section class="panel agenda-calendar-panel" aria-label="Calendário da agenda">
          ${state.agendaView === 'week' ? renderWeekCalendar(student?.id || "") : renderMonthCalendar(student?.id || "")}
          ${renderAgendaLegend()}
        </section>
        `}

        <section class="panel agenda-day-panel">
          <div class="section-title">
            <div>
              <h3>Itens do dia</h3>
              <span class="small-text">${formatLongDate(state.agendaDate)} - ${selectedDayItems.length} item(ns)</span>
            </div>
          </div>
          ${renderStudentAgendaRows(selectedDayItems)}
        </section>

        <section class="panel">
          <div class="section-title"><h3>Contratos</h3><span class="small-text">${pendingContracts.length} pendente(s)</span></div>
          ${contracts.length ? `<div class="entity-list">${contracts.map((contract) => renderContractRow(contract, false)).join("")}</div>` : emptyState("Nenhum contrato", "Contratos enviados pelo personal aparecerão aqui.", icons.contracts)}
        </section>
        <section class="panel">
          <div class="section-title"><h3>Conta</h3><span class="small-text">E-mail e telefone</span></div>
          <div class="profile-grid">
            <article class="profile-card"><span>E-mail</span><strong>${escapeHtml(student?.email || "-")}</strong></article>
            <article class="profile-card"><span>Telefone</span><strong>${escapeHtml(student?.phone || "-")}</strong></article>
          </div>
          <button class="secondary-action" type="button" data-logout>Sair da conta</button>
        </section>
      </div>
    `;
  }

  function renderStudentDietProtocolHero(plan) {
    const meta = dietStatusMeta(plan);
    const kcal = plan.calories ? String(plan.calories) : null;
    const meals = plan.mealCount || (Array.isArray(plan.meals) && plan.meals.length ? String(plan.meals.length) : null);
    const nextReview = plan.nextReviewDate ? formatShortDate(plan.nextReviewDate) : null;
    return `
      <section class="student-diet-protocol panel">
        <div class="sdp-head">
          <div class="sdp-info">
            <span class="sdp-label">Protocolo atual</span>
            <strong class="sdp-title">${escapeHtml(plan.protocol || plan.title || "Plano alimentar")}</strong>
            ${plan.objective ? `<span class="sdp-objective">${escapeHtml(plan.objective)}</span>` : ""}
          </div>
          ${statusBadge(meta.label, meta.tone)}
        </div>
        ${(kcal || meals || nextReview) ? `
          <div class="sdp-stats">
            ${kcal ? `<span class="sdp-stat is-kcal"><strong>${escapeHtml(kcal)}</strong><span>kcal</span></span>` : ""}
            ${meals ? `<span class="sdp-stat"><strong>${escapeHtml(meals)}</strong><span>refeições/dia</span></span>` : ""}
            ${nextReview ? `<span class="sdp-stat"><strong>${escapeHtml(nextReview)}</strong><span>próxima revisão</span></span>` : ""}
          </div>
        ` : ""}
        ${plan.instructions || plan.notes ? `<p class="sdp-notes small-text">${escapeHtml(plan.instructions || plan.notes)}</p>` : ""}
      </section>
    `;
  }

  function renderStudentDietPlanCard(plan) {
    const meta = dietStatusMeta(plan);
    const meals = Array.isArray(plan.meals) ? plan.meals.filter((m) => m.name || m.items || (Array.isArray(m.foodItems) && m.foodItems.length)) : [];
    const checks = state.mealChecks[plan.id] || {};
    const checkedCount = Object.values(checks).filter(Boolean).length;
    return `
      <section class="panel student-diet-plan-card">
        <div class="sdpc-head">
          <div class="sdpc-title">
            <strong>${escapeHtml(plan.title || plan.protocol || "Plano alimentar")}</strong>
            <span>${escapeHtml(plan.objective || "Acompanhamento")}</span>
          </div>
          <div class="sdpc-meta">
            ${statusBadge(meta.label, meta.tone)}
            ${meals.length ? `<span class="small-text">${checkedCount}/${meals.length} refeições</span>` : ""}
          </div>
        </div>
        ${meals.length
          ? `<div class="student-meal-list">${meals.map((meal) => renderStudentMealCard(meal, !!checks[meal.id], plan.id)).join("")}</div>`
          : `<p class="small-text">${escapeHtml(plan.instructions || plan.notes || "Nenhuma refeição cadastrada neste plano.")}</p>`
        }
      </section>
    `;
  }

  function renderStudentMealCard(meal, isChecked, planId) {
    const foodItems = Array.isArray(meal.foodItems) && meal.foodItems.length ? meal.foodItems : null;
    const itemsText = meal.items && !foodItems ? meal.items : null;
    return `
      <article class="student-meal-card ${isChecked ? "is-checked" : ""}" data-meal-plan-id="${escapeHtml(planId)}" data-meal-id="${escapeHtml(meal.id)}">
        <div class="smc-header">
          <div class="smc-info">
            ${meal.time ? `<span class="smc-time">${escapeHtml(meal.time)}</span>` : ""}
            <strong class="smc-name">${escapeHtml(meal.name || "Refeição")}</strong>
          </div>
          <button class="meal-check-btn ${isChecked ? "is-checked" : ""}" type="button"
            data-toggle-meal-check="${escapeHtml(meal.id)}"
            data-plan-id="${escapeHtml(planId)}"
            aria-label="${isChecked ? "Desmarcar refeição cumprida" : "Marcar refeição como cumprida"}"
            aria-pressed="${isChecked}">
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>
          </button>
        </div>
        ${foodItems ? `
          <ul class="smc-food-list">
            ${foodItems.map((fi) => `
              <li class="smc-food-item">
                <span>${escapeHtml(fi.name)}</span>
                ${fi.qty ? `<span class="smc-qty">${escapeHtml(fi.qty)}</span>` : ""}
                ${fi.kcal ? `<span class="smc-kcal">${fi.kcal} kcal</span>` : ""}
              </li>
            `).join("")}
          </ul>
        ` : itemsText ? `<p class="smc-items-text small-text">${escapeHtml(itemsText)}</p>` : ""}
        ${meal.notes ? `<p class="smc-notes small-text">${escapeHtml(meal.notes)}</p>` : ""}
      </article>
    `;
  }

  function renderSettings() {
    const previewActivity = { title: "Treino A", date: "2026-06-10", time: "19:00" };
    const previewStudent = { name: "João" };
    const preview = buildWhatsAppMessage(previewActivity, previewStudent);
    const contractPreviewStudent = { name: "João", email: "joao@email.com", phone: "(34) 99999-0000" };
    const contractPreview = renderTemplate(state.data.settings.contractEmailMessage, contractVariables(contractPreviewStudent, { plan: "Plano mensal", value: "R$ 300,00" }, "https://app/contrato"));
    return `
      <div class="content-stack">
        ${pageHeader("Configurações", "Identidade do personal e comunicação")}
        <section class="panel">
          <div class="section-title"><h3>Personal e WhatsApp</h3><span class="small-text">Usado nos contatos da agenda</span></div>
          <form class="form-grid" id="settingsForm">
            <div class="form-grid two">
              <label class="field"><span>Nome do personal</span><input name="trainerName" type="text" value="${escapeHtml(state.data.settings.trainerName)}" required /></label>
              <label class="field"><span>Telefone do personal</span><input name="trainerPhone" type="tel" value="${escapeHtml(state.data.settings.trainerPhone)}" /></label>
              <label class="field"><span>E-mail de contato</span><input name="contactEmail" type="email" value="${escapeHtml(state.data.settings.contactEmail)}" /></label>
            </div>
            <label class="field"><span>Mensagem padrão</span><textarea name="whatsappTemplate" required>${escapeHtml(state.data.settings.whatsappTemplate)}</textarea></label>
            <p class="small-text">Você pode usar: {aluno}, {data}, {hora}, {atividade}, {personal}, {dia_semana}</p>
            <div class="preview-box"><strong>Prévia</strong><span>${escapeHtml(preview)}</span></div>
            <div class="section-title"><h3>Contrato e e-mail</h3><span class="small-text">Modelo usado no aceite interno</span></div>
            <label class="field"><span>Assunto do e-mail de contrato</span><input name="contractEmailSubject" type="text" value="${escapeHtml(state.data.settings.contractEmailSubject)}" required /></label>
            <label class="field"><span>Mensagem do e-mail de contrato</span><textarea name="contractEmailMessage" required>${escapeHtml(state.data.settings.contractEmailMessage)}</textarea></label>
            <label class="field"><span>Assinatura do e-mail</span><textarea name="contractEmailSignature">${escapeHtml(state.data.settings.contractEmailSignature)}</textarea></label>
            <label class="field"><span>Modelo padrão de contrato</span><textarea name="contractTemplate" required>${escapeHtml(state.data.settings.contractTemplate)}</textarea></label>
            <p class="small-text">Variáveis: {aluno}, {cpf}, {telefone}, {email}, {personal}, {plano}, {valor}, {data_inicio}, {data_fim}, {quantidade_aulas}, {data_assinatura}, {link_contrato}, {data}.</p>
            <div class="preview-box"><strong>Prévia do e-mail</strong><span>${escapeHtml(contractPreview)}</span></div>
            <button class="primary-action" type="submit">Salvar configurações</button>
          </form>
        </section>
        <section class="panel demo-only">
          <div class="section-title"><h3>Sistema local</h3><span class="small-text">Ferramentas de teste</span></div>
          <div class="profile-grid">
            <article class="profile-card"><span>Dados</span><strong>${state.data.students.length} alunos</strong><small>${state.data.exercises.length} exercícios · ${state.data.workouts.length} treinos · ${state.data.sessions.length} históricos</small></article>
            <article class="profile-card"><span>Admin</span><strong>${ADMIN.email}</strong><small>Senha de teste: Admin@2026</small></article>
          </div>
          <p class="small-text">A produção com autenticação forte e redefinição por link depende do backend ativo.</p>
          <button class="danger-action" type="button" data-clear-demo-data>Limpar dados demo</button>
        </section>
      </div>
    `;
  }

  function renderWorkoutExecution() {
    const session = state.activeSession;
    const workout = getWorkout(session.workoutId);
    const totalSets = session.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);
    const doneSets = session.exercises.reduce((sum, exercise) => sum + exercise.sets.filter((set) => set.status === "done").length, 0);
    const allDone = doneSets === totalSets && totalSets > 0;
    return `
      <div class="content-stack execution-screen">
        <section class="hero-panel">
          <div>
            <p>Treino em execução</p>
            <h3>${escapeHtml(workout?.title || "Treino")}</h3>
            <span>${doneSets}/${totalSets} séries concluídas · Volume atual ${calculateSessionVolume(session)}</span>
          </div>
          <button class="secondary-action" type="button" data-cancel-active-session>Cancelar</button>
        </section>
        <div class="execution-progress" role="progressbar" aria-valuenow="${doneSets}" aria-valuemin="0" aria-valuemax="${totalSets}" aria-label="Progresso do treino">
          <div class="execution-progress-track">
            <div class="execution-progress-fill" style="width:${totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0}%"></div>
          </div>
          <span class="execution-progress-label">${totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0}% concluído</span>
        </div>
        ${state.rest ? renderRestBanner() : ""}
        ${session.exercises.map((exercise, index) => renderExecutionExercise(exercise, index)).join("")}
        <section class="panel">
          <button class="primary-action" type="button" data-finish-workout ${allDone ? "" : "disabled"}>Finalizar treino</button>
        </section>
      </div>
    `;
  }

  function renderRestBanner() {
    return `
      <section class="rest-banner">
        <div><strong>Descanso</strong><span>${state.rest.remaining}s restantes</span></div>
        <button class="mini-button" type="button" data-skip-rest>Pular descanso</button>
      </section>
    `;
  }

  function renderExecutionExercise(exercise, exerciseIndex) {
    const libraryExercise = getExercise(exercise.exerciseId);
    const done = exercise.sets.filter((set) => set.status === "done").length;
    const status = done === exercise.sets.length ? "Concluído" : done > 0 ? "Em andamento" : "Pendente";
    return `
      <section class="panel exercise-execution">
        <div class="section-title">
          <h3>${escapeHtml(exercise.name)}</h3>
          <span class="badge ${status === "Concluído" ? "is-success" : status === "Em andamento" ? "is-info" : ""}">${status}</span>
        </div>
        ${libraryExercise ? videoActionHtml(libraryExercise) : ""}
        <p class="small-text">${escapeHtml(libraryExercise?.description || "Sem descrição cadastrada.")}</p>
        ${exercise.coachNotes ? `<p class="small-text">Observação do professor: ${escapeHtml(exercise.coachNotes)}</p>` : ""}
        <div class="set-list">
          ${exercise.sets.map((set, setIndex) => renderSetRow(set, exerciseIndex, setIndex, exercise)).join("")}
        </div>
      </section>
    `;
  }

  function renderSetRow(set, exerciseIndex, setIndex, exercise) {
    const running = set.status === "running";
    const done = set.status === "done";
    const actionAvailable = isSetActionAvailable(exerciseIndex, setIndex);
    const inputsDisabled = done || (!running && !actionAvailable);
    const justDone = done && state.lastDoneKey === `${exerciseIndex}:${setIndex}`;
    return `
      <article class="set-row ${done ? "is-done" : running ? "is-running" : ""}${justDone ? " just-done" : ""}">
        <div>
          <strong>Série ${setIndex + 1}</strong>
          <span>Alvo: ${escapeHtml(exercise.targetReps)} reps · Sugestão: ${escapeHtml(exercise.suggestedLoad || "-")} · Descanso: ${exercise.restSeconds}s</span>
        </div>
        <label><span>Carga</span><input type="number" step="0.5" min="0" value="${escapeHtml(set.load)}" data-set-load="${exerciseIndex}:${setIndex}" ${inputsDisabled ? "disabled" : ""} /></label>
        <label><span>Reps</span><input type="number" step="1" min="0" value="${escapeHtml(set.reps)}" data-set-reps="${exerciseIndex}:${setIndex}" ${inputsDisabled ? "disabled" : ""} /></label>
        <div class="row-actions">
          ${done ? `<span class="badge is-success">Volume ${set.volumeLoad}</span>` : `<button class="mini-button" type="button" data-series-action="${exerciseIndex}:${setIndex}" ${actionAvailable ? "" : "disabled"}>${running ? "Finalizar série" : "Iniciar série"}</button>`}
        </div>
      </article>
    `;
  }

  function isSetActionAvailable(exerciseIndex, setIndex) {
    const session = state.activeSession;
    const set = session?.exercises?.[exerciseIndex]?.sets?.[setIndex];
    if (!session || !set || set.status === "done" || state.rest) return false;
    if (set.status === "running") return true;
    const hasOtherRunning = session.exercises.some((exercise) => exercise.sets.some((candidate) => candidate.status === "running"));
    if (hasOtherRunning) return false;
    const flatSets = session.exercises.flatMap((exercise, currentExerciseIndex) =>
      exercise.sets.map((candidate, currentSetIndex) => ({ candidate, currentExerciseIndex, currentSetIndex }))
    );
    const currentIndex = flatSets.findIndex((item) => item.currentExerciseIndex === exerciseIndex && item.currentSetIndex === setIndex);
    return currentIndex >= 0 && flatSets.slice(0, currentIndex).every((item) => item.candidate.status === "done");
  }

  function calculateSessionVolume(session) {
    return session.exercises.reduce((total, exercise) => total + exercise.sets.reduce((sum, set) => sum + Number(set.volumeLoad || 0), 0), 0);
  }

  let modalCloseTimer = null;
  let skeletonRenderVersion = 0;

  const _sheetTimers = new Map();

  function _openSheet(sheetEl) {
    const t = _sheetTimers.get(sheetEl);
    if (t) { clearTimeout(t); _sheetTimers.delete(sheetEl); }
    sheetEl.classList.remove("is-closing");
    sheetEl.hidden = false;
    void sheetEl.offsetWidth;
    sheetEl.classList.add("is-open");
  }

  function _closeSheet(sheetEl, afterFn) {
    if (!sheetEl || sheetEl.hidden || sheetEl.classList.contains("is-closing")) return;
    sheetEl.classList.remove("is-open");
    sheetEl.classList.add("is-closing");
    const t = setTimeout(() => {
      sheetEl.hidden = true;
      sheetEl.classList.remove("is-closing");
      _sheetTimers.delete(sheetEl);
      if (afterFn) afterFn();
    }, 180);
    _sheetTimers.set(sheetEl, t);
  }

  function openModal(title, body) {
    if (modalCloseTimer) { clearTimeout(modalCloseTimer); modalCloseTimer = null; }
    elements.modal.classList.remove("is-closing", "is-open");
    elements.modalTitle.textContent = fixMojibake(title);
    elements.modalBody.innerHTML = fixMojibake(body);
    scrubVisibleText(elements.modalBody);
    elements.modal.hidden = false;
    void elements.modal.offsetWidth;
    elements.modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    const first = elements.modalBody.querySelector("input, select, textarea, button");
    if (first) first.focus({ preventScroll: true });
  }

  function closeModal() {
    if (elements.modal.hidden) return;
    elements.modal.classList.remove("is-open");
    elements.modal.classList.add("is-closing");
    modalCloseTimer = setTimeout(() => {
      modalCloseTimer = null;
      elements.modal.hidden = true;
      elements.modal.classList.remove("is-closing");
      elements.modalBody.innerHTML = "";
      document.body.style.overflow = "";
    }, 160);
  }

  function studentOptions(selected = "") {
    if (!state.data.students.length) return '<option value="">Cadastre um aluno primeiro</option>';
    return state.data.students.map((student) => `<option value="${student.id}" ${student.id === selected ? "selected" : ""}>${escapeHtml(student.name)}</option>`).join("");
  }

  function exerciseOptions(selected = "") {
    const active = state.data.exercises.filter((exercise) => exercise.status === "active");
    if (!active.length) return '<option value="">Cadastre exercícios primeiro</option>';
    return active.map((exercise) => `<option value="${exercise.id}" ${exercise.id === selected ? "selected" : ""}>${escapeHtml(exercise.name)} · ${escapeHtml(getExercisePrimaryMuscle(exercise))}</option>`).join("");
  }

  function workoutOptions(studentId = "", selected = "") {
    const workouts = state.data.workouts.filter((workout) => workout.status === "published" && (!studentId || workout.studentId === studentId));
    return `<option value="">Sem treino vinculado</option>${workouts.map((workout) => `<option value="${workout.id}" ${workout.id === selected ? "selected" : ""}>${escapeHtml(workout.title)}</option>`).join("")}`;
  }

  function openStudentForm(studentId = "") {
    const student = getStudent(studentId) || {};
    const access = getStudentAccessState(student);
    openModal(
      student.id ? "Editar aluno" : "Novo aluno",
      `
        <form class="form-grid" id="studentForm" data-id="${student.id || ""}">
          <div class="form-grid two">
            <label class="field"><span>Nome</span><input name="name" type="text" value="${escapeHtml(student.name)}" required /></label>
            <label class="field"><span>E-mail</span><input name="email" type="email" value="${escapeHtml(student.email)}" required /></label>
            <label class="field"><span>Telefone</span><input name="phone" type="tel" value="${escapeHtml(student.phone)}" /></label>
            <label class="field"><span>Objetivo</span><input name="goal" type="text" value="${escapeHtml(student.goal || "Condicionamento")}" /></label>
            <label class="field"><span>Status</span><select name="status"><option value="active" ${student.status !== "inactive" ? "selected" : ""}>Ativo</option><option value="inactive" ${student.status === "inactive" ? "selected" : ""}>Inativo</option></select></label>
          </div>
          <div class="empty-state compact-note">
            <strong>${student.id ? access.label : "Convite de acesso"}</strong>
            <span>${student.id ? escapeHtml(access.detail) : "Ao salvar, o sistema gera um link para o aluno criar a própria senha. O gestor não define nem visualiza senha de aluno."}</span>
          </div>
          <label class="field"><span>Observações internas</span><textarea name="internalNotes">${escapeHtml(student.internalNotes)}</textarea></label>
          <div class="form-actions">
            <button class="primary-action" type="submit">${student.id ? "Salvar aluno" : "Salvar e enviar convite"}</button>
            ${student.id ? `<button class="secondary-action" type="button" data-send-student-invite="${student.id}">${access.value === "active" ? "Enviar link de senha" : "Reenviar convite"}</button>` : ""}
          </div>
        </form>
      `
    );
  }

  function renderManagerStudentProfile() {
    const student = getStudent(state.activeStudentProfileId || parseStudentProfileHash());
    if (!student) {
      return `
        <div class="content-stack">
          ${pageHeader("Aluno", "Perfil não encontrado", '<button class="secondary-action" type="button" data-manager-nav="students">Voltar para alunos</button>')}
          ${emptyState("Aluno não encontrado", "Volte para a lista de alunos e abra um cadastro válido.", icons.students)}
        </div>
      `;
    }
    state.activeStudentProfileId = student.id;
    const stats = getStudentProfileStats(student);
    const access = getStudentAccessState(student);
    return `
      <div class="sp-wrapper student-page">
        <div class="sp-sticky-head" id="profileStickyHead">
          <div class="sp-topbar">
            <button class="icon-button back-button" type="button" data-manager-nav="students" aria-label="Voltar para alunos">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <h3 class="sp-title">${escapeHtml(student.name)}</h3>
            <div class="sp-topbar-actions">
              <button class="secondary-action sp-send-link-btn" type="button" data-send-student-invite="${student.id}">${access.value === "active" ? "Enviar link" : "Reenviar"}</button>
              <button class="icon-button sp-edit-btn" type="button" data-open-student-form="${student.id}" aria-label="Editar aluno">
                <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
            </div>
          </div>
          ${renderStudentProfileHero(student, stats)}
          ${renderStudentSummaryCards(student, stats)}
          ${renderProfileTabs(state.profileTab)}
        </div>
        <div class="sp-tab-body" id="profileTabBody">
          ${renderStudentProfileTab(student, state.profileTab)}
        </div>
      </div>
    `;
  }

  function openStudentProfile(studentId, options = {}) {
    const student = getStudent(studentId);
    if (!student) return;
    state.activeStudentProfileId = student.id;
    state.managerMenu = "studentProfile";
    const validTabs = ["summary", "workouts", "agenda", "history", "progress", "updates", "contracts", "messages"];
    if (!validTabs.includes(state.profileTab)) state.profileTab = "summary";
    if (options.updateHash !== false) updateStudentProfileHash(student.id);
    renderApp();
  }

  function switchProfileTab(newTab) {
    state.profileTab = newTab;
    const student = getStudent(state.activeStudentProfileId);
    if (!student) return;
    // Atualiza apenas o estado visual dos botões de aba
    document.querySelectorAll("#profileStickyHead [data-profile-tab]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.profileTab === newTab);
    });
    // Substitui apenas o corpo da aba, sem tocar no cabeçalho
    const tabBody = document.getElementById("profileTabBody");
    if (tabBody) {
      tabBody.innerHTML = fixMojibake(renderStudentProfileTab(student, newTab));
      scrubVisibleText(tabBody);
    }
  }

  function renderStudentProfileHero(student, providedStats = null) {
    const access = getStudentAccessState(student);
    const status = getStudentOperationalStatus(student);
    return `
      <section class="profile-hero student-profile-hero">
        <div class="student-hero-main">
          ${studentAvatar(student)}
          <div class="student-hero-identity">
            <h3>${escapeHtml(student.name)}</h3>
            <p>Objetivo: ${escapeHtml(student.goal || "Sem objetivo cadastrado")}</p>
            ${statusBadge(status.label, status.tone)}
          </div>
          <details class="action-menu student-hero-menu">
            <summary aria-label="Mais ações">${icons.more}</summary>
            <div>
              <button class="mini-button" type="button" data-open-student-form="${student.id}">Editar dados</button>
              <button class="mini-button" type="button" data-open-workout-form data-prefill-student="${student.id}">Novo treino</button>
              <button class="mini-button" type="button" data-open-activity-form data-prefill-student="${student.id}">Agendar atividade</button>
              <button class="mini-button" type="button" data-open-contract-form="${student.id}">Novo contrato</button>
              <button class="mini-button is-danger" type="button" data-delete-student="${student.id}">Remover aluno</button>
            </div>
          </details>
        </div>
      </section>
    `;
  }

  function renderStudentSummaryCards(student, stats = getStudentProfileStats(student)) {
    const access = getStudentAccessState(student);
    const contract = getStudentContractState(student.id);
    return `
      <section class="student-summary-grid">
        ${profileSummaryCard(icons.profile, "Acesso", access.label, access.detail || access.label, access.tone)}
        ${profileSummaryCard(icons.contracts, "Contrato", contract.contract?.endDate ? formatShortDate(contract.contract.endDate) : contract.label, contract.contract ? "Vigência e status" : "Nenhum contrato enviado", contract.tone)}
        ${profileSummaryCard(icons.updates, "Última atualização", stats.lastUpdate ? formatShortDate(String(stats.lastUpdate.submittedAt || stats.lastUpdate.dueDate).slice(0, 10)) : "Nenhuma", stats.lastUpdate ? "Registro enviado" : "Sem envio registrado")}
        ${profileSummaryCard(icons.workouts, "Próximo treino", stats.nextActivity ? formatShortDate(stats.nextActivity.date) : "Sem agenda", stats.nextActivity ? `${activityLabel(stats.nextActivity.type)} · ${stats.nextActivity.time || "--:--"}` : "Nenhuma atividade marcada")}
        ${profileSummaryCard(icons.agenda, "Treinos na semana", `${stats.sessionsWeek.length}`, stats.sessionsWeek.length ? "Concluídos nesta semana" : "Sem treino concluído")}
        ${profileSummaryCard(icons.progress, "Volume recente", stats.recentVolume, "Últimos 4 treinos")}
      </section>
    `;
  }

  function profileSummaryCard(icon, label, value, detail = "", tone = "") {
    return `
      <article class="profile-card student-summary-card ${tone ? `is-${tone}` : ""}">
        <span class="profile-card-icon">${icon}</span>
        <div class="profile-card-body">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(String(value))}</strong>
          ${detail ? `<small>${escapeHtml(detail)}</small>` : ""}
        </div>
      </article>
    `;
  }

  function renderProfileTabs(activeTab) {
    const tabs = [
      ["summary", "Visão geral"],
      ["workouts", "Treinos"],
      ["agenda", "Agenda"],
      ["history", "Histórico"],
      ["progress", "Evolução"],
      ["updates", "Atualizações"],
      ["contracts", "Contrato"],
      ["messages", "Mensagens"],
      ["notes", "Observações"]
    ];
    return `
      <div class="tab-row student-profile-tabs" role="tablist" aria-label="Seções do perfil">
        ${tabs.map(([id, label]) => `<button class="${activeTab === id ? "is-active" : ""}" type="button" data-profile-tab="${id}">${profileTabLabel(id, label)}</button>`).join("")}
      </div>
    `;
  }

  function profileTabLabel(id, fallback = "") {
    const labels = {
      summary: "Visão geral",
      workouts: "Treinos",
      agenda: "Agenda",
      history: "Histórico",
      progress: "Evolução",
      updates: "Atualizações",
      contracts: "Contrato",
      messages: "Mensagens"
    };
    return labels[id] || fallback;
  }

  function renderStudentProfileTab(student, tab) {
    const sessions = getStudentSessions(student.id);
    const workouts = getStudentWorkouts(student.id);
    const updates = state.data.updates.filter((update) => update.studentId === student.id).sort((a, b) => b.dueDate.localeCompare(a.dueDate));
    const contracts = getStudentContracts(student.id);
    const nextActivity = getNextActivityForStudent(student.id);
    const pending = getUpdateForStudent(student.id, "pending");
    const lastUpdate = updates.find((update) => update.status !== "pending");
    const stats = getStudentProfileStats(student);

    if (tab === "summary") {
      return renderStudentProfileOverview(student, { sessions, workouts, updates, contracts, nextActivity, pending, lastUpdate, stats });
    }

    if (tab === "agenda") {
      const agendaItems = getAgendaItemsForWeek(todayISO(), student.id);
      return `<section class="panel profile-tab-panel"><div class="section-title"><h3>Agenda do aluno</h3><button class="mini-button" type="button" data-open-activity-form data-prefill-student="${student.id}">Agendar atividade</button></div>${renderAgendaList(agendaItems, true)}</section>`;
    }

    if (tab === "workouts") {
      const published = workouts.filter((workout) => workout.status === "published");
      const drafts = workouts.filter((workout) => workout.status === "draft");
      const archived = workouts.filter((workout) => workout.status === "archived");
      const availablePatterns = getAvailableWorkoutPatterns();
      return `
        <section class="panel profile-tab-panel">
          <div class="section-title">
            <div>
              <h3>Treinos do aluno</h3>
              <span class="small-text">${workouts.length} treino(s) · ${published.length} publicado(s) · ${drafts.length} rascunho(s) · ${archived.length} arquivado(s)</span>
            </div>
            <div class="section-actions">
              <button class="mini-button" type="button" data-open-workout-form data-prefill-student="${student.id}">Novo treino</button>
              <button class="mini-button" type="button" data-open-student-pattern-workout="${student.id}" ${availablePatterns.length ? "" : "disabled"}>Aplicar padrão</button>
            </div>
          </div>
          <div class="quick-grid student-profile-actions">
            <button class="quick-link" type="button" data-open-workout-form data-prefill-student="${student.id}"><strong>Novo treino</strong><span>Monte com exercícios da biblioteca</span></button>
            <button class="quick-link" type="button" data-open-student-pattern-workout="${student.id}" ${availablePatterns.length ? "" : "disabled"}><strong>Aplicar padrão</strong><span>${availablePatterns.length ? `${availablePatterns.length} padrão(s) disponível(is)` : "Nenhum padrão disponível"}</span></button>
          </div>
          ${workouts.length ? `<div class="workout-list">${workouts.map((workout) => renderWorkoutCard(workout, true)).join("")}</div>` : emptyState("Nenhum treino publicado", "Crie um treino do zero ou aplique um padrão.", icons.workouts)}
        </section>
      `;
    }

    if (tab === "diet") {
      const diet = getCurrentDietPlanForStudent(student.id);
      return `
        <section class="panel profile-tab-panel">
          <div class="section-title">
            <div>
              <h3>Dieta</h3>
              <span class="small-text">${diet ? "Plano alimentar atual do aluno" : "Nenhum plano alimentar ativo"}</span>
            </div>
            <button class="mini-button" type="button" data-open-diet-form data-prefill-student="${escapeHtml(student.id)}">Novo plano</button>
          </div>
          ${
            diet
              ? `<div class="diet-plan-list">${renderDietPlanCard(diet)}</div>`
              : emptyState("Aluno sem plano alimentar", "Crie um plano para iniciar o acompanhamento alimentar.", icons.diet)
          }
        </section>
      `;
    }

    if (tab === "history") {
      return `<section class="panel"><div class="section-title"><h3>Histórico de treinos</h3><span class="small-text">${sessions.length} treino(s)</span></div>${sessions.length ? `<div class="entity-list">${sessions.map(renderSessionRow).join("")}</div>` : emptyState("Nenhum histórico", "Treinos finalizados pelo aluno aparecerão aqui.", icons.progress)}</section>`;
    }

    if (tab === "progress") return renderStudentEvolutionPanel(student.id, true);

    if (tab === "updates") {
      return `<section class="panel"><div class="section-title"><h3>Atualizações quinzenais</h3><span class="small-text">${updates.length} registro(s)</span></div>${updates.length ? `<div class="entity-list">${updates.map(renderUpdateRow).join("")}</div>` : emptyState("Nenhuma atualização", "O histórico de atualizações aparecerá aqui.", icons.updates)}</section>`;
    }

    if (tab === "contracts") {
      return `
        <section class="panel">
          <div class="section-title"><h3>Contrato</h3><button class="mini-button" type="button" data-open-contract-form="${student.id}">Novo contrato</button></div>
          ${contracts.length ? `<div class="entity-list">${contracts.map((contract) => renderContractRow(contract, true)).join("")}</div>` : emptyState("Nenhum contrato", "Crie um contrato para o aluno aceitar dentro do app.", icons.contracts)}
        </section>
      `;
    }

    if (tab === "messages") {
      return `
        <section class="panel">
          <div class="section-title"><h3>Mensagens</h3><button class="mini-button" type="button" data-open-messages="${student.id}">Abrir conversa</button></div>
          ${renderConversation(student.id, true)}
        </section>
      `;
    }

    if (tab === "notes") {
      return `
        <section class="panel">
          <div class="section-title"><h3>Observações internas</h3><button class="mini-button" type="button" data-open-student-form="${student.id}">Editar aluno</button></div>
          <div class="profile-grid">
            <article class="profile-card"><span>E-mail</span><strong>${escapeHtml(student.email)}</strong></article>
            <article class="profile-card"><span>Telefone</span><strong>${escapeHtml(student.phone || "-")}</strong></article>
          </div>
          <div class="action-panel inline-action">${whatsappButton(nextActivity?.id || "", student.id)}<button class="mini-button is-danger" type="button" data-delete-student="${student.id}">Remover aluno</button></div>
          <p class="small-text">${escapeHtml(student.internalNotes || "Nenhuma observação interna.")}</p>
        </section>
      `;
    }

    return `
      <section class="profile-overview-grid">
        <article class="panel">
          <div class="section-title"><h3>Próxima atividade</h3><button class="mini-button" type="button" data-open-activity-form data-prefill-student="${student.id}">Agendar</button></div>
          ${
            nextActivity
              ? `<div class="entity-list">${renderAgendaCompact(nextActivity, true)}</div>`
              : emptyState("Nenhuma atividade programada", "Agende um treino ou atualização para este aluno.", icons.agenda)
          }
        </article>
        <article class="panel">
          <div class="section-title"><h3>Últimos treinos</h3><span class="small-text">${sessions.length} registro(s)</span></div>
          ${sessions.length ? `<div class="entity-list">${sessions.slice(0, 3).map(renderSessionRow).join("")}</div>` : emptyState("Nenhum histórico", "Treinos finalizados aparecerão aqui.", icons.progress)}
        </article>
        <article class="panel">
          <div class="section-title"><h3>Atualizações recentes</h3><span class="small-text">${updates.length} registro(s)</span></div>
          ${updates.length ? `<div class="entity-list">${updates.slice(0, 3).map(renderUpdateRow).join("")}</div>` : emptyState("Nenhuma atualização", "Atualizações quinzenais aparecerão aqui.", icons.updates)}
        </article>
        <article class="panel">
          <div class="section-title"><h3>Pendências</h3><span class="small-text">${stats.pendingCount} item(ns)</span></div>
          <div class="profile-grid">
            <article class="profile-card"><span>Atualização</span><strong>${pending ? formatDate(pending.dueDate) : "Em dia"}</strong></article>
            <article class="profile-card"><span>Contrato</span><strong>${escapeHtml(stats.contract.label)}</strong></article>
          </div>
          ${stats.pendingCount ? "" : emptyState("Nenhuma pendência crítica", "Nada exige ação imediata neste momento.", icons.updates)}
        </article>
      </section>
      <section class="panel">
        <div class="section-title"><h3>Ações rápidas</h3><span class="small-text">Principais operações do aluno</span></div>
        <div class="quick-grid">
          <button class="quick-link" type="button" data-open-workout-form data-prefill-student="${student.id}"><strong>Novo treino</strong><span>Montar e publicar</span></button>
          <button class="quick-link" type="button" data-open-activity-form data-prefill-student="${student.id}"><strong>Agendar atividade</strong><span>Treino ou atualização</span></button>
          <button class="quick-link" type="button" data-open-contract-form="${student.id}"><strong>Novo contrato</strong><span>Enviar para aceite</span></button>
          <button class="quick-link" type="button" data-open-messages="${student.id}"><strong>Mensagem</strong><span>Abrir conversa</span></button>
        </div>
      </section>
    `;
  }

  function renderStudentProfileOverview(student, context) {
    const sessions = context.sessions || [];
    const nextActivity = context.nextActivity;
    const latestSession = sessions[0];
    const latestWorkout = latestSession ? getWorkout(latestSession.workoutId) : null;
    const nextTitle = nextActivity ? activityLabel(nextActivity.type) : "Nenhum treino programado";
    const nextSubtitle = nextActivity
      ? `${formatShortDate(nextActivity.date)} • ${nextActivity.time || "--:--"}`
      : "Agende uma atividade ou crie um treino para este aluno.";
    const lastTitle = latestWorkout?.title || (latestSession ? "Treino concluído" : "Sem histórico");
    const lastSubtitle = latestSession
      ? `${formatShortDate(latestSession.finishedAt)} • ${Number(latestSession.totalVolumeLoad || 0).toLocaleString("pt-BR")} kg`
      : "Treinos finalizados aparecerão aqui.";

    return `
      <section class="profile-overview-grid profile-activity-grid">
        ${renderProfileActivityCard({
          title: "Próximo treino",
          icon: icons.agenda,
          primary: nextTitle,
          secondary: nextSubtitle,
          action: nextActivity
            ? `<button class="mini-button" type="button" data-open-activity-form="${escapeHtml(nextActivity.id)}">Ver detalhes</button>`
            : `<button class="mini-button" type="button" data-open-activity-form data-prefill-student="${escapeHtml(student.id)}">Agendar</button>`
        })}
        ${renderProfileActivityCard({
          title: "Último treino concluído",
          icon: icons.today,
          primary: lastTitle,
          secondary: lastSubtitle,
          action: `<button class="mini-button" type="button" data-profile-tab="history">Ver resumo</button>`
        })}
      </section>
      ${renderStudentPendingActions(student, context)}
      ${renderStudentEvolutionPanel(student.id)}
    `;
  }

  function renderProfileActivityCard({ title, icon, primary, secondary, action }) {
    return `
      <article class="panel profile-activity-card">
        <div class="section-title">
          <h3>${escapeHtml(title)}</h3>
          <span class="profile-card-icon">${icon}</span>
        </div>
        <div class="profile-activity-body">
          <strong>${escapeHtml(primary)}</strong>
          <span>${escapeHtml(secondary || "")}</span>
        </div>
        <div class="profile-activity-actions">${action || ""}</div>
      </article>
    `;
  }

  function renderStudentPendingActions(student, context) {
    const stats = context.stats || getStudentProfileStats(student);
    const contracts = context.contracts || getStudentContracts(student.id);
    const workouts = context.workouts || getStudentWorkouts(student.id);
    const pendingUpdate = context.pending;
    const pendingContract = contracts.find((contract) => contract.status === "pending" || contract.status === "viewed");
    const hasPublishedWorkout = workouts.some((workout) => workout.status === "published");
    const rows = [];

    if (pendingUpdate) {
      rows.push(renderProfilePendingRow({
        icon: icons.updates,
        title: "Atualização pendente",
        subtitle: `Vencimento: ${formatShortDate(pendingUpdate.dueDate)}`,
        action: 'data-profile-tab="updates"',
        tone: "warning"
      }));
    }

    if (pendingContract) {
      rows.push(renderProfilePendingRow({
        icon: icons.contracts,
        title: "Contrato pendente",
        subtitle: `Plano: ${escapeHtml(pendingContract.plan || "Contrato do aluno")}`,
        action: 'data-profile-tab="contracts"',
        tone: "warning"
      }));
    }

    if (!hasPublishedWorkout) {
      rows.push(renderProfilePendingRow({
        icon: icons.workouts,
        title: "Aluno sem treino publicado",
        subtitle: escapeHtml(student.goal || "Monte um treino para iniciar o acompanhamento."),
        action: `data-open-workout-form data-prefill-student="${escapeHtml(student.id)}"`,
        tone: "info"
      }));
    }

    const unread = state.data.messages.filter((message) => message.studentId === student.id && message.senderRole === "student" && !message.readAt).length;
    if (unread) {
      rows.push(renderProfilePendingRow({
        icon: icons.messages,
        title: `${unread} mensagem(ns) não lida(s)`,
        subtitle: "Conversa aguardando resposta",
        action: `data-open-messages="${escapeHtml(student.id)}"`,
        tone: "success"
      }));
    }

    return `
      <section class="panel profile-pending-panel">
        <div class="section-title">
          <h3>Ações pendentes</h3>
          <span class="profile-card-icon">${icons.updates}</span>
        </div>
        ${
          rows.length
            ? `<div class="profile-pending-list">${rows.slice(0, 3).join("")}</div>`
            : emptyState("Nenhuma ação pendente", "Este aluno está em dia no momento.", icons.updates)
        }
      </section>
    `;
  }

  function renderProfilePendingRow({ icon, title, subtitle, action, tone = "" }) {
    const badgeLabel = tone === "danger" ? "Urgente" : tone === "success" ? "Responder" : "Pendente";
    return `
      <button class="profile-pending-row ${tone ? `is-${tone}` : ""}" type="button" ${action || ""}>
        <span class="profile-pending-icon">${icon}</span>
        <div class="profile-pending-text">
          <strong>${escapeHtml(title)}</strong>
          <span>${escapeHtml(subtitle)}</span>
        </div>
        ${statusBadge(badgeLabel, tone)}
      </button>
    `;
  }

  function renderStudentEvolutionPanel(studentId, expanded = false) {
    const ordered = getStudentSessions(studentId).slice().reverse();
    const current = ordered.slice(-6);
    const previous = ordered.slice(-12, -6);
    const values = current.map((session) => Number(session.totalVolumeLoad || 0));
    const labels = current.map((session) =>
      parseISODate(session.finishedAt).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "").toUpperCase()
    );
    const total = values.reduce((sum, value) => sum + value, 0);
    const previousTotal = previous.reduce((sum, session) => sum + Number(session.totalVolumeLoad || 0), 0);
    const change = previousTotal ? Math.round(((total - previousTotal) / previousTotal) * 100) : 0;
    const hasData = values.some((value) => value > 0);
    const max = Math.max(...values, 1);
    const width = 520;
    const height = 210;
    const padX = 34;
    const padY = 20;
    const step = values.length > 1 ? (width - padX * 2) / (values.length - 1) : 0;
    const points = values.map((value, index) => {
      const x = values.length > 1 ? padX + index * step : width / 2;
      const y = height - padY - (value / max) * (height - padY * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    const areaPoints = hasData ? `${padX},${height - padY} ${points.join(" ")} ${width - padX},${height - padY}` : "";
    const fallbackLabels = ["DEZ", "JAN", "FEV", "MAR", "ABR", "MAI"];

    return `
      <section class="panel profile-evolution-panel ${expanded ? "is-expanded" : ""}">
        <div class="section-title">
          <h3>Evolução – Volume total (kg)</h3>
          <button class="mini-button profile-period-pill" type="button" data-profile-tab="progress">Últimos 6 treinos</button>
        </div>
        <div class="profile-evolution-layout ${hasData ? "" : "is-empty"}">
          <div class="profile-chart-wrap">
            <svg class="profile-volume-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Evolução de volume total">
              <line x1="${padX}" y1="${height - padY}" x2="${width - padX}" y2="${height - padY}" />
              <line x1="${padX}" y1="${height * 0.68}" x2="${width - padX}" y2="${height * 0.68}" />
              <line x1="${padX}" y1="${height * 0.38}" x2="${width - padX}" y2="${height * 0.38}" />
              ${hasData ? `<polygon points="${areaPoints}" /><polyline points="${points.join(" ")}" />${points.map((point) => {
                const [x, y] = point.split(",");
                return `<circle cx="${x}" cy="${y}" r="5" />`;
              }).join("")}` : `<path d="M${padX} ${height * 0.58} C ${width * 0.32} ${height * 0.48}, ${width * 0.56} ${height * 0.68}, ${width - padX} ${height * 0.5}" />`}
            </svg>
            <div class="profile-chart-labels">
              ${(labels.length ? labels : fallbackLabels).map((label) => `<span>${escapeHtml(label)}</span>`).join("")}
            </div>
            ${hasData ? "" : `<p class="profile-chart-empty">Sem dados suficientes. A evolução aparecerá conforme o aluno concluir treinos.</p>`}
          </div>
          <aside class="profile-chart-summary">
            <strong>${Number(total || 0).toLocaleString("pt-BR")} <small>kg</small></strong>
            <span>Volume total</span>
            <em class="${change >= 0 ? "is-positive" : "is-negative"}">${change >= 0 ? "↑" : "↓"} ${Math.abs(change)}%</em>
            <small>vs. período anterior</small>
          </aside>
        </div>
      </section>
    `;
  }

  function openExerciseForm(exerciseId = "") {
    const sheet = elements.exerciseSheet;
    const body = elements.exerciseSheetBody;
    const titleEl = elements.exerciseSheetTitle;
    if (!sheet || !body) return;

    const exercise = getExercise(exerciseId) || {};
    const isEdit = Boolean(exercise.id);
    const primaryMuscle = isEdit ? getExercisePrimaryMuscle(exercise) : "";
    const secondaryMuscles = getExerciseSecondaryMuscles(exercise);
    const hasVideo = hasExerciseVideo(exercise);
    const videoLink = exercise.videoStorage === "indexeddb" ? "" : exercise.videoUrl || "";

    if (titleEl) titleEl.textContent = isEdit ? "Editar exercício" : "Novo exercício";

    const videoCardHtml = hasVideo
      ? `<div class="ex-video-card ex-video-card--filled">
          <div class="ex-video-active">
            <div class="ex-video-play-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <span class="ex-video-name">${escapeHtml(exercise.videoName || exercise.videoUrl || "Vídeo cadastrado")}</span>
            ${exercise.videoSize ? `<span class="ex-video-meta">${escapeHtml(formatFileSize(exercise.videoSize))}</span>` : ""}
          </div>
          <div class="ex-video-actions">
            <label class="ex-video-action-btn" title="Substituir vídeo">
              <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
              Substituir
              <input name="videoFile" type="file" accept="video/mp4,video/webm,video/quicktime" style="display:none" />
            </label>
            ${isEdit ? `<button class="ex-video-action-btn ex-video-action-btn--danger" type="button" data-remove-exercise-video="${escapeHtml(exercise.id)}">Remover</button>` : ""}
          </div>
        </div>`
      : `<div class="ex-video-card">
          <div class="ex-video-placeholder">
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m10 9 6 3-6 3V9Z"/></svg>
            <span class="ex-video-label">Nenhum vídeo adicionado</span>
            <label class="ex-video-upload-btn">
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" stroke="currentColor" fill="none" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
              Enviar vídeo
              <input name="videoFile" type="file" accept="video/mp4,video/webm,video/quicktime" style="display:none" />
            </label>
          </div>
        </div>`;

    const statusBadgeHtml = isEdit
      ? `<div class="ex-status-row">
          <span class="ex-status-label">Status:</span>
          ${exercise.status === "active"
            ? `<span class="badge is-success">Publicado</span>`
            : `<span class="badge" style="background:rgba(59,130,246,0.12);color:#3b82f6;border:1px solid rgba(59,130,246,0.25)">Rascunho</span>`}
        </div>`
      : "";

    body.innerHTML = `
      <form class="ex-form" id="exerciseForm" data-id="${exercise.id || ""}">
        ${videoCardHtml}

        <label class="field">
          <span>Nome <span class="ns-required" aria-hidden="true">*</span></span>
          <input name="name" type="text" value="${escapeHtml(exercise.name || "")}" required placeholder="Ex: Agachamento livre" autocomplete="off" />
        </label>

        <div class="form-grid two">
          <label class="field">
            <span>Grupo muscular</span>
            <select name="primaryMuscle" required>${exerciseMuscleOptions(primaryMuscle, [primaryMuscle])}</select>
          </label>
          <label class="field">
            <span>Equipamento</span>
            <select name="equipment">${equipmentOptions(exercise.equipment || "Peso corporal")}</select>
          </label>
        </div>

        <div class="field">
          <span>Grupos secundários</span>
          <div class="ex-tag-chips">${exerciseTagChips(secondaryMuscles, primaryMuscle)}</div>
        </div>

        <div class="ex-params-card">
          <div class="ex-params-title">Parâmetros padrão</div>
          <div class="form-grid ex-params-grid">
            <label class="field">
              <span>Séries</span>
              <input name="defaultSets" type="number" min="1" max="20" value="${exercise.defaultSets || 3}" />
            </label>
            <label class="field">
              <span>Reps mín.</span>
              <input name="defaultRepsMin" type="number" min="1" max="100" value="${exercise.defaultRepsMin || 8}" />
            </label>
            <label class="field">
              <span>Reps máx.</span>
              <input name="defaultRepsMax" type="number" min="1" max="100" value="${exercise.defaultRepsMax || 12}" />
            </label>
            <label class="field">
              <span>Descanso (s)</span>
              <input name="defaultRestSeconds" type="number" min="0" max="600" value="${exercise.defaultRestSeconds || 60}" />
            </label>
          </div>
        </div>

        <label class="field">
          <span>Instruções de execução</span>
          <textarea name="description" rows="4" placeholder="Descreva a técnica e pontos de atenção...">${escapeHtml(exercise.description || "")}</textarea>
        </label>

        ${statusBadgeHtml}
        <input type="hidden" name="videoUrl" value="${escapeHtml(videoLink)}" />
      </form>
    `;

    const fileInput = body.querySelector('[name="videoFile"]');
    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const nameEl = body.querySelector(".ex-video-label");
        if (nameEl) nameEl.textContent = `${file.name} · ${formatFileSize(file.size)}`;
      });
    }

    _openSheet(sheet);
    document.body.style.overflow = "hidden";
  }

  function closeExerciseSheet() {
    const sheet = elements.exerciseSheet;
    if (!sheet || sheet.hidden) return;
    _closeSheet(sheet, () => { document.body.style.overflow = ""; });
  }

  function openWorkoutForm(workoutId = "", prefillStudentId = "") {
    const sheet = elements.workoutSheet;
    const body = elements.workoutSheetBody;
    const titleEl = elements.workoutSheetTitle;
    if (!sheet || !body) return;

    const workout = getWorkout(workoutId) || {};
    const isStudentWorkout = Boolean(workout.studentId || prefillStudentId);
    const selectedStudentId = isStudentWorkout ? workout.studentId || prefillStudentId || state.data.students[0]?.id || "" : "";
    const rows = Array.isArray(workout.exercises) && workout.exercises.length ? workout.exercises : [normalizeWorkoutExercise({ order: 1, exerciseId: state.data.exercises.find((e) => e.status === "active")?.id || "" })];

    if (titleEl) titleEl.textContent = workout.id ? (isStudentWorkout ? "Editar treino do aluno" : "Editar padrão de treino") : isStudentWorkout ? "Novo treino do aluno" : "Novo padrão de treino";

    const workoutSaveLabel = isStudentWorkout ? "Salvar treino" : "Salvar padrão";
    body.innerHTML = `
      <form class="form-grid" id="workoutForm" data-id="${workout.id || ""}" data-scope="${isStudentWorkout ? "student" : "pattern"}">
        <div class="form-grid two">
          ${
            isStudentWorkout
              ? `<label class="field"><span>Aluno</span><select name="studentId" required>${studentOptions(selectedStudentId)}</select></label>`
              : `<input type="hidden" name="studentId" value="" /><div class="empty-state compact-note"><strong>Modelo base</strong><span>Este padrão fica na área global de treino e não é vinculado a um aluno.</span></div>`
          }
          <label class="field"><span>Status</span><select name="status">${workoutStatusOptions(workout.status || "draft", !isStudentWorkout)}</select></label>
        </div>
        <label class="field"><span>Título</span><input name="title" type="text" value="${escapeHtml(workout.title || "")}" required /></label>
        <label class="field"><span>Descrição</span><textarea name="description">${escapeHtml(workout.description || "")}</textarea></label>
        <div class="form-grid two">
          <label class="field"><span>Foco/objetivo</span><input name="focus" type="text" value="${escapeHtml(workout.focus || "")}" /></label>
          <label class="field"><span>Nível</span><select name="level">${workoutLevelOptions(workout.level || "")}</select></label>
        </div>
        <section class="workout-builder">
          <div class="section-title"><h3>Exercícios do ${isStudentWorkout ? "treino" : "padrão"}</h3><button class="mini-button" type="button" data-add-workout-row>Adicionar exercício</button></div>
          <div id="workoutRows">${rows.map((row, index) => workoutRowTemplate(row, index)).join("")}</div>
        </section>
      </form>
    `;
    const wsFooter = elements.workoutSheetFooter;
    if (wsFooter) wsFooter.innerHTML = `<button class="primary-action" type="submit" form="workoutForm">${workoutSaveLabel}</button>`;

    _openSheet(sheet);
    document.body.style.overflow = "hidden";
  }

  function closeWorkoutSheet() {
    const sheet = elements.workoutSheet;
    if (!sheet || sheet.hidden) return;
    _closeSheet(sheet, () => { document.body.style.overflow = ""; });
  }

  function openApplyPatternSheet(workoutId) {
    const workout = getWorkout(workoutId);
    if (!workout || !isWorkoutPattern(workout)) return showToast("Padrão não encontrado.");
    const sheet = elements.apSheet;
    const body = elements.apSheetBody;
    const titleEl = elements.apSheetTitle;
    if (!sheet || !body) return;
    if (titleEl) titleEl.textContent = "Aplicar padrão";

    const today = new Date().toISOString().slice(0, 10);
    const students = state.data.students.filter((s) => s.status !== "inactive");

    body.innerHTML = `
      <form class="form-grid" id="applyPatternSheetForm" data-id="${escapeHtml(workout.id)}">
        <div class="empty-state compact-note">
          <strong>${escapeHtml(workout.title)}</strong>
          <span>Uma cópia individual será criada para cada aluno selecionado. O padrão original não será alterado.</span>
        </div>

        <div class="field">
          <span>Alunos</span>
          <div class="ap-student-chips" id="apSelectedChips"></div>
          <div class="ap-student-search-wrap">
            <input class="ap-student-search" id="apStudentSearch" type="search" placeholder="Buscar aluno…" autocomplete="off" />
          </div>
          <div class="ap-student-list" id="apStudentList">
            ${students.length
              ? students.map((s) => `
                <label class="ap-student-row">
                  <input type="checkbox" name="studentIds" value="${escapeHtml(s.id)}" data-ap-student-name="${escapeHtml(s.name)}" />
                  <span class="ap-student-avatar">${escapeHtml(s.name.slice(0, 2).toUpperCase())}</span>
                  <span class="ap-student-label">${escapeHtml(s.name)}</span>
                </label>`).join("")
              : `<p class="ap-empty">Nenhum aluno cadastrado.</p>`
            }
          </div>
        </div>

        <div class="form-grid two">
          <label class="field"><span>Data de início</span><input name="startDate" type="date" value="${today}" /></label>
          <label class="field"><span>Status do treino</span><select name="status"><option value="published">Publicado</option><option value="draft">Rascunho</option></select></label>
        </div>

        <div class="field">
          <span>Ao aplicar</span>
          <div class="ap-toggle-row">
            <label class="ap-toggle-opt">
              <input type="radio" name="applyMode" value="add" checked />
              <span>Adicionar ao treino atual</span>
            </label>
            <label class="ap-toggle-opt">
              <input type="radio" name="applyMode" value="replace" />
              <span>Substituir treino atual</span>
            </label>
          </div>
        </div>

        <button class="ghost-button" type="button" data-ap-adjust="${escapeHtml(workout.id)}">Ajustar antes de aplicar</button>
      </form>
    `;
    const apFooter = elements.apSheetFooter;
    if (apFooter) apFooter.innerHTML = `<button class="primary-action" type="submit" form="applyPatternSheetForm">Aplicar</button>`;

    _openSheet(sheet);
    document.body.style.overflow = "hidden";
    _bindApSheetSearch();
  }

  function _bindApSheetSearch() {
    const searchInput = document.getElementById("apStudentSearch");
    const list = document.getElementById("apStudentList");
    if (!searchInput || !list) return;

    function updateChips() {
      const checked = list.querySelectorAll('input[name="studentIds"]:checked');
      const chipsEl = document.getElementById("apSelectedChips");
      if (!chipsEl) return;
      if (!checked.length) { chipsEl.innerHTML = ""; return; }
      chipsEl.innerHTML = Array.from(checked).map((cb) =>
        `<span class="ap-chip">${escapeHtml(cb.dataset.apStudentName)}<button type="button" data-ap-remove="${escapeHtml(cb.value)}" aria-label="Remover">×</button></span>`
      ).join("");
    }

    list.addEventListener("change", updateChips);
    document.getElementById("apSelectedChips")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-ap-remove]");
      if (!btn) return;
      const cb = list.querySelector(`input[value="${CSS.escape(btn.dataset.apRemove)}"]`);
      if (cb) { cb.checked = false; updateChips(); }
    });

    searchInput.addEventListener("input", () => {
      const q = searchInput.value.trim().toLowerCase();
      list.querySelectorAll(".ap-student-row").forEach((row) => {
        const name = row.querySelector(".ap-student-label")?.textContent.toLowerCase() || "";
        row.hidden = q && !name.includes(q);
      });
    });
  }

  function closeApplyPatternSheet() {
    const sheet = elements.apSheet;
    if (!sheet || sheet.hidden) return;
    _closeSheet(sheet, () => { document.body.style.overflow = ""; });
  }

  function openApplyPatternForm(workoutId) {
    openApplyPatternSheet(workoutId);
  }

  function openStudentPatternWorkoutForm(studentId) {
    const student = getStudent(studentId);
    const patterns = getAvailableWorkoutPatterns();
    if (!student) return showToast("Aluno não encontrado.");
    if (!patterns.length) return showToast("Crie um padrão de treino antes de usar esta opção.");
    openModal(
      "Criar treino por padrão",
      `
        <form class="form-grid" id="studentPatternWorkoutForm" data-student-id="${student.id}">
          <div class="empty-state compact-note">
            <strong>${escapeHtml(student.name)}</strong>
            <span>Será criada uma cópia individual para este aluno. O padrão original não será alterado.</span>
          </div>
          <label class="field"><span>Padrão de treino</span><select name="patternId" required>${workoutPatternOptions(patterns[0]?.id || "")}</select></label>
          <div class="form-grid two">
            <label class="field"><span>Status do treino</span><select name="status"><option value="draft">Rascunho</option><option value="published">Publicado para o aluno</option></select></label>
            <label class="field"><span>Título opcional</span><input name="title" type="text" placeholder="Usar título do padrão" /></label>
          </div>
          <button class="primary-action" type="submit">Criar treino do aluno</button>
        </form>
      `
    );
  }

  function workoutRowTemplate(row, index) {
    return `
      <article class="workout-builder-row" data-workout-row>
        <div class="section-title">
          <strong>Exercício ${index + 1}</strong>
          <button class="mini-button is-danger" type="button" data-remove-workout-row>Remover</button>
        </div>
        <div class="form-grid two">
          <label class="field"><span>Exercício da biblioteca</span><select name="exerciseId" required>${exerciseOptions(row.exerciseId)}</select></label>
          <label class="field"><span>Ordem</span><input name="order" type="number" min="1" value="${escapeHtml(row.order || index + 1)}" required /></label>
          <label class="field"><span>Séries</span><input name="sets" type="number" min="1" value="${escapeHtml(row.sets || 3)}" required /></label>
          <label class="field"><span>Repetições alvo</span><input name="targetReps" type="text" value="${escapeHtml(row.targetReps || "10")}" required /></label>
          <label class="field"><span>Carga sugerida</span><input name="suggestedLoad" type="text" value="${escapeHtml(row.suggestedLoad || "")}" /></label>
          <label class="field"><span>Descanso em segundos</span><input name="restSeconds" type="number" min="0" value="${escapeHtml(row.restSeconds || 60)}" required /></label>
        </div>
        <label class="field"><span>Observação específica</span><textarea name="coachNotes">${escapeHtml(row.coachNotes || "")}</textarea></label>
      </article>
    `;
  }

  function openActivityForm(activityId = "", prefillStudentId = "") {
    openAgendarSheet(activityId, prefillStudentId);
  }

  function openAgendarSheet(activityId = "", prefillStudentId = "") {
    const activity = state.data.activities.find((item) => item.id === activityId) || {};
    const selectedStudentId = activity.studentId || prefillStudentId || state.data.students[0]?.id || "";
    const selectedType = activity.type || "workout";
    const selectedStatus = activity.status || (selectedType === "update" ? "pending" : "scheduled");

    const sheet = elements.agendarSheet;
    const body = elements.agSheetBody;
    const titleEl = elements.agSheetTitle;
    if (!sheet || !body) return;

    if (titleEl) titleEl.textContent = activity.id ? "Editar atividade" : "Agendar atividade";

    body.innerHTML = `
      <form class="form-grid" id="activityForm" data-id="${activity.id || ""}">
        <div class="form-grid two">
          <label class="field"><span>Aluno</span><select name="studentId" required data-activity-student>${studentOptions(selectedStudentId)}</select></label>
          <label class="field"><span>Tipo</span><select name="type" data-activity-type>
            <option value="workout" ${selectedType === "workout" ? "selected" : ""}>Treino</option>
            <option value="assessment" ${selectedType === "assessment" ? "selected" : ""}>Avaliação</option>
            <option value="reassessment" ${selectedType === "reassessment" ? "selected" : ""}>Reavaliação</option>
            <option value="update" ${selectedType === "update" ? "selected" : ""}>Atualização quinzenal</option>
            <option value="return" ${selectedType === "return" ? "selected" : ""}>Retorno</option>
            <option value="other" ${selectedType === "other" ? "selected" : ""}>Outro evento</option>
          </select></label>
          <label class="field"><span>Treino vinculado</span><select name="workoutId">${workoutOptions(selectedStudentId, activity.workoutId)}</select></label>
          <label class="field"><span>Status</span><select name="status"><option value="scheduled" ${selectedStatus === "scheduled" ? "selected" : ""}>Agendado</option><option value="pending" ${selectedStatus === "pending" ? "selected" : ""}>Pendente</option><option value="done" ${selectedStatus === "done" ? "selected" : ""}>Concluído</option><option value="sent" ${selectedStatus === "sent" ? "selected" : ""}>Atualização enviada</option><option value="missed" ${selectedStatus === "missed" ? "selected" : ""}>Não realizado</option><option value="canceled" ${selectedStatus === "canceled" ? "selected" : ""}>Cancelado</option></select></label>
          <label class="field"><span>Data</span><input name="date" type="date" value="${escapeHtml(activity.date || state.agendaDate)}" required /></label>
          <label class="field"><span>Horário</span><input name="time" type="time" value="${escapeHtml(activity.time || "08:00")}" required /></label>
          <label class="field"><span>Duração (min)</span><input name="duration" type="number" min="0" value="${escapeHtml(activity.duration || "60")}" /></label>
        </div>
        <label class="field"><span>Título</span><input name="title" type="text" value="${escapeHtml(activity.title || "Treino agendado")}" required /></label>
        <label class="field"><span>Observações</span><textarea name="notes">${escapeHtml(activity.notes || "")}</textarea></label>
      </form>
    `;
    const agFooter = elements.agSheetFooter;
    if (agFooter) agFooter.innerHTML = `<button class="primary-action" type="submit" form="activityForm">Salvar atividade</button>`;

    _openSheet(sheet);
    document.body.style.overflow = "hidden";
  }

  function closeAgendarSheet() {
    const sheet = elements.agendarSheet;
    if (!sheet || sheet.hidden) return;
    _closeSheet(sheet, () => { document.body.style.overflow = ""; });
  }

  function openEventDetailSheet(itemId, date = "", studentId = "") {
    const item = findAgendaItem(itemId, date, studentId);
    if (!item) return showToast("Item da agenda não encontrado.");
    const sheet = elements.detSheet;
    const body = elements.detSheetBody;
    const stripe = elements.detSheetStripe;
    if (!sheet || !body) return;

    const manager = state.currentUser?.role === "manager";
    const student = getStudent(item.studentId);
    const typeColor = activityTypeColor(item.type);
    const canEdit = canEditAgendaItem(item);
    const isCanceled = item.status === "canceled";
    const isDone = item.status === "done" || item.status === "sent";

    const titleEl = document.getElementById("detSheetTitle");
    if (titleEl) titleEl.textContent = item.title || activityLabel(item.type);
    if (stripe) stripe.style.background = typeColor;

    const initials = student
      ? student.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()
      : "?";

    const studentRow = `
      <div class="det-info-row">
        <span class="det-label">Aluno</span>
        <strong class="det-value">
          <span class="det-avatar" style="background:${typeColor}22;color:${typeColor}">${escapeHtml(initials)}</span>
          ${escapeHtml(student?.name || "Aluno removido")}
        </strong>
      </div>`;

    const actionsHtml = manager && canEdit ? `
      <div class="det-actions">
        <div class="det-actions-row">
          <button class="secondary-action det-action" type="button" data-det-edit="${escapeHtml(item.id)}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
            Editar
          </button>
          ${!isCanceled ? `<button class="secondary-action det-action${isDone ? "" : " det-action--success"}" type="button" data-det-toggle="${escapeHtml(item.id)}:${isDone ? "scheduled" : "done"}">
            ${isDone
              ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1 4v6h6M23 20v-6h-6M20.5 9A9 9 0 0 0 5 5.6L1 10m22 4-4 4.4A9 9 0 0 1 3.5 15"/></svg> Reabrir`
              : `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg> Concluir`}
          </button>` : ""}
        </div>
        ${student?.phone ? whatsappButton(item.id, item.studentId) : ""}
        ${item.studentId ? `<button class="ghost-button det-ghost" type="button" data-det-open-profile="${escapeHtml(item.studentId)}">Abrir perfil do aluno</button>` : ""}
        ${!isCanceled ? `<button class="danger-action det-danger" type="button" data-det-cancel="${escapeHtml(item.id)}">Cancelar evento</button>` : ""}
      </div>
    ` : "";

    body.innerHTML = `
      <div class="det-body">
        <div class="badge-row">
          ${statusBadge(agendaStatusLabel(item.status), agendaStatusTone(item.status))}
          ${statusBadge(activityLabel(item.type), "info")}
        </div>
        <div class="det-info">
          ${studentRow}
          <div class="det-info-row">
            <span class="det-label">Data</span>
            <strong class="det-value">${formatLongDate(item.date)}</strong>
          </div>
          <div class="det-info-row">
            <span class="det-label">Horário</span>
            <strong class="det-value">${escapeHtml(item.time || "--:--")}${item.duration ? ` · ${escapeHtml(item.duration)} min` : ""}</strong>
          </div>
        </div>
        ${item.notes ? `<p class="det-notes">${escapeHtml(item.notes)}</p>` : ""}
      </div>
    `;
    const detFooter = elements.detSheetFooter;
    if (detFooter) detFooter.innerHTML = actionsHtml;

    _openSheet(sheet);
    document.body.style.overflow = "hidden";
  }

  function closeEventDetailSheet() {
    const sheet = elements.detSheet;
    if (!sheet || sheet.hidden) return;
    _closeSheet(sheet, () => { document.body.style.overflow = ""; });
  }

  function dietObjectiveOptions(selected = "") {
    const options = ["Hipertrofia", "Emagrecimento", "Manutenção", "Performance", "Reeducação alimentar", "Condicionamento", "Outro"];
    return options.map((option) => `<option value="${escapeHtml(option)}" ${option === selected ? "selected" : ""}>${escapeHtml(option)}</option>`).join("");
  }

  function dietStatusOptions(selected = "active") {
    return [
      ["active", "Ativo"],
      ["review_pending", "Revisão pendente"],
      ["draft", "Rascunho"],
      ["expired", "Vencido"],
      ["archived", "Arquivado"]
    ]
      .map(([value, label]) => `<option value="${escapeHtml(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(label)}</option>`)
      .join("");
  }

  function dietMealsToText(meals = []) {
    return meals.map((meal) => [meal.name, meal.time, meal.items, meal.notes].filter((part) => String(part || "").trim()).join(" | ")).join("\n");
  }

  function parseDietMealsText(value = "") {
    return String(value || "")
      .split(/\n+/)
      .map((line, index) => {
        const [name, time, items, notes] = line.split("|").map((part) => String(part || "").trim());
        if (!name && !items) return null;
        return normalizeDietMeal({ name: name || `Refeição ${index + 1}`, time, items, notes }, index);
      })
      .filter(Boolean);
  }

  function openDietPlanForm(planId = "", prefillStudentId = "") {
    const plan = getDietPlan(planId) || {};
    const selectedStudentId = plan.studentId || prefillStudentId || state.activeStudentProfileId || state.data.students[0]?.id || "";
    const title = plan.id ? "Editar plano alimentar" : "Novo plano alimentar";
    openModal(
      title,
      `
        <form class="form-grid" id="dietForm" data-id="${escapeHtml(plan.id || "")}">
          <div class="form-grid two">
            <label class="field"><span>Aluno</span><select name="studentId" required>${studentOptions(selectedStudentId)}</select></label>
            <label class="field"><span>Status</span><select name="status">${dietStatusOptions(plan.status || "active")}</select></label>
          </div>
          <label class="field"><span>Título do plano</span><input name="title" type="text" value="${escapeHtml(plan.title || "")}" placeholder="Plano alimentar Elite AS" required /></label>
          <div class="form-grid two">
            <label class="field"><span>Objetivo</span><select name="objective">${dietObjectiveOptions(plan.objective || getStudent(selectedStudentId)?.goal || "")}</select></label>
            <label class="field"><span>Protocolo atual</span><input name="protocol" type="text" value="${escapeHtml(plan.protocol || "")}" placeholder="Hipertrofia 3.200 kcal" /></label>
            <label class="field"><span>Calorias aproximadas</span><input name="calories" type="text" value="${escapeHtml(plan.calories || "")}" placeholder="3200 kcal" /></label>
            <label class="field"><span>Refeições por dia</span><input name="mealCount" type="number" min="0" value="${escapeHtml(plan.mealCount || plan.meals?.length || 5)}" /></label>
            <label class="field"><span>Data de início</span><input name="startDate" type="date" value="${escapeHtml(plan.startDate || todayISO())}" /></label>
            <label class="field"><span>Próxima revisão</span><input name="nextReviewDate" type="date" value="${escapeHtml(plan.nextReviewDate || addDays(todayISO(), 15))}" /></label>
          </div>
          <label class="field"><span>Refeições</span><textarea name="mealsText" placeholder="Café da manhã | 07:00 | ovos, fruta | observação">${escapeHtml(dietMealsToText(plan.meals || []))}</textarea></label>
          <p class="small-text">Use uma refeição por linha. Exemplo: Café da manhã | 07:00 | ovos, pão, fruta | manter hidratação.</p>
          <label class="field"><span>Observações gerais</span><textarea name="notes">${escapeHtml(plan.notes || "")}</textarea></label>
          <label class="field"><span>Instruções ao aluno</span><textarea name="instructions">${escapeHtml(plan.instructions || "")}</textarea></label>
          <div class="form-actions two">
            <button class="primary-action" type="submit">${plan.id ? "Salvar plano" : "Criar plano alimentar"}</button>
            ${plan.id ? `<button class="secondary-action" type="button" data-send-diet-link="${escapeHtml(plan.id)}">Enviar link</button>` : ""}
          </div>
        </form>
      `
    );
  }

  function openDietPlanDetail(planId) {
    const plan = getDietPlan(planId);
    if (!plan) return showToast("Plano alimentar não encontrado.");
    const student = getStudent(plan.studentId);
    const meta = dietStatusMeta(plan);
    openModal(
      "Plano alimentar",
      `
        <div class="diet-detail">
          <section class="diet-detail-hero">
            ${studentAvatar(student)}
            <div>
              <span class="eyebrow">Dieta</span>
              <h3>${escapeHtml(plan.title || plan.protocol || "Plano alimentar")}</h3>
              <p>${escapeHtml(getStudentName(plan.studentId))} · ${escapeHtml(plan.objective || student?.goal || "Objetivo não informado")}</p>
            </div>
            <span class="badge ${meta.tone ? `is-${meta.tone}` : ""}">${escapeHtml(meta.label)}</span>
          </section>
          <section class="contract-detail-grid diet-detail-grid">
            <article><span>Protocolo</span><strong>${escapeHtml(plan.protocol || "-")}</strong></article>
            <article><span>Calorias</span><strong>${escapeHtml(plan.calories || "-")}</strong></article>
            <article><span>Refeições</span><strong>${escapeHtml(String(plan.mealCount || plan.meals.length || "-"))}</strong></article>
            <article><span>Próxima revisão</span><strong>${plan.nextReviewDate ? formatShortDate(plan.nextReviewDate) : "A definir"}</strong></article>
            <article><span>Última atualização</span><strong>${formatShortDate(String(plan.lastUpdatedAt || plan.updatedAt).slice(0, 10))}</strong></article>
            <article><span>Link enviado</span><strong>${plan.linkSentAt ? formatShortDate(plan.linkSentAt.slice(0, 10)) : "Ainda não enviado"}</strong></article>
          </section>
          <section class="diet-meal-list">
            <div class="section-title"><h3>Refeições</h3><span class="small-text">${plan.meals.length || 0} item(ns)</span></div>
            ${
              plan.meals.length
                ? plan.meals.map((meal) => `<article><strong>${escapeHtml(meal.name)}</strong><span>${escapeHtml(meal.time || "Horário livre")}</span><p>${escapeHtml(meal.items || "Itens não informados")}</p>${meal.notes ? `<small>${escapeHtml(meal.notes)}</small>` : ""}</article>`).join("")
                : emptyState("Refeições não detalhadas", "Use Editar plano para adicionar refeições e orientações.", icons.diet)
            }
          </section>
          <section class="update-notes-grid">
            ${updateDetailNote("Observações", plan.notes)}
            ${updateDetailNote("Instruções", plan.instructions)}
          </section>
          <div class="form-actions three">
            <button class="primary-action" type="button" data-open-diet-form="${escapeHtml(plan.id)}">Editar plano</button>
            <button class="secondary-action" type="button" data-send-diet-link="${escapeHtml(plan.id)}">Enviar link</button>
            ${student ? `<button class="secondary-action" type="button" data-open-student-profile="${escapeHtml(student.id)}">Abrir perfil</button>` : ""}
          </div>
        </div>
      `
    );
  }

  // ─── MEAL PLAN BUILDER ───────────────────────────────────────────

  function _mpDefaultMeal(index = 0) {
    return normalizeDietMeal({ name: `Refeição ${index + 1}`, time: "", foodItems: [] }, index);
  }

  function _mpTotals() {
    if (!_mpDraft) return { kcal: 0, protein: 0, carbs: 0, fat: 0 };
    let kcal = 0, protein = 0, carbs = 0, fat = 0;
    for (const meal of _mpDraft.meals) {
      for (const fi of meal.foodItems) {
        kcal += Number(fi.kcal) || 0;
        protein += Number(fi.protein) || 0;
        carbs += Number(fi.carbs) || 0;
        fat += Number(fi.fat) || 0;
      }
    }
    return { kcal: Math.round(kcal), protein: Math.round(protein), carbs: Math.round(carbs), fat: Math.round(fat) };
  }

  function _mpTotalsCardHtml(goalKcal = 0) {
    const t = _mpTotals();
    const pct = goalKcal > 0 ? Math.min(100, Math.round((t.kcal / goalKcal) * 100)) : 0;
    const color = t.kcal > goalKcal && goalKcal > 0 ? "var(--erro)" : "var(--ok)";
    return `
      <div class="mp-totals-card" id="mpTotalsCard">
        <div class="mp-totals-head">
          <strong>Total do dia</strong>
          ${goalKcal > 0 ? `<span class="small-text" style="color:var(--muted)">${pct}%</span>` : ""}
        </div>
        <div class="mp-kcal-row">
          <span class="mp-kcal-actual" style="color:${color}">${t.kcal}</span>
          <span class="mp-kcal-sep">kcal</span>
          ${goalKcal > 0 ? `<span class="mp-kcal-meta">/ ${goalKcal} meta</span>` : ""}
        </div>
        ${goalKcal > 0 ? `<div class="mp-progress-bar"><div class="mp-progress-fill" style="width:${pct}%;background:${color}"></div></div>` : ""}
        <div class="mp-macros-row">
          <div class="mp-macro"><span>P</span><strong>${t.protein}g</strong></div>
          <div class="mp-macro"><span>C</span><strong>${t.carbs}g</strong></div>
          <div class="mp-macro"><span>G</span><strong>${t.fat}g</strong></div>
        </div>
      </div>
    `;
  }

  function _mpUpdateTotals() {
    const wrap = document.getElementById("mpTotalsWrap");
    if (!wrap || !_mpDraft) return;
    const goalInput = document.querySelector("#mealPlanBuilderForm [name='calories']");
    const goal = Number(goalInput?.value) || 0;
    wrap.innerHTML = _mpTotalsCardHtml(goal);
  }

  function _mpFoodItemHtml(fi, mealId) {
    return `
      <div class="mp-food-item" data-mp-food-id="${escapeHtml(fi.id)}">
        <span class="mp-food-name" title="${escapeHtml(fi.name)}">${escapeHtml(fi.name)}</span>
        <input class="mp-food-qty-input" type="text" value="${escapeHtml(fi.qty)}" placeholder="qtd" data-mp-sync="qty" aria-label="Quantidade" />
        <input class="mp-food-kcal-input" type="number" min="0" value="${fi.kcal || ""}" placeholder="kcal" data-mp-sync="kcal" aria-label="Kcal" />
        <button class="mp-food-remove-btn" type="button" data-mp-remove-food="${escapeHtml(fi.id)}" data-mp-meal-ref="${escapeHtml(mealId)}" aria-label="Remover">×</button>
      </div>
    `;
  }

  function _mpMealCardHtml(meal, index) {
    const mealKcal = meal.foodItems.reduce((s, fi) => s + (Number(fi.kcal) || 0), 0);
    return `
      <div class="mp-meal-card" data-mp-meal-id="${escapeHtml(meal.id)}">
        <div class="mp-meal-head">
          <input class="mp-meal-name-input" type="text" value="${escapeHtml(meal.name)}" placeholder="Nome da refeição" data-mp-sync="name" aria-label="Nome da refeição" />
          <input class="mp-meal-time-input" type="time" value="${escapeHtml(meal.time)}" data-mp-sync="time" aria-label="Horário" />
          <details class="action-menu">
            <summary class="mp-meal-menu-btn" aria-label="Opções">${icons.more}</summary>
            <div>
              <button class="mini-button" type="button" data-mp-duplicate-meal="${escapeHtml(meal.id)}">Duplicar</button>
              <button class="mini-button is-danger" type="button" data-mp-remove-meal="${escapeHtml(meal.id)}">Remover</button>
            </div>
          </details>
        </div>
        <div class="mp-food-list" id="mpFoodList_${escapeHtml(meal.id)}">
          ${meal.foodItems.length ? meal.foodItems.map((fi) => _mpFoodItemHtml(fi, meal.id)).join("") : ""}
        </div>
        <div class="mp-meal-foot">
          <span class="mp-meal-kcal-sum">${mealKcal > 0 ? `${mealKcal} kcal` : "Sem alimentos"}</span>
          <button class="mp-add-food-btn" type="button" data-mp-add-food="${escapeHtml(meal.id)}">+ Adicionar alimento</button>
        </div>
      </div>
    `;
  }

  function _mpRenderMeals() {
    const container = document.getElementById("mpMealsContainer");
    if (!container || !_mpDraft) return;
    container.innerHTML = _mpDraft.meals.map(_mpMealCardHtml).join("");
  }

  function _mpSyncFromDom() {
    if (!_mpDraft) return;
    document.querySelectorAll("[data-mp-meal-id]").forEach((mealEl) => {
      const meal = _mpDraft.meals.find((m) => m.id === mealEl.dataset.mpMealId);
      if (!meal) return;
      const nameInput = mealEl.querySelector("[data-mp-sync='name']");
      const timeInput = mealEl.querySelector("[data-mp-sync='time']");
      if (nameInput) meal.name = nameInput.value;
      if (timeInput) meal.time = timeInput.value;
      mealEl.querySelectorAll("[data-mp-food-id]").forEach((fiEl) => {
        const fi = meal.foodItems.find((f) => f.id === fiEl.dataset.mpFoodId);
        if (!fi) return;
        const qtyInput = fiEl.querySelector("[data-mp-sync='qty']");
        const kcalInput = fiEl.querySelector("[data-mp-sync='kcal']");
        if (qtyInput) fi.qty = qtyInput.value;
        if (kcalInput) fi.kcal = Number(kcalInput.value) || 0;
      });
    });
  }

  function openMealPlanBuilder(planId = "", prefillStudentId = "") {
    const sheet = elements.mealPlanSheet;
    const body = elements.mealPlanSheetBody;
    const titleEl = elements.mealPlanSheetTitle;
    const footer = elements.mpSheetFooter;
    if (!sheet || !body) return;

    const plan = getDietPlan(planId) || {};
    const selectedStudentId = plan.studentId || prefillStudentId || state.activeStudentProfileId || state.data.students[0]?.id || "";
    if (titleEl) titleEl.textContent = plan.id ? "Editar plano alimentar" : "Novo plano alimentar";

    _mpDraft = {
      planId: plan.id || "",
      meals: (plan.meals || []).map((m) => ({ ...m, foodItems: Array.isArray(m.foodItems) ? m.foodItems.map((fi) => ({ ...fi })) : [] }))
    };
    if (!_mpDraft.meals.length) _mpDraft.meals = [_mpDefaultMeal(0)];

    const goalKcal = Number(plan.calories) || 0;

    body.innerHTML = `
      <form class="mp-plan-header" id="mealPlanBuilderForm" data-id="${escapeHtml(plan.id || "")}">
        <div class="form-grid two">
          <label class="field"><span>Aluno</span><select name="studentId" required>${studentOptions(selectedStudentId)}</select></label>
          <label class="field"><span>Status</span><select name="status">${dietStatusOptions(plan.status || "active")}</select></label>
        </div>
        <label class="field"><span>Título do plano</span><input name="title" type="text" value="${escapeHtml(plan.title || "")}" placeholder="Plano alimentar Elite AS" required /></label>
        <div class="form-grid two">
          <label class="field"><span>Objetivo</span><select name="objective">${dietObjectiveOptions(plan.objective || getStudent(selectedStudentId)?.goal || "")}</select></label>
          <label class="field"><span>Meta kcal/dia</span><input name="calories" type="number" min="0" value="${escapeHtml(plan.calories || "")}" placeholder="2500" /></label>
          <label class="field"><span>Início</span><input name="startDate" type="date" value="${escapeHtml(plan.startDate || todayISO())}" /></label>
          <label class="field"><span>Próxima revisão</span><input name="nextReviewDate" type="date" value="${escapeHtml(plan.nextReviewDate || addDays(todayISO(), 15))}" /></label>
        </div>
      </form>
      <div id="mpTotalsWrap">${_mpTotalsCardHtml(goalKcal)}</div>
      <div class="mp-meals-section">
        <div class="mp-meals-section-head"><strong>Refeições</strong></div>
        <div id="mpMealsContainer"></div>
        <button class="mp-add-meal-btn" type="button" data-mp-add-meal>+ Adicionar refeição</button>
      </div>
    `;

    _mpRenderMeals();

    if (footer) {
      footer.innerHTML = `
        <button class="secondary-action" type="button" data-close-meal-plan-sheet>Cancelar</button>
        <div class="ex-footer-right">
          ${plan.id ? `<button class="secondary-action" type="button" data-send-diet-link="${escapeHtml(plan.id)}">Enviar link</button>` : ""}
          <button class="primary-action" type="submit" form="mealPlanBuilderForm">Salvar</button>
        </div>
      `;
    }

    _openSheet(sheet);
    document.body.style.overflow = "hidden";
  }

  function openDietPlanView(planId) {
    const plan = getDietPlan(planId);
    if (!plan) return showToast("Plano alimentar não encontrado.");
    const sheet = elements.mealPlanSheet;
    const body = elements.mealPlanSheetBody;
    const titleEl = elements.mealPlanSheetTitle;
    const footer = elements.mpSheetFooter;
    if (!sheet || !body) return;

    _mpDraft = null;
    const student = getStudent(plan.studentId);
    const meta = dietStatusMeta(plan);
    if (titleEl) titleEl.textContent = "Plano alimentar";

    const t = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
    for (const meal of plan.meals) {
      for (const fi of (meal.foodItems || [])) {
        t.kcal += Number(fi.kcal) || 0;
        t.protein += Number(fi.protein) || 0;
        t.carbs += Number(fi.carbs) || 0;
        t.fat += Number(fi.fat) || 0;
      }
    }
    t.kcal = Math.round(t.kcal); t.protein = Math.round(t.protein);
    t.carbs = Math.round(t.carbs); t.fat = Math.round(t.fat);
    const goalKcal = Number(plan.calories) || 0;
    const pct = goalKcal > 0 ? Math.min(100, Math.round((t.kcal / goalKcal) * 100)) : 0;

    const mealsHtml = plan.meals.length
      ? plan.meals.map((meal) => {
          const mKcal = (meal.foodItems || []).reduce((s, fi) => s + (Number(fi.kcal) || 0), 0);
          const itemsHtml = (meal.foodItems || []).length
            ? meal.foodItems.map((fi) => `
                <div class="mp-view-meal-item">
                  <span>${escapeHtml(fi.name)}</span>
                  <div class="mp-view-meal-item-right">
                    ${fi.qty ? `<span>${escapeHtml(fi.qty)}</span>` : ""}
                    ${fi.kcal ? `<span class="mp-view-meal-kcal">${fi.kcal} kcal</span>` : ""}
                  </div>
                </div>`).join("")
            : meal.items
              ? `<div class="mp-view-meal-item"><span>${escapeHtml(meal.items)}</span></div>`
              : `<div class="mp-view-meal-item" style="color:var(--muted)"><span>Sem alimentos</span></div>`;
          return `
            <div class="mp-view-meal-card">
              <div class="mp-view-meal-head">
                <strong>${escapeHtml(meal.name)}</strong>
                <span>${escapeHtml(meal.time || "Livre")}</span>
              </div>
              <div class="mp-view-meal-items">${itemsHtml}</div>
              ${mKcal > 0 ? `<div class="mp-view-notes">${mKcal} kcal nesta refeição</div>` : ""}
              ${meal.notes ? `<div class="mp-view-notes">${escapeHtml(meal.notes)}</div>` : ""}
            </div>
          `;
        }).join("")
      : emptyState("Refeições não cadastradas", "Use Editar para adicionar refeições ao plano.", icons.diet);

    body.innerHTML = `
      <div class="mp-view-body">
        <div class="mp-view-hero">
          ${studentAvatar(student)}
          <div class="mp-view-hero-info">
            <h3>${escapeHtml(plan.title || plan.protocol || "Plano alimentar")}</h3>
            <p>${escapeHtml(getStudentName(plan.studentId))} · ${escapeHtml(plan.objective || student?.goal || "Objetivo não informado")}</p>
          </div>
          <span class="badge ${meta.tone ? `is-${meta.tone}` : ""}">${escapeHtml(meta.label)}</span>
        </div>
        <div class="mp-view-grid">
          <article><span>Protocolo</span><strong>${escapeHtml(plan.protocol || "-")}</strong></article>
          <article><span>Meta kcal</span><strong>${escapeHtml(plan.calories || "-")}</strong></article>
          <article><span>Refeições</span><strong>${escapeHtml(String(plan.mealCount || plan.meals.length || "-"))}</strong></article>
          <article><span>Próxima revisão</span><strong>${plan.nextReviewDate ? formatShortDate(plan.nextReviewDate) : "A definir"}</strong></article>
        </div>
        ${t.kcal > 0 ? `
        <div class="mp-totals-card">
          <div class="mp-totals-head"><strong>Total calculado</strong>${goalKcal > 0 ? `<span class="small-text" style="color:var(--muted)">${pct}%</span>` : ""}</div>
          <div class="mp-kcal-row">
            <span class="mp-kcal-actual">${t.kcal}</span>
            <span class="mp-kcal-sep">kcal</span>
            ${goalKcal > 0 ? `<span class="mp-kcal-meta">/ ${goalKcal} meta</span>` : ""}
          </div>
          ${goalKcal > 0 ? `<div class="mp-progress-bar"><div class="mp-progress-fill" style="width:${pct}%"></div></div>` : ""}
          <div class="mp-macros-row">
            <div class="mp-macro"><span>P</span><strong>${t.protein}g</strong></div>
            <div class="mp-macro"><span>C</span><strong>${t.carbs}g</strong></div>
            <div class="mp-macro"><span>G</span><strong>${t.fat}g</strong></div>
          </div>
        </div>` : ""}
        <div class="mp-view-meals">
          <div class="mp-view-meals-head">Refeições</div>
          ${mealsHtml}
        </div>
      </div>
    `;

    if (footer) {
      footer.innerHTML = `
        <button class="secondary-action" type="button" data-close-meal-plan-sheet>Fechar</button>
        <div class="ex-footer-right">
          <button class="secondary-action" type="button" data-diet-pdf="${escapeHtml(plan.id)}">Gerar PDF</button>
          <button class="secondary-action" type="button" data-send-diet-link="${escapeHtml(plan.id)}">Enviar link</button>
          <button class="primary-action" type="button" data-open-diet-form="${escapeHtml(plan.id)}">Editar</button>
        </div>
      `;
    }

    _openSheet(sheet);
    document.body.style.overflow = "hidden";
  }

  function closeMealPlanSheet() {
    const sheet = elements.mealPlanSheet;
    if (!sheet || sheet.hidden) return;
    _closeSheet(sheet, () => { document.body.style.overflow = ""; _mpDraft = null; });
  }

  function openMpFoodSearch(mealId) {
    openModal(
      "Adicionar alimento",
      `
        <div class="mp-food-search-wrap">
          <input class="mp-food-search-input" id="mpFoodSearchInput" type="search" placeholder="Buscar alimento..." autocomplete="off" autofocus />
          <div class="mp-food-search-list" id="mpFoodSearchList">
            ${FOOD_DB.map((f, i) => `
              <div class="mp-food-row" data-mp-pick-food="${i}" role="button" tabindex="0">
                <strong>${escapeHtml(f.name)}</strong>
                <span>${f.kcal} kcal · ${escapeHtml(f.qty)}</span>
              </div>`).join("")}
          </div>
        </div>
      `
    );
    const input = document.getElementById("mpFoodSearchInput");
    const list = document.getElementById("mpFoodSearchList");
    if (input && list) {
      input.addEventListener("input", () => {
        const q = input.value.trim().toLowerCase();
        list.querySelectorAll("[data-mp-pick-food]").forEach((row) => {
          row.hidden = q ? !row.querySelector("strong").textContent.toLowerCase().includes(q) : false;
        });
      });
      list.addEventListener("click", (e) => {
        const row = e.target.closest("[data-mp-pick-food]");
        if (!row) return;
        const f = FOOD_DB[Number(row.dataset.mpPickFood)];
        if (!f || !_mpDraft) return;
        const meal = _mpDraft.meals.find((m) => m.id === mealId);
        if (!meal) return;
        meal.foodItems.push(normalizeFoodItem({ ...f }, meal.foodItems.length));
        closeModal();
        const foodListEl = document.getElementById(`mpFoodList_${mealId}`);
        if (foodListEl) foodListEl.innerHTML = meal.foodItems.map((fi) => _mpFoodItemHtml(fi, mealId)).join("");
        const mealFootEl = document.querySelector(`[data-mp-meal-id="${CSS.escape(mealId)}"] .mp-meal-kcal-sum`);
        if (mealFootEl) {
          const mKcal = meal.foodItems.reduce((s, fi) => s + (Number(fi.kcal) || 0), 0);
          mealFootEl.textContent = mKcal > 0 ? `${mKcal} kcal` : "Sem alimentos";
        }
        _mpUpdateTotals();
      });
    }
  }

  function handleMealPlanBuilderForm(form) {
    if (!_mpDraft) return;
    _mpSyncFromDom();
    const data = new FormData(form);
    const id = form.dataset.id || createId("diet");
    const old = getDietPlan(id);
    const studentId = String(data.get("studentId") || "");
    if (!getStudent(studentId)) return showToast("Selecione um aluno válido.");
    const status = String(data.get("status") || "active");
    const meals = _mpDraft.meals.map((m) => ({
      ...m,
      items: m.foodItems.length ? m.foodItems.map((fi) => fi.name + (fi.qty ? ` (${fi.qty})` : "")).join(", ") : m.items
    }));
    const plan = normalizeDietPlan({
      id,
      trainerId: TRAINER_ID,
      studentId,
      title: String(data.get("title") || "").trim(),
      objective: String(data.get("objective") || "").trim(),
      protocol: old?.protocol || "",
      calories: String(data.get("calories") || "").trim(),
      mealCount: String(meals.length),
      startDate: String(data.get("startDate") || todayISO()),
      nextReviewDate: String(data.get("nextReviewDate") || ""),
      status,
      notes: old?.notes || "",
      instructions: old?.instructions || "",
      meals,
      linkSentAt: old?.linkSentAt || "",
      archivedAt: status === "archived" ? old?.archivedAt || new Date().toISOString() : "",
      createdAt: old?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString()
    });
    const index = state.data.diets.findIndex((item) => item.id === id);
    if (index >= 0) state.data.diets[index] = plan;
    else state.data.diets.unshift(plan);
    ensureDietReviewActivity(plan);
    persistData();
    closeMealPlanSheet();
    if (state.managerMenu === "studentProfile" || state.activeStudentProfileId === studentId) {
      state.profileTab = "diet";
      openStudentProfile(studentId, { updateHash: false });
    } else {
      state.managerMenu = "diet";
      renderManager();
    }
    if (status === "draft") showToast("Plano alimentar salvo como rascunho.");
    else showSuccessToast("Plano alimentar salvo.");
  }

  // ─── END MEAL PLAN BUILDER ────────────────────────────────────────

  function openUpdateForm(updateId) {
    const update = state.data.updates.find((item) => item.id === updateId);
    if (!update || update.studentId !== state.currentUser?.studentId) return;
    openModal(
      "Enviar atualização",
      `
        <form class="form-grid" id="updateForm" data-id="${update.id}">
          <div class="form-grid two">
            <label class="field"><span>Peso atual</span><input name="weight" type="number" step="0.1" min="0" required /></label>
            <label class="field"><span>Fotos de evolução</span><input name="photos" type="file" accept="image/*" multiple /></label>
            <label class="field"><span>Energia 1-5</span><input name="energy" type="number" min="1" max="5" value="4" required /></label>
            <label class="field"><span>Dor/desconforto 1-5</span><input name="pain" type="number" min="1" max="5" value="1" required /></label>
          </div>
          <label class="field"><span>Observações sobre treino</span><textarea name="trainingNotes"></textarea></label>
          <label class="field"><span>Observações sobre dieta</span><textarea name="dietNotes"></textarea></label>
          <label class="field"><span>Observações gerais</span><textarea name="generalNotes"></textarea></label>
          <button class="primary-action" type="submit">Enviar atualização</button>
        </form>
      `
    );
  }

  function openUpdateComment(updateId) {
    const update = state.data.updates.find((item) => item.id === updateId);
    if (!update) return;
    state.currentUpdateId = updateId;
    state.managerMenu = "evaluateUpdate";
    renderApp();
  }

  function updateDetailNote(label, value) {
    return `
      <article class="update-detail-note">
        <span>${escapeHtml(label)}</span>
        <strong>${value ? escapeHtml(value) : "Sem registro"}</strong>
      </article>
    `;
  }

  function openContractForm(studentId, contractId = "") {
    openContractFormSheet(studentId, contractId);
  }

  function openContractFormSheet(studentId = "", contractId = "", prefill = {}) {
    const sheet = elements.contractFormSheet;
    const bodyEl = elements.contractFormSheetBody;
    const footerEl = elements.contractFormSheetFooter;
    const titleEl = elements.contractFormTitle;
    if (!sheet || !bodyEl) return;

    const student = studentId ? getStudent(studentId) : null;
    if (!studentId && !student) return openContractStudentPickerModal();
    const contract = contractId ? state.data.contracts.find((c) => c.id === contractId && c.studentId === studentId) : null;
    const defaults = contract || normalizeContract({ studentId: student.id, ...getContractDefaults(student), ...prefill });
    const existingPdfUrl = contract?.pdfUrl || prefill.pdfUrl || "";

    if (titleEl) titleEl.textContent = contract ? "Editar contrato" : "Novo contrato";

    bodyEl.innerHTML = `
      <form class="ns-form" id="contractSheetForm"
            data-student-id="${escapeHtml(student.id)}"
            data-contract-id="${escapeHtml(contract?.id || "")}">

        <section class="ns-section">
          <h4 class="ns-section-title">Aluno</h4>
          <div class="cfs-student-field">
            <input class="cfs-student-search" id="cfsStudentSearch" type="search"
                   placeholder="Buscar aluno..." autocomplete="off"
                   value="${escapeHtml(student.name)}" />
            <div class="cfs-student-results" id="cfsStudentResults" hidden></div>
          </div>
          <div class="cfs-selected-preview" id="cfsSelectedPreview">
            ${studentAvatar(student)}
            <div class="cfs-preview-info">
              <strong>${escapeHtml(student.name)}</strong>
              <span>${escapeHtml(student.goal || "Aluno Elite AS")}</span>
            </div>
          </div>
          <input type="hidden" name="studentId" id="cfsStudentId" value="${escapeHtml(student.id)}" />
        </section>

        <section class="ns-section">
          <h4 class="ns-section-title">Plano</h4>
          <div class="ns-chip-group" role="group" aria-label="Plano">
            ${["Elite", "Performance", "Custom"].map((plan) => `
              <label class="radio-chip">
                <input type="radio" name="plan" value="${escapeHtml(plan)}" ${defaults.plan === plan ? "checked" : ""} />
                <span>${escapeHtml(plan)}</span>
              </label>
            `).join("")}
          </div>
        </section>

        <section class="ns-section">
          <div class="ns-row">
            <label class="field">
              <span>Valor / mês</span>
              <input name="value" type="text" inputmode="decimal"
                     value="${escapeHtml(defaults.value || "")}" placeholder="R$ 0,00" />
            </label>
            <label class="field">
              <span>Início</span>
              <input name="startDate" type="date" value="${escapeHtml(defaults.startDate || todayISO())}" />
            </label>
            <label class="field">
              <span>Fim</span>
              <input name="endDate" type="date" value="${escapeHtml(defaults.endDate || "")}" />
            </label>
          </div>
        </section>

        <section class="ns-section">
          <h4 class="ns-section-title">Documento PDF</h4>
          <input type="hidden" name="pdfUrl" id="cfsPdfUrl" value="${escapeHtml(existingPdfUrl)}" />
          <label class="contract-pdf-dropzone" id="cfsPdfDropzone" for="cfsPdfInput" ${existingPdfUrl ? "hidden" : ""}>
            <input type="file" id="cfsPdfInput" accept="application/pdf" />
            <svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" aria-hidden="true">
              <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"/>
              <polyline points="16 10 12 6 8 10"/>
              <line x1="12" y1="6" x2="12" y2="16"/>
            </svg>
            <strong>Escolher arquivo PDF</strong>
            <span>Clique ou arraste o contrato (.pdf, máx. 20 MB)</span>
          </label>
          <div class="contract-pdf-attached" id="cfsPdfAttached" ${existingPdfUrl ? "" : "hidden"}>
            <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" aria-hidden="true">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="9" y1="13" x2="15" y2="13"/>
              <line x1="9" y1="17" x2="12" y2="17"/>
            </svg>
            <div class="contract-pdf-file-meta">
              <strong id="cfsPdfFileName">${existingPdfUrl ? escapeHtml(existingPdfUrl.split("/").pop()) : ""}</strong>
              <span>PDF pronto para envio</span>
            </div>
            <button type="button" class="contract-pdf-remove-btn" id="cfsPdfRemoveBtn">Remover</button>
          </div>
        </section>

        <section class="ns-section">
          <h4 class="ns-section-title">Método de assinatura</h4>
          <div class="ns-chip-group" role="group" aria-label="Método de assinatura">
            <label class="radio-chip">
              <input type="radio" name="signatureMethod" value="digital"
                     ${(contract?.signatureMethod || "digital") === "digital" ? "checked" : ""} />
              <span>Digital (link)</span>
            </label>
            <label class="radio-chip">
              <input type="radio" name="signatureMethod" value="manual"
                     ${contract?.signatureMethod === "manual" ? "checked" : ""} />
              <span>Manual (presencial)</span>
            </label>
          </div>
        </section>

        <div class="ns-footer-spacer"></div>
      </form>
    `;

    footerEl.innerHTML = `
      <button class="secondary-action ex-cancel-btn" type="button" data-close-contract-form-sheet>Cancelar</button>
      <div class="ex-footer-right">
        <button class="secondary-action" type="submit" form="contractSheetForm" name="action" value="draft" formnovalidate>Salvar rascunho</button>
        <button class="primary-action" type="submit" form="contractSheetForm" name="action" value="send">Enviar para assinatura</button>
      </div>
    `;

    _openSheet(sheet);
    document.body.style.overflow = "hidden";
    _bindContractFormSearch();
    _bindContractPdfUpload();
  }

  function closeContractFormSheet() {
    if (!elements.contractFormSheet || elements.contractFormSheet.hidden) return;
    _closeSheet(elements.contractFormSheet, () => { document.body.style.overflow = ""; });
  }

  function _bindContractFormSearch() {
    const searchInput = document.getElementById("cfsStudentSearch");
    const resultsList = document.getElementById("cfsStudentResults");
    const hiddenInput = document.getElementById("cfsStudentId");
    const previewEl = document.getElementById("cfsSelectedPreview");
    if (!searchInput || !resultsList || !hiddenInput) return;

    function renderResults(query) {
      const q = query.trim().toLowerCase();
      if (!q) { resultsList.hidden = true; return; }
      const matches = state.data.students
        .filter((s) => s.status !== "inactive" && (s.name.toLowerCase().includes(q) || (s.email || "").toLowerCase().includes(q)))
        .slice(0, 8);
      resultsList.hidden = false;
      resultsList.innerHTML = matches.length
        ? matches.map((s) => `
            <button class="cfs-student-result" type="button" data-cfs-pick="${escapeHtml(s.id)}">
              <span class="cfs-result-avatar">${escapeHtml(s.name.slice(0, 2).toUpperCase())}</span>
              <span>${escapeHtml(s.name)}</span>
            </button>
          `).join("")
        : `<p class="cfs-no-results">Nenhum aluno encontrado.</p>`;
    }

    function selectStudent(studentId) {
      const student = getStudent(studentId);
      if (!student) return;
      hiddenInput.value = studentId;
      searchInput.value = student.name;
      resultsList.hidden = true;
      const form = document.getElementById("contractSheetForm");
      if (form) form.dataset.studentId = studentId;
      if (previewEl) {
        previewEl.hidden = false;
        previewEl.innerHTML = `
          ${studentAvatar(student)}
          <div class="cfs-preview-info">
            <strong>${escapeHtml(student.name)}</strong>
            <span>${escapeHtml(student.goal || "Aluno Elite AS")}</span>
          </div>
        `;
      }
    }

    searchInput.addEventListener("input", (e) => renderResults(e.target.value));
    resultsList.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-cfs-pick]");
      if (btn) selectStudent(btn.dataset.cfsPick);
    });
  }

  function _bindContractPdfUpload() {
    const input = document.getElementById("cfsPdfInput");
    const dropzone = document.getElementById("cfsPdfDropzone");
    const attached = document.getElementById("cfsPdfAttached");
    const urlInput = document.getElementById("cfsPdfUrl");
    const fileNameEl = document.getElementById("cfsPdfFileName");
    const removeBtn = document.getElementById("cfsPdfRemoveBtn");
    if (!urlInput) return;

    async function upload(file) {
      if (!file || file.type !== "application/pdf") { showToast("Selecione um arquivo PDF."); return; }
      if (dropzone) dropzone.classList.add("is-uploading");
      const contractId = document.getElementById("contractSheetForm")?.dataset.contractId || "";
      const fd = new FormData();
      fd.append("pdf", file);
      if (contractId) fd.append("contractId", contractId);
      try {
        const headers = {};
        if (state.authToken) headers.Authorization = `Bearer ${state.authToken}`;
        const resp = await fetch(`${state.apiBase || ""}/api/uploads/contracts`, { method: "POST", body: fd, headers });
        if (!resp.ok) throw new Error();
        const data = await resp.json();
        urlInput.value = data.url;
        if (fileNameEl) fileNameEl.textContent = file.name;
        if (dropzone) dropzone.hidden = true;
        if (attached) attached.hidden = false;
      } catch {
        showToast("Erro ao enviar PDF. Tente novamente.");
      } finally {
        if (dropzone) dropzone.classList.remove("is-uploading");
      }
    }

    if (input) {
      input.addEventListener("change", () => { if (input.files[0]) upload(input.files[0]); });
    }
    if (dropzone) {
      dropzone.addEventListener("dragover", (e) => { e.preventDefault(); dropzone.classList.add("is-dragging"); });
      dropzone.addEventListener("dragleave", () => dropzone.classList.remove("is-dragging"));
      dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("is-dragging");
        if (e.dataTransfer.files[0]) upload(e.dataTransfer.files[0]);
      });
    }
    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        urlInput.value = "";
        if (input) input.value = "";
        if (dropzone) dropzone.hidden = false;
        if (attached) attached.hidden = true;
      });
    }
  }

  function openContractStudentPicker() {
    openContractFormSheet();
  }

  function openContractStudentPickerModal() {
    const activeStudents = state.data.students.filter((student) => student.status !== "inactive");
    openModal(
      "Novo contrato",
      `
        <form class="form-grid" id="contractStudentPickerForm">
          ${
            activeStudents.length
              ? `
                <label class="field"><span>Aluno</span><select name="studentId" required>${activeStudents.map((student) => `<option value="${escapeHtml(student.id)}">${escapeHtml(student.name)}</option>`).join("")}</select></label>
                <p class="small-text">Selecione o aluno para criar um contrato.</p>
                <button class="primary-action" type="submit">Continuar</button>
              `
              : emptyState("Nenhum aluno ativo", "Cadastre ou ative um aluno antes de criar contratos.", icons.students)
          }
        </form>
      `
    );
  }

  function openContract(contractId) {
    openContractViewSheet(contractId);
  }

  function openContractViewSheet(contractId) {
    const contract = state.data.contracts.find((c) => c.id === contractId);
    if (!contract) return;
    const isStudent = state.currentUser?.role === "student";
    if (isStudent && contract.studentId !== state.currentUser.studentId) return showToast("Contrato indisponível para este aluno.");
    if (isStudent && contract.status === "pending") {
      contract.status = "viewed";
      contract.viewedAt = new Date().toISOString();
      persistData();
    }

    const sheet = elements.contractViewSheet;
    const bodyEl = elements.contractViewSheetBody;
    const footerEl = elements.contractViewSheetFooter;
    const titleEl = elements.contractViewTitle;
    if (!sheet || !bodyEl) return;

    const meta = contractStatusMeta(contract);
    const student = getStudent(contract.studentId);
    const isManager = state.currentUser?.role === "manager";

    if (titleEl) titleEl.textContent = contract.title || "Contrato";

    const createdAt = contract.createdAt ? new Date(contract.createdAt).toLocaleString("pt-BR") : null;
    const sentAt = (contract.emailSentAt || contract.linkSentAt)
      ? new Date(contract.emailSentAt || contract.linkSentAt).toLocaleString("pt-BR")
      : null;
    const signedAt = contract.signedAt ? new Date(contract.signedAt).toLocaleString("pt-BR") : null;

    bodyEl.innerHTML = `
      <div class="contract-view-content">
        <section class="ns-section">
          <div class="contract-view-hero">
            ${studentAvatar(student)}
            <div class="contract-view-hero-info">
              <strong>${escapeHtml(getStudentName(contract.studentId))}</strong>
              <span>${escapeHtml(contract.plan || "Plano não informado")} · ${contract.value ? escapeHtml(contract.value) + "/mês" : "Sem valor"}</span>
            </div>
            <span class="badge ${escapeHtml(meta.badgeClass)}">${escapeHtml(meta.label)}</span>
          </div>
        </section>

        <section class="ns-section">
          <div class="contract-detail-grid">
            <article><span>Início</span><strong>${escapeHtml(contract.startDate ? formatShortDate(contract.startDate) : "Não definido")}</strong></article>
            <article><span>Vigência</span><strong>${escapeHtml(contract.endDate ? formatShortDate(contract.endDate) : "Sem vencimento")}</strong></article>
            <article><span>Versão</span><strong>${escapeHtml(contract.version || "1.0")}</strong></article>
          </div>
        </section>

        <section class="ns-section">
          <h4 class="ns-section-title">Linha do tempo</h4>
          <div class="contract-timeline">
            <div class="contract-tl-item${createdAt ? " is-done" : ""}">
              <span class="contract-tl-dot"></span>
              <div class="contract-tl-text">
                <span>Criado</span>
                <strong>${createdAt ? escapeHtml(createdAt) : "—"}</strong>
              </div>
            </div>
            <div class="contract-tl-item${sentAt ? " is-done" : ""}">
              <span class="contract-tl-dot"></span>
              <div class="contract-tl-text">
                <span>Enviado</span>
                <strong>${sentAt ? escapeHtml(sentAt) : "Não enviado"}</strong>
              </div>
            </div>
            <div class="contract-tl-item${signedAt ? " is-done" : ""}">
              <span class="contract-tl-dot"></span>
              <div class="contract-tl-text">
                <span>Assinado</span>
                <strong>${signedAt ? escapeHtml(signedAt) : "Aguardando assinatura"}</strong>
              </div>
            </div>
          </div>
        </section>

        <section class="ns-section">
          <h4 class="ns-section-title">Documento</h4>
          ${contract.pdfUrl
            ? `
              <div class="contract-pdf-viewer-wrap">
                <iframe src="${escapeHtml(contract.pdfUrl)}#toolbar=1" class="contract-pdf-viewer" title="Contrato PDF"></iframe>
                <div class="contract-pdf-actions">
                  <a class="contract-pdf-open-btn is-download" href="${escapeHtml(contract.pdfUrl)}" download>
                    <svg viewBox="0 0 24 24" fill="none" stroke-width="2" aria-hidden="true"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Baixar PDF
                  </a>
                  <a class="contract-pdf-open-btn" href="${escapeHtml(contract.pdfUrl)}" target="_blank" rel="noopener noreferrer">
                    <svg viewBox="0 0 24 24" fill="none" stroke-width="2" aria-hidden="true"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    Abrir em nova aba
                  </a>
                </div>
              </div>
            `
            : `<div class="contract-doc-body">${escapeHtml(contract.body || "Texto do contrato não informado.")}</div>`
          }
          ${contract.signedAt ? `
            <p class="small-text">Assinado em ${new Date(contract.signedAt).toLocaleString("pt-BR")} · Versão ${escapeHtml(contract.signedVersion || contract.version)} · ${escapeHtml(contract.technicalId || "sem ID técnico")}${contract.signatureIp ? " · IP " + escapeHtml(contract.signatureIp) : ""}</p>
          ` : ""}
        </section>

        <div class="ns-footer-spacer"></div>
      </div>
    `;

    const _canSign = isStudent && contract.status !== "signed" && contract.status !== "canceled";
    const _isPending = contract.status !== "signed" && contract.status !== "canceled";
    footerEl.innerHTML = `
      ${isStudent ? `
        <div class="contract-consent-block">
          ${_canSign ? `
            <label class="contract-consent-check-row">
              <input type="checkbox" data-contract-consent-check="${escapeHtml(contract.id)}">
              <span>Li e aceito os termos do contrato</span>
            </label>
            <button class="primary-action" type="button" data-sign-contract="${escapeHtml(contract.id)}" disabled>Assinar contrato</button>
            <p class="small-text">O aceite registra data/hora, IP e identificação técnica para fins de comprovação jurídica.</p>
          ` : contract.pdfUrl ? `
            <a class="secondary-action" href="${escapeHtml(contract.pdfUrl)}" download>Baixar PDF</a>
          ` : ""}
        </div>
      ` : ""}
      ${isManager ? `
        <div class="ex-footer-right">
          ${contract.pdfUrl
            ? `<a class="secondary-action" href="${escapeHtml(contract.pdfUrl)}" download>Baixar PDF</a>`
            : `<button class="secondary-action" type="button" data-contract-pdf="${escapeHtml(contract.id)}">Gerar PDF</button>`}
          ${_isPending
            ? `<button class="secondary-action" type="button" data-contract-resend="${escapeHtml(contract.id)}">Reenviar</button>`
            : ""}
          <button class="primary-action" type="button" data-contract-renew="${escapeHtml(contract.id)}">Renovar</button>
        </div>
      ` : ""}
    `;

    _openSheet(sheet);
    document.body.style.overflow = "hidden";
  }

  function closeContractViewSheet() {
    if (!elements.contractViewSheet || elements.contractViewSheet.hidden) return;
    _closeSheet(elements.contractViewSheet, () => { document.body.style.overflow = ""; });
  }

  function renewContract(contractId) {
    const contract = state.data.contracts.find((c) => c.id === contractId);
    if (!contract) return;
    closeContractViewSheet();
    openContractFormSheet(contract.studentId, "", {
      plan: contract.plan,
      value: contract.value,
      pdfUrl: contract.pdfUrl || ""
    });
  }

  function openMessages(studentId) {
    openThreadSheet(studentId);
  }

  function openThreadSheet(studentId) {
    const sheet = elements.threadSheet;
    if (!sheet) return;
    const student = getStudent(studentId);
    if (!student) return;
    if (state.currentUser?.role === "student" && state.currentUser.studentId !== student.id) return showToast("Conversa indisponível.");

    const isStudentRole = state.currentUser?.role === "student";
    let changed = false;
    getStudentMessages(student.id).forEach((message) => {
      if (state.currentUser?.role === "manager" && message.senderRole === "student" && !message.readAt) {
        message.readAt = new Date().toISOString();
        changed = true;
      }
      if (isStudentRole && message.senderRole === "manager" && !message.readAt) {
        message.readAt = new Date().toISOString();
        changed = true;
      }
    });
    if (changed) persistData();

    const form = document.getElementById("threadForm");
    if (form) form.dataset.studentId = studentId;

    if (elements.threadSheetHd) elements.threadSheetHd.innerHTML = renderThreadHeader(student);

    _refreshThreadBd(studentId);

    const quickEl = document.getElementById("threadQuickChips");
    if (quickEl) quickEl.innerHTML = renderQuickChips();

    sheet.classList.toggle("is-student-view", isStudentRole);
    _openSheet(sheet);
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => {
      const bd = elements.threadSheetBd;
      if (bd) bd.scrollTop = bd.scrollHeight;
    });
  }

  function closeThreadSheet() {
    const sheet = elements.threadSheet;
    if (!sheet || sheet.hidden) return;
    _closeSheet(sheet, () => {
      sheet.classList.remove("is-student-view");
      document.body.style.overflow = "";
      if (state.currentUser?.role === "manager") renderManager();
      if (state.currentUser?.role === "student") {
        if (state.studentMenu === "chat") {
          state.studentMenu = "today";
          _updateStudentChatBadge();
          renderStudent();
        } else {
          _updateStudentChatBadge();
        }
      }
    });
  }

  function _refreshThreadBd(studentId) {
    const bd = elements.threadSheetBd;
    if (!bd) return;
    bd.innerHTML = renderThreadBubbles(studentId);
    requestAnimationFrame(() => { bd.scrollTop = bd.scrollHeight; });
  }

  function _getStudentChatUnread() {
    const studentId = state.currentUser?.studentId || "";
    if (!studentId) return 0;
    return getStudentMessages(studentId).filter((m) => m.senderRole === "manager" && !m.readAt).length;
  }

  function _buildStudentBottomMenus() {
    const unread = _getStudentChatUnread();
    return studentBottomMenus.map((m) => m.id === "chat" ? { ...m, badge: unread || null } : m);
  }

  function _updateStudentChatBadge() {
    const unread = _getStudentChatUnread();
    const badge = document.getElementById("studentChatBadge");
    if (badge) {
      badge.textContent = unread > 9 ? "9+" : String(unread);
      badge.hidden = unread === 0;
    }
    const navBtn = elements.studentBottomNav?.querySelector("[data-student-nav='chat']");
    if (navBtn) {
      let navBadge = navBtn.querySelector(".nav-dot-badge");
      if (!navBadge) { navBadge = document.createElement("b"); navBadge.className = "nav-dot-badge"; navBtn.appendChild(navBadge); }
      navBadge.textContent = unread > 9 ? "9+" : String(unread);
      navBadge.hidden = unread === 0;
    }
  }

  function renderThreadHeader(student) {
    const isManager = state.currentUser?.role === "manager";
    const backBtn = `<button class="thread-back-btn" type="button" data-close-thread-sheet aria-label="Voltar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>`;
    if (!isManager) {
      const trainerName = state.data.settings?.trainerName || "Personal";
      const statusLabel = state.socketReady ? "tempo real ativo" : "Personal";
      return `
        ${backBtn}
        <span class="entity-avatar" aria-hidden="true">${escapeHtml(initialsFromName(trainerName))}</span>
        <div class="thread-hd-info">
          <strong>${escapeHtml(trainerName)}</strong>
          <span>${escapeHtml(statusLabel)}</span>
        </div>
      `;
    }
    const statusLabel = state.socketReady ? "tempo real ativo" : (student.goal || "Elite AS");
    return `
      ${backBtn}
      ${studentAvatar(student)}
      <div class="thread-hd-info">
        <strong>${escapeHtml(student.name)}</strong>
        <span>${escapeHtml(statusLabel)}</span>
      </div>
      <button class="ghost-button thread-profile-btn" type="button" data-open-student-profile="${escapeHtml(student.id)}">Perfil</button>
    `;
  }

  function renderThreadBubbles(studentId) {
    const messages = getStudentMessages(studentId);
    const isStudentView = state.currentUser?.role === "student";
    if (!messages.length) {
      const label = isStudentView ? "Inicie a conversa" : "Nenhuma mensagem";
      const sub = isStudentView ? "Mande uma mensagem para o seu personal." : "Use o campo abaixo para iniciar a conversa.";
      return emptyState(label, sub, icons.messages);
    }
    let html = '<div class="thread-bubbles">';
    let lastDate = "";
    messages.forEach((message) => {
      const msgDate = String(message.createdAt || "").slice(0, 10);
      if (msgDate && msgDate !== lastDate) {
        lastDate = msgDate;
        const label = msgDate === todayISO() ? "Hoje" : msgDate === addDays(todayISO(), -1) ? "Ontem" : formatShortDate(msgDate);
        html += `<span class="thread-date-sep">${escapeHtml(label)}</span>`;
      }
      // Student view: aluno (student) = right/gold (is-manager CSS), personal = left/dark (is-student CSS)
      const isMine = isStudentView ? message.senderRole === "student" : message.senderRole === "manager";
      const isRead = Boolean(message.readAt);
      const timeStr = message.createdAt ? new Date(message.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "";
      html += `
        <div class="thread-bubble ${isMine ? "is-manager" : "is-student"}">
          <p>${escapeHtml(message.body)}</p>
          <div class="thread-bubble-foot">
            <time>${escapeHtml(timeStr)}</time>
            ${isMine ? `<span class="thread-check ${isRead ? "" : "is-unread"}" aria-label="${isRead ? "Lido" : "Enviado"}">✓✓</span>` : ""}
          </div>
        </div>
      `;
    });
    html += "</div>";
    return html;
  }

  function renderQuickChips() {
    const isStudent = state.currentUser?.role === "student";
    const chips = isStudent
      ? ["Obrigado! 💪", "Entendido!", "Tenho uma dúvida", "Vou fazer hoje!"]
      : ["Boa semana! 💪", "Ótimo progresso!", "Vamos lá!", "Continue assim!"];
    return chips.map((chip) => `<button class="thread-quick-chip" type="button" data-quick-reply="${escapeHtml(chip)}">${escapeHtml(chip)}</button>`).join("");
  }

  function openPaymentForm(paymentId = "", defaults = {}) {
    const payment = paymentId ? state.data.payments.find((item) => item.id === paymentId) : null;
    const record = payment ? { ...payment } : defaults.recordId ? findFinanceRecord(defaults.recordId) : null;
    const selectedStudentId = defaults.studentId || payment?.studentId || record?.studentId || "";
    const student = getStudent(selectedStudentId);
    const contract = payment?.contractId ? state.data.contracts.find((item) => item.id === payment.contractId) : getBillableContractForStudent(selectedStudentId, defaults.referenceMonth || state.financeFilters.month);
    const referenceMonth = payment?.referenceMonth || defaults.referenceMonth || record?.referenceMonth || state.financeFilters.month || todayISO().slice(0, 7);
    const amount = payment?.amount || defaults.amount || record?.amount || contract?.value || "";
    const paidAt = payment?.paidAt ? payment.paidAt.slice(0, 10) : defaults.paidAt || todayISO();
    const paymentMethod = payment?.paymentMethod || defaults.paymentMethod || "";

    const sheet = elements.paymentFormSheet;
    const bodyEl = elements.pfSheetBody;
    const titleEl = elements.pfSheetTitle;
    if (!sheet || !bodyEl) return;

    titleEl.textContent = payment ? "Editar pagamento" : "Registrar pagamento";

    const studentDatalist = state.data.students
      .map((s) => `<option value="${escapeHtml(s.name)}" data-id="${escapeHtml(s.id)}"></option>`)
      .join("");
    const methodChips = ["Pix", "Cartão", "Dinheiro", "Transferência"]
      .map((m) => `<label class="radio-chip"><input type="radio" name="paymentMethod" value="${escapeHtml(m)}" ${paymentMethod === m ? "checked" : ""}><span>${escapeHtml(m)}</span></label>`)
      .join("");

    bodyEl.innerHTML = `
      <form class="pf-form form-grid" id="paymentFormSheetForm" data-payment-id="${escapeHtml(payment?.id || "")}" data-record-id="${escapeHtml(record?.id || defaults.recordId || "")}">
        <datalist id="pfStudentList">${studentDatalist}</datalist>
        <label class="field">
          <span>Aluno</span>
          <input type="text" id="pfStudentInput" list="pfStudentList" placeholder="Buscar aluno..." value="${escapeHtml(student?.name || "")}" autocomplete="off" />
          <input type="hidden" name="studentId" id="pfStudentHiddenId" value="${escapeHtml(selectedStudentId)}" />
        </label>
        <div class="form-grid two">
          <label class="field"><span>Competência</span><input name="referenceMonth" type="month" value="${escapeHtml(referenceMonth)}" required /></label>
          <label class="field"><span>Valor</span><input name="amount" type="text" inputmode="decimal" value="${escapeHtml(String(amount))}" placeholder="R$ 0,00" required /></label>
        </div>
        <div class="field">
          <span>Forma de pagamento</span>
          <div class="chip-group pf-method-chips" role="group" aria-label="Forma de pagamento">${methodChips}</div>
        </div>
        <label class="field"><span>Data do pagamento</span><input name="paidAt" type="date" value="${escapeHtml(paidAt)}" /></label>
      </form>
    `;
    const pfFooter = elements.pfSheetFooter;
    if (pfFooter) pfFooter.innerHTML = `
      <div class="pf-footer">
        <button class="secondary-action" type="button" data-close-payment-form-sheet>Cancelar</button>
        <button class="primary-action" type="submit" form="paymentFormSheetForm" id="pfSubmitBtn">${payment ? "Salvar pagamento" : "Registrar pagamento"}</button>
      </div>`;

    const searchInput = bodyEl.querySelector("#pfStudentInput");
    const hiddenId = bodyEl.querySelector("#pfStudentHiddenId");
    searchInput?.addEventListener("input", () => {
      const val = searchInput.value.trim().toLowerCase();
      const match = state.data.students.find((s) => s.name.toLowerCase() === val);
      if (match) hiddenId.value = match.id;
      else if (!val) hiddenId.value = "";
    });

    _openSheet(sheet);
    document.body.style.overflow = "hidden";
    searchInput?.focus();
  }

  function closePaymentFormSheet() {
    if (!elements.paymentFormSheet || elements.paymentFormSheet.hidden) return;
    _closeSheet(elements.paymentFormSheet, () => { document.body.style.overflow = ""; });
  }

  async function handlePaymentFormSheet(form) {
    if (state.currentUser?.role !== "manager") return showToast("Ação restrita ao gestor.");
    const data = new FormData(form);
    const paymentId = form.dataset.paymentId || "";
    const old = paymentId ? state.data.payments.find((item) => item.id === paymentId) : null;
    const studentId = String(data.get("studentId") || "");
    const student = getStudent(studentId);
    if (!student) return showToast("Selecione um aluno válido.");
    const referenceMonth = String(data.get("referenceMonth") || todayISO().slice(0, 7));
    const amount = String(data.get("amount") || "").trim();
    if (!amount) return showToast("Informe o valor.");
    const paymentMethod = String(data.get("paymentMethod") || "").trim();
    const paidAt = String(data.get("paidAt") || todayISO());
    const recordId = form.dataset.recordId || "";
    const record = recordId ? findFinanceRecord(recordId) : null;
    const contract = record?.contractId
      ? state.data.contracts.find((c) => c.id === record.contractId)
      : getBillableContractForStudent(studentId, referenceMonth);
    const dueDate = record?.dueDate || (contract ? financeDueDateForContract(contract, referenceMonth) : `${referenceMonth}-05`);

    const submitBtn = form.querySelector("#pfSubmitBtn");
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Salvando…"; }

    try {
      const { registrarPagamento } = await import("./src/services.js");
      await registrarPagamento({ studentId, referenceMonth, amount, paymentMethod, paidAt, status: "paid" });
    } catch (_) {}

    const payment = normalizePayment({
      ...(old || {}),
      id: old?.id || createId("payment"),
      studentId,
      contractId: record?.contractId || contract?.id || "",
      plan: contract?.plan || student.goal || "Plano Elite AS",
      referenceMonth,
      amount,
      dueDate,
      paidAt,
      paymentMethod,
      status: "paid",
      note: old?.note || "",
      receiptCode: old?.receiptCode || `REC-${referenceMonth.replace("-", "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      createdAt: old?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const index = state.data.payments.findIndex((item) => item.id === payment.id);
    if (index >= 0) state.data.payments[index] = payment;
    else state.data.payments.unshift(payment);
    state.financeFilters.month = payment.referenceMonth;
    persistData();
    closePaymentFormSheet();
    state.managerMenu = "finance";
    renderManager();
    showSuccessToast(old ? "Pagamento atualizado." : "Pagamento registrado.");
  }

  function openPaymentDetail(recordId) {
    const record = findFinanceRecord(recordId);
    if (!record) return showToast("Pagamento não encontrado.");
    const student = getStudent(record.studentId);
    const meta = financeStatusMeta(record);

    const sheet = elements.paymentDetailSheet;
    const bodyEl = elements.pdSheetBody;
    if (!sheet || !bodyEl) return;

    import("./src/services.js").then(({ getMensalidade }) => getMensalidade(record.studentId).catch(() => {}));

    const allPaid = state.data.payments
      .filter((p) => p.studentId === record.studentId && financeStatusKey(p) === "paid")
      .sort((a, b) => String(b.referenceMonth || "").localeCompare(String(a.referenceMonth || "")));

    const historicHtml = allPaid.length
      ? `<section class="pd-history">
          <h4 class="pd-section-title">Histórico de pagamentos</h4>
          ${allPaid.slice(0, 8).map((p) => `
            <div class="pd-history-row">
              <span class="pd-history-month">${escapeHtml(financeMonthLabel(p.referenceMonth))}</span>
              <span class="badge is-success">Pago</span>
              <strong>${escapeHtml(currencyExact(p.amount))}</strong>
              <span class="pd-history-date">${p.paidAt ? formatShortDate(p.paidAt.slice(0, 10)) : ""}</span>
            </div>
          `).join("")}
        </section>`
      : "";

    bodyEl.innerHTML = `
      <div class="pd-content">
        <section class="pd-hero">
          ${studentAvatar(student)}
          <div>
            <strong>${escapeHtml(getStudentName(record.studentId))}</strong>
            <span>${escapeHtml(record.plan || "Plano Elite AS")} · ${escapeHtml(financeMonthLabel(record.referenceMonth))}</span>
          </div>
          <span class="badge ${meta.tone ? "is-" + meta.tone : ""}">${escapeHtml(meta.label)}</span>
        </section>
        <section class="pd-grid">
          <article><span>Valor</span><strong>${escapeHtml(currencyExact(record.amount))}</strong></article>
          <article><span>Vencimento</span><strong>${escapeHtml(record.dueDate ? formatShortDate(record.dueDate) : "—")}</strong></article>
          <article><span>Pago em</span><strong>${escapeHtml(record.paidAt ? formatShortDate(record.paidAt.slice(0, 10)) : "—")}</strong></article>
          <article><span>Forma</span><strong>${escapeHtml(record.paymentMethod || "—")}</strong></article>
        </section>
        ${historicHtml}
      </div>
    `;
    const pdFooter = elements.pdSheetFooter;
    if (pdFooter) pdFooter.innerHTML = `
      <div class="pd-actions">
        <button class="primary-action" type="button" data-open-payment-form="${escapeHtml(record.virtual ? "" : record.id)}" data-payment-record="${escapeHtml(record.id)}">${record.virtual ? "Registrar pagamento" : "Editar pagamento"}</button>
        <button class="secondary-action" type="button" data-open-cobrar-sheet="${escapeHtml(record.id)}">Cobrar</button>
        <button class="secondary-action" type="button" data-open-payment-receipt="${escapeHtml(record.id)}" ${meta.key !== "paid" ? "disabled" : ""}>Gerar recibo</button>
      </div>`;

    _openSheet(sheet);
    document.body.style.overflow = "hidden";
  }

  function closePaymentDetailSheet() {
    if (!elements.paymentDetailSheet || elements.paymentDetailSheet.hidden) return;
    _closeSheet(elements.paymentDetailSheet, () => { document.body.style.overflow = ""; });
  }

  async function openPaymentReceipt(recordId) {
    const record = findFinanceRecord(recordId);
    if (!record || financeStatusKey(record) !== "paid") return showToast("Recibo disponível apenas para pagamentos pagos.");
    const student = getStudent(record.studentId);

    showToast("Gerando recibo…");
    let pdfUrl = "";
    try {
      const { gerarRecibo } = await import("./src/services.js");
      const result = await gerarRecibo(record.id);
      pdfUrl = result?.url || "";
    } catch (_) {}

    openModal(
      "Recibo de pagamento",
      `
        <div class="finance-receipt">
          <section class="finance-receipt-card">
            <span class="eyebrow">Elite AS</span>
            <h3>Recibo de pagamento</h3>
            <div class="finance-receipt-grid">
              <span>Aluno</span><strong>${escapeHtml(getStudentName(record.studentId))}</strong>
              <span>Plano</span><strong>${escapeHtml(record.plan || "Plano Elite AS")}</strong>
              <span>Valor</span><strong>${escapeHtml(currencyExact(record.amount))}</strong>
              <span>Mês</span><strong>${escapeHtml(financeMonthLabel(record.referenceMonth))}</strong>
              <span>Pago em</span><strong>${escapeHtml(record.paidAt ? formatShortDate(record.paidAt.slice(0, 10)) : "Não informado")}</strong>
              <span>Forma</span><strong>${escapeHtml(record.paymentMethod || "Não informado")}</strong>
              <span>Código</span><strong>${escapeHtml(record.receiptCode || record.id)}</strong>
            </div>
            <p>Recibo interno para controle manual. Este documento não representa processamento automático de pagamento.</p>
          </section>
          <div class="form-actions two">
            ${pdfUrl ? `<a class="primary-action" href="${escapeHtml(pdfUrl)}" download target="_blank" rel="noopener noreferrer">Baixar PDF</a>` : `<button class="primary-action" type="button" data-print-contract>Imprimir / PDF</button>`}
            <button class="secondary-action" type="button" data-share-receipt="${escapeHtml(record.id)}">Compartilhar</button>
          </div>
        </div>
      `
    );
    showSuccessToast("Recibo gerado com sucesso.");
  }

  function openInviteLinkModal(student, inviteUrl, mailConfigured = false) {
    openModal(
      mailConfigured ? "Convite enviado" : "Link de convite",
      `
        <div class="content-stack">
          <section class="panel">
            <div class="section-title">
              <h3>${mailConfigured ? "E-mail enviado" : "Convite pronto"}</h3>
              <span class="small-text">${escapeHtml(student.email)}</span>
            </div>
            <p class="small-text">
              ${
                mailConfigured
                  ? "O aluno recebeu um link seguro para criar a própria senha."
                  : "O envio de e-mail ainda não está configurado no servidor. Use este link para testar o fluxo de criação de senha agora."
              }
            </p>
            ${
              inviteUrl
                ? `<label class="field"><span>Link de criação de senha</span><input data-invite-url readonly value="${escapeHtml(inviteUrl)}" /></label>
                  <div class="form-actions">
                    <button class="primary-action" type="button" data-copy-invite-link>Copiar link</button>
                    <a class="secondary-action" href="${escapeHtml(inviteUrl)}" target="_blank" rel="noreferrer">Abrir link</a>
                  </div>`
                : ""
            }
          </section>
        </div>
      `
    );
  }

  // ─── SHEET: ENVIAR LINK ───────────────────────────────────────────────────

  let _elStudentId = null;
  let _elBaseUrl = "";

  async function openEnviarLinkSheet(studentId) {
    if (!studentId) return;
    _elStudentId = studentId;
    _elBaseUrl = "";

    const sheet = elements.enviarLinkSheet;
    if (!sheet) return;

    // reset chip para "area"
    const areaRadio = sheet.querySelector('[name="elDest"][value="area"]');
    if (areaRadio) areaRadio.checked = true;

    const linkInput = document.getElementById("elLinkInput");
    if (linkInput) { linkInput.value = ""; linkInput.placeholder = "Gerando link…"; }

    _openSheet(sheet);
    document.body.style.overflow = "hidden";

    try {
      const result = await fetchJsonFromApi("/auth/student-area-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, appUrl: `${window.location.origin}/acesso` }),
        timeoutMs: 9000
      });
      _elBaseUrl = result.url || "";
    } catch (_) {
      _elBaseUrl = `${window.location.origin}/acesso?token=demo`;
    }
    _elUpdateLink();
  }

  function closeEnviarLinkSheet() {
    const sheet = elements.enviarLinkSheet;
    if (!sheet || sheet.hidden) return;
    _closeSheet(sheet, () => { document.body.style.overflow = ""; _elStudentId = null; _elBaseUrl = ""; });
  }

  function _elUpdateLink() {
    const sheet = elements.enviarLinkSheet;
    if (!sheet) return;
    const dest = (sheet.querySelector('[name="elDest"]:checked') || {}).value || "area";
    const suffix = dest !== "area" ? `&dest=${dest}` : "";
    const url = _elBaseUrl ? _elBaseUrl + suffix : "";
    const linkInput = document.getElementById("elLinkInput");
    if (linkInput) { linkInput.value = url; linkInput.placeholder = url ? "" : "Link indisponível"; }
    const validity = document.getElementById("elValidity");
    if (validity) validity.textContent = "Válido por 7 dias";
  }

  function _elCopyLink() {
    const linkInput = document.getElementById("elLinkInput");
    const url = linkInput?.value;
    if (!url) return;
    navigator.clipboard?.writeText(url).catch(() => {});
    showToast("Link copiado!");
  }

  async function _elSendWhatsApp() {
    const linkInput = document.getElementById("elLinkInput");
    const url = linkInput?.value;
    if (!url || !_elStudentId) return;
    const student = getStudent(_elStudentId);
    const msg = `Olá${student?.name ? ", " + student.name : ""}! Aqui está o seu link de acesso: ${url}`;
    try {
      const { enviarWhatsApp } = await import("./src/services.js");
      await enviarWhatsApp(_elStudentId, msg);
      showToast("Enviado pelo WhatsApp!");
    } catch (_) {
      showToast("Não foi possível enviar pelo WhatsApp.");
    }
  }

  function _elSendEmail() {
    const student = getStudent(_elStudentId);
    const email = student?.email;
    if (!email) { showToast("Aluno sem e-mail cadastrado."); return; }
    showToast(`Link enviado para ${email}.`);
  }

  async function _elRegenLink() {
    _elBaseUrl = "";
    const linkInput = document.getElementById("elLinkInput");
    if (linkInput) { linkInput.value = ""; linkInput.placeholder = "Gerando novo link…"; }
    try {
      const result = await fetchJsonFromApi("/auth/student-area-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: _elStudentId, appUrl: `${window.location.origin}/acesso` }),
        timeoutMs: 9000
      });
      _elBaseUrl = result.url || "";
    } catch (_) {
      _elBaseUrl = `${window.location.origin}/acesso?token=demo-${Date.now()}`;
    }
    _elUpdateLink();
    showToast("Novo link gerado!");
  }

  // ─────────────────────────────────────────────────────────────────────────

  async function sendStudentInvite(studentId, options = {}) {
    const student = getStudent(studentId);
    if (!student) return;
    if (student.status === "inactive") return showToast("Aluno inativo. Ative o cadastro antes de enviar convite.");

    try {
      const result = await fetchJsonFromApi("/auth/student-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          appUrl: `${window.location.origin}${window.location.pathname}`
        }),
        timeoutMs: 9000
      });

      await loadData();
      if (options.render !== false) renderApp();
      const refreshedStudent = getStudent(studentId) || student;
      if (result.inviteUrl || result.mailConfigured) {
        openInviteLinkModal(refreshedStudent, result.inviteUrl || "", Boolean(result.mailConfigured));
      } else {
        showToast("Convite atualizado para o aluno.");
      }
    } catch (error) {
      showToast("Nao foi possivel gerar o convite agora. Verifique a conexao com o servidor.");
    }
  }

  function openContractLinkModal(contract, contractUrl, mailConfigured = false) {
    const student = getStudent(contract.studentId);
    openModal(
      mailConfigured ? "Contrato enviado" : "Link de contrato",
      `
        <div class="content-stack">
          <section class="panel">
            <div class="section-title">
              <h3>${mailConfigured ? "E-mail enviado" : "Contrato pronto para aceite"}</h3>
              <span class="small-text">${escapeHtml(student?.email || "")}</span>
            </div>
            <p class="small-text">
              ${
                mailConfigured
                  ? "O aluno recebeu o link do contrato por e-mail."
                  : "O envio de e-mail ainda não está configurado no servidor. Use este link para testar o aceite do contrato agora."
              }
            </p>
            ${
              contractUrl
                ? `<label class="field"><span>Link do contrato</span><input data-contract-url readonly value="${escapeHtml(contractUrl)}" /></label>
                  <div class="form-actions">
                    <button class="primary-action" type="button" data-copy-contract-link>Copiar link</button>
                    <a class="secondary-action" href="${escapeHtml(contractUrl)}" target="_blank" rel="noreferrer">Abrir link</a>
                  </div>`
                : ""
            }
          </section>
        </div>
      `
    );
  }

  async function sendContractLink(contractId, options = {}) {
    const contract = state.data.contracts.find((item) => item.id === contractId);
    const student = contract ? getStudent(contract.studentId) : null;
    if (!contract || !student) return showToast("Contrato indisponivel.");
    if (contract.status === "signed" || contract.status === "canceled") return showToast("Contrato ja finalizado.");

    try {
      const variables = contractVariables(student, contract, "{link_contrato}");
      const result = await fetchJsonFromApi("/auth/contract-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId,
          appUrl: `${window.location.origin}${window.location.pathname}`,
          subject: renderTemplate(state.data.settings.contractEmailSubject, variables),
          message: renderTemplate(state.data.settings.contractEmailMessage, variables),
          signature: renderTemplate(state.data.settings.contractEmailSignature, variables)
        }),
        timeoutMs: 9000
      });

      await loadData();
      if (options.render !== false) renderApp();
      const updated = state.data.contracts.find((item) => item.id === contractId) || contract;
      if (result.contractUrl || result.mailConfigured) {
        openContractLinkModal(updated, result.contractUrl || "", Boolean(result.mailConfigured));
      } else {
        showToast("Link do contrato atualizado.");
      }
    } catch (error) {
      showToast("Nao foi possivel gerar o link do contrato agora.");
    }
  }

  async function handleNewStudentForm(form, sendLink = false) {
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();

    const nameInput = form.querySelector("[name='name']");
    const phoneInput = form.querySelector("[name='phone']");
    let valid = true;

    if (!name) {
      nameInput?.classList.add("ns-field-error");
      nameInput?.focus();
      valid = false;
    } else {
      nameInput?.classList.remove("ns-field-error");
    }
    if (!phone) {
      phoneInput?.classList.add("ns-field-error");
      if (valid) phoneInput?.focus();
      valid = false;
    } else {
      phoneInput?.classList.remove("ns-field-error");
    }
    if (!valid) return showToast("Preencha os campos obrigatorios: Nome e Telefone.");

    const email = normalizeEmail(data.get("email"));
    if (email && email === ADMIN.email) return showToast("Use outro e-mail para o aluno.");
    if (email && state.data.students.some((s) => s.email === email)) return showToast("Ja existe aluno com esse e-mail.");

    const id = createId("student");
    const goalRaw = String(data.get("goal") || "").trim();
    const goalLabels = { hipertrofia: "Hipertrofia", emagrecimento: "Emagrecimento", condicionamento: "Condicionamento", performance: "Performance", forca: "Força", reabilitacao: "Reabilitação", qualidade_de_vida: "Qualidade de vida" };
    const goal = goalLabels[goalRaw] || goalRaw || "Condicionamento";

    const student = {
      id,
      trainerId: TRAINER_ID,
      name,
      email: email || "",
      passwordHash: "",
      hasPassword: false,
      phone,
      goal,
      birthdate: String(data.get("birthdate") || ""),
      sex: String(data.get("sex") || ""),
      level: String(data.get("level") || "beginner"),
      contractType: String(data.get("contractType") || ""),
      contractValue: parseFloat(data.get("contractValue") || "0") || 0,
      contractStart: String(data.get("contractStart") || ""),
      status: "active",
      accessStatus: "invite_pending",
      inviteSentAt: "",
      inviteExpiresAt: "",
      inviteAcceptedAt: "",
      passwordUpdatedAt: "",
      internalNotes: String(data.get("internalNotes") || "").trim(),
      createdAt: new Date().toISOString()
    };

    state.data.students.unshift(student);
    ensureNextUpdatePending(student.id, todayISO());
    ensureDefaultContractForStudent(student.id);
    persistData();
    state.managerMenu = "students";
    renderApp();

    await flushRemoteSync();
    if (sendLink) {
      openEnviarLinkSheet(student.id);
    } else {
      showToast("Aluno salvo com status Pendente.");
    }
  }

  async function handleStudentForm(form) {
    const data = new FormData(form);
    const id = form.dataset.id || createId("student");
    const old = getStudent(id);
    const email = normalizeEmail(data.get("email"));
    if (email === ADMIN.email) return showToast("Use outro e-mail para o aluno.");
    if (state.data.students.some((student) => student.email === email && student.id !== id)) return showToast("Já existe aluno com esse e-mail.");

    const isNew = !old;
    const oldHasPassword = Boolean(old?.passwordHash || old?.hasPassword);
    const oldAccessStatus = normalizeStudentAccessStatus(old?.accessStatus, oldHasPassword);
    const student = {
      id,
      trainerId: TRAINER_ID,
      name: String(data.get("name") || "").trim(),
      email,
      passwordHash: old?.passwordHash || "",
      hasPassword: oldHasPassword,
      phone: String(data.get("phone") || "").trim(),
      goal: String(data.get("goal") || "").trim(),
      status: String(data.get("status") || "active"),
      accessStatus: oldHasPassword ? oldAccessStatus : "invite_pending",
      inviteSentAt: old?.inviteSentAt || "",
      inviteExpiresAt: old?.inviteExpiresAt || "",
      inviteAcceptedAt: old?.inviteAcceptedAt || "",
      passwordUpdatedAt: old?.passwordUpdatedAt || "",
      internalNotes: String(data.get("internalNotes") || "").trim(),
      createdAt: old?.createdAt || new Date().toISOString()
    };
    const index = state.data.students.findIndex((item) => item.id === id);
    if (index >= 0) state.data.students[index] = student;
    else state.data.students.unshift(student);
    ensureNextUpdatePending(student.id, todayISO());
    if ((isNew || old?.status === "inactive") && student.status === "active") ensureDefaultContractForStudent(student.id);
    persistData();
    closeModal();
    state.managerMenu = "students";
    renderApp();
    if (isNew && student.status === "active") {
      await flushRemoteSync();
      await sendStudentInvite(student.id);
      return;
    }
    showToast("Aluno salvo. A senha continua privada do aluno.");
  }

  async function handleExerciseForm(form, action = "publish") {
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    if (action === "publish" && !name) {
      form.querySelector('[name="name"]')?.focus();
      showToast("Informe o nome do exercício antes de publicar.");
      return;
    }
    const id = form.dataset.id || createId("exercise");
    const old = getExercise(id);
    const videoUrl = String(data.get("videoUrl") || "").trim();
    let videoData = {
      videoUrl: old?.videoUrl || "",
      videoStorage: old?.videoStorage || "",
      videoKey: old?.videoKey || "",
      videoName: old?.videoName || "",
      videoSize: old?.videoSize || 0,
      videoUploadedAt: old?.videoUploadedAt || ""
    };

    if (videoUrl) {
      videoData = {
        videoUrl,
        videoStorage: "external",
        videoKey: "",
        videoName: "Link externo",
        videoSize: 0,
        videoUploadedAt: old?.videoUploadedAt || new Date().toISOString()
      };
    }

    const videoFile = form.querySelector('[name="videoFile"]')?.files?.[0];
    if (videoFile) {
      try {
        videoData = await uploadExerciseVideo(videoFile, id);
      } catch (error) {
        return showToast(error.message || "Não foi possível salvar o vídeo.");
      }
    }

    const exercise = normalizeExercise({
      id,
      trainerId: TRAINER_ID,
      name: name || "Exercício",
      muscle: String(data.get("primaryMuscle") || "").trim(),
      primaryMuscle: String(data.get("primaryMuscle") || "").trim(),
      secondaryMuscles: normalizeStringList(data.getAll("secondaryMuscles")),
      equipment: String(data.get("equipment") || "Peso corporal").trim(),
      description: String(data.get("description") || "").trim(),
      technicalNotes: "",
      defaultSets: Number(data.get("defaultSets")) || 3,
      defaultRepsMin: Number(data.get("defaultRepsMin")) || 8,
      defaultRepsMax: Number(data.get("defaultRepsMax")) || 12,
      defaultRestSeconds: Number(data.get("defaultRestSeconds")) || 60,
      ...videoData,
      status: action === "publish" ? "active" : "draft",
      createdAt: old?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const index = state.data.exercises.findIndex((item) => item.id === id);
    if (index >= 0) state.data.exercises[index] = exercise;
    else state.data.exercises.unshift(exercise);
    persistData();
    closeExerciseSheet();
    state.managerMenu = "library";
    renderApp();

    const toastMsg = action === "draft"
      ? "Exercício salvo como rascunho."
      : videoFile && exercise.videoStorage === "indexeddb"
        ? "Exercício publicado. Vídeo ficou local neste aparelho até o backend estar disponível."
        : "Exercício publicado na biblioteca.";
    showToast(toastMsg);
  }

  function handleWorkoutForm(form) {
    const data = new FormData(form);
    const id = form.dataset.id || createId("workout");
    const old = getWorkout(id);
    const isPattern = form.dataset.scope === "pattern";
    const rows = [...form.querySelectorAll("[data-workout-row]")]
      .map((row, index) => {
        const exerciseId = row.querySelector('[name="exerciseId"]').value;
        return normalizeWorkoutExercise({
          id: old?.exercises?.[index]?.id || createId("workout-exercise"),
          exerciseId,
          exerciseName: getExercise(exerciseId)?.name || "",
          order: row.querySelector('[name="order"]').value || index + 1,
          sets: row.querySelector('[name="sets"]').value,
          targetReps: row.querySelector('[name="targetReps"]').value,
          suggestedLoad: row.querySelector('[name="suggestedLoad"]').value,
          restSeconds: row.querySelector('[name="restSeconds"]').value,
          coachNotes: row.querySelector('[name="coachNotes"]').value
        });
      })
      .filter((row) => row.exerciseId)
      .sort((a, b) => a.order - b.order);
    if (!rows.length) return showToast("Adicione pelo menos um exercício da biblioteca.");
    const status = String(data.get("status") || "draft");
    const workout = normalizeWorkout({
      id,
      trainerId: TRAINER_ID,
      studentId: isPattern ? "" : String(data.get("studentId") || ""),
      title: String(data.get("title") || "").trim(),
      description: String(data.get("description") || "").trim(),
      focus: String(data.get("focus") || "").trim(),
      level: String(data.get("level") || ""),
      status,
      exercises: rows,
      sourcePatternId: isPattern ? "" : old?.sourcePatternId || "",
      sourcePatternTitle: isPattern ? "" : old?.sourcePatternTitle || "",
      appliedAt: isPattern ? "" : old?.appliedAt || "",
      createdAt: old?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: status === "published" ? old?.publishedAt || new Date().toISOString() : old?.publishedAt || ""
    });
    const index = state.data.workouts.findIndex((item) => item.id === id);
    if (index >= 0) state.data.workouts[index] = workout;
    else state.data.workouts.unshift(workout);
    persistData();
    closeWorkoutSheet();
    if (workout.studentId) {
      state.managerMenu = "students";
      state.profileTab = "workouts";
      renderApp();
      openStudentProfile(workout.studentId);
    } else {
      state.managerMenu = "workouts";
      renderApp();
    }
    if (workout.studentId && status === "published") showSuccessToast("Treino publicado para o aluno.");
    else showToast(workout.studentId ? "Treino salvo." : "Padrão de treino salvo.");
  }

  async function handleApplyPatternSheetForm(form) {
    const data = new FormData(form);
    const pattern = getWorkout(form.dataset.id);
    if (!pattern || !isWorkoutPattern(pattern)) return showToast("Padrão não encontrado.");
    const studentIds = data.getAll("studentIds").map(String).filter(Boolean);
    if (!studentIds.length) return showToast("Selecione ao menos um aluno.");
    const status = String(data.get("status") || "published");
    const applyMode = String(data.get("applyMode") || "add");

    if (applyMode === "replace") {
      studentIds.forEach((sid) => {
        const idx = state.data.workouts.findIndex((w) => w.studentId === sid && !isWorkoutPattern(w));
        if (idx !== -1) state.data.workouts.splice(idx, 1);
      });
    }

    const created = studentIds.map((sid) => buildStudentWorkoutFromPattern(pattern, sid, { status }));
    state.data.workouts.unshift(...created);
    persistData();
    closeApplyPatternSheet();

    try {
      const { aplicarPadrao } = await import("./src/services.js");
      await Promise.all(studentIds.map((sid) => aplicarPadrao(sid, pattern.id)));
    } catch (_) {}

    const firstName = escapeHtml(getStudent(studentIds[0])?.name || "aluno");
    const label = studentIds.length === 1
      ? `Padrão aplicado para ${firstName}.`
      : `Padrão aplicado para ${studentIds.length} alunos.`;

    showActionToast(label, "Enviar link", () => openEnviarLinkSheet(studentIds[0]));
  }

  function handleApplyPatternForm(form) {
    handleApplyPatternSheetForm(form);
  }

  function handleStudentPatternWorkoutForm(form) {
    const data = new FormData(form);
    const studentId = form.dataset.studentId || "";
    const student = getStudent(studentId);
    const pattern = getWorkout(String(data.get("patternId") || ""));
    if (!student) return showToast("Aluno não encontrado.");
    if (!pattern || !isWorkoutPattern(pattern)) return showToast("Selecione um padrão válido.");
    const status = String(data.get("status") || "draft");
    const customTitle = String(data.get("title") || "").trim();
    const studentWorkout = buildStudentWorkoutFromPattern(pattern, student.id, {
      title: customTitle || pattern.title,
      status
    });
    state.data.workouts.unshift(studentWorkout);
    persistData();
    closeModal();
    state.profileTab = "workouts";
    openStudentProfile(student.id);
    if (status === "published") showSuccessToast("Treino criado e publicado para o aluno.");
    else showToast("Treino criado como rascunho do aluno.");
  }

  function handleDietForm(form) {
    const data = new FormData(form);
    const id = form.dataset.id || createId("diet");
    const old = getDietPlan(id);
    const studentId = String(data.get("studentId") || "");
    if (!getStudent(studentId)) return showToast("Selecione um aluno válido.");
    const meals = parseDietMealsText(data.get("mealsText"));
    const status = String(data.get("status") || "active");
    const plan = normalizeDietPlan({
      id,
      trainerId: TRAINER_ID,
      studentId,
      title: String(data.get("title") || "").trim(),
      objective: String(data.get("objective") || "").trim(),
      protocol: String(data.get("protocol") || "").trim(),
      calories: String(data.get("calories") || "").trim(),
      mealCount: String(data.get("mealCount") || meals.length || "").trim(),
      startDate: String(data.get("startDate") || todayISO()),
      nextReviewDate: String(data.get("nextReviewDate") || ""),
      status,
      notes: String(data.get("notes") || "").trim(),
      instructions: String(data.get("instructions") || "").trim(),
      meals,
      linkSentAt: old?.linkSentAt || "",
      archivedAt: status === "archived" ? old?.archivedAt || new Date().toISOString() : "",
      createdAt: old?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString()
    });
    const index = state.data.diets.findIndex((item) => item.id === id);
    if (index >= 0) state.data.diets[index] = plan;
    else state.data.diets.unshift(plan);
    ensureDietReviewActivity(plan);
    persistData();
    closeModal();
    if (state.managerMenu === "studentProfile" || state.activeStudentProfileId === studentId) {
      state.profileTab = "diet";
      openStudentProfile(studentId, { updateHash: false });
    } else {
      state.managerMenu = "diet";
      renderManager();
    }
    if (status === "draft") showToast("Plano alimentar salvo como rascunho.");
    else showSuccessToast("Plano alimentar salvo.");
  }

  function sendDietPlanLink(planId) {
    const plan = getDietPlan(planId);
    const student = getStudent(plan?.studentId);
    if (!plan || !student) return showToast("Plano alimentar indisponível.");
    const url = dietLinkUrl(planId);
    if (!url) return showToast("Este aluno não possui telefone cadastrado.");
    plan.linkSentAt = new Date().toISOString();
    plan.updatedAt = new Date().toISOString();
    persistData();
    renderApp();
    window.open(url, "_blank", "noopener");
    showToast("Mensagem do plano alimentar aberta no WhatsApp.");
  }

  function duplicateDietPlan(planId) {
    const plan = getDietPlan(planId);
    if (!plan) return showToast("Plano alimentar não encontrado.");
    const copy = normalizeDietPlan({
      ...plan,
      id: createId("diet"),
      title: `${plan.title || plan.protocol || "Plano alimentar"} - cópia`,
      status: "draft",
      linkSentAt: "",
      archivedAt: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      meals: (plan.meals || []).map((meal, index) => normalizeDietMeal({ ...meal, id: createId("meal") }, index))
    });
    state.data.diets.unshift(copy);
    persistData();
    renderApp();
    showToast("Plano duplicado como rascunho.");
  }

  function archiveDietPlan(planId) {
    const plan = getDietPlan(planId);
    if (!plan) return showToast("Plano alimentar não encontrado.");
    if (!confirm("Arquivar este plano alimentar?")) return;
    plan.status = "archived";
    plan.archivedAt = new Date().toISOString();
    plan.updatedAt = new Date().toISOString();
    ensureDietReviewActivity(plan);
    persistData();
    renderApp();
    showToast("Plano alimentar arquivado.");
  }

  function handleActivityForm(form) {
    const data = new FormData(form);
    const id = form.dataset.id || createId("activity");
    const old = state.data.activities.find((item) => item.id === id);
    const type = String(data.get("type") || "workout");
    const activity = normalizeActivity({
      id,
      trainerId: TRAINER_ID,
      studentId: String(data.get("studentId") || ""),
      type,
      workoutId: type === "workout" ? String(data.get("workoutId") || "") : "",
      title: String(data.get("title") || "").trim(),
      date: String(data.get("date") || state.agendaDate),
      time: String(data.get("time") || "08:00"),
      duration: String(data.get("duration") || "60"),
      status: String(data.get("status") || (type === "update" ? "pending" : "scheduled")),
      notes: String(data.get("notes") || "").trim(),
      updateId: old?.updateId || "",
      contractId: old?.contractId || "",
      createdAt: old?.createdAt || new Date().toISOString()
    });
    const index = state.data.activities.findIndex((item) => item.id === id);
    if (index >= 0) state.data.activities[index] = activity;
    else state.data.activities.push(activity);
    persistData();
    closeModal();
    closeAgendarSheet();
    state.agendaDate = activity.date;
    state.managerMenu = "agenda";
    renderApp();
    showToast("Agenda atualizada.");
  }

  async function handleUpdateForm(form) {
    const update = state.data.updates.find((item) => item.id === form.dataset.id);
    if (!update || update.studentId !== state.currentUser?.studentId) return showToast("Atualização não encontrada.");
    const data = new FormData(form);
    const photos = await readPhotoFiles(form.querySelector('[name="photos"]').files);
    update.weight = String(data.get("weight") || "");
    update.photos = photos;
    update.trainingNotes = String(data.get("trainingNotes") || "").trim();
    update.dietNotes = String(data.get("dietNotes") || "").trim();
    update.generalNotes = String(data.get("generalNotes") || "").trim();
    update.energy = String(data.get("energy") || "");
    update.pain = String(data.get("pain") || "");
    update.status = "sent";
    update.submittedAt = new Date().toISOString();
    ensureUpdateActivity(update);
    ensureNextUpdatePending(update.studentId, todayISO());
    persistData();
    closeModal();
    state.studentMenu = "updates";
    renderApp();
    showToast("Atualização enviada. A próxima pendência foi criada para daqui 15 dias.");
  }

  function readPhotoFiles(files) {
    const selected = [...files].slice(0, 4);
    return Promise.all(
      selected.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ""));
            reader.onerror = () => resolve("");
            reader.readAsDataURL(file);
          })
      )
    ).then((items) => items.filter(Boolean));
  }

  function handleUpdateComment(form) {
    const update = state.data.updates.find((item) => item.id === form.dataset.id);
    if (!update) return;
    update.trainerComment = String(new FormData(form).get("trainerComment") || "").trim();
    update.status = "viewed";
    update.viewedAt = new Date().toISOString();
    ensureUpdateActivity(update);
    persistData();
    closeModal();
    renderApp();
    showToast("Avaliação salva.");
  }

  function handleSettingsForm(form) {
    const data = new FormData(form);
    state.data.settings = normalizeSettings({
      trainerName: String(data.get("trainerName") || "").trim(),
      trainerPhone: String(data.get("trainerPhone") || "").trim(),
      contactEmail: String(data.get("contactEmail") || "").trim(),
      whatsappTemplate: String(data.get("whatsappTemplate") || "").trim(),
      contractEmailSubject: String(data.get("contractEmailSubject") || "").trim(),
      contractEmailMessage: String(data.get("contractEmailMessage") || "").trim(),
      contractEmailSignature: String(data.get("contractEmailSignature") || "").trim(),
      contractTemplate: String(data.get("contractTemplate") || "").trim()
    });
    persistData();
    renderApp();
    showToast("Configurações salvas.");
  }

  async function handleContractForm(form) {
    const data = new FormData(form);
    const studentId = String(data.get("studentId") || form.dataset.studentId || "");
    const student = getStudent(studentId);
    if (!student) return showToast("Selecione um aluno para continuar.");
    const contractId = form.dataset.contractId || "";
    const old = contractId ? state.data.contracts.find((item) => item.id === contractId && item.studentId === studentId) : null;
    const action = String(data.get("action") || "send");
    const isDraft = action === "draft";
    const pdfUrl = String(data.get("pdfUrl") || "").trim();
    const valueRaw = String(data.get("value") || "").trim();
    const endDateRaw = String(data.get("endDate") || "").trim();
    if (!isDraft && !pdfUrl) return showToast("Adicione o PDF do contrato antes de enviar.");
    if (!isDraft && !valueRaw) return showToast("Informe o valor mensal do contrato.");
    if (!isDraft && !endDateRaw) return showToast("Informe a data de vigência (fim) do contrato.");
    const contract = normalizeContract({
      ...(old || {}),
      id: old?.id || createId("contract"),
      studentId,
      title: old?.title || "Contrato de prestação de serviço",
      body: old?.body || "",
      pdfUrl,
      version: old?.version || "1.0",
      plan: String(data.get("plan") || "").trim(),
      value: String(data.get("value") || "").trim(),
      startDate: String(data.get("startDate") || "").trim(),
      endDate: String(data.get("endDate") || "").trim(),
      status: isDraft ? "draft" : (old?.status === "draft" ? "pending" : (old?.status || "pending")),
      createdAt: old?.createdAt || new Date().toISOString()
    });
    const index = state.data.contracts.findIndex((item) => item.id === contract.id);
    if (index >= 0) state.data.contracts[index] = contract;
    else state.data.contracts.unshift(contract);
    persistData();
    closeContractFormSheet();
    renderManager();
    if (!isDraft) {
      showToast(old ? "Contrato atualizado." : "Contrato criado para aceite do aluno.");
      await flushRemoteSync();
      await sendContractLink(contract.id);
    } else {
      showToast("Rascunho salvo.");
    }
  }

  function handleContractStudentPicker(form) {
    const studentId = String(new FormData(form).get("studentId") || "");
    if (!getStudent(studentId)) return showToast("Aluno não encontrado.");
    closeModal();
    openContractFormSheet(studentId);
  }

  function handleMessageForm(form) {
    const studentId = form.dataset.studentId;
    if (!getStudent(studentId)) return showToast("Aluno não encontrado.");
    if (state.currentUser?.role === "student" && state.currentUser.studentId !== studentId) return showToast("Conversa indisponível.");
    const body = String(new FormData(form).get("body") || "").trim();
    if (!body) return showToast("Digite uma mensagem.");
    if (body.length > 800) return showToast("A mensagem deve ter no máximo 800 caracteres.");
    const message = normalizeMessage({
      id: createId("message"),
      studentId,
      senderRole: state.currentUser?.role === "manager" ? "manager" : "student",
      body,
      createdAt: new Date().toISOString()
    });
    state.data.messages.push(message);
    persistData();
    if (state.socketReady && state.socket) state.socket.emit("message:send", message);
    form.reset();
    _refreshThreadBd(studentId);
    showToast(state.socketReady ? "Mensagem enviada em tempo real." : "Mensagem salva em modo local.");
  }

  function handlePaymentForm(form) {
    if (state.currentUser?.role !== "manager") return showToast("Ação restrita ao gestor.");
    const data = new FormData(form);
    const paymentId = form.dataset.paymentId || "";
    const old = paymentId ? state.data.payments.find((item) => item.id === paymentId) : null;
    const studentId = String(data.get("studentId") || "");
    const student = getStudent(studentId);
    if (!student) return showToast("Aluno não encontrado.");
    const status = String(data.get("status") || "paid");
    const paidAt = status === "paid" ? String(data.get("paidAt") || todayISO()) : String(data.get("paidAt") || "");
    const contractId = String(data.get("contractId") || "");
    const contract = contractId ? state.data.contracts.find((item) => item.id === contractId) : null;
    const referenceMonth = String(data.get("referenceMonth") || todayISO().slice(0, 7));
    const payment = normalizePayment({
      ...(old || {}),
      id: old?.id || createId("payment"),
      studentId,
      contractId,
      plan: contract?.plan || student.goal || "Plano Elite AS",
      referenceMonth,
      amount: String(data.get("amount") || "").trim(),
      dueDate: String(data.get("dueDate") || "").trim(),
      paidAt,
      paymentMethod: String(data.get("paymentMethod") || "").trim(),
      status,
      note: String(data.get("note") || "").trim(),
      receiptCode: old?.receiptCode || `REC-${referenceMonth.replace("-", "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      createdAt: old?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    const index = state.data.payments.findIndex((item) => item.id === payment.id);
    if (index >= 0) state.data.payments[index] = payment;
    else state.data.payments.unshift(payment);
    state.financeFilters.month = payment.referenceMonth;
    persistData();
    closeModal();
    state.managerMenu = "finance";
    renderManager();
    showSuccessToast(old ? "Pagamento atualizado." : "Pagamento registrado.");
  }

  function chargeFinanceRecord(recordId) {
    openCobrarSheet(recordId);
  }

  function openCobrarSheet(recordId) {
    const record = findFinanceRecord(recordId);
    if (!record) return showToast("Registro não encontrado.");
    const student = getStudent(record.studentId);
    const sheet = elements.cobrarSheet;
    const bodyEl = elements.cobrarSheetBody;
    if (!sheet || !bodyEl) return;

    const dueLabel = record.dueDate ? formatShortDate(record.dueDate) : "a combinar";
    const template =
      state.data.settings.financeChargeTemplate ||
      "Olá, {aluno}! Passando para lembrar da mensalidade do plano {plano}, no valor de {valor}, com vencimento em {vencimento}.";
    const defaultMsg = template
      .replace("{aluno}", student?.name || "aluno")
      .replace("{plano}", record.plan || "Elite AS")
      .replace("{vencimento}", dueLabel)
      .replace("{valor}", currencyExact(record.amount))
      .replace("{personal}", state.data.settings.trainerName || "Personal");

    const hasPhone = !!sanitizePhone(student?.phone);
    const hasEmail = !!student?.email;

    bodyEl.innerHTML = `
      <div class="cobrar-content">
        <section class="cobrar-student">
          ${studentAvatar(student)}
          <div>
            <strong>${escapeHtml(student?.name || "Aluno")}</strong>
            <span>${escapeHtml(record.plan || "Plano Elite AS")} · ${escapeHtml(currencyExact(record.amount))} · ${escapeHtml(dueLabel)}</span>
          </div>
        </section>
        <label class="field">
          <span>Mensagem</span>
          <textarea id="cobrarMsg" class="cobrar-msg" rows="5">${escapeHtml(defaultMsg)}</textarea>
        </label>
        ${!hasPhone && !hasEmail ? `<p class="small-text cobrar-no-contact">Cadastre telefone ou e-mail no perfil do aluno para enviar cobrança.</p>` : ""}
      </div>
    `;
    const cobrarFooter = elements.cobrarSheetFooter;
    if (cobrarFooter) cobrarFooter.innerHTML = `
      <div class="cobrar-actions">
        <button class="whatsapp-button cobrar-wa-btn" type="button" data-cobrar-wa="${escapeHtml(record.id)}" ${!hasPhone ? "disabled" : ""}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.135.559 4.137 1.532 5.875L0 24l6.267-1.508A11.956 11.956 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
          Cobrar pelo WhatsApp
        </button>
        <button class="secondary-action cobrar-email-btn" type="button" data-cobrar-email="${escapeHtml(record.id)}" ${!hasEmail ? "disabled" : ""}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          Por e-mail
        </button>
      </div>`;

    _openSheet(sheet);
    document.body.style.overflow = "hidden";
  }

  function closeCobrarSheet() {
    if (!elements.cobrarSheet || elements.cobrarSheet.hidden) return;
    _closeSheet(elements.cobrarSheet, () => { document.body.style.overflow = ""; });
  }

  function startWorkout(workoutId, activityId = "") {
    const student = getCurrentStudent();
    const workout = getWorkout(workoutId);
    if (!student || !workout || workout.studentId !== student.id || workout.status !== "published") {
      return showToast("Treino indisponível para este aluno.");
    }
    state.activeSession = {
      id: createId("session-draft"),
      trainerId: TRAINER_ID,
      studentId: student.id,
      workoutId: workout.id,
      activityId,
      startedAt: new Date().toISOString(),
      exercises: workout.exercises.map((item) => {
        const exercise = getExercise(item.exerciseId);
        return {
          workoutExerciseId: item.id,
          exerciseId: item.exerciseId,
          name: exercise?.name || item.exerciseName || "Exercício indisponível",
          targetReps: item.targetReps,
          suggestedLoad: item.suggestedLoad,
          restSeconds: Number(item.restSeconds || 0),
          coachNotes: item.coachNotes,
          sets: Array.from({ length: Number(item.sets || 1) }, (_, index) => ({
            index: index + 1,
            status: "pending",
            load: "",
            reps: "",
            volumeLoad: 0,
            startedAt: "",
            finishedAt: ""
          }))
        };
      })
    };
    state.studentMenu = "workouts";
    persistActiveSession();
    renderStudent();
    showToast("Treino iniciado.");
  }

  function handleSeriesAction(key) {
    if (state.rest) return showToast("Aguarde o descanso ou toque em Pular descanso.");
    const [exerciseIndex, setIndex] = key.split(":").map(Number);
    const set = state.activeSession?.exercises?.[exerciseIndex]?.sets?.[setIndex];
    const exercise = state.activeSession?.exercises?.[exerciseIndex];
    if (!set || !exercise) return;
    if (!isSetActionAvailable(exerciseIndex, setIndex)) return showToast("Conclua a série atual antes de avançar.");
    const loadInput = document.querySelector(`[data-set-load="${exerciseIndex}:${setIndex}"]`);
    const repsInput = document.querySelector(`[data-set-reps="${exerciseIndex}:${setIndex}"]`);
    if (set.status === "pending") {
      set.load = loadInput?.value ?? set.load ?? "";
      set.reps = repsInput?.value ?? set.reps ?? "";
      set.status = "running";
      set.startedAt = new Date().toISOString();
      persistActiveSession();
      renderStudent();
      return;
    }
    if (set.status === "running") {
      set.load = loadInput?.value ? loadInput.value : set.load || "0";
      set.reps = repsInput?.value ? repsInput.value : set.reps || "0";
      set.volumeLoad = numberValue(set.load) * numberValue(set.reps);
      set.status = "done";
      set.finishedAt = new Date().toISOString();
      persistActiveSession();
      state.lastDoneKey = `${exerciseIndex}:${setIndex}`;
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        navigator.vibrate?.(45);
      }
      const hasNextSet = state.activeSession.exercises.some((item) => item.sets.some((candidate) => candidate.status !== "done"));
      if (hasNextSet && Number(exercise.restSeconds || 0) > 0) startRest(Number(exercise.restSeconds || 0));
      renderStudent();
      window.setTimeout(() => { state.lastDoneKey = null; }, 600);
    }
  }

  function startRest(seconds) {
    stopRest();
    state.rest = { remaining: seconds };
    state.restTimer = window.setInterval(() => {
      if (!state.rest) return;
      state.rest.remaining -= 1;
      if (state.rest.remaining <= 0) {
        stopRest();
        showToast("Descanso finalizado.");
      }
      renderStudent();
    }, 1000);
  }

  function stopRest() {
    if (state.restTimer) window.clearInterval(state.restTimer);
    state.restTimer = null;
    state.rest = null;
  }

  function finishWorkout() {
    const session = state.activeSession;
    if (!session) return;
    const allDone = session.exercises.every((exercise) => exercise.sets.every((set) => set.status === "done"));
    if (!allDone) return showToast("Finalize todas as séries antes de concluir o treino.");
    const finalSession = normalizeSession({
      ...session,
      id: createId("session"),
      finishedAt: new Date().toISOString(),
      totalVolumeLoad: calculateSessionVolume(session),
      exercises: session.exercises.map((exercise) => ({
        ...exercise,
        volumeLoad: exercise.sets.reduce((sum, set) => sum + Number(set.volumeLoad || 0), 0)
      }))
    });
    state.data.sessions.unshift(finalSession);
    let activity = session.activityId ? state.data.activities.find((item) => item.id === session.activityId) : null;
    if (activity) {
      activity.status = "done";
      activity.completedSessionId = finalSession.id;
    }
    state.activeSession = null;
    stopRest();
    persistActiveSession();
    persistData();
    renderStudent();
    showWorkoutCompleteOverlay(finalSession.totalVolumeLoad);
  }

  function showWorkoutCompleteOverlay(volume) {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      navigator.vibrate?.([80, 60, 120]);
    }
    const overlay = document.createElement("div");
    overlay.className = "workout-complete-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Treino concluído");
    overlay.innerHTML = `
      <div class="workout-complete-card">
        <div class="workout-complete-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5"/>
          </svg>
        </div>
        <p class="workout-complete-title">Treino concluído!</p>
        <p class="workout-complete-sub">Ótimo trabalho. Continue assim e os resultados vão aparecer.</p>
        ${volume > 0 ? `<span class="workout-complete-vol">Volume load total: ${volume}</span>` : ""}
        <button class="workout-complete-btn" type="button">Fechar</button>
      </div>
    `;
    overlay.querySelector(".workout-complete-btn").addEventListener("click", () => {
      overlay.remove();
    });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });
    document.body.appendChild(overlay);
    overlay.querySelector(".workout-complete-btn").focus({ preventScroll: true });
  }

  let installSheetCloseTimer = null;

  function openInstallSheet(customMessage) {
    if (installSheetCloseTimer) { clearTimeout(installSheetCloseTimer); installSheetCloseTimer = null; }
    renderInstallInstructions(customMessage);
    elements.installSheet.classList.remove("is-closing", "is-open");
    elements.installSheet.hidden = false;
    void elements.installSheet.offsetWidth;
    elements.installSheet.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeInstallSheet() {
    if (elements.installSheet.hidden) return;
    elements.installSheet.classList.remove("is-open");
    elements.installSheet.classList.add("is-closing");
    installSheetCloseTimer = setTimeout(() => {
      installSheetCloseTimer = null;
      elements.installSheet.hidden = true;
      elements.installSheet.classList.remove("is-closing");
      document.body.style.overflow = "";
    }, 160);
  }

  function renderInstallInstructions(customMessage) {
    elements.installSheetMessage.textContent =
      customMessage ||
      "Seu app está pronto para instalação. Caso o botão de instalação não apareça automaticamente neste aparelho, abra o menu do navegador e escolha a opção de instalar o aplicativo.";
    const instructions = ["Use Chrome ou Edge em um endereço HTTPS.", "Abra o menu do navegador.", "Escolha Instalar aplicativo quando a opção aparecer."];
    elements.installSteps.innerHTML = instructions.map((item) => `<li>${item}</li>`).join("");
  }

  async function requestInstall() {
    if (isStandalone()) return showToast("O aplicativo já está aberto em modo app.");
    if (!state.deferredPrompt) return openInstallSheet();
    const promptEvent = state.deferredPrompt;
    state.deferredPrompt = null;
    promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === "accepted") {
      localStorage.setItem(keys.installed, "true");
      closeInstallSheet();
      updateInstallUi();
      showToast("Instalação iniciada.");
    } else {
      openInstallSheet("A instalação não foi concluída. Você ainda pode instalar o aplicativo pelo menu do navegador.");
    }
  }

  function isStandalone() {
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  }

  function updateInstallUi() {
    const installed = isStandalone() || localStorage.getItem(keys.installed) === "true";
    elements.body.classList.toggle("app-installed", installed);
    elements.installStatus.textContent = installed ? "Aplicativo instalado" : "Aplicativo pronto para instalação";
  }

  function registerServiceWorker() {
    if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type !== "ELITE_AS_APP_UPDATED") return;
        const version = event.data.version || "latest";
        const reloadKey = `elite-as-reloaded-${version}`;
        if (sessionStorage.getItem(reloadKey) === "true") return;
        sessionStorage.setItem(reloadKey, "true");
        window.location.reload();
      });
      navigator.serviceWorker
        .register("./sw.js", { updateViaCache: "none" })
        .then((registration) => registration.update().catch(() => {}))
        .catch(() => showToast("Não foi possível ativar o modo offline neste acesso."));
    }
  }

  async function getPushVapidKey() {
    try {
      const base = state.apiBase || REMOTE_API_BASE;
      const res = await fetch(`${base}/push/vapid-public-key`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.publicKey || null;
    } catch (_error) {
      return null;
    }
  }

  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(base64);
    return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
  }

  async function registerPushSubscription() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission === "denied") return;
    try {
      const vapidKey = await getPushVapidKey();
      if (!vapidKey) return;
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      const subscription = existing || await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      });
      const base = state.apiBase || REMOTE_API_BASE;
      await fetch(`${base}/push/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${state.authToken}` },
        body: JSON.stringify(subscription.toJSON())
      });
    } catch (_error) {
      // suporte ou permissão indisponíveis — app continua normalmente
    }
  }

  async function requestPushPermission() {
    if (!("Notification" in window) || !("PushManager" in window)) return;
    if (Notification.permission !== "default") {
      if (Notification.permission === "granted") registerPushSubscription().catch(() => {});
      return;
    }
    // Mostra banner suave antes de pedir permissão do browser
    const banner = document.createElement("div");
    banner.id = "push-permission-banner";
    banner.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--color-surface,#1e1e2e);border-top:1px solid var(--color-border,#333);position:fixed;bottom:0;left:0;right:0;z-index:9999;box-shadow:0 -2px 12px rgba(0,0,0,.4);">
        <span style="font-size:1.4em">🔔</span>
        <span style="flex:1;font-size:.9em;color:var(--color-text,#e0e0e0)">Ativar notificações para receber avisos de treinos e mensagens?</span>
        <button id="push-allow-btn" style="background:var(--color-primary,#7c3aed);color:#fff;border:none;border-radius:6px;padding:8px 14px;cursor:pointer;font-size:.85em;white-space:nowrap">Ativar</button>
        <button id="push-deny-btn" style="background:transparent;color:var(--color-muted,#888);border:none;cursor:pointer;font-size:.85em;padding:8px">Agora não</button>
      </div>`;
    document.body.appendChild(banner);

    await new Promise((resolve) => {
      document.getElementById("push-allow-btn").onclick = () => { banner.remove(); resolve(true); };
      document.getElementById("push-deny-btn").onclick = () => { banner.remove(); resolve(false); };
      window.setTimeout(() => { if (document.body.contains(banner)) { banner.remove(); resolve(false); } }, 30000);
    }).then(async (accepted) => {
      if (!accepted) return;
      const permission = await Notification.requestPermission();
      if (permission === "granted") registerPushSubscription().catch(() => {});
    });
  }

  function schedulePushPermissionRequest() {
    if (!("Notification" in window) || !("PushManager" in window)) return;
    if (Notification.permission === "granted") {
      window.setTimeout(() => registerPushSubscription().catch(() => {}), 2000);
      return;
    }
    if (Notification.permission !== "default") return;
    // Pede após primeira interação significativa do usuário (mínimo 8 s após login)
    let fired = false;
    const fire = () => {
      if (fired) return;
      fired = true;
      document.removeEventListener("click", fire);
      window.setTimeout(() => requestPushPermission().catch(() => {}), 3000);
    };
    window.setTimeout(() => document.addEventListener("click", fire, { once: true }), 8000);
  }

  async function handleAppRefreshRequest() {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("refreshApp") && !params.has("resetPwa")) return false;

    try {
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.filter((name) => name.startsWith("personal-pro-pwa-")).map((name) => caches.delete(name)));
      }

      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }
    } catch (error) {
      console.warn("Não foi possível limpar completamente o cache do app.", error);
    }

    params.delete("refreshApp");
    params.delete("resetPwa");
    params.set("v", "53");
    const query = params.toString();
    window.location.replace(`${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
    return true;
  }

  function bindAgendaEvents() {
    document.addEventListener("click", (event) => {
      const target = event.target.closest("button, .day-cell, [data-close-modal], [data-close-install], [data-manager-drawer-backdrop]");
      if (!target) return;
      if (target.matches("[data-open-agenda-detail]")) openAgendaItemDetail(target.dataset.openAgendaDetail, target.dataset.agendaDate || "", target.dataset.agendaStudent || "");
      if (target.matches("[data-agenda-today]")) { state.agendaDate = todayISO(); renderApp(); }
      if (target.dataset.agendaShift) {
        const direction = Number(target.dataset.agendaShift);
        state.agendaDate = state.agendaView === "month" ? addMonths(state.agendaDate, direction) : addDays(state.agendaDate, direction * (state.agendaView === "week" ? 7 : 1));
        renderApp();
      }
      if (target.dataset.agendaView) { state.agendaView = target.dataset.agendaView; renderApp(); }
      if (target.dataset.selectDate) { state.agendaDate = target.dataset.selectDate; renderApp(); }
    });
    document.addEventListener("change", (event) => {
      const target = event.target;
      if (target.matches("[data-agenda-date]")) { state.agendaDate = target.value || todayISO(); renderApp(); }
      if (target.matches('#enviarLinkSheet [name="elDest"]')) _elUpdateLink();
    });
    document.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.target;
      if (form.id === "activityForm") handleActivityForm(form);
    });
  }

  function bindWorkoutEvents() {
    document.addEventListener("click", (event) => {
      const target = event.target.closest("button, .day-cell, [data-close-modal], [data-close-install], [data-close-workout-sheet], [data-close-ap-sheet], [data-manager-drawer-backdrop]");
      if (!target) return;
      if (target.matches("[data-close-workout-sheet]")) closeWorkoutSheet();
      if (target.matches("[data-close-ap-sheet]")) closeApplyPatternSheet();
      if (target.matches("[data-ap-adjust]")) { closeApplyPatternSheet(); openWorkoutForm(target.dataset.apAdjust); }
      if (target.matches("[data-toggle-workout-filter]")) { state.workoutFilterOpen = !state.workoutFilterOpen; renderManager(); }
      if (target.matches("[data-open-workout-form]")) openWorkoutForm(target.dataset.openWorkoutForm || "", target.dataset.prefillStudent || "");
      if (target.matches("[data-open-apply-pattern-form]")) openApplyPatternSheet(target.dataset.openApplyPatternForm);
      if (target.matches("[data-open-student-pattern-workout]")) openStudentPatternWorkoutForm(target.dataset.openStudentPatternWorkout);
      if (target.matches("[data-add-workout-row]")) {
        const container = document.getElementById("workoutRows");
        container.insertAdjacentHTML("beforeend", workoutRowTemplate(normalizeWorkoutExercise({ order: container.querySelectorAll("[data-workout-row]").length + 1, exerciseId: state.data.exercises.find((e) => e.status === "active")?.id || "" }), container.querySelectorAll("[data-workout-row]").length));
      }
      if (target.matches("[data-remove-workout-row]")) target.closest("[data-workout-row]")?.remove();
      if (target.matches("[data-duplicate-workout]")) duplicateWorkout(target.dataset.duplicateWorkout);
      if (target.matches("[data-publish-workout]")) publishWorkout(target.dataset.publishWorkout);
      if (target.matches("[data-archive-workout]")) archiveWorkout(target.dataset.archiveWorkout);
      if (target.matches("[data-restore-workout]")) restoreWorkout(target.dataset.restoreWorkout);
      if (target.matches("[data-delete-workout]")) deleteWorkout(target.dataset.deleteWorkout);
      if (target.matches("[data-start-workout]")) startWorkout(target.dataset.startWorkout, target.dataset.activityId || "");
      if (target.matches("[data-series-action]")) handleSeriesAction(target.dataset.seriesAction);
      if (target.matches("[data-skip-rest]")) { stopRest(); renderStudent(); showToast("Descanso pulado."); }
      if (target.matches("[data-finish-workout]")) finishWorkout();
      if (target.matches("[data-cancel-active-session]") && confirm("Cancelar treino em andamento?")) {
        state.activeSession = null;
        stopRest();
        persistActiveSession();
        renderStudent();
      }
    });
    document.addEventListener("input", (event) => {
      const target = event.target;
      if (target.matches("[data-workout-filter]")) { state.workoutFilters[target.dataset.workoutFilter] = target.value; renderManager(); }
    });
    document.addEventListener("change", (event) => {
      const target = event.target;
      if (target.matches("[data-workout-filter]")) { state.workoutFilters[target.dataset.workoutFilter] = target.value; state.workoutFilterOpen = true; renderManager(); }
      if (target.matches("[data-activity-student]")) {
        const workoutSelect = document.querySelector('#activityForm [name="workoutId"]');
        if (workoutSelect) workoutSelect.innerHTML = workoutOptions(target.value);
      }
    });
    document.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.target;
      if (form.id === "workoutForm") handleWorkoutForm(form);
      if (form.id === "applyPatternForm") handleApplyPatternSheetForm(form);
      if (form.id === "applyPatternSheetForm") handleApplyPatternSheetForm(form);
      if (form.id === "studentPatternWorkoutForm") handleStudentPatternWorkoutForm(form);
      if (form.id === "utForm") handleUtForm(form);
    });
  }

  function bindStudentEvents() {
    document.addEventListener("click", (event) => {
      const target = event.target.closest("button, .day-cell, [data-close-modal], [data-close-install], [data-close-el-sheet], [data-close-ag-sheet], [data-close-det-sheet], [data-manager-drawer-backdrop]");
      if (!target) return;
      if (target.matches("[data-manager-menu-toggle]")) openManagerDrawer();
      if (target.matches("[data-manager-drawer-backdrop]")) closeManagerDrawer();
      if (target.matches("[data-close-modal]")) closeModal();
      if (target.matches("[data-close-el-sheet]")) closeEnviarLinkSheet();
      if (target.matches("[data-close-ag-sheet]")) closeAgendarSheet();
      if (target.matches("[data-close-det-sheet]")) closeEventDetailSheet();
      if (target.matches("[data-det-edit]")) { closeEventDetailSheet(); openActivityForm(target.dataset.detEdit); }
      if (target.matches("[data-det-toggle]")) {
        const [detId, detStatus] = String(target.dataset.detToggle || "").split(":");
        const detActivity = state.data.activities.find((a) => a.id === detId);
        if (detActivity) {
          detActivity.status = detStatus;
          detActivity.updatedAt = new Date().toISOString();
          persistData();
          closeEventDetailSheet();
          renderApp();
          showToast(detStatus === "done" ? "Atividade concluída." : "Status atualizado.");
          import("./src/services.js").then(({ updateEvento }) => updateEvento(detId, { status: detStatus }).catch(() => {}));
        }
      }
      if (target.matches("[data-det-cancel]")) {
        if (!confirm("Cancelar este evento?")) return;
        const detActivity = state.data.activities.find((a) => a.id === target.dataset.detCancel);
        if (detActivity) {
          detActivity.status = "canceled";
          detActivity.updatedAt = new Date().toISOString();
          persistData();
          closeEventDetailSheet();
          renderApp();
          showToast("Evento cancelado.");
          import("./src/services.js").then(({ updateEvento }) => updateEvento(target.dataset.detCancel, { status: "canceled" }).catch(() => {}));
        }
      }
      if (target.matches("[data-det-open-profile]")) { closeEventDetailSheet(); openStudentProfile(target.dataset.detOpenProfile); }
      if (target.dataset.managerNav) {
        if (target.dataset.managerNav === "more") {
          openManagerDrawer();
          return;
        }
        if (target.dataset.managerNav !== "studentProfile") clearStudentProfileHash();
        state.managerMenu = target.dataset.managerNav;
        closeManagerDrawer();
        renderManager();
      }
      if (target.dataset.studentNav) { state.studentMenu = target.dataset.studentNav; renderStudent(); }
      if (target.matches("[data-open-student-form]")) openStudentForm(target.dataset.openStudentForm || "");
      if (target.matches("[data-open-student-profile]")) { closeModal(); openStudentProfile(target.dataset.openStudentProfile); }
      if (target.matches("[data-send-student-invite]")) sendStudentInvite(target.dataset.sendStudentInvite);
      if (target.matches("[data-open-send-link-sheet]")) openEnviarLinkSheet(target.dataset.openSendLinkSheet);
      if (target.matches("[data-el-copy]")) _elCopyLink();
      if (target.matches("[data-el-whatsapp]")) _elSendWhatsApp();
      if (target.matches("[data-el-email]")) _elSendEmail();
      if (target.matches("[data-el-regen]")) _elRegenLink();
      if (target.matches("[data-copy-invite-link]")) {
        const inviteInput = elements.modalBody.querySelector("[data-invite-url]");
        if (inviteInput) {
          inviteInput.select();
          navigator.clipboard?.writeText(inviteInput.value).catch(() => {});
          showToast("Link copiado.");
        }
      }
      if (target.matches("[data-profile-tab]")) {
        const newTab = target.dataset.profileTab;
        if (state.managerMenu === "studentProfile" && document.getElementById("profileTabBody")) {
          switchProfileTab(newTab);
        } else {
          state.profileTab = newTab;
          openStudentProfile(state.activeStudentProfileId, { updateHash: false });
        }
      }
      if (target.matches("[data-delete-student]")) deleteStudent(target.dataset.deleteStudent);
      if (target.matches("[data-open-activity-form]")) openActivityForm(target.dataset.openActivityForm || "", target.dataset.prefillStudent || "");
      if (target.matches("[data-ns-save-and-send]")) {
        const form = document.getElementById("newStudentForm");
        if (form) handleNewStudentForm(form, true);
      }
      if (target.matches("[data-toggle-meal-check]")) {
        const mealId = target.dataset.toggleMealCheck;
        const planId = target.dataset.planId;
        if (!mealId || !planId) return;
        if (!state.mealChecks[planId]) state.mealChecks[planId] = {};
        state.mealChecks[planId][mealId] = !state.mealChecks[planId][mealId];
        const isChecked = state.mealChecks[planId][mealId];
        const card = target.closest("[data-meal-id]");
        if (card) {
          card.classList.toggle("is-checked", isChecked);
          target.classList.toggle("is-checked", isChecked);
          target.setAttribute("aria-pressed", String(isChecked));
          target.setAttribute("aria-label", isChecked ? "Desmarcar refeição cumprida" : "Marcar refeição como cumprida");
          const planCard = card.closest(".student-diet-plan-card");
          if (planCard) {
            const checks = state.mealChecks[planId];
            const checkedCount = Object.values(checks).filter(Boolean).length;
            const totalMeals = planCard.querySelectorAll(".student-meal-card").length;
            const counter = planCard.querySelector(".sdpc-meta .small-text");
            if (counter) counter.textContent = `${checkedCount}/${totalMeals} refeições`;
          }
        }
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeManagerDrawer();
    });
    document.addEventListener("input", (event) => {
      const target = event.target;
      if (target.matches("[data-student-search]")) { state.search = target.value; renderManager(); }
      if (target.matches("[data-student-diet-q]")) { state.studentDietQ = target.value; renderStudent(); }
      if (target.matches("[data-phone-mask]")) {
        let v = target.value.replace(/\D/g, "").slice(0, 11);
        if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
        else if (v.length > 6) v = v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
        else if (v.length > 2) v = v.replace(/^(\d{2})(\d+)$/, "($1) $2");
        else if (v.length > 0) v = `(${v}`;
        target.value = v;
      }
    });
    document.addEventListener("change", (event) => {
      const target = event.target;
      if (target.matches("[data-student-filter]")) { state.studentFilters[target.dataset.studentFilter] = target.value; renderManager(); }
    });
    document.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.target;
      if (form.id === "newStudentForm") await handleNewStudentForm(form, false);
      if (form.id === "studentForm") await handleStudentForm(form);
      if (form.id === "settingsForm") handleSettingsForm(form);
    });
    window.addEventListener("hashchange", () => {
      if (applyRouteFromHash()) renderManager();
      else if (state.currentUser?.role === "manager" && state.managerMenu === "studentProfile") {
        state.managerMenu = "students";
        state.activeStudentProfileId = "";
        renderManager();
      }
    });
  }

  function bindExerciseEvents() {
    document.addEventListener("click", (event) => {
      const target = event.target.closest("button, .day-cell, [data-close-modal], [data-close-install], [data-manager-drawer-backdrop], [data-close-exercise-sheet], [data-close-video-modal], [data-close-ut-sheet], [data-close-ev-sheet]");
      if (!target) return;
      if (target.matches("[data-close-exercise-sheet]")) closeExerciseSheet();
      if (target.matches("[data-close-video-modal]")) closeVideoModal();
      if (target.matches("[data-close-ut-sheet]")) closeUsarTreinoSheet();
      if (target.matches("[data-close-ev-sheet]")) closeEnviarVideoSheet();
      if (target.matches("[data-open-exercise-form]")) openExerciseForm(target.dataset.openExerciseForm || "");
      if (target.matches("[data-open-exercise-video]")) openVideoModal(target.dataset.openExerciseVideo);
      if (target.matches("[data-use-exercise-workout]")) openUsarTreinoSheet(target.dataset.useExerciseWorkout);
      if (target.matches("[data-vm-usar-treino]")) openUsarTreinoSheet(target.dataset.vmUsarTreino);
      if (target.matches("[data-vm-editar]")) { closeVideoModal(); openExerciseForm(target.dataset.vmEditar); }
      if (target.matches("[data-vm-enviar-video]")) openEnviarVideoSheet(target.dataset.vmEnviarVideo);
      if (target.matches("[data-toggle-exercise-status]")) {
        const exercise = getExercise(target.dataset.toggleExerciseStatus);
        if (exercise) exercise.status = exercise.status === "active" ? "inactive" : "active";
        persistData();
        renderApp();
      }
      if (target.matches("[data-remove-exercise-video]")) removeExerciseVideo(target.dataset.removeExerciseVideo);
      if (target.matches("[data-delete-exercise]")) deleteExercise(target.dataset.deleteExercise);
    });
    document.addEventListener("input", (event) => {
      const target = event.target;
      if (target.matches("[data-exercise-filter]")) { state.exerciseFilters[target.dataset.exerciseFilter] = target.value; renderManager(); }
    });
    document.addEventListener("change", (event) => {
      const target = event.target;
      if (target.matches("[data-exercise-filter]")) { state.exerciseFilters[target.dataset.exerciseFilter] = target.value; renderManager(); }
    });
    document.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.target;
      if (form.id === "exerciseForm") {
        const action = event.submitter?.value || "publish";
        await handleExerciseForm(form, action);
      }
    });
  }

  function bindDietEvents() {
    document.addEventListener("click", (event) => {
      const target = event.target.closest("button, .day-cell, [data-close-modal], [data-close-install], [data-manager-drawer-backdrop], [data-mp-pick-food]");
      if (!target) return;
      if (target.matches("[data-open-diet-form]")) openMealPlanBuilder(target.dataset.openDietForm || "", target.dataset.prefillStudent || "");
      if (target.matches("[data-open-diet-detail]")) openDietPlanView(target.dataset.openDietDetail);
      if (target.matches("[data-close-meal-plan-sheet]")) closeMealPlanSheet();
      if (target.matches("[data-diet-pdf]")) {
        import("./src/services.js").then(({ gerarPdf }) =>
          gerarPdf(target.dataset.dietPdf).then(() => {
            showToast("Use a opção de salvar como PDF na impressão do navegador.");
            window.print();
          }).catch(() => showToast("Não foi possível gerar o PDF agora."))
        );
      }
      if (target.matches("[data-send-diet-link]")) sendDietPlanLink(target.dataset.sendDietLink);
      if (target.matches("[data-duplicate-diet]")) duplicateDietPlan(target.dataset.duplicateDiet);
      if (target.matches("[data-archive-diet]")) archiveDietPlan(target.dataset.archiveDiet);
      if (target.matches("[data-diet-show-all]")) { state.dietFilters = { q: "", status: "all", objective: "all" }; state.dietFilterOpen = false; renderManager(); }
      if (target.matches("[data-toggle-diet-filter]")) { state.dietFilterOpen = !state.dietFilterOpen; renderManager(); }
      if (target.matches("[data-mp-add-meal]")) {
        if (!_mpDraft) return;
        _mpSyncFromDom();
        _mpDraft.meals.push(_mpDefaultMeal(_mpDraft.meals.length));
        _mpRenderMeals();
        _mpUpdateTotals();
      }
      if (target.matches("[data-mp-remove-meal]")) {
        if (!_mpDraft) return;
        _mpSyncFromDom();
        if (_mpDraft.meals.length <= 1) return showToast("O plano precisa de pelo menos uma refeição.");
        _mpDraft.meals = _mpDraft.meals.filter((m) => m.id !== target.dataset.mpRemoveMeal);
        _mpRenderMeals();
        _mpUpdateTotals();
      }
      if (target.matches("[data-mp-duplicate-meal]")) {
        if (!_mpDraft) return;
        _mpSyncFromDom();
        const src = _mpDraft.meals.find((m) => m.id === target.dataset.mpDuplicateMeal);
        if (!src) return;
        const copy = { ...src, id: createId("meal"), name: `${src.name} (cópia)`, foodItems: src.foodItems.map((fi) => ({ ...fi, id: createId("fi") })) };
        const idx = _mpDraft.meals.indexOf(src);
        _mpDraft.meals.splice(idx + 1, 0, copy);
        _mpRenderMeals();
        _mpUpdateTotals();
      }
      if (target.matches("[data-mp-add-food]")) {
        const mealId = target.dataset.mpAddFood;
        if (!_mpDraft || !mealId) return;
        _mpSyncFromDom();
        openMpFoodSearch(mealId);
      }
      if (target.matches("[data-mp-remove-food]")) {
        if (!_mpDraft) return;
        _mpSyncFromDom();
        const mealId = target.dataset.mpMealRef;
        const meal = _mpDraft.meals.find((m) => m.id === mealId);
        if (!meal) return;
        meal.foodItems = meal.foodItems.filter((fi) => fi.id !== target.dataset.mpRemoveFood);
        const foodListEl = document.getElementById(`mpFoodList_${mealId}`);
        if (foodListEl) foodListEl.innerHTML = meal.foodItems.map((fi) => _mpFoodItemHtml(fi, mealId)).join("");
        const mealFootEl = document.querySelector(`[data-mp-meal-id="${CSS.escape(mealId)}"] .mp-meal-kcal-sum`);
        if (mealFootEl) {
          const mKcal = meal.foodItems.reduce((s, fi) => s + (Number(fi.kcal) || 0), 0);
          mealFootEl.textContent = mKcal > 0 ? `${mKcal} kcal` : "Sem alimentos";
        }
        _mpUpdateTotals();
      }
    });
    document.addEventListener("input", (event) => {
      const target = event.target;
      if (target.matches("[data-diet-filter]")) { state.dietFilters[target.dataset.dietFilter] = target.value; renderManager(); }
      if (!_mpDraft) return;
      if (target.matches("[data-mp-sync]")) {
        const mealEl = target.closest("[data-mp-meal-id]");
        const meal = mealEl ? _mpDraft.meals.find((m) => m.id === mealEl.dataset.mpMealId) : null;
        if (!meal) return;
        const key = target.dataset.mpSync;
        if (key === "name" || key === "time") { meal[key] = target.value; return; }
        const fiEl = target.closest("[data-mp-food-id]");
        const fi = fiEl ? meal.foodItems.find((f) => f.id === fiEl.dataset.mpFoodId) : null;
        if (!fi) return;
        if (key === "qty") { fi.qty = target.value; return; }
        if (key === "kcal") {
          fi.kcal = Number(target.value) || 0;
          const mealFootEl = mealEl?.querySelector(".mp-meal-kcal-sum");
          if (mealFootEl) {
            const mKcal = meal.foodItems.reduce((s, f) => s + (Number(f.kcal) || 0), 0);
            mealFootEl.textContent = mKcal > 0 ? `${mKcal} kcal` : "Sem alimentos";
          }
          _mpUpdateTotals();
        }
      }
      if (target.matches("[name='calories']") && target.form?.id === "mealPlanBuilderForm") _mpUpdateTotals();
    });
    document.addEventListener("change", (event) => {
      const target = event.target;
      if (target.matches("[data-diet-filter]")) { state.dietFilters[target.dataset.dietFilter] = target.value; renderManager(); }
    });
    document.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.target;
      if (form.id === "dietForm") handleDietForm(form);
      if (form.id === "mealPlanBuilderForm") handleMealPlanBuilderForm(form);
    });
  }

  function bindChatEvents() {
    document.addEventListener("click", (event) => {
      const target = event.target.closest("button, .day-cell, [data-close-modal], [data-close-install], [data-close-thread-sheet], [data-manager-drawer-backdrop]");
      if (!target) return;
      if (target.matches("[data-open-messages]")) openThreadSheet(target.dataset.openMessages);
      if (target.matches("[data-open-my-chat]")) { const sid = state.currentUser?.studentId || ""; if (sid) openThreadSheet(sid); }
      if (target.matches("[data-close-thread-sheet]")) closeThreadSheet();
      if (target.matches("[data-thread-attach]")) {
        const form = document.getElementById("threadForm");
        const sid = form?.dataset?.studentId || "";
        if (sid) openEnviarLinkSheet(sid);
      }
      if (target.matches("[data-quick-reply]")) {
        const text = target.dataset.quickReply || "";
        const input = document.querySelector("#threadForm .thread-input");
        if (input) { input.value = text; input.focus(); }
      }
      if (target.matches("[data-message-show-all]")) { state.messageFilters = { q: "", status: "all" }; renderManager(); }
      if (target.matches("[data-whatsapp-activity]")) openWhatsApp(target.dataset.whatsappActivity, target.dataset.whatsappStudent);
    });
    document.addEventListener("input", (event) => {
      const target = event.target;
      if (target.matches("[data-message-filter]")) {
        const key = target.dataset.messageFilter;
        const cursor = target.selectionStart;
        state.messageFilters[key] = target.value;
        if (state.managerMenu === "messages") {
          elements.managerContent.innerHTML = fixMojibake(renderManagerMessages());
          const restored = elements.managerContent.querySelector(`[data-message-filter="${key}"]`);
          if (restored) { restored.focus(); restored.setSelectionRange(cursor, cursor); }
          return;
        }
        renderManager();
        const restored = document.querySelector(`[data-message-filter="${key}"]`);
        if (restored) { restored.focus(); restored.setSelectionRange(cursor, cursor); }
      }
    });
    document.addEventListener("change", (event) => {
      const target = event.target;
      if (target.matches("[data-message-filter]")) {
        state.messageFilters[target.dataset.messageFilter] = target.value;
        if (state.managerMenu === "messages") {
          elements.managerContent.innerHTML = fixMojibake(renderManagerMessages());
          return;
        }
        renderManager();
      }
    });
    document.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.target;
      if (form.id === "messageForm" || form.id === "threadForm") handleMessageForm(form);
    });
  }

  function bindContractEvents() {
    document.addEventListener("click", (event) => {
      const target = event.target.closest("button, .day-cell, [data-close-modal], [data-close-install], [data-manager-drawer-backdrop]");
      if (!target) return;
      if (target.matches("[data-close-contract-form-sheet]")) closeContractFormSheet();
      if (target.matches("[data-close-contract-view-sheet]")) closeContractViewSheet();
      if (target.matches("[data-open-contract-form]")) openContractFormSheet(target.dataset.openContractForm, target.dataset.contractId || "");
      if (target.matches("[data-open-contract]")) openContractViewSheet(target.dataset.openContract);
      if (target.matches("[data-send-contract-link]")) sendContractLink(target.dataset.sendContractLink);
      if (target.matches("[data-contract-resend]")) sendContractLink(target.dataset.contractResend);
      if (target.matches("[data-contract-resend-inline]")) {
        const cid = target.dataset.contractResendInline;
        if (confirm("Reenviar o link do contrato para o aluno?")) {
          import("./src/services.js").then(({ reenviarAssinatura }) => reenviarAssinatura(cid).catch(() => {}));
          sendContractLink(cid);
        }
      }
      if (target.matches("[data-contract-pdf]")) {
        const cid = target.dataset.contractPdf;
        import("./src/services.js").then(({ gerarPdf }) =>
          gerarPdf(cid).then(() => {
            showToast("Use a opção de salvar como PDF na impressão do navegador.");
            window.print();
          }).catch(() => showToast("Não foi possível gerar o PDF agora."))
        );
      }
      if (target.matches("[data-contract-renew]")) renewContract(target.dataset.contractRenew);
      if (target.matches("[data-copy-contract-link]")) {
        const contractInput = elements.modalBody.querySelector("[data-contract-url]");
        if (contractInput) {
          contractInput.select();
          navigator.clipboard?.writeText(contractInput.value).catch(() => {});
          showToast("Link copiado.");
        }
      }
      if (target.matches("[data-sign-contract]")) {
        signContract(target.dataset.signContract)
          .then(() => closeContractViewSheet())
          .catch(() => showToast("Nao foi possivel assinar o contrato agora."));
      }
      if (target.matches("[data-cancel-contract]")) cancelContract(target.dataset.cancelContract);
      if (target.matches("[data-print-contract]")) {
        showToast("Use a opção de salvar como PDF na impressão do navegador.");
        window.print();
      }
    });
    document.addEventListener("change", (event) => {
      const target = event.target;
      if (target.matches("[data-contract-filter]")) { state.contractFilters[target.dataset.contractFilter] = target.value; state.contractFilterOpen = true; renderManager(); }
      if (target.matches("[data-contract-consent-check]")) {
        const contractId = target.dataset.contractConsentCheck;
        const signBtn = document.querySelector(`[data-sign-contract="${contractId}"]`);
        if (signBtn) {
          signBtn.disabled = !target.checked;
          if (target.checked) {
            signBtn.dataset.consentAt = new Date().toISOString();
          } else {
            delete signBtn.dataset.consentAt;
          }
        }
      }
    });
    document.addEventListener("toggle", (event) => {
      if (event.target.matches(".contracts-filter-details")) state.contractFilterOpen = event.target.open;
    }, true);
    document.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.target;
      if (form.id === "contractSheetForm") await handleContractForm(form);
      if (form.id === "contractStudentPickerForm") handleContractStudentPicker(form);
    });
  }

  function bindFinanceEvents() {
    document.addEventListener("click", (event) => {
      const target = event.target.closest("button, a, .day-cell, [data-close-modal], [data-close-install], [data-manager-drawer-backdrop], [data-close-payment-form-sheet], [data-close-payment-detail-sheet], [data-close-cobrar-sheet]");
      if (!target) return;
      if (target.matches("[data-open-payment-form]")) { closePaymentDetailSheet(); openPaymentForm(target.dataset.openPaymentForm || "", { recordId: target.dataset.paymentRecord || "" }); }
      if (target.matches("[data-open-payment-detail]")) openPaymentDetail(target.dataset.openPaymentDetail);
      if (target.matches("[data-open-payment-receipt]")) openPaymentReceipt(target.dataset.openPaymentReceipt);
      if (target.matches("[data-finance-charge]")) chargeFinanceRecord(target.dataset.financeCharge);
      if (target.matches("[data-open-cobrar-sheet]")) { closePaymentDetailSheet(); openCobrarSheet(target.dataset.openCobrarSheet); }
      if (target.matches("[data-close-payment-form-sheet]")) closePaymentFormSheet();
      if (target.matches("[data-close-payment-detail-sheet]")) closePaymentDetailSheet();
      if (target.matches("[data-close-cobrar-sheet]")) closeCobrarSheet();
      if (target.matches("[data-cobrar-wa]")) {
        const record = findFinanceRecord(target.dataset.cobrarWa);
        const student = getStudent(record?.studentId);
        const phone = sanitizePhone(student?.phone);
        const msg = document.getElementById("cobrarMsg")?.value || "";
        if (!phone) return showToast("Aluno sem telefone cadastrado.");
        import("./src/services.js").then(({ cobrar }) => cobrar(record.id, { canal: "whatsapp", mensagem: msg }).catch(() => {}));
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
        closeCobrarSheet();
        showSuccessToast("Cobrança registrada via WhatsApp.");
      }
      if (target.matches("[data-cobrar-email]")) {
        const record = findFinanceRecord(target.dataset.cobrarEmail);
        const student = getStudent(record?.studentId);
        const msg = document.getElementById("cobrarMsg")?.value || "";
        if (!student?.email) return showToast("Aluno sem e-mail cadastrado.");
        import("./src/services.js").then(({ cobrar }) => cobrar(record.id, { canal: "email", mensagem: msg }).catch(() => {}));
        window.location.href = `mailto:${encodeURIComponent(student.email)}?subject=${encodeURIComponent("Mensalidade Elite AS")}&body=${encodeURIComponent(msg)}`;
        closeCobrarSheet();
        showSuccessToast("Cobrança registrada por e-mail.");
      }
      if (target.matches("[data-share-receipt]")) {
        const shareRecord = findFinanceRecord(target.dataset.shareReceipt);
        if (!shareRecord) return;
        const shareText = [
          "Recibo Elite AS",
          `Aluno: ${getStudentName(shareRecord.studentId)}`,
          `Plano: ${shareRecord.plan || "Plano Elite AS"}`,
          `Valor: ${currencyExact(shareRecord.amount)}`,
          `Mês: ${financeMonthLabel(shareRecord.referenceMonth)}`,
          `Pago em: ${shareRecord.paidAt ? formatShortDate(shareRecord.paidAt.slice(0, 10)) : "—"}`,
          `Forma: ${shareRecord.paymentMethod || "—"}`,
          `Código: ${shareRecord.receiptCode || shareRecord.id}`
        ].join("\n");
        if (navigator.share) {
          navigator.share({ title: "Recibo de pagamento", text: shareText }).catch(() => {});
        } else {
          navigator.clipboard?.writeText(shareText)
            .then(() => showSuccessToast("Recibo copiado para a área de transferência."))
            .catch(() => showToast("Copie o texto do recibo manualmente."));
        }
        return;
      }
      if (target.matches("[data-finance-show-all]")) { state.financeFilters.q = ""; state.financeFilters.status = "all"; state.financeFilterOpen = false; renderManager(); }
      if (target.matches("[data-toggle-finance-filter]")) { state.financeFilterOpen = !state.financeFilterOpen; renderManager(); }
      if (target.dataset.financeMonthShift) {
        state.financeFilters.month = Number(target.dataset.financeMonthShift) > 0 ? financeNextMonth(state.financeFilters.month) : financePreviousMonth(state.financeFilters.month);
        renderManager();
      }
    });
    document.addEventListener("input", (event) => {
      const target = event.target;
      if (target.matches("[data-finance-filter]")) { state.financeFilters[target.dataset.financeFilter] = target.value; renderManager(); }
    });
    document.addEventListener("change", (event) => {
      const target = event.target;
      if (target.matches("[data-finance-filter]")) { state.financeFilters[target.dataset.financeFilter] = target.value; state.financeFilterOpen = true; renderManager(); }
    });
    document.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.target;
      if (form.id === "paymentForm") handlePaymentForm(form);
      if (form.id === "paymentFormSheetForm") await handlePaymentFormSheet(form);
    });
  }

  function bindUpdateEvents() {
    document.addEventListener("click", (event) => {
      const target = event.target.closest("button, .day-cell, [data-close-modal], [data-close-install], [data-manager-drawer-backdrop]");
      if (!target) return;
      if (target.matches("[data-open-update-form]")) openUpdateForm(target.dataset.openUpdateForm);
      if (target.matches("[data-open-update-comment]")) openUpdateComment(target.dataset.openUpdateComment);
      if (target.matches("[data-mark-update-viewed]")) markUpdateViewed(target.dataset.markUpdateViewed);
      if (target.matches("[data-back-to-updates]")) { state.managerMenu = "updates"; renderApp(); }
      if (target.matches("[data-zoom-photo]")) {
        const src = target.dataset.zoomPhoto;
        const label = target.dataset.photoLabel || "";
        openModal(label, `<img src="${escapeHtml(src)}" alt="${escapeHtml(label)}" style="width:100%;border-radius:0.75rem;display:block;" />`);
      }
      if (target.matches("[data-compare-toggle]")) {
        const compareRow = document.querySelector(".is-compare-row");
        const btn = document.querySelector("[data-compare-toggle]");
        if (compareRow) {
          compareRow.hidden = !compareRow.hidden;
          if (btn) btn.classList.toggle("is-active", !compareRow.hidden);
        }
      }
      if (target.matches("[data-insert-suggestion]")) {
        const textarea = document.getElementById("evaluateCommentArea");
        if (textarea) {
          const chip = target.dataset.insertSuggestion;
          const cur = textarea.value.trim();
          textarea.value = cur ? `${cur} ${chip}` : chip;
          textarea.focus();
        }
      }
      if (target.matches("[data-set-rating]")) {
        const rating = Number(target.dataset.setRating);
        const input = document.getElementById("evaluateRatingInput");
        if (input) input.value = rating;
        document.querySelectorAll(".evaluate-star").forEach((star, i) => star.classList.toggle("is-active", i < rating));
      }
      if (target.matches("[data-save-evaluation]")) handleEvaluateSave(target.dataset.saveEvaluation, false);
      if (target.matches("[data-send-feedback]")) handleEvaluateSave(target.dataset.sendFeedback, true);
      if (target.matches("[data-quick-action]")) {
        const studentId = target.dataset.studentId;
        if (target.dataset.quickAction === "workout") {
          state.activeStudentProfileId = studentId;
          state.managerMenu = "studentProfile";
          state.profileTab = "workouts";
        } else if (target.dataset.quickAction === "diet") {
          state.managerMenu = "diet";
        }
        renderApp();
      }
      if (target.matches("[data-open-local-video]")) openLocalVideo(target.dataset.openLocalVideo);
      if (target.matches("[data-delete-activity]")) deleteActivity(target.dataset.deleteActivity);
      if (target.matches("[data-update-activity-status]")) {
        const [id, status] = String(target.dataset.updateActivityStatus || "").split(":");
        updateActivityStatus(id, status);
      }
    });
    document.addEventListener("change", (event) => {
      const target = event.target;
      if (target.matches("[data-update-filter]")) { state.updateFilters[target.dataset.updateFilter] = target.value; renderManager(); }
    });
    document.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.target;
      if (form.id === "updateForm") await handleUpdateForm(form);
      if (form.id === "updateCommentForm") handleUpdateComment(form);
    });
  }

  function bindPwaEvents() {
    document.addEventListener("click", (event) => {
      const target = event.target.closest("button, .day-cell, [data-close-modal], [data-close-install], [data-manager-drawer-backdrop]");
      if (!target) return;
      if (target.matches("[data-install-trigger]")) requestInstall();
      if (target.matches("[data-close-install]")) closeInstallSheet();
    });
    elements.retryInstall.addEventListener("click", requestInstall);
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      state.deferredPrompt = event;
      updateInstallUi();
    });
    window.addEventListener("appinstalled", () => {
      localStorage.setItem(keys.installed, "true");
      state.deferredPrompt = null;
      closeInstallSheet();
      updateInstallUi();
    });
  }

  function bindAuthEvents() {
    document.addEventListener("click", (event) => {
      const target = event.target.closest("button, .day-cell, [data-close-modal], [data-close-install], [data-manager-drawer-backdrop]");
      if (!target) return;
      if (target.matches("[data-logout]")) logout();
      if (target.matches("[data-clear-demo-data]") && confirm("Limpar todos os dados locais deste app?")) clearDemoData().catch(() => showToast("Nao foi possivel recarregar os dados."));
    });
    elements.loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const remember = Boolean(elements.rememberMe?.checked);
      setRememberSession(remember);
      try {
        const user = await authenticateUser(elements.email.value, elements.password.value);
      if (!user) return showToast(getLoginAccessMessage(elements.email.value) || "E-mail ou senha inválidos.");
      state.currentUser = user;
      setStoredUserSession(user, remember);
      elements.password.value = "";
      showView(user.role === "manager" ? "manager" : "student");
      await connectRealtime();
      syncRealtimeRoom();
      applyRouteFromHash();
      renderApp();
      openPendingContractAfterLogin();
      showToast(user.role === "manager" ? "Painel do gestor aberto." : "área do aluno aberta.");
      schedulePushPermissionRequest();
      } catch (error) {
        showToast(error.message || getLoginAccessMessage(elements.email.value) || "E-mail ou senha inválidos.");
      }
    });
    elements.fillAdminDemo.addEventListener("click", () => {
      elements.email.value = ADMIN.email;
      elements.password.value = "Admin@2026";
      elements.password.focus();
    });
    elements.forgotPassword.addEventListener("click", requestPasswordReset);
    document.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.target;
      if (form.id === "resetPasswordForm") await handleResetPasswordForm(form);
    });
  }

  function bindRelatorioEvents() {
    document.addEventListener("click", (event) => {
      const target = event.target.closest("button, [data-relatorio-period], [data-exportar-relatorio]");
      if (!target) return;
      if (target.dataset.relatorioPeriod) {
        state.relatorioFilters.period = target.dataset.relatorioPeriod;
        renderManager();
      }
      if (target.matches("[data-exportar-relatorio]")) exportarRelatorio();
    });
  }

  function bindEvents() {
    bindAgendaEvents();
    bindWorkoutEvents();
    bindStudentEvents();
    bindExerciseEvents();
    bindDietEvents();
    bindChatEvents();
    bindContractEvents();
    bindFinanceEvents();
    bindUpdateEvents();
    bindRelatorioEvents();
    bindPwaEvents();
    bindAuthEvents();
    window.addEventListener("online", () => {
      if (state.offlinePending && state.authToken) scheduleRemoteSync(1500);
      renderOfflineBanner();
    });
    window.addEventListener("offline", () => renderOfflineBanner());
  }

  function duplicateWorkout(id) {
    const workout = getWorkout(id);
    if (!workout) return;
    const isPattern = isWorkoutPattern(workout);
    state.data.workouts.unshift(
      normalizeWorkout({
        ...workout,
        id: createId("workout"),
        title: `${workout.title} (cópia)`,
        status: "draft",
        publishedAt: "",
        sourcePatternId: isPattern ? "" : workout.sourcePatternId,
        sourcePatternTitle: isPattern ? "" : workout.sourcePatternTitle,
        appliedAt: isPattern ? "" : workout.appliedAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        exercises: cloneWorkoutExercises(workout.exercises)
      })
    );
    persistData();
    renderApp();
    showToast(isPattern ? "Padrão duplicado como rascunho." : "Treino duplicado como rascunho.");
  }

  function publishWorkout(id) {
    const workout = getWorkout(id);
    if (!workout || isWorkoutPattern(workout)) return showToast("Treino indisponível.");
    if (!workout.exercises.length) return showToast("Adicione pelo menos um exercício antes de publicar.");
    workout.status = "published";
    workout.publishedAt = workout.publishedAt || new Date().toISOString();
    workout.updatedAt = new Date().toISOString();
    persistData();
    renderApp();
    showSuccessToast("Treino publicado para o aluno.");
  }

  function archiveWorkout(id) {
    const workout = getWorkout(id);
    if (!workout) return;
    workout.status = "archived";
    workout.updatedAt = new Date().toISOString();
    persistData();
    renderApp();
    showToast(isWorkoutPattern(workout) ? "Padrão arquivado." : "Treino arquivado.");
  }

  function restoreWorkout(id) {
    const workout = getWorkout(id);
    if (!workout) return;
    workout.status = "draft";
    workout.updatedAt = new Date().toISOString();
    persistData();
    renderApp();
    showToast(isWorkoutPattern(workout) ? "Padrão reativado como rascunho." : "Treino reativado como rascunho.");
  }

  function deleteWorkout(id) {
    const workout = getWorkout(id);
    if (!workout) return;
    const isPattern = isWorkoutPattern(workout);
    const hasHistory = state.data.sessions.some((session) => session.workoutId === id);
    const hasStudentCopies = state.data.workouts.some((item) => item.sourcePatternId === id);
    if (hasHistory || hasStudentCopies) return showToast(isPattern ? "Este padrão já tem vínculo com treino de aluno. Arquive em vez de remover." : "Este treino possui histórico. Arquive em vez de remover.");
    if (!confirm(isPattern ? "Remover este padrão?" : "Remover este treino?")) return;
    state.data.workouts = state.data.workouts.filter((workout) => workout.id !== id);
    persistData();
    renderApp();
    showToast(isPattern ? "Padrão removido." : "Treino removido.");
  }

  function deleteExercise(id) {
    const exercise = getExercise(id);
    if (!exercise) return;
    if (isExerciseUsed(id)) {
      exercise.status = "inactive";
      persistData();
      renderApp();
      showToast("Exercício usado em treinos/histórico. Ele foi inativado em vez de excluído.");
      return;
    }
    if (!confirm("Excluir este exercício definitivamente?")) return;
    state.data.exercises = state.data.exercises.filter((item) => item.id !== id);
    persistData();
    renderApp();
    showToast("Exercício excluído.");
  }

  function removeExerciseVideo(id) {
    const exercise = getExercise(id);
    if (!exercise || !hasExerciseVideo(exercise)) return showToast("Este exercício não tem vídeo cadastrado.");
    if (!confirm("Remover o vídeo deste exercício?")) return;
    exercise.videoUrl = "";
    exercise.videoStorage = "";
    exercise.videoKey = "";
    exercise.videoName = "";
    exercise.videoSize = 0;
    exercise.videoUploadedAt = "";
    exercise.updatedAt = new Date().toISOString();
    persistData();
    if (elements.exerciseSheet && !elements.exerciseSheet.hidden) {
      openExerciseForm(id);
    } else {
      renderApp();
    }
    showToast("Vídeo removido do exercício.");
  }

  function deleteStudent(id) {
    if (!confirm("Remover aluno e dados vinculados?")) return;
    state.data.students = state.data.students.filter((student) => student.id !== id);
    state.data.workouts = state.data.workouts.filter((workout) => workout.studentId !== id);
    state.data.activities = state.data.activities.filter((activity) => activity.studentId !== id);
    state.data.sessions = state.data.sessions.filter((session) => session.studentId !== id);
    state.data.updates = state.data.updates.filter((update) => update.studentId !== id);
    state.data.contracts = state.data.contracts.filter((contract) => contract.studentId !== id);
    state.data.messages = state.data.messages.filter((message) => message.studentId !== id);
    persistData();
    renderApp();
  }

  function deleteActivity(id) {
    if (!confirm("Remover este item da agenda?")) return;
    state.data.activities = state.data.activities.filter((activity) => activity.id !== id);
    persistData();
    renderApp();
  }

  function updateActivityStatus(id, status) {
    const allowed = ["scheduled", "pending", "done", "sent", "missed", "canceled"];
    if (!allowed.includes(status)) return;
    const activity = state.data.activities.find((item) => item.id === id);
    if (!activity) return showToast("Atividade não encontrada.");
    if ((status === "canceled" || status === "missed") && !confirm(status === "canceled" ? "Cancelar esta atividade?" : "Marcar como não realizada?")) return;
    activity.status = status;
    activity.updatedAt = new Date().toISOString();
    persistData();
    closeModal();
    renderApp();
    showToast(status === "done" ? "Atividade concluída." : status === "canceled" ? "Atividade cancelada." : "Status da atividade atualizado.");
  }

  async function getContractSignatureMeta(contract) {
    try {
      return await fetchJsonFromApi("/auth/contract-signature-meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId: contract.id,
          studentId: contract.studentId
        }),
        timeoutMs: 5000
      });
    } catch (error) {
      return {};
    }
  }

  async function signContract(id) {
    const contract = state.data.contracts.find((item) => item.id === id);
    if (!contract || state.currentUser?.role !== "student" || contract.studentId !== state.currentUser.studentId) return showToast("Contrato indisponível.");
    const signBtn = document.querySelector(`[data-sign-contract="${id}"]`);
    const consentAt = signBtn?.dataset.consentAt || null;
    if (!consentAt) return showToast("Confirme que leu o contrato antes de assinar.");
    const meta = await getContractSignatureMeta(contract);
    contract.status = "signed";
    contract.signedAt = new Date().toISOString();
    contract.signedVersion = contract.version;
    contract.technicalId = technicalId();
    contract.signatureIp = meta.ip || "";
    contract.signatureUserAgent = meta.userAgent || navigator.userAgent || "";
    contract.signatureMeta = JSON.stringify({
      source: "internal_app_acceptance",
      consentCheckboxAt: consentAt,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      language: navigator.language || "",
      backendMeta: meta || {}
    });
    persistData();
    closeModal();
    renderApp();
    showSuccessToast("Contrato assinado digitalmente.");
  }

  function cancelContract(id) {
    const contract = state.data.contracts.find((item) => item.id === id);
    if (!contract || contract.status === "signed") return showToast("Contrato não pode ser cancelado.");
    if (!confirm("Cancelar este contrato?")) return;
    contract.status = "canceled";
    contract.canceledAt = new Date().toISOString();
    persistData();
    renderApp();
    openStudentProfile(contract.studentId);
    showToast("Contrato cancelado.");
  }

  async function openLocalVideo(exerciseId) {
    const exercise = getExercise(exerciseId);
    if (!exercise?.videoKey) return showToast("Vídeo local não encontrado.");
    try {
      const blob = await readLocalVideo(exercise.videoKey);
      if (!blob) return showToast("Vídeo local não encontrado neste aparelho.");
      if (state.videoObjectUrls[exerciseId]) URL.revokeObjectURL(state.videoObjectUrls[exerciseId]);
      const url = URL.createObjectURL(blob);
      state.videoObjectUrls[exerciseId] = url;
      openModal(
        exercise.name,
        `
          <div class="content-stack">
            <video class="exercise-video" src="${url}" controls playsinline></video>
            <p class="small-text">Este vídeo está salvo somente neste navegador. Ao hospedar com backend Hostinger, os vídeos enviados ficam disponíveis entre aparelhos.</p>
          </div>
        `
      );
    } catch (error) {
      showToast("Não foi possível abrir o vídeo local.");
    }
  }

  function openWhatsApp(activityId, studentId) {
    const url = buildWhatsAppUrl(activityId, studentId);
    if (!url) return showToast("Este aluno não possui telefone cadastrado.");
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function markUpdateViewed(id) {
    const update = state.data.updates.find((item) => item.id === id);
    if (!update || update.status === "pending") return;
    update.status = "viewed";
    update.viewedAt = new Date().toISOString();
    ensureUpdateActivity(update);
    persistData();
    renderApp();
  }

  async function clearDemoData() {
    Object.values(keys).forEach((key) => {
      if (key !== keys.installed) localStorage.removeItem(key);
    });
    stopRest();
    state.currentUser = null;
    clearStoredAuth();
    await loadData();
    showView("login");
    showToast("Dados locais removidos.");
  }

  function logout() {
    state.currentUser = null;
    clearStoredAuth();
    if (state.socket) {
      state.socket.disconnect();
      state.socket = null;
      state.socketReady = false;
    }
    state.managerMenu = "home";
    state.activeStudentProfileId = "";
    clearStudentProfileHash();
    if (elements.password) elements.password.value = "";
    showView("login");
  }

  async function resumeStoredSession() {
    const user = getStoredUserSession();
    if (!user) {
      if (state.authToken) setAuthToken("");
      return false;
    }
    state.currentUser = user;
    showView(user.role === "manager" ? "manager" : "student");
    await connectRealtime();
    syncRealtimeRoom();
    applyRouteFromHash();
    renderApp();
    openPendingContractAfterLogin();
    schedulePushPermissionRequest();
    return true;
  }

  async function boot() {
    try {
      if (await handleAppRefreshRequest()) return;
      document.body.classList.toggle("demo-mode", new URLSearchParams(window.location.search).has("demo"));
      // Verificação síncrona: oculta login imediatamente se há sessão salva, evitando flash
      const preCheck = getStoredUserSession();
      if (preCheck) {
        elements.loginView.hidden = true;
      }
      await loadData();
      bindEvents();
      updateInstallUi();
      setRememberSession(state.rememberSession);
      const resumedSession = await resumeStoredSession();
      if (!resumedSession) showView("login");
      handleIncomingPasswordResetLink();
      handleIncomingContractLink();
      registerServiceWorker();
      connectRealtime();
    } catch (error) {
      console.error("Elite AS boot error", error);
      showToast("O app carregou em modo de recuperação. Recarregue a página se necessário.");
    } finally {
      window.setTimeout(() => document.body.classList.add("app-ready"), 380);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

