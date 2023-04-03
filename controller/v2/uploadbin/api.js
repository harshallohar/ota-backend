const path = require("path");
const Batch = require("../../../models/Batch");
const Bin1 = require("../../../models/Bin1");
const Bin2 = require("../../../models/Bin2");
const Bin3 = require("../../../models/Bin3");

// uploading the first cb code
exports.uploadBin1 = async (req, res) => {
  try {
    // checking the files are uploaded or not
    if (!req.files) {
      res.status(400).json({
        success: false,
        body: "",
        error: "Please a bin file for further processing",
      });
    }

    //checking the file size and store the file as variable,
    const file = req.files.bin;

    if (file.size > process.env.FILE_MAX_SIZE) {
      res.status(400).json({
        sucess: false,
        body: "",
        error: "The size excceding the limit of storage",
      });
    }

    // for storing the current bin file

    // storing the name to an unique name
    const ext = path.extname(file.name);
    file.name = `bin-${String(req.body.v).padStart(4, "0")}`;

    // finding the batch with batchId and stored the batch id for storing the file and path of the file.
    const batch = await Batch.find({ _id: req.body.batchId });
    if (!batch) {
      res.status(400).json({
        success: "false",
        body: "",
        error: `batch is not present-${req.body.batchId}`,
      });
    }
    // console.log(batch);
    // creating the bin Document and store the file on the server and get the value in
    let binDoc = await Bin1.find({ batch: batch[0]._id })
      .sort({ addedDate: -1 })
      .limit(1);

    if (binDoc.length == 0) {
      binDoc = await Bin1.create({
        addedDate: new Date(),
        v: String(req.body.v).padStart(4, "0"),
        path: file.name + ext,
        batch: batch[0]._id,
      });
    } else {
      await binDoc[0].updateOne({
        path: file.name + ext,
        v: String(req.body.v).padStart(4, "0"),
        addedDate: new Date(),
      });
    }

    // saving the file into the public folder after the bin doc is created or uploaded
    file.mv(
      `${process.env.FILE_UPLOAD_PATH1}//${file.name}${ext}`,
      async (err) => {
        if (err) {
          res.status(400).json({
            sucess: false,
            body: "",
            error: "Server error happened, Please try again",
          });
        }

        // after the value is successfully updated and uploaded too
        res.status(200).json({
          success: true,
          body: binDoc,
          error: "",
        });
      }
    );
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      body: "",
      error: error.message,
    });
  }
};

// uploading the 2nd no load code
exports.uploadBin2 = async (req, res) => {
  try {
    // checking the files are uploaded or not
    if (!req.files) {
      res.status(400).json({
        success: false,
        body: "",
        error: "Please a bin file for further processing",
      });
    }

    //checking the file size and store the file as variable,
    const file = req.files.bin;

    if (file.size > process.env.FILE_MAX_SIZE) {
      res.status(400).json({
        sucess: false,
        body: "",
        error: "The size excceding the limit of storage",
      });
    }

    // for storing the current bin file

    // storing the name to an unique name
    const ext = path.extname(file.name);
    file.name = `bin-${String(req.body.v).padStart(4, "0")}`;

    // finding the batch with batchId and stored the batch id for storing the file and path of the file.
    const batch = await Batch.find({ _id: req.body.batchId });
    if (!batch) {
      res.status(400).json({
        success: "false",
        body: "",
        error: `batch is not present-${req.body.batchId}`,
      });
    }
    console.log(batch[0].BID)
    // console.log(batch);
    // creating the bin Document and store the file on the server and get the value in
    let binDoc = await Bin2.find({ batch: batch[0]._id })
      .sort({ addedDate: -1 })
      .limit(1);

    if (binDoc.length == 0) {
      binDoc = await Bin2.create({
        addedDate: new Date(),
        v: String(req.body.v).padStart(4, "0"),
        path: file.name + ext,
        batch: batch[0]._id,
      });
    } else {
      await binDoc[0].updateOne({
        path: file.name + ext,
        v: String(req.body.v).padStart(4, "0"),
        addedDate: new Date(),
      });
    }

    // saving the file into the public folder after the bin doc is created or uploaded
    file.mv(
      `${process.env.FILE_UPLOAD_PATH2}//${file.name}${ext}`,
      async (err) => {
        if (err) {
          res.status(400).json({
            sucess: false,
            body: "",
            error: "Server error happened, Please try again",
          });
        }

        // after the value is successfully updated and uploaded too
        res.status(200).json({
          success: true,
          body: binDoc,
          error: "",
        });
      }
    );
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      body: "",
      error: error.message,
    });
  }
};

// uploading the 3rd application code
exports.uploadBin3 = async (req, res) => {
  try {
    // checking the files are uploaded or not
    if (!req.files) {
      res.status(400).json({
        success: false,
        body: "",
        error: "Please a bin file for further processing",
      });
    }

    //checking the file size and store the file as variable,
    const file = req.files.bin;

    if (file.size > process.env.FILE_MAX_SIZE) {
      res.status(400).json({
        sucess: false,
        body: "",
        error: "The size excceding the limit of storage",
      });
    }

    // for storing the current bin file

    // storing the name to an unique name
    const ext = path.extname(file.name);
    file.name = `bin-${String(req.body.v).padStart(4, "0")}`;

    // finding the batch with batchId and stored the batch id for storing the file and path of the file.
    const batch = await Batch.find({ _id: req.body.batchId });
    if (!batch) {
      res.status(400).json({
        success: "false",
        body: "",
        error: `batch is not present-${req.body.batchId}`,
      });
    }
    // console.log(batch);
    // creating the bin Document and store the file on the server and get the value in
    let binDoc = await Bin3.find({ batch: batch[0]._id })
      .sort({ addedDate: -1 })
      .limit(1);

    if (binDoc.length == 0) {
      binDoc = await Bin3.create({
        addedDate: new Date(),
        v: String(req.body.v).padStart(4, "0"),
        path: file.name + ext,
        batch: batch[0]._id,
      });
    } else {
      await binDoc[0].updateOne({
        path: file.name + ext,
        v: String(req.body.v).padStart(4, "0"),
        addedDate: new Date(),
      });
    }

    // saving the file into the public folder after the bin doc is created or uploaded
    file.mv(
      `${process.env.FILE_UPLOAD_PATH3}//${file.name}${ext}`,
      async (err) => {
        if (err) {
          res.status(400).json({
            sucess: false,
            body: "",
            error: "Server error happened, Please try again",
          });
        }

        // after the value is successfully updated and uploaded too
        res.status(200).json({
          success: true,
          body: binDoc,
          error: "",
        });
      }
    );
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      body: "",
      error: error.message,
    });
  }
};
