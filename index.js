const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/movie/videobin", async (req, res) => {
  let url = req.query.url;
  let urlVideobin = `https://videobin.co/embed-${url}.html`;
  axios.get(await scrapeData(urlVideobin));
  res.redirect(await scrapeData(urlVideobin));
});

app.get("/series/videobin", async (req, res) => {
  let url = req.query.url;
  let urlVideobin = `https://videobin.co/embed-${url}.html`;
  axios.get(await scrapeData(urlVideobin));
  res.redirect(await scrapeData(urlVideobin));
});

async function scrapeData(url) {
  try {
    const body = await axios.get(url);
    const $ = cheerio.load(body, { xmlMode: true });
    const data1 = cheerio.load($("script")._root[0].children[0].data);
    var str = data1("script:not([src])")[5].children[0].data;
    var match = str.match(/https(.*)master.m3u8/)[0];
    return match;
  } catch (err) {
    console.error(err);
  }
}

app.listen(3000, () => console.log("Example app is listening on port 3000."));
