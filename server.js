import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import Parser from "rss-parser";

const app = express();
const parser = new Parser();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// ===== MongoDB Setup =====
mongoose.connect("mongodb://127.0.0.1:27017/autoblog", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const postSchema = new mongoose.Schema({
  title: String,
  link: String,
  date: Date,
  description: String,
  source: String,
  image: String,
});

const feedSchema = new mongoose.Schema({
  url: String,
  title: String,
});

const Post = mongoose.model("Post", postSchema);
const Feed = mongoose.model("Feed", feedSchema);

// ===== Fetch & Save Feeds =====
async function fetchAndSaveFeeds() {
  const feeds = await Feed.find();
  for (let feedData of feeds) {
    try {
      const feed = await parser.parseURL(feedData.url);
      for (let item of feed.items) {
        const exists = await Post.findOne({ link: item.link });
        if (!exists) {
          // extract image
          let imageUrl = null;
          if (item.enclosure?.url) imageUrl = item.enclosure.url;
          else if (item["media:content"]?.url) imageUrl = item["media:content"].url;
          else if (item.content) {
            const match = item.content.match(/<img[^>]+src="([^">]+)"/);
            if (match) imageUrl = match[1];
          }

          await Post.create({
            title: item.title,
            link: item.link,
            date: item.pubDate ? new Date(item.pubDate) : new Date(),
            description: item.contentSnippet || item.content || "",
            source: feed.title || feedData.title || "Unknown Source",
            image: imageUrl,
          });
        }
      }
    } catch (err) {
      console.error("Error fetching feed:", feedData.url, err.message);
    }
  }
}
setInterval(fetchAndSaveFeeds, 1000 * 60 * 15); // every 15 min
fetchAndSaveFeeds();

// ===== API Routes =====
app.get("/api/posts", async (req, res) => {
  const posts = await Post.find().sort({ date: -1 }).limit(50);
  res.json(posts);
});

app.delete("/api/posts/:id", async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.sendStatus(200);
});

app.get("/api/feeds", async (req, res) => {
  const feeds = await Feed.find();
  res.json(feeds);
});

app.post("/api/feeds", async (req, res) => {
  const feed = await Feed.create(req.body);
  res.json(feed);
});

app.delete("/api/feeds/:id", async (req, res) => {
  await Feed.findByIdAndDelete(req.params.id);
  res.sendStatus(200);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
