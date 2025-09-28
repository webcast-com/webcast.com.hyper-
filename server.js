// server.js
import express from "express";
import Parser from "rss-parser";
import cors from "cors";

const app = express();
const parser = new Parser();

app.use(cors());

const feeds = [
  "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
  "https://feeds.bbci.co.uk/news/rss.xml",
  "https://www.xvideos.com/tags/xxx-porn"
];

app.get("/posts", async (req, res) => {
  try {
    let articles = [];

    for (let url of feeds) {
      let feed = await parser.parseURL(url);
      feed.items.forEach(item => {
        articles.push({
          title: item.title,
          link: item.link,
          date: item.pubDate ? new Date(item.pubDate) : new Date(),
          description: item.contentSnippet || item.content || ""
        });
      });
    }

    // Sort by latest
    articles.sort((a, b) => b.date - a.date);

    res.json(articles);
  } catch (err) {
    console.error("Error fetching feeds:", err);
    res.status(500).json({ error: "Failed to fetch feeds" });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
