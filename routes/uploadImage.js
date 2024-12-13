"use strict";

const express = require("express");
const { Storage } = require('@google-cloud/storage');
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')
const fs = require('fs');
const { ensureLoggedIn } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");

const upload = multer({ dest: 'uploads/' })
const router = new express.Router();
const storage = new Storage();
const BUCKET_NAME = 'meetupcyclist';

router.post("/", ensureLoggedIn, upload.single('image'), async function (req, res, next) {
  const filePath = req?.file?.path;
  const destFileName = uuidv4();
  try {
    if (!filePath || typeof filePath !== 'string') {
      throw new BadRequestError('No file uploaded')
    }
    // throw error if file is > 5MB
    if (req.file.size > 5 * 1024 * 1024) {
      throw new BadRequestError('File is too large')
    }

    await storage.bucket(BUCKET_NAME).upload(filePath, { destination: destFileName, predefinedAcl: 'publicRead' });
    await fs.promises.unlink(filePath);
    return res.json({ data: `https://storage.googleapis.com/${BUCKET_NAME}/${destFileName}` });
  } catch (err) {
    await fs.promises.unlink(filePath);
    return next(err);
  }
});


module.exports = router;
