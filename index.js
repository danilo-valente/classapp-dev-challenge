const csvtojson = require('csvtojson');
const fsPromises = require('fs').promises;

main('./input.csv', './output.json', require('./mappers'));

// Main function
async function main(input, output, mappers) {

    const { headerRow, rows } = await readCsv(input);
    const header = headerRow.map(parseHeader);

    const data = mapRows(header, rows, mappers);
    console.log(data);

    await fsPromises.writeFile(output, JSON.stringify(data), 'utf8', () => console.log(data));
}

// Asynchronously reads a CSV file into an object that contains its header and rows
async function readCsv(input) {

    const csvStr = (await fsPromises.readFile(input, 'utf8')).split('\n');

    const headerRow = (await csvtojson({ noheader: true, output: 'csv' }).fromString(csvStr[0]))[0];
    const rows = await csvtojson({ noheader: true, output: 'csv' }).fromString(csvStr.slice(1).join('\n'));

    return { headerRow, rows };
}

// Parse CSV header to split header names and tags apart
function parseHeader(item) {
    const parts = item.split(/[\s/,]+/g);
    return {
        name: parts[0],
        tags: parts.slice(1)
    };
}

// Map each row into a new entry or merge it to an existing one
function mapRows(header, rows, mappers) {

    // eid index in header
    const eidx = header.findIndex(h => h.name === 'eid');
    header.splice(eidx, 1);

    return rows.reduce((data, row) => {
        const eid = row.splice(eidx, 1)[0];

        let entry = data.find(e => e.eid === eid);
        if (!entry) {
            entry = {
                eid,
                invisible: false,
                see_all: false
            };
            data.push(entry);
        }

        header.forEach((h, i) => mappers[h.name](entry, h.name, h.tags, row[i].trim()));

        return data;
    }, []);
}
