const puppeteer = require("puppeteer");
const ExcelJS = require("exceljs");
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({ headless: false });

  const pagesToScrape = [
    "https://www.jpg.fr/taille-crayons_C010704.html",
    // "https://www.jpg.fr/taille-crayons_C010704.html?page=2",
    // "https://www.jpg.fr/taille-crayons_C010704.html?page=3",
    // "https://www.jpg.fr/taille-crayons_C010704.html?page=4",
    // "https://www.jpg.fr/taille-crayons_C010704.html?page=5",
    // "https://www.jpg.fr/taille-crayons_C010704.html?page=6",
    // "https://www.jpg.fr/taille-crayons_C010704.html?page=7",
    // "https://www.jpg.fr/taille-crayons_C010704.html?page=8",
 

  ];
  
  let AllPapierA4 = [];
  for (const pageUrl of pagesToScrape) {
    const page = await browser.newPage();
    await page.goto(pageUrl, { waitUntil: 'networkidle2' });

    // Scroll to the bottom of the page to trigger lazy loading
    await autoScroll(page);

    // Wait for a specific selector to ensure elements are loaded
    await page.waitForSelector(".Card-wrapper");

    const papierA4 = await page.evaluate(() => {
      let papiersA4 = [];
      let elems = document.querySelectorAll(".Card-wrapper");
      for (let elem of elems) {
        // Use optional chaining to safely access properties
        const img = elem.querySelector(".Product-picture")?.src || "N/A";
        const reference = elem.querySelector(".Product-sku.x-large")?.textContent.trim() || "N/A";
        const nomPapier = elem.querySelector(".Product-sku.x-large + span")?.textContent.trim() || "N/A";
        const PrixHT = elem.querySelector(".js-current-price span span")?.textContent.trim() || "N/A";

        papiersA4.push({
          img,
          reference,
          nomPapier,
          PrixHT,
        });
      }
      return papiersA4;
    });

    AllPapierA4 = AllPapierA4.concat(papierA4);
    console.log(AllPapierA4);
    await page.close();
  }

  const fileName= "ecriture_JPG.xlsx";

  // Créer un nouveau classeur Excel
  const workbook = new ExcelJS.Workbook();
    if (fs.existsSync(fileName)) {
    await workbook.xlsx.readFile(fileName);
  }
  const worksheet = workbook.addWorksheet("taille-crayons");

  // Ajouter des en-têtes de colonne
  worksheet.columns = [
    { header: "Image", key: "img", width: 50 },
    { header: "Référence", key: "reference", width: 20 },
    { header: "Nom du papier", key: "nomPapier", width: 30 },
    { header: "Prix HT", key: "PrixHT", width: 15 },
  ];

  // Ajouter les données à la feuille de calcul
  AllPapierA4.forEach((papier) => {
    worksheet.addRow(papier);
  });

  // Enregistrer le classeur Excel
  await workbook.xlsx.writeFile(fileName);
  console.log(">>Les données ont été sauvegardées dans le fichier Excel " + fileName + ".");
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
