const OtaTrack = require("../models/OtaTrack");
const Bin = require("../models/Bin1");
const ErrorResponse = require("../utils/ErrorResponse");
const asyncHandler = require("../utils/asyncHandler");
const path = require("path");
const ESP = require("../models/ESP");
const Batch = require("../models/Batch");
const Manufacturer = require("../models/Manufacturer");

/**
 * @desc
 * retrive all pic ids that are updated
 */
exports.updateStatus = asyncHandler(async (req, res, next) => {
  const updatedPics = await OtaTrack.find();
  res.status(200).json({
    success: true,
    body: updatedPics,
    error: "",
  });
});

//searches for the latest binary added for the batch
exports.getUpdate = asyncHandler(async (req, res, next) => {
  if (!req.query.espId || !req.query.batchName || !req.query.picId) {
    throw new ErrorResponse(`illegal format of request`, 400);
  }
  const esp = await ESP.findOne({ espId: req.query.espId });
  if (!esp) {
    throw new ErrorResponse(`esp with id: ${req.query.espId} not found`, 403);
  }
  const batch = await Batch.findOne({ name: req.query.batchName });
  if (!batch) {
    throw new ErrorResponse(
      `batch with name: ${req.query.batchName} not found`,
      403
    );
  }
  if (batch.picIds.includes(req.query.picId)) {
    const binDocument = await Bin.find({ batch: batch._id })
      .sort({ addedDate: -1 })
      .limit(1);
    if (binDocument.length === 0) {
      throw new ErrorResponse(`binary file doesn't exist`, 404);
    }
    // check if picId exists
    const otaItem = await OtaTrack.findOne({ picId: req.query.picId });
    if (otaItem) {
      // update the date
      otaItem.otaDate = new Date();
      otaItem.prevBinVersion = otaItem.binVersion;
      otaItem.binVersion = binDocument[0]._id;
      await otaItem.save();
    } else {
      await OtaTrack.create({
        picId: req.query.picId,
        binVersion: binDocument[0]._id,
        espId: esp.id,
        batchId: batch.id,
        prevBinVersion: binDocument[0]._id,
      });
    }
    console.log(`updated pic with id ${req.query.picId}`);
    res.sendFile(`${process.env.FILE_UPLOAD_PATH}//${binDocument[0].path}`);
  } else {
    return next(
      new ErrorResponse(`pic id : ${req.query.picId} not found`, 403)
    );
  }
});

exports.uploadBin = asyncHandler(async (req, res, next) => {
  if (!req.files) {
    return next(new ErrorResponse("please upload a file", 400));
  }
  // console.log(req.files,"  ", req.body.v,req.body.batchId)
  const file = req.files.bin;
  // file validations
  // file type
  // file size
  if (file.size > process.env.FILE_MAX_SIZE) {
    return next(new ErrorResponse("the file is too large(< 1 MB)", 400));
  }
  // changing the file name to an unique name
  const ext = path.extname(file.name);
  file.name = `bin-${req.body.v}`;
  // return res.status(200).json();
  //check whether batch exists
  const batch = await Batch.findById(req.body.batchId);
  if (!batch) {
    throw new ErrorResponse(
      `batch with id : ${req.body.batchId} doesn't exist`,
      400
    );
  }
  const bin = await Bin.create({
    addedDate: new Date(),
    v: req.body.v,
    path: file.name + ext,
    batch: batch.id,
  });
  file.mv(
    `${process.env.FILE_UPLOAD_PATH}//${file.name}${ext}`,
    async (err) => {
      if (err) {
        throw new ErrorResponse(
          "server error happened, please try again later",
          500
        );
      }
      //added this for frontend
      res.status(200).json({
        success: true,
        body: "",
        error: "",
      });
      //return res.render("binSuccess", { file, bin, batch });
    }
  );
});

exports.addSingleManufacturer = asyncHandler(async (req, res, next) => {
  try {
    // console.log(req.body);
    const manu = await Manufacturer.create({
      name: req.body.name,
      id: req.body.id,
      password: req.body.password,
      description: req.body.desc,
    });
    const batch = await Batch.create({name: "Batch1"})
    manu.batches.push(batch._id);
    await manu.save();
    res.json({
      success: true,
      body: manu,
      error: ""
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      body: "",
      error: error.message,
    });
  }
});

//check whether batch with same name exists under a manufacturer
exports.addSingleBatch = asyncHandler(async (req, res, next) => {
  const manufacturer = await Manufacturer.findById(req.body.manufacturerId);
  if (!manufacturer) {
    throw new ErrorResponse(
      `manufacturer with ${req.body.manufacturerId}`,
      404
    );
  } else if (
    await Batch.findOne({
      _id: { $in: manufacturer.batches },
      name: req.body.name,
    })
  ) {
    throw new ErrorResponse(
      `batch with name: ${req.body.name} for a manufacturer already exist`,
      404
    );
  } else {
    const newBatch = await Batch.create({ name: req.body.name });
    manufacturer.batches.push(newBatch._id);
    await manufacturer.save();
    res.json({
      success: true,
      body: "",
      error: "",
    });
  }
});

