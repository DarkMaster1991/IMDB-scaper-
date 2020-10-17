const request = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");
const json2csv = require("json2csv").Parser;


const movies = [];

(async () => {
    try {
        const res = await request({
            uri: "https://www.imdb.com/chart/moviemeter",
            headers: {
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Accept-Encoding": "gzip, deflate, br",
            },
            gzip: true
        });

        let $ = cheerio.load(res)
        // var list = $(".titleColumn>a").each(() => { return ($(this).attr("href")) });
        var links = $(".titleColumn>a");
        $(links).each((i, el) => {
            movies.push(`https://www.imdb.com/${$(el).attr("href")}`);
        });

        movieScrap();
    } catch (e) { console.log(e); }
})();

async function movieScrap() {
    let imdbData = [];

    for (let movie of movies) {
        const res = await request({
            uri: movie,
            headers: {
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Accept-Encoding": "gzip, deflate, br",
            },
            gzip: true
        });

        let $ = cheerio.load(res)
        let title = $('div[class="title_wrapper"] > h1').text().trim();
        let rating = $('div[class="ratingValue"] > strong > span').text().trim();
        let summary = $('div[class="summary_text"]').text().trim();
        let relDate = $('a[title="See more release dates"]').text().trim();


        imdbData.push({
            title, rating, summary, relDate
        });
    }


    const jcsv = new json2csv();
    const csv = jcsv.parse(imdbData);

    fs.writeFileSync("./imdb.csv", csv, "utf-8");
}