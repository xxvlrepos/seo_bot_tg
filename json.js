const fs = require("fs");
let fileContent = fs.readFileSync("text.txt", "utf8");
const obj = JSON.parse(fileContent);
console.log(obj);
