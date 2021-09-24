const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const bodyParser = require("body-parser");
const youtubedl = require("youtube-dl-exec");
const puppeteer = require('puppeteer');
const PuppeteerHar = require('puppeteer-har');
const { data } = require("cheerio/lib/api/attributes");
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/movie/videobin", async (req, res) => {
  let url = req.query.url;
  let urlVideobin = `https://videobin.co/embed-${url}.html`;
  res.redirect(await scrapeData(urlVideobin));
});

app.get("/series/videobin", async (req, res) => {
  let url = req.query.url;
  let urlVideobin = `https://videobin.co/embed-${url}.html`;
  res.redirect(await scrapeData(urlVideobin));
});

app.get("/movie/youtube", async (req, res) => {
  let id = req.query.id;
  let urlYoutube = `https://www.youtube.com/watch?v=${id}`;
  youtubedl(urlYoutube, {
    dumpSingleJson: true,
    noWarnings: true,
    noCallHome: true,
    noCheckCertificate: true,
    preferFreeFormats: true,
    youtubeSkipDashManifest: true,
    referer: "https://www.youtube.com",
  }).then((output) => {
    output.formats.forEach((data) => {
      if (data.format == "22 - 1280x720 (720p)") {
        res.redirect(data.url);
      }
    });
  });
});

app.get("/live/youtube", async (req, res) => {
  let id = req.query.id;
  let urlYoutube = `https://www.youtube.com/watch?v=${id}`;
  youtubedl(urlYoutube, {
    dumpSingleJson: true,
    noWarnings: true,
    noCallHome: true,
    noCheckCertificate: true,
    preferFreeFormats: true,
    youtubeSkipDashManifest: true,
    referer: "https://www.youtube.com",
  }).then((output) => {
    output.formats.forEach((data) => {
      if (data.height == 1080) {
        res.redirect(data.manifest_url);
      } else if (data.height == 720) {
        res.redirect(data.manifest_url);
      }
    });
  });
});


app.get("/movie/streamtape", async (req, res) => {
  let url = req.query.url;
  let urlVideobin = `https://streamtape.com/e/YyYmKpoVlvI3vJ/bbs5d17`;
  // // const browser = await puppeteer.launch({
  // //   headless: true,
  // //   // devtools: true,
  // // });
  // // const page = await browser.newPage();
  // // await page.tracing.start({
  // //   path:'trace.json'
  // // });
  // await page.goto(urlVideobin);
  // await page.tracing.stop();
  // await browser.close();
  res.redirect(await scrapeStreamTape(urlVideobin));

});

async function scrapeData(url) {
  try {
    const body = await axios.get(url);
    const $ = cheerio.load(body, { xmlMode: true });
    const data1 = cheerio.load($("script")._root[0].children[0].data);
    var str = data1("script:not([src])")[5].children[0].data;

    var match = str.match(/https(.*)master.m3u8/)[0];
   // console.log(str.match(/https(.*)master.m3u8/)[0].replace(",.urlset/master.m3u8","/index-v1-a1.m3u8"));
    return match;
  } catch (err) {
    console.error(err);
  }
}


async function scrapeStreamTape(url) {
  try {
    const body = await axios.get(url);
    const $ = cheerio.load(body);
    var str = $("script")._root[0].children[0].data;
    var match = str.match(/<div id="ideoolink" style="display:none;">(.*)/)[1];
    var https = `https:/${match.replace("</div>","")}&stream=1`
    console.log(https.match(/&expires=(.*)&ip/)[1]);
    return https;
    // const data1 = cheerio.load($("script"));
    // console.log(data1);
   // return match;
  } catch (err) {
    console.error(err);
  }
}
app.listen(3000, () => console.log("Example app is listening on port 3000."));
