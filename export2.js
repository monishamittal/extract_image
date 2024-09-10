const fs = require('fs');
const axios = require('axios');

const array = require("./ar.json");

async function downloadImages(array) {
  for (const obj of array) {
    const folderName = formatFolderName(obj.name);
    await makeDir(folderName);

    const keys = Object.keys(obj);
    for (const key of keys) {
      if (key !== '_id' && typeof obj[key] === 'string' && isImageUrl(obj[key])) {
        const imageName = `${folderName}-${key}.jpg`;
        await downloadImage(obj[key], imageName, folderName);
        obj[key] = `./images/${folderName}/${imageName}`;
      } else if (key === 'screenshots' && Array.isArray(obj[key])) {
        for (let i = 0; i < obj[key].length; i++) {
          const imageName = `${folderName}-screenshot-${i + 1}.jpg`;
          await downloadImage(obj[key][i], imageName, folderName);
          obj[key][i] = `./images/${folderName}/${imageName}`;
        }
      }
    }
  }

  const updatedJSON = JSON.stringify(array, null, 2);
  fs.writeFileSync('updated_ar.json', `module.exports = ${updatedJSON}`);
}

function formatFolderName(folderName) {
  const formattedName = folderName.replace(/[^\w\s]/gi, '_');
  return formattedName.replace(/\s+/g, '_');
}

async function makeDir(name) {
  const fullPath = `./images/${name}`;
  if (!fs.existsSync(fullPath)) {
    try {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`Folder '${fullPath}' created.`);
    } catch (err) {
      console.error(`Error creating '${fullPath}' folder: ${err}`);
    }
  } else {
    console.log(`Folder '${fullPath}' already exists.`);
  }
}

function isImageUrl(url) {
  return /\.(jpg|jpeg|png|gif)$/i.test(url);
}

async function downloadImage(url, imageName, name) {
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
    });

    const path = `./images/${name}/${imageName}`;
    const writer = fs.createWriteStream(path);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`Error downloading ${imageName}: ${error}`);
  }
}

downloadImages(array);
