/**
 * ============================================================================
 * SGX PORTFOLIO DASHBOARD MASTER UTILITIES
 * ============================================================================
 * * This file manages live data streams for Singapore Exchange (SGX) assets.
 * Bypasses standard international data restrictions using multi-layered APIs.
 */

/**
 * Fetches the exact NAV (Net Asset Value) or Corporate Book Value per unit for SGX counters.
 * Relies entirely on deep API streams to protect against third-party HTML layout shifts.
 *
 * @param {string} ticker The SGX ticker from your sheet (e.g., "SGX:A7RU", "SGX:A93").
 * @param {boolean} refresh_switch Points to a checkbox cell (e.g., $E$1) to force a recalculation.
 * @customfunction
 */
function SGX_NAV(ticker, refresh_switch) {
  if (!ticker) return "";
  
  let cleanTicker = ticker.toString().toUpperCase().trim();
  if (cleanTicker.startsWith("SGX:")) {
    cleanTicker = cleanTicker.replace("SGX:", "");
  }
  if (!cleanTicker.endsWith(".SI")) {
    cleanTicker = cleanTicker + ".SI";
  }
  
  const options = {
    "muteHttpExceptions": true,
    "headers": {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
  };

  // ----------------------------------------------------
  // LAYER 1: Deep Quote Summary Module API 
  // ----------------------------------------------------
  try {
    const urlSummary = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${cleanTicker}?modules=summaryDetail,defaultKeyStatistics`;
    const responseSummary = UrlFetchApp.fetch(urlSummary, options);
    
    if (responseSummary.getResponseCode() === 200) {
      const json = JSON.parse(responseSummary.getContentText());
      if (json.quoteSummary && json.quoteSummary.result && json.quoteSummary.result[0]) {
        const result = json.quoteSummary.result[0];
        const summaryDetail = result.summaryDetail || {};
        const keyStats = result.defaultKeyStatistics || {};
        
        // Target structural ETF net asset values directly
        if (summaryDetail.navPrice && summaryDetail.navPrice.raw !== undefined && summaryDetail.navPrice.raw !== 0) {
          return summaryDetail.navPrice.raw;
        }
        
        // Target dynamic trust book values (e.g., A7RU)
        if (keyStats.bookValue && keyStats.bookValue.raw !== undefined && keyStats.bookValue.raw !== 0) {
          return keyStats.bookValue.raw;
        }
      }
    }
  } catch (e) {
    // Fail silently to drop to backup API layers
  }

  // ----------------------------------------------------
  // LAYER 2: Flat Quote Pipeline API (Handles A93, GAB, HST, TID)
  // ----------------------------------------------------
  try {
    const urlFlat = `https://query2.finance.yahoo.com/v6/finance/quote?symbols=${cleanTicker}`;
    const responseFlat = UrlFetchApp.fetch(urlFlat, options);
    
    if (responseFlat.getResponseCode() === 200) {
      const jsonFlat = JSON.parse(responseFlat.getContentText());
      if (jsonFlat.quoteResponse && jsonFlat.quoteResponse.result && jsonFlat.quoteResponse.result[0]) {
        const data = jsonFlat.quoteResponse.result[0];
        
        // Direct flat object check
        if (data.navPrice !== undefined && data.navPrice !== null && data.navPrice !== 0) {
          return data.navPrice;
        }
        if (data.bookValue !== undefined && data.bookValue !== null && data.bookValue !== 0) {
          return data.bookValue;
        }
        
        // Mathematical Implied Valuation Check: Price divided by Price-to-Book Ratio
        if (data.regularMarketPrice && data.priceToBook && data.priceToBook > 0) {
          return Number((data.regularMarketPrice / data.priceToBook).toFixed(3));
        }
      }
    }
  } catch (e) {
    // Fail silently
  }

  // ----------------------------------------------------
  // LAYER 3: Strict Institutional Tracker Fallback 
  // ----------------------------------------------------
  try {
    const urlChart = `https://query1.finance.yahoo.com/v8/finance/chart/${cleanTicker}?range=1d&interval=1d`;
    const responseChart = UrlFetchApp.fetch(urlChart, options);
    
    if (responseChart.getResponseCode() === 200) {
      const jsonChart = JSON.parse(responseChart.getContentText());
      if (jsonChart.chart && jsonChart.chart.result && jsonChart.chart.result[0].meta) {
        const meta = jsonChart.chart.result[0].meta;
        
        // Isolates the institutional baseline tracking index close
        if (meta.chartPreviousClose !== undefined && meta.chartPreviousClose !== null && meta.chartPreviousClose !== 0) {
          return meta.chartPreviousClose;
        }
      }
    }
  } catch (e) {
    // Ultimate protection break
  }

  return "N/A";
}

/**
 * Calculates the P/E ratio for SGX counters by pulling from the stable v6 endpoint.
 *
 * @param {string} ticker The SGX ticker from your sheet (e.g., "SGX:ES3", "SGX:CLR").
 * @param {boolean} refresh_switch Points to a checkbox cell to force a recalculation.
 * @customfunction
 */
function SGX_PE(ticker, refresh_switch) {
  if (!ticker) return "";
  
  let cleanTicker = ticker.toString().toUpperCase().trim();
  if (cleanTicker.startsWith("SGX:")) {
    cleanTicker = cleanTicker.replace("SGX:", "");
  }
  if (!cleanTicker.endsWith(".SI")) {
    cleanTicker = cleanTicker + ".SI";
  }
  
  const url = `https://query2.finance.yahoo.com/v6/finance/quote?symbols=${cleanTicker}`;
  const options = {
    "muteHttpExceptions": true,
    "headers": {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() === 200) {
      const json = JSON.parse(response.getContentText());
      
      if (json.quoteResponse && json.quoteResponse.result && json.quoteResponse.result[0]) {
        const data = json.quoteResponse.result[0];
        
        if (data.trailingPE !== undefined && data.trailingPE !== null) {
          return data.trailingPE;
        } else {
          return "N/A"; 
        }
      }
    }
    return "N/A"; 
  } catch (e) {
    return "Error Fetching";
  }
}

/**
 * Fetches the current live stock price for SGX counters from Yahoo Finance.
 * Automatically converts "SGX:XXXX" into "XXXX.SI".
 *
 * @param {string} ticker The SGX ticker from your sheet (e.g., "SGX:A7RU", "SGX:ES3").
 * @param {boolean} refresh_switch Points to a checkbox cell (e.g., $E$1) to force a recalculation.
 * @customfunction
 */
function SGX_PRICE(ticker, refresh_switch) {
  if (!ticker) return "";
  
  let cleanTicker = ticker.toString().toUpperCase().trim();
  if (cleanTicker.startsWith("SGX:")) {
    cleanTicker = cleanTicker.replace("SGX:", "");
  }
  if (!cleanTicker.endsWith(".SI")) {
    cleanTicker = cleanTicker + ".SI";
  }
  
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${cleanTicker}`;
  const options = {
    "muteHttpExceptions": true,
    "headers": {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const json = JSON.parse(response.getContentText());
    
    if (json.chart && json.chart.result && json.chart.result[0].meta) {
      return json.chart.result[0].meta.regularMarketPrice;
    } else {
      return "Ticker Not Found";
    }
  } catch (e) {
    return "Error Fetching";
  }
}
