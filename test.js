let baseURL= "https://www.bruneau.fr/catalog/papier-arts-graphiques/5625016o-jmbpr"
const NBpages=0;
const pagesToScrape = [
  baseURL
];
if (NBpages != 0){
  
  for (let index = 2; index < NBpages+1; index++) {
      
      pagesToScrape.push(baseURL+"?page="+index)
  }
}
console.log(pagesToScrape)