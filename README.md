# Meta Threads Clothing Collection Scraper

## Purpose

> The purpose of this scraper is if another developer is building a site or app for a content creator that has a clothing collection on [Meta Threads](https://metathreads.com/). The scraper takes the collection name from the request and grabs all the data for the clothing items and returns all the items in a neat JSON fromat.

## Request

> You would send a GET request to [https://metathreads.herokuapp.com/] with the collection name at the end (example: /astro-gaming). If you don't use a vaild collection name you will get back a 400 with an error message.

## Response

> On a successful request you will get back a array of objects which would be the items within the collection.
> Example Object: {
> ItemName: string;
> ItemImg: string;
> ItemImgAlt: string;
> ItemLink: string;
> ItemPrice: number;
> ItemSoldOut: boolean;
> }

### Connect With Me

> [Twitter](https://twitter.com/Anthony_Bostic) [LinkedIn](https://www.linkedin.com/in/anthonytb/)
