const puppeteer = require('puppeteer');
const fetch = require('node-fetch');
const { get } = require('http');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
async function getCustomerEmail(url, pk) {
    try {
      const [baseUrl, hash] = url.split("#");
      const response = await fetch(`${baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'key=' + pk + '&eid=NA&browser_locale=en-US&redirect_type=stripe_js',
      });
  
      const text = await response.text();
      const emailRegex = /"email":\s*"([^"]+)"/;
      const emailMatch = text.match(emailRegex);
      const email = emailMatch ? emailMatch[1] : null;
      return email;
    } catch (error) {
      console.error(error);
    }
  }
  
async function getCheckoutSession(url, pk) {
    try {
      const [baseUrl, hash] = url.split("#");
      const response = await fetch(`${baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'key=' + pk + '&eid=NA&browser_locale=en-US&redirect_type=stripe_js',
      });
  
      const text = await response.text();
      const emailRegex = /"session_id":\s*"([^"]+)"/;
      const emailMatch = text.match(emailRegex);
      const email = emailMatch ? emailMatch[1] : null;
      return email;
    } catch (error) {
      console.error(error);
    }
  }

async function getCheckoutCurrency(url, pk) {
    try {
      const [baseUrl, hash] = url.split("#");
      const response = await fetch(`${baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'key=' + pk + '&eid=NA&browser_locale=en-US&redirect_type=stripe_js',
      });
  
      const text = await response.text();
      const emailRegex = /"currency":\s*"([^"]+)"/;
      const emailMatch = text.match(emailRegex);
      const email = emailMatch ? emailMatch[1] : null;
      return email;
    } catch (error) {
      console.error(error);
    }
  }

async function getAmountDue(url, pk) {
    try {
      const [baseUrl, hash] = url.split("#");
      const response = await fetch(`${baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'key=' + pk + '&eid=NA&browser_locale=en-US&redirect_type=stripe_js',
      });
  
      const text = await response.text();
      const amountDueRegex = /"unit_amount":\s*(-?\d+)/;
      const amountDueMatch = text.match(amountDueRegex);
      const amountDue = amountDueMatch ? parseInt(amountDueMatch[1]) : null;
      return amountDue;
    } catch (error) {
      console.error(error);
    }
  }

async function getStripePK(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    let matchFound = false;
    let pk;
    let urlx;
    page.on('request', request => {
      const postData = request.postData();
      if (!matchFound && postData && postData.includes('pk')) {
        const regex = /pk_live_[\w-]+/;
        const match = postData.match(regex);
        if (match) {
          pk = match[0];
          matchFound = true;
          urlx = request.url(); 
          page.removeListener('request', this);
        }
      }
      request.continue();
    });
    await page.goto(url);
    await browser.close();
    return [pk, urlx];
  }
  
async function main() {
    const url = await new Promise((resolve) => {
      readline.question('Enter the URL: ', (url) => {
        resolve(url);
      });
    });
  
    try {
      const [pk, urlx] = await getStripePK(url);
      const email = await getCustomerEmail(urlx, pk);
      const session_id = await getCheckoutSession(urlx, pk);
      const amountDue = await getAmountDue(urlx, pk);
      const currency_chk = await getCheckoutCurrency(urlx, pk);
  
      console.log(`Email: ${email}`);
      console.log(`Session ID: ${session_id}`);
      console.log(`Amount Due: ${amountDue}`);
      console.log(`Currency : ${currency_chk}`);
      console.log(`Pk : ${pk}`);
    } catch (error) {
      console.error(error);
    }
  
    readline.close();
  }

main()
