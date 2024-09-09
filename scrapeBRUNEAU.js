const puppeteer = require("puppeteer");
const ExcelJS = require("exceljs");
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({ headless: false });

  let baseURL= "https://www.bruneau.fr/catalog/craies/10462874o-jmbpr"
  const NBpages=1;
  const pagesToScrape = [
    baseURL
  ];
  if (NBpages > 1){
    
    for (let index = 2; index < NBpages+1; index++) {
        
        pagesToScrape.push(baseURL+"?page="+index)
    }
  }

  let AllPapierA4 = [];
  for (const pageUrl of pagesToScrape) {
    const page = await browser.newPage();
    await page.goto(pageUrl, { waitUntil: "networkidle2" });

    // Scroll to the bottom of the page to trigger lazy loading
    await autoScroll(page);

    // Wait for a specific selector to ensure elements are loaded
    await page.waitForSelector(".isg-product-list-item");

    const papierA4 = await page.evaluate(() => {
      let products = [];
      let elems = document.querySelectorAll(".isg-product-list-item");

      for (let elem of elems) {
        // Use optional chaining to safely access properties

        const img = elem.querySelector(".isg-image-picture img")?.src || "N/A";
        const reference =   
          elem.getAttribute("data-id").split("-")[1];
        const nomProduct =
          elem
          .querySelector('.isg-catalog-product-title')?.textContent.trim() ||
          "N/A";
        const PrixHT =
          elem.querySelector(".isg-price-value span")?.textContent.trim() ||
          "N/A";

        products.push({
          img,
          reference,
          nomProduct,
          PrixHT,
        });
      }
      return products;
    });

    AllPapierA4 = AllPapierA4.concat(papierA4);
    console.log(AllPapierA4);
    await page.close();
  }

    const fileName = "ecriture_BRUNEAU.xlsx";

    // Créer un nouveau classeur Excel
    const workbook = new ExcelJS.Workbook();
    if (fs.existsSync(fileName)) {
      await workbook.xlsx.readFile(fileName);
    }
    const worksheet = workbook.addWorksheet("craies");

    // Ajouter des en-têtes de colonne
    worksheet.columns = [
      { header: "Image", key: "img", width: 50 },
      { header: "Référence", key: "reference", width: 20 },
      { header: "Nom du produit", key: "nomProduct", width: 30 },
      { header: "Prix HT", key: "PrixHT", width: 15 },
    ];

    // Ajouter les données à la feuille de calcul
    AllPapierA4.forEach((product) => {
      worksheet.addRow(product);
    });

    // Enregistrer le classeur Excel
    await workbook.xlsx.writeFile(fileName);
    console.log(
      ">>Les données ont été sauvegardées dans le fichier Excel " + fileName + "."
    );
    await browser.close();
})();

// Function to scroll to the bottom of the page
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}
