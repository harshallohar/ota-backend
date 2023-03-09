const express = require("express");
const {
  updateStatus,
  getUpdate,
  uploadBin,
  addSingleManufacturer,
  getAllManufacturers,
  getBatches,
  addSingleBatch,
  addSingleEsp,
  addSinglePic,
  getPicsForBatch,
  deleteSingleManufacturer,
  deleteSingleBatch,
  espforSingleManufacturer,
} = require("../controller/api");
const { updateBin, getTestCase, updateBin2, getTestCase2, updateBin3, getTestCase3, uploadBin1, uploadBin3, uploadBin2 } = require("../controller/v2/api");
const router = new express.Router();

/**
 * auth: false
 * method: get,
 * responsebody: [
 * {
 *      picid, otaDate, binVersion
 * }
 * ]
 */
router.get("/updateStatus", updateStatus);

/**
 * method: post,
 * requestbody: {
 *      buf: <binarybuffer>,
 *      v: <String>
 * }
 */

router.post("/uploadBin", uploadBin);

/**
 * method: get,
 * requestbody : {
 *      emsId: <String>
 *      picId: <String>
 * }
 * responsebody : binaryFile
 */

router.get("/getUpdate", getUpdate);

router.post("/addSingleManufacturer", addSingleManufacturer);

router.post("/addSingleBatch", addSingleBatch);

router.post("/addSingleEsp", addSingleEsp);

router.post("/addSinglePic", addSinglePic);

router.get("/getAllManufacturers", getAllManufacturers);

router.get("/getBatchesforManufacturer", getBatches);

router.get("/getPicsforBatches", getPicsForBatch);

router.get("/getESPforSingleManufacturer", espforSingleManufacturer);

// deleting the datas
router.delete("/deleteManufacturer", deleteSingleManufacturer);

router.delete("/deleteBatch", deleteSingleBatch);

// test 1 routes
router.get("/test1", updateBin);
router.post('/uploadtest-1', uploadBin1)
router.get("/report", getTestCase);
// test 2 routes
router.get("/test2", updateBin2);
router.post('/uploadtest2', uploadBin2)
router.get("/report2", getTestCase2);

// test final routes
router.get("/test3", updateBin3);
router.post('/uploadtest2', uploadBin3)
router.get("/report3", getTestCase3);

module.exports = router;
