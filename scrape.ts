import cheerio from "cheerio";
import express from "express";
import { IItemObject } from "./interfaces";
import fetch from "node-fetch";

const app = express();

app.use(function errorHandler(error: any, req: any, res: any, next: any) {
  const response = { error: { message: "server error" } };
  res.status(500).json(response);
});

app.route("/query/:name").get(async (req, res) => {
  const { name } = req.params;
  let pageCount: number = 1;
  const url: string = `https://metathreads.com/collections/${name}?page=${pageCount}`;
  let response = await fetch(url);
  const html = await response.text();
  const itemArray: any = [];
  const $ = cheerio.load(html);

  const isPaginated =
    $(".Pagination").has(".Pagination__Nav").length > 0 ? true : false;

  $(".ProductItem__Wrapper").each(async (i: number, el) => {
    const ItemName = $(el).find(".ProductItem__Title a").text();
    const ItemImg = $(el)
      .find(".ProductItem__Image")
      .attr("data-src")
      .replace(/\s*\{.*?\}\s*/g, "600");
    const ItemImgAlt = $(el).find(".ProductItem__Image").attr("alt");
    const ItemLink = `https://metathreads.com${$(el)
      .find(".ProductItem__Title a")
      .attr("href")}`;
    const ItemPrice = Number(
      $(el).find(".ProductItem__PriceList span").first().text().substring(2)
    );
    const ItemSoldOut =
      $(el)
        .find(".ProductItem__LabelList .ProductItem__Label")
        .text()
        .toLowerCase() === "sold out"
        ? true
        : false;

    const ResponseObject: IItemObject = {
      ItemName,
      ItemImg,
      ItemImgAlt,
      ItemLink,
      ItemPrice,
      ItemSoldOut,
    };
    console.log(ResponseObject, pageCount);
    itemArray.push({
      [i]: ResponseObject,
    });
  });

  if (isPaginated) {
    ++pageCount;
    console.log(pageCount);
    response = await fetch(url);
  }

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
