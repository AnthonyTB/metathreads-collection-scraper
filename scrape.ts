import request from 'request';
import cheerio from 'cheerio';
import express from 'express';

const app = express();

app.use(function errorHandler(error: any, req: any, res: any, next: any) {
    const response = { error: { message: 'server error' } };
  res.status(500).json(response);
});

app.route('/query/:name').get((req, res) => {
res.json('hello user').end()
})

app.listen(8000, () => console.log('Server Running'));

module.exports = app;