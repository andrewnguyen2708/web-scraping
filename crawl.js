const puppeteer = require("puppeteer");
const fs = require("fs/promises");
const cron = require("node-cron");

async function scrawl() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto("http://online.gov.vn/WebDetails");
  // await page.screenshot({ path: "example.png", fullPage: true });

  // await page.pdf({ path: "example.pdf", format: "A4" });
  const data = [];

  let p = 1;
  do {
    const rows = await page.$$eval(
      "#tableWeb > tbody > tr > td:nth-child(2)",
      (els) => Array.from(els).map((el) => el.textContent)
    );

    for (let i = 0; i < rows.length; i++) {
      const newPage = await browser.newPage();
      await newPage.goto("http://online.gov.vn/WebDetails");
      await Promise.all([
        newPage.click(
          `#tableWeb > tbody > tr:nth-child(${i + 1}) > td:nth-child(4) > a`
        ),
        newPage.waitForNavigation(),
      ]);
      const domain = await newPage.$eval(
        "#containerBOX > div.col-sm-8 > div.row > div > div.row.boxDetailDataDisplay > div:nth-child(2) > div:nth-child(2) > p",
        (el) => el.textContent
      );
      const companyName = await newPage.$eval(
        "#containerBOX > div.col-sm-8 > div.row > div > div.row.boxDetailDataDisplay > div:nth-child(5) > div:nth-child(2)",
        (el) => el.textContent
      );
      const taxNumber = await newPage.$eval(
        "#containerBOX > div.col-sm-8 > div.row > div > div.row.boxDetailDataDisplay > div:nth-child(6) > div:nth-child(2)",
        (el) => el.textContent
      );
      data.push({ domain, companyName, taxNumber });
    }

    const listBtn = await page.$$eval(
      "#boxResultCOntent > div > div > ul > li.pager__item > a",
      (els) => {
        return Array.from(els).map((el) => el.textContent);
      }
    );

    const active = await page.$eval(
      "#boxResultCOntent > div > div > ul > li.pager__item.active > a",
      (el) => el.textContent
    );

    const index = listBtn.findIndex((item) => Number(item) === p + 1);

    await page.click(
      `#boxResultCOntent > div > div > ul > li.pager__item:nth-child(3) > a`
    ),
      // await Promise.all([
      //   page.click(
      //     `#boxResultCOntent > div > div > ul > li.pager__item:nth-child(3) > a`
      //   ),
      //   page.waitForResponse(),
      // ]);

      console.log({ active, index });

    p++;
  } while (p < 3);

  const clearData = data.map((item) => {
    const { domain, companyName, taxNumber } = item;
    const newDomain = domain.replace("\n", "").trim();
    const newCompanyName = companyName.replace("\n", "").trim();
    const newTaxNumber = taxNumber.replace("\n", "").trim();

    return {
      domain: newDomain,
      companyName: newCompanyName,
      taxNumber: newTaxNumber,
    };
  });

  console.log({ clearData });

  // const courses
  await browser.close();
}

scrawl();
