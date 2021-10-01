const puppeteer = require('puppeteer');
const fs = require("fs");
const path = require("path");
const $ = require('jquery-jsdom');
const notifier = require('node-notifier');
const open = require("open");

// Tiktok User to check posts:
const Person_tiktok = "@andreielvis";
// 

// DEFAULT: 2.5 - 2 MINUTES & 30 SECONDS.
const Interval_checker = 0.25; // 15 SECONDS.
// 

var browser;
var settings = JSON.parse(fs.readFileSync(path.join(__dirname, "settings.json")));
const Settings = {
  tiktok_url: `https://www.tiktok.com/${Person_tiktok}`
};
init();


async function init() {
  browser = await puppeteer.launch({
      headless: true,
      userDataDir: "./browser_data",
      args: [
          "--disable-web-security",
          "--disable-features=IsolateOrigins,site-per-process"
      ]
  });

  runCheckers();
}

async function runCheckers() {
  console.log(`Running Checkers...`);
  await tiktok_check();
  console.log(`New Settings >>`);
  console.log(settings);
  console.log(`Current time:`, new Date().toLocaleString());
  console.log(`Next check:`, nextCheck());
  setTimeout(() => {
    runCheckers();
  }, 60000 * Interval_checker);
}

async function tiktok_check() {
  return new Promise(async resolve => {
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322)");
    try {
      console.log(`Running TikTok Checker for user << ${Person_tiktok} >>...`);
      await page.goto(Settings.tiktok_url);
      await page.waitForSelector(".video-feed");
  
      let body = await page.content();
      let videos = $(body).find(".video-feed .video-feed-item");
      let videos_count = 0;
  
      videos.each((i, item) => {
        videos_count++;
      });
  
      if(settings.tiktok_videos != videos_count) alertTikTok(videos_count);
  
      settingsUpdate("tiktok_videos", videos_count);
  
      page.close();
      resolve();
    } catch(e) {
      console.error(e);
    }
  });
}

function settingsUpdate(value, to) {
  let setari = JSON.parse(fs.readFileSync(path.join(__dirname, "settings.json")));
  console.log(`Got New ${value} - old: ${setari[value]}; new: ${to}`);
  setari[value] = to;
  fs.writeFileSync(path.join(__dirname, "settings.json"), JSON.stringify(setari));
  settings = setari;
}

function alertTikTok(vcount) {
  notifier.notify(
    {
      id: 69,
      title: `TikTok Notification!`,
      message: `User ${Person_tiktok} has now ${vcount} videos!`,
    },
    (err, resp, metadata) => {
      if(metadata.action == "clicked" && metadata.notificationId == "69") open(Settings.tiktok_url);
    }
  );
}

function nextCheck() {
  let curr_time = new Date().getTime();
  curr_time = parseInt( curr_time + ( 60000 * Interval_checker ) );
  return new Date(curr_time).toLocaleString();
}