exports.addSingleEsp = asyncHandler(async (req, res, next) => {
  try {
    const manufacturer = await Manufacturer.findById(req.body.manufacturerId);
    if (!manufacturer) {
      throw new Error(
        `manufacturer with ${req.body.manufacturerId} doesn't exist`
      );
    } else if (await ESP.findOne({ name: req.body.name })) {
      throw new Error(`esp with name: ${req.body.name} already exist`);
    } else if (await ESP.findOne({ espId: req.body.espId })) {
      throw new Error(`esp with id: ${req.body.name} already exist`);
    } else {
      const newEsp = await ESP.create({
        name: req.body.name,
        espId: req.body.espId,
      });
      manufacturer.esps.push(newEsp._id);
      await manufacturer.save();
      res.json({
        success: true,
        body: "",
        error: "",
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      body: "",
      error: error.message,
    });
  }
});

exports.addSinglePic = asyncHandler(async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.body.batchId);
    if (!batch) {
      throw new Error(`batch with ${req.body.batchId} doesn't exist`);
    } else if (batch.picIds.includes(req.body.name)) {
      throw new Error(
        `pic with name: ${req.body.name} already exist in the batch`
      );
    } else {
      batch.picIds.push(req.body.name);
      await batch.save();
      res.json({
        success: true,
        body: "",
        error: "",
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      body: "",
      error: error.message,
    });
  }
});

exports.getAllManufacturers = asyncHandler(async (req, res, next) => {
  try {
    const manufacturers = await Manufacturer.find();
    // console.log(manufacturers);
    let manu = manufacturers.filter((e) => e.type != "admin");
    // console.log(i);
    res.status(200).json({
      success: true,
      body: manu,
      error: "",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      body: "",
      error: error.message,
    });
  }
});

exports.getBatches = asyncHandler(async (req, res, next) => {
  // console.log("InBatches");
  try {
    // console.log(req.query.manufacturerId);
    const manufacturer = await Manufacturer.findById(req.query.manufacturerId);
    // console.log(manufacturer);
    if (manufacturer) {
      if (manufacturer.batches.length === 0) {
        res.json({
          success: true,
          body: [],
          error: "",
        });
      } else {
        const batches = await Batch.find({
          _id: {
            $in: manufacturer.batches,
          },
        });
        res.status(200).json({
          success: true,
          body: batches,
          error: "",
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      body: "",
      error: "internal server error",
    });
  }
});

exports.getPicsForBatch = asyncHandler(async (req, res, next) => {
  try {
    console.log(req.query.id);
    let obj = {};
    let singleBatch = await Batch.findById(req.query.id);
    let updatedMapped = {};
    if (singleBatch) {
      const updatedPics = await OtaTrack.find({ batchId: singleBatch._id })
        .populate("prevBinVersion", "v")
        .populate("binVersion", "v")
        .exec();
      const updatedOnlyPicIds = updatedPics.map((val) => val.picId);
      updatedPics.forEach((val) => {
        updatedMapped[val.picId] = val;
      });
      obj["projectedPics"] = singleBatch.picIds.map((val) => {
        if (updatedOnlyPicIds.includes(val)) {
          return { ...updatedMapped[val]._doc, picId: val, updated: true };
        } else {
          return { picId: val, updated: false };
        }
      });
    }
    // singleBatch.projectedPic = obj["projectedPics"];
    // console.log(singleBatch, obj);
    res.json({
      success: true,
      body: { singleBatch, projectedPics: obj },
      error: "",
    });
  } catch (error) {
    res.json({
      success: false,
      body: "",
      error: error.message,
    });
  }
});

// deleting the api
exports.deleteSingleManufacturer = asyncHandler(async (req, res, next) => {
  try {
    console.log(req.query.mid);
    let success = false;
    let manu = await Manufacturer.findById(req.query.mid);
    if (manu) {
      manu = await Manufacturer.findByIdAndDelete(req.query.mid);
      success = true;
      res.status(200).json({ success, manu });
    } else {
      res.status(404).json({ success, error: "Value ID id Not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ values: "Internal Server Error", error: error.message });
  }
});

// delete the batch
exports.deleteSingleBatch = asyncHandler(async (req, res, next) => {
  try {
    console.log(req.query.bid);
    let batch = await Batch.findById(req.query.bid);
    if (batch) {
      await Batch.findByIdAndDelete(req.query.bid);
      let manu = await Manufacturer.findOne({ batches: req.query.bid });
      let index = manu.batches.indexOf(req.query.bid);
      manu.batches.splice(index, 1);
      await manu.save();
      res.json({
        success: true,
        body: [manu],
        error: "",
      });
    } else {
      res.status(404).json({
        success: false,
        body: "",
        error: "The value is not Present",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      body: "",
      error: error.message,
    });
    console.log(error.message);
  }
});

exports.espforSingleManufacturer = asyncHandler(async (req, res, next) => {
  try {
    console.log(req.query.manufacturerId);
    const manufacturer = await Manufacturer.find({
      _id: req.query.manufacturerId,
    });
    console.log(manufacturer[0].esps);
    const esp = await ESP.find({ _id: { $in: manufacturer[0].esps } });
    console.log(esp);
    if (esp != null) {
      res.status(200).json({
        success: true,
        body: esp,
        error: "",
      });
    } else {
      res.status(200).json({
        success: true,
        body: "",
        error: "",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      body: "",
      error: error.message,
    });
    // console.log(error.message);
  }
});
