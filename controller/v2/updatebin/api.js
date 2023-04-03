const { gen } = require("n-digit-token");
const path = require("path");
const Batch = require("../../../models/Batch");
const Bin1 = require("../../../models/Bin1");
const Bin2 = require("../../../models/Bin2");
const Bin3 = require("../../../models/Bin3");
const ESP = require("../../../models/ESP");
const Manufacturer = require("../../../models/Manufacturer");
const OtaTrack = require("../../../models/OtaTrack");

// updating the bin file for given picId and espId for test 1
exports.updateBin1 = async (req, res) => {
  try {
    // finding the esp with espId
    const esps = await ESP.find({ espId: req.query.espId });
    // console.log(esps);
    if (esps.length == 0) {
      res.status(400).json({
        success: false,
        body: "",
        error: `espId is not registered ${req.query.espId}`,
      });
    }
    if(!req.query.picId){
      res.status(400).send({
        success: false,
        body: "",
        error: "pic Id is null"
      })
    }
    // finding the manufacturer with espId
    const manufacturer = await Manufacturer.find({ esps: esps[0]._id });
    // console.log(manufacturer);
    if (manufacturer.length == 0) {
      res.status(400).json({
        success: false,
        body: "",
        error: `manufacturer for espId-${req.query.espId} is not registered`,
      });
    }

    // find the last batch that is added for the manufacturer for adding the picId
    const len = manufacturer[0].batches.length;
    let batch = await Batch.findById(manufacturer[0].batches[len - 1]);
    // console.log(batch)
    // initializated the variable for the
    let binD = null;
    let batchId = null;
    // checking the batch is null or not
    if (batch == null) {
      res.status(400).json({
        success: false,
        body: "",
        error: `there is no batch for given manufacturer`,
      });
    }
    // else if the data is present
    else {
      // checking the picId length is not exceeding and picId is present or not
      if (batch.picIds.length <= 20 && batch.picIds.includes(req.query.picId)) {
        console.log("if");
        binD = await Bin1.find({ batch: batch._id })
          .sort({ addedDate: -1 })
          .limit(1);
        batchId = batch._id;
        // console.log(binD)
        // bin file is present or not
        if (binD.length == 0) {
          res.status(400).json({
            success: false,
            body: "",
            error: `bin file for batchId-${batch._id} is not present`,
          });
        }
      }
      // if the picid length in batch is exceeding and new batch is not present also
      else if (
        batch.picIds.length == 20 &&
        !batch.picIds.includes(req.query.picId)
      ) {
        console.log("else if");
        batchId = batch._id;
        // storing the bid
        let bid = gen(8);
        // creating the batch for storing the batch picId
        batch = await Batch.create({
          name: `Batch${len + 1}`,
          BID: bid,
        });
        // saving the batch into the manufacturer
        manufacturer[0].batches.push(batch._id);
        // saving the picId into the batch
        batch.picIds.push(req.query.picId);
        // saving the manufacturer and batch
        await manufacturer[0].save();
        await batch.save();
        // checking updating the old bin file with new batch Id
        binD = await Bin1.find({ batch: batchId })
        .sort({ addedDate: -1 })
        .limit(1);
        if (binD.length == 0) {
          res.status(400).json({
            success: false,
            body: "",
            error: `there is no bin file for ${batch._id}`,
          });
        }
        
        //updating the values with new batch id
        binD[0].batch = batch._id;
        await binD[0].save()
        console.log("batch bid-",batch.BID);
      }
      // both the if statement are wrong
      else {
        console.log("else");
        // storing the picId with existing batch id
        batch.picIds.push(req.query.picId);
        await batch.save()
        // finding the bin file for given batch
        binD = await Bin1.find({ batch: batch._id })
          .sort({ addedDate: -1 })
          .limit(1);
        if (binD.length == 0) {
          res.status(400).json({
            success: false,
            body: "",
            error: `there is no bin bile for ${batch._id}`,
          });
        }
      }

      // finding the ota Item for updating the file that are made
      let otaItem = await OtaTrack.findOne({ picId: req.query.picId });
      // console.log(otaItem);
      if (otaItem) {
        const val = otaItem.binVersion || "0000";
        // updating the otatracker if the bin file is updated
        await otaItem.updateOne({
          otaDate: new Date(),
          prevBinVersion: val,
          binVersion: binD[0].v,
        });
      } else {
        // creating the ota track if the picId is not present
        await OtaTrack.create({
          picId: req.query.picId,
          binVersion: binD[0].v,
          espId: esps[0]._id,
          batchId: batch._id,
        });
      }
    }
    let up = {
      headers: {
        batchId: batch.BID,
        codeVersion: binD[0].v,
      },
    };
    console.log(`updating the pic with id ${req.query.picId}`);
    res
      .status(200)
      .sendFile(`${process.env.FILE_UPLOAD_PATH1}//${binD[0].path}`, up);
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      body: "",
      error: error.message,
    });
  }
};

