const Express = require("Express");
const app = Express();
const shortid = require("shortid");
const utils = require("./utils/util");
const NodeCache = require("node-cache");
const myCache = new NodeCache();

app.use(Express.urlencoded({ extended: true }));
app.use(Express.json());

// Short URL Generator
app.get("/encode/*", async (req, res) => {
  const origUrl = `${req.url.split("/encode/")[1]}`;
  const urlId = shortid.generate();
  const shortUrl = `http://hived/${urlId}`;

  if (utils.validateUrl(origUrl)) {
    const newUrlObj = {
      originalURL: origUrl,
      shortUrl: shortUrl,
    };
    try {
      myCache.set(urlId, newUrlObj, "900");
      return res
        .status(200)
        .json(`URL has been succesfully encoded! ${shortUrl}`);
    } catch (err) {
      res.status(500).json("Server Error");
    }
  } else {
    res.status(400).json("Invalid Url");
  }
});

// Short URL Decoder
app.get("/decode/:protocol//:url/:urlkey", async (req, res) => {
  const urlKey = req.params.urlkey;
  try {
    const cacheUrlObject = myCache.get(urlKey);
    if (cacheUrlObject !== undefined) {
      return res
        .status(200)
        .json(
          `URL has been succesfully decoded! ${cacheUrlObject.originalURL}`
        );
    } else {
      res.status(404).json("Invalid Url Key");
    }
  } catch (err) {
    res.status(500).json("Server Error");
  }
});

// Server Setup
const PORT = 3333;
app.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}`);
});
