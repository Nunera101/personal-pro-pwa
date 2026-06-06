# DIAGNÓSTICO COMPLETO — Personal Pro PWA

> Gerado em 2026-06-06 | Versão analisada: v8

---

## 1. TAMANHO DOS ARQUIVOS PRINCIPAIS

### Frontend

| Arquivo | Linhas |
|---------|--------|
| `app.js` | **7.406** |
| `styles.css` | **10.983** |
| `index.html` | ~200 (shell HTML5 + PWA) |
| `sw.js` | ~60 (service worker) |

### Backend (`server/`)

| Arquivo | Linhas | Responsabilidade |
|---------|--------|-----------------|
| `server.js` | **16** | Entry point (carrega server/app.js) |
| `server/app.js` | **58** | Express setup, CORS, Socket.IO, static |
| `server/routes/api.js` | **614** | Todas as rotas HTTP da API |
| `server/routes/uploads.js` | **65** | Upload multipart de vídeos |
| `server/auth.js` | **61** | JWT, middlewares requireAuth/requireManager |
| `server/config.js` | **22** | Variáveis de ambiente centralizadas |
| `server/db.js` | **40** | Pool PostgreSQL |
| `server/mail.js` | **110** | Templates Nodemailer (reset, invite, contrato) |
| `server/realtime.js` | **82** | Socket.IO (rooms, eventos message:send) |
| `server/migrate.js` | **12** | CLI runner de migrações |
| `server/migrationRunner.js` | **46** | Executa SQL de migrações |
| `server/storage/collections.js` | **47** | Abstração Postgres ↔ JSON fallback |
| `server/migrations/001_initial.sql` | **192** | Schema completo do banco |
| **Total backend** | **~1.365** | |

**Total geral do projeto:** ~19.754 linhas (frontend + backend)

---

## 2. FUNÇÕES DE `app.js` — NOME E QUANTIDADE DE LINHAS

Total: **416 funções**. Listagem completa com linha inicial e tamanho:

### Infraestrutura de Dados e Sync (linhas 204–408)

| Função | Linha | Tamanho |
|--------|-------|---------|
| `hashPassword` | 204 | 10 |
| `readList` | 214 | 9 |
| `readObject` | 223 | 9 |
| `write` | 232 | 4 |
| `sameOriginApiBase` | 236 | 4 |
| `getApiBases` | 240 | 9 |
| `apiUrl` | 249 | 5 |
| `apiOrigin` | 254 | 8 |
| `fetchWithTimeout` | 262 | 11 |
| `fetchJsonFromApi` | 273 | **39** |
| `readRemoteCollection` | 312 | 5 |
| `writeRemoteCollection` | 317 | 9 |
| `readRemoteCollections` | 326 | 14 |
| `localSnapshot` | 340 | 17 |
| `pickCollection` | 357 | 8 |
| `currentDataSnapshot` | 365 | 16 |
| `scheduleRemoteSync` | 381 | 5 |
| `flushRemoteSync` | 386 | 24 |

### Utilitários (linhas 410–575)

| Função | Linha | Tamanho |
|--------|-------|---------|
| `createId` | 410 | 4 |
| `todayISO` | 414 | 4 |
| `toISODate` | 418 | 4 |
| `parseISODate` | 422 | 5 |
| `addDays` | 427 | 6 |
| `addMonths` | 433 | 7 |
| `startOfWeek` | 440 | 7 |
| `startOfMonth` | 447 | 6 |
| `monthLabel` | 453 | 4 |
| `calendarMonthDays` | 457 | 5 |
| `formatDate` | 462 | 4 |
| `formatLongDate` | 466 | 4 |
| `formatShortDate` | 470 | 4 |
| `dayName` | 474 | 4 |
| `normalizeEmail` | 478 | 39 |
| `fixMojibake` | 517 | 8 |
| `escapeHtml` | 525 | 9 |
| `scrubVisibleText` | 534 | 23 |
| `numberValue` | 557 | 5 |
| `normalizeStringList` | 562 | 5 |

### Normalização de Dados (linhas 567–981)

| Função | Linha | Tamanho |
|--------|-------|---------|
| `normalizeStudentAccessStatus` | 567 | 6 |
| `normalizeStudent` | 573 | 24 |
| `getStudentAccessState` | 597 | 38 |
| `getExercisePrimaryMuscle` | 635 | 4 |
| `getExerciseSecondaryMuscles` | 639 | 5 |
| `getExerciseMuscleGroups` | 644 | 4 |
| `hasExerciseVideo` | 648 | 4 |
| `formatFileSize` | 652 | 7 |
| `exerciseMuscleOptions` | 659 | 7 |
| `exerciseSecondaryMuscleChoices` | 666 | 15 |
| `workoutLevelLabel` | 681 | 4 |
| `workoutLevelOptions` | 685 | 4 |
| `workoutStatusOptions` | 689 | 9 |
| `cloneWorkoutExercises` | 698 | 10 |
| `buildStudentWorkoutFromPattern` | 708 | 17 |
| `loadData` | 725 | 27 |
| `normalizeExercise` | 752 | 25 |
| `normalizeWorkout` | 777 | 20 |
| `normalizeWorkoutExercise` | 797 | 13 |
| `normalizeActivity` | 810 | 21 |
| `normalizeSession` | 831 | 14 |
| `normalizeUpdate` | 845 | 21 |
| `normalizeContract` | 866 | 30 |
| `normalizeMessage` | 896 | 12 |
| `normalizePayment` | 908 | 20 |
| `normalizeDietMeal` | 928 | 10 |
| `normalizeDietPlan` | 938 | 25 |
| `normalizeSettings` | 963 | 19 |

### Seed e Persistência (linhas 982–1054)

| Função | Linha | Tamanho |
|--------|-------|---------|
| `seedExercises` | 982 | 35 |
| `migrateOldWorkoutData` | 1017 | 23 |
| `persistData` | 1040 | 15 |
| `readActiveSession` | 1055 | 10 |
| `persistActiveSession` | 1065 | 5 |

