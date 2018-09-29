#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const pkg = require("../package.json");
const args = process.argv.slice(2);

const vmfTools = require("../index");

if (args.length < 2) {
    console.log(`Must have VMF to process and file to write to.
Usage 'npx vmf-tools path\\to\\in.vmf path\\to\\out.vmf [path\\to\\config.json]'

vmf-tools v${pkg.version}`);
  process.exit(1);
}

console.log("Running with args", args);

const vmfIn = path.resolve(process.cwd(), args[0]);
const vmfOut = args[1]
    ? path.resolve(process.cwd(), args[1])
    : null;
const configFile = args[2]
    ? path.resolve(process.cwd(), args[2])
    : null;

fs.writeFileSync(
    vmfOut,
    vmfTools(
        fs.readFileSync(vmfIn).toString(),
        configFile
            ? require(configFile)
            : undefined
    )
);