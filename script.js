const tickerInput = document.getElementById('ticker-input');
const tickerList = document.getElementById('ticker-list');

// Read in the ticker data from the CSV file
fetch('https://raw.githubusercontent.com/AndreasBoscariol/AutomatedDCF/main/ticker.csv')
  .then(response => response.text())
  .then(text => {
    // Split the CSV text into an array of rows
    const rows = text.split('\n');

    // Extract the ticker data from the rows
    const tickerData = rows.map(row => row.split(',')[0]);

    // Listen for keyup events on the ticker input field
    tickerInput.addEventListener('keyup', function() {
      // Get the user's input
      const input = tickerInput.value;

      // Filter the ticker data based on the user's input
      const filteredData = tickerData.filter(function(ticker) {
        return ticker.toLowerCase().startsWith(input.toLowerCase());
      });

      // Clear the ticker list
      tickerList.innerHTML = '';

      // If there are no matching tickers, hide the ticker list
      if (filteredData.length === 0) {
        tickerList.style.display = 'none';
        return;
      }

      // Otherwise, show the ticker list and populate it with the first 4 matching tickers
      tickerList.style.display = 'block';
      for (let i = 0; i < 4 && i < filteredData.length; i++) {
        const li = document.createElement('li');
        li.innerHTML = filteredData[i];
        tickerList.appendChild(li);
      }
    });
  });


// Listen for click events on the list items
tickerList.addEventListener('click', function(event) {
  // Check if the clicked element is a list item
  if (event.target.tagName === 'LI') {
    // Update the text field with the ticker
    tickerInput.value = event.target.innerHTML;
    // Hide the ticker list
    tickerList.style.display = 'none';
  }
});

// Read the Excel file
const submitButton = document.getElementById('submit-button');
const currentYear = (new Date()).getFullYear();

submitButton.addEventListener('click', function() {
  // Get the ticker from the input field
  const ticker = document.getElementById('ticker-input').value;

  async function getFinancialData(ticker) {
    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=5y&interval=1d`, {mode: 'no-cors'});
    const data = await response.json();
    return data;
  }

  async function getFinancialDataForYear(ticker, year) {
    const data = await getFinancialData(ticker);
    const financialData = data.incomeStatementHistory.incomeStatementHistory;
    const dataForYear = financialData.find(data => data.year === year);
    return dataForYear;
  }
  // Read the Excel file from the URL
  const workbook = Xlsx.readFile('https://github.com/AndreasBoscariol/AutomatedDCF/blob/main/DCF%20Model.xlsx?raw=true');
  // Get the first sheet in the workbook
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const array = ['c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];  
  let financialData;
  for (let i = 0; i < 5; i++) {
    sheet[array[i]+'10'].v = 'New Value';

    financialData = getFinancialDataForYear(ticker, currentYear-i);
    const revenueTotal = financialData.revenueTotal;
    const revenueGrowthRate = financialData.revenueGrowth;
    const ebitda = financialData.ebitda;
    const ebitdaMargin = financialData.ebitdaMargin;
    const ebit = financialData.ebit;
    const ebitMargin = financialData.ebitMargin;
    const depreciationAmortization = financialData.depreciation;
    const daAsPercentageOfRevenue = financialData.daAsPercentageOfRevenue;
    const cash = financialData.cash;
    const accountsReceivable = financialData.accountsReceivable;
    const inventories = financialData.inventories;
    const prepaidExpenses = financialData.prepaidExpenses;
    const accountsPayable = financialData.accountsPayable;
    const accruedExpenses = financialData.accruedExpenses;
    const debt = financialData.debt;
    const capitalExpenditures = financialData.capitalExpenditures;
    const accountsReceivableGrowth = financialData.accountsReceivableGrowth;
    const inventoriesGrowth = financialData.inventoriesGrowth;
    const prepaidExpensesGrowth = financialData.prepaidExpensesGrowth;
    const accountsPayableGrowth = financialData.accountsPayableGrowth;
    const accruedExpensesGrowth = financialData.accruedExpensesGrowth;
    const capitalExpendituresGrowth = financialData.capitalExpendituresGrowth;
    const sharePrice = financialData.sharePrice;
  }
  // Write the modified data to a new buffer
  const buffer = Xlsx.writeBuffer(workbook);

  // Create a download link for the file
  const link = document.createElement('a');
  link.download = 'modified.xlsx';
  link.href = window.URL.createObjectURL(new Blob([buffer]));

  // Click the download link to start the download
  link.click();
});