### Camada de Acesso a Dados (linhas 1070–1196)

| Função | Linha | Tamanho |
|--------|-------|---------|
| `getStudent` | 1070 | 4 |
| `getStudentName` | 1074 | 4 |
| `getExercise` | 1078 | 4 |
| `getWorkout` | 1082 | 4 |
| `getCurrentStudent` | 1086 | 5 |
| `isWorkoutPattern` | 1091 | 4 |
| `getWorkoutPatterns` | 1095 | 6 |
| `getAvailableWorkoutPatterns` | 1101 | 4 |
| `workoutPatternOptions` | 1105 | 8 |
| `getStudentWorkouts` | 1113 | 7 |
| `getStudentSessions` | 1120 | 4 |
| `getLastSubmittedUpdate` | 1124 | 6 |
| `getContractSummary` | 1130 | 10 |
| `getStudentProfileStats` | 1140 | 28 |
| `parseStudentProfileHash` | 1168 | 5 |
| `updateStudentProfileHash` | 1173 | 5 |
| `clearStudentProfileHash` | 1178 | 4 |
| `applyRouteFromHash` | 1182 | 10 |
| `isSameDay` | 1192 | 4 |
| `sessionsThisWeek` | 1196 | 6 |
| `sessionsThisMonth` | 1202 | 5 |
| `getUpdateForStudent` | 1207 | 7 |
| `getStudentContracts` | 1214 | 6 |
| `getBlockingContractForStudent` | 1220 | 4 |
| `getRequiredContractForStudent` | 1224 | 12 |

### Contratos (linhas 1236–1298)

| Função | Linha | Tamanho |
|--------|-------|---------|
| `getContractDefaults` | 1236 | 11 |
| `contractVariables` | 1247 | 18 |
| `renderTemplate` | 1265 | 4 |
| `buildContractBody` | 1269 | 4 |
| `ensureDefaultContractForStudent` | 1273 | 19 |
| `markContractViewed` | 1292 | 7 |

### Mensagens e Agenda (linhas 1299–1360)

| Função | Linha | Tamanho |
|--------|-------|---------|
| `getStudentMessages` | 1299 | 6 |
| `getRecentMessages` | 1305 | 6 |
| `getNextActivityForStudent` | 1311 | 7 |
| `isExerciseUsed` | 1318 | 7 |
| `sanitizePhone` | 1325 | 7 |
| `buildWhatsAppMessage` | 1332 | 14 |
| `buildWhatsAppUrl` | 1346 | 9 |
| `whatsappButton` | 1355 | 7 |

### Financeiro (linhas 1362–1531)

| Função | Linha | Tamanho |
|--------|-------|---------|
| `moneyValue` | 1362 | 10 |
| `currencyValue` | 1372 | 4 |
| `currencyExact` | 1376 | 4 |
| `financeMonthStart` | 1380 | 5 |
| `financeMonthEnd` | 1385 | 7 |
| `financeMonthLabel` | 1392 | 4 |
| `getContractMonthlyAmount` | 1396 | 4 |
| `getBillableContractForStudent` | 1400 | 12 |
| `financeDueDateForContract` | 1412 | 8 |
| `financeStatusKey` | 1420 | 11 |
| `financeStatusMeta` | 1431 | 13 |
| `buildFinanceRecords` | 1444 | **39** |
| `findFinanceRecord` | 1483 | 6 |
| `financeStats` | 1489 | 18 |
| `financePreviousMonth` | 1507 | 4 |
| `financeNextMonth` | 1511 | 4 |
| `financeChargeUrl` | 1515 | 18 |

### Dieta (linhas 1533–1614)

| Função | Linha | Tamanho |
|--------|-------|---------|
| `getDietPlan` | 1533 | 4 |
| `getStudentDietPlans` | 1537 | 6 |
| `getCurrentDietPlanForStudent` | 1543 | 4 |
| `dietStatusKey` | 1547 | 10 |
| `dietStatusMeta` | 1557 | 12 |
| `dietStats` | 1569 | 16 |
| `dietPlanMatchesFilters` | 1585 | 12 |
| `dietLinkUrl` | 1597 | 18 |

### Vídeo e Mídia (linhas 1615–1700)

| Função | Linha | Tamanho |
|--------|-------|---------|
| `videoActionHtml` | 1615 | 12 |
| `openVideoStore` | 1627 | 10 |
| `saveLocalVideo` | 1637 | 10 |
| `readLocalVideo` | 1647 | 10 |
| `uploadExerciseVideo` | 1657 | **41** |
| `technicalId` | 1698 | 4 |

### Real-time e Auth (linhas 1702–2036)

| Função | Linha | Tamanho |
|--------|-------|---------|
| `loadSocketClient` | 1702 | 12 |
| `connectRealtime` | 1714 | 22 |
| `syncRealtimeRoom` | 1736 | 5 |
| `ensureNextUpdatePending` | 1741 | 19 |
| `ensureUpdateActivity` | 1760 | 21 |
| `ensureDietReviewActivity` | 1781 | 32 |
| `setRememberSession` | 1813 | 7 |
| `setAuthToken` | 1820 | 9 |
| `sessionUserPayload` | 1829 | 11 |
| `setStoredUserSession` | 1840 | 14 |
| `getStoredUserSession` | 1854 | 16 |
| `clearStoredAuth` | 1870 | 11 |
| `authenticateRemote` | 1881 | 14 |
| `authenticateLocal` | 1895 | 13 |
| `authenticateUser` | 1908 | 11 |
| `getLoginAccessMessage` | 1919 | 9 |
| `requestPasswordReset` | 1928 | 27 |
| `openPasswordResetModal` | 1955 | 15 |
| `handleResetPasswordForm` | 1970 | 30 |
| `handleIncomingPasswordResetLink` | 2000 | 5 |
| `handleIncomingContractLink` | 2005 | 7 |
| `openPendingContractAfterLogin` | 2012 | 25 |

### UI Base e Navegação (linhas 2037–2228)

