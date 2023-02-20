const express = require('express')
const router = new express.Router()
const { updateTrack, uploadBin, manufacturers, batches, esps, singleBatch, binFileInfo, singleManufacturer, singleEsp, getBatches } = require('../controller/frontend')

router.get('/', (req, res) => {
  res.render('index')
})

router.get('/updatetrack', updateTrack)

router.get('/uploadBin', uploadBin)

router.get('/manufacturers', manufacturers)

router.get('/manufacturers/:id', singleManufacturer)

router.get('/batches', batches)

router.get('/batches/:id', singleBatch)

router.get('/esps', esps)

router.get('/esps/:id', singleEsp)

router.get('/binfileinfo', binFileInfo)

module.exports = router
