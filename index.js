const puppeteer = require("puppeteer");
const fs = require("fs/promises");
const writeXlsxFile = require("write-excel-file/node");

async function scrawl() {
  // Tạo trình duyệt
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto("http://online.gov.vn/WebDetails");

  const rows = [];
  // page
  let p = 1;
  const maxPage = 100;
  // Vòng lặp đi qua từng trang
  do {
    // Lấy số trang hện tại
    const active = await page.$eval(
      "#boxResultCOntent > div > div > ul > li.pager__item.active > a",
      (el) => el.textContent
    );

    // Lấy dữ liệu trong bảng
    const newData = await page.$$eval("#tableWeb > tbody > tr", (els) =>
      Array.from(els).map((row) => ({
        domainName: row.querySelector("td:nth-child(2)").textContent,
        companyName: row.querySelector("td:nth-child(3)").textContent,
        link: row.querySelector("td:nth-child(4) > a").href,
      }))
    );

    // Thêm trang hiện tại 
    const newRow = newData.map(item => ({...item, page: active}))

    rows.push(...newRow);

    console.log({ active });

    // Danh sách btn chuyển trang
    const listBtn = await page.$$eval(
      "#boxResultCOntent > div > div > ul > li.pager__item > a",
      (els) => {
        return Array.from(els).map((el) => el.textContent);
      }
    );

    // Lấy btn trang tiếp theo
    const index = listBtn.findIndex((item) => Number(item) === p + 2);

    // Click vào trang tiếp theo
    await Promise.all([
      page.click(
        `#boxResultCOntent > div > div > ul > li.pager__item:nth-child(${index}) > a`
      ), // Clicking the link will indirectly cause a navigation
      new Promise(r => setTimeout(r, 5000))
    ]);

    p++;
  } while (p < maxPage);

  // Dữ lệu nhập vào excel
  const data = [
    [
      {
        value: "Page",
        fontWeight: "bold",
      },
      {
        value: "Company name",
        fontWeight: "bold",
      },
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
        value: "Link detail",
        fontWeight: "bold",
      },
    ],
  ];

  // Lặp qua các dòng lấy được 
  for (let row of rows) {
    // Mở trang mới
    const newPage = await browser.newPage();

    // Đi tời trang chi tiết
    await newPage.goto(row.link);

    // Lấy địa chỉ
    const address = await newPage.$eval(
      "#containerBOX > div.col-sm-8 > div.row > div > div.row.boxDetailDataDisplay > div:nth-child(6) > div:nth-child(2)",
      (el) => el.textContent
    );

    // Lấy mã số thuế
    const taxNumber = await newPage.$eval(
      "#containerBOX > div.col-sm-8 > div.row > div > div.row.boxDetailDataDisplay > div:nth-child(5) > div:nth-child(2)",
      (el) => el.textContent
    );

    // xử lý dữ liệu thừa
    const newAddress = address.replace("\n", "").trim();
    const newTaxNumber = taxNumber.replace("\n", "").trim();

    const dataRow = [
      // "page"
      {
        type: String,
        value: row.page,
      },
      // "company name"
      {
        type: String,
        value: row.companyName,
      },
      // "domain name"
      {
        type: String,
        value: row.domainName,
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
      // "link"
      {
        type: String,
        value: row.link,
      },
    ];

    // Thêm dòng vừa lấy được vào dữ liệu excel
    data.push(dataRow);
  }

  // Ghi dữ li ệu vào file website.xlsx
  await writeXlsxFile(data, {
    filePath: "./website.xlsx",
  });

  // Đóng trình duyệt
  await browser.close();
}

scrawl();
