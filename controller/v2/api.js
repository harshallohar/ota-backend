// verison 2 route 1

const Batch = require("../../models/Batch");
const Bin = require("../../models/Bin");
const ESP = require("../../models/ESP");
const Manufacturer = require("../../models/Manufacturer");
const OtaTrack = require("../../models/OtaTrack");
const asyncHandler = require("../../utils/asyncHandler");

// in this we are creating the espid, name with manufacturer id
exports.addSingleEsp = asyncHandler(async (req, res, next) => {
  try {
    const manufacturer = await Manufacturer.find({
      _id: req.query.manufacturerID,
    });
    if (manufacturer.length == 0) {
      res.status(400).json({
        success: false,
        body: "The manufacturer id is not present",
        error: "",
      });
    }
    const esp = await ESP.create({
      name: req.query.espname,
      espId: req.query.espId,
    });
    manufacturer.esps.push(esp._id);
    await manufacturer.save();
    res.status(200).json({
      success: true,
      body: "",
      error: "",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      body: "",
      error: error.message,
    });
  }
});

// route for defining the espid and picid for adding adding into the batch along with manufacturer;
// exports.findManufacturer = asyncHandler(async(req, res, next)=>{
//     try {
//         const manufacturer = await Manufacturer.find({"esps": {$in: req.body.espId}});
//         console.log(manufacturer);
//         const len = await Batch.find();
//         const batch = await Batch.find({picIds: req.body.picIds});
//         if(batch.length!==0){
//             res.status(400).json({
//                 success: false,
//                 body: "",
//                 error: `Pic id is already there ${req.body.picIds} `
//             })
//         }
//         else{
//             if(batch.picIds.length === 10){
//                 batch.create({
//                     name: `Batch${len.length+1}`
//                 });
//                 batch.picIds.push(req.body.picIds);
//                 manufacturer.batches.push(batch._id);
//                 await batch.save();
//                 await manufacturer.save();
//                 res.status(200).json({
//                     success: true,
//                     body: "batch is created and add the value",
//                     error: ""
//                 })
//             }
//             else {
//                 batch.picIds.push(req.body.picIds);
//                 await batch.save();
//                 res.status(200).json({
//                     success: true,
//                     body: "Batch added picId successfully",
//                     error: ""
//                 })
//             }
//         }
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             body: "",
//             error: error.message
//         })
//     }
// })

// test 1
// ota is sending the file to the server and
exports.updateBin = asyncHandler(async (req, res, next) => {
  try {
    const esps = await ESP.find({ espId: req.query.espId });
    console.log(esps);
    if (esps.length == 0) {
      res.status(400).json({
        success: false,
        body: `esps id is not present: ${req.query.espId}`,
        error: "",
      });
    }
    const manufacturer = await Manufacturer.find({
      esps: { $in: esps[0]._id },
    });
    console.log(manufacturer);
    //
    if (manufacturer.length == 0) {
      res.status(400).json({
        success: false,
        body: "Espid is not present in manufacturer",
        error: "",
      });
    }

    const batch = await Batch.find({
      _id: { $in: manufacturer[0].batches[0] },
    });
    console.log(batch);
    if (batch.length == 0) {
      res.status(400).json({
        success: false,
        body: "Picid is not present in batch",
      });
    }
    const binDocument = await Bin.find({ batch: batch[0]._id })
      .sort({ addedDate: -1 })
      .limit(1);
    console.log(binDocument);
    if (binDocument.length == 0) {
      res.status(400).json({
        success: false,
        body: "Bin file is not present",
      });
    }
    const otaItem = await OtaTrack.findOne({ picId: req.query.picId });
    console.log(otaItem);
    if (otaItem) {
      const val = otaItem.binVersion;
      otaItem.otaDate = new Date();
      otaItem.prevBinVersion = val;
      otaItem.binVersion = binDocument[0].v;
      await otaItem.save();
    } else {
      await OtaTrack.create({
        picId: req.query.picId,
        binVersion: binDocument[0].v,
        espId: esps[0]._id,
        batchId: batch[0]._id,
      });
    }

    let up = {
      headers: {
        batchId: batch[0]._id,
        codeVersion: binDocument[0].v,
      },
    };
    console.log(`updated pic with id ${req.query.picId}`);
    res
      .status(200)
      .sendFile(`${process.env.FILE_UPLOAD_PATH}//${binDocument[0].path}`, up);
  } catch (error) {
    res.status(500).json({
      success: false,
      body: "",
      error: error.message,
    });
  }
});

