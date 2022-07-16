#! /usr/bin/env node

const {readFileSync, existsSync} = require('fs');
const figlet = require('figlet');
const yargs = require("yargs");
const {join} = require('path');
const chalk = require("chalk");
const gradient = require('gradient-string');
const fs = require("fs");
const {hideBin} = require("yargs/helpers");

const parseFile = require("./extractComments");

const usage = "\nUsage: gen <file name> - Generate documentation from a file.\n";

// noinspection BadExpressionStatementJS
yargs.usage(usage).help(true)
    .option("f", {alias: "file", describe: "File to generate docs for", type: "string"})
    .option("a", {alias: "api", describe: "API that the file is for", type: "string"})
    .argv;

const argv = yargs(hideBin(process.argv)).argv;
const {file: fileName, api = "API"} = argv;

const sendError = (err) => {
    console.log(chalk.red(`\n❌  ${err}`));
    process.exit(1);
}

// Check if a file was provided
if (!fileName) {
    sendError(`No file provided.`);
    console.log(usage);
    process.exit(1);
}

if (!existsSync(fileName)) {
    sendError(`File ${fileName} does not exist.`);
    process.exit(1);
}

// Check if the file name includes js or ts
if (!fileName.match(/.*\.(js|ts)$/)) {
    sendError(`File ${fileName} is not a valid file. Please provide a file with a .js or .ts extension.`);
    process.exit(1);
}

const text = figlet.textSync("ROUTIFY", {horizontalLayout: "full"});
console.log("\n", gradient.teen(text));

const file = readFileSync(argv.file).toString();

console.log(chalk.green(`\nGenerating documentation for ${fileName}...`));

// get today's date
const date = new Date();
const today = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

const _name = `${api}-${today}.json`;
fs.writeFileSync(_name, JSON.stringify(parseFile(file), null, 4));

console.log(chalk.green(`\n✔ Documentation generated for ${fileName}!`));
console.log(chalk.green(`✔ Open ${join(process.cwd(), _name)} in your favorite editor to view the documentation.`));
