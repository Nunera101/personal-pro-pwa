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
    agendaDate: todayISO(),
    agendaView: "day",
    search: "",
    studentFilters: { status: "all", goal: "all", contract: "all" },
    exerciseFilters: { q: "", muscle: "", equipment: "", status: "active", video: "all" },
    workoutFilters: { q: "", status: "all", goal: "all", level: "all" },
    updateFilters: { studentId: "", status: "all", period: "all", date: "" },
    contractFilters: { status: "all", studentId: "", plan: "all" },
    messageFilters: { q: "", status: "all" },
    financeFilters: { q: "", status: "all", month: todayISO().slice(0, 7) },
    dietFilters: { q: "", status: "all", objective: "all" },
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
    lastSyncAt: "",
    socket: null,
    socketReady: false,
    pendingContractToken: "",
    videoObjectUrls: {},
    deferredPrompt: null,
    toastTimer: null,
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
    installSteps: document.getElementById("installSteps"),
    retryInstall: document.getElementById("retryInstall"),
    toast: document.getElementById("toast")
  };

  const icons = {
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z"/></svg>',
    students: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 11a4 4 0 1 0-8 0M4 21a8 8 0 0 1 16 0"/></svg>',
    agenda: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v4M17 3v4M4 8h16M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/></svg>',
    workouts: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12"/></svg>',
    library: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19.5V5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-1.5ZM8 7h7M8 11h5"/></svg>',
    updates: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4zM8 9h8M8 13h5M18 17l3 3"/></svg>',
    progress: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V5M4 19h16M8 16v-5M13 16V8M18 16v-9"/></svg>',
    settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2 2-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-3v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-2-2 .1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4v-3h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2-2 .1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3h3v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 2 2-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v3h-.2a1.7 1.7 0 0 0-1.6 1Z"/></svg>',
    today: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>',
    profile: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0"/></svg>',
    messages: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H7l-3 3zM8 9h8M8 13h5"/></svg>',
    contracts: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l4 4v14H7zM14 3v5h4M9 13h6M9 17h6"/></svg>',
    finance: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16v12H4zM4 10h16M17 15h1M7 7V5h10v2"/></svg>',
    diet: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3v8M5 3v8M11 3v8M5 11h6l-1 10H6zM16 4c3 1 4 4 3 7-1 4-5 5-7 3 0-4 1-8 4-10Z"/></svg>',
    more: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM19 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/></svg>',
    logout: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>'
  };

  const MUSCLE_GROUPS = [
    "Peito",
    "Costas",
    "Ombros",
    "BÃ­ceps",
    "TrÃ­ceps",
    "QuadrÃ­ceps",
    "Posterior de coxa",
    "GlÃºteos",
    "Panturrilhas",
    "AbdÃ´men",
    "Core",
    "Lombar",
    "Cardio",
    "Mobilidade",
    "Corpo todo"
  ];

  const WORKOUT_LEVELS = [
    { value: "", label: "NÃ£o definido" },
    { value: "beginner", label: "Iniciante" },
    { value: "intermediate", label: "IntermediÃ¡rio" },
    { value: "advanced", label: "AvanÃ§ado" }
  ];

  const managerMenus = [
    { id: "home", label: "Dashboard", icon: icons.home, group: "VisÃ£o geral" },
    { id: "students", label: "Alunos", icon: icons.students, group: "OperaÃ§Ã£o" },
    { id: "agenda", label: "Agenda", icon: icons.agenda, group: "OperaÃ§Ã£o" },
    { id: "library", label: "Biblioteca de exercÃ­cios", icon: icons.library, group: "Treinos" },
    { id: "workouts", label: "PadrÃµes de treino", icon: icons.workouts, group: "Treinos" },
    { id: "updates", label: "AtualizaÃ§Ãµes", icon: icons.updates, group: "Acompanhamento" },
    { id: "diet", label: "Dieta", icon: icons.diet, group: "Acompanhamento" },
    { id: "messages", label: "Mensagens", icon: icons.messages, group: "Relacionamento" },
    { id: "contracts", label: "Contratos", icon: icons.contracts, group: "Relacionamento" },
    { id: "finance", label: "Financeiro", icon: icons.finance, group: "Relacionamento" },
    { id: "settings", label: "ConfiguraÃ§Ãµes", icon: icons.settings, group: "Sistema" }
  ];

  const managerBottomMenus = [
    { id: "home", label: "Dashboard", icon: icons.home },
    { id: "students", label: "Alunos", icon: icons.students },
    { id: "agenda", label: "Agenda", icon: icons.agenda },
    { id: "workouts", label: "PadrÃµes", icon: icons.workouts },
    { id: "more", label: "Mais", icon: icons.more }
  ];

  const studentMenus = [
    { id: "today", label: "Hoje", icon: icons.today },
    { id: "workouts", label: "Treinos", icon: icons.workouts },
    { id: "agenda", label: "Agenda", icon: icons.agenda },
    { id: "progress", label: "EvoluÃ§Ã£o", icon: icons.progress },
    { id: "updates", label: "AtualizaÃ§Ãµes", icon: icons.updates },
    { id: "profile", label: "Perfil", icon: icons.profile }
  ];

  const studentBottomMenus = [
    { id: "today", label: "Hoje", icon: icons.today },
    { id: "workouts", label: "Treinos", icon: icons.workouts },
    { id: "agenda", label: "Agenda", icon: icons.agenda },
    { id: "progress", label: "EvoluÃ§Ã£o", icon: icons.progress },
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
    try {
      const snapshot = currentDataSnapshot();
      await Promise.all(collectionMap.map(([name, key]) => writeRemoteCollection(key, snapshot[name])));
      state.lastSyncAt = new Date().toISOString();
    } catch (error) {
      state.apiAvailable = false;
      console.warn("Sincronizacao remota indisponivel. Mantendo fallback local.", error);
    } finally {
      state.syncInFlight = false;
      if (state.syncAgain) {
        state.syncAgain = false;
        scheduleRemoteSync(250);
      }
    }
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
    ["\u00c2\u20ac\u00a2", "â€¢"],
    ["\u00e2\u20ac\u00a2", "â€¢"],
    ["\u00c2\u00b7", "Â·"],
    ["\u00e2\u20ac\u201c", "-"],
    ["\u00e2\u20ac\u201d", "-"],
    ["\u00e2\u20ac\u00a6", "..."],
    ["\u00e2\u20ac\u02dc", "'"],
    ["\u00e2\u20ac\u2122", "'"],
    ["\u00e2\u20ac\u0153", "\""],
    ["\u00e2\u20ac\u009d", "\""],
    ["\u00c3\u0087", "Ã‡"],
    ["\u00c3\u00a7", "Ã§"],
    ["\u00c3\u0083", "Ãƒ"],
    ["\u00c3\u00a3", "Ã£"],
    ["\u00c3\u0095", "Ã•"],
    ["\u00c3\u00b5", "Ãµ"],
    ["\u00c3\u0081", "Ã"],
    ["\u00c3\u00a1", "Ã¡"],
    ["\u00c3\u0089", "Ã‰"],
    ["\u00c3\u00a9", "Ã©"],
    ["\u00c3\u008a", "ÃŠ"],
    ["\u00c3\u00aa", "Ãª"],
    ["\u00c3\u008d", "Ã"],
    ["\u00c3\u00ad", "Ã­"],
    ["\u00c3\u0093", "Ã“"],
    ["\u00c3\u00b3", "Ã³"],
    ["\u00c3\u0094", "Ã”"],
    ["\u00c3\u00b4", "Ã´"],
    ["\u00c3\u009a", "Ãš"],
    ["\u00c3\u00ba", "Ãº"],
    ["\u00c3\u0082", "Ã‚"],
    ["\u00c3\u00a2", "Ã¢"]
  ];

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
        label: "Aguardando ativacao",
        tone: "warning",
        detail: "Aluno ainda nao criou a senha"
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

  function workoutLevelLabel(level = "") {
    return WORKOUT_LEVELS.find((item) => item.value === level)?.label || "NÃ£o definido";
  }

  function workoutLevelOptions(selected = "") {
    return WORKOUT_LEVELS.map((item) => `<option value="${escapeHtml(item.value)}" ${selected === item.value ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("");
  }

  function workoutStatusOptions(selected = "draft", isPattern = false) {
    const options = [
      { value: "draft", label: "Rascunho" },
      { value: "published", label: isPattern ? "DisponÃ­vel" : "Publicado" },
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
      name: exercise.name || "ExercÃ­cio",
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
      title: contract.title || "Contrato de prestaÃ§Ã£o de serviÃ§o",
      body: contract.body || "",
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

  function normalizeDietMeal(meal = {}, index = 0) {
    return {
      id: meal.id || createId("meal"),
      name: meal.name || `RefeiÃ§Ã£o ${index + 1}`,
      time: meal.time || "",
      items: meal.items || "",
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
        "OlÃ¡, {aluno}! Passando para lembrar da atividade {atividade}, marcada para {data} Ã s {hora}.",
      contractEmailSubject: settings.contractEmailSubject || "Contrato para aceite - Elite AS",
      contractEmailMessage:
        settings.contractEmailMessage ||
        "OlÃ¡, {aluno}. Seu contrato com {personal} estÃ¡ pronto para aceite interno. Acesse: {link_contrato}",
      contractEmailSignature: settings.contractEmailSignature || "Equipe Elite AS",
      contractTemplate:
        settings.contractTemplate ||
        "CONTRATO DE PRESTAÃ‡ÃƒO DE SERVIÃ‡OS\n\nAluno: {aluno}\nCPF: {cpf}\nTelefone: {telefone}\nE-mail: {email}\nPersonal: {personal}\nPlano: {plano}\nValor: {valor}\nInÃ­cio: {data_inicio}\nFim: {data_fim}\nQuantidade de aulas: {quantidade_aulas}\n\nDeclaro estar ciente das condiÃ§Ãµes de acompanhamento, treinos, comunicaÃ§Ã£o e orientaÃ§Ãµes definidas pelo personal.\n\nData de aceite: {data_assinatura}"
    };
  }

  function seedExercises() {
    return [
      normalizeExercise({
        name: "Agachamento livre",
        muscle: "Pernas",
        equipment: "Barra",
        description: "DesÃ§a mantendo tronco firme, joelhos alinhados e pÃ©s apoiados.",
        technicalNotes: "Evitar colapsar joelhos para dentro.",
        videoUrl: "",
        videoStorage: "",
        status: "active"
      }),
      normalizeExercise({
        name: "Supino reto",
        muscle: "Peito",
        equipment: "Banco e barra",
        description: "Controle a descida atÃ© a linha do peito e empurre sem perder escÃ¡pulas.",
        technicalNotes: "Manter punhos neutros e pÃ©s firmes.",
        videoUrl: "",
        videoStorage: "",
        status: "active"
      }),
      normalizeExercise({
        name: "Remada baixa",
        muscle: "Costas",
        equipment: "MÃ¡quina",
        description: "Puxe o cabo em direÃ§Ã£o ao abdÃ´men mantendo coluna neutra.",
        technicalNotes: "NÃ£o compensar com balanÃ§o do tronco.",
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
    if (!patterns.length) return '<option value="">Crie um padrÃ£o primeiro</option>';
    return patterns
      .map((workout) => `<option value="${escapeHtml(workout.id)}" ${workout.id === selected ? "selected" : ""}>${escapeHtml(workout.title)} Â· ${escapeHtml(workout.focus || "Sem foco")}</option>`)
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
      title: "Contrato de prestaÃ§Ã£o de serviÃ§o",
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
          note: "ProjeÃ§Ã£o mensal gerada pelo contrato assinado.",
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
      "OlÃ¡, {aluno}! Passando para lembrar da mensalidade do plano {plano}, no valor de {valor}, com vencimento em {vencimento}.";
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
      review_pending: { key, label: "RevisÃ£o pendente", tone: "warning", className: "is-review" },
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
      "OlÃ¡, {aluno}! Seu plano alimentar {plano} estÃ¡ disponÃ­vel no app Elite AS. PrÃ³xima revisÃ£o: {data}.";
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
      const label = exercise.videoName || (exercise.videoStorage === "external" ? "Link cadastrado" : "VÃ­deo cadastrado");
      const size = formatFileSize(exercise.videoSize);
      return `<span class="video-meta"><a class="video-link" href="${escapeHtml(exercise.videoUrl)}" target="_blank" rel="noreferrer">Abrir vÃ­deo</a><span class="small-text">${escapeHtml(label)}${size ? ` Â· ${escapeHtml(size)}` : ""}</span></span>`;
    }
    if (exercise.videoStorage === "indexeddb" && exercise.videoKey) {
      return `<span class="video-meta"><button class="mini-button" type="button" data-open-local-video="${escapeHtml(exercise.id)}">Abrir vÃ­deo local</button><span class="small-text">VÃ­deo local deste aparelho: ${escapeHtml(exercise.videoName || "arquivo local")}${exercise.videoSize ? ` Â· ${escapeHtml(formatFileSize(exercise.videoSize))}` : ""}</span></span>`;
    }
    return `<span class="small-text video-meta">Sem vÃ­deo cadastrado.</span>`;
  }

  function openVideoStore() {
    return new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) return reject(new Error("IndexedDB indisponÃ­vel."));
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
    if (file.size > maxSize) throw new Error("O vÃ­deo deve ter atÃ© 200 MB.");
    const allowed = ["video/mp4", "video/webm", "video/quicktime"];
    if (file.type && !allowed.includes(file.type)) throw new Error("Use vÃ­deo MP4, WebM ou MOV.");

    try {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("exerciseId", exerciseId);
      formData.append("trainerId", TRAINER_ID);
      const headers = {};
      if (state.authToken) headers.Authorization = `Bearer ${state.authToken}`;
      const response = await fetchWithTimeout(apiUrl("/uploads/exercises"), { method: "POST", body: formData, headers }, 60000);
      if (!response.ok) throw new Error("Upload remoto indisponÃ­vel.");
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
        renderApp();
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
        title: "AtualizaÃ§Ã£o quinzenal",
        date: update.dueDate,
        time: "09:00",
        duration: "15",
        status: update.status === "sent" || update.status === "viewed" ? "sent" : "pending",
        updateId: update.id,
        notes: "Peso, fotos e observaÃ§Ãµes do aluno"
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
      showToast("Enviamos um link de redefinicao para o e-mail informado.");
    } catch (error) {
      const message = String(error.message || "");
      if (message.includes("404")) return showToast("Esse e-mail ainda nao tem uma conta cadastrada.");
      if (message.includes("503")) return showToast("Envio de e-mail ainda nao configurado no servidor.");
      showToast("Nao foi possivel enviar o link agora. Tente novamente.");
    }
  }

  function openPasswordResetModal(token) {
    if (!token) return;
    openModal(
      "Criar senha de acesso",
      `
        <form class="form-grid" id="resetPasswordForm" data-token="${escapeHtml(token)}">
          <p class="small-text">Digite uma senha segura para acessar sua conta no app. O personal nao visualiza essa senha.</p>
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
      showToast("Link invalido ou expirado. Solicite um novo link.");
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
      showToast("Link de contrato invalido ou expirado.");
    }
  }

  function showToast(message) {
    window.clearTimeout(state.toastTimer);
    elements.toast.textContent = fixMojibake(message);
    elements.toast.classList.add("is-visible");
    state.toastTimer = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 3200);
  }

  function showView(viewName) {
    elements.loginView.hidden = viewName !== "login";
    elements.managerView.hidden = viewName !== "manager";
    elements.studentView.hidden = viewName !== "student";
    elements.body.classList.toggle("is-manager-view", viewName === "manager");
    elements.body.classList.toggle("is-student-view", viewName === "student");
    closeManagerDrawer();
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function renderNav(target, menus, activeId, attribute) {
    target.innerHTML = menus
      .map(
        (menu) => `
          <button class="nav-button ${menu.id === activeId ? "is-active" : ""}" type="button" ${attribute}="${menu.id}">
            ${menu.icon}
            <span>${menu.label}</span>
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
    elements.body.classList.add("manager-drawer-open");
  }

  function closeManagerDrawer() {
    elements.body.classList.remove("manager-drawer-open");
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

  function renderManager() {
    const menu = managerMenus.find((item) => item.id === state.managerMenu) || { id: "studentProfile", label: "Perfil do aluno" };
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
      agenda: () => renderAgendaScreen(),
      workouts: renderManagerWorkouts,
      library: renderExerciseLibrary,
      updates: renderManagerUpdates,
      diet: renderManagerDiet,
      messages: renderManagerMessages,
      contracts: renderManagerContracts,
      finance: renderManagerFinance,
      studentProfile: renderManagerStudentProfile,
      more: renderManagerMore,
      settings: renderSettings
    };
    elements.managerContent.innerHTML = (renderers[state.managerMenu] || renderManagerHomeV2)();
  }

  function renderStudent() {
    const blockingContract = getRequiredContractForStudent(getCurrentStudent()?.id);
    if (blockingContract) {
      if (markContractViewed(blockingContract)) persistData();
      elements.studentTitle.textContent = "Contrato";
      elements.studentSideNav.innerHTML = "";
      elements.studentBottomNav.innerHTML = "";
      elements.studentContent.innerHTML = renderStudentContractGate(blockingContract);
      return;
    }

    const menu = studentMenus.find((item) => item.id === state.studentMenu) || studentMenus[0];
    elements.studentTitle.textContent = fixMojibake(menu.label);
    renderSideNav(elements.studentSideNav, studentMenus.map((item) => ({ ...item, group: item.id === "today" ? "Aluno" : "" })), state.studentMenu, "data-student-nav");
    const studentBottomActive = studentBottomMenus.some((item) => item.id === state.studentMenu) ? state.studentMenu : "profile";
    renderNav(elements.studentBottomNav, studentBottomMenus, studentBottomActive, "data-student-nav");

    const renderers = {
      today: renderStudentToday,
      agenda: () => renderAgendaScreen(getCurrentStudent()?.id),
      workouts: renderStudentWorkouts,
      updates: renderStudentUpdates,
      progress: renderStudentProgress,
      profile: renderStudentProfile
    };
    elements.studentContent.innerHTML = (renderers[state.studentMenu] || renderStudentToday)();
  }

  function metricCard(label, value) {
    return `<article class="metric-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`;
  }

  function dashboardMetricCard({ label, value, subtext = "", icon = icons.home, nav = "", tone = "" }) {
    const tag = nav ? "button" : "article";
    const navAttr = nav ? ` type="button" data-manager-nav="${escapeHtml(nav)}"` : "";
    return `
      <${tag} class="metric-card dashboard-metric ${tone ? `is-${tone}` : ""}"${navAttr}>
        <span class="metric-icon">${icon}</span>
        <span class="metric-label">${escapeHtml(label)}</span>
        <strong>${escapeHtml(String(value))}</strong>
        ${subtext ? `<small>${escapeHtml(subtext)}</small>` : ""}
      </${tag}>
    `;
  }

  function emptyState(title, description) {
    return `<div class="empty-state"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(description)}</span></div>`;
  }

  function renderOperationalItem(item) {
    return `
      <article class="entity-row compact-row">
        <div class="entity-main">
          <strong>${escapeHtml(item.title)}</strong>
          <span>${escapeHtml(item.meta || "")}</span>
          <div class="badge-row">${statusBadge(item.tone === "danger" ? "AtenÃ§Ã£o" : "Pendente", item.tone)}</div>
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
    const pendingItems = [
      ...overduePayments.map((record) => ({
        title: "Pagamento em atraso",
        context: getStudentName(record.studentId),
        meta: `${currencyExact(record.amount)} Â· vencimento ${record.dueDate ? formatShortDate(record.dueDate) : "nÃ£o definido"}`,
        action: `<button class="mini-button" type="button" data-manager-nav="finance">Abrir</button>`,
        tone: "danger",
        label: "Financeiro",
        icon: icons.finance
      })),
      ...dietReviewPlans.map((plan) => ({
        title: "RevisÃ£o de dieta pendente",
        context: getStudentName(plan.studentId),
        meta: plan.nextReviewDate ? `RevisÃ£o ${formatShortDate(plan.nextReviewDate)}` : plan.protocol || "Plano alimentar",
        action: `<button class="mini-button" type="button" data-open-diet-detail="${escapeHtml(plan.id)}">Abrir</button>`,
        tone: plan.nextReviewDate && plan.nextReviewDate < today ? "danger" : "warning",
        label: "Dieta",
        icon: icons.diet
      })),
      ...overdueUpdates.map((update) => ({
        title: "AtualizaÃ§Ã£o atrasada",
        context: getStudentName(update.studentId),
        meta: `Vencimento ${formatDate(update.dueDate)}`,
        action: `<button class="mini-button" type="button" data-manager-nav="updates">Ver</button>`,
        tone: "danger",
        label: "Atrasada",
        icon: icons.updates
      })),
      ...unsignedContracts.map((contract) => ({
        title: "Contrato pendente",
        context: getStudentName(contract.studentId),
        meta: contract.title,
        action: `<button class="mini-button" type="button" data-open-student-profile="${contract.studentId}">Abrir</button>`,
        tone: "warning",
        label: "Contrato",
        icon: icons.contracts
      })),
      ...studentsWithoutWorkout.map((student) => ({
        title: "Aluno sem treino publicado",
        context: student.name,
        meta: student.goal || "Sem objetivo definido",
        action: `<button class="mini-button" type="button" data-open-student-profile="${student.id}">Abrir</button>`,
        tone: "info",
        label: "Sem treino",
        icon: icons.workouts
      })),
      ...studentsWithoutDiet.slice(0, 2).map((student) => ({
        title: "Aluno sem plano alimentar",
        context: student.name,
        meta: student.goal || "Sem objetivo definido",
        action: `<button class="mini-button" type="button" data-open-diet-form data-prefill-student="${escapeHtml(student.id)}">Criar</button>`,
        tone: "warning",
        label: "Dieta",
        icon: icons.diet
      })),
      ...studentsWithoutAccess.map((student) => ({
        title: "Acesso do aluno pendente",
        context: student.name,
        meta: getStudentAccessState(student).detail,
        action: `<button class="mini-button" type="button" data-open-student-profile="${student.id}">Abrir</button>`,
        tone: "warning",
        label: "Convite",
        icon: icons.students
      })),
      ...unansweredMessages.map(({ student }) => ({
        title: "Mensagem sem resposta",
        context: student.name,
        meta: "Ãšltima mensagem enviada pelo aluno",
        action: `<button class="mini-button" type="button" data-open-messages="${student.id}">Responder</button>`,
        tone: "warning",
        label: "Mensagem",
        icon: icons.messages
      })),
      ...draftWorkouts.slice(0, 2).map((workout) => ({
        title: "Treino em rascunho",
        context: workout.title,
        meta: workout.studentId ? getStudentName(workout.studentId) : "PadrÃ£o de treino",
        action: `<button class="mini-button" type="button" data-open-workout-form="${workout.id}">Editar</button>`,
        tone: "info",
        label: "Rascunho",
        icon: icons.workouts
      }))
    ].slice(0, 3);

    return `
      <div class="content-stack dashboard-home">
        <section class="dashboard-hero">
          <div>
            <span class="eyebrow">Elite AS</span>
            <h3>Dashboard</h3>
            <p>VisÃ£o geral da operaÃ§Ã£o da sua assessoria.</p>
          </div>
          <button class="primary-action" type="button" data-open-activity-form>${icons.agenda}<span>Agendar atividade</span></button>
        </section>

        <section class="metric-grid dashboard-metrics" aria-label="Indicadores principais">
          ${dashboardMetricCard({ label: "Alunos ativos", value: activeStudents, subtext: "Cadastros em acompanhamento", icon: icons.students, nav: "students" })}
          ${dashboardMetricCard({ label: "Treinos hoje", value: todayWorkoutActivities.length, subtext: "Atividades programadas", icon: icons.workouts, nav: "agenda" })}
          ${dashboardMetricCard({ label: "ConcluÃ­dos hoje", value: completedToday, subtext: completedToday ? "SessÃµes finalizadas" : "Nenhum treino finalizado", icon: icons.today, nav: "agenda", tone: "success" })}
          ${dashboardMetricCard({ label: "AtualizaÃ§Ãµes pendentes", value: pendingUpdates, subtext: overdueUpdates.length ? `${overdueUpdates.length} atrasada(s)` : "Aguardando envio", icon: icons.updates, nav: "updates", tone: overdueUpdates.length ? "warning" : "" })}
          ${dashboardMetricCard({ label: "Mensagens nÃ£o lidas", value: unreadMessageTotal, subtext: unreadMessageTotal ? "Novas mensagens" : "Conversas em dia", icon: icons.messages, nav: "messages" })}
        </section>

        <section class="panel dashboard-panel dashboard-pending-panel">
          <div class="section-title">
            <div>
              <h3>PendÃªncias</h3>
              <span class="small-text">Itens que precisam de atenÃ§Ã£o</span>
            </div>
            <button class="mini-button" type="button" data-manager-nav="updates">Ver todas</button>
          </div>
          ${pendingItems.length ? `<div class="entity-list dashboard-pending-list">${pendingItems.map(renderDashboardPendingItem).join("")}</div>` : emptyState("Nenhuma pendÃªncia", "Tudo certo por enquanto.")}
        </section>

        <section class="dashboard-grid dashboard-main-grid">
          <div class="panel dashboard-panel dashboard-agenda-panel">
            <div class="section-title">
              <div>
                <h3>Agenda de hoje</h3>
                <span class="small-text">${formatLongDate(today)}</span>
              </div>
              <button class="mini-button" type="button" data-manager-nav="agenda">Abrir agenda</button>
            </div>
            ${agendaToday.length ? `<div class="entity-list dashboard-agenda-list">${agendaToday.slice(0, 3).map(renderDashboardAgendaItem).join("")}</div>` : emptyState("Agenda livre hoje", "Novos treinos e atualizaÃ§Ãµes aparecerÃ£o aqui.")}
          </div>

          <div class="panel dashboard-panel">
            <div class="section-title">
              <div>
                <h3>Acesso rÃ¡pido</h3>
                <span class="small-text">Atalhos operacionais</span>
              </div>
            </div>
            <div class="quick-grid dashboard-quick-grid">
              <button class="quick-link dashboard-quick-link" type="button" data-open-student-form>${icons.students}<strong>Novo aluno</strong><span>Cadastrar e liberar acesso</span></button>
              <button class="quick-link dashboard-quick-link" type="button" data-open-workout-form>${icons.workouts}<strong>Novo padrÃ£o</strong><span>Criar modelo base</span></button>
              <button class="quick-link dashboard-quick-link" type="button" data-open-exercise-form>${icons.library}<strong>Novo exercÃ­cio</strong><span>Adicionar Ã  biblioteca</span></button>
              <button class="quick-link dashboard-quick-link" type="button" data-manager-nav="messages">${icons.messages}<strong>Mensagens</strong><span>${recentMessages.length ? "Conversas recentes" : "Conversa direta"}</span></button>
            </div>
          </div>
        </section>

        ${renderWeeklySummary()}
      </div>
    `;
  }

  function renderDashboardPendingItem(item) {
    return `
      <article class="entity-row compact-row dashboard-pending-item">
        <span class="dashboard-pending-icon is-${escapeHtml(item.tone || "info")}" aria-hidden="true">${item.icon || icons.updates}</span>
        <div class="entity-main">
          <strong>${escapeHtml(item.title)}</strong>
          <span>${escapeHtml(item.context || "")}</span>
          <small>${escapeHtml(item.meta || "")}</small>
        </div>
        <div class="dashboard-pending-actions">
          ${statusBadge(item.label || (item.tone === "danger" ? "AtenÃ§Ã£o" : "Pendente"), item.tone)}
          ${item.action || ""}
        </div>
      </article>
    `;
  }

  function renderDashboardAgendaItem(item) {
    return `
      <article class="dashboard-agenda-item ${agendaItemClass(item)}">
        <div class="dashboard-agenda-time">${escapeHtml(item.time || "--:--")}</div>
        <div class="dashboard-agenda-main">
          <strong>${escapeHtml(activityLabel(item.type))}</strong>
          <span>${escapeHtml(getStudentName(item.studentId))}</span>
          <small>${escapeHtml(item.title)}</small>
        </div>
        <div class="dashboard-agenda-status">${statusBadge(agendaStatusLabel(item.status), agendaStatusTone(item.status))}</div>
        <div class="dashboard-agenda-actions">
          <button class="mini-button" type="button" data-open-agenda-detail="${escapeHtml(item.id)}" data-agenda-date="${escapeHtml(item.date)}" data-agenda-student="${escapeHtml(item.studentId)}">Abrir</button>
        </div>
      </article>
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
      ? `${completed} concluÃ­do(s) de ${planned} treino(s) programado(s)`
      : "Sem treinos programados nesta semana";
    const chartPoints = dayCounts.map((count, index) => {
      const x = 8 + index * 14;
      const y = count ? 66 - (count / maxDayValue) * 46 : 62;
      return { x, y, count, day: days[index] };
    });
    const linePoints = chartPoints.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
    const areaPoints = `${linePoints} 92,74 8,74`;

    return `
      <section class="panel dashboard-panel weekly-summary">
        <div class="section-title">
          <div>
            <h3>Resumo semanal</h3>
            <span class="small-text">${formatDate(start)} a ${formatDate(addDays(start, 6))}</span>
          </div>
          <span class="badge ${delta >= 0 ? "is-success" : "is-warning"}">${delta >= 0 ? "+" : ""}${delta} vs. semana anterior</span>
        </div>
        <div class="weekly-summary-body">
          <div class="weekly-chart-card" aria-label="Treinos concluÃ­dos na semana">
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
            <span>adesÃ£o mÃ©dia</span>
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
    const recent = getRecentMessages(6).filter((message) => getStudent(message.studentId));
    const unreadTotal = conversations.reduce((total, conversation) => total + conversation.unreadCount, 0);

    return `
      <div class="content-stack messages-workspace">
        <section class="messages-hero">
          <div>
            <span class="eyebrow">Elite AS</span>
            <h3>Mensagens</h3>
            <p>Conversa direta com os alunos</p>
          </div>
        </section>

        <section class="messages-summary-grid">
          ${messageMetricCard({ icon: icons.messages, title: "Mensagens nÃ£o lidas", value: unreadTotal, subtitle: unreadTotal ? "Novas mensagens" : "Conversas em dia", tone: unreadTotal ? "warning" : "success" })}
          ${messageMetricCard({ icon: icons.students, title: "Conversas ativas", value: conversations.length, subtitle: conversations.length ? "Em andamento" : "Nenhuma conversa", tone: "warning" })}
        </section>

        <section class="messages-toolbar" aria-label="Busca e filtros de mensagens">
          <label class="message-search-field">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 21l-4.3-4.3M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z"/></svg>
            <input type="search" data-message-filter="q" placeholder="Buscar conversa..." value="${escapeHtml(filters.q)}" />
          </label>
          ${messageFilterSelect("status", "Filtrar", icons.settings, [
            ["all", "Todas"],
            ["unread", "NÃ£o lidas"],
            ["waiting", "Aguardando resposta"],
            ["answered", "Respondidas"],
            ["recent", "Recentes"]
          ], filters.status)}
        </section>

        <section class="messages-list-panel">
          <div class="section-title">
            <div>
              <h3>Conversas ativas</h3>
              <span class="small-text">${filteredConversations.length} conversa(s) encontrada(s)</span>
            </div>
            <button class="text-action message-see-all" type="button" data-message-show-all>Ver todas</button>
          </div>
          ${
            filteredConversations.length
              ? `<div class="conversation-list">${filteredConversations.map(renderConversationCard).join("")}</div>`
              : emptyState(conversations.length ? "Nenhuma conversa encontrada" : "Nenhuma conversa ainda", conversations.length ? "Tente ajustar a busca ou os filtros." : "Abra o perfil de um aluno para iniciar uma conversa.")
          }
        </section>

        <section class="messages-list-panel messages-recent-panel">
          <div class="section-title">
            <div>
              <h3>Mensagens recentes</h3>
              <span class="small-text">${recent.length} mensagem(ns)</span>
            </div>
            <button class="text-action message-see-all" type="button" data-message-show-all>Ver todas</button>
          </div>
          ${recent.length ? `<div class="recent-message-list">${recent.map(renderRecentMessageCard).join("")}</div>` : emptyState("Nenhuma mensagem recente", "As novas interaÃ§Ãµes dos alunos aparecerÃ£o aqui.")}
        </section>
      </div>
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
      <button class="conversation-card ${conversation.unreadCount ? "has-unread" : ""}" type="button" data-open-messages="${escapeHtml(conversation.student.id)}">
        ${studentAvatar(conversation.student)}
        <span class="conversation-copy">
          <strong>${escapeHtml(conversation.student.name)}</strong>
          <small>${escapeHtml(last?.body || "Sem mensagem registrada.")}</small>
        </span>
        <span class="conversation-meta">
          <time>${escapeHtml(messageMomentLabel(last?.createdAt))}</time>
          ${conversation.unreadCount ? `<b>${escapeHtml(conversation.unreadCount)}</b>` : ""}
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
          <small>${escapeHtml(message.body || "Mensagem sem conteÃºdo.")}</small>
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
    return `
      <div class="content-stack contracts-workspace">
        <section class="contracts-hero">
          <div>
            <span class="eyebrow">Elite AS</span>
            <h3>Contratos</h3>
            <p>Aceites digitais e planos</p>
          </div>
        </section>
        <section class="contracts-summary-grid">
          ${contractMetricCard({ icon: icons.contracts, title: "Pendentes", value: pending.length, subtitle: "Aguardando assinatura", tone: "warning" })}
          ${contractMetricCard({ icon: icons.settings, title: "Assinados", value: signed.length, subtitle: "Ativos", tone: "success" })}
          ${contractMetricCard({ icon: icons.agenda, title: "PrÃ³ximos vencimentos", value: upcoming.length, subtitle: "30 dias", tone: "warning" })}
        </section>
        <section class="contracts-filter-panel">
          <div class="contract-filter-grid">
            ${contractFilterSelect("status", "Filtrar contratos", icons.updates, [
              ["all", "Todos os contratos"],
              ["pending", "Pendentes"],
              ["signed", "Assinados"],
              ["upcoming", "PrÃ³ximos vencimentos"],
              ["expired", "Vencidos"],
              ["canceled", "Cancelados"]
            ], filters.status)}
            ${contractFilterSelect("studentId", "Aluno", icons.students, [["", "Todos os alunos"], ...state.data.students.map((student) => [student.id, student.name])], filters.studentId)}
            ${contractFilterSelect("plan", "Plano", icons.contracts, [["all", "Todos os planos"], ...plans.map((plan) => [plan, plan])], filters.plan)}
          </div>
        </section>
        <section class="contracts-list-panel">
          <div class="section-title">
            <div>
              <h3>Lista de contratos</h3>
              <span class="small-text">${contracts.length} contrato(s) encontrado(s)</span>
            </div>
          </div>
          ${contracts.length ? `<div class="contract-card-list">${contracts.map(renderContractCard).join("")}</div>` : emptyState("Nenhum contrato encontrado", "Tente ajustar os filtros ou crie um contrato para formalizar o plano do aluno.")}
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
    const primary = contractPrimaryAction(contract, meta);
    return `
      <article class="contract-card ${meta.className}">
        <div class="contract-card-main">
          ${studentAvatar(student)}
          <div class="contract-student-info">
            <strong>${escapeHtml(getStudentName(contract.studentId))}</strong>
            <span>${escapeHtml(contract.plan || contract.title || "Plano nÃ£o informado")}</span>
            <b>${escapeHtml(contract.value || "Valor nÃ£o informado")}</b>
          </div>
          <div class="contract-validity">
            <span>${icons.agenda}</span>
            <small>VÃ¡lido atÃ©</small>
            <strong>${escapeHtml(contract.endDate ? formatShortDate(contract.endDate) : "Sem vencimento")}</strong>
          </div>
          <div class="contract-card-actions">
            <span class="badge ${meta.badgeClass}">${escapeHtml(meta.label)}</span>
            <button class="contract-primary-action" type="button" ${primary.attr}>
              ${primary.icon}
              <span>${escapeHtml(primary.label)}</span>
            </button>
          </div>
          <details class="action-menu contract-action-menu">
            <summary aria-label="Mais aÃ§Ãµes">${icons.more}</summary>
            <div>
              <button class="mini-button" type="button" data-open-contract="${escapeHtml(contract.id)}">Visualizar contrato</button>
              ${student ? `<button class="mini-button" type="button" data-open-student-profile="${escapeHtml(student.id)}">Abrir perfil do aluno</button>` : ""}
              ${contract.status !== "signed" && contract.status !== "canceled" ? `<button class="mini-button" type="button" data-open-contract-form="${escapeHtml(contract.studentId)}" data-contract-id="${escapeHtml(contract.id)}">Editar contrato</button><button class="mini-button" type="button" data-send-contract-link="${escapeHtml(contract.id)}">Reenviar contrato</button><button class="mini-button is-danger" type="button" data-cancel-contract="${escapeHtml(contract.id)}">Cancelar</button>` : ""}
              ${contract.status === "signed" ? `<button class="mini-button" type="button" data-open-contract="${escapeHtml(contract.id)}">Gerar PDF</button>` : ""}
            </div>
          </details>
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
    return `
      <div class="content-stack finance-workspace">
        <section class="finance-hero">
          <div>
            <span class="eyebrow">Elite AS</span>
            <h3>Financeiro</h3>
            <p>Acompanhe mensalidades, faturamento e recebimentos</p>
          </div>
          <button class="primary-action" type="button" data-open-payment-form>${icons.finance}<span>Registrar pagamento</span></button>
        </section>

        <section class="finance-summary-grid">
          ${financeMetricCard({ icon: icons.finance, title: "Recebido no mÃªs", value: currencyValue(stats.paidTotal), subtitle: `${paidDelta >= 0 ? "+" : ""}${paidDelta}% vs. mÃªs anterior`, tone: "success" })}
          ${financeMetricCard({ icon: icons.contracts, title: "A receber", value: currencyValue(stats.pendingTotal), subtitle: `${stats.pendingCount} cobranÃ§a(s) pendente(s)`, tone: "warning" })}
          ${financeMetricCard({ icon: icons.updates, title: "Em atraso", value: currencyValue(stats.overdueTotal), subtitle: `${stats.overdueCount} aluno(s) inadimplente(s)`, tone: "danger" })}
          ${financeMetricCard({ icon: icons.students, title: "Alunos pagantes", value: stats.payingStudents, subtitle: "ativos neste mÃªs", tone: "warning" })}
        </section>

        <section class="finance-toolbar" aria-label="Busca e filtros financeiros">
          <label class="finance-search-field">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 21l-4.3-4.3M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z"/></svg>
            <input type="search" data-finance-filter="q" placeholder="Buscar aluno ou pagamento..." value="${escapeHtml(filters.q)}" />
          </label>
          ${financeFilterSelect("status", "Filtrar", icons.settings, [
            ["all", "Todos"],
            ["paid", "Pago"],
            ["pending", "Pendente"],
            ["overdue", "Atrasado"],
            ["upcoming", "PrÃ³ximos vencimentos"]
          ], filters.status)}
        </section>

        <section class="finance-month-panel">
          <div class="section-title">
            <div>
              <h3>VisÃ£o do mÃªs</h3>
              <span class="small-text">ProjeÃ§Ã£o por contratos e pagamentos registrados</span>
            </div>
            <div class="finance-month-controls">
              <button class="icon-button" type="button" data-finance-month-shift="-1" aria-label="MÃªs anterior"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg></button>
              <label>
                <span class="sr-only">MÃªs de referÃªncia</span>
                <input type="month" data-finance-filter="month" value="${escapeHtml(month)}" />
              </label>
              <button class="icon-button" type="button" data-finance-month-shift="1" aria-label="PrÃ³ximo mÃªs"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></button>
            </div>
          </div>
          <div class="finance-month-body">
            ${renderFinanceChart(month)}
            <div class="finance-month-kpis">
              ${financeMonthKpi(icons.finance, "Faturamento", currencyValue(stats.expectedTotal), stats.expectedTotal ? "previsto no mÃªs" : "sem previsÃ£o", "success")}
              ${financeMonthKpi(icons.progress, "Ticket mÃ©dio", currencyValue(stats.ticket), "por mensalidade", "warning")}
              ${financeMonthKpi(icons.updates, "InadimplÃªncia", `${stats.delinquency}%`, `${stats.overdueCount} atraso(s)`, stats.overdueCount ? "danger" : "success")}
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
          ${records.length ? `<div class="finance-record-list">${records.map(renderFinanceRecordCard).join("")}</div>` : emptyState(allRecords.length ? "Nenhum pagamento encontrado" : "Nenhuma mensalidade configurada", allRecords.length ? "Tente ajustar os filtros ou buscar outro aluno." : "Vincule contratos assinados ou registre pagamentos para acompanhar o financeiro.")}
        </section>

        <section class="finance-insights-panel">
          <div class="section-title">
            <div>
              <h3>AnÃ¡lises rÃ¡pidas</h3>
              <span class="small-text">Sinais Ãºteis para a operaÃ§Ã£o financeira</span>
            </div>
          </div>
          <div class="finance-insights-grid">
            ${financeInsightCard(icons.today, "Melhor semana", bestFinanceWeek(month), "recebidos", "success")}
            ${financeInsightCard(icons.agenda, "PrÃ³ximos vencimentos", `${upcomingFinanceRecords(allRecords).length} cobranÃ§a(s)`, "nos prÃ³ximos 7 dias", "warning")}
          </div>
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
      <div class="finance-chart" aria-label="Faturamento dos Ãºltimos meses">
        <svg viewBox="0 0 560 200" role="img" aria-label="GrÃ¡fico de faturamento">
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
          <span>${escapeHtml(record.plan || "Plano nÃ£o informado")}</span>
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
    return `${bestIndex + 1}Âª semana Â· ${currencyValue(weeks[bestIndex])}`;
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
    return `
      <div class="content-stack diet-workspace">
        <section class="diet-hero">
          <div>
            <span class="eyebrow">Elite AS</span>
            <h3>Dieta</h3>
            <p>Organize planos alimentares e acompanhamento</p>
          </div>
          <button class="primary-action" type="button" data-open-diet-form>${icons.diet}<span>Novo plano alimentar</span></button>
        </section>

        <section class="diet-summary-grid">
          ${dietMetricCard({ icon: icons.diet, title: "Planos ativos", value: stats.active, subtitle: stats.active ? "em acompanhamento" : "nenhum ativo", tone: "success" })}
          ${dietMetricCard({ icon: icons.updates, title: "RevisÃµes pendentes", value: stats.reviews, subtitle: stats.reviews ? "Aguardando" : "Em dia", tone: stats.reviews ? "warning" : "success" })}
          ${dietMetricCard({ icon: icons.agenda, title: "PrÃ³ximas entregas", value: stats.upcoming, subtitle: "AtÃ© 7 dias", tone: "warning" })}
          ${dietMetricCard({ icon: icons.students, title: "Alunos sem plano", value: stats.withoutPlan, subtitle: "ativos sem dieta", tone: stats.withoutPlan ? "warning" : "success" })}
        </section>

        <section class="diet-toolbar" aria-label="Busca e filtros de dieta">
          <label class="diet-search-field">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 21l-4.3-4.3M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z"/></svg>
            <input type="search" data-diet-filter="q" placeholder="Buscar plano alimentar..." value="${escapeHtml(filters.q)}" />
          </label>
          ${dietFilterSelect("status", "Filtrar", icons.settings, [
            ["all", "Todos"],
            ["active", "Ativo"],
            ["review_pending", "RevisÃ£o pendente"],
            ["expired", "Vencido"],
            ["draft", "Rascunho"],
            ["archived", "Arquivado"]
          ], filters.status)}
          ${dietFilterSelect("objective", "Objetivo", icons.progress, [
            ["all", "Todos"],
            ["Hipertrofia", "Hipertrofia"],
            ["Emagrecimento", "Emagrecimento"],
            ["ManutenÃ§Ã£o", "ManutenÃ§Ã£o"],
            ["Performance", "Performance"],
            ["ReeducaÃ§Ã£o alimentar", "ReeducaÃ§Ã£o alimentar"],
            ["Condicionamento", "Condicionamento"],
            ["Outro", "Outro"]
          ], filters.objective)}
        </section>

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
              : emptyState(allPlans.length ? "Nenhum plano encontrado" : "Nenhum plano alimentar criado", allPlans.length ? "Tente ajustar os filtros ou criar um novo plano." : "Crie planos alimentares para organizar o acompanhamento dos alunos.")
          }
        </section>

        <section class="diet-insights-panel">
          <div class="section-title">
            <div>
              <h3>Acompanhamento</h3>
              <span class="small-text">Sinais Ãºteis para revisÃ£o e entrega</span>
            </div>
          </div>
          <div class="diet-insights-grid">
            ${dietInsightCard(icons.updates, "PrÃ³xima revisÃ£o", nextDietReviewLabel(allPlans), "prioridade da semana", stats.reviews ? "warning" : "success")}
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
            <span>${icons.progress}${escapeHtml(plan.objective || student?.goal || "Objetivo nÃ£o informado")}</span>
          </div>
          <span class="badge ${meta.tone ? `is-${meta.tone}` : ""}">${escapeHtml(meta.label)}</span>
          <details class="action-menu">
            <summary aria-label="Mais aÃ§Ãµes">${icons.more}</summary>
            <div>
              <button class="mini-button" type="button" data-open-diet-form="${escapeHtml(plan.id)}">Editar plano</button>
              <button class="mini-button" type="button" data-duplicate-diet="${escapeHtml(plan.id)}">Duplicar</button>
              <button class="mini-button" type="button" data-open-student-profile="${escapeHtml(plan.studentId)}">Abrir perfil</button>
              <button class="mini-button" type="button" data-archive-diet="${escapeHtml(plan.id)}">Arquivar</button>
            </div>
          </details>
        </div>
        <div class="diet-plan-grid">
          <article>${icons.agenda}<span>Protocolo atual</span><strong>${escapeHtml(plan.protocol || plan.title || "Plano alimentar")}</strong></article>
          <article>${icons.diet}<span>RefeiÃ§Ãµes</span><strong>${escapeHtml(String(mealCount))} refeiÃ§Ã£o(Ãµes)/dia</strong></article>
          <article>${icons.today}<span>Ãšltima atualizaÃ§Ã£o</span><strong>${formatShortDate(String(plan.lastUpdatedAt || plan.updatedAt).slice(0, 10))}</strong></article>
          <article>${icons.agenda}<span>PrÃ³xima revisÃ£o</span><strong>${escapeHtml(nextReview)}</strong></article>
        </div>
        <div class="diet-plan-actions">
          <button class="diet-secondary-action" type="button" data-open-diet-detail="${escapeHtml(plan.id)}">${icons.contracts}<span>Abrir plano</span></button>
          <button class="diet-primary-action" type="button" data-send-diet-link="${escapeHtml(plan.id)}">${icons.messages}<span>Enviar link</span></button>
        </div>
      </article>
    `;
  }

  function nextDietReviewLabel(plans = []) {
    const upcoming = plans
      .filter((plan) => plan.nextReviewDate && dietStatusKey(plan) !== "archived")
      .sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate))[0];
    if (!upcoming) return "Sem revisÃ£o marcada";
    return `${getStudentName(upcoming.studentId)} Â· ${formatShortDate(upcoming.nextReviewDate)}`;
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
        ${pageHeader("Mais", "MÃ³dulos complementares e configuraÃ§Ãµes")}
        <section class="panel">
          <div class="section-title"><h3>MÃ³dulos</h3><span class="small-text">Acesso organizado</span></div>
          <div class="quick-grid more-grid">
            ${quickLink("Biblioteca de exercÃ­cios", "ExercÃ­cios, vÃ­deos e status", "library")}
            ${quickLink("PadrÃµes de treino", "Modelos base", "workouts")}
            ${quickLink("AtualizaÃ§Ãµes", "PendÃªncias quinzenais", "updates")}
            ${quickLink("Mensagens", "Conversa direta com alunos", "messages")}
            ${quickLink("Contratos", "Aceites digitais", "contracts")}
            ${quickLink("Financeiro", "Mensalidades e recebimentos", "finance")}
            ${quickLink("Dieta", "Planos alimentares", "diet")}
            ${quickLink("ConfiguraÃ§Ãµes", "Personal e WhatsApp", "settings")}
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
            <span class="eyebrow">Elite AS</span>
            <h3>Alunos</h3>
            <p>Gerencie alunos, treinos e evoluÃ§Ã£o.</p>
          </div>
          <button class="primary-action" type="button" data-open-student-form>${icons.students}<span>Novo aluno</span></button>
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
              ["update_overdue", "AtualizaÃ§Ã£o atrasada"]
            ], icons.students)}
            ${studentFilterSelect("goal", "Objetivo", filters.goal, [
              ["all", "Todos"],
              ["hipertrofia", "Hipertrofia"],
              ["emagrecimento", "Emagrecimento"],
              ["condicionamento", "Condicionamento"],
              ["performance", "Performance"],
              ["forca", "ForÃ§a"],
              ["reabilitacao", "ReabilitaÃ§Ã£o"],
              ["qualidade_de_vida", "Qualidade de vida"],
              ["outro", "Outro"]
            ], icons.progress)}
            ${studentFilterSelect("contract", "Contrato", filters.contract, [
              ["all", "Todos"],
              ["active", "Ativo"],
              ["pending", "Pendente"],
              ["expired", "Vencido"],
              ["upcoming", "PrÃ³ximo do vencimento"],
              ["none", "Sem contrato"]
            ], icons.contracts)}
          </div>
        </section>

        <section class="panel students-list-panel">
          <div class="section-title">
            <div>
              <h3>Alunos cadastrados</h3>
              <span class="small-text">${students.length} aluno(s) encontrado(s). Abra o perfil para detalhes.</span>
            </div>
          </div>
          ${students.length ? `<div class="student-card-list">${students.map(renderStudentRow).join("")}</div>` : emptyState("Nenhum aluno encontrado", state.search ? "Ajuste a busca ou os filtros para ver mais alunos." : "Crie um aluno para publicar treinos e acompanhar evoluÃ§Ã£o.")}
        </section>
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

  function normalizeFilterText(value = "") {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/Ã§/g, "c")
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
    if (current.status === "signed" && endDate && endDate <= addDays(today, 30)) return { value: "upcoming", label: "PrÃ³x. vencimento", tone: "warning", contract: current, plan: current.plan || "Contrato" };
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
    if (pendingUpdate && pendingUpdate.dueDate < todayISO()) return { value: "update_overdue", label: "AtualizaÃ§Ã£o atrasada", tone: "danger" };
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
    return `
      <article class="student-card">
        <div class="student-card-top">
          ${studentAvatar(student)}
          <div class="student-card-main">
            <strong>${escapeHtml(student.name)}</strong>
            <span class="student-goal">${icons.progress}${escapeHtml(student.goal || "Sem objetivo")}</span>
          </div>
          <div class="student-card-side">
            ${statusBadge(status.label, status.tone)}
            <details class="action-menu student-card-menu">
              <summary aria-label="Mais aÃ§Ãµes">${icons.more}</summary>
              <div>
                <button class="mini-button" type="button" data-open-student-form="${student.id}">Editar dados</button>
                <button class="mini-button" type="button" data-send-student-invite="${student.id}">${escapeHtml(inviteLabel)}</button>
                <button class="mini-button" type="button" data-open-contract-form="${student.id}">Enviar contrato</button>
                <button class="mini-button is-danger" type="button" data-delete-student="${student.id}">Remover aluno</button>
              </div>
            </details>
          </div>
        </div>
        <div class="student-card-info">
          ${renderStudentInfoBlock(icons.agenda, "PrÃ³x. atualizaÃ§Ã£o", nextUpdateLabel)}
          ${renderStudentInfoBlock(icons.workouts, "Ãšltimo treino", lastWorkoutLabel)}
          ${renderStudentInfoBlock(icons.contracts, "Contrato", contract.plan || contract.label)}
        </div>
        <div class="student-card-actions">
          <button class="secondary-action student-primary-link" type="button" data-open-student-profile="${student.id}">${icons.profile}<span>Abrir perfil</span></button>
          <button class="secondary-action student-secondary-link" type="button" data-send-student-invite="${student.id}">${icons.contracts}<span>${escapeHtml(inviteLabel)}</span></button>
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
          <span>${message.senderRole === "manager" ? "Personal" : "Aluno"} Â· ${new Date(message.createdAt).toLocaleString("pt-BR")}</span>
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
        ${pageHeader("Biblioteca de exercÃ­cios", "Cadastre exercÃ­cios com grupos musculares, equipamento e vÃ­deo", '<button class="primary-action" type="button" data-open-exercise-form>Novo exercÃ­cio</button>')}
        <section class="toolbar">
          <div class="toolbar-group">
            <input type="search" data-exercise-filter="q" placeholder="Pesquisar exercÃ­cio" value="${escapeHtml(filters.q)}" />
            <select data-exercise-filter="muscle"><option value="">Grupo muscular</option>${muscles.map((item) => `<option value="${escapeHtml(item)}" ${filters.muscle === item ? "selected" : ""}>${escapeHtml(item)}</option>`).join("")}</select>
            <select data-exercise-filter="equipment"><option value="">Equipamento</option>${equipments.map((item) => `<option value="${escapeHtml(item)}" ${filters.equipment === item ? "selected" : ""}>${escapeHtml(item)}</option>`).join("")}</select>
            <select data-exercise-filter="status">
              <option value="active" ${filters.status === "active" ? "selected" : ""}>Ativos</option>
              <option value="inactive" ${filters.status === "inactive" ? "selected" : ""}>Inativos</option>
              <option value="all" ${filters.status === "all" ? "selected" : ""}>Todos</option>
            </select>
            <select data-exercise-filter="video">
              <option value="all" ${filters.video === "all" ? "selected" : ""}>Todos os vÃ­deos</option>
              <option value="with" ${filters.video === "with" ? "selected" : ""}>Com vÃ­deo</option>
              <option value="without" ${filters.video === "without" ? "selected" : ""}>Sem vÃ­deo</option>
            </select>
          </div>
          <div class="toolbar-group"><span class="small-text">${exercises.length} exercÃ­cio(s)</span></div>
        </section>
        <section class="panel">
          <div class="section-title"><h3>ExercÃ­cios cadastrados</h3><span class="small-text">Editar, inativar ou excluir com seguranÃ§a</span></div>
          ${exercises.length ? `<div class="entity-list">${exercises.map(renderExerciseCard).join("")}</div>` : emptyState("Nenhum exercÃ­cio encontrado", "Ajuste os filtros ou cadastre um novo exercÃ­cio.")}
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
            <h2>Biblioteca de exercÃ­cios</h2>
            <p>Gerencie exercÃ­cios e vÃ­deos de execuÃ§Ã£o</p>
          </div>
          <button class="primary-action library-primary-action" type="button" data-open-exercise-form>${icons.plus || "+"}<span>Novo exercÃ­cio</span></button>
        </section>

        <section class="library-stat-grid" aria-label="Resumo da biblioteca">
          ${renderLibraryStatCard(icons.workouts, "ExercÃ­cios cadastrados", total, createdThisMonth ? `â†‘ ${createdThisMonth} este mÃªs` : "Na biblioteca")}
          ${renderLibraryStatCard(icons.agenda, "Com vÃ­deo", withVideo, `${videoPercent}% do total`)}
          ${renderLibraryStatCard(icons.more, "Categorias", categoryCount, "Ativas")}
        </section>

        <section class="library-search-row">
          <label class="library-search-field">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 21-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z"/></svg>
            <input type="search" data-exercise-filter="q" placeholder="Buscar exercÃ­cio..." value="${escapeHtml(filters.q)}" />
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
              <label><span>VÃ­deo</span><select data-exercise-filter="video">
                <option value="all" ${filters.video === "all" ? "selected" : ""}>Todos</option>
                <option value="with" ${filters.video === "with" ? "selected" : ""}>Com vÃ­deo</option>
                <option value="without" ${filters.video === "without" ? "selected" : ""}>Sem vÃ­deo</option>
              </select></label>
            </div>
          </details>
        </section>

        ${exercises.length ? `<section class="library-card-list">${exercises.map(renderPremiumExerciseCard).join("")}</section>` : emptyState("Nenhum exercÃ­cio encontrado", "Ajuste os filtros ou cadastre um novo exercÃ­cio.")}
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
      : { label: "Arquivado", tone: "muted" };
    const params = exercise.defaultSets || exercise.defaultReps || exercise.defaultRest
      ? `${escapeHtml(exercise.defaultSets || "3")} sÃ©ries â€¢ ${escapeHtml(exercise.defaultReps || "10-12")} reps â€¢ ${escapeHtml(exercise.defaultRest || "60s")} descanso`
      : "ParÃ¢metros definidos no treino";

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
                <summary aria-label="Mais aÃ§Ãµes">${icons.more}</summary>
                <div>
                  ${hasVideo ? `<button class="mini-button" type="button" data-remove-exercise-video="${escapeHtml(exercise.id)}">Remover vÃ­deo</button>` : `<button class="mini-button" type="button" data-open-exercise-form="${escapeHtml(exercise.id)}">Enviar vÃ­deo</button>`}
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
          <button class="secondary-action" type="button" data-open-exercise-video="${escapeHtml(exercise.id)}">${icons.today}<span>Ver vÃ­deo</span></button>
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
      <button class="library-thumbnail ${hasVideo ? "has-video" : "is-placeholder"}" type="button" data-open-exercise-video="${escapeHtml(exercise.id)}" aria-label="Ver vÃ­deo de ${escapeHtml(exercise.name)}">
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
          <strong>Envie seu vÃ­deo de execuÃ§Ã£o</strong>
          <span>Adicione um vÃ­deo prÃ³prio para este exercÃ­cio e personalize sua biblioteca.</span>
        </div>
        <button class="mini-button" type="button" data-open-exercise-form="${escapeHtml(exercise.id)}">Enviar vÃ­deo</button>
      </div>
    `;
  }

  function openExerciseVideo(exerciseId) {
    const exercise = getExercise(exerciseId);
    if (!exercise || !hasExerciseVideo(exercise)) return showToast("Este exercÃ­cio nÃ£o tem vÃ­deo cadastrado.");
    if (exercise.videoStorage === "indexeddb" && exercise.videoKey) return openLocalVideo(exercise.id);
    if (exercise.videoUrl) {
      window.open(exercise.videoUrl, "_blank", "noopener,noreferrer");
      return;
    }
    showToast("VÃ­deo indisponÃ­vel neste aparelho.");
  }

  function openUseExerciseInWorkout(exerciseId) {
    const exercise = getExercise(exerciseId);
    if (!exercise) return showToast("ExercÃ­cio nÃ£o encontrado.");
    const patterns = getWorkoutPatterns();
    const activeStudents = state.data.students.filter((student) => student.status !== "inactive");
    openModal(
      "Usar no treino",
      `
        <form class="form-grid use-exercise-form" id="useExerciseForm" data-exercise-id="${escapeHtml(exercise.id)}">
          <div class="empty-state compact-note">
            <strong>${escapeHtml(exercise.name)}</strong>
            <span>Adicione este exercÃ­cio a um padrÃ£o existente ou crie uma cÃ³pia inicial para aluno.</span>
          </div>
          <label class="field"><span>Destino</span><select name="mode">
            <option value="newPattern">Novo padrÃ£o de treino</option>
            <option value="existingPattern" ${patterns.length ? "" : "disabled"}>Adicionar a padrÃ£o existente</option>
            <option value="studentWorkout" ${activeStudents.length ? "" : "disabled"}>Novo treino individual do aluno</option>
          </select></label>
          <label class="field"><span>PadrÃ£o existente</span><select name="patternId"><option value="">Selecionar padrÃ£o</option>${patterns.map((workout) => `<option value="${escapeHtml(workout.id)}">${escapeHtml(workout.title)}</option>`).join("")}</select></label>
          <label class="field"><span>Aluno</span><select name="studentId"><option value="">Selecionar aluno</option>${activeStudents.map((student) => `<option value="${escapeHtml(student.id)}">${escapeHtml(student.name)}</option>`).join("")}</select></label>
          <label class="field"><span>TÃ­tulo do novo treino/padrÃ£o</span><input name="title" type="text" value="${escapeHtml(exercise.name)}" /></label>
          <button class="primary-action" type="submit">Adicionar exercÃ­cio</button>
        </form>
      `
    );
  }

  function handleUseExerciseForm(form) {
    const exerciseId = form.dataset.exerciseId;
    const exercise = getExercise(exerciseId);
    if (!exercise) return showToast("ExercÃ­cio nÃ£o encontrado.");
    const mode = form.elements.mode.value;
    const row = normalizeWorkoutExercise({ exerciseId, sets: 3, targetReps: "10", restSeconds: 60 }, 0);

    if (mode === "existingPattern") {
      const workout = getWorkout(form.elements.patternId.value);
      if (!workout) return showToast("Selecione um padrÃ£o existente.");
      workout.exercises = Array.isArray(workout.exercises) ? workout.exercises : [];
      workout.exercises.push(normalizeWorkoutExercise({ ...row, order: workout.exercises.length + 1 }, workout.exercises.length));
      workout.updatedAt = new Date().toISOString();
      persistData();
      closeModal();
      showToast("ExercÃ­cio adicionado ao padrÃ£o.");
      state.managerMenu = "workouts";
      renderApp();
      return;
    }

    const isStudentWorkout = mode === "studentWorkout";
    const studentId = isStudentWorkout ? form.elements.studentId.value : "";
    if (isStudentWorkout && !studentId) return showToast("Selecione um aluno.");

    state.data.workouts.unshift(
      normalizeWorkout({
        id: createId("workout"),
        studentId,
        title: form.elements.title.value.trim() || exercise.name,
        description: `Criado a partir da biblioteca com ${exercise.name}.`,
        focus: getExercisePrimaryMuscle(exercise),
        level: "",
        status: "draft",
        exercises: [row],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    );
    persistData();
    closeModal();
    showToast(isStudentWorkout ? "Treino individual criado em rascunho." : "PadrÃ£o criado em rascunho.");
    state.managerMenu = isStudentWorkout ? "students" : "workouts";
    renderApp();
  }

  function renderExerciseCard(exercise) {
    const used = isExerciseUsed(exercise.id);
    const primaryMuscle = getExercisePrimaryMuscle(exercise);
    const secondaryMuscles = getExerciseSecondaryMuscles(exercise);
    const videoLabel = hasExerciseVideo(exercise) ? "Com vÃ­deo" : "Sem vÃ­deo";
    return `
      <article class="entity-row compact-row library-row">
        <div class="entity-main">
          <strong>${escapeHtml(exercise.name)}</strong>
          <span><b>Principal:</b> ${escapeHtml(primaryMuscle)} Â· ${escapeHtml(exercise.equipment)}</span>
          <div class="muscle-chip-row">
            ${secondaryMuscles.length ? secondaryMuscles.map((item) => `<span class="subtle-chip">${escapeHtml(item)}</span>`).join("") : '<span class="small-text">Sem grupos secundÃ¡rios.</span>'}
          </div>
          <span>${escapeHtml(exercise.description || "Sem descriÃ§Ã£o cadastrada.")}</span>
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
            <summary>Mais aÃ§Ãµes</summary>
            <div>
              ${hasExerciseVideo(exercise) ? `<button class="mini-button" type="button" data-remove-exercise-video="${exercise.id}">Remover vÃ­deo</button>` : ""}
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
          ...workout.exercises.map((row) => getExercise(row.exerciseId)?.name || "")
        ];
        return haystack.some((item) => normalizeFilterText(item).includes(query));
      });
    const uniqueExercises = new Set(allPatterns.flatMap((workout) => workout.exercises.map((exercise) => exercise.exerciseId)).filter(Boolean));
    return `
      <div class="content-stack patterns-workspace">
        <section class="patterns-hero">
          <div>
            <span class="eyebrow">Elite AS</span>
            <h3>PadrÃµes de treino</h3>
            <p>Monte modelos base reutilizÃ¡veis com exercÃ­cios da biblioteca.</p>
          </div>
          <button class="primary-action" type="button" data-open-workout-form>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
            <span>Novo padrÃ£o</span>
          </button>
        </section>
        <section class="patterns-summary-grid">
          ${patternMetricCard(icons.contracts, "Total de padrÃµes", allPatterns.length, "Modelos criados")}
          ${patternMetricCard(icons.today, "Publicados", allPatterns.filter((workout) => workout.status === "published").length, "DisponÃ­veis")}
          ${patternMetricCard(icons.settings, "Rascunhos", allPatterns.filter((workout) => workout.status === "draft").length, "Em ediÃ§Ã£o")}
          ${patternMetricCard(icons.library, "ExercÃ­cios usados", uniqueExercises.size, "Na biblioteca de padrÃµes")}
        </section>
        <section class="patterns-toolbar">
          <label class="pattern-search-field">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 21-4.3-4.3M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z"/></svg>
            <input type="search" data-workout-filter="q" placeholder="Buscar padrÃµes de treino..." value="${escapeHtml(filters.q)}" />
          </label>
          <div class="pattern-filter-grid">
            ${patternFilterSelect("status", "Status", icons.profile, [
              ["all", "Todos"],
              ["published", "Publicado"],
              ["draft", "Rascunho"],
              ["archived", "Arquivado"]
            ], filters.status)}
            ${patternFilterSelect("goal", "Objetivo", icons.progress, patternGoalOptions(), filters.goal || "all")}
            ${patternFilterSelect("level", "NÃ­vel", icons.workouts, [
              ["all", "Todos"],
              ["beginner", "Iniciante"],
              ["intermediate", "IntermediÃ¡rio"],
              ["advanced", "AvanÃ§ado"],
              ["none", "NÃ£o definido"]
            ], filters.level)}
          </div>
        </section>
        <section class="patterns-list-panel">
          <div class="section-title">
            <div>
              <h3>PadrÃµes cadastrados</h3>
              <span class="small-text">Crie modelos base, aplique em alunos e ajuste individualmente no perfil.</span>
            </div>
            <span class="badge">${workouts.length} padrÃ£o(s)</span>
          </div>
          ${state.data.exercises.some((exercise) => exercise.status === "active") ? "" : emptyState("Biblioteca vazia", "Cadastre exercÃ­cios ativos antes de montar um padrÃ£o.")}
          ${workouts.length ? `<div class="pattern-card-list">${workouts.map(renderPatternCard).join("")}</div>` : emptyState(allPatterns.length ? "Nenhum padrÃ£o encontrado" : "Nenhum padrÃ£o criado ainda", allPatterns.length ? "Tente ajustar os filtros ou criar um novo modelo." : "Crie modelos base para agilizar a montagem dos treinos dos alunos.")}
        </section>
      </div>
    `;
  }

  function patternMetricCard(icon, title, value, subtitle) {
    return `
      <article class="pattern-summary-card">
        <span class="pattern-summary-icon">${icon}</span>
        <span>${escapeHtml(title)}</span>
        <strong>${escapeHtml(value)}</strong>
        <small>${escapeHtml(subtitle)}</small>
      </article>
    `;
  }

  function patternGoalOptions() {
    const baseGoals = ["Hipertrofia", "Emagrecimento", "Condicionamento", "Performance", "ForÃ§a", "Mobilidade", "AdaptaÃ§Ã£o", "ReabilitaÃ§Ã£o", "Outro"];
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
          <div class="pattern-title-block">
            <span class="pattern-icon">${icons.workouts}</span>
            <div>
              <h3>${escapeHtml(workout.title)}</h3>
              <p>${escapeHtml(workout.description || "Sem descriÃ§Ã£o cadastrada.")}</p>
            </div>
          </div>
          <span class="badge ${patternStatusClass(workout.status)}">${patternStatusLabel(workout.status)}</span>
        </div>
        <div class="pattern-meta-grid">
          ${patternMetaItem(icons.progress, "Objetivo", goal)}
          ${patternMetaItem(icons.workouts, "NÃ­vel", workoutLevelLabel(workout.level))}
          ${patternMetaItem(icons.library, "ExercÃ­cios", `${exerciseCount} exercÃ­cio(s)`)}
          ${patternMetaItem(icons.agenda, "Ãšltima ediÃ§Ã£o", updatedAt)}
        </div>
        ${renderPatternExercisePreview(workout)}
        <div class="pattern-card-actions">
          <button class="secondary-action pattern-apply-button" type="button" data-open-apply-pattern-form="${escapeHtml(workout.id)}">
            ${icons.students}
            <span>Aplicar</span>
          </button>
          <details class="action-menu pattern-action-menu">
            <summary aria-label="Mais aÃ§Ãµes">${icons.more}<span>Mais aÃ§Ãµes</span></summary>
            <div>
              <button class="mini-button" type="button" data-open-workout-form="${escapeHtml(workout.id)}">Visualizar/editar</button>
              <button class="mini-button" type="button" data-duplicate-workout="${escapeHtml(workout.id)}">Duplicar</button>
              ${
                workout.status === "archived"
                  ? `<button class="mini-button" type="button" data-restore-workout="${escapeHtml(workout.id)}">Reativar</button>`
                  : `<button class="mini-button" type="button" data-archive-workout="${escapeHtml(workout.id)}">Arquivar</button>`
              }
              <button class="mini-button is-danger" type="button" data-delete-workout="${escapeHtml(workout.id)}">Remover</button>
            </div>
          </details>
        </div>
      </article>
    `;
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
      return `<div class="pattern-preview is-empty"><strong>Sem exercÃ­cios</strong><span>Use a Biblioteca de exercÃ­cios para montar este padrÃ£o.</span></div>`;
    }
    const rows = [...workout.exercises].sort((a, b) => a.order - b.order);
    const visibleRows = rows.slice(0, 3);
    const extra = rows.length - visibleRows.length;
    return `
      <div class="pattern-preview">
        ${visibleRows
          .map((row, index) => {
            const exercise = getExercise(row.exerciseId);
            const target = `${escapeHtml(row.sets)}x${escapeHtml(row.targetReps)} Â· ${escapeHtml(row.restSeconds)}s${row.suggestedLoad ? ` Â· ${escapeHtml(row.suggestedLoad)}` : ""}`;
            return `<span><b>${index + 1}. ${escapeHtml(exercise?.name || "ExercÃ­cio removido")}</b><small>${target}</small></span>`;
          })
          .join("")}
        ${extra > 0 ? `<span class="pattern-preview-extra">+${extra} exercÃ­cio(s)</span>` : ""}
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
    if (!workout.exercises.length) return '<span class="small-text">Sem exercÃ­cios cadastrados.</span>';
    const rows = [...workout.exercises].sort((a, b) => a.order - b.order);
    const visibleRows = rows.slice(0, 4);
    const extra = rows.length - visibleRows.length;
    return `
      <div class="workout-exercise-preview">
        ${visibleRows
          .map((row, index) => {
            const exercise = getExercise(row.exerciseId);
            return `<span>${index + 1}. ${escapeHtml(exercise?.name || "ExercÃ­cio removido")} Â· ${escapeHtml(row.sets)}x${escapeHtml(row.targetReps)} Â· ${escapeHtml(row.restSeconds)}s</span>`;
          })
          .join("")}
        ${extra > 0 ? `<span>+${extra} exercÃ­cio(s)</span>` : ""}
      </div>
    `;
  }

  function renderWorkoutCard(workout, isManager) {
    const isPattern = isWorkoutPattern(workout);
    const lastSession = isPattern ? null : getStudentSessions(workout.studentId).find((session) => session.workoutId === workout.id);
    const exerciseCount = workout.exercises.length;
    const ownerLabel = isPattern ? "PadrÃ£o de treino" : getStudentName(workout.studentId);
    const levelLabel = workoutLevelLabel(workout.level);
    const originLabel = isPattern ? "Modelo base" : workout.sourcePatternTitle ? `A partir de ${workout.sourcePatternTitle}` : "Criado do zero";
    const createdLabel = workout.createdAt ? formatDate(workout.createdAt.slice(0, 10)) : "-";
    const executionLabel = isPattern ? "nÃ£o se aplica" : lastSession ? formatDate(lastSession.finishedAt.slice(0, 10)) : "nunca";
    return `
      <article class="workout-row">
        <div class="workout-main">
          <strong>${escapeHtml(workout.title)}</strong>
          <span>${escapeHtml(ownerLabel)} Â· ${escapeHtml(workout.focus || "Sem foco")} Â· ${escapeHtml(levelLabel)} Â· ${exerciseCount} exercÃ­cio(s)</span>
          <span>${escapeHtml(workout.description || "Sem descriÃ§Ã£o.")}</span>
          <span>Criado em ${escapeHtml(createdLabel)} Â· Ãšltima execuÃ§Ã£o: ${escapeHtml(executionLabel)} Â· ${escapeHtml(originLabel)}</span>
          ${renderWorkoutExercisePreview(workout)}
          <div class="badge-row">
            <span class="badge ${workout.status === "published" ? "is-success" : workout.status === "archived" ? "is-danger" : "is-info"}">${statusWorkout(workout.status, isPattern)}</span>
            ${
              isPattern
                ? statusBadge("Modelo base", "info")
                : `<span class="badge">Ãšltima vez: ${lastSession ? formatDate(lastSession.finishedAt.slice(0, 10)) : "nunca"}</span>`
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
                  <summary>Mais aÃ§Ãµes</summary>
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
    return { draft: "Rascunho", published: isPattern ? "DisponÃ­vel" : "Publicado", archived: "Arquivado" }[status] || "Rascunho";
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
          ${workouts.length ? `<div class="workout-list">${workouts.map((workout) => renderWorkoutCard(workout, false)).join("")}</div>` : emptyState("Nenhum treino publicado", "Quando o personal publicar um treino, ele aparece aqui.")}
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
    const nextUpdate = state.data.updates.find((item) => item.studentId === student?.id && item.status === "pending") || null;
    return `
      <div class="content-stack">
        <section class="hero-panel">
          <div>
            <p>Hoje</p>
            <h3>${escapeHtml(student?.name || "Aluno")}</h3>
            <span>${agenda.length} item(ns) na agenda Â· ${workouts.length} treino(s) publicado(s)</span>
          </div>
          ${
            nextWorkout
              ? `<button class="primary-action" type="button" data-start-workout="${nextWorkout.workoutId}" data-activity-id="${nextWorkout.id}">Iniciar treino de hoje</button>`
              : `<button class="primary-action" type="button" data-student-nav="workouts">Ver treinos</button>`
          }
        </section>
        <section class="metric-grid">
          ${metricCard("Treinos na semana", sessionsThisWeek(student?.id).length)}
          ${metricCard("Treinos no mÃªs", sessionsThisMonth(student?.id).length)}
          ${metricCard("Volume Ãºltimo treino", sessions[0] ? sessions[0].totalVolumeLoad : 0)}
          ${metricCard("AtualizaÃ§Ãµes pendentes", state.data.updates.filter((item) => item.studentId === student?.id && item.status === "pending").length)}
        </section>
        ${
          nextUpdate
            ? `<section class="panel action-panel"><div><strong>AtualizaÃ§Ã£o quinzenal pendente</strong><span class="small-text">Vencimento ${formatDate(nextUpdate.dueDate)}</span></div><button class="primary-action" type="button" data-open-update-form="${nextUpdate.id}">Enviar atualizaÃ§Ã£o</button></section>`
            : ""
        }
        <section class="panel">
          <div class="section-title"><h3>Agenda de hoje</h3><button class="mini-button" type="button" data-student-nav="agenda">Abrir agenda</button></div>
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
          notes: "Aceite obrigatÃ³rio antes do acesso completo.",
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
          title: `Treino concluÃ­do: ${getWorkout(session.workoutId)?.title || "Treino"}`,
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
    return `
      <div class="content-stack agenda-workspace">
        <section class="agenda-hero">
          <div>
            <span class="eyebrow">Elite AS</span>
            <h3>Agenda</h3>
            <p>${isManager ? "Planeje treinos, avaliaÃ§Ãµes e retornos." : "Acompanhe suas atividades e treinos."}</p>
          </div>
          ${isManager ? `<button class="primary-action" type="button" data-open-activity-form>${icons.agenda}<span>Agendar atividade</span></button>` : ""}
        </section>

        <section class="agenda-control-panel">
          <div class="agenda-view-tabs" aria-label="VisualizaÃ§Ã£o da agenda">
            <button class="${state.agendaView === "day" ? "is-active" : ""}" type="button" data-agenda-view="day">Dia</button>
            <button class="${state.agendaView === "week" ? "is-active" : ""}" type="button" data-agenda-view="week">Semana</button>
            <button class="${state.agendaView === "month" ? "is-active" : ""}" type="button" data-agenda-view="month">MÃªs</button>
          </div>

          <div class="agenda-period-nav">
            <button class="icon-button" type="button" data-agenda-shift="-1" aria-label="PerÃ­odo anterior">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div class="agenda-period-label">
              ${icons.agenda}
              <strong>${escapeHtml(title)}</strong>
            </div>
            <button class="icon-button" type="button" data-agenda-shift="1" aria-label="PrÃ³ximo perÃ­odo">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
            </button>
            <button class="mini-button agenda-today-button" type="button" data-agenda-today>Hoje</button>
          </div>
        </section>

        <section class="panel agenda-calendar-panel" aria-label="Calendario da agenda">
          <div class="section-title">
            <div>
              <h3>${escapeHtml(title)}</h3>
              <span class="small-text">${items.length} item(ns) neste perÃ­odo</span>
            </div>
          </div>
          ${state.agendaView === "month" ? renderMonthCalendar(studentId) : state.agendaView === "week" ? renderWeekCalendar(studentId) : renderDaySchedule(studentId)}
          ${renderAgendaLegend()}
        </section>

        <section class="panel agenda-day-panel">
          <div class="section-title">
            <div>
              <h3>Itens do dia</h3>
              <span class="small-text">${formatLongDate(state.agendaDate)} Â· ${selectedDayItems.length} item(ns)</span>
            </div>
            ${state.agendaView !== "day" ? `<button class="mini-button" type="button" data-agenda-view="day">Ver dia</button>` : ""}
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
    const labels = ["SEG", "TER", "QUA", "QUI", "SEX", "SÃB", "DOM"];
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
    const labels = ["SEG", "TER", "QUA", "QUI", "SEX", "SÃB", "DOM"];
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
        ${items.length ? renderAgendaList(items, state.currentUser?.role === "manager") : emptyState("Nenhum item na agenda", "Treinos, avaliaÃ§Ãµes e atualizaÃ§Ãµes aparecerÃ£o aqui.")}
      </div>
    `;
  }

  function renderCalendarEventBlock(item, mode = "") {
    const studentName = getStudentName(item.studentId);
    return `
      <button class="day-event ${mode ? `is-${mode}` : ""} ${agendaItemClass(item)}" type="button" data-open-agenda-detail="${escapeHtml(item.id)}" data-agenda-date="${escapeHtml(item.date)}" data-agenda-student="${escapeHtml(item.studentId)}">
        <strong>${escapeHtml(activityLabel(item.type))}</strong>
        <span>${escapeHtml(item.time || "--:--")}${studentName ? ` Â· ${escapeHtml(shortName(studentName))}` : ""}</span>
      </button>
    `;
  }

  function renderAgendaList(items, manager) {
    if (!items.length) return emptyState("Nenhum item na agenda", "Treinos, avaliaÃ§Ãµes e atualizaÃ§Ãµes aparecerÃ£o aqui.");
    return `
      <div class="agenda-list">
        ${items
          .map(
            (item) => `
              <article class="agenda-item ${agendaItemClass(item)}">
                <div class="agenda-avatar">${escapeHtml(initialsFromName(getStudentName(item.studentId)))}</div>
                <span class="agenda-type-dot ${agendaItemClass(item)}" aria-hidden="true"></span>
                <div class="agenda-time">${escapeHtml(item.time || "--:--")}</div>
                <div class="agenda-main">
                  <strong>${escapeHtml(activityLabel(item.type))}</strong>
                  <span>${escapeHtml(getStudentName(item.studentId))}</span>
                  <small>${escapeHtml(item.title)}${item.duration ? ` Â· ${escapeHtml(item.duration)} min` : ""}</small>
                  ${item.notes ? `<span class="agenda-note">${escapeHtml(item.notes)}</span>` : ""}
                </div>
                <div class="agenda-status">${statusBadge(agendaStatusLabel(item.status), agendaStatusTone(item.status))}</div>
                <div class="row-actions">
                  ${manager && canEditAgendaItem(item) ? whatsappButton(item.id, item.studentId) : ""}
                  <button class="mini-button" type="button" data-open-agenda-detail="${escapeHtml(item.id)}" data-agenda-date="${escapeHtml(item.date)}" data-agenda-student="${escapeHtml(item.studentId)}">Detalhes</button>
                  ${item.type === "workout" && item.workoutId && state.currentUser?.role === "student" && item.status !== "done" ? `<button class="mini-button" type="button" data-start-workout="${item.workoutId}" data-activity-id="${item.id}">Iniciar treino</button>` : ""}
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    `;
  }

  function renderAgendaLegend() {
    const items = [
      ["workout", "Treino"],
      ["assessment", "AvaliaÃ§Ã£o"],
      ["update", "AtualizaÃ§Ã£o"],
      ["return", "Retorno"],
      ["contract", "Contrato"]
    ];
    return `<div class="agenda-legend">${items.map(([type, label]) => `<span><i class="agenda-type-dot is-type-${type}" aria-hidden="true"></i>${label}</span>`).join("")}</div>`;
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
          <span>${escapeHtml(getStudentName(item.studentId))} Â· ${activityLabel(item.type)}</span>
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
      assessment: "AvaliaÃ§Ã£o",
      reassessment: "ReavaliaÃ§Ã£o",
      update: "AtualizaÃ§Ã£o",
      return: "Retorno",
      contract: "Contrato",
      other: "Outro evento"
    }[type] || "Atividade";
  }

  function agendaStatusLabel(status) {
    return { scheduled: "Confirmado", pending: "Pendente", done: "ConcluÃ­do", sent: "Enviado", canceled: "Cancelado", missed: "NÃ£o realizado", contract_pending: "Contrato pendente" }[status] || "Confirmado";
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
    const item = findAgendaItem(itemId, date, studentId);
    if (!item) return showToast("Item da agenda nÃ£o encontrado.");
    const manager = state.currentUser?.role === "manager";
    const student = getStudent(item.studentId);
    openModal(
      item.title,
      `
        <div class="content-stack">
          <section class="panel agenda-detail-panel ${agendaItemClass(item)}">
            <div class="badge-row">${statusBadge(agendaStatusLabel(item.status), agendaStatusTone(item.status))}${statusBadge(activityLabel(item.type), "info")}</div>
            <div class="profile-grid">
              <article class="profile-card"><span>Data</span><strong>${formatLongDate(item.date)}</strong></article>
              <article class="profile-card"><span>HorÃ¡rio</span><strong>${escapeHtml(item.time || "--:--")}</strong></article>
              <article class="profile-card"><span>Aluno</span><strong>${escapeHtml(student?.name || "Aluno removido")}</strong></article>
              <article class="profile-card"><span>DuraÃ§Ã£o</span><strong>${escapeHtml(item.duration ? `${item.duration} min` : "-")}</strong></article>
            </div>
            ${item.notes ? `<p class="small-text">${escapeHtml(item.notes)}</p>` : ""}
          </section>
          <section class="panel">
            <div class="section-title"><h3>AÃ§Ãµes</h3><span class="small-text">OperaÃ§Ãµes disponÃ­veis para este item</span></div>
            <div class="form-actions">
              ${manager && item.studentId ? `<button class="secondary-action" type="button" data-open-student-profile="${escapeHtml(item.studentId)}">Abrir perfil do aluno</button>` : ""}
              ${manager && canEditAgendaItem(item) ? whatsappButton(item.id, item.studentId) : ""}
              ${manager && canEditAgendaItem(item) ? `<button class="secondary-action" type="button" data-open-activity-form="${escapeHtml(item.id)}">Editar/remarcar</button><button class="secondary-action" type="button" data-update-activity-status="${escapeHtml(item.id)}:done">Concluir</button><button class="secondary-action" type="button" data-update-activity-status="${escapeHtml(item.id)}:canceled">Cancelar</button><button class="danger-action" type="button" data-delete-activity="${escapeHtml(item.id)}">Remover</button>` : ""}
              ${item.type === "contract" && item.contractId ? `<button class="secondary-action" type="button" data-open-contract="${escapeHtml(item.contractId)}">Abrir contrato</button>` : ""}
              ${item.type === "update" && item.updateId && state.currentUser?.role === "student" && item.status === "pending" ? `<button class="primary-action" type="button" data-open-update-form="${escapeHtml(item.updateId)}">Enviar atualizaÃ§Ã£o</button>` : ""}
              ${item.type === "workout" && item.workoutId && state.currentUser?.role === "student" && item.status !== "done" ? `<button class="primary-action" type="button" data-start-workout="${escapeHtml(item.workoutId)}" data-activity-id="${escapeHtml(item.id)}">Iniciar treino</button>` : ""}
            </div>
            ${manager && !student?.phone ? `<p class="small-text">Este aluno nÃ£o possui telefone cadastrado. O WhatsApp fica indisponÃ­vel atÃ© atualizar o cadastro.</p>` : ""}
          </section>
        </div>
      `
    );
  }

  function renderStudentUpdates() {
    const student = getCurrentStudent();
    const updates = state.data.updates.filter((item) => item.studentId === student?.id).sort((a, b) => b.dueDate.localeCompare(a.dueDate));
    const pending = updates.find((item) => item.status === "pending");
    return `
      <div class="content-stack">
        ${pageHeader("AtualizaÃ§Ãµes", "Peso, fotos e observaÃ§Ãµes quinzenais")}
        <section class="panel">
          <div class="section-title"><h3>AtualizaÃ§Ã£o quinzenal</h3><span class="small-text">${pending ? `Pendente para ${formatDate(pending.dueDate)}` : "Sem pendÃªncia"}</span></div>
          ${pending ? `<button class="primary-action" type="button" data-open-update-form="${pending.id}">Enviar atualizaÃ§Ã£o</button>` : emptyState("Nenhuma atualizaÃ§Ã£o pendente", "A prÃ³xima pendÃªncia serÃ¡ criada automaticamente.")}
        </section>
        <section class="panel">
          <div class="section-title"><h3>HistÃ³rico de atualizaÃ§Ãµes</h3><span class="small-text">${updates.length} registro(s)</span></div>
          ${updates.length ? `<div class="entity-list">${updates.map(renderUpdateRow).join("")}</div>` : emptyState("Sem histÃ³rico", "Suas atualizaÃ§Ãµes enviadas aparecerÃ£o aqui.")}
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
            <h3>AtualizaÃ§Ãµes</h3>
            <p>Acompanhe peso, fotos e observaÃ§Ãµes.</p>
          </div>
        </section>
        <section class="updates-summary-grid">
          ${updateMetricCard({ icon: icons.updates, title: "Recebidas", value: receivedCount, subtitle: receivedCount ? "Aguardam avaliaÃ§Ã£o" : "Sem novos envios", tone: "success" })}
          ${updateMetricCard({ icon: icons.today, title: "Pendentes", value: pendingCount, subtitle: "Aguardando", tone: "warning" })}
          ${updateMetricCard({ icon: icons.settings, title: "Atrasadas", value: lateCount, subtitle: lateCount ? "Requerem atenÃ§Ã£o" : "Em dia", tone: "danger" })}
        </section>
        <section class="updates-filter-panel" aria-label="Filtros de atualizaÃ§Ãµes">
          <div class="update-filter-grid">
            ${updateFilterSelect("studentId", "Aluno", icons.students, [["", "Todos os alunos"], ...students.map((student) => [student.id, student.name])], filters.studentId)}
            ${updateFilterSelect("status", "Status", icons.updates, [
              ["all", "Todos os status"],
              ["sent", "Recebida"],
              ["pending", "Pendente"],
              ["late", "Atrasada"],
              ["viewed", "Avaliada"]
            ], filters.status)}
          </div>
          <details class="updates-extra-filter">
            <summary>
              <span class="update-filter-icon">${icons.agenda}</span>
              <span>
                <small>PerÃ­odo</small>
                <strong>${escapeHtml(updatePeriodFilterLabel(filters.period || "all"))}</strong>
              </span>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
            </summary>
            <div class="updates-extra-filter-grid">
              ${updateFilterSelect("period", "PerÃ­odo", icons.agenda, [
                ["all", "Todo perÃ­odo"],
                ["today", "Hoje"],
                ["week", "Esta semana"],
                ["month", "Este mÃªs"],
                ["custom", "Data exata"]
              ], filters.period || "all")}
              <label class="update-filter update-date-filter ${filters.period === "custom" ? "" : "is-muted"}">
                <span class="update-filter-icon">${icons.agenda}</span>
                <span class="update-filter-label">Data</span>
                <input type="date" data-update-filter="date" value="${escapeHtml(filters.date)}" ${filters.period === "custom" ? "" : "aria-label=\"Data exata opcional\""} />
              </label>
            </div>
          </details>
        </section>
        <section class="updates-list-panel">
          <div class="section-title">
            <div>
              <h3>AtualizaÃ§Ãµes dos alunos</h3>
              <span class="small-text">${updates.length} registro(s) encontrado(s)</span>
            </div>
          </div>
          ${updates.length ? `<div class="update-card-list">${updates.map(renderUpdateCard).join("")}</div>` : emptyState("Nenhuma atualizaÃ§Ã£o encontrada", "As atualizaÃ§Ãµes dos alunos aparecerÃ£o aqui. Ajuste os filtros ou aguarde novos envios.")}
        </section>
      </div>
    `;
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
            <span><i class="${meta.dotClass}"></i>${escapeHtml(meta.label)} <em>â€¢</em> ${escapeHtml(updateMomentLabel(update))}</span>
          </div>
          <details class="action-menu update-card-menu">
            <summary aria-label="Mais aÃ§Ãµes">${icons.more}</summary>
            <div>
              <button class="mini-button" type="button" data-open-update-comment="${escapeHtml(update.id)}">Ver detalhes</button>
              ${student ? `<button class="mini-button" type="button" data-open-student-profile="${escapeHtml(student.id)}">Abrir perfil</button>` : ""}
              ${state.currentUser?.role === "manager" && update.status === "sent" ? `<button class="mini-button" type="button" data-mark-update-viewed="${escapeHtml(update.id)}">Marcar avaliada</button>` : ""}
            </div>
          </details>
        </div>
        <div class="update-card-body">
          <div class="update-weight-panel">
            <span>VariaÃ§Ã£o de peso</span>
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
    if (!notes.length) return `<p class="update-card-note">Sem observaÃ§Ãµes do aluno.</p>`;
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
      all: "Todo perÃ­odo",
      today: "Hoje",
      week: "Esta semana",
      month: "Este mÃªs",
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
                    ? `<img src="${escapeHtml(photo)}" alt="Foto ${escapeHtml(label)} da atualizaÃ§Ã£o" loading="lazy" />`
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
    return { label: "Recebida", className: "is-received", dotClass: "is-success", extra: "Aguardando avaliaÃ§Ã£o" };
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
        deltaLabel: "â€” â€”",
        currentLabel: "â€”",
        previousLabel: previousUpdate ? formatWeight(previous) : "â€”",
        className: "is-pending",
        hasCurrent: false
      };
    }
    if (!Number.isFinite(previous)) {
      return {
        deltaLabel: "â€”",
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
    if (!Number.isFinite(value)) return "â€”";
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
          <span>Vencimento: ${formatDate(update.dueDate)}${update.submittedAt ? ` Â· Enviada em ${formatDate(update.submittedAt.slice(0, 10))}` : ""}</span>
          ${update.weight ? `<span>Peso: ${escapeHtml(update.weight)} kg Â· Energia: ${escapeHtml(update.energy || "-")}/5 Â· Dor: ${escapeHtml(update.pain || "-")}/5</span>` : ""}
          ${update.trainingNotes ? `<span>Treino: ${escapeHtml(update.trainingNotes)}</span>` : ""}
          ${update.dietNotes ? `<span>Dieta: ${escapeHtml(update.dietNotes)}</span>` : ""}
          ${update.generalNotes ? `<span>Geral: ${escapeHtml(update.generalNotes)}</span>` : ""}
          ${update.trainerComment ? `<span>ComentÃ¡rio do personal: ${escapeHtml(update.trainerComment)}</span>` : ""}
          ${update.photos?.length ? `<div class="photo-grid">${update.photos.map((photo) => `<img src="${photo}" alt="Foto de evoluÃ§Ã£o" />`).join("")}</div>` : ""}
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
    const sessions = getStudentSessions(studentId);
    const updateWeights = state.data.updates
      .filter((update) => update.studentId === studentId && update.weight && update.status !== "pending")
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const exerciseProgress = buildExerciseProgress(studentId);
    return `
      <div class="content-stack">
        ${state.currentUser?.role === "student" ? pageHeader("EvoluÃ§Ã£o", "HistÃ³rico de treinos, cargas e peso") : ""}
        <section class="metric-grid">
          ${metricCard("Semana", sessionsThisWeek(studentId).length)}
          ${metricCard("MÃªs", sessionsThisMonth(studentId).length)}
          ${metricCard("Treinos realizados", sessions.length)}
          ${metricCard("Volume total", sessions.reduce((sum, session) => sum + Number(session.totalVolumeLoad || 0), 0))}
        </section>
        <section class="panel">
          <div class="section-title"><h3>Ãšltimos treinos</h3><span class="small-text">Volume load</span></div>
          ${sessions.length ? `<div class="entity-list">${sessions.slice(0, 8).map(renderSessionRow).join("")}</div>` : emptyState("Nenhum treino finalizado", "Finalize um treino para gerar histÃ³rico e evoluÃ§Ã£o.")}
        </section>
        <section class="panel">
          <div class="section-title"><h3>EvoluÃ§Ã£o por exercÃ­cio</h3><span class="small-text">Maior carga registrada</span></div>
          ${exerciseProgress.length ? `<div class="entity-list">${exerciseProgress.map((item) => `<article class="entity-row"><div class="entity-main"><strong>${escapeHtml(item.name)}</strong><span>Maior carga: ${item.maxLoad} Â· Volume acumulado: ${item.volume}</span></div></article>`).join("")}</div>` : emptyState("Sem dados de carga", "Registre carga e repetiÃ§Ãµes durante a execuÃ§Ã£o do treino.")}
        </section>
        <section class="panel">
          <div class="section-title"><h3>Peso corporal</h3><span class="small-text">AtualizaÃ§Ãµes</span></div>
          ${updateWeights.length ? `<div class="entity-list">${updateWeights.map((item) => `<article class="entity-row"><div class="entity-main"><strong>${escapeHtml(item.weight)} kg</strong><span>${formatDate(item.dueDate)}</span></div></article>`).join("")}</div>` : emptyState("Sem peso registrado", "O peso informado nas atualizaÃ§Ãµes aparecerÃ¡ aqui.")}
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
          <span>${escapeHtml(getStudentName(session.studentId))} Â· ${formatDate(session.finishedAt.slice(0, 10))}</span>
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
      if (contract.endDate && contract.endDate <= addDays(todayISO(), 30)) return { key: "upcoming", label: "PrÃ³ximo vencimento", className: "is-upcoming", badgeClass: "is-warning" };
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
          <span>${escapeHtml(contract.title)} Â· VersÃ£o ${escapeHtml(contract.version)}</span>
          <span>Criado em ${formatDate(contract.createdAt.slice(0, 10))}${contract.signedAt ? ` Â· Assinado em ${formatDate(contract.signedAt.slice(0, 10))}` : ""}${contract.emailSentAt || contract.linkSentAt ? ` Â· Link enviado em ${formatDate(String(contract.emailSentAt || contract.linkSentAt).slice(0, 10))}` : ""}</span>
          <div class="badge-row"><span class="badge ${meta.badgeClass}">${escapeHtml(meta.label)}</span></div>
        </div>
        <div class="row-actions contract-actions">
          <button class="mini-button" type="button" data-open-contract="${escapeHtml(contract.id)}">Abrir</button>
          ${
            manager && contract.status !== "signed" && contract.status !== "canceled"
              ? `<details class="action-menu"><summary>Mais aÃ§Ãµes</summary><div><button class="mini-button" type="button" data-open-contract-form="${escapeHtml(contract.studentId)}" data-contract-id="${escapeHtml(contract.id)}">Editar</button><button class="mini-button" type="button" data-send-contract-link="${escapeHtml(contract.id)}">Enviar link</button><button class="mini-button is-danger" type="button" data-cancel-contract="${escapeHtml(contract.id)}">Cancelar</button></div></details>`
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
            <span class="small-text">VersÃ£o ${escapeHtml(contract.version)}</span>
          </div>
          <p class="contract-body">${escapeHtml(contract.body)}</p>
          <div class="form-actions">
            <button class="primary-action" type="button" data-sign-contract="${escapeHtml(contract.id)}">Aceitar e assinar</button>
            <button class="secondary-action" type="button" data-open-contract="${escapeHtml(contract.id)}">Ver em detalhe</button>
            <button class="ghost-button" type="button" data-logout>Sair</button>
          </div>
          <p class="small-text">O aceite Ã© interno do app e registra data, versÃ£o e identificaÃ§Ã£o tÃ©cnica disponÃ­vel.</p>
        </section>
      </div>
    `;
  }

  function renderConversation(studentId, compact = false) {
    const messages = getStudentMessages(studentId);
    if (!messages.length) return emptyState("Sem mensagens", "Use o campo abaixo para iniciar a conversa.");
    const visible = compact ? messages.slice(-4) : messages;
    return `
      <div class="chat-list ${compact ? "is-compact" : ""}">
        ${visible
          .map(
            (message) => `
              <article class="chat-message ${message.senderRole === "manager" ? "is-manager" : "is-student"}">
                <strong>${message.senderRole === "manager" ? "Personal" : getStudentName(message.studentId)}</strong>
                <span>${escapeHtml(messageMomentLabel(message.createdAt))}</span>
                <p>${escapeHtml(message.body)}</p>
              </article>
            `
          )
          .join("")}
      </div>
    `;
  }

  function renderStudentProfile() {
    const student = getCurrentStudent();
    const contracts = getStudentContracts(student?.id);
    const pendingContracts = contracts.filter((contract) => contract.status === "pending" || contract.status === "viewed");
    const pendingUpdate = state.data.updates.find((update) => update.studentId === student?.id && update.status === "pending");
    const diet = getCurrentDietPlanForStudent(student?.id);
    const dietMeta = diet ? dietStatusMeta(diet) : null;
    return `
      <div class="content-stack">
        ${pageHeader("Mais", "Conta, contratos, mensagens e app", '<button class="pill-button" type="button" data-install-trigger>Baixar app</button>')}
        <section class="panel">
          <div class="profile-hero">
            <div>
              <span class="eyebrow">Aluno</span>
              <h3>${escapeHtml(student?.name || "Aluno")}</h3>
              <p>${escapeHtml(student?.goal || "Sem objetivo cadastrado")}</p>
            </div>
            ${statusBadge(student?.status === "active" ? "Ativo" : "Inativo", student?.status === "active" ? "success" : "danger")}
          </div>
          <div class="quick-grid more-grid">
            <button class="quick-link" type="button" data-student-nav="updates"><strong>AtualizaÃ§Ãµes</strong><span>${pendingUpdate ? `Pendente ${formatDate(pendingUpdate.dueDate)}` : "HistÃ³rico quinzenal"}</span></button>
            <button class="quick-link" type="button" data-open-messages="${escapeHtml(student?.id || "")}"><strong>Mensagens</strong><span>${state.socketReady ? "Tempo real ativo" : "Modo local"}</span></button>
            <button class="quick-link" type="button" data-student-nav="progress"><strong>EvoluÃ§Ã£o</strong><span>Treinos e volume load</span></button>
            <button class="quick-link" type="button" data-student-nav="agenda"><strong>Agenda</strong><span>Treinos e pendÃªncias</span></button>
          </div>
        </section>
        <section class="panel student-diet-overview">
          <div class="section-title">
            <h3>Dieta</h3>
            <span class="small-text">${diet ? escapeHtml(dietMeta.label) : "Sem plano ativo"}</span>
          </div>
          ${
            diet
              ? renderStudentDietOverview(diet)
              : emptyState("Plano alimentar nao disponivel", "Quando o personal liberar um plano, ele aparecera aqui.")
          }
        </section>
        <section class="panel">
          <div class="section-title"><h3>Contratos</h3><span class="small-text">${pendingContracts.length} pendente(s)</span></div>
          ${contracts.length ? `<div class="entity-list">${contracts.map((contract) => renderContractRow(contract, false)).join("")}</div>` : emptyState("Nenhum contrato", "Contratos enviados pelo personal aparecerÃ£o aqui.")}
        </section>
        <section class="panel">
          <div class="section-title"><h3>Dados da conta</h3><span class="small-text">InformaÃ§Ãµes principais</span></div>
          <div class="profile-grid">
            <article class="profile-card"><span>E-mail</span><strong>${escapeHtml(student?.email || "-")}</strong></article>
            <article class="profile-card"><span>Telefone</span><strong>${escapeHtml(student?.phone || "-")}</strong></article>
          </div>
          <button class="secondary-action" type="button" data-logout>Sair</button>
        </section>
      </div>
    `;
  }

  function renderStudentDietOverview(plan) {
    const meals = Array.isArray(plan.meals) ? plan.meals.filter((meal) => meal.name || meal.items || meal.notes) : [];
    return `
      <div class="student-diet-card">
        <div class="profile-grid">
          <article class="profile-card"><span>Protocolo</span><strong>${escapeHtml(plan.protocol || plan.title || "Plano alimentar")}</strong></article>
          <article class="profile-card"><span>Objetivo</span><strong>${escapeHtml(plan.objective || "Acompanhamento")}</strong></article>
          <article class="profile-card"><span>Refeicoes</span><strong>${escapeHtml(String(plan.mealCount || meals.length || "-"))}</strong></article>
          <article class="profile-card"><span>Proxima revisao</span><strong>${plan.nextReviewDate ? formatShortDate(plan.nextReviewDate) : "A definir"}</strong></article>
        </div>
        ${
          meals.length
            ? `<div class="diet-meal-list">${meals.slice(0, 6).map((meal) => `
                <article class="diet-meal-item">
                  <strong>${escapeHtml(meal.name || "Refeicao")}</strong>
                  <span>${escapeHtml([meal.time, meal.items].filter(Boolean).join(" - ") || "Orientacao registrada")}</span>
                  ${meal.notes ? `<small>${escapeHtml(meal.notes)}</small>` : ""}
                </article>
              `).join("")}</div>`
            : `<p class="small-text">${escapeHtml(plan.instructions || plan.notes || "As orientacoes do plano aparecerao aqui.")}</p>`
        }
      </div>
    `;
  }

  function renderSettings() {
    const previewActivity = { title: "Treino A", date: "2026-06-10", time: "19:00" };
    const previewStudent = { name: "JoÃ£o" };
    const preview = buildWhatsAppMessage(previewActivity, previewStudent);
    const contractPreviewStudent = { name: "JoÃ£o", email: "joao@email.com", phone: "(34) 99999-0000" };
    const contractPreview = renderTemplate(state.data.settings.contractEmailMessage, contractVariables(contractPreviewStudent, { plan: "Plano mensal", value: "R$ 300,00" }, "https://app/contrato"));
    return `
      <div class="content-stack">
        ${pageHeader("ConfiguraÃ§Ãµes", "Identidade do personal e comunicaÃ§Ã£o")}
        <section class="panel">
          <div class="section-title"><h3>Personal e WhatsApp</h3><span class="small-text">Usado nos contatos da agenda</span></div>
          <form class="form-grid" id="settingsForm">
            <div class="form-grid two">
              <label class="field"><span>Nome do personal</span><input name="trainerName" type="text" value="${escapeHtml(state.data.settings.trainerName)}" required /></label>
              <label class="field"><span>Telefone do personal</span><input name="trainerPhone" type="tel" value="${escapeHtml(state.data.settings.trainerPhone)}" /></label>
              <label class="field"><span>E-mail de contato</span><input name="contactEmail" type="email" value="${escapeHtml(state.data.settings.contactEmail)}" /></label>
            </div>
            <label class="field"><span>Mensagem padrÃ£o</span><textarea name="whatsappTemplate" required>${escapeHtml(state.data.settings.whatsappTemplate)}</textarea></label>
            <p class="small-text">VocÃª pode usar: {aluno}, {data}, {hora}, {atividade}, {personal}, {dia_semana}</p>
            <div class="preview-box"><strong>PrÃ©via</strong><span>${escapeHtml(preview)}</span></div>
            <div class="section-title"><h3>Contrato e e-mail</h3><span class="small-text">Modelo usado no aceite interno</span></div>
            <label class="field"><span>Assunto do e-mail de contrato</span><input name="contractEmailSubject" type="text" value="${escapeHtml(state.data.settings.contractEmailSubject)}" required /></label>
            <label class="field"><span>Mensagem do e-mail de contrato</span><textarea name="contractEmailMessage" required>${escapeHtml(state.data.settings.contractEmailMessage)}</textarea></label>
            <label class="field"><span>Assinatura do e-mail</span><textarea name="contractEmailSignature">${escapeHtml(state.data.settings.contractEmailSignature)}</textarea></label>
            <label class="field"><span>Modelo padrÃ£o de contrato</span><textarea name="contractTemplate" required>${escapeHtml(state.data.settings.contractTemplate)}</textarea></label>
            <p class="small-text">VariÃ¡veis: {aluno}, {cpf}, {telefone}, {email}, {personal}, {plano}, {valor}, {data_inicio}, {data_fim}, {quantidade_aulas}, {data_assinatura}, {link_contrato}, {data}.</p>
            <div class="preview-box"><strong>PrÃ©via do e-mail</strong><span>${escapeHtml(contractPreview)}</span></div>
            <button class="primary-action" type="submit">Salvar configuraÃ§Ãµes</button>
          </form>
        </section>
        <section class="panel demo-only">
          <div class="section-title"><h3>Sistema local</h3><span class="small-text">Ferramentas de teste</span></div>
          <div class="profile-grid">
            <article class="profile-card"><span>Dados</span><strong>${state.data.students.length} alunos</strong><small>${state.data.exercises.length} exercÃ­cios Â· ${state.data.workouts.length} treinos Â· ${state.data.sessions.length} histÃ³ricos</small></article>
            <article class="profile-card"><span>Admin</span><strong>${ADMIN.email}</strong><small>Senha de teste: Admin@2026</small></article>
          </div>
          <p class="small-text">A produÃ§Ã£o com autenticaÃ§Ã£o forte e redefiniÃ§Ã£o por link depende do backend ativo.</p>
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
            <p>Treino em execuÃ§Ã£o</p>
            <h3>${escapeHtml(workout?.title || "Treino")}</h3>
            <span>${doneSets}/${totalSets} sÃ©ries concluÃ­das Â· Volume atual ${calculateSessionVolume(session)}</span>
          </div>
          <button class="secondary-action" type="button" data-cancel-active-session>Cancelar</button>
        </section>
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
    const status = done === exercise.sets.length ? "ConcluÃ­do" : done > 0 ? "Em andamento" : "Pendente";
    return `
      <section class="panel exercise-execution">
        <div class="section-title">
          <h3>${escapeHtml(exercise.name)}</h3>
          <span class="badge ${status === "ConcluÃ­do" ? "is-success" : status === "Em andamento" ? "is-info" : ""}">${status}</span>
        </div>
        ${libraryExercise ? videoActionHtml(libraryExercise) : ""}
        <p class="small-text">${escapeHtml(libraryExercise?.description || "Sem descriÃ§Ã£o cadastrada.")}</p>
        ${exercise.coachNotes ? `<p class="small-text">ObservaÃ§Ã£o do professor: ${escapeHtml(exercise.coachNotes)}</p>` : ""}
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
    return `
      <article class="set-row ${done ? "is-done" : running ? "is-running" : ""}">
        <div>
          <strong>SÃ©rie ${setIndex + 1}</strong>
          <span>Alvo: ${escapeHtml(exercise.targetReps)} reps Â· SugestÃ£o: ${escapeHtml(exercise.suggestedLoad || "-")} Â· Descanso: ${exercise.restSeconds}s</span>
        </div>
        <label><span>Carga</span><input type="number" step="0.5" min="0" value="${escapeHtml(set.load)}" data-set-load="${exerciseIndex}:${setIndex}" ${inputsDisabled ? "disabled" : ""} /></label>
        <label><span>Reps</span><input type="number" step="1" min="0" value="${escapeHtml(set.reps)}" data-set-reps="${exerciseIndex}:${setIndex}" ${inputsDisabled ? "disabled" : ""} /></label>
        <div class="row-actions">
          ${done ? `<span class="badge is-success">Volume ${set.volumeLoad}</span>` : `<button class="mini-button" type="button" data-series-action="${exerciseIndex}:${setIndex}" ${actionAvailable ? "" : "disabled"}>${running ? "Finalizar sÃ©rie" : "Iniciar sÃ©rie"}</button>`}
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

  function openModal(title, body) {
    elements.modalTitle.textContent = fixMojibake(title);
    elements.modalBody.innerHTML = body;
    scrubVisibleText(elements.modalBody);
    elements.modal.hidden = false;
    document.body.style.overflow = "hidden";
    const first = elements.modalBody.querySelector("input, select, textarea, button");
    if (first) first.focus({ preventScroll: true });
  }

  function closeModal() {
    elements.modal.hidden = true;
    elements.modalBody.innerHTML = "";
    document.body.style.overflow = "";
  }

  function studentOptions(selected = "") {
    if (!state.data.students.length) return '<option value="">Cadastre um aluno primeiro</option>';
    return state.data.students.map((student) => `<option value="${student.id}" ${student.id === selected ? "selected" : ""}>${escapeHtml(student.name)}</option>`).join("");
  }

  function exerciseOptions(selected = "") {
    const active = state.data.exercises.filter((exercise) => exercise.status === "active");
    if (!active.length) return '<option value="">Cadastre exercÃ­cios primeiro</option>';
    return active.map((exercise) => `<option value="${exercise.id}" ${exercise.id === selected ? "selected" : ""}>${escapeHtml(exercise.name)} Â· ${escapeHtml(getExercisePrimaryMuscle(exercise))}</option>`).join("");
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
          <div class="empty-state">
            <strong>${student.id ? access.label : "Convite de acesso"}</strong>
            <span>${student.id ? escapeHtml(access.detail) : "Ao salvar, o sistema gera um link para o aluno criar a propria senha. O gestor nao define nem visualiza senha de aluno."}</span>
          </div>
          <label class="field"><span>ObservaÃ§Ãµes internas</span><textarea name="internalNotes">${escapeHtml(student.internalNotes)}</textarea></label>
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
          ${pageHeader("Aluno", "Perfil nÃ£o encontrado", '<button class="secondary-action" type="button" data-manager-nav="students">Voltar para alunos</button>')}
          ${emptyState("Aluno nÃ£o encontrado", "Volte para a lista de alunos e abra um cadastro vÃ¡lido.")}
        </div>
      `;
    }
    state.activeStudentProfileId = student.id;
    const stats = getStudentProfileStats(student);
    const access = getStudentAccessState(student);
    return `
      <div class="content-stack student-page">
        <section class="student-profile-topbar">
          <button class="icon-button back-button" type="button" data-manager-nav="students" aria-label="Voltar para alunos">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div>
            <span class="eyebrow">Elite AS</span>
            <h3>Perfil do aluno</h3>
            <p>Acompanhamento completo de agenda, treinos, evoluÃ§Ã£o e relacionamento.</p>
          </div>
          <div class="student-profile-top-actions">
            <button class="secondary-action" type="button" data-send-student-invite="${student.id}">${access.value === "active" ? "Enviar link" : "Reenviar convite"}</button>
            <button class="primary-action" type="button" data-open-student-form="${student.id}">Editar aluno</button>
          </div>
        </section>
        ${renderStudentProfileHero(student, stats)}
        ${renderStudentSummaryCards(student, stats)}
        ${renderProfileTabs(state.profileTab)}
        ${renderStudentProfileTab(student, state.profileTab)}
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

  function renderStudentProfileHero(student, providedStats = null) {
    const stats = providedStats || getStudentProfileStats(student);
    const access = getStudentAccessState(student);
    const status = getStudentOperationalStatus(student);
    const contract = getStudentContractState(student.id);
    return `
      <section class="profile-hero student-profile-hero">
        <div class="student-hero-main">
          ${studentAvatar(student)}
          <div class="student-hero-identity">
            <h3>${escapeHtml(student.name)}</h3>
            <p>Objetivo: ${escapeHtml(student.goal || "Sem objetivo cadastrado")}</p>
            <div class="badge-row">
              ${statusBadge(status.label, status.tone)}
              ${statusBadge(access.label, access.tone)}
              ${statusBadge(`Contrato: ${contract.label}`, contract.tone)}
            </div>
          </div>
          <details class="action-menu student-hero-menu">
            <summary aria-label="Mais aÃ§Ãµes">${icons.more}</summary>
            <div>
              <button class="mini-button" type="button" data-open-student-form="${student.id}">Editar dados</button>
              <button class="mini-button" type="button" data-open-workout-form data-prefill-student="${student.id}">Novo treino</button>
              <button class="mini-button" type="button" data-open-activity-form data-prefill-student="${student.id}">Agendar atividade</button>
              <button class="mini-button" type="button" data-open-contract-form="${student.id}">Novo contrato</button>
            </div>
          </details>
        </div>
        <div class="student-hero-details">
          <article>${icons.profile}<span>Telefone</span><strong>${escapeHtml(student.phone || "-")}</strong></article>
          <article>${icons.messages}<span>E-mail</span><strong>${escapeHtml(student.email)}</strong></article>
          <article>${icons.settings}<span>Acesso</span><strong>${escapeHtml(access.label)}</strong></article>
          <article>${icons.workouts}<span>Ãšltimo treino</span><strong>${stats.lastSession ? formatShortDate(stats.lastSession.finishedAt.slice(0, 10)) : "Nunca"}</strong></article>
          <article>${icons.agenda}<span>PrÃ³xima atividade</span><strong>${stats.nextActivity ? `${formatShortDate(stats.nextActivity.date)} Â· ${escapeHtml(stats.nextActivity.time || "--:--")}` : "Sem agendamento"}</strong></article>
          <article>${icons.updates}<span>Ãšltima atualizaÃ§Ã£o</span><strong>${stats.lastUpdate ? formatShortDate(String(stats.lastUpdate.submittedAt || stats.lastUpdate.dueDate).slice(0, 10)) : "Nenhuma"}</strong></article>
          <article>${icons.today}<span>PrÃ³xima atualizaÃ§Ã£o</span><strong>${stats.pendingUpdate ? formatShortDate(stats.pendingUpdate.dueDate) : "Em dia"}</strong></article>
          <article>${icons.contracts}<span>Contrato</span><strong>${escapeHtml(contract.label)}</strong></article>
          <article>${icons.agenda}<span>Treinos na semana</span><strong>${stats.sessionsWeek.length}</strong></article>
          <article>${icons.progress}<span>Treinos no mÃªs</span><strong>${stats.sessionsMonth.length}</strong></article>
        </div>
      </section>
    `;
  }

  function renderStudentSummaryCards(student, stats = getStudentProfileStats(student)) {
    const access = getStudentAccessState(student);
    const contract = getStudentContractState(student.id);
    const diet = getCurrentDietPlanForStudent(student.id);
    const dietMeta = diet ? dietStatusMeta(diet) : { label: "Sem plano", tone: "warning" };
    return `
      <section class="student-summary-grid">
        ${profileSummaryCard(icons.profile, "Acesso", access.label, access.detail, access.tone)}
        ${profileSummaryCard(icons.diet, "Dieta", diet ? dietMeta.label : "Sem plano", diet ? `${diet.protocol || diet.title || "Plano alimentar"} Â· revisÃ£o ${diet.nextReviewDate ? formatShortDate(diet.nextReviewDate) : "a definir"}` : "Plano alimentar nÃ£o criado", dietMeta.tone)}
        ${profileSummaryCard(icons.contracts, "Contrato", contract.contract?.endDate ? formatShortDate(contract.contract.endDate) : contract.label, contract.contract ? "VigÃªncia e status" : "Nenhum contrato enviado", contract.tone)}
        ${profileSummaryCard(icons.updates, "Ãšltima atualizaÃ§Ã£o", stats.lastUpdate ? formatShortDate(String(stats.lastUpdate.submittedAt || stats.lastUpdate.dueDate).slice(0, 10)) : "Nenhuma", stats.lastUpdate ? "Registro enviado" : "Sem envio registrado")}
        ${profileSummaryCard(icons.workouts, "PrÃ³ximo treino", stats.nextActivity ? formatShortDate(stats.nextActivity.date) : "Sem agenda", stats.nextActivity ? `${activityLabel(stats.nextActivity.type)} Â· ${stats.nextActivity.time || "--:--"}` : "Nenhuma atividade marcada")}
        ${profileSummaryCard(icons.agenda, "Treinos na semana", `${stats.sessionsWeek.length}`, stats.sessionsWeek.length ? "ConcluÃ­dos nesta semana" : "Sem treino concluÃ­do")}
        ${profileSummaryCard(icons.progress, "Volume recente", stats.recentVolume, "Volume load dos Ãºltimos 4 treinos")}
      </section>
    `;
  }

  function profileSummaryCard(icon, label, value, detail = "", tone = "") {
    return `
      <article class="profile-card student-summary-card ${tone ? `is-${tone}` : ""}">
        <span class="profile-card-icon">${icon}</span>
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(String(value))}</strong>
        ${detail ? `<small>${escapeHtml(detail)}</small>` : ""}
      </article>
    `;
  }

  function renderProfileTabs(activeTab) {
    const tabs = [
      ["summary", "VisÃ£o geral"],
      ["workouts", "Treinos"],
      ["agenda", "Agenda"],
      ["history", "HistÃ³rico"],
      ["progress", "EvoluÃ§Ã£o"],
      ["updates", "AtualizaÃ§Ãµes"],
      ["contracts", "Contrato"],
      ["messages", "Mensagens"],
      ["notes", "ObservaÃ§Ãµes"]
    ];
    return `
      <div class="tab-row student-profile-tabs" role="tablist" aria-label="SeÃ§Ãµes do perfil">
        ${tabs.map(([id, label]) => `<button class="${activeTab === id ? "is-active" : ""}" type="button" data-profile-tab="${id}">${profileTabLabel(id, label)}</button>`).join("")}
      </div>
    `;
  }

  function profileTabLabel(id, fallback = "") {
    const labels = {
      summary: "VisÃ£o geral",
      workouts: "Treinos",
      agenda: "Agenda",
      history: "HistÃ³rico",
      progress: "EvoluÃ§Ã£o",
      updates: "AtualizaÃ§Ãµes",
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
              <span class="small-text">${workouts.length} treino(s) Â· ${published.length} publicado(s) Â· ${drafts.length} rascunho(s) Â· ${archived.length} arquivado(s)</span>
            </div>
            <div class="section-actions">
              <button class="mini-button" type="button" data-open-workout-form data-prefill-student="${student.id}">Novo treino</button>
              <button class="mini-button" type="button" data-open-student-pattern-workout="${student.id}" ${availablePatterns.length ? "" : "disabled"}>Aplicar padrÃ£o</button>
            </div>
          </div>
          <div class="quick-grid student-profile-actions">
            <button class="quick-link" type="button" data-open-workout-form data-prefill-student="${student.id}"><strong>Novo treino</strong><span>Monte com exercÃ­cios da biblioteca</span></button>
            <button class="quick-link" type="button" data-open-student-pattern-workout="${student.id}" ${availablePatterns.length ? "" : "disabled"}><strong>Aplicar padrÃ£o</strong><span>${availablePatterns.length ? `${availablePatterns.length} padrÃ£o(s) disponÃ­vel(is)` : "Nenhum padrÃ£o disponÃ­vel"}</span></button>
          </div>
          ${workouts.length ? `<div class="workout-list">${workouts.map((workout) => renderWorkoutCard(workout, true)).join("")}</div>` : emptyState("Nenhum treino publicado", "Crie um treino do zero ou aplique um padrÃ£o.")}
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
              : emptyState("Aluno sem plano alimentar", "Crie um plano para iniciar o acompanhamento alimentar.")
          }
        </section>
      `;
    }

    if (tab === "history") {
      return `<section class="panel"><div class="section-title"><h3>HistÃ³rico de treinos</h3><span class="small-text">${sessions.length} treino(s)</span></div>${sessions.length ? `<div class="entity-list">${sessions.map(renderSessionRow).join("")}</div>` : emptyState("Sem histÃ³rico", "Treinos finalizados pelo aluno aparecerÃ£o aqui.")}</section>`;
    }

    if (tab === "progress") return renderStudentEvolutionPanel(student.id, true);

    if (tab === "updates") {
      return `<section class="panel"><div class="section-title"><h3>AtualizaÃ§Ãµes quinzenais</h3><span class="small-text">${updates.length} registro(s)</span></div>${updates.length ? `<div class="entity-list">${updates.map(renderUpdateRow).join("")}</div>` : emptyState("Sem atualizaÃ§Ãµes", "O histÃ³rico de atualizaÃ§Ãµes aparecerÃ¡ aqui.")}</section>`;
    }

    if (tab === "contracts") {
      return `
        <section class="panel">
          <div class="section-title"><h3>Contrato</h3><button class="mini-button" type="button" data-open-contract-form="${student.id}">Novo contrato</button></div>
          ${contracts.length ? `<div class="entity-list">${contracts.map((contract) => renderContractRow(contract, true)).join("")}</div>` : emptyState("Sem contratos", "Crie um contrato para o aluno aceitar dentro do app.")}
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
          <div class="section-title"><h3>ObservaÃ§Ãµes internas</h3><button class="mini-button" type="button" data-open-student-form="${student.id}">Editar aluno</button></div>
          <div class="profile-grid">
            <article class="profile-card"><span>E-mail</span><strong>${escapeHtml(student.email)}</strong></article>
            <article class="profile-card"><span>Telefone</span><strong>${escapeHtml(student.phone || "-")}</strong></article>
          </div>
          <div class="action-panel inline-action">${whatsappButton(nextActivity?.id || "", student.id)}<button class="mini-button is-danger" type="button" data-delete-student="${student.id}">Remover aluno</button></div>
          <p class="small-text">${escapeHtml(student.internalNotes || "Nenhuma observaÃ§Ã£o interna.")}</p>
        </section>
      `;
    }

    return `
      <section class="profile-overview-grid">
        <article class="panel">
          <div class="section-title"><h3>PrÃ³xima atividade</h3><button class="mini-button" type="button" data-open-activity-form data-prefill-student="${student.id}">Agendar</button></div>
          ${
            nextActivity
              ? `<div class="entity-list">${renderAgendaCompact(nextActivity, true)}</div>`
              : emptyState("Sem prÃ³xima atividade", "Agende um treino ou atualizaÃ§Ã£o para este aluno.")
          }
        </article>
        <article class="panel">
          <div class="section-title"><h3>Ãšltimos treinos</h3><span class="small-text">${sessions.length} registro(s)</span></div>
          ${sessions.length ? `<div class="entity-list">${sessions.slice(0, 3).map(renderSessionRow).join("")}</div>` : emptyState("Sem histÃ³rico", "Treinos finalizados aparecerÃ£o aqui.")}
        </article>
        <article class="panel">
          <div class="section-title"><h3>AtualizaÃ§Ãµes recentes</h3><span class="small-text">${updates.length} registro(s)</span></div>
          ${updates.length ? `<div class="entity-list">${updates.slice(0, 3).map(renderUpdateRow).join("")}</div>` : emptyState("Sem atualizaÃ§Ãµes", "AtualizaÃ§Ãµes quinzenais aparecerÃ£o aqui.")}
        </article>
        <article class="panel">
          <div class="section-title"><h3>PendÃªncias</h3><span class="small-text">${stats.pendingCount} item(ns)</span></div>
          <div class="profile-grid">
            <article class="profile-card"><span>AtualizaÃ§Ã£o</span><strong>${pending ? formatDate(pending.dueDate) : "Em dia"}</strong></article>
            <article class="profile-card"><span>Contrato</span><strong>${escapeHtml(stats.contract.label)}</strong></article>
          </div>
          ${stats.pendingCount ? "" : emptyState("Sem pendÃªncias crÃ­ticas", "Nada exige aÃ§Ã£o imediata neste momento.")}
        </article>
      </section>
      <section class="panel">
        <div class="section-title"><h3>AÃ§Ãµes rÃ¡pidas</h3><span class="small-text">Principais operaÃ§Ãµes do aluno</span></div>
        <div class="quick-grid">
          <button class="quick-link" type="button" data-open-workout-form data-prefill-student="${student.id}"><strong>Novo treino</strong><span>Montar e publicar</span></button>
          <button class="quick-link" type="button" data-open-activity-form data-prefill-student="${student.id}"><strong>Agendar atividade</strong><span>Treino ou atualizaÃ§Ã£o</span></button>
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
      ? `${formatShortDate(nextActivity.date)} â€¢ ${nextActivity.time || "--:--"}`
      : "Agende uma atividade ou crie um treino para este aluno.";
    const lastTitle = latestWorkout?.title || (latestSession ? "Treino concluÃ­do" : "Sem histÃ³rico");
    const lastSubtitle = latestSession
      ? `${formatShortDate(latestSession.finishedAt)} â€¢ ${Number(latestSession.totalVolumeLoad || 0).toLocaleString("pt-BR")} kg`
      : "Treinos finalizados aparecerÃ£o aqui.";

    return `
      <section class="profile-overview-grid profile-activity-grid">
        ${renderProfileActivityCard({
          title: "PrÃ³ximo treino",
          icon: icons.agenda,
          primary: nextTitle,
          secondary: nextSubtitle,
          action: nextActivity
            ? `<button class="mini-button" type="button" data-open-activity-form="${escapeHtml(nextActivity.id)}">Ver detalhes</button>`
            : `<button class="mini-button" type="button" data-open-activity-form data-prefill-student="${escapeHtml(student.id)}">Agendar</button>`
        })}
        ${renderProfileActivityCard({
          title: "Ãšltimo treino concluÃ­do",
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
        title: "AtualizaÃ§Ã£o pendente",
        subtitle: `Vencimento: ${formatShortDate(pendingUpdate.dueDate)}`,
        action: `<button class="mini-button" type="button" data-profile-tab="updates">Abrir</button>`,
        tone: "warning"
      }));
    }

    if (pendingContract) {
      rows.push(renderProfilePendingRow({
        icon: icons.contracts,
        title: "Contrato pendente",
        subtitle: `Plano: ${escapeHtml(pendingContract.plan || "Contrato do aluno")}`,
        action: `<button class="mini-button" type="button" data-profile-tab="contracts">Visualizar</button>`,
        tone: "warning"
      }));
    }

    if (!hasPublishedWorkout) {
      rows.push(renderProfilePendingRow({
        icon: icons.workouts,
        title: "Aluno sem treino publicado",
        subtitle: escapeHtml(student.goal || "Monte um treino para iniciar o acompanhamento."),
        action: `<button class="mini-button" type="button" data-open-workout-form data-prefill-student="${escapeHtml(student.id)}">Criar treino</button>`,
        tone: "info"
      }));
    }

    const unread = state.data.messages.filter((message) => message.studentId === student.id && message.senderRole === "student" && !message.readAt).length;
    if (unread) {
      rows.push(renderProfilePendingRow({
        icon: icons.messages,
        title: `${unread} mensagem(ns) nÃ£o lida(s)`,
        subtitle: "Conversa aguardando resposta",
        action: `<button class="mini-button" type="button" data-open-messages="${escapeHtml(student.id)}">Responder</button>`,
        tone: "success"
      }));
    }

    return `
      <section class="panel profile-pending-panel">
        <div class="section-title">
          <h3>AÃ§Ãµes pendentes</h3>
          <span class="profile-card-icon">${icons.updates}</span>
        </div>
        ${
          rows.length
            ? `<div class="profile-pending-list">${rows.slice(0, 3).join("")}</div>`
            : emptyState("Nenhuma aÃ§Ã£o pendente", "Este aluno estÃ¡ em dia no momento.")
        }
      </section>
    `;
  }

  function renderProfilePendingRow({ icon, title, subtitle, action, tone = "" }) {
    return `
      <article class="profile-pending-row ${tone ? `is-${tone}` : ""}">
        <span class="profile-pending-icon">${icon}</span>
        <div>
          <strong>${escapeHtml(title)}</strong>
          <span>${subtitle}</span>
        </div>
        <div class="profile-pending-action">${action || ""}</div>
      </article>
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
          <h3>EvoluÃ§Ã£o â€“ Volume total (kg)</h3>
          <button class="mini-button profile-period-pill" type="button" data-profile-tab="progress">Ãšltimos 6 treinos</button>
        </div>
        <div class="profile-evolution-layout ${hasData ? "" : "is-empty"}">
          <div class="profile-chart-wrap">
            <svg class="profile-volume-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="EvoluÃ§Ã£o de volume total">
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
            ${hasData ? "" : `<p class="profile-chart-empty">Sem dados suficientes. A evoluÃ§Ã£o aparecerÃ¡ conforme o aluno concluir treinos.</p>`}
          </div>
          <aside class="profile-chart-summary">
            <strong>${Number(total || 0).toLocaleString("pt-BR")} <small>kg</small></strong>
            <span>Volume total</span>
            <em class="${change >= 0 ? "is-positive" : "is-negative"}">${change >= 0 ? "â†‘" : "â†“"} ${Math.abs(change)}%</em>
            <small>vs. perÃ­odo anterior</small>
          </aside>
        </div>
      </section>
    `;
  }

  function openExerciseForm(exerciseId = "") {
    const exercise = getExercise(exerciseId) || {};
    const primaryMuscle = exercise.id ? getExercisePrimaryMuscle(exercise) : "";
    const secondaryMuscles = getExerciseSecondaryMuscles(exercise);
    const videoLink = exercise.videoStorage === "indexeddb" ? "" : exercise.videoUrl || "";
    const currentVideo = hasExerciseVideo(exercise)
      ? `${escapeHtml(exercise.videoName || exercise.videoUrl || "VÃ­deo cadastrado")}${exercise.videoStorage === "indexeddb" ? " Â· vÃ­deo local deste aparelho" : ""}${exercise.videoSize ? ` Â· ${escapeHtml(formatFileSize(exercise.videoSize))}` : ""}`
      : "Nenhum vÃ­deo cadastrado.";
    openModal(
      exercise.id ? "Editar exercÃ­cio" : "Novo exercÃ­cio",
      `
        <form class="form-grid" id="exerciseForm" data-id="${exercise.id || ""}">
          <div class="form-grid two">
            <label class="field"><span>Nome</span><input name="name" type="text" value="${escapeHtml(exercise.name)}" required /></label>
            <label class="field"><span>Grupo muscular principal</span><select name="primaryMuscle" required>${exerciseMuscleOptions(primaryMuscle, [primaryMuscle])}</select></label>
            <label class="field"><span>Equipamento</span><input name="equipment" type="text" value="${escapeHtml(exercise.equipment || "")}" required /></label>
            <label class="field"><span>Status</span><select name="status"><option value="active" ${exercise.status !== "inactive" ? "selected" : ""}>Ativo</option><option value="inactive" ${exercise.status === "inactive" ? "selected" : ""}>Inativo</option></select></label>
          </div>
          <fieldset class="field fieldset">
            <span>Grupos musculares secundÃ¡rios</span>
            <div class="checkbox-grid">${exerciseSecondaryMuscleChoices(secondaryMuscles, primaryMuscle)}</div>
          </fieldset>
          <div class="form-grid two">
            <label class="field"><span>Link do vÃ­deo</span><input name="videoUrl" type="url" value="${escapeHtml(videoLink)}" placeholder="https://..." /></label>
            <label class="field"><span>Upload de vÃ­deo</span><input name="videoFile" type="file" accept="video/mp4,video/webm,video/quicktime" /></label>
          </div>
          <div class="media-note">
            <span class="small-text"><strong>VÃ­deo atual:</strong> ${currentVideo}</span>
            ${hasExerciseVideo(exercise) ? `<label class="inline-check"><input name="removeVideo" type="checkbox" value="1" /> Remover vÃ­deo atual ao salvar</label>` : ""}
            <span class="small-text">Aceita MP4, WebM ou MOV atÃ© 200 MB. Se a API nÃ£o estiver disponÃ­vel, o arquivo fica local neste aparelho para teste.</span>
          </div>
          <label class="field"><span>DescriÃ§Ã£o de execuÃ§Ã£o</span><textarea name="description">${escapeHtml(exercise.description)}</textarea></label>
          <label class="field"><span>ObservaÃ§Ãµes tÃ©cnicas</span><textarea name="technicalNotes">${escapeHtml(exercise.technicalNotes)}</textarea></label>
          <button class="primary-action" type="submit">Salvar exercÃ­cio</button>
        </form>
      `
    );
  }

  function openWorkoutForm(workoutId = "", prefillStudentId = "") {
    const workout = getWorkout(workoutId) || {};
    const isStudentWorkout = Boolean(workout.studentId || prefillStudentId);
    const selectedStudentId = isStudentWorkout ? workout.studentId || prefillStudentId || state.data.students[0]?.id || "" : "";
    const rows = Array.isArray(workout.exercises) && workout.exercises.length ? workout.exercises : [normalizeWorkoutExercise({ order: 1, exerciseId: state.data.exercises.find((e) => e.status === "active")?.id || "" })];
    openModal(
      workout.id ? (isStudentWorkout ? "Editar treino do aluno" : "Editar padrÃ£o de treino") : isStudentWorkout ? "Novo treino do aluno" : "Novo padrÃ£o de treino",
      `
        <form class="form-grid" id="workoutForm" data-id="${workout.id || ""}" data-scope="${isStudentWorkout ? "student" : "pattern"}">
          <div class="form-grid two">
            ${
              isStudentWorkout
                ? `<label class="field"><span>Aluno</span><select name="studentId" required>${studentOptions(selectedStudentId)}</select></label>`
                : `<input type="hidden" name="studentId" value="" /><div class="empty-state compact-note"><strong>Modelo base</strong><span>Este padrÃ£o fica na Ã¡rea global de treino e nÃ£o Ã© vinculado a um aluno.</span></div>`
            }
            <label class="field"><span>Status</span><select name="status">${workoutStatusOptions(workout.status || "draft", !isStudentWorkout)}</select></label>
          </div>
          <label class="field"><span>TÃ­tulo</span><input name="title" type="text" value="${escapeHtml(workout.title || "")}" required /></label>
          <label class="field"><span>DescriÃ§Ã£o</span><textarea name="description">${escapeHtml(workout.description || "")}</textarea></label>
          <div class="form-grid two">
            <label class="field"><span>Foco/objetivo</span><input name="focus" type="text" value="${escapeHtml(workout.focus || "")}" /></label>
            <label class="field"><span>NÃ­vel</span><select name="level">${workoutLevelOptions(workout.level || "")}</select></label>
          </div>
          <section class="workout-builder">
            <div class="section-title"><h3>ExercÃ­cios do ${isStudentWorkout ? "treino" : "padrÃ£o"}</h3><button class="mini-button" type="button" data-add-workout-row>Adicionar exercÃ­cio</button></div>
            <div id="workoutRows">${rows.map((row, index) => workoutRowTemplate(row, index)).join("")}</div>
          </section>
          <button class="primary-action" type="submit">${isStudentWorkout ? "Salvar treino" : "Salvar padrÃ£o"}</button>
        </form>
      `
    );
  }

  function openApplyPatternForm(workoutId) {
    const workout = getWorkout(workoutId);
    if (!workout || !isWorkoutPattern(workout)) return showToast("PadrÃ£o nÃ£o encontrado.");
    openModal(
      "Aplicar padrÃ£o ao aluno",
      `
        <form class="form-grid" id="applyPatternForm" data-id="${workout.id}">
          <div class="empty-state compact-note">
            <strong>${escapeHtml(workout.title)}</strong>
            <span>Uma cÃ³pia individual serÃ¡ criada para o aluno. O padrÃ£o original nÃ£o serÃ¡ alterado.</span>
          </div>
          <div class="form-grid two">
            <label class="field"><span>Aluno</span><select name="studentId" required>${studentOptions(state.data.students[0]?.id || "")}</select></label>
            <label class="field"><span>Status do treino</span><select name="status"><option value="draft">Rascunho</option><option value="published">Publicado para o aluno</option></select></label>
          </div>
          <label class="field"><span>TÃ­tulo no treino do aluno</span><input name="title" type="text" value="${escapeHtml(workout.title)}" required /></label>
          <button class="primary-action" type="submit">Criar treino do aluno</button>
        </form>
      `
    );
  }

  function openStudentPatternWorkoutForm(studentId) {
    const student = getStudent(studentId);
    const patterns = getAvailableWorkoutPatterns();
    if (!student) return showToast("Aluno nÃ£o encontrado.");
    if (!patterns.length) return showToast("Crie um padrÃ£o de treino antes de usar esta opÃ§Ã£o.");
    openModal(
      "Criar treino por padrÃ£o",
      `
        <form class="form-grid" id="studentPatternWorkoutForm" data-student-id="${student.id}">
          <div class="empty-state compact-note">
            <strong>${escapeHtml(student.name)}</strong>
            <span>SerÃ¡ criada uma cÃ³pia individual para este aluno. O padrÃ£o original nÃ£o serÃ¡ alterado.</span>
          </div>
          <label class="field"><span>PadrÃ£o de treino</span><select name="patternId" required>${workoutPatternOptions(patterns[0]?.id || "")}</select></label>
          <div class="form-grid two">
            <label class="field"><span>Status do treino</span><select name="status"><option value="draft">Rascunho</option><option value="published">Publicado para o aluno</option></select></label>
            <label class="field"><span>TÃ­tulo opcional</span><input name="title" type="text" placeholder="Usar tÃ­tulo do padrÃ£o" /></label>
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
          <strong>ExercÃ­cio ${index + 1}</strong>
          <button class="mini-button is-danger" type="button" data-remove-workout-row>Remover</button>
        </div>
        <div class="form-grid two">
          <label class="field"><span>ExercÃ­cio da biblioteca</span><select name="exerciseId" required>${exerciseOptions(row.exerciseId)}</select></label>
          <label class="field"><span>Ordem</span><input name="order" type="number" min="1" value="${escapeHtml(row.order || index + 1)}" required /></label>
          <label class="field"><span>SÃ©ries</span><input name="sets" type="number" min="1" value="${escapeHtml(row.sets || 3)}" required /></label>
          <label class="field"><span>RepetiÃ§Ãµes alvo</span><input name="targetReps" type="text" value="${escapeHtml(row.targetReps || "10")}" required /></label>
          <label class="field"><span>Carga sugerida</span><input name="suggestedLoad" type="text" value="${escapeHtml(row.suggestedLoad || "")}" /></label>
          <label class="field"><span>Descanso em segundos</span><input name="restSeconds" type="number" min="0" value="${escapeHtml(row.restSeconds || 60)}" required /></label>
        </div>
        <label class="field"><span>ObservaÃ§Ã£o especÃ­fica</span><textarea name="coachNotes">${escapeHtml(row.coachNotes || "")}</textarea></label>
      </article>
    `;
  }

  function openActivityForm(activityId = "", prefillStudentId = "") {
    const activity = state.data.activities.find((item) => item.id === activityId) || {};
    const selectedStudentId = activity.studentId || prefillStudentId || state.data.students[0]?.id || "";
    const selectedType = activity.type || "workout";
    const selectedStatus = activity.status || (selectedType === "update" ? "pending" : "scheduled");
    openModal(
      activity.id ? "Editar atividade" : "Agendar atividade",
      `
        <form class="form-grid" id="activityForm" data-id="${activity.id || ""}">
          <div class="form-grid two">
            <label class="field"><span>Aluno</span><select name="studentId" required data-activity-student>${studentOptions(selectedStudentId)}</select></label>
            <label class="field"><span>Tipo</span><select name="type" data-activity-type>
              <option value="workout" ${selectedType === "workout" ? "selected" : ""}>Treino</option>
              <option value="assessment" ${selectedType === "assessment" ? "selected" : ""}>AvaliaÃ§Ã£o</option>
              <option value="reassessment" ${selectedType === "reassessment" ? "selected" : ""}>ReavaliaÃ§Ã£o</option>
              <option value="update" ${selectedType === "update" ? "selected" : ""}>AtualizaÃ§Ã£o quinzenal</option>
              <option value="return" ${selectedType === "return" ? "selected" : ""}>Retorno</option>
              <option value="other" ${selectedType === "other" ? "selected" : ""}>Outro evento</option>
            </select></label>
            <label class="field"><span>Treino vinculado</span><select name="workoutId">${workoutOptions(selectedStudentId, activity.workoutId)}</select></label>
            <label class="field"><span>Status</span><select name="status"><option value="scheduled" ${selectedStatus === "scheduled" ? "selected" : ""}>Agendado</option><option value="pending" ${selectedStatus === "pending" ? "selected" : ""}>Pendente</option><option value="done" ${selectedStatus === "done" ? "selected" : ""}>ConcluÃ­do</option><option value="sent" ${selectedStatus === "sent" ? "selected" : ""}>AtualizaÃ§Ã£o enviada</option><option value="missed" ${selectedStatus === "missed" ? "selected" : ""}>NÃ£o realizado</option><option value="canceled" ${selectedStatus === "canceled" ? "selected" : ""}>Cancelado</option></select></label>
            <label class="field"><span>Data</span><input name="date" type="date" value="${escapeHtml(activity.date || state.agendaDate)}" required /></label>
            <label class="field"><span>HorÃ¡rio</span><input name="time" type="time" value="${escapeHtml(activity.time || "08:00")}" required /></label>
            <label class="field"><span>DuraÃ§Ã£o</span><input name="duration" type="number" min="0" value="${escapeHtml(activity.duration || "60")}" /></label>
          </div>
          <label class="field"><span>TÃ­tulo</span><input name="title" type="text" value="${escapeHtml(activity.title || "Treino agendado")}" required /></label>
          <label class="field"><span>ObservaÃ§Ãµes</span><textarea name="notes">${escapeHtml(activity.notes || "")}</textarea></label>
          <button class="primary-action" type="submit">Salvar atividade</button>
        </form>
      `
    );
  }

  function dietObjectiveOptions(selected = "") {
    const options = ["Hipertrofia", "Emagrecimento", "ManutenÃ§Ã£o", "Performance", "ReeducaÃ§Ã£o alimentar", "Condicionamento", "Outro"];
    return options.map((option) => `<option value="${escapeHtml(option)}" ${option === selected ? "selected" : ""}>${escapeHtml(option)}</option>`).join("");
  }

  function dietStatusOptions(selected = "active") {
    return [
      ["active", "Ativo"],
      ["review_pending", "RevisÃ£o pendente"],
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
        return normalizeDietMeal({ name: name || `RefeiÃ§Ã£o ${index + 1}`, time, items, notes }, index);
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
          <label class="field"><span>TÃ­tulo do plano</span><input name="title" type="text" value="${escapeHtml(plan.title || "")}" placeholder="Plano alimentar Elite AS" required /></label>
          <div class="form-grid two">
            <label class="field"><span>Objetivo</span><select name="objective">${dietObjectiveOptions(plan.objective || getStudent(selectedStudentId)?.goal || "")}</select></label>
            <label class="field"><span>Protocolo atual</span><input name="protocol" type="text" value="${escapeHtml(plan.protocol || "")}" placeholder="Hipertrofia 3.200 kcal" /></label>
            <label class="field"><span>Calorias aproximadas</span><input name="calories" type="text" value="${escapeHtml(plan.calories || "")}" placeholder="3200 kcal" /></label>
            <label class="field"><span>RefeiÃ§Ãµes por dia</span><input name="mealCount" type="number" min="0" value="${escapeHtml(plan.mealCount || plan.meals?.length || 5)}" /></label>
            <label class="field"><span>Data de inÃ­cio</span><input name="startDate" type="date" value="${escapeHtml(plan.startDate || todayISO())}" /></label>
            <label class="field"><span>PrÃ³xima revisÃ£o</span><input name="nextReviewDate" type="date" value="${escapeHtml(plan.nextReviewDate || addDays(todayISO(), 15))}" /></label>
          </div>
          <label class="field"><span>RefeiÃ§Ãµes</span><textarea name="mealsText" placeholder="CafÃ© da manhÃ£ | 07:00 | ovos, fruta | observaÃ§Ã£o">${escapeHtml(dietMealsToText(plan.meals || []))}</textarea></label>
          <p class="small-text">Use uma refeiÃ§Ã£o por linha. Exemplo: CafÃ© da manhÃ£ | 07:00 | ovos, pÃ£o, fruta | manter hidrataÃ§Ã£o.</p>
          <label class="field"><span>ObservaÃ§Ãµes gerais</span><textarea name="notes">${escapeHtml(plan.notes || "")}</textarea></label>
          <label class="field"><span>InstruÃ§Ãµes ao aluno</span><textarea name="instructions">${escapeHtml(plan.instructions || "")}</textarea></label>
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
    if (!plan) return showToast("Plano alimentar nÃ£o encontrado.");
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
              <p>${escapeHtml(getStudentName(plan.studentId))} Â· ${escapeHtml(plan.objective || student?.goal || "Objetivo nÃ£o informado")}</p>
            </div>
            <span class="badge ${meta.tone ? `is-${meta.tone}` : ""}">${escapeHtml(meta.label)}</span>
          </section>
          <section class="contract-detail-grid diet-detail-grid">
            <article><span>Protocolo</span><strong>${escapeHtml(plan.protocol || "-")}</strong></article>
            <article><span>Calorias</span><strong>${escapeHtml(plan.calories || "-")}</strong></article>
            <article><span>RefeiÃ§Ãµes</span><strong>${escapeHtml(String(plan.mealCount || plan.meals.length || "-"))}</strong></article>
            <article><span>PrÃ³xima revisÃ£o</span><strong>${plan.nextReviewDate ? formatShortDate(plan.nextReviewDate) : "A definir"}</strong></article>
            <article><span>Ãšltima atualizaÃ§Ã£o</span><strong>${formatShortDate(String(plan.lastUpdatedAt || plan.updatedAt).slice(0, 10))}</strong></article>
            <article><span>Link enviado</span><strong>${plan.linkSentAt ? formatShortDate(plan.linkSentAt.slice(0, 10)) : "Ainda nÃ£o enviado"}</strong></article>
          </section>
          <section class="diet-meal-list">
            <div class="section-title"><h3>RefeiÃ§Ãµes</h3><span class="small-text">${plan.meals.length || 0} item(ns)</span></div>
            ${
              plan.meals.length
                ? plan.meals.map((meal) => `<article><strong>${escapeHtml(meal.name)}</strong><span>${escapeHtml(meal.time || "HorÃ¡rio livre")}</span><p>${escapeHtml(meal.items || "Itens nÃ£o informados")}</p>${meal.notes ? `<small>${escapeHtml(meal.notes)}</small>` : ""}</article>`).join("")
                : emptyState("RefeiÃ§Ãµes nÃ£o detalhadas", "Use Editar plano para adicionar refeiÃ§Ãµes e orientaÃ§Ãµes.")
            }
          </section>
          <section class="update-notes-grid">
            ${updateDetailNote("ObservaÃ§Ãµes", plan.notes)}
            ${updateDetailNote("InstruÃ§Ãµes", plan.instructions)}
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

  function openUpdateForm(updateId) {
    const update = state.data.updates.find((item) => item.id === updateId);
    if (!update || update.studentId !== state.currentUser?.studentId) return;
    openModal(
      "Enviar atualizaÃ§Ã£o",
      `
        <form class="form-grid" id="updateForm" data-id="${update.id}">
          <div class="form-grid two">
            <label class="field"><span>Peso atual</span><input name="weight" type="number" step="0.1" min="0" required /></label>
            <label class="field"><span>Fotos de evoluÃ§Ã£o</span><input name="photos" type="file" accept="image/*" multiple /></label>
            <label class="field"><span>Energia 1-5</span><input name="energy" type="number" min="1" max="5" value="4" required /></label>
            <label class="field"><span>Dor/desconforto 1-5</span><input name="pain" type="number" min="1" max="5" value="1" required /></label>
          </div>
          <label class="field"><span>ObservaÃ§Ãµes sobre treino</span><textarea name="trainingNotes"></textarea></label>
          <label class="field"><span>ObservaÃ§Ãµes sobre dieta</span><textarea name="dietNotes"></textarea></label>
          <label class="field"><span>ObservaÃ§Ãµes gerais</span><textarea name="generalNotes"></textarea></label>
          <button class="primary-action" type="submit">Enviar atualizaÃ§Ã£o</button>
        </form>
      `
    );
  }

  function openUpdateComment(updateId) {
    const update = state.data.updates.find((item) => item.id === updateId);
    if (!update) return;
    const student = getStudent(update.studentId);
    const meta = updateStatusMeta(update);
    const weight = updateWeightMeta(update);
    const isPending = update.status === "pending";
    const title = isPending ? "AtualizaÃ§Ã£o pendente" : update.status === "viewed" ? "AtualizaÃ§Ã£o avaliada" : "Avaliar atualizaÃ§Ã£o";
    openModal(
      title,
      `
        <div class="update-detail">
          <section class="update-detail-hero">
            ${studentAvatar(student)}
            <div class="update-detail-title">
              <strong>${escapeHtml(getStudentName(update.studentId))}</strong>
              <span>${escapeHtml(meta.label)} â€¢ ${escapeHtml(updateMomentLabel(update))}</span>
            </div>
            <span class="badge ${meta.className === "is-late" ? "is-danger" : meta.className === "is-pending" ? "is-warning" : "is-success"}">${escapeHtml(meta.label)}</span>
          </section>
          <section class="update-detail-grid">
            <article>
              <span>Peso atual</span>
              <strong>${escapeHtml(weight.currentLabel)}</strong>
            </article>
            <article>
              <span>Peso anterior</span>
              <strong>${escapeHtml(weight.previousLabel)}</strong>
            </article>
            <article>
              <span>VariaÃ§Ã£o</span>
              <strong class="${weight.className}">${escapeHtml(weight.deltaLabel)}</strong>
            </article>
            <article>
              <span>Energia / Dor</span>
              <strong>${escapeHtml(update.energy || "-")}/5 â€¢ ${escapeHtml(update.pain || "-")}/5</strong>
            </article>
          </section>
          <section class="update-detail-section">
            <div class="section-title">
              <h3>Fotos da evoluÃ§Ã£o</h3>
              <span class="small-text">${Array.isArray(update.photos) && update.photos.length ? `${update.photos.length} foto(s)` : "Fotos ainda nÃ£o enviadas"}</span>
            </div>
            ${renderUpdatePhotoStrip(update, true)}
          </section>
          <section class="update-notes-grid">
            ${updateDetailNote("Treino", update.trainingNotes)}
            ${updateDetailNote("Dieta", update.dietNotes)}
            ${updateDetailNote("ObservaÃ§Ãµes gerais", update.generalNotes)}
            ${updateDetailNote("Status", meta.extra || (isPending ? "Aguardando envio do aluno" : "DisponÃ­vel para avaliaÃ§Ã£o"))}
          </section>
          ${
            isPending
              ? `
                <div class="empty-state compact-note">
                  <strong>AtualizaÃ§Ã£o ainda nÃ£o enviada</strong>
                  <span>Quando o aluno enviar peso, fotos e observaÃ§Ãµes, a avaliaÃ§Ã£o do personal ficarÃ¡ disponÃ­vel aqui.</span>
                </div>
                <div class="form-actions two">
                  ${student ? `<button class="secondary-action" type="button" data-open-student-profile="${escapeHtml(student.id)}">Abrir perfil do aluno</button>` : ""}
                </div>
              `
              : `
                <form class="form-grid update-evaluation-form" id="updateCommentForm" data-id="${escapeHtml(update.id)}">
                  <label class="field"><span>AvaliaÃ§Ã£o do personal</span><textarea name="trainerComment" placeholder="Registre orientaÃ§Ãµes, ajustes de treino ou observaÃ§Ãµes para o aluno.">${escapeHtml(update.trainerComment || "")}</textarea></label>
                  <div class="form-actions two">
                    <button class="primary-action" type="submit">Salvar avaliaÃ§Ã£o</button>
                    ${student ? `<button class="secondary-action" type="button" data-open-student-profile="${escapeHtml(student.id)}">Abrir perfil</button>` : ""}
                  </div>
                </form>
              `
          }
        </div>
      `
    );
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
    const student = getStudent(studentId);
    if (!student) return openContractStudentPicker();
    const contract = contractId ? state.data.contracts.find((item) => item.id === contractId && item.studentId === student.id) : null;
    const defaults = contract || normalizeContract({ studentId: student.id, ...getContractDefaults(student) });
    const body = contract?.body || buildContractBody(student, defaults);
    openModal(
      contract ? "Editar contrato" : "Novo contrato",
      `
        <form class="form-grid" id="contractForm" data-student-id="${student.id}" data-contract-id="${contract?.id || ""}">
          <label class="field"><span>Aluno</span><input type="text" value="${escapeHtml(student.name)}" disabled /></label>
          <div class="form-grid two">
            <label class="field"><span>TÃ­tulo</span><input name="title" type="text" value="${escapeHtml(defaults.title || "Contrato de prestaÃ§Ã£o de serviÃ§o")}" required /></label>
            <label class="field"><span>VersÃ£o</span><input name="version" type="text" value="${escapeHtml(defaults.version || "1.0")}" required /></label>
            <label class="field"><span>CPF</span><input name="cpf" type="text" value="${escapeHtml(defaults.cpf || "")}" placeholder="Opcional" /></label>
            <label class="field"><span>Plano</span><input name="plan" type="text" value="${escapeHtml(defaults.plan || "")}" /></label>
            <label class="field"><span>Valor</span><input name="value" type="text" value="${escapeHtml(defaults.value || "")}" placeholder="R$ 0,00" /></label>
            <label class="field"><span>Quantidade de aulas</span><input name="classCount" type="text" value="${escapeHtml(defaults.classCount || "")}" /></label>
            <label class="field"><span>Data de inÃ­cio</span><input name="startDate" type="date" value="${escapeHtml(defaults.startDate || todayISO())}" /></label>
            <label class="field"><span>Data de fim</span><input name="endDate" type="date" value="${escapeHtml(defaults.endDate || "")}" /></label>
          </div>
          <label class="field"><span>Texto do contrato</span><textarea name="body" required>${escapeHtml(body)}</textarea></label>
          <p class="small-text">VariÃ¡veis disponÃ­veis no modelo padrÃ£o: {aluno}, {cpf}, {telefone}, {email}, {personal}, {plano}, {valor}, {data_inicio}, {data_fim}, {quantidade_aulas}, {data_assinatura}.</p>
          <button class="primary-action" type="submit">${contract ? "Salvar contrato" : "Criar e gerar link"}</button>
        </form>
      `
    );
  }

  function openContractStudentPicker() {
    const activeStudents = state.data.students.filter((student) => student.status !== "inactive");
    openModal(
      "Novo contrato",
      `
        <form class="form-grid" id="contractStudentPickerForm">
          ${
            activeStudents.length
              ? `
                <label class="field"><span>Aluno</span><select name="studentId" required>${activeStudents.map((student) => `<option value="${escapeHtml(student.id)}">${escapeHtml(student.name)}</option>`).join("")}</select></label>
                <p class="small-text">Selecione o aluno para criar um contrato com plano, valor e vigÃªncia prÃ³prios.</p>
                <button class="primary-action" type="submit">Continuar</button>
              `
              : emptyState("Nenhum aluno ativo", "Cadastre ou ative um aluno antes de criar contratos.")
          }
        </form>
      `
    );
  }

  function openContract(contractId) {
    const contract = state.data.contracts.find((item) => item.id === contractId);
    if (!contract) return;
    const isStudent = state.currentUser?.role === "student";
    if (isStudent && contract.studentId !== state.currentUser.studentId) return showToast("Contrato indisponÃ­vel para este aluno.");
    if (isStudent && contract.status === "pending") {
      contract.status = "viewed";
      contract.viewedAt = new Date().toISOString();
      persistData();
    }
    const student = getStudent(contract.studentId);
    const meta = contractStatusMeta(contract);
    openModal(
      contract.title,
      `
        <div class="contract-detail">
          <section class="contract-detail-hero">
            ${studentAvatar(student)}
            <div class="contract-detail-title">
              <strong>${escapeHtml(contract.title)}</strong>
              <span>${escapeHtml(getStudentName(contract.studentId))} â€¢ VersÃ£o ${escapeHtml(contract.version)}</span>
            </div>
            <span class="badge ${meta.badgeClass}">${escapeHtml(meta.label)}</span>
          </section>
          <section class="contract-detail-grid">
            <article><span>Plano</span><strong>${escapeHtml(contract.plan || "NÃ£o informado")}</strong></article>
            <article><span>Valor</span><strong>${escapeHtml(contract.value || "NÃ£o informado")}</strong></article>
            <article><span>InÃ­cio</span><strong>${escapeHtml(contract.startDate ? formatShortDate(contract.startDate) : "NÃ£o definido")}</strong></article>
            <article><span>VigÃªncia</span><strong>${escapeHtml(contract.endDate ? formatShortDate(contract.endDate) : "Sem vencimento")}</strong></article>
            <article><span>Aulas/Treinos</span><strong>${escapeHtml(contract.classCount || "NÃ£o definido")}</strong></article>
            <article><span>Criado em</span><strong>${escapeHtml(formatShortDate(contract.createdAt.slice(0, 10)))}</strong></article>
          </section>
          <section class="contract-detail-section">
            <div class="section-title">
              <h3>Documento</h3>
              <span class="small-text">${escapeHtml(meta.label)}</span>
            </div>
            <p class="contract-body premium-contract-body">${escapeHtml(contract.body || "Texto do contrato nÃ£o informado.")}</p>
            ${
              contract.signedAt
                ? `<p class="small-text">Assinado em ${new Date(contract.signedAt).toLocaleString("pt-BR")} â€¢ VersÃ£o aceita ${escapeHtml(contract.signedVersion || contract.version)} â€¢ ${escapeHtml(contract.technicalId || "identificaÃ§Ã£o tÃ©cnica nÃ£o disponÃ­vel")}${contract.signatureIp ? ` â€¢ IP ${escapeHtml(contract.signatureIp)}` : ""}</p>`
                : `<p class="small-text">${contract.emailSentAt || contract.linkSentAt ? `Link enviado em ${new Date(contract.emailSentAt || contract.linkSentAt).toLocaleString("pt-BR")}` : "Link ainda nÃ£o enviado."}</p>`
            }
          </section>
          <div class="contract-detail-actions">
            ${isStudent && contract.status !== "signed" && contract.status !== "canceled" ? `<button class="primary-action" type="button" data-sign-contract="${escapeHtml(contract.id)}">Aceitar e assinar</button>` : ""}
            ${state.currentUser?.role === "manager" && contract.status !== "signed" && contract.status !== "canceled" ? `<button class="primary-action" type="button" data-send-contract-link="${escapeHtml(contract.id)}">Reenviar contrato</button>` : ""}
            ${state.currentUser?.role === "manager" && student ? `<button class="secondary-action" type="button" data-open-student-profile="${escapeHtml(student.id)}">Abrir perfil</button>` : ""}
            <button class="secondary-action" type="button" data-print-contract>Gerar PDF</button>
          </div>
        </div>
      `
    );
  }

  function openMessages(studentId) {
    const student = getStudent(studentId);
    if (!student) return;
    if (state.currentUser?.role === "student" && state.currentUser.studentId !== student.id) return showToast("Conversa indisponÃ­vel.");
    if (state.currentUser?.role === "manager") {
      let changed = false;
      getStudentMessages(student.id).forEach((message) => {
        if (message.senderRole === "student" && !message.readAt) {
          message.readAt = new Date().toISOString();
          changed = true;
        }
      });
      if (changed) {
        persistData();
        renderManager();
      }
    }
    openModal(
      `Mensagens Â· ${student.name}`,
      `
        <div class="message-detail">
          <section class="message-detail-hero">
            ${studentAvatar(student)}
            <div>
              <span class="eyebrow">Conversa</span>
              <h3>${escapeHtml(student.name)}</h3>
              <p>${escapeHtml(student.goal || "Aluno Elite AS")} Â· ${state.socketReady ? "tempo real ativo" : "modo local"}</p>
            </div>
            ${state.currentUser?.role === "manager" ? `<button class="secondary-action" type="button" data-open-student-profile="${escapeHtml(student.id)}">Abrir perfil</button>` : ""}
          </section>
          <section class="message-thread-panel">
            ${renderConversation(student.id)}
          </section>
          <form class="message-compose" id="messageForm" data-student-id="${student.id}">
            <label class="field">
              <span>Nova mensagem</span>
              <textarea name="body" maxlength="800" required placeholder="Escreva uma orientaÃ§Ã£o ou resposta para o aluno..."></textarea>
            </label>
            <div class="form-actions">
              <button class="primary-action" type="submit">Enviar mensagem</button>
            </div>
          </form>
        </div>
      `
    );
  }

  function openPaymentForm(paymentId = "", defaults = {}) {
    const payment = paymentId ? state.data.payments.find((item) => item.id === paymentId) : null;
    const record = payment ? { ...payment } : defaults.recordId ? findFinanceRecord(defaults.recordId) : null;
    const selectedStudentId = defaults.studentId || payment?.studentId || record?.studentId || state.data.students[0]?.id || "";
    const student = getStudent(selectedStudentId);
    const contract = payment?.contractId ? state.data.contracts.find((item) => item.id === payment.contractId) : getBillableContractForStudent(selectedStudentId, defaults.referenceMonth || state.financeFilters.month);
    const referenceMonth = payment?.referenceMonth || defaults.referenceMonth || record?.referenceMonth || state.financeFilters.month || todayISO().slice(0, 7);
    const amount = payment?.amount || defaults.amount || record?.amount || contract?.value || "";
    const dueDate = payment?.dueDate || defaults.dueDate || record?.dueDate || (contract ? financeDueDateForContract(contract, referenceMonth) : `${referenceMonth}-05`);
    const paidAt = payment?.paidAt ? payment.paidAt.slice(0, 10) : defaults.paidAt || (payment?.status === "paid" ? todayISO() : "");
    const activeContracts = state.data.contracts.filter((item) => item.studentId === selectedStudentId && item.status !== "canceled");
    openModal(
      payment ? "Editar pagamento" : "Registrar pagamento",
      `
        <form class="form-grid payment-form" id="paymentForm" data-payment-id="${escapeHtml(payment?.id || "")}">
          <div class="form-grid two">
            <label class="field"><span>Aluno</span><select name="studentId" required>${studentOptions(selectedStudentId)}</select></label>
            <label class="field"><span>Contrato/plano</span><select name="contractId"><option value="">Sem contrato vinculado</option>${activeContracts.map((item) => `<option value="${escapeHtml(item.id)}" ${item.id === (payment?.contractId || contract?.id || "") ? "selected" : ""}>${escapeHtml(item.plan || item.title)} Â· ${escapeHtml(item.value || "sem valor")}</option>`).join("")}</select></label>
            <label class="field"><span>MÃªs de referÃªncia</span><input name="referenceMonth" type="month" value="${escapeHtml(referenceMonth)}" required /></label>
            <label class="field"><span>Valor</span><input name="amount" type="text" inputmode="decimal" value="${escapeHtml(amount)}" placeholder="R$ 0,00" required /></label>
            <label class="field"><span>Vencimento</span><input name="dueDate" type="date" value="${escapeHtml(dueDate)}" /></label>
            <label class="field"><span>Data de pagamento</span><input name="paidAt" type="date" value="${escapeHtml(paidAt)}" /></label>
            <label class="field"><span>Status</span><select name="status">
              ${[
                ["paid", "Pago"],
                ["pending", "Pendente"],
                ["overdue", "Atrasado"],
                ["partial", "Parcial"],
                ["exempt", "Isento"],
                ["canceled", "Cancelado"]
              ].map(([value, label]) => `<option value="${value}" ${String(payment?.status || defaults.status || record?.status || "paid") === value ? "selected" : ""}>${label}</option>`).join("")}
            </select></label>
            <label class="field"><span>Forma de pagamento</span><select name="paymentMethod">
              ${["Pix", "Dinheiro", "CartÃ£o", "TransferÃªncia", "Outro"].map((item) => `<option value="${escapeHtml(item)}" ${String(payment?.paymentMethod || "") === item ? "selected" : ""}>${escapeHtml(item)}</option>`).join("")}
            </select></label>
          </div>
          <label class="field"><span>ObservaÃ§Ã£o</span><textarea name="note" placeholder="Anote detalhes internos do pagamento.">${escapeHtml(payment?.note || "")}</textarea></label>
          <p class="small-text">Controle interno/manual. O app nÃ£o processa pagamentos online nem envia cobranÃ§a automaticamente.</p>
          <div class="form-actions two">
            <button class="primary-action" type="submit">${payment ? "Salvar pagamento" : "Registrar pagamento"}</button>
            ${student ? `<button class="secondary-action" type="button" data-open-student-profile="${escapeHtml(student.id)}">Abrir perfil</button>` : ""}
          </div>
        </form>
      `
    );
  }

  function openPaymentDetail(recordId) {
    const record = findFinanceRecord(recordId);
    if (!record) return showToast("Pagamento nÃ£o encontrado.");
    const student = getStudent(record.studentId);
    const meta = financeStatusMeta(record);
    openModal(
      "Detalhes financeiros",
      `
        <div class="finance-detail">
          <section class="finance-detail-hero">
            ${studentAvatar(student)}
            <div>
              <span class="eyebrow">Financeiro</span>
              <h3>${escapeHtml(getStudentName(record.studentId))}</h3>
              <p>${escapeHtml(record.plan || "Plano nÃ£o informado")} Â· ${escapeHtml(financeMonthLabel(record.referenceMonth))}</p>
            </div>
            <span class="badge ${meta.tone ? `is-${meta.tone}` : ""}">${escapeHtml(meta.label)}</span>
          </section>
          <section class="contract-detail-grid finance-detail-grid">
            <article><span>Valor</span><strong>${escapeHtml(currencyExact(record.amount))}</strong></article>
            <article><span>Vencimento</span><strong>${escapeHtml(record.dueDate ? formatShortDate(record.dueDate) : "Sem data")}</strong></article>
            <article><span>Pagamento</span><strong>${escapeHtml(record.paidAt ? formatShortDate(record.paidAt.slice(0, 10)) : "NÃ£o registrado")}</strong></article>
            <article><span>Origem</span><strong>${escapeHtml(record.virtual ? "Contrato assinado" : "Registro manual")}</strong></article>
          </section>
          <section class="contract-detail-section">
            <div class="section-title"><h3>ObservaÃ§Ã£o</h3><span class="small-text">${escapeHtml(record.paymentMethod || "Controle interno")}</span></div>
            <p class="contract-body premium-contract-body">${escapeHtml(record.note || "Sem observaÃ§Ãµes registradas.")}</p>
          </section>
          <div class="contract-detail-actions">
            <button class="primary-action" type="button" data-open-payment-form="${escapeHtml(record.virtual ? "" : record.id)}" data-payment-record="${escapeHtml(record.id)}">${record.virtual ? "Registrar pagamento" : "Editar pagamento"}</button>
            ${meta.key === "paid" ? `<button class="secondary-action" type="button" data-open-payment-receipt="${escapeHtml(record.id)}">Ver recibo</button>` : `<button class="secondary-action" type="button" data-finance-charge="${escapeHtml(record.id)}">Cobrar via WhatsApp</button>`}
            ${student ? `<button class="secondary-action" type="button" data-open-student-profile="${escapeHtml(student.id)}">Abrir perfil</button>` : ""}
          </div>
        </div>
      `
    );
  }

  function openPaymentReceipt(recordId) {
    const record = findFinanceRecord(recordId);
    if (!record || financeStatusKey(record) !== "paid") return showToast("Recibo disponÃ­vel apenas para pagamentos pagos.");
    const student = getStudent(record.studentId);
    openModal(
      "Recibo interno",
      `
        <div class="finance-receipt">
          <section class="finance-receipt-card">
            <span class="eyebrow">Elite AS</span>
            <h3>Recibo de pagamento</h3>
            <div class="finance-receipt-grid">
              <span>Aluno</span><strong>${escapeHtml(getStudentName(record.studentId))}</strong>
              <span>Plano</span><strong>${escapeHtml(record.plan || "Plano nÃ£o informado")}</strong>
              <span>Valor</span><strong>${escapeHtml(currencyExact(record.amount))}</strong>
              <span>MÃªs</span><strong>${escapeHtml(financeMonthLabel(record.referenceMonth))}</strong>
              <span>Pago em</span><strong>${escapeHtml(record.paidAt ? formatShortDate(record.paidAt.slice(0, 10)) : "NÃ£o informado")}</strong>
              <span>Forma</span><strong>${escapeHtml(record.paymentMethod || "NÃ£o informado")}</strong>
              <span>CÃ³digo</span><strong>${escapeHtml(record.receiptCode || record.id)}</strong>
            </div>
            <p>Recibo interno para controle manual. Este documento nÃ£o representa processamento automÃ¡tico de pagamento.</p>
          </section>
          <div class="form-actions two">
            <button class="primary-action" type="button" data-print-contract>Imprimir / salvar PDF</button>
            ${student ? `<button class="secondary-action" type="button" data-open-student-profile="${escapeHtml(student.id)}">Abrir perfil</button>` : ""}
          </div>
        </div>
      `
    );
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
                  ? "O aluno recebeu um link seguro para criar a propria senha."
                  : "O envio de e-mail ainda nao esta configurado no servidor. Use este link para testar o fluxo de criacao de senha agora."
              }
            </p>
            ${
              inviteUrl
                ? `<label class="field"><span>Link de criacao de senha</span><input data-invite-url readonly value="${escapeHtml(inviteUrl)}" /></label>
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
                  : "O envio de e-mail ainda nao esta configurado no servidor. Use este link para testar o aceite do contrato agora."
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

  async function handleStudentForm(form) {
    const data = new FormData(form);
    const id = form.dataset.id || createId("student");
    const old = getStudent(id);
    const email = normalizeEmail(data.get("email"));
    if (email === ADMIN.email) return showToast("Use outro e-mail para o aluno.");
    if (state.data.students.some((student) => student.email === email && student.id !== id)) return showToast("JÃ¡ existe aluno com esse e-mail.");

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

  async function handleExerciseForm(form) {
    const data = new FormData(form);
    const id = form.dataset.id || createId("exercise");
    const old = getExercise(id);
    const removeVideo = data.get("removeVideo") === "1";
    const videoUrl = String(data.get("videoUrl") || "").trim();
    let videoData = removeVideo
      ? { videoUrl: "", videoStorage: "", videoKey: "", videoName: "", videoSize: 0, videoUploadedAt: "" }
      : {
          videoUrl: old?.videoUrl || "",
          videoStorage: old?.videoStorage || "",
          videoKey: old?.videoKey || "",
          videoName: old?.videoName || "",
          videoSize: old?.videoSize || 0,
          videoUploadedAt: old?.videoUploadedAt || ""
        };

    if (!removeVideo && videoUrl) {
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
        return showToast(error.message || "NÃ£o foi possÃ­vel salvar o vÃ­deo.");
      }
    }
    const exercise = normalizeExercise({
      id,
      trainerId: TRAINER_ID,
      name: String(data.get("name") || "").trim(),
      muscle: String(data.get("primaryMuscle") || "").trim(),
      primaryMuscle: String(data.get("primaryMuscle") || "").trim(),
      secondaryMuscles: normalizeStringList(data.getAll("secondaryMuscles")),
      equipment: String(data.get("equipment") || "").trim(),
      description: String(data.get("description") || "").trim(),
      technicalNotes: String(data.get("technicalNotes") || "").trim(),
      ...videoData,
      status: String(data.get("status") || "active"),
      createdAt: old?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    const index = state.data.exercises.findIndex((item) => item.id === id);
    if (index >= 0) state.data.exercises[index] = exercise;
    else state.data.exercises.unshift(exercise);
    persistData();
    closeModal();
    state.managerMenu = "library";
    renderApp();
    showToast(videoFile && exercise.videoStorage === "indexeddb" ? "ExercÃ­cio salvo. VÃ­deo ficou local neste aparelho atÃ© o backend estar disponÃ­vel." : removeVideo ? "ExercÃ­cio salvo sem vÃ­deo." : "ExercÃ­cio salvo na biblioteca.");
  }

  function handleWorkoutForm(form) {
    const data = new FormData(form);
    const id = form.dataset.id || createId("workout");
    const old = getWorkout(id);
    const isPattern = form.dataset.scope === "pattern";
    const rows = [...form.querySelectorAll("[data-workout-row]")]
      .map((row, index) =>
        normalizeWorkoutExercise({
          id: old?.exercises?.[index]?.id || createId("workout-exercise"),
          exerciseId: row.querySelector('[name="exerciseId"]').value,
          order: row.querySelector('[name="order"]').value || index + 1,
          sets: row.querySelector('[name="sets"]').value,
          targetReps: row.querySelector('[name="targetReps"]').value,
          suggestedLoad: row.querySelector('[name="suggestedLoad"]').value,
          restSeconds: row.querySelector('[name="restSeconds"]').value,
          coachNotes: row.querySelector('[name="coachNotes"]').value
        })
      )
      .filter((row) => row.exerciseId)
      .sort((a, b) => a.order - b.order);
    if (!rows.length) return showToast("Adicione pelo menos um exercÃ­cio da biblioteca.");
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
    closeModal();
    if (workout.studentId) {
      state.managerMenu = "students";
      state.profileTab = "workouts";
      renderApp();
      openStudentProfile(workout.studentId);
    } else {
      state.managerMenu = "workouts";
      renderApp();
    }
    showToast(workout.studentId ? (status === "published" ? "Treino publicado para o aluno." : "Treino salvo.") : "PadrÃ£o de treino salvo.");
  }

  function handleApplyPatternForm(form) {
    const data = new FormData(form);
    const pattern = getWorkout(form.dataset.id);
    const studentId = String(data.get("studentId") || "");
    if (!pattern || !isWorkoutPattern(pattern)) return showToast("PadrÃ£o nÃ£o encontrado.");
    if (!getStudent(studentId)) return showToast("Selecione um aluno vÃ¡lido.");
    const status = String(data.get("status") || "draft");
    const studentWorkout = buildStudentWorkoutFromPattern(pattern, studentId, {
      title: String(data.get("title") || pattern.title).trim(),
      status
    });
    state.data.workouts.unshift(studentWorkout);
    persistData();
    closeModal();
    state.profileTab = "workouts";
    openStudentProfile(studentId);
    showToast(status === "published" ? "Treino criado e publicado para o aluno." : "Treino criado como rascunho do aluno.");
  }

  function handleStudentPatternWorkoutForm(form) {
    const data = new FormData(form);
    const studentId = form.dataset.studentId || "";
    const student = getStudent(studentId);
    const pattern = getWorkout(String(data.get("patternId") || ""));
    if (!student) return showToast("Aluno nÃ£o encontrado.");
    if (!pattern || !isWorkoutPattern(pattern)) return showToast("Selecione um padrÃ£o vÃ¡lido.");
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
    showToast(status === "published" ? "Treino criado e publicado para o aluno." : "Treino criado como rascunho do aluno.");
  }

  function handleDietForm(form) {
    const data = new FormData(form);
    const id = form.dataset.id || createId("diet");
    const old = getDietPlan(id);
    const studentId = String(data.get("studentId") || "");
    if (!getStudent(studentId)) return showToast("Selecione um aluno vÃ¡lido.");
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
    showToast(status === "draft" ? "Plano alimentar salvo como rascunho." : "Plano alimentar salvo.");
  }

  function sendDietPlanLink(planId) {
    const plan = getDietPlan(planId);
    const student = getStudent(plan?.studentId);
    if (!plan || !student) return showToast("Plano alimentar indisponÃ­vel.");
    const url = dietLinkUrl(planId);
    if (!url) return showToast("Este aluno nÃ£o possui telefone cadastrado.");
    plan.linkSentAt = new Date().toISOString();
    plan.updatedAt = new Date().toISOString();
    persistData();
    renderApp();
    window.open(url, "_blank", "noopener");
    showToast("Mensagem do plano alimentar aberta no WhatsApp.");
  }

  function duplicateDietPlan(planId) {
    const plan = getDietPlan(planId);
    if (!plan) return showToast("Plano alimentar nÃ£o encontrado.");
    const copy = normalizeDietPlan({
      ...plan,
      id: createId("diet"),
      title: `${plan.title || plan.protocol || "Plano alimentar"} - cÃ³pia`,
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
    if (!plan) return showToast("Plano alimentar nÃ£o encontrado.");
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
    state.agendaDate = activity.date;
    state.managerMenu = "agenda";
    renderApp();
    showToast("Agenda atualizada.");
  }

  async function handleUpdateForm(form) {
    const update = state.data.updates.find((item) => item.id === form.dataset.id);
    if (!update || update.studentId !== state.currentUser?.studentId) return showToast("AtualizaÃ§Ã£o nÃ£o encontrada.");
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
    showToast("AtualizaÃ§Ã£o enviada. A prÃ³xima pendÃªncia foi criada para daqui 15 dias.");
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
    showToast("AvaliaÃ§Ã£o salva.");
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
    showToast("ConfiguraÃ§Ãµes salvas.");
  }

  async function handleContractForm(form) {
    const studentId = form.dataset.studentId;
    const student = getStudent(studentId);
    if (!student) return showToast("Aluno nÃ£o encontrado.");
    const data = new FormData(form);
    const contractId = form.dataset.contractId || "";
    const old = contractId ? state.data.contracts.find((item) => item.id === contractId && item.studentId === studentId) : null;
    const contract = normalizeContract({
      ...(old || {}),
      id: old?.id || createId("contract"),
      studentId,
      title: String(data.get("title") || "").trim(),
      body: String(data.get("body") || "").trim(),
      version: String(data.get("version") || "1.0").trim(),
      cpf: String(data.get("cpf") || "").trim(),
      plan: String(data.get("plan") || "").trim(),
      value: String(data.get("value") || "").trim(),
      startDate: String(data.get("startDate") || "").trim(),
      endDate: String(data.get("endDate") || "").trim(),
      classCount: String(data.get("classCount") || "").trim(),
      status: old?.status || "pending",
      createdAt: old?.createdAt || new Date().toISOString()
    });
    const index = state.data.contracts.findIndex((item) => item.id === contract.id);
    if (index >= 0) state.data.contracts[index] = contract;
    else state.data.contracts.unshift(contract);
    persistData();
    closeModal();
    openStudentProfile(studentId);
    showToast(old ? "Contrato salvo." : "Contrato criado para aceite do aluno.");
    if (!old) {
      await flushRemoteSync();
      await sendContractLink(contract.id);
    }
  }

  function handleContractStudentPicker(form) {
    const studentId = String(new FormData(form).get("studentId") || "");
    if (!getStudent(studentId)) return showToast("Aluno nÃ£o encontrado.");
    openContractForm(studentId);
  }

  function handleMessageForm(form) {
    const studentId = form.dataset.studentId;
    if (!getStudent(studentId)) return showToast("Aluno nÃ£o encontrado.");
    if (state.currentUser?.role === "student" && state.currentUser.studentId !== studentId) return showToast("Conversa indisponÃ­vel.");
    const body = String(new FormData(form).get("body") || "").trim();
    if (!body) return showToast("Digite uma mensagem.");
    if (body.length > 800) return showToast("A mensagem deve ter no mÃ¡ximo 800 caracteres.");
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
    openMessages(studentId);
    showToast(state.socketReady ? "Mensagem enviada em tempo real." : "Mensagem salva em modo local.");
  }

  function handlePaymentForm(form) {
    if (state.currentUser?.role !== "manager") return showToast("AÃ§Ã£o restrita ao gestor.");
    const data = new FormData(form);
    const paymentId = form.dataset.paymentId || "";
    const old = paymentId ? state.data.payments.find((item) => item.id === paymentId) : null;
    const studentId = String(data.get("studentId") || "");
    const student = getStudent(studentId);
    if (!student) return showToast("Aluno nÃ£o encontrado.");
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
    showToast(old ? "Pagamento atualizado." : "Pagamento registrado.");
  }

  function chargeFinanceRecord(recordId) {
    const record = findFinanceRecord(recordId);
    if (!record) return showToast("Pagamento nÃ£o encontrado.");
    const url = financeChargeUrl(record);
    if (!url) return showToast("Este aluno nÃ£o possui telefone cadastrado.");
    window.open(url, "_blank", "noopener");
  }

  function startWorkout(workoutId, activityId = "") {
    const student = getCurrentStudent();
    const workout = getWorkout(workoutId);
    if (!student || !workout || workout.studentId !== student.id || workout.status !== "published") {
      return showToast("Treino indisponÃ­vel para este aluno.");
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
          name: exercise?.name || "ExercÃ­cio",
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
    if (!isSetActionAvailable(exerciseIndex, setIndex)) return showToast("Conclua a sÃ©rie atual antes de avanÃ§ar.");
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
      const hasNextSet = state.activeSession.exercises.some((item) => item.sets.some((candidate) => candidate.status !== "done"));
      if (hasNextSet && Number(exercise.restSeconds || 0) > 0) startRest(Number(exercise.restSeconds || 0));
      renderStudent();
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
    if (!allDone) return showToast("Finalize todas as sÃ©ries antes de concluir o treino.");
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
    showToast(`Treino finalizado. Volume load total: ${finalSession.totalVolumeLoad}.`);
  }

  function openInstallSheet(customMessage) {
    renderInstallInstructions(customMessage);
    elements.installSheet.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeInstallSheet() {
    elements.installSheet.hidden = true;
    document.body.style.overflow = "";
  }

  function renderInstallInstructions(customMessage) {
    elements.installSheetMessage.textContent =
      customMessage ||
      "Seu app estÃ¡ pronto para instalaÃ§Ã£o. Caso o botÃ£o de instalaÃ§Ã£o nÃ£o apareÃ§a automaticamente neste aparelho, abra o menu do navegador e escolha a opÃ§Ã£o de instalar o aplicativo.";
    const instructions = ["Use Chrome ou Edge em um endereÃ§o HTTPS.", "Abra o menu do navegador.", "Escolha Instalar aplicativo quando a opÃ§Ã£o aparecer."];
    elements.installSteps.innerHTML = instructions.map((item) => `<li>${item}</li>`).join("");
  }

  async function requestInstall() {
    if (isStandalone()) return showToast("O aplicativo jÃ¡ estÃ¡ aberto em modo app.");
    if (!state.deferredPrompt) return openInstallSheet();
    const promptEvent = state.deferredPrompt;
    state.deferredPrompt = null;
    promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === "accepted") {
      localStorage.setItem(keys.installed, "true");
      closeInstallSheet();
      updateInstallUi();
      showToast("InstalaÃ§Ã£o iniciada.");
    } else {
      openInstallSheet("A instalaÃ§Ã£o nÃ£o foi concluÃ­da. VocÃª ainda pode instalar o aplicativo pelo menu do navegador.");
    }
  }

  function isStandalone() {
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  }

  function updateInstallUi() {
    const installed = isStandalone() || localStorage.getItem(keys.installed) === "true";
    elements.body.classList.toggle("app-installed", installed);
    elements.installStatus.textContent = installed ? "Aplicativo instalado" : "Aplicativo pronto para instalaÃ§Ã£o";
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
        .catch(() => showToast("NÃ£o foi possÃ­vel ativar o modo offline neste acesso."));
    }
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
      console.warn("NÃ£o foi possÃ­vel limpar completamente o cache do app.", error);
    }

    params.delete("refreshApp");
    params.delete("resetPwa");
    params.set("v", "53");
    const query = params.toString();
    window.location.replace(`${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
    return true;
  }

  function bindEvents() {
    document.addEventListener("click", (event) => {
      const target = event.target.closest("button, .day-cell, [data-close-modal], [data-close-install], [data-manager-drawer-backdrop]");
      if (!target) return;

      if (target.matches("[data-manager-menu-toggle]")) openManagerDrawer();
      if (target.matches("[data-manager-drawer-backdrop]")) closeManagerDrawer();
      if (target.matches("[data-install-trigger]")) requestInstall();
      if (target.matches("[data-close-install]")) closeInstallSheet();
      if (target.matches("[data-close-modal]")) closeModal();
      if (target.matches("[data-logout]")) logout();

      if (target.dataset.managerNav) {
        if (target.dataset.managerNav !== "studentProfile") clearStudentProfileHash();
        state.managerMenu = target.dataset.managerNav;
        closeManagerDrawer();
        renderManager();
      }
      if (target.dataset.studentNav) {
        state.studentMenu = target.dataset.studentNav;
        renderStudent();
      }
      if (target.matches("[data-open-student-form]")) openStudentForm(target.dataset.openStudentForm || "");
      if (target.matches("[data-open-student-profile]")) {
        closeModal();
        openStudentProfile(target.dataset.openStudentProfile);
      }
      if (target.matches("[data-send-student-invite]")) sendStudentInvite(target.dataset.sendStudentInvite);
      if (target.matches("[data-copy-invite-link]")) {
        const inviteInput = elements.modalBody.querySelector("[data-invite-url]");
        if (inviteInput) {
          inviteInput.select();
          navigator.clipboard?.writeText(inviteInput.value).catch(() => {});
          showToast("Link copiado.");
        }
      }
      if (target.matches("[data-copy-contract-link]")) {
        const contractInput = elements.modalBody.querySelector("[data-contract-url]");
        if (contractInput) {
          contractInput.select();
          navigator.clipboard?.writeText(contractInput.value).catch(() => {});
          showToast("Link copiado.");
        }
      }
      if (target.matches("[data-profile-tab]")) {
        state.profileTab = target.dataset.profileTab;
        openStudentProfile(state.activeStudentProfileId, { updateHash: false });
      }
      if (target.matches("[data-open-exercise-form]")) openExerciseForm(target.dataset.openExerciseForm || "");
      if (target.matches("[data-open-exercise-video]")) openExerciseVideo(target.dataset.openExerciseVideo);
      if (target.matches("[data-use-exercise-workout]")) openUseExerciseInWorkout(target.dataset.useExerciseWorkout);
      if (target.matches("[data-open-workout-form]")) openWorkoutForm(target.dataset.openWorkoutForm || "", target.dataset.prefillStudent || "");
      if (target.matches("[data-open-apply-pattern-form]")) openApplyPatternForm(target.dataset.openApplyPatternForm);
      if (target.matches("[data-open-student-pattern-workout]")) openStudentPatternWorkoutForm(target.dataset.openStudentPatternWorkout);
      if (target.matches("[data-open-activity-form]")) openActivityForm(target.dataset.openActivityForm || "", target.dataset.prefillStudent || "");
      if (target.matches("[data-open-update-form]")) openUpdateForm(target.dataset.openUpdateForm);
      if (target.matches("[data-open-update-comment]")) openUpdateComment(target.dataset.openUpdateComment);
      if (target.matches("[data-open-contract-form]")) openContractForm(target.dataset.openContractForm, target.dataset.contractId || "");
      if (target.matches("[data-open-contract]")) openContract(target.dataset.openContract);
      if (target.matches("[data-send-contract-link]")) sendContractLink(target.dataset.sendContractLink);
      if (target.matches("[data-open-payment-form]")) openPaymentForm(target.dataset.openPaymentForm || "", { recordId: target.dataset.paymentRecord || "" });
      if (target.matches("[data-open-payment-detail]")) openPaymentDetail(target.dataset.openPaymentDetail);
      if (target.matches("[data-open-payment-receipt]")) openPaymentReceipt(target.dataset.openPaymentReceipt);
      if (target.matches("[data-finance-charge]")) chargeFinanceRecord(target.dataset.financeCharge);
      if (target.matches("[data-open-diet-form]")) openDietPlanForm(target.dataset.openDietForm || "", target.dataset.prefillStudent || "");
      if (target.matches("[data-open-diet-detail]")) openDietPlanDetail(target.dataset.openDietDetail);
      if (target.matches("[data-send-diet-link]")) sendDietPlanLink(target.dataset.sendDietLink);
      if (target.matches("[data-duplicate-diet]")) duplicateDietPlan(target.dataset.duplicateDiet);
      if (target.matches("[data-archive-diet]")) archiveDietPlan(target.dataset.archiveDiet);
      if (target.matches("[data-diet-show-all]")) {
        state.dietFilters = { q: "", status: "all", objective: "all" };
        renderManager();
      }
      if (target.matches("[data-finance-show-all]")) {
        state.financeFilters.q = "";
        state.financeFilters.status = "all";
        renderManager();
      }
      if (target.dataset.financeMonthShift) {
        state.financeFilters.month = Number(target.dataset.financeMonthShift) > 0 ? financeNextMonth(state.financeFilters.month) : financePreviousMonth(state.financeFilters.month);
        renderManager();
      }
      if (target.matches("[data-message-show-all]")) {
        state.messageFilters = { q: "", status: "all" };
        renderManager();
      }
      if (target.matches("[data-print-contract]")) {
        showToast("Use a opÃ§Ã£o de salvar como PDF na impressÃ£o do navegador.");
        window.print();
      }
      if (target.matches("[data-open-agenda-detail]")) openAgendaItemDetail(target.dataset.openAgendaDetail, target.dataset.agendaDate || "", target.dataset.agendaStudent || "");
      if (target.matches("[data-open-messages]")) openMessages(target.dataset.openMessages);
      if (target.matches("[data-open-local-video]")) openLocalVideo(target.dataset.openLocalVideo);
      if (target.matches("[data-whatsapp-activity]")) openWhatsApp(target.dataset.whatsappActivity, target.dataset.whatsappStudent);
      if (target.matches("[data-add-workout-row]")) {
        const container = document.getElementById("workoutRows");
        container.insertAdjacentHTML("beforeend", workoutRowTemplate(normalizeWorkoutExercise({ order: container.querySelectorAll("[data-workout-row]").length + 1, exerciseId: state.data.exercises.find((e) => e.status === "active")?.id || "" }), container.querySelectorAll("[data-workout-row]").length));
      }
      if (target.matches("[data-remove-workout-row]")) target.closest("[data-workout-row]")?.remove();
      if (target.matches("[data-toggle-exercise-status]")) {
        const exercise = getExercise(target.dataset.toggleExerciseStatus);
        if (exercise) exercise.status = exercise.status === "active" ? "inactive" : "active";
        persistData();
        renderApp();
      }
      if (target.matches("[data-duplicate-workout]")) duplicateWorkout(target.dataset.duplicateWorkout);
      if (target.matches("[data-publish-workout]")) publishWorkout(target.dataset.publishWorkout);
      if (target.matches("[data-archive-workout]")) archiveWorkout(target.dataset.archiveWorkout);
      if (target.matches("[data-restore-workout]")) restoreWorkout(target.dataset.restoreWorkout);
      if (target.matches("[data-delete-workout]")) deleteWorkout(target.dataset.deleteWorkout);
      if (target.matches("[data-remove-exercise-video]")) removeExerciseVideo(target.dataset.removeExerciseVideo);
      if (target.matches("[data-delete-exercise]")) deleteExercise(target.dataset.deleteExercise);
      if (target.matches("[data-delete-student]")) deleteStudent(target.dataset.deleteStudent);
      if (target.matches("[data-delete-activity]")) deleteActivity(target.dataset.deleteActivity);
      if (target.matches("[data-update-activity-status]")) {
        const [id, status] = String(target.dataset.updateActivityStatus || "").split(":");
        updateActivityStatus(id, status);
      }
      if (target.matches("[data-sign-contract]")) signContract(target.dataset.signContract).catch(() => showToast("Nao foi possivel assinar o contrato agora."));
      if (target.matches("[data-cancel-contract]")) cancelContract(target.dataset.cancelContract);
      if (target.matches("[data-agenda-today]")) {
        state.agendaDate = todayISO();
        renderApp();
      }
      if (target.dataset.agendaShift) {
        const direction = Number(target.dataset.agendaShift);
        state.agendaDate = state.agendaView === "month" ? addMonths(state.agendaDate, direction) : addDays(state.agendaDate, direction * (state.agendaView === "week" ? 7 : 1));
        renderApp();
      }
      if (target.dataset.agendaView) {
        state.agendaView = target.dataset.agendaView;
        renderApp();
      }
      if (target.dataset.selectDate) {
        state.agendaDate = target.dataset.selectDate;
        renderApp();
      }
      if (target.matches("[data-start-workout]")) startWorkout(target.dataset.startWorkout, target.dataset.activityId || "");
      if (target.matches("[data-series-action]")) handleSeriesAction(target.dataset.seriesAction);
      if (target.matches("[data-skip-rest]")) {
        stopRest();
        renderStudent();
        showToast("Descanso pulado.");
      }
      if (target.matches("[data-finish-workout]")) finishWorkout();
      if (target.matches("[data-cancel-active-session]") && confirm("Cancelar treino em andamento?")) {
        state.activeSession = null;
        stopRest();
        persistActiveSession();
        renderStudent();
      }
      if (target.matches("[data-mark-update-viewed]")) markUpdateViewed(target.dataset.markUpdateViewed);
      if (target.matches("[data-clear-demo-data]") && confirm("Limpar todos os dados locais deste app?")) clearDemoData().catch(() => showToast("Nao foi possivel recarregar os dados."));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeManagerDrawer();
    });

    document.addEventListener("input", (event) => {
      const target = event.target;
      if (target.matches("[data-student-search]")) {
        state.search = target.value;
        renderManager();
      }
      if (target.matches("[data-exercise-filter]")) {
        state.exerciseFilters[target.dataset.exerciseFilter] = target.value;
        renderManager();
      }
      if (target.matches("[data-workout-filter]")) {
        state.workoutFilters[target.dataset.workoutFilter] = target.value;
        renderManager();
      }
      if (target.matches("[data-message-filter]")) {
        state.messageFilters[target.dataset.messageFilter] = target.value;
        renderManager();
      }
      if (target.matches("[data-finance-filter]")) {
        state.financeFilters[target.dataset.financeFilter] = target.value;
        renderManager();
      }
      if (target.matches("[data-diet-filter]")) {
        state.dietFilters[target.dataset.dietFilter] = target.value;
        renderManager();
      }
    });

    document.addEventListener("change", (event) => {
      const target = event.target;
      if (target.matches("[data-exercise-filter]")) {
        state.exerciseFilters[target.dataset.exerciseFilter] = target.value;
        renderManager();
      }
      if (target.matches("[data-workout-filter]")) {
        state.workoutFilters[target.dataset.workoutFilter] = target.value;
        renderManager();
      }
      if (target.matches("[data-student-filter]")) {
        state.studentFilters[target.dataset.studentFilter] = target.value;
        renderManager();
      }
      if (target.matches("[data-agenda-date]")) {
        state.agendaDate = target.value || todayISO();
        renderApp();
      }
      if (target.matches("[data-update-filter]")) {
        state.updateFilters[target.dataset.updateFilter] = target.value;
        renderManager();
      }
      if (target.matches("[data-contract-filter]")) {
        state.contractFilters[target.dataset.contractFilter] = target.value;
        renderManager();
      }
      if (target.matches("[data-message-filter]")) {
        state.messageFilters[target.dataset.messageFilter] = target.value;
        renderManager();
      }
      if (target.matches("[data-finance-filter]")) {
        state.financeFilters[target.dataset.financeFilter] = target.value;
        renderManager();
      }
      if (target.matches("[data-diet-filter]")) {
        state.dietFilters[target.dataset.dietFilter] = target.value;
        renderManager();
      }
      if (target.matches("[data-activity-student]")) {
        const workoutSelect = elements.modalBody.querySelector('[name="workoutId"]');
        if (workoutSelect) workoutSelect.innerHTML = workoutOptions(target.value);
      }
    });

    document.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.target;
      if (form.id === "studentForm") await handleStudentForm(form);
      if (form.id === "exerciseForm") await handleExerciseForm(form);
      if (form.id === "useExerciseForm") handleUseExerciseForm(form);
      if (form.id === "workoutForm") handleWorkoutForm(form);
      if (form.id === "applyPatternForm") handleApplyPatternForm(form);
      if (form.id === "studentPatternWorkoutForm") handleStudentPatternWorkoutForm(form);
      if (form.id === "dietForm") handleDietForm(form);
      if (form.id === "activityForm") handleActivityForm(form);
      if (form.id === "updateForm") await handleUpdateForm(form);
      if (form.id === "updateCommentForm") handleUpdateComment(form);
      if (form.id === "contractStudentPickerForm") handleContractStudentPicker(form);
      if (form.id === "settingsForm") handleSettingsForm(form);
      if (form.id === "contractForm") await handleContractForm(form);
      if (form.id === "messageForm") handleMessageForm(form);
      if (form.id === "paymentForm") handlePaymentForm(form);
      if (form.id === "resetPasswordForm") await handleResetPasswordForm(form);
    });

    elements.loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const remember = Boolean(elements.rememberMe?.checked);
      setRememberSession(remember);
      try {
        const user = await authenticateUser(elements.email.value, elements.password.value);
      if (!user) return showToast(getLoginAccessMessage(elements.email.value) || "E-mail ou senha invÃ¡lidos.");
      state.currentUser = user;
      setStoredUserSession(user, remember);
      elements.password.value = "";
      showView(user.role === "manager" ? "manager" : "student");
      await connectRealtime();
      syncRealtimeRoom();
      applyRouteFromHash();
      renderApp();
      openPendingContractAfterLogin();
      showToast(user.role === "manager" ? "Painel do gestor aberto." : "Ãrea do aluno aberta.");
      } catch (error) {
        showToast(error.message || getLoginAccessMessage(elements.email.value) || "E-mail ou senha invÃ¡lidos.");
      }
    });

    elements.fillAdminDemo.addEventListener("click", () => {
      elements.email.value = ADMIN.email;
      elements.password.value = "Admin@2026";
      elements.password.focus();
    });
    elements.forgotPassword.addEventListener("click", requestPasswordReset);
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
    window.addEventListener("hashchange", () => {
      if (applyRouteFromHash()) renderManager();
      else if (state.currentUser?.role === "manager" && state.managerMenu === "studentProfile") {
        state.managerMenu = "students";
        state.activeStudentProfileId = "";
        renderManager();
      }
    });
  }

  function duplicateWorkout(id) {
    const workout = getWorkout(id);
    if (!workout) return;
    const isPattern = isWorkoutPattern(workout);
    state.data.workouts.unshift(
      normalizeWorkout({
        ...workout,
        id: createId("workout"),
        title: `${workout.title} (cÃ³pia)`,
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
    showToast(isPattern ? "PadrÃ£o duplicado como rascunho." : "Treino duplicado como rascunho.");
  }

  function publishWorkout(id) {
    const workout = getWorkout(id);
    if (!workout || isWorkoutPattern(workout)) return showToast("Treino indisponÃ­vel.");
    if (!workout.exercises.length) return showToast("Adicione pelo menos um exercÃ­cio antes de publicar.");
    workout.status = "published";
    workout.publishedAt = workout.publishedAt || new Date().toISOString();
    workout.updatedAt = new Date().toISOString();
    persistData();
    renderApp();
    showToast("Treino publicado para o aluno.");
  }

  function archiveWorkout(id) {
    const workout = getWorkout(id);
    if (!workout) return;
    workout.status = "archived";
    workout.updatedAt = new Date().toISOString();
    persistData();
    renderApp();
    showToast(isWorkoutPattern(workout) ? "PadrÃ£o arquivado." : "Treino arquivado.");
  }

  function restoreWorkout(id) {
    const workout = getWorkout(id);
    if (!workout) return;
    workout.status = "draft";
    workout.updatedAt = new Date().toISOString();
    persistData();
    renderApp();
    showToast(isWorkoutPattern(workout) ? "PadrÃ£o reativado como rascunho." : "Treino reativado como rascunho.");
  }

  function deleteWorkout(id) {
    const workout = getWorkout(id);
    if (!workout) return;
    const isPattern = isWorkoutPattern(workout);
    const hasHistory = state.data.sessions.some((session) => session.workoutId === id);
    const hasStudentCopies = state.data.workouts.some((item) => item.sourcePatternId === id);
    if (hasHistory || hasStudentCopies) return showToast(isPattern ? "Este padrÃ£o jÃ¡ tem vÃ­nculo com treino de aluno. Arquive em vez de remover." : "Este treino possui histÃ³rico. Arquive em vez de remover.");
    if (!confirm(isPattern ? "Remover este padrÃ£o?" : "Remover este treino?")) return;
    state.data.workouts = state.data.workouts.filter((workout) => workout.id !== id);
    persistData();
    renderApp();
    showToast(isPattern ? "PadrÃ£o removido." : "Treino removido.");
  }

  function deleteExercise(id) {
    const exercise = getExercise(id);
    if (!exercise) return;
    if (isExerciseUsed(id)) {
      exercise.status = "inactive";
      persistData();
      renderApp();
      showToast("ExercÃ­cio usado em treinos/histÃ³rico. Ele foi inativado em vez de excluÃ­do.");
      return;
    }
    if (!confirm("Excluir este exercÃ­cio definitivamente?")) return;
    state.data.exercises = state.data.exercises.filter((item) => item.id !== id);
    persistData();
    renderApp();
    showToast("ExercÃ­cio excluÃ­do.");
  }

  function removeExerciseVideo(id) {
    const exercise = getExercise(id);
    if (!exercise || !hasExerciseVideo(exercise)) return showToast("Este exercÃ­cio nÃ£o tem vÃ­deo cadastrado.");
    if (!confirm("Remover o vÃ­deo deste exercÃ­cio?")) return;
    exercise.videoUrl = "";
    exercise.videoStorage = "";
    exercise.videoKey = "";
    exercise.videoName = "";
    exercise.videoSize = 0;
    exercise.videoUploadedAt = "";
    exercise.updatedAt = new Date().toISOString();
    persistData();
    renderApp();
    showToast("VÃ­deo removido do exercÃ­cio.");
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
    if (!activity) return showToast("Atividade nÃ£o encontrada.");
    if ((status === "canceled" || status === "missed") && !confirm(status === "canceled" ? "Cancelar esta atividade?" : "Marcar como nÃ£o realizada?")) return;
    activity.status = status;
    activity.updatedAt = new Date().toISOString();
    persistData();
    closeModal();
    renderApp();
    showToast(status === "done" ? "Atividade concluÃ­da." : status === "canceled" ? "Atividade cancelada." : "Status da atividade atualizado.");
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
    if (!contract || state.currentUser?.role !== "student" || contract.studentId !== state.currentUser.studentId) return showToast("Contrato indisponÃ­vel.");
    const meta = await getContractSignatureMeta(contract);
    contract.status = "signed";
    contract.signedAt = new Date().toISOString();
    contract.signedVersion = contract.version;
    contract.technicalId = technicalId();
    contract.signatureIp = meta.ip || "";
    contract.signatureUserAgent = meta.userAgent || navigator.userAgent || "";
    contract.signatureMeta = JSON.stringify({
      source: "internal_app_acceptance",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      language: navigator.language || "",
      backendMeta: meta || {}
    });
    persistData();
    closeModal();
    renderApp();
    showToast("Contrato assinado digitalmente dentro do app.");
  }

  function cancelContract(id) {
    const contract = state.data.contracts.find((item) => item.id === id);
    if (!contract || contract.status === "signed") return showToast("Contrato nÃ£o pode ser cancelado.");
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
    if (!exercise?.videoKey) return showToast("VÃ­deo local nÃ£o encontrado.");
    try {
      const blob = await readLocalVideo(exercise.videoKey);
      if (!blob) return showToast("VÃ­deo local nÃ£o encontrado neste aparelho.");
      if (state.videoObjectUrls[exerciseId]) URL.revokeObjectURL(state.videoObjectUrls[exerciseId]);
      const url = URL.createObjectURL(blob);
      state.videoObjectUrls[exerciseId] = url;
      openModal(
        exercise.name,
        `
          <div class="content-stack">
            <video class="exercise-video" src="${url}" controls playsinline></video>
            <p class="small-text">Este vÃ­deo estÃ¡ salvo somente neste navegador. Ao hospedar com backend Hostinger, os vÃ­deos enviados ficam disponÃ­veis entre aparelhos.</p>
          </div>
        `
      );
    } catch (error) {
      showToast("NÃ£o foi possÃ­vel abrir o vÃ­deo local.");
    }
  }

  function openWhatsApp(activityId, studentId) {
    const url = buildWhatsAppUrl(activityId, studentId);
    if (!url) return showToast("Este aluno nÃ£o possui telefone cadastrado.");
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
    return true;
  }

  async function boot() {
    try {
      if (await handleAppRefreshRequest()) return;
      document.body.classList.toggle("demo-mode", new URLSearchParams(window.location.search).has("demo"));
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
      showToast("O app carregou em modo de recuperaÃ§Ã£o. Recarregue a pÃ¡gina se necessÃ¡rio.");
    } finally {
      window.setTimeout(() => document.body.classList.add("app-ready"), 380);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

