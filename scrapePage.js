// const puppeteer = require("puppeteer");

// (async () => {
//   const browser = await puppeteer.launch({ headless: false });
//   const page = await browser.newPage();
//   await page.goto("https://www.jpg.fr/papier-a4_C011508.html");
//   const papierA4 = await page.evaluate(() => {
//     let papiersA4 = [];
//     let elems = document.querySelectorAll(".Card-wrapper");
//     for (let elem of elems) {
//       papiersA4.push({
//         img: elem.querySelector(".Product-picture").src,
//         reference: elem.querySelector(".Product-sku.x-large").textContent,
//         nomPapier: elem.querySelector(".Product-sku.x-large + span")
//           .textContent,
//         PrixHT: elem.querySelector(".js-current-price  span span").textContent,
//       });
//     }
//     return papiersA4;
//   });
//   console.log(papierA4);
//   await browser.close();
// })();



// const puppeteer = require("puppeteer");
// const ExcelJS = require("exceljs");

// // Récupérer les arguments de la ligne de commande (les URLs)
// const args = process.argv.slice(2);

// (async () => {
//   const browser = await puppeteer.launch({ headless: false });

//   let AllPapierA4 = [];
//   for (const pageUrl of args) {
//     const page = await browser.newPage();
//     await page.goto(pageUrl);
//     const papierA4 = await page.evaluate(() => {
//       let papiersA4 = [];
//       let elems = document.querySelectorAll(".Card-wrapper");
//       for (let elem of elems) {
//         papiersA4.push({
//           img: elem.querySelector(".Product-picture").src,
//           reference: elem.querySelector(".Product-sku.x-large").textContent,
//           nomPapier: elem.querySelector(".Product-sku.x-large + span")
//             .textContent,
//           PrixHT: elem.querySelector(".js-current-price span span").textContent,
//         });
//       }
//       return papiersA4;
//     });
//     AllPapierA4 = AllPapierA4.concat(papierA4);
//     await page.close();
//   }

//   // Créer un nouveau classeur Excel
//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet("Papier A4");

//   // Ajouter des en-têtes de colonne
//   worksheet.columns = [
//     { header: "Image", key: "img", width: 50 },
//     { header: "Référence", key: "reference", width: 20 },
//     { header: "Nom du papier", key: "nomPapier", width: 30 },
//     { header: "Prix HT", key: "PrixHT", width: 15 },
//   ];

//   // Ajouter les données à la feuille de calcul
//   AllPapierA4.forEach((papier) => {
//     worksheet.addRow(papier);
//   });

//   // Enregistrer le classeur Excel
//   await workbook.xlsx.writeFile("papiers_a4.xlsx");
//   console.log("Les données ont été sauvegardées dans le fichier Excel.");
//   // await browser.close();
// })();
