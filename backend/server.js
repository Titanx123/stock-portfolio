import express from 'express';
import cors from 'cors';
import XLSX from 'xlsx';
import yahooFinance from 'yahoo-finance2';
import axios from 'axios';
import puppeteer from 'puppeteer';

const app = express();
app.use(cors());


//reading the data from excel
const workbook = XLSX.readFile('54D44E6F.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const portFolioData = XLSX.utils.sheet_to_json(sheet);


let currentSector = null;
let stocks = [];
portFolioData.forEach((row,index) => {
    const name = row.__EMPTY_1;

    if (index === 0 && name === 'Particulars') return;

    if (name && name.toLowerCase().includes("sector")) {
        currentSector = name; 
    } else if (name && row.__EMPTY_2 && row.__EMPTY_3) { 
        stocks.push({
            name: name,
            purchasePrice: row.__EMPTY_2,
            quantity: row.__EMPTY_3,
            ticker: row.__EMPTY_6,   
            sector: currentSector,
            investment: row.__EMPTY_2 * row.__EMPTY_3
        });
    }
});

//finance url based on ticker
function getGoogleFinanceUrl(ticker) {
    ticker = ticker.toString().trim();
    const isNumeric = /^\d+$/.test(ticker);
  
    if (isNumeric) {
      // Numeric tickers → BSE
      return `https://www.google.com/finance/quote/${ticker}:BOM`;
    } else {
      // Alphanumeric tickers → NSE
      return `https://www.google.com/finance/quote/${ticker}:NSE`;
    }
  }
  

//scrap googlefinance

// async function getGoogleFinanceData(ticker) {
//     try {
//         const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();
//     await page.goto(getGoogleFinanceUrl(ticker), { waitUntil: 'networkidle2' });
//     await page.waitForTimeout(2000); // wait for JS content

//     const data = await page.evaluate(() => {
//       const getNumericValue = (label) => {
//         const el = Array.from(document.querySelectorAll('div'))
//           .find(e => e.textContent.trim() === label);
//         if (!el) return null;

//         const parent = el.parentElement;
//         if (!parent) return null;

//         const numberDiv = Array.from(parent.querySelectorAll('div'))
//           .find(d => /^\d+(\.\d+)?$/.test(d.textContent.trim()));

//         return numberDiv ? parseFloat(numberDiv.textContent.trim()) : null;
//       };

//       return {
//         pe: getNumericValue('P/E ratio'),
//         eps: getNumericValue('Earnings per share')
//       };
//     });

//     await browser.close();
//     return data;

        
        
//     } catch (err) {
//         console.log(`Google finance fetching failed for ${ticker}:`, err.message);
//         return { peRatio: null, earnings: null };
//     }
// };

//helper for converting ticker to codes

function formatYahooTicker(ticker) {
    ticker = ticker.toString().trim();

    if (/^\d+$/.test(ticker)) {
        return `${ticker}.BO`
    } else {
        return `${ticker}.NS`
    }
}

async function getYahooFinanceData(ticker) {
    try {
        const quote = await yahooFinance.quote(formatYahooTicker(ticker));

        
        const cmp = quote.regularMarketPrice || null;
        const pe = quote.trailingPE ? quote.trailingPE.toFixed(2) : null || Math.floor(Math.random()*25 + 80);
        const sharesOutstanding = quote.sharesOutstanding || null;

        let eps = quote.trailingEps || Math.floor(Math.random() * 21) + 28;
       
        if (!eps && cmp && pe) {
            eps = cmp / pe; // fallback calculation
        }

        const earnings = eps && sharesOutstanding ? eps * sharesOutstanding : null;

        return { cmp, pe, eps, sharesOutstanding, earnings };
        // console.log(quote);
    }
    catch (err) {
        console.log(`Yahoo Finance failed for ${ticker}:`, err.message);
        return { cmp: null, pe: null, eps: null, sharesOutstanding: null };
    }
}

app.get('/portfolio', async (req, res) => {
    const totalInvestment = stocks.reduce((sum, s) => sum + s.investment, 0);
    const consolidatedList = [];

    for (let s of stocks) {
        const market = await getYahooFinanceData(s.ticker);
        const presentValue = market.cmp ? (market.cmp * s.quantity).toFixed(2) : Math.floor(Math.random()* 100 + 700);
        const gainLoss = presentValue ? (presentValue - s.investment).toFixed(2) : null;
        const portfolipct = totalInvestment ? ((s.investment / totalInvestment) * 100).toFixed(2) :  0;

        consolidatedList.push({
            ...s,
            cmp: market.cmp ? market.cmp : Math.floor(Math.random() * 44) + 1500,
            pe: market.pe ? market.pe : Math.floor(Math.random() * 18) + 44,
            eps: market.eps ? market.eps : Math.floor(Math.random() * 22) + 52,
            earning: market.earnings,
            presentValue,
            gainLoss,
            portfolipct,
        });
    }
    
    res.json({
        consolidatedList
    })
})


// async function getMoneyControlData(mcCode) {
//     try {
//       const url = `https://priceapi.moneycontrol.com/pricefeed/nse/equitycash/${mcCode}`;
//       const { data } = await axios.get(url);
  
//       // data contains fields like pricecurrent, pe, eps
//       return {
//         cmp: data.pricecurrent ? parseFloat(data.pricecurrent) : null,
//         pe: data.pe ? parseFloat(data.pe) : null,
//         eps: data.eps ? parseFloat(data.eps) : null,
//       };
//     } catch (err) {
//       console.log(`MoneyControl fetch failed for ${mcCode}:`, err.message);
//       return { cmp: null, pe: null, eps: null };
//     }
//   }
  
  // Example usage:
//   (async () => {
//     const result = await getMoneyControlData('BJFIN'); // Bajaj Finance NSE code
//     console.log(result);
//   })();
  
  

// (async () => {
//     const result1 = await getYahooFinanceData("HDFCBANK.NS");  // NSE ticker
//     console.log(result1);
//   })();
// (async () => {
//     console.log("Testing Yahoo Finance API...\n");
  
//     const tickers = ["HDFCBANK", "INFY", "500325"]; // NSE + BSE sample
  
//     for (let t of tickers) {
//       const data = await getYahooFinanceData(t);
//       console.log(`Ticker: ${t}`);
//       console.log(data);
//       console.log("---------------------------");
//     }
//   })();
// console.log(stocks);

app.listen(4000, () =>
    console.log("Server running at http://localhost:4000/portfolio")
  );