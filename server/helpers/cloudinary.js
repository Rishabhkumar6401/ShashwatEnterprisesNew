const cloudinary = require("cloudinary").v2;
const multer = require("multer");

cloudinary.config({
  cloud_name: "draanh89c",
  api_key: "333863789587677",
  api_secret: "ej5qAnaqSfPZ1daFOwUdFWfsMzY",
});

const storage = new multer.memoryStorage();

async function imageUploadUtil(file) {
  const result = await cloudinary.uploader.upload(file, {
    resource_type: "auto", // Automatically determines the resource type
    transformation: [
      { width: 800, height: 600, crop: "limit" }, // Resize to a maximum of 800x600
      { quality: "auto", fetch_format: "auto" } // Automatic quality and format
    ]
  });

  return result;
}


const upload = multer({ storage });

module.exports = { upload, imageUploadUtil };