// response after the send the bin files
exports.getTestCase = async (req, res) => {
  try {
    res.status(200).json({
      success: req.body.success,
      body: "",
      error: "",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      body: "",
      error: error.message,
    });
  }
};

// test case 2 starting from here
exports.updateBin2 = asyncHandler(async (req, res, next) => {
  try {
    const esps = await ESP.find({ espId: req.query.espId });
    console.log(esps);
    if (esps.length == 0) {
      res.status(400).json({
        success: false,
        body: `esps id is not present: ${req.query.espId}`,
        error: "",
      });
    }
    const manufacturer = await Manufacturer.find({
      esps: { $in: esps[0]._id },
    });
    console.log(manufacturer);
    //
    if (manufacturer.length == 0) {
      res.status(400).json({
        success: false,
        body: "Espid is not present in manufacturer",
        error: "",
      });
    }

    const binDocument = await Bin.find({
      batch: req.query.batchId,
      v: req.query.v,
    })
      .sort({ addedDate: -1 })
      .limit(1);
    console.log(binDocument);
    if (binDocument.length == 0) {
      res.status(400).json({
        success: false,
        body: "Bin file is not present",
      });
    }
    const otaItem = await OtaTrack.findOne({ picId: req.query.picId });
    console.log(otaItem);
    if (otaItem) {
      const val = otaItem.binVersion;
      otaItem.otaDate = new Date();
      otaItem.prevBinVersion = val;
      otaItem.binVersion = binDocument[0].v;
      await otaItem.save();
    } else {
      await OtaTrack.create({
        picId: req.query.picId,
        binVersion: binDocument[0].v,
        espId: esps[0]._id,
        batchId: req.query.batchId,
      });
    }

    // let up = {
    //   headers: {
    //     batchId: batch[0]._id,
    //     codeVersion: binDocument[0].v,
    //   },
    // };
    console.log(`updated pic with id ${req.query.picId}`);
    res
      .status(200)
      .sendFile(`${process.env.FILE_UPLOAD_PATH}//${binDocument[0].path}`);
  } catch (error) {
    res.status(500).json({
      success: false,
      body: "",
      error: error.message,
    });
  }
});

// response after the send the bin files
exports.getTestCase2 = async (req, res) => {
  try {
    res.status(200).json({
      success: req.body.success,
      body: "",
      error: "",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      body: "",
      error: error.message,
    });
  }
};
// end here

// test case 3 starting from here
exports.updateBin3 = asyncHandler(async (req, res, next) => {
  try {
    const esps = await ESP.find({ espId: req.query.espId });
    console.log(esps);
    if (esps.length == 0) {
      res.status(400).json({
        success: false,
        body: `esps id is not present: ${req.query.espId}`,
        error: "",
      });
    }
    const manufacturer = await Manufacturer.find({
      esps: { $in: esps[0]._id },
    });
    console.log(manufacturer);
    //
    if (manufacturer.length == 0) {
      res.status(400).json({
        success: false,
        body: "Espid is not present in manufacturer",
        error: "",
      });
    }

    const binDocument = await Bin.find({
      batch: req.query.batchId,
      v: req.query.v,
    })
      .sort({ addedDate: -1 })
      .limit(1);
    console.log(binDocument);
    if (binDocument.length == 0) {
      res.status(400).json({
        success: false,
        body: "Bin file is not present",
      });
    }
    const otaItem = await OtaTrack.findOne({ picId: req.query.picId });
    console.log(otaItem);
    if (otaItem) {
      const val = otaItem.binVersion;
      otaItem.otaDate = new Date();
      otaItem.prevBinVersion = val;
      otaItem.binVersion = binDocument[0].v;
      await otaItem.save();
    } else {
      await OtaTrack.create({
        picId: req.query.picId,
        binVersion: binDocument[0].v,
        espId: esps[0]._id,
        batchId: req.query.batchId,
      });
    }

    // let up = {
    //   headers: {
    //     batchId: batch[0]._id,
    //     codeVersion: binDocument[0].v,
    //   },
    // };
    console.log(`updated pic with id ${req.query.picId}`);
    res
      .status(200)
      .sendFile(`${process.env.FILE_UPLOAD_PATH}//${binDocument[0].path}`);
  } catch (error) {
    res.status(500).json({
      success: false,
      body: "",
      error: error.message,
    });
  }
});

// response after the send the bin files
exports.getTestCase3 = async (req, res) => {
  try {
    res.status(200).json({
      success: req.body.success,
      body: "",
      error: "",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      body: "",
      error: error.message,
    });
  }
};
// end here