// in params query we are giving batchId, picId, codeVersion, espId for the no Code
exports.updateBin2 = async (req, res) => {
  try {
    // find the esp with espID in the query
    const esps = await ESP.find({ espId: req.query.espId });
    // response is the esp is empty
    if (esps.length == 0) {
      res.status(400).json({
        success: false,
        body: "",
        error: `esps Id is not present ${req.query.espId}`,
      });
    }

    // checking the manufacturer is present for given espIds
    const manufacturer = await Manufacturer.find({
      esps: { $in: esps[0]._id },
    });

    // manufacturer is present or not
    if (manufacturer.length == 0) {
      res.status(400).json({
        success: false,
        body: "",
        error: `EspId-${req.body.espId} is not present in manufacturer`,
      });
    }

    // we
    let b = await Batch.find({BID: req.query.batchId});
    console.log(b);
    let binD = null;
    let batch = await b[0]
    if (batch == null) {
      res.status(400).send({
        success: false,
        body: "",
        error: `batch-${req.query.batchid} is not registrated`,
      });
    } else {
      // batch picId is check for batchId is full or not and picId is present or not
      if (batch.picIds.length <= 20 && batch.picIds.includes(req.query.picId)) {
        // bin file is present for given batch or not
        console.log("if");
        binD = await Bin2.find({ batch: batch._id })
          .sort({ addedDate: -1 })
          .limit(1);

        if (binD.length == 0) {
          res.status(400).send({
            success: false,
            body: "",
            error: `bin file for given batch-${batch._id} is present`,
          });
        }
      }
      // checking the length of pic in more than and pic id is not present
      else if (
        batch.picIds.length == 20 &&
        !batch.picIds.includes(req.query.picId)
      ) {
        console.log("else if");
        // length of manufacturer for batch name
        let len = manufacturer[0].batches.length;
        let batchId = batch._id;
        let bid = gen(8);
        batch = await Batch.create({
          name: `Batch${len + 1}`,
          BID: bid,
        });

        manufacturer[0].batches.push(batch._id);
        await manufacturer[0].save();
        batch.picIds.push(req.query.picId);
        await batch.save();
        console.log("batch bid-",batch.BID);
        binD = await Bin2.find({
          batch: batchId,
          v: String(req.query.v).padStart(4, "0"),
        })
          .sort({ addedDate: -1 })
          .limit(1);

          if (binD.length == 0) {
            res.status(400).json({
              success: false,
              body: "",
              error: `there is no bin file for ${batch._id}`,
            });
          }
        // updating the batch of bin file
        binD[0].batch = batch._id;
        await binD[0].save()
      }
      // else when both the if statement is false
      else {
        console.log("else");
        // batch is adding picId
        batch.picIds.push(req.query.picId);
        await batch.save();
        binD = await Bin2.find({
          batch: batch._id,
          v: String(req.query.v).padStart(4, "0"),
        })
          .sort({ addedDate: -1 })
          .limit(1);

        // batch is
        if (binD.lenght == 0) {
          res.status(400).send({
            success: false,
            body: "",
            error: `Bins file is not present batch-${batch._id}`,
          });
        }
      }
    }

    const otaItem = await OtaTrack.findOne({ picId: req.query.picId });
    if (otaItem) {
      const val = otaItem.binVersion;
      await otaItem.updateOne({
        otaDate: new Date(),
        prevBinVersion: val,
        binVersion: binD[0].v,
      });
    } else {
      await OtaTrack.create({
        picId: req.query.picId,
        binVersion: binD[0].v,
        espId: esps[0]._id,
        batchId: batch._id,
      });
    }
    
    // sending the file and
    console.log(`updated pic with id-${req.query.picId}`);
    res
      .status(200)
      .sendFile(`${process.env.FILE_UPLOAD_PATH2}//${binD[0].path}`);
  } catch (error) {
    console.log(error.message);
    res.status(500).send({
      success: false,
      body: "",
      error: error.message,
    });
  }
};

