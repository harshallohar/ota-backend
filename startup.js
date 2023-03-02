const fs = require("fs/promises");
require("dotenv").config({
  path: "./config/config.env",
});

async function checkAndCreate(dir) {
  try {
    await fs.access(dir);
    console.log(`${dir} already exists`);
  } catch (err) {
    await fs.mkdir(dir);
    console.log(`created: ${dir}`);
  }
}

//sym link means creating link to existing file
async function createSymLink(existing, link) {
  await checkAndCreate(existing);
  try {
    try {
      await fs.access(link);
      await fs.unlink(link);
      console.log("unlinked existing file");
      // await fs.createSymLink(existing, link);
      await fs.symlink(existing, link)
      console.log("created symbolic link", link, "-->", existing);
    } catch (e) {
      await fs.symlink(existing, link);
      console.log("created symbolic link", link, "-->", existing);
    }
  } catch (err) {
    console.log("--> xx", err);
    throw err;
  }
}

module.exports = {createSymLink, checkAndCreate};