| Função | Linha | Tamanho |
|--------|-------|---------|
| `showToast` | 2037 | 7 |
| `showView` | 2044 | 10 |
| `renderNav` | 2054 | 13 |
| `renderSideNav` | 2067 | 17 |
| `renderManagerSideNav` | 2084 | 14 |
| `openManagerDrawer` | 2098 | 4 |
| `closeManagerDrawer` | 2102 | 4 |
| `pageHeader` | 2106 | 13 |
| `quickLink` | 2119 | 10 |
| `statusBadge` | 2129 | 4 |
| `initialsFromName` | 2133 | 8 |
| `studentAvatar` | 2141 | 4 |
| `renderApp` | 2145 | 6 |
| `renderManager` | 2151 | 30 |
| `renderStudent` | 2181 | 28 |
| `metricCard` | 2209 | 4 |
| `dashboardMetricCard` | 2213 | 13 |
| `emptyState` | 2226 | 4 |

### Painel do Gestor — Dashboard e Home (linhas 2230–2569)

| Função | Linha | Tamanho |
|--------|-------|---------|
| `renderManagerHome` | 2230 | 69 |
| `renderOperationalItem` | 2299 | 13 |
| `renderManagerHomeV2` | 2312 | **167** ⚠️ |
| `renderDashboardPendingItem` | 2479 | 17 |
| `renderDashboardAgendaItem` | 2496 | 17 |
| `renderWeeklySummary` | 2513 | 57 |

### Painel do Gestor — Mensagens (linhas 2570–2726)

| Função | Linha | Tamanho |
|--------|-------|---------|
| `renderManagerMessages` | 2570 | 65 |
| `buildMessageConversations` | 2635 | 12 |
| `messageMatchesFilters` | 2647 | 13 |
| `messageMetricCard` | 2660 | 11 |
| `messageFilterSelect` | 2671 | 12 |
| `messageMomentLabel` | 2683 | 9 |
| `renderConversationCard` | 2692 | 17 |
| `renderRecentMessageCard` | 2709 | 19 |

### Painel do Gestor — Contratos (linhas 2728–2849)

| Função | Linha | Tamanho |
|--------|-------|---------|
| `renderManagerContracts` | 2728 | 50 |
| `contractMetricCard` | 2778 | 11 |
| `contractFilterSelect` | 2789 | 12 |
| `renderContractCard` | 2801 | 39 |
| `renderNewContractCard` | 2840 | 10 |

### Painel do Gestor — Financeiro (linhas 2850–3083)

| Função | Linha | Tamanho |
|--------|-------|---------|
| `renderManagerFinance` | 2850 | 92 |
| `financeRecordMatchesFilters` | 2942 | 14 |
| `financeMetricCard` | 2956 | 11 |
| `financeFilterSelect` | 2967 | 12 |
| `renderFinanceChart` | 2979 | 20 |
| `financeMonthKpi` | 2999 | 13 |
| `renderFinanceRecordCard` | 3012 | 36 |
| `upcomingFinanceRecords` | 3048 | 9 |
| `bestFinanceWeek` | 3057 | 13 |
| `financeInsightCard` | 3070 | 14 |

### Painel do Gestor — Dieta (linhas 3084–3247)

| Função | Linha | Tamanho |
|--------|-------|---------|
| `renderManagerDiet` | 3084 | 81 |
| `dietMetricCard` | 3165 | 11 |
| `dietFilterSelect` | 3176 | 12 |
| `renderDietPlanCard` | 3188 | 38 |
| `nextDietReviewLabel` | 3226 | 8 |
| `dietInsightCard` | 3234 | 14 |

### Painel do Gestor — More e Alunos (linhas 3248–3479)

| Função | Linha | Tamanho |
|--------|-------|---------|
| `renderManagerMore` | 3248 | 22 |
| `renderStudentsScreen` | 3270 | 70 |
| `studentFilterSelect` | 3340 | 12 |
| `normalizeFilterText` | 3352 | 10 |
| `getStudentContractState` | 3362 | 15 |
| `getStudentOperationalStatus` | 3377 | 13 |
| `studentMatchesStudentFilters` | 3390 | 20 |
| `renderStudentInfoBlock` | 3410 | 10 |
| `renderStudentRow` | 3420 | 44 |
| `renderMessagePreview` | 3464 | 17 |

### Biblioteca de Exercícios (linhas 3481–3770)

| Função | Linha | Tamanho |
|--------|-------|---------|
| `renderExerciseLibrary` | 3481 | 52 |
| `uniqueOptions` | 3533 | 4 |
| `renderExerciseLibraryPremium` | 3537 | 59 |
| `renderLibraryStatCard` | 3596 | 11 |
| `renderPremiumExerciseCard` | 3607 | 57 |
| `exerciseMediaHtml` | 3664 | 11 |
| `renderExerciseVideoCallout` | 3675 | 13 |
| `openExerciseVideo` | 3688 | 11 |
| `openUseExerciseInWorkout` | 3699 | 27 |
| `handleUseExerciseForm` | 3726 | 46 |
| `renderExerciseCard` | 3772 | 36 |

### Treinos — Painel do Gestor (linhas 3808–4084)

| Função | Linha | Tamanho |
|--------|-------|---------|
| `renderManagerWorkouts` | 3808 | 85 |
| `patternMetricCard` | 3893 | 11 |
| `patternGoalOptions` | 3904 | 7 |
| `patternFilterSelect` | 3911 | 12 |
| `renderPatternCard` | 3923 | 46 |
| `patternMetaItem` | 3969 | 10 |
| `renderPatternExercisePreview` | 3979 | 21 |
| `patternStatusLabel` | 4000 | 4 |
| `patternStatusClass` | 4004 | 4 |
| `renderWorkoutExercisePreview` | 4008 | 18 |
| `renderWorkoutCard` | 4026 | 56 |
| `statusWorkout` | 4082 | 4 |

### Área do Aluno — Treinos e Hoje (linhas 4086–4198)

| Função | Linha | Tamanho |
|--------|-------|---------|
| `renderStudentWorkouts` | 4086 | 15 |
| `renderStudentToday` | 4101 | 41 |

