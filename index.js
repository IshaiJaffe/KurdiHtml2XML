
function cleanName(name) {
    return name.trim().replace(/^[:[\]\s]+/g, '').replace(/[:[\]\s]+$/g, '').replace(/[:[\]\s]+/g, '_');
}
function run() {
    //if(!process.argv[0].includes('kurdi')){
    //    console.error('program must be kurdi');
    //    return false;
    //}
    const sourceFile = process.argv[2];
    if(!sourceFile) {
        console.error("no source file given");
        return false;
    }
    const targetFile = process.argv[3];
    if(!targetFile){
        console.error("no target file given");
        return false;
    }
    const fs = require('fs');
    const _ = require('lodash');
    const htmlStr = fs.readFileSync(sourceFile, 'utf8');

    const $ = require("cheerio");
    const tables = $('table', htmlStr);
    if (tables.length < 3) {
        console.error("no 3 tables, found ", tables.length);
        return false;
    }
    const output = {};
    const first2 = tables.slice(0, 2);
    _.each(first2, table => {
        const rows = $('tr', table);
        _.each(rows, row => {
            const cells = $('td', row);
            if(cells.length != 2){
                console.error('expected 2 cells in', row, 'skipping');
                return;
            }
            const name = $(cells[0]).text();
            const value = $(cells[1]).text();
            output[cleanName(name)] = value;

        })

    });

    const third = tables[2];
    const rows = $('tr', third);
    const firstRow = rows[0];
    const otherRows = rows.slice(1);
    const firstCells = $('th', firstRow);
    const columns = _.map(firstCells, cell => {
        return cleanName($(cell).text());
    });
    const orders = _.map(otherRows, row => {
       const cells = $('td', row);
       const obj = {};
       _.each(cells, (cell, i) => {
           obj[columns[i]] = $(cell).text();
       });
       return obj;
    });
    output.orders = {order:orders};

    const xml2js = require('xml2js');
    const builder = new xml2js.Builder();
    const xml = builder.buildObject(output);
    fs.writeFileSync(targetFile, xml, 'utf8');
    return true;
}

if(!run()){
    console.error("exit with failure");
    process.exit(1);
} else {
    console.log('done');
}
