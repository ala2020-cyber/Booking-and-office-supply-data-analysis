const puppeteer = require("puppeteer");
const ExcelJS = require("exceljs");
const fs = require("fs");

const nb_adults=2;
const nb_rooms=1;
const nb_childrens=0
const checkout_date="2024-10-02";
const checkin_date="2024-10-01";
const city="Paris";

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  
  let baseURL= 
  "https://www.booking.com/searchresults.fr.html?ss=%C3%8Ele-de-France&ssne=%C3%8Ele-de-France&ssne_untouched=%C3%8Ele-de-France&efdco=1&label=gog235jc-1DCAEiBWhvdGVsKIICOOgHSA1YA2hNiAEBmAENuAEXyAEM2AED6AEB-AECiAIBqAIDuAKSife2BsACAdICJDA1NmFjNjFkLWIzZWQtNDRhYy1hYzI4LTYzODQ5OGEwYTUxZNgCBOACAQ&sid=bba467c35784002004767b2679ec1d6d&aid=397594&lang=fr&src=searchresults&dest_id=-1456928&dest_type=city&checkin=2024-10-01&checkout=2024-10-02&group_adults=2&no_rooms=1&auth_success=1"

  // const NBpages=1;
  const pagesToScrape = [
    baseURL
  ];
  // if (NBpages > 1){
    
  //   for (let index = 2; index < NBpages+1; index++) {
        
  //       pagesToScrape.push(baseURL+"?page="+index)
  //   }
  // }

  let AllPapierA4 = [];
  for (const pageUrl of pagesToScrape) {
    const page = await browser.newPage();
    await page.goto(pageUrl, { waitUntil: "networkidle2" });

    // Scroll to the bottom of the page to trigger lazy loading
    await autoScroll(page);

    // Wait for a specific selector to ensure elements are loaded
    await page.waitForSelector('[data-testid="property-card"]');

    const papierA4 = await page.evaluate(({ nb_adults, city, nb_childrens, nb_rooms, checkin_date, checkout_date }) => {
      let products = [];
      let elems = document.querySelectorAll('[data-testid="property-card"]');

      for (let elem of elems) {
        // Use optional chaining to safely access properties

        const url_image = elem.querySelector('[data-testid="property-card-desktop-single-image"] img')?.src || "N/A";
        const Nom_hebergement = elem.querySelector('[data-testid="title"]')?.textContent.trim() || "N/A";
        const address = elem.querySelector('[data-testid="address"]')?.textContent.trim() || "N/A";
        const distance_centre = elem.querySelector('[data-testid="distance"]')?.textContent.trim() || "N/A";
        const review_score = elem.querySelector('[data-testid="review-score"] > div > div ')?.textContent.match(/(\d+,\d+)/)?.[0]  || "N/A";
        const NB_experience =elem.querySelector('[data-testid="review-score"] > div:nth-child(2)')?.textContent.match(/(\d[\d\s]*)/)?.[0].replace(/\s/g, '') || "N/A";



    // extracting description
      const container = elem.querySelector('[data-testid="availability-single"]');

      // Extract the room name
      const roomName = container.querySelector('h4[role="link"]')?.textContent.trim();

      // Extract the bed type 
      const bedType = container.querySelector('ul > li:first-child div div')?.textContent.trim();

      // Extract the availability information 
      const availabilityInfo = container.querySelector('ul > li:nth-child(2) div div')?.textContent.trim();

      // Combine the extracted data into a single string, separated by commas
      const description = `${roomName}, ${bedType}, ${availabilityInfo}`;
    
    // extracting number of nigths
      const checkin = new Date(checkin_date);
      const checkout = new Date(checkout_date);

      // Calculate the difference in milliseconds
      const differenceInTime = checkout.getTime() - checkin.getTime();

      // Convert milliseconds to days
      const nb_nights = differenceInTime / (1000 * 3600 * 24);

    
      const discountedPriceElement = elem.querySelector('[data-testid="price-and-discounted-price"]');

      // Get the element containing the original price
      const originalPriceElement = elem.querySelector('[aria-hidden="true"] span:not([data-testid])');

      // Extract the text content and remove any non-numeric characters (e.g., €)
      const discounted_Price = discountedPriceElement ? discountedPriceElement.textContent.trim().replace('€', '').trim() : null;
      const original_Price = originalPriceElement ? originalPriceElement.textContent.trim().replace('€', '').trim() : null;



     
      // extracting the reviews
      const review = elem.querySelector('[data-testid="review-score"] :nth-child(2) :nth-child(1)')?.textContent.trim() || "N/A";


        products.push({
          url_image,
          Nom_hebergement,
          city,
          address,
          distance_centre,
          review_score,
          review,
          NB_experience,
          description,
          roomName,
          bedType,
          availabilityInfo,
          nb_nights,
          nb_adults,
          nb_childrens,
          nb_rooms,
          original_Price,
          discounted_Price,
          checkin_date,
          checkout_date
        });
      }
      return products;
    }
    ,
    { nb_adults, city, nb_childrens, nb_rooms, checkin_date, checkout_date } // Pass variables here
  
  );

    AllPapierA4 = AllPapierA4.concat(papierA4);
    console.log(AllPapierA4);
    await page.close();
  }

    const fileName = "booking.xlsx";

    // Créer un nouveau classeur Excel
    const workbook = new ExcelJS.Workbook();
    if (fs.existsSync(fileName)) {
      await workbook.xlsx.readFile(fileName);
    }
    const worksheet = workbook.addWorksheet(city+"_prices");

    // Ajouter des en-têtes de colonne
    worksheet.columns = [
      { header: "Nom_hebergement", key: "Nom_hebergement", width: 30 },
      { header: "url_image", key: "url_image", width: 50 },
      { header: "city", key: "city", width: 15 },
      { header: "address", key: "address", width: 15 },
      { header: "distance_centre", key: "distance_centre", width: 15 },
      { header: "review_score", key: "review_score", width: 15 },
      { header: "review", key: "review", width: 15 },
      { header: "NB_experience", key: "NB_experience", width: 15 },
      { header: "description", key: "description", width: 15 },
      { header: "roomName", key: "roomName", width: 15 },
      { header: "bedType", key: "bedType", width: 15 },
      { header: "availabilityInfo", key: "availabilityInfo", width: 15 },
      { header: "nb_nights", key: "nb_nights", width: 15 },
      { header: "nb_adults", key: "nb_adults", width: 15 },
      { header: "nb_childrens", key: "nb_childrens", width: 15 },
      { header: "nb_rooms", key: "nb_rooms", width: 15 },
      { header: "original_Price", key: "original_Price", width: 15 },
      { header: "discounted_Price", key: "discounted_Price", width: 15 },
      { header: "checkin_date", key: "checkin_date", width: 15 },
      { header: "checkout_date", key: "checkout_date", width: 15 },
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