### Agenda (linhas 4142–4537)

| Função | Linha | Tamanho |
|--------|-------|---------|
| `getAgendaItemsForDate` | 4142 | 43 |
| `getAgendaItemsForWeek` | 4185 | 5 |
| `getAgendaItemsForMonth` | 4190 | 4 |
| `getContractAgendaDate` | 4194 | 5 |
| `renderAgendaScreen` | 4199 | 68 |
| `agendaPeriodLabel` | 4267 | 9 |
| `formatAgendaDayMonth` | 4276 | 5 |
| `formatAgendaWeekRange` | 4281 | 9 |
| `renderWeekCalendar` | 4290 | 44 |
| `agendaHourSlots` | 4334 | 9 |
| `agendaItemHour` | 4343 | 5 |
| `renderMonthCalendar` | 4348 | 26 |
| `renderDaySchedule` | 4374 | 9 |
| `renderCalendarEventBlock` | 4383 | 10 |
| `renderAgendaList` | 4393 | 31 |
| `renderAgendaLegend` | 4424 | 11 |
| `shortName` | 4435 | 6 |
| `renderAgendaCompact` | 4441 | 18 |
| `activityLabel` | 4459 | 12 |
| `agendaStatusLabel` | 4471 | 4 |
| `agendaStatusTone` | 4475 | 7 |
| `agendaItemClass` | 4482 | 6 |
| `canEditAgendaItem` | 4488 | 5 |
| `findAgendaItem` | 4493 | 9 |
| `openAgendaItemDetail` | 4502 | 36 |

### Atualizações de Progresso (linhas 4538–4882)

| Função | Linha | Tamanho |
|--------|-------|---------|
| `renderStudentUpdates` | 4538 | 19 |
| `renderManagerUpdates` | 4557 | 75 |
| `updateMetricCard` | 4632 | 11 |
| `updateFilterSelect` | 4643 | 12 |
| `renderUpdateCard` | 4655 | 43 |
| `renderUpdateCardNotes` | 4698 | 7 |
| `updatePrimaryActionLabel` | 4705 | 7 |
| `updatePeriodFilterLabel` | 4712 | 11 |
| `renderUpdatePhotoStrip` | 4723 | 24 |
| `updateStatusMeta` | 4747 | 14 |
| `isUpdateLate` | 4761 | 4 |
| `updateMatchesStatusFilter` | 4765 | 7 |
| `updateMatchesPeriodFilter` | 4772 | 13 |
| `updateSortDate` | 4785 | 4 |
| `updateMomentLabel` | 4789 | 8 |
| `daysBetween` | 4797 | 6 |
| `updateWeightMeta` | 4803 | 32 |
| `parseWeight` | 4835 | 6 |
| `formatWeight` | 4841 | 5 |
| `previousWeightUpdate` | 4846 | 8 |
| `renderUpdateRow` | 4854 | 26 |
| `updateStatusLabel` | 4880 | 4 |

### Progresso e Contratos do Aluno (linhas 4884–5011)

| Função | Linha | Tamanho |
|--------|-------|---------|
| `renderStudentProgress` | 4884 | 5 |
| `renderProgressForStudent` | 4889 | 31 |
| `buildExerciseProgress` | 4920 | 15 |
| `renderSessionRow` | 4935 | 13 |
| `contractStatusMeta` | 4948 | 12 |
| `contractPrimaryAction` | 4960 | 10 |
| `contractMatchesFilters` | 4970 | 14 |
| `renderContractRow` | 4984 | 24 |
| `contractStatusLabel` | 5008 | 4 |

### Interface do Aluno (linhas 5012–5181)

| Função | Linha | Tamanho |
|--------|-------|---------|
| `renderStudentContractGate` | 5012 | 28 |
| `renderConversation` | 5040 | 21 |
| `renderStudentProfile` | 5061 | 53 |
| `renderStudentDietOverview` | 5114 | 25 |
| `renderSettings` | 5139 | 43 |

### Execução de Treino (linhas 5182–5272)

| Função | Linha | Tamanho |
|--------|-------|---------|
| `renderWorkoutExecution` | 5182 | 25 |
| `renderRestBanner` | 5207 | 9 |
| `renderExecutionExercise` | 5216 | 20 |
| `renderSetRow` | 5236 | 20 |
| `isSetActionAvailable` | 5256 | 14 |
| `calculateSessionVolume` | 5270 | 4 |

### Modais e Forms Base (linhas 5274–5371)

| Função | Linha | Tamanho |
|--------|-------|---------|
| `openModal` | 5274 | 10 |
| `closeModal` | 5284 | 6 |
| `studentOptions` | 5290 | 5 |
| `exerciseOptions` | 5295 | 6 |
| `workoutOptions` | 5301 | 5 |
| `openStudentForm` | 5306 | 28 |

### Perfil do Aluno — Gestor (linhas 5334–5767)

| Função | Linha | Tamanho |
|--------|-------|---------|
| `renderManagerStudentProfile` | 5334 | 37 |
| `openStudentProfile` | 5371 | 11 |
| `renderStudentProfileHero` | 5382 | 44 |
| `renderStudentSummaryCards` | 5426 | 18 |
| `profileSummaryCard` | 5444 | 11 |
| `renderProfileTabs` | 5455 | 19 |
| `profileTabLabel` | 5474 | 14 |
| `renderStudentProfileTab` | 5488 | **146** ⚠️ |
| `renderStudentProfileOverview` | 5634 | 38 |
| `renderProfileActivityCard` | 5672 | 16 |
| `renderStudentPendingActions` | 5688 | 65 |
| `renderProfilePendingRow` | 5753 | 13 |
| `renderStudentEvolutionPanel` | 5766 | 59 |

### Formulários de Entidades (linhas 5825–7120)

