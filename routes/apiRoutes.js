const express = require('express')
const { updateStatus, getUpdate, uploadBin, addSingleManufacturer, getAllManufacturers, getBatches, addSingleBatch, addSingleEsp, addSinglePic, getPicsForBatch, deleteSingleManufacturer, deleteSingleBatch } = require('../controller/api')
const router = new express.Router()

/**
 * auth: false
 * method: get,
 * responsebody: [
 * {
 *      picid, otaDate, binVersion
 * }
 * ]
 */
router.get('/updateStatus', updateStatus)

/**
 * method: post,
 * requestbody: {
 *      buf: <binarybuffer>,
 *      v: <String>
 * }
 */

router.post('/uploadBin', uploadBin)

/**
 * method: get,
 * requestbody : {
 *      emsId: <String>
 *      picId: <String>
 * }
 * responsebody : binaryFile
 */

router.get('/getUpdate', getUpdate)

router.post('/addSingleManufacturer', addSingleManufacturer)

router.post('/addSingleBatch', addSingleBatch)

router.post('/addSingleEsp', addSingleEsp)

router.post('/addSinglePic', addSinglePic)

router.get('/getAllManufacturers', getAllManufacturers)

router.get('/getBatchesforManufacturer', getBatches)

router.get('/getPicsforBatches', getPicsForBatch)

// deleting the datas
router.delete('/deleteManufacturer', deleteSingleManufacturer)

router.delete('/deleteBatch', deleteSingleBatch);

module.exports = router