//  in params query we are giving batchId, picId, codeVersion, espId for the application code
exports.updateBin3 = async (req, res) => {
  try {
    // find the esp with espID in the query
    const esps = await ESP.find({ espId: req.query.espId });
    // response is the esp is empty
    if (esps.length == 0) {
      res.status(400).json({
        success: false,
        body: "",
        error: `esps Id is not present ${req.query.espId}`,
      });
    }

    // checking the manufacturer is present for given espIds
    const manufacturer = await Manufacturer.find({
      esps: { $in: esps[0]._id },
    });

    // manufacturer is present or not
    if (manufacturer.length == 0) {
      res.status(400).json({
        success: false,
        body: "",
        error: `EspId-${req.body.espId} is not present in manufacturer`,
      });
    }

    // we
    let b = await Batch.find({BID: req.query.batchId});
    let binD = null;
    let batch = await b[0];
    if (batch == null) {
      res.status(400).send({
        success: false,
        body: "",
        error: `batch-${req.query.batchid} is not registrated`,
      });
    } else {
      // batch picId is check for batchId is full or not and picId is present or not
      if (batch.picIds.length <= 20 && batch.picIds.includes(req.query.picId)) {
        // bin file is present for given batch or not
        console.log("if");
        binD = await Bin3.find({ batch: batch._id })
          .sort({ addedDate: -1 })
          .limit(1);

        if (binD.length == 0) {
          res.status(400).send({
            success: false,
            body: "",
            error: `bin file for given batch-${batch._id} is present`,
          });
        }
      }
      // checking the length of pic in more than and pic id is not present
      else if (
        batch.picIds.length == 20 &&
        !batch.picIds.includes(req.query.picId)
      ) {
        console.log("else if");
        // length of manufacturer for batch name
        let len = manufacturer[0].batches.length;
        let batchId = batch._id;
        let bid = gen(8);
        batch = await Batch.create({
          name: `Batch${len + 1}`,
          BID: bid,
        });

        manufacturer[0].batches.push(batch._id);
        await manufacturer[0].save();
        batch.picIds.push(req.query.picId);
        await batch.save();
        console.log("batch bid is change:- ",batch.BID);
        binD = await Bin3.find({
          batch: batchId,
          v: String(req.query.v).padStart(4, "0"),
        })
          .sort({ addedDate: -1 })
          .limit(1);
        // updating the batch of bin file
        binD[0].batch = batch._id;
        await binD[0].save()
      }
      // else when both the if statement is false
      else {
        console.log("else");
        // batch is adding picId
        batch.picIds.push(req.query.picId);
        await batch.save();
        binD = await Bin3.find({
          batch: batch._id,
          v: String(req.query.v).padStart(4, "0"),
        })
          .sort({ addedDate: -1 })
          .limit(1);

        // batch is
        if (binD.lenght == 0) {
          res.status(400).send({
            success: false,
            body: "",
            error: `Bins file is not present batch-${batch._id}`,
          });
        }
      }
    }

    const otaItem = await OtaTrack.findOne({ picId: req.query.picId });
    if (otaItem) {
      const val = otaItem.binVersion;
      await otaItem.updateOne({
        otaDate: new Date(),
        prevBinVersion: val,
        binVersion: binD[0].v,
      });
    } else {
      await OtaTrack.create({
        picId: req.query.picId,
        binVersion: binD[0].v,
        espId: esps[0]._id,
        batchId: batch._id,
      });
    }

    // sending the file and
    console.log(`updated pic with id-${req.query.picId}`);
    res
      .status(200)
      .sendFile(`${process.env.FILE_UPLOAD_PATH3}//${binD[0].path}`);
  } catch (error) {
    console.log(error.message);
    res.status(500).send({
      success: false,
      body: "",
      error: error.message,
    });
  }
};
