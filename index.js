const cheerio = require("cheerio");
const fs =require("fs");
const axios = require('axios'); 
const csv =require('csv-parser');
var http = require('http'); 

//call scrapdata function initially
scrapdata()

//call scrapdata function every 15 min
setInterval(()=>{scrapdata()},900000)

//this function get data from scraping
// and convert data into csv and create
// csv file and add cdv data to file
function scrapdata(){
  //url of hackernews
  axios.get('https://news.ycombinator.com/newest') 
	.then(({ data }) => { 
		const $ = cheerio.load(data); 
 
    //in htmldat we use css selector of element to get data
		const htmldat = ($('#hnmain > tbody > tr:nth-child(3) > td > table > tbody'))
                           
    //we use map function and we takenout the text from element and trim these data
		.map((_, product) => { 
			const $product = $(product); 
			return $product.text().trim()
		}) 
		.toArray();  
      
      //we convert object to csv format
    const getCSV = (object) => {
      let csv =""
      for (const [k,v] of Object.entries(object)) {
        csv += "\r\n" + Object.values(v).join("") 
      }
      return csv;
    }
    let arr=getCSV(htmldat)

    //we use date function to get present
    var today = new Date()

    //we convert present date into a date format and use it in as file name
    var dateformat= today.getDate() + "-" + (today.getMonth()+1) +"-" +today.getFullYear()+".csv"

    // create csv file 
    fs.writeFileSync(dateformat,arr,"utf-8")
    })
}  

// this function give us the csv file data
function GetRequest(api) {
  const filename= api.split('/').reverse()[0];
  const result=[]

  //it read csv file and get data
  fs.createReadStream(filename+".csv")
    .pipe(csv({}))
    .on('data',(data)=>result.push(data))
    .on('end',()=>{

      //it create a server by wwhich we open a window
      //and see our csv data in objject form
      http.createServer(function (req, res) {
  
        // 200 is the status code which means
        // All OK and the second argument is
        // the object of response header.
        res.writeHead(200, {'Content-Type': 'text/html'}); 
          
        // Write a response to the client
          res.write(JSON.stringify(result));
        // End the response
          res.end();
          
          //port on which we see our  csv data
        }).listen(8000);
        console.log("Please open localhost on 8000 port")
    })
  }

  // get api url
  const apicall="/news/17-11-2022"  

  //call GetRequest function 
  setTimeout(()=>{GetRequest(apicall)},4000);  
 
    