"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = __importDefault(require("cheerio"));
const express_1 = __importDefault(require("express"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const config_1 = __importDefault(require("./config"));
// inits express router
const app = express_1.default();
// route for querying items from metathreads collection
// params: name <string>
app.route("/query/:name").get((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.params;
    let pageCount = 1;
    const itemArray = [];
    const grabData = () => __awaiter(void 0, void 0, void 0, function* () {
        const url = `https://metathreads.com/collections/${name}?page=${pageCount}`;
        // fetches html from url
        const response = yield node_fetch_1.default(url);
        // grabs html from response object
        const html = yield response.text();
        // inits html for scraping
        const $ = cheerio_1.default.load(html);
        // checks if its on a paginted page so we know if theres more items to grab
        const isPaginated = $(".ProductItem__Wrapper").has(".ProductItem__Info").length > 0
            ? true
            : false;
        // checks to see if theres anymore items left to scrape and stops recursion
        if ((itemArray.length && !isPaginated) ||
            (!itemArray.length && !isPaginated && pageCount > 1)) {
            return itemArray;
        }
        $(".ProductItem__Wrapper").each((i, el) => __awaiter(void 0, void 0, void 0, function* () {
            // grabs the item's name
            const ItemName = $(el).find(".ProductItem__Title a").text();
            // grabs the item's image url
            const ItemImg = $(el)
                .find(".ProductItem__Image")
                .attr("data-src")
                .replace(/\s*\{.*?\}\s*/g, "600");
            // grabs the item's image alt attr for accessibility
            const ItemImgAlt = $(el).find(".ProductItem__Image").attr("alt");
            // grabs the link to the item
            const ItemLink = `https://metathreads.com${$(el)
                .find(".ProductItem__Title a")
                .attr("href")}`;
            // grabs numerical value for the item's price
            const ItemPrice = +$(el)
                .find(".ProductItem__PriceList span")
                .first()
                .text()
                .substring(2);
            // grabs boolean value for if the item is sold out or not
            const ItemSoldOut = $(el)
                .find(".ProductItem__LabelList .ProductItem__Label")
                .text()
                .toLowerCase() === "sold out"
                ? true
                : false;
            // formats data into proper format
            const ResponseObject = {
                ItemName,
                ItemImg,
                ItemImgAlt,
                ItemLink,
                ItemPrice,
                ItemSoldOut,
            };
            console.log(ResponseObject, pageCount);
            // adds formatted data to the itemArray
            itemArray.push(Object.assign({}, ResponseObject));
        }));
        // increments the page count for recursion
        ++pageCount;
        yield grabData();
    });
    yield grabData();
    // checks if the scraper successfully got items from html
    if (itemArray.length) {
        return res.status(200).json(itemArray).end();
    }
    else {
        return res
            .status(400)
            .send({ error: { message: "Invalid collection name" } })
            .end();
    }
}));
app.listen(config_1.default.PORT, () => console.log("Server Running"));
module.exports = app;
//# sourceMappingURL=scrape.js.map