| Função | Linha | Tamanho |
|--------|-------|---------|
| `openExerciseForm` | 5825 | 39 |
| `openWorkoutForm` | 5864 | 33 |
| `openApplyPatternForm` | 5897 | 22 |
| `openStudentPatternWorkoutForm` | 5919 | 24 |
| `workoutRowTemplate` | 5943 | 20 |
| `openActivityForm` | 5963 | 33 |
| `dietObjectiveOptions` | 5996 | 5 |
| `dietStatusOptions` | 6001 | 12 |
| `dietMealsToText` | 6013 | 4 |
| `parseDietMealsText` | 6017 | 11 |
| `openDietPlanForm` | 6028 | 34 |
| `openDietPlanDetail` | 6062 | 48 |
| `openUpdateForm` | 6110 | 22 |
| `openUpdateComment` | 6132 | 77 |
| `updateDetailNote` | 6209 | 9 |
| `openContractForm` | 6218 | 29 |
| `openContractStudentPicker` | 6247 | 20 |
| `openContract` | 6267 | 55 |
| `openMessages` | 6322 | 47 |
| `openPaymentForm` | 6369 | 47 |
| `openPaymentDetail` | 6416 | 38 |
| `openPaymentReceipt` | 6454 | 31 |
| `openInviteLinkModal` | 6485 | 32 |
| `sendStudentInvite` | 6517 | 29 |
| `openContractLinkModal` | 6546 | 33 |
| `sendContractLink` | 6579 | 34 |

### Handlers de Formulários (linhas 6613–7120)

| Função | Linha | Tamanho |
|--------|-------|---------|
| `handleStudentForm` | 6613 | 46 |
| `handleExerciseForm` | 6659 | 61 |
| `handleWorkoutForm` | 6720 | 56 |
| `handleApplyPatternForm` | 6776 | 19 |
| `handleStudentPatternWorkoutForm` | 6795 | 21 |
| `handleDietForm` | 6816 | 45 |
| `sendDietPlanLink` | 6861 | 14 |
| `duplicateDietPlan` | 6875 | 21 |
| `archiveDietPlan` | 6896 | 13 |
| `handleActivityForm` | 6909 | 32 |
| `handleUpdateForm` | 6941 | 23 |
| `readPhotoFiles` | 6964 | 15 |
| `handleUpdateComment` | 6979 | 13 |
| `handleSettingsForm` | 6992 | 17 |
| `handleContractForm` | 7009 | 36 |
| `handleContractStudentPicker` | 7045 | 6 |
| `handleMessageForm` | 7051 | 21 |
| `handlePaymentForm` | 7072 | 41 |
| `chargeFinanceRecord` | 7113 | 8 |

### Execução de Treino — Ações (linhas 7121–7241)

| Função | Linha | Tamanho |
|--------|-------|---------|
| `startWorkout` | 7121 | 41 |
| `handleSeriesAction` | 7162 | 31 |
| `startRest` | 7193 | 14 |
| `stopRest` | 7207 | 6 |
| `finishWorkout` | 7213 | 29 |

### PWA e Service Worker (linhas 7242–7329)

| Função | Linha | Tamanho |
|--------|-------|---------|
| `openInstallSheet` | 7242 | 6 |
| `closeInstallSheet` | 7248 | 5 |
| `renderInstallInstructions` | 7253 | 8 |
| `requestInstall` | 7261 | 17 |
| `isStandalone` | 7278 | 4 |
| `updateInstallUi` | 7282 | 6 |
| `registerServiceWorker` | 7288 | 17 |
| `handleAppRefreshRequest` | 7305 | 26 |

### Eventos e Lifecycle (linhas 7331–7928)

| Função | Linha | Tamanho |
|--------|-------|---------|
| `bindEvents` | 7331 | **303** 🚨 |
| `duplicateWorkout` | 7634 | 24 |
| `publishWorkout` | 7658 | 12 |
| `archiveWorkout` | 7670 | 10 |
| `restoreWorkout` | 7680 | 10 |
| `deleteWorkout` | 7690 | 14 |
| `deleteExercise` | 7704 | 17 |
| `removeExerciseVideo` | 7721 | 16 |
| `deleteStudent` | 7737 | 13 |
| `deleteActivity` | 7750 | 7 |
| `updateActivityStatus` | 7757 | 14 |
| `getContractSignatureMeta` | 7771 | 16 |
| `signContract` | 7787 | 22 |
| `cancelContract` | 7809 | 12 |
| `openLocalVideo` | 7821 | 23 |
| `openWhatsApp` | 7844 | 6 |
| `markUpdateViewed` | 7850 | 10 |
| `clearDemoData` | 7860 | 12 |
| `logout` | 7872 | 15 |
| `resumeStoredSession` | 7887 | 16 |
| `boot` | 7903 | 26 |

---

## 3. MÓDULOS E ROTAS EM `server/`

### Estrutura de módulos

```
server/
├── app.js               — Express + Socket.IO + middleware stack
├── auth.js              — JWT (createSessionToken, verifySessionToken, requireAuth, requireManager)
├── config.js            — process.env centralizado (PORT, DATABASE_URL, JWT_SECRET, SMTP_*)
├── db.js                — Pool PostgreSQL (max 8 conexões, 30s idle)
├── mail.js              — Nodemailer: sendPasswordReset, sendStudentInvite, sendContractEmail
├── realtime.js          — Socket.IO: rooms trainer:X, student:X; eventos join, message:send, message:new
├── migrate.js           — CLI runner
├── migrationRunner.js   — Executa arquivos SQL da pasta migrations/
├── storage/
│   └── collections.js   — readCollection(name), writeCollection(name, value) [Postgres OU JSON]
├── routes/
│   ├── api.js           — Todas as rotas HTTP
│   └── uploads.js       — Multer para vídeos
└── migrations/
    └── 001_initial.sql  — Schema: 14 tabelas, 12 índices
```

