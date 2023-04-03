const {
  addingSingleManufacturer,
  addSingleEsp,
  getAllManufacturers,
  getBatches,
  getPicsForBatch,
  espforSingleManufacturer,
  deleteSingleManufacturer,
  deleteSingleBatch,
  getTestCase,
  getTestCase2,
  getTestCase3,
} = require("../controller/v2/api");
const {
  updateBin1,
  updateBin2,
  updateBin3,
} = require("../controller/v2/updatebin/api");
const {
  uploadBin1,
  uploadBin2,
  uploadBin3,
} = require("../controller/v2/uploadbin/api");

const router = require("express").Router();

router.post("/addSingleManufacturer", addingSingleManufacturer);

router.post("/addSingleEsp", addSingleEsp);

// router.post("/addSinglePic", addSinglePic);

router.get("/getAllManufacturers", getAllManufacturers);

router.get("/getBatchesforManufacturer", getBatches);

router.get("/getPicsforBatches", getPicsForBatch);

router.get("/getESPforSingleManufacturer", espforSingleManufacturer);

// deleting the datas
router.delete("/deleteManufacturer", deleteSingleManufacturer);

router.delete("/deleteBatch", deleteSingleBatch);

// test 1 routes
router.get("/test1", updateBin1);
router.post("/uploadtest-1", uploadBin1);
router.get("/report", getTestCase);
// test 2 routes
router.get("/test2", updateBin2);
router.post("/uploadtest-2", uploadBin2);
router.get("/report2", getTestCase2);

// test final routes
router.get("/test3", updateBin3);
router.post("/uploadtest-3", uploadBin3);
router.get("/report3", getTestCase3);

module.exports = router;
