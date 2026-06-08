const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on("pageerror", err => console.error("[page error]", err.message));

  await page.goto("http://localhost:3000/");
  await page.waitForTimeout(1200);
  await page.fill("#email", "admin@personalpro.app");
  await page.fill("#password", "Admin@2026");
  await page.click("#loginForm button[type=submit]");
  await page.waitForSelector("#managerView:not([hidden])", { timeout: 5000 });
  await page.waitForTimeout(600);

  // Navegar para Atualizações
  const updatesBtn = await page.$("[data-manager-nav='updates']");
  if (updatesBtn) await updatesBtn.click();
  await page.waitForTimeout(600);

  // Encontrar um update com status "sent" (botão com texto "Avaliar")
  const allCards = await page.$$(".update-primary-action");
  console.log(`Total de cards: ${allCards.length}`);

  let sentCard = null;
  for (const card of allCards) {
    const text = await card.innerText();
    console.log("Card texto:", text.trim());
    if (text.trim().includes("Avaliar")) {
      sentCard = card;
      break;
    }
  }

  if (!sentCard && allCards.length > 0) {
    console.log("Nenhum 'Avaliar' encontrado, tentando segundo card");
    sentCard = allCards[1] || allCards[0];
  }

  if (sentCard) {
    await sentCard.click();
    await page.waitForTimeout(600);

    const evaluatePage = await page.$(".evaluate-page");
    console.log("Tela evaluate:", !!evaluatePage);

    const weightCard = await page.$(".evaluate-weight-card");
    const feedbackCard = await page.$(".evaluate-feedback-card");
    const footer = await page.$(".evaluate-footer");
    const chips = await page.$$(".evaluate-chip");
    const stars = await page.$$(".evaluate-star");
    const photosWrap = await page.$(".evaluate-photos-wrap");

    console.log("Cartão peso:", !!weightCard);
    console.log("Cartão feedback:", !!feedbackCard);
    console.log("Footer:", !!footer);
    console.log("Chips:", chips.length);
    console.log("Estrelas:", stars.length);
    console.log("Fotos:", !!photosWrap);

    await page.screenshot({ path: ".tmp/evaluate-sent.png", fullPage: true });
    console.log("Screenshot salvo: .tmp/evaluate-sent.png");

    // Testar chip
    if (chips.length > 0) {
      await chips[0].click();
      const val = await page.$eval("#evaluateCommentArea", el => el.value).catch(() => "n/a");
      console.log("Chip inserido no textarea:", val.substring(0, 70));
    }

    // Testar estrelas
    if (stars.length >= 4) {
      await stars[3].click();
      const rating = await page.$eval("#evaluateRatingInput", el => el.value).catch(() => "n/a");
      const activeCount = await page.$$eval(".evaluate-star.is-active", els => els.length);
      console.log("Rating valor:", rating, "Estrelas ativas:", activeCount);
    }

    // Testar salvar
    const saveBtn = await page.$("[data-save-evaluation]");
    if (saveBtn) {
      await saveBtn.click();
      await page.waitForTimeout(500);
      const backOnList = await page.$(".updates-page");
      const toast = await page.$(".toast");
      console.log("Voltou para lista:", !!backOnList);
      console.log("Toast visível:", !!toast);
    }
  } else {
    console.log("Nenhum card encontrado");
  }

  await browser.close();
  console.log("Teste concluído");
})();
