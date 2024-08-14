const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

app.get('/convert',async (req, res) => {
  try {
    const dynamicContent = req.body;

    if (!dynamicContent) {
      throw new Error("Meeting not found");
    }

    const htmlContent = `
        <html>
            <head>
             <style>
                @font-face {
                    font-family: 'kalpurush';
                    src: url('file://${path.join(
                      __dirname,
                      "..",
                      "fonts",
                      "kalpurush.ttf"
                    )}') format('truetype');
                }
                body {
                    font-family: 'kalpurush', sans-serif;
                }
                table, th, td {
                    border: 1px solid black;
                    border-collapse: collapse;
                    }
                    th, td {
                    padding: 8px;
                    text-align: left;
                    }
                }
            </style>
            </head>
            <body>
                ${dynamicContent}
            </body>
        </html>
        `;

    const pdfPath = path.join(__dirname, "..", "pdf", "pdf.pdf");

    // Ensure the directory exists
    if (!fs.existsSync(path.dirname(pdfPath))) {
      fs.mkdirSync(path.dirname(pdfPath), {recursive: true});
    }

    // Convert HTML to PDF
    await convertHtmlToPdf(htmlContent, pdfPath);

    // Download the PDF file
    res.download(pdfPath, "pdf.pdf", (err) => {
      if (err) {
        console.error("Error downloading PDF:", err);
        res.status(500).send("Error downloading PDF");
      } else {
        fs.unlinkSync(pdfPath);
      }
    });
  } catch (error) {
    return res.status(500).json({success: false, message: error.message});
  }
});


async function convertHtmlToPdf(htmlContent, pdfPath) {
  let browser;
  try {
    // Launch a new browser instance
    browser = await puppeteer.launch({
      headless: true,
    });

    // Create a new page
    const page = await browser.newPage();

    // Set the page content to the provided HTML
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Generate the PDF with the specified path and format
    await page.pdf({ path: pdfPath, format: 'A4' });

    console.log(`PDF created successfully at ${pdfPath}`);
  }catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});