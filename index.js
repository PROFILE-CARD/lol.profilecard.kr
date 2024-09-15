const express = require("express");
const http = require("http");
const app = express();
require('dotenv').config();

app.use("/", express.static(__dirname + "/public"));

app.get("/user/:gameName/:tagLine", async (req, res) => {
  const gameName = req.params.gameName;
  const tagLine = req.params.tagLine;
  const options = {
    method: "GET",
    headers: {
      "X-Riot-Token": process.env.API_KEY,
    },
  };

  try {
    const data1 = await fetch(
      `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
      options,
    ).then((res) => res.json());
    
    console.log(data1)

    const data2 = await fetch(
      `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${data1.puuid}`,
      options,
    ).then((res) => res.json());

    const data3 = await fetch(
      `https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/${data2.id}`,
      options,
    ).then((res) => res.json());
    
    const tierPng = {
      IRON: "https://lol.profilecard.kr/Season_2023_-_Iron.webp",
      BRONZE: "https://lol.profilecard.kr/Season_2023_-_Bronze.webp",
      SILVER: "https://lol.profilecard.kr/Season_2023_-_Silver.webp",
      GOLD: "https://lol.profilecard.kr/Season_2023_-_Gold.webp",
      PLATINUM: "https://lol.profilecard.kr/Season_2023_-_Platinum.webp",
      EMERALD: "https://lol.profilecard.kr/Season_2023_-_Emerald.webp",
      DIAMOND: "https://lol.profilecard.kr/Season_2023_-_Diamond.webp",
      MASTER: "https://lol.profilecard.kr/Season_2023_-_Master.webp",
      GRANDMASTER: "https://lol.profilecard.kr/Season_2023_-_Grandmaster.webp",
      CHALLENGER: "https://lol.profilecard.kr/Season_2023_-_Challenger.webp",
    };

    let pngURL = "";

    for (data of data3) {
      console.log(data.tier + "/" + data.rank);
      pngURL = tierPng[data.tier] || "https://lol.profilecard.kr/Season_2023_-_Unranked.webp";
    }
    
    let image = await fetch(pngURL).then((res) => res.arrayBuffer());
    let imageConvert = Buffer.from(image).toString("base64");

    html = `
    <svg width="320" height="120" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 320 120">
      <defs>
        <style>
        <![CDATA[
        .card {
          animation: stroke 4s infinite alternate;
          fill: url(#card);
          stroke: black;
        }
        /*@keyframes stroke {
          0% {
            stroke: #B491FF;
            stroke-dashoffset: 30%;
            stroke-dasharray: 0 50%;
          }
          25% {
            stroke: #B491FF;
          }
          50% {
            stroke: #B491FF;
          }
          75% {
            stroke: #B491FF;
          }
          100% {
            stroke: #B491FF;
            stroke-dashoffset: -30%;
            stroke-dasharray: 50% 0;
            stroke-width: 3.0;
          }
        }*/
        ]]>
        </style>
      </defs>
      <defs>
      </defs>
      <rect xmlns="http://www.w3.org/2000/svg" class="card" x="0" y="0" rx="5" ry="5" width="320" height="120"/>
      <image width="120" height="120" href="data:image/png;base64,${imageConvert}"/>
      <text xmlns="http://www.w3.org/2000/svg" x="130" y="65" fill="black" font-weight="bold">${gameName}#${tagLine}</text>
    </svg>
    `;
    console.log(req.originalUrl);
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-control", "public, max-age=" + 3600);
    // res.setHeader('Cache-control', 'public, max-age=' + 3600 * 60 * 6)
    res.status(200).send(html);
  } catch (error) {
    console.log(error);
    res.status(401).json({ statusCode: 401, message: "unknown gameName." });
  }
});
app.get("*", (req, res) => {
  res.status(404).json({ statusCode: 404, message: "unknown request." });
});

http.createServer(app).listen(process.env.PORT);