### Rotas HTTP (`server/routes/api.js`)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/health` | Livre | Status do servidor |
| `POST` | `/auth/login` | Livre | Login → JWT |
| `POST` | `/auth/forgot-password` | Livre | Envia e-mail de reset |
| `POST` | `/auth/student-invite` | Manager | Envia convite por e-mail |
| `POST` | `/auth/contract-link` | Manager | Envia link de contrato |
| `POST` | `/auth/contract-token` | Livre | Valida token de contrato |
| `POST` | `/auth/contract-signature-meta` | Auth | Registra metadados de assinatura |
| `POST` | `/auth/reset-password` | Livre | Redefine senha via token |
| `GET` | `/collections/:collection` | Auth | Lê coleção (filtrada por role) |
| `PUT` | `/collections/:collection` | Auth | Escreve coleção (com merge) |
| `GET` | `/:collection` | Auth | Alias backward-compatible |
| `PUT` | `/:collection` | Auth | Alias backward-compatible |

**Upload (server/routes/uploads.js):**

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `POST` | `/api/uploads/exercises` | Manager | Upload de vídeo (Multer, max 200MB) |

### Coleções de dados (12 tipos)

| Chave | Conteúdo |
|-------|---------|
| `personal-pro-students-v2` | Perfis de alunos |
| `personal-pro-exercises-v1` | Biblioteca de exercícios |
| `personal-pro-workouts-v3` | Treinos (padrões e atribuídos) |
| `personal-pro-activities-v2` | Eventos agendados |
| `personal-pro-training-sessions-v1` | Sessões executadas |
| `personal-pro-updates-v1` | Atualizações de progresso |
| `personal-pro-contracts-v1` | Contratos digitais |
| `personal-pro-messages-v1` | Mensagens do chat |
| `personal-pro-payments-v1` | Registros financeiros |
| `personal-pro-diets-v1` | Planos alimentares |
| `personal-pro-settings-v1` | Configurações do app |
| `personal-pro-password-resets-v1` | Tokens de reset |

---

## 4. PROBLEMAS CRÍTICOS

### 4.1 Código morto: `renderManagerHome` (v1)

**Localização:** `app.js:2230` (69 linhas)

`renderManagerHome` é a versão original do dashboard. Foi substituída por `renderManagerHomeV2` (linha 2312), que está mapeada explicitamente no objeto `renderers` em `renderManager` (linha 2164). A v1 só é chamada como fallback em rotas desconhecidas:

```js
// linha 2178
elements.managerContent.innerHTML = (renderers[state.managerMenu] || renderManagerHome)();
```

Isso significa que `renderManagerHome` (69 linhas) nunca é executada em fluxo normal — é código morto funcional. O fallback deveria ser `renderManagerHomeV2` ou uma tela de erro.

### 4.2 Ausência total de DELETE no backend

Nenhum endpoint `DELETE` existe na API. Deleções de entidades (alunos, exercícios, atividades, treinos) são feitas exclusivamente no cliente:

```js
// app.js:7698
state.data.workouts = state.data.workouts.filter(w => w.id !== id);
// em seguida: writeRemoteCollection() salva o array filtrado via PUT
```

**Riscos:** Race conditions (dois clientes simultâneos podem restaurar registros deletados); impossibilidade de soft-delete auditado no servidor; impossibilidade futura de webhook ou trigger de remoção no banco.

### 4.3 Acoplamento extremo ao estado global

`state.data.*` é referenciado **236 vezes** diretamente em `app.js`. Qualquer função pode ler e escrever qualquer coleção. Há mutações diretas distribuídas por todo o arquivo:

```js
state.data.students = state.data.students.filter(...);  // linha 7739
state.data.workouts = oldWorkouts.map(...);             // linha 1021
state.data.settings = normalizeSettings({...});         // linha 6994
```

Isso impede isolar domínios sem refatoração profunda e torna debugging difícil.

### 4.4 Duplos aliases de rota no backend

As rotas `/collections/:collection` e `/:collection` fazem exatamente a mesma coisa (linhas 653–686 de `api.js`). O alias existe por compatibilidade, mas duplica a lógica de sanitização e merging chamando as mesmas funções internas, criando ambiguidade de manutenção.

### 4.5 Validação de entrada apenas no cliente

A API aceita qualquer payload sem revalidar os campos obrigatórios ou formatos. Toda validação ocorre nas funções `normalize*()` do `app.js` (frontend). Um cliente malicioso pode salvar dados corrompidos via PUT direto na API.

### 4.6 `console.warn` vazando em produção

`app.js:400`:
```js
console.warn("Sincronizacao remota indisponivel. Mantendo fallback local.", error);
```
Expõe stack traces e detalhes de erros de rede ao usuário final via DevTools.

---

## 5. RISCOS DE MANUTENÇÃO

### 5.1 Funções com mais de 100 linhas

| Função | Linha | Tamanho | Problema |
|--------|-------|---------|---------|
| `bindEvents` | 7331 | **303 linhas** 🚨 | Centraliza TODOS os event listeners do app em um único bloco. Mistura domínios completamente diferentes (agenda, treinos, dieta, contrato, pagamento, PWA). Qualquer adição de feature exige editar este bloco monolítico. |
| `renderManagerHomeV2` | 2312 | **167 linhas** ⚠️ | Gera HTML inline de cards, métricas e lista de pendências numa única função. Difícil de testar e iterar. |
| `renderStudentProfileTab` | 5488 | **146 linhas** ⚠️ | Switch com 6+ cases cada um gerando HTML extenso. Lógica de renderização misturada com lógica de negócio. |

### 5.2 `bindEvents` — risco máximo

`bindEvents` (303 linhas) usa event delegation centralizado, o que é arquiteturalmente defensável, mas a implementação atual mistura 20+ domínios sem separação. Adicionar um novo domínio exige entender toda a função. Um bug de seletor afeta áreas não relacionadas.

### 5.3 Ausência de paginação

Todas as 12 coleções são carregadas inteiras a cada sync. Com crescimento de dados (ex: 100 alunos × 50 sessões = 5.000 registros), o payload inicial pode ultrapassar 1MB, causando lentidão perceptível no boot e no sync.

### 5.4 Ausência de testes

Nenhum arquivo de teste (`*.test.js`, `*.spec.js`, `jest.config.*`, `vitest.config.*`) foi encontrado no projeto. Refatorações são cegas sem cobertura de regressão.

