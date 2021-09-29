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
  return res.redirect(await scrapeData(urlVideobin));
});

app.get("/series/videobin", async (req, res) => {
  let url = req.query.id;
  let urlVideobin = `https://videobin.co/embed-${url}.html`;
  return res.redirect(await scrapeData(urlVideobin));
});

app.get("/movie/drive", async (req, res) => {
  let id = req.query.id;
  let urlVideobin = `https://drive.google.com/uc?export=download&id=${id}`;
  return res.redirect(urlVideobin);
});

app.get("/nfl", async (req, res) => {
  let url = req.query.id;
  //  let urlVideobin = `http://www.tv247.online/tv/game.php?game=nfl`;
  // return res.json(await scrapeNFL(urlVideobin))
  await scrapeOkru(url);

  // return res.redirect(await scrapeNFL(urlVideobin));
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
    var length = output.formats.length;
    return res.redirect(output.formats[length - 1].url);
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
        //console.log(data.manifest_url);
        return res.redirect(data.manifest_url);
      } else if (data.height == 720) {
        //console.log(data.manifest_url);
        return res.redirect(data.manifest_url);
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
    var sources = JSON.parse(
      str.match(/sources: (.*)v.mp4"]/)[0].replace("sources: ", "")
    );
    var index;
    if (sources.length == 2) {
      index = sources[0]
        .replace("/hls/,", "/hls/")
        .replace(",.urlset/master.m3u8", "/index-v1-a1.m3u8");
    } else if (sources.length == 1) {
      index = sources[0];
    }
    return index;
  } catch (err) {
    console.error(err);
  }
}

async function scrapeNFL(url) {
  try {
    const body = await axios.get(url);
    const $ = cheerio.load(body, { xmlMode: true });
    //return $
    // const data1 = cheerio.load($("script")._root[0].children[0].data);
    // var str = data1("script:not([src])")[5].children[0].data;
    // return index;
  } catch (err) {
    console.error(err);
  }
}

async function scrapeOkru(url) {
  try {
    const body = await axios.get("https://ok.ru/videoembed/2956416261721");
    const $ = cheerio.load(body, { xmlMode: true });
    var script = $("script")._root[0].children[0].data;
    var match = script.match(
      /hlsMasterPlaylistUrl(.*)hlsPlaybackMasterPlaylistUrl/
    )[0];
    var final = match.match(/https(.*)video.m3u8/)[0];
    console.log(final);
    return final;
  } catch (err) {
    console.error(err);
  }
}

app.listen(3000, () => console.log("Example app is listening on port 3000."));
