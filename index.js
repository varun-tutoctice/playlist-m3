const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const bodyParser = require("body-parser");
const youtubedl = require("youtube-dl-exec");
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/movie/videobin", async (req, res) => {
  let url = req.query.id;
  let urlVideobin = `https://videobin.co/embed-${url}.html`;
  res.redirect(await scrapeDataM3U8(urlVideobin));
});

app.get("/movie/mp4", async (req, res) => {
  let url = req.query.id;
  let urlVideobin = `https://videobin.co/embed-${url}.html`;
  res.redirect(await scrapeData(urlVideobin));
});

app.get("/series/videobin", async (req, res) => {
  let url = req.query.id;
  let urlVideobin = `https://videobin.co/embed-${url}.html`;
  res.redirect(await scrapeData(urlVideobin));
});


app.get("/movie/youtube", async (req, res) => {
  let id = req.query.id;
  let urlYoutube = `https://www.youtube.com/watch?v=${id}`;
  youtubedl("https://www.youtube.com/watch?v=qBB_QOZNEdc", {
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


async function scrapeData(url) {
  try {
    const body = await axios.get(url);
    const $ = cheerio.load(body, { xmlMode: true });
    const data1 = cheerio.load($("script")._root[0].children[0].data);
    var str = data1("script:not([src])")[5].children[0].data;
    var match = str.match(/,"https:(.*)v.mp4/)[0].replace(',"',"");
    return match;
  } catch (err) {
    console.error(err);
  }
}


async function scrapeDataM3U8(url) {
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
