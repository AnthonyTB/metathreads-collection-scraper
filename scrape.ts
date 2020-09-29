import cheerio from "cheerio";
import express from "express";
import fetch from "node-fetch";

const app = express();

app.use(function errorHandler(error: any, req: any, res: any, next: any) {
  const response = { error: { message: "server error" } };
  res.status(500).json(response);
});

app.route("/query/:name").get(async (req, res) => {
  const { name } = req.params;
  const url = `https://metathreads.com/collections/${name}`;

  const response = await fetch(url);
  const html = await response.text();
  const itemArray = [];
  const $ = cheerio.load(html);
  $(".ProductItem .ProductItem__Wrapper a").each((i: number, el) => {
    itemArray.push({
      [i]: { link: `https://metathreads.com${$(el).attr("href")}` },
    });
  });
  if (itemArray.length) {
    res.status(200).json(itemArray).end();
  } else {
    res
      .status(400)
      .send({ error: { message: "Invalid collection name" } })
      .end();
  }
});

app.listen(8000, () => console.log("Server Running"));

module.exports = app;