### 5.5 `app.js` como monolito de 7.406 linhas

Todo o frontend vive em um arquivo único sem módulos ES. Cada edição exige carregar o arquivo completo no contexto. Conflitos de merge em PR são inevitáveis quando dois tópicos tocam áreas próximas.

### 5.6 Tabela `audit_logs` sem uso

O schema SQL define a tabela `audit_logs` (com campos `action`, `entity_type`, `metadata jsonb`), mas nenhuma linha de código no backend escreve nela. A feature existe no banco, mas está completamente desconectada da aplicação.

### 5.7 Dois templates paralelos de cobrança/dieta

Existem três sistemas de template similares e independentes:
- `buildWhatsAppMessage` (linha 1332) — usa `replace()` com regex manual
- `buildContractBody` → `renderTemplate` (linha 1265) — usa `{variavel}` substituição
- `financeChargeUrl` (linha 1515) e `dietLinkUrl` (linha 1597) — usam `replace()` com regex próprio

Não há um mecanismo unificado de templates, dificultando evolução.

---

## 6. PLANO DE MODULARIZAÇÃO

### Estratégia geral

Converter `app.js` em módulos ES (`type="module"` no HTML), extraindo por domínio. O `state` global pode ser mantido em `state.js` e importado por todos. A migração pode ser incremental — um módulo por vez, sem reescrita total.

### Estrutura proposta

```
src/
├── state.js                  — state global, persistData, readList, write
├── api.js                    — fetchJsonFromApi, readRemoteCollection, writeRemoteCollection, readRemoteCollections
├── auth.js                   — authenticateUser, authenticateRemote/Local, session storage, reset password
├── boot.js                   — boot(), resumeStoredSession(), applyRouteFromHash()
├── realtime.js               — loadSocketClient, connectRealtime, syncRealtimeRoom
├── pwa.js                    — registerServiceWorker, openInstallSheet, updateInstallUi, handleAppRefreshRequest
├── ui/
│   ├── base.js               — showToast, showView, openModal, closeModal, renderNav, renderApp, pageHeader
│   ├── manager.js            — renderManager, renderManagerSideNav, renderManagerHome*
│   └── student.js            — renderStudent, renderStudentToday, renderStudentProfile
├── domains/
│   ├── agenda/
│   │   ├── agenda.data.js    — getAgendaItemsForDate/Week/Month, findAgendaItem, canEditAgendaItem
│   │   ├── agenda.render.js  — renderAgendaScreen, renderWeekCalendar, renderMonthCalendar, renderDaySchedule
│   │   └── agenda.forms.js   — openActivityForm, handleActivityForm, openAgendaItemDetail, updateActivityStatus
│   ├── treinos/
│   │   ├── workouts.data.js  — getWorkoutPatterns, getStudentWorkouts, buildStudentWorkoutFromPattern
│   │   ├── workouts.render.js — renderManagerWorkouts, renderPatternCard, renderWorkoutCard
│   │   ├── workouts.forms.js  — openWorkoutForm, handleWorkoutForm, openApplyPatternForm
│   │   └── execution.js      — renderWorkoutExecution, startWorkout, handleSeriesAction, startRest, finishWorkout
│   ├── alunos/
│   │   ├── students.data.js  — getStudent, normalizeStudent, getStudentAccessState, getStudentProfileStats
│   │   ├── students.render.js — renderStudentsScreen, renderStudentRow, renderManagerStudentProfile
│   │   └── students.forms.js  — openStudentForm, handleStudentForm, deleteStudent, sendStudentInvite
│   ├── exercicios/
│   │   ├── exercises.data.js  — normalizeExercise, getExercise, isExerciseUsed, seedExercises
│   │   ├── exercises.render.js — renderExerciseLibrary, renderExerciseCard
│   │   └── exercises.forms.js  — openExerciseForm, handleExerciseForm, uploadExerciseVideo, removeExerciseVideo
│   ├── dieta/
│   │   ├── diet.data.js      — normalizeDietPlan, getDietPlan, dietStats, dietPlanMatchesFilters
│   │   ├── diet.render.js    — renderManagerDiet, renderDietPlanCard
│   │   └── diet.forms.js     — openDietPlanForm, handleDietForm, openDietPlanDetail, duplicateDietPlan
│   ├── chat/
│   │   ├── messages.data.js  — normalizeMessage, getStudentMessages, getRecentMessages
│   │   ├── messages.render.js — renderManagerMessages, renderConversation, renderConversationCard
│   │   └── messages.forms.js  — openMessages, handleMessageForm
│   ├── contratos/
│   │   ├── contracts.data.js  — normalizeContract, getContractSummary, getBlockingContractForStudent, buildContractBody
│   │   ├── contracts.render.js — renderManagerContracts, renderContractCard, renderStudentContractGate
│   │   └── contracts.forms.js  — openContractForm, handleContractForm, signContract, cancelContract, openContractLinkModal
│   ├── financeiro/
│   │   ├── finance.data.js   — normalizePayment, buildFinanceRecords, financeStats, getBillableContractForStudent
│   │   ├── finance.render.js — renderManagerFinance, renderFinanceRecordCard, renderFinanceChart
│   │   └── finance.forms.js  — openPaymentForm, handlePaymentForm, chargeFinanceRecord, openPaymentReceipt
│   └── atualizacoes/
│       ├── updates.data.js   — normalizeUpdate, getUpdateForStudent, updateWeightMeta
│       ├── updates.render.js — renderManagerUpdates, renderUpdateCard, renderStudentUpdates
│       └── updates.forms.js  — openUpdateForm, handleUpdateForm, openUpdateComment
├── utils/
│   ├── dates.js              — todayISO, addDays, addMonths, formatDate, calendarMonthDays, ...
│   ├── strings.js            — escapeHtml, normalizeEmail, fixMojibake, scrubVisibleText
│   ├── numbers.js            — moneyValue, currencyValue, formatFileSize, numberValue
│   └── ids.js                — createId, technicalId
└── normalize/
    └── index.js              — Todas as funções normalize*() agrupadas
```

