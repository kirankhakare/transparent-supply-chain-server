const ImageKit = require('imagekit');
const fs = require('fs');

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

exports.uploadImage = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ message: 'Image required' });
    }

    // 🔥 base64 upload (expo compatible)
    const upload = await imagekit.upload({
      file: image,
      fileName: `delivery_${Date.now()}.jpg`,
      folder: 'deliveries',
    });

    res.json({ url: upload.url });
  } catch (err) {
    console.error('IMAGE UPLOAD ERROR', err);
    res.status(500).json({ message: 'Upload failed' });
  }
};
