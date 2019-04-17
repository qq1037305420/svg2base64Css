const fs = require("fs");
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});
// encoder
const symbols = /[\r\n%#()<>?\[\\\]^`{|}]/g;

let quotes = { level1: `'`, level2: `"` };

function addNameSpace(data) {
  if (data.indexOf("http://www.w3.org/2000/svg") < 0) {
    data = data.replace(
      /<svg/g,
      `<svg xmlns=${quotes.level2}http://www.w3.org/2000/svg${quotes.level2}`
    );
  }
  return data;
}

function encodeSVG(data) {
  data = data.replace(/'/g, '"');
  data = data.replace(/>\s{1,}</g, "><");
  data = data.replace(/\s{2,}/g, " ");

  return data.replace(symbols, encodeURIComponent);
}

function getStyle(data) {
  var namespaced = addNameSpace(data);
  var escaped = encodeSVG(namespaced);
  var resultCss = `background-image: url(${
    quotes.level1
  }data:image/svg+xml,${escaped}${quotes.level1});`;
  return resultCss;
}

// end encoder

function run(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, { encoding: "utf-8" }, function(err, fr) {
      //readFile回调函数
      if (err) {
        reject(err);
        return;
      } else {
        resolve(fr);
      }
    });
  });
}

function readFilePath(path) {
  return new Promise((resolve, reject) => {
    fs.readdir(path, async function(err, success) {
      if (err) {
        reject(err);
        return;
      }
      resolve(success);
    });
  });
}

function initCssContent(cssPrefix, basePixel) {
  return `
        .${cssPrefix}-icon {
            display: inline-block;
            width: ${basePixel}px;
            height: ${basePixel}px;
        }

        .${cssPrefix}-x2 {
            width: ${basePixel * 2}px;
            height: ${basePixel * 2}px;
        }
        
        .${cssPrefix}-x3 {
            width: ${basePixel * 3}px;
            height: ${basePixel * 3}px;
        }
    `;
}

function constCssContent(cssPrefix, name, content) {
  return `
        .${cssPrefix}-icon-${name} {
            ${content}
        }
    `;
}

function initFile(cssPrefix, basePixel) {
  fs.openSync("export.css", "w");
  fs.closeSync(fs.openSync("export.css", "w"));
  fs.appendFile("export.css", initCssContent(cssPrefix, basePixel), err => {
    if (err) {
      console.error(err);
      return;
    }
  });
}

let prefix = "";
let size = 36;

readline.question(
  `What's css prefix for your icon? ex: bf => bf-icon \n`,
  val => {
    prefix = val;
    readline.question(
      `What's base size for your icon? ex: 36 => prefix-x2: 36 * 2 prefix-x3: 36 * 3 \n`,
      val => {
        size = val;
        readline.close();
        // init css file
        initFile(prefix, size);

        // read file and generate file
        readFilePath("./svg/").then(res => {
          res.forEach(eachFile => {
            run("./svg/" + eachFile)
              .then(file => {
                let filename = eachFile.replace(/\.[^/.]+$/, "");
                let content = constCssContent(prefix, filename, getStyle(file));
                fs.appendFile("export.css", content, function(err) {
                  if (err) {
                    console.error(err);
                  } else {
                    // done
                  }
                });
              })
              .catch(err => {
                console.error(err);
              });
          });
        });
      }
    );
  }
);
