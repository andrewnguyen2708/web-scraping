const puppeteer = require("puppeteer");
const fs = require("fs/promises");
const writeXlsxFile = require('write-excel-file/node')

async function scrawl() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto("http://online.gov.vn/WebDetails");
  const rows = [];

  let p = 1;
  do {
    const newData = await page.$$eval(
      "#tableWeb > tbody > tr > td:nth-child(4) > a",
      (els) => Array.from(els).map((el) => el.href)
    );

    rows.push(...newData);

    const active = await page.$eval(
      "#boxResultCOntent > div > div > ul > li.pager__item.active > a",
      (el) => el.textContent
    );

    const listBtn = await page.$$eval(
      "#boxResultCOntent > div > div > ul > li.pager__item > a",
      (els) => {
        return Array.from(els).map((el) => el.textContent);
      }
    );

    const index = listBtn.findIndex((item) => Number(item) === p + 2);

    await Promise.all([
      page.click(
        `#boxResultCOntent > div > div > ul > li.pager__item:nth-child(${index}) > a`
      ), // Clicking the link will indirectly cause a navigation
      page.waitForTimeout(500),
    ]);

    p++;
  } while (p < 10);

  const data = [
    [
      {
        value: "Domain name",
        fontWeight: "bold",
      },
      {
        value: "Tax Number",
        fontWeight: "bold",
      },
      {
        value: "Address",
        fontWeight: "bold",
      },
      {
        value: "Phone",
        fontWeight: "bold",
      },
    ],
  ];

  for (let row of rows) {
    const newPage = await browser.newPage();
    await newPage.goto(row);
    const domain = await newPage.$eval(
      "#containerBOX > div.col-sm-8 > div.row > div > div.row.boxDetailDataDisplay > div:nth-child(2) > div:nth-child(2) > p",
      (el) => el.textContent
    );
    const address = await newPage.$eval(
      "#containerBOX > div.col-sm-8 > div.row > div > div.row.boxDetailDataDisplay > div:nth-child(6) > div:nth-child(2)",
      (el) => el.textContent
    );
    const phone = await newPage.$eval(
      "#containerBOX > div.col-sm-8 > div.row > div > div.row.boxDetailDataDisplay > div:nth-child(9) > div:nth-child(2)",
      (el) => el.textContent
    );
    const taxNumber = await newPage.$eval(
      "#containerBOX > div.col-sm-8 > div.row > div > div.row.boxDetailDataDisplay > div:nth-child(5) > div:nth-child(2)",
      (el) => el.textContent
    );
    const newDomain = domain.replace("\n", "").trim();
    const newAddress = address.replace("\n", "").trim();
    const newPhone = phone.replace("\n", "").trim();
    const newTaxNumber = taxNumber.replace("\n", "").trim();
    const dataRow = [
      
      // "domain name"
      {
        type: String,
        value: newDomain,
      },
      
      // "tax number"
      {
        type: String,
        value: newTaxNumber,
      },
      // "Address"
      {
        type: String,
        value: newAddress,
      },
      // "Phone"
      {
        type: String,
        value: newPhone,
      },
    ];
    data.push(dataRow);
  }

  await writeXlsxFile(data, {
    // columns, // (optional) column widths, etc.
    filePath: './website.xlsx'
  })
  console.log({ data });

  // const courses
  await browser.close();
}

scrawl();