### Divisão de `bindEvents` (303 linhas → ~8 módulos)

Cada módulo de domínio exporta uma função `bindDomainEvents(root)` que registra apenas seus próprios listeners. O `boot.js` os chama sequencialmente:

```js
// boot.js
bindAgendaEvents(document.body);
bindWorkoutEvents(document.body);
bindStudentEvents(document.body);
// ...
```

### Ordem de migração sugerida (menor risco primeiro)

1. **`utils/`** — sem dependências, puro JS
2. **`normalize/`** — depende apenas de utils
3. **`state.js` + `api.js`** — infraestrutura central
4. **`auth.js` + `pwa.js`** — isolados funcionalmente
5. **`domains/exercicios/`** — domínio mais simples, sem inter-dependências
6. **`domains/alunos/`** — central para outros domínios
7. **`domains/treinos/`** — depende de alunos e exercícios
8. **`domains/agenda/`** — depende de treinos e alunos
9. Demais domínios na ordem: dieta → contratos → financeiro → chat → atualizacoes
10. **`ui/`** — último, após domínios estabilizados

---

## 7. O QUE AINDA FALTA IMPLEMENTAR

### Baseado no README e análise do código

#### 7.1 Backend incompleto para exclusão

O README descreve que admin "remove" alunos e atividades. No frontend isso funciona via filtro local + `PUT` da coleção. O backend não tem endpoints `DELETE`. **Falta:** Endpoints `DELETE /collections/:collection/:id` com soft-delete no banco e registro em `audit_logs`.

#### 7.2 `audit_logs` não conectada

A tabela `audit_logs` foi criada no `001_initial.sql` mas nenhuma rota da API escreve nela. **Falta:** Chamar `INSERT INTO audit_logs` nas rotas de escrita, ao menos para ações críticas (login, assinatura de contrato, deleção de aluno).

#### 7.3 Processador de pagamentos real

O módulo financeiro (`renderManagerFinance`, `openPaymentForm`, `chargeFinanceRecord`) é completamente UI. `financeChargeUrl` gera um link de WhatsApp para cobrar o aluno, mas não há integração com gateway de pagamento. **Falta:** Integração com Stripe, Asaas, PagSeguro ou similar para gerar boletos/PIX.

#### 7.4 Paginação de coleções

Todas as coleções são carregadas inteiras. **Falta:** Parâmetros `?limit=` e `?offset=` (ou cursor) nas rotas `GET /collections/:collection`, com paginação no frontend.

#### 7.5 Rate limiting e proteção de endpoints públicos

As rotas `/auth/login`, `/auth/forgot-password` e `/auth/reset-password` não têm throttle. **Falta:** `express-rate-limit` nas rotas públicas de auth.

#### 7.6 Validação de entrada no servidor

As funções `normalize*()` existem apenas no frontend. **Falta:** Validação com `zod` ou `joi` nas rotas de `PUT /collections/:collection` antes de persistir.

#### 7.7 Expiração automática de tokens de reset

A rota `POST /auth/reset-password` verifica o token na coleção `personal-pro-password-resets-v1`, mas a limpeza de tokens expirados depende de verificação manual. **Falta:** Job ou query que deleta tokens com `createdAt` > 1h ao executar reset ou em cron.

#### 7.8 Logo oficial

O `README.md` explicita: `assets/logo-oficial.svg` é um placeholder. **Falta:** Logo real + regeneração dos ícones PWA via `scripts/gerar-icones.ps1`.

#### 7.9 Testes automatizados

Nenhum teste encontrado no projeto. **Falta:** Ao menos testes unitários para as funções `normalize*()`, `buildFinanceRecords()`, `buildContractBody()`, e testes de integração para as rotas da API.

#### 7.10 Notificações push (Web Push API)

O README menciona service worker e PWA instalável, mas não há Web Push implementado. **Falta:** Servidor VAPID + `pushManager.subscribe()` no cliente para notificar alunos de novos treinos ou mensagens mesmo com app fechado.

#### 7.11 Resposta do gestor a atualizações de progresso

A UI tem o campo `response` no objeto `normalizeUpdate()` e o handler `openUpdateComment`. O gestor pode deixar um comentário. Mas não há notificação ao aluno (push ou Socket.IO) quando o gestor responde. **Falta:** Emitir evento via Socket.IO para a room `student:{id}` quando `handleUpdateComment` salvar.

#### 7.12 Backup e exportação de dados

Não há mecanismo de exportação (CSV, PDF). **Falta:** Endpoint `GET /export` ou script de backup para o administrador.

#### 7.13 Multi-trainer

O sistema usa `TRAINER_ID = "trainer-demo"` hardcoded. A arquitetura do banco (tabela `trainers`) suporta múltiplos trainers, mas o frontend não tem fluxo de registro de novo trainer. **Falta:** Rota de registro (`POST /auth/register-trainer`) e isolamento de dados por `trainerId` nas queries.

---

## RESUMO EXECUTIVO

| Dimensão | Status |
|----------|--------|
| Funcionalidades core | ✅ Completas |
| Arquitetura frontend | ⚠️ Monolito funcional, sem módulos ES |
| Arquitetura backend | ✅ Bem estruturada para o tamanho |
| Testes | ❌ Ausentes |
| Segurança API | ⚠️ Sem rate limit, sem validação server-side |
| Escalabilidade | ⚠️ Sem paginação, coleções carregadas inteiras |
| Código morto | ⚠️ `renderManagerHome` v1 (69 linhas sem uso real) |
| Funções grandes | 🚨 `bindEvents` (303 linhas), 2 funções >100 linhas |
| Acoplamento | 🚨 236 referências diretas a `state.data.*` |
| DELETE no backend | ❌ Inexistente |
| Pagamentos reais | ❌ Não integrado |
| Notificações push | ❌ Não implementado |
| Audit log | ❌ Tabela criada, não usada |
| Multi-trainer | ❌ Hardcoded para um único trainer |
