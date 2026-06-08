const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on("pageerror", err => console.error("[page error]", err.message));

  await page.goto("http://localhost:3000/");
  await page.waitForTimeout(1200);

  // Login como manager
  await page.fill("#email", "admin@personalpro.app");
  await page.fill("#password", "Admin@2026");
  await page.click("#loginForm button[type=submit]");

  // Aguardar view do manager
  try {
    await page.waitForSelector("#managerView:not([hidden])", { timeout: 5000 });
    console.log("Manager view visível");
  } catch (e) {
    // modo offline - verificar estado atual
    const html = await page.$eval("body", el => el.innerHTML.substring(0, 300));
    console.log("HTML parcial:", html);
  }

  await page.waitForTimeout(800);

  // Navegar para Atualizações via sidebar ou bottom nav
  const updatesBtn = await page.$("[data-manager-nav='updates']");
  if (!updatesBtn) {
    // tentar pelo botão "Mais" do bottom nav
    const moreBtn = await page.$("[data-manager-nav='more']");
    if (moreBtn) {
      await moreBtn.click();
      await page.waitForTimeout(400);
    }
    const upBtn2 = await page.$("[data-manager-nav='updates']");
    if (upBtn2) { await upBtn2.click(); }
    else { console.log("ERRO: botão updates não encontrado em nenhum lugar"); }
  } else {
    await updatesBtn.click();
  }
  await page.waitForTimeout(600);

  const cards = await page.$$(".update-primary-action");
  console.log(`Cards de atualização encontrados: ${cards.length}`);

  if (cards.length > 0) {
    await cards[0].click();
    await page.waitForTimeout(600);

    const evaluatePage = await page.$(".evaluate-page");
    console.log("Tela evaluate renderizada:", !!evaluatePage);

    const topbar = await page.$(".evaluate-topbar");
    const footer = await page.$(".evaluate-footer");
    const studentCard = await page.$(".evaluate-student-card");
    const weightCard = await page.$(".evaluate-weight-card");
    const feedbackCard = await page.$(".evaluate-feedback-card");
    const chips = await page.$$(".evaluate-chip");
    const stars = await page.$$(".evaluate-star");

    console.log("Topbar:", !!topbar);
    console.log("Footer:", !!footer);
    console.log("Cartão aluno:", !!studentCard);
    console.log("Cartão peso:", !!weightCard);
    console.log("Cartão feedback:", !!feedbackCard);
    console.log("Chips:", chips.length);
    console.log("Estrelas:", stars.length);

    await page.screenshot({ path: ".tmp/evaluate-screen.png", fullPage: true });
    console.log("Screenshot salvo");

    // Testar chip de sugestão
    if (chips.length > 0) {
      await chips[0].click();
      const val = await page.$eval("#evaluateCommentArea", el => el.value).catch(() => "n/a");
      console.log("Textarea após chip:", val.substring(0, 60));
    }

    // Testar estrelas (3 estrelas)
    if (stars.length >= 3) {
      await stars[2].click();
      const rating = await page.$eval("#evaluateRatingInput", el => el.value).catch(() => "n/a");
      console.log("Rating após clique:", rating);
    }

    // Testar voltar
    const backBtn = await page.$("[data-back-to-updates]");
    if (backBtn) {
      await backBtn.click();
      await page.waitForTimeout(400);
      const backToUpdates = await page.$(".update-card-list, .updates-page");
      console.log("Voltou para lista de atualizações:", !!backToUpdates);
    }
  } else {
    // Forçar navigate com dummy state via JS
    console.log("Nenhum card - testando navegação direta via JS");
    await page.evaluate(() => {
      // Verificar se há alguma update no estado
      const updatesInState = document.querySelectorAll("[data-open-update-comment]");
      console.log("Botões open-update-comment:", updatesInState.length);
    });
    const pageContent = await page.$eval("#managerContent", el => el.innerHTML.substring(0, 200));
    console.log("Conteúdo manager:", pageContent);
  }

  await browser.close();
  console.log("Teste concluído");
})();
