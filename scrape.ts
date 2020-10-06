import cheerio from "cheerio";
import express, { Response, Request } from "express";
import { IItemObject } from "./interfaces";
import fetch from "node-fetch";
import config from "./config";

// inits express router
const app = express();

// route for querying items from metathreads collection
// params: name <string>
app.route("/query/:name").get(async (req: Request, res: Response) => {
  const { name } = req.params;
  let pageCount: number = 1;
  const itemArray: IItemObject[] = [];

  const grabData = async () => {
    const url: string = `https://metathreads.com/collections/${name}?page=${pageCount}`;

    // fetches html from url
    const response = await fetch(url);

    // grabs html from response object
    const html = await response.text();

    // inits html for scraping
    const $ = cheerio.load(html);

    // checks if its on a paginted page so we know if theres more items to grab
    const isPaginated =
      $(".ProductItem__Wrapper").has(".ProductItem__Info").length > 0
        ? true
        : false;

    // checks to see if theres anymore items left to scrape and stops recursion
    if (
      (itemArray.length && !isPaginated) ||
      (!itemArray.length && !isPaginated && pageCount > 1)
    ) {
      return itemArray;
    }

    $(".ProductItem__Wrapper").each(async (i: number, el) => {
      // grabs the item's name
      const ItemName: string = $(el).find(".ProductItem__Title a").text();

      // grabs the item's image url
      const ItemImg: string = $(el)
        .find(".ProductItem__Image")
        .attr("data-src")
        .replace(/\s*\{.*?\}\s*/g, "600");

      // grabs the item's image alt attr for accessibility
      const ItemImgAlt: string = $(el).find(".ProductItem__Image").attr("alt");

      // grabs the link to the item
      const ItemLink: string = `https://metathreads.com${$(el)
        .find(".ProductItem__Title a")
        .attr("href")}`;

      // grabs numerical value for the item's price
      const ItemPrice: number = +$(el)
        .find(".ProductItem__PriceList span")
        .first()
        .text()
        .substring(2);

      // grabs boolean value for if the item is sold out or not
      const ItemSoldOut: boolean =
        $(el)
          .find(".ProductItem__LabelList .ProductItem__Label")
          .text()
          .toLowerCase() === "sold out"
          ? true
          : false;

      // formats data into proper format
      const ResponseObject: IItemObject = {
        ItemName,
        ItemImg,
        ItemImgAlt,
        ItemLink,
        ItemPrice,
        ItemSoldOut,
      };
      // adds formatted data to the itemArray
      itemArray.push({
        ...ResponseObject,
      });
    });

    // increments the page count for recursion
    ++pageCount;
    await grabData();
  };

  await grabData();
  // checks if the scraper successfully got items from html
  if (itemArray.length) {
    return res.status(200).json(itemArray).end();
  } else {
    return res
      .status(400)
      .send({ error: { message: "Invalid collection name" } })
      .end();
  }
});

app.listen(config.PORT, (): void => console.log("Server Running"));

module.exports = app;
