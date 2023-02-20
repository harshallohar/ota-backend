const OtaTrack = require('../models/OtaTrack')
const asyncHandler = require('../utils/asyncHandler')
const Manufacturer = require('../models/Manufacturer')
const Batch = require('../models/Batch')
const ESP = require('../models/ESP')
const Bin = require('../models/Bin')

//page: get information about all updated PICs
exports.updateTrack = asyncHandler(async (req, res, next) => {
  const trackItems = await OtaTrack.find().populate('binVersion', 'v').exec()
  res.render('updateTrack', {
    trackItems
  })
})

//page: to add new binaries
exports.uploadBin = asyncHandler(async (req, res, next) => {
  const manufacturers = await Manufacturer.find()
  res.render('binUpload', { manufacturers })
})

//page: info about single manufacturer
exports.singleManufacturer = asyncHandler(async (req, res, next) => {
  const manufacturer = await Manufacturer.findById(req.params.id)
  const batches = await Batch.find({ _id: { '$in': manufacturer.batches } })
  const esps = await ESP.find({ _id: { '$in': manufacturer.esps } })
  res.render('singleManufacturer', { manufacturer, batches, esps })
})

//page: manufacturer list
exports.manufacturers = asyncHandler(async (req, res, next) => {
  const manufacturerList = await Manufacturer.find()
  res.render('manufacturer', { manufacturerList })
})

//page: batch list
exports.batches = asyncHandler(async (req, res, next) => {
  const batchList = await Batch.find()
  res.render('batch', { batchList })
})

//page: single batch
exports.singleBatch = asyncHandler(async (req, res, next) => {
  let singleBatch = await Batch.findById(req.params.id)
  let updatedMapped = {}
  if (singleBatch) {
    const updatedPics = await OtaTrack.find({ batchId: singleBatch._id }).populate('prevBinVersion', 'v').populate('binVersion', 'v').exec()
    const updatedOnlyPicIds = updatedPics.map((val) => val.picId)
    updatedPics.forEach((val) => {
      updatedMapped[val.picId] = val
    })
    singleBatch.projectedPics = singleBatch.picIds.map((val) => {
      if (updatedOnlyPicIds.includes(val)) {
        return { ...updatedMapped[val]._doc, picId: val, updated: true }
      } else {
        return { picId: val, updated: false }
      }
    })
  }
  res.render('singleBatch', { singleBatch })
})

//page: esp list
exports.esps = asyncHandler(async (req, res, next) => {
  const espList = await ESP.find()
  res.render('esps', { espList })
})

//page: binary file information
exports.binFileInfo = asyncHandler(async (req, res, next) => {
  const binFileList = await Bin.aggregate([
    {
      $lookup: {
        from: 'batches',
        localField: 'batch',
        foreignField: '_id',
        as: 'result'
      }
    },
    {
      $project: {
        name: '$name',
        batch: {
          '$arrayElemAt': [
            '$result.name', 0
          ],
        },
        batchId: {
          '$arrayElemAt': [
            '$result._id', 0
          ]
        },
        path: '$path',
        v: '$v',
        addedDate: '$addedDate',
      }
    }
  ])
  res.render('binfiles', { binFileList })
})

//page: single esp
exports.singleEsp = asyncHandler(async (req, res, next) => {
  //pics updated with this esp
  const pics = await OtaTrack.find({ espId: req.params.id }).populate('prevBinVersion', 'v').populate('binVersion', 'v').exec()

  const espInfo = await ESP.findById(req.params.id)
  res.render('singleEsp', { pics, espInfo })
})
