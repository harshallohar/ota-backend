// verison 2 route 1
const Batch = require("../../models/Batch");
const ESP = require("../../models/ESP");
const Manufacturer = require("../../models/Manufacturer");
const OtaTrack = require("../../models/OtaTrack");
const { gen } = require("n-digit-token");
// in this we are creating the espid, name with manufacturer id
exports.addSingleEsp = async (req, res) => {
  try {
    const manufacturer = await Manufacturer.find({
      _id: req.body.manufacturerId,
    });
    if (manufacturer.length == 0) {
      res.status(400).json({
        success: false,
        body: "The manufacturer id is not present",
        error: "",
      });
    }
    if(manufacturer){
      const esp = await ESP.create({
        name: req.body.name,
        espId: req.body.espId,
      });
  
      manufacturer[0].esps.push(esp._id);
      await manufacturer[0].save();
      res.status(200).json({
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
}

exports.addingSingleManufacturer = async (req, res) => {
  try {
    // console.log(uupid("apt"));
    // // console.log(req.body);
    const manu = await Manufacturer.create({
      name: req.body.name,
      id: req.body.id,
      password: req.body.password,
      description: req.body.desc,
    });
    if (manu) {
      const batch = await Batch.create({ name: "Batch1", BID: gen(8) });
      manu.batches.push(batch._id);
      await manu.save();
      res.json({
        success: true,
        body: "",
        error: "",
      });
    } else {
      res.status(400).send({
        success: false,
        body: "",
        error: "manufacturer is not added",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      body: "",
      error: error.message,
    });
  }
};

exports.getAllManufacturers = async(req, res)=>{
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
}
exports.getBatches = async (req, res)=>{
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
}
// getting the pics for batches
exports.getPicsForBatch = async (req, res)=>{
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
}

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

// deleting the datas
exports.deleteSingleManufacturer = async (req, res)=>{
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
}

exports.deleteSingleBatch = async (req, res)=>{
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
}
exports.espforSingleManufacturer = async (req, res)=>{
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
}