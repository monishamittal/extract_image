const array = require("./en.json")
const fs = require('fs');
const axios = require('axios');


async function downloadImages(array) {
  for (const obj of array) {
    const keys = Object.keys(obj);
    for (const key of keys) {
      const value = obj[key];

      const folder_name = formatFolderName(obj.name)
      await makeDir(folder_name);
      if (key !== 'screenshots' && isImageUrl(value)) {
        const imageName = `${folder_name}-${key}.jpg`; // Creating a unique name for the image
        await downloadImage(value, imageName, folder_name);
      } else if (key === 'screenshots') {
        for (let i = 0; i < value.length; i++) {
          const imageName = `${folder_name}-screenshot-${i + 1}.jpg`; // Unique name for each screenshot
          await downloadImage(value[i], imageName, folder_name);
        }
      }
    }
  }
}

function isImageUrl(url) {
  // Basic check for image URL
  return /\.(jpg|jpeg|png|gif)$/i.test(url);
}

async function makeDir(name) {
  const fullPath = `./images/${name}`;
  if (!fs.existsSync(fullPath)) {
    console.log("done")
    try {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`Folder '${fullPath}' created.`);
    } catch (err) {
      console.error(`Error creating '${fullPath}' folder: ${err}`);
    }
    console.log(`Folder '${fullPath}' created.`);
  } else {
    console.log(`Folder '${fullPath}' already there.`)
  }
}

function formatFolderName(folderName) {
  // Replace special characters with an underscore
  const formattedName = folderName.replace(/[^\w\s]/gi, '_');

  // Replace spaces with underscores
  const finalName = formattedName.replace(/\s+/g, '_');

  return finalName;
}


async function downloadImage(url, imageName, name) {
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
    });

    const path = `./images/${name}/${imageName}`; // Folder where images will be saved
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

// Run the function
downloadImages(array);
