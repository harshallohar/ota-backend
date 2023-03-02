const Manufacturer = require("../models/Manufacturer");

exports.login = async (req, res) => {
  try {
    console.log(req.body);
    const manu = await Manufacturer.find({ id: req.body.email });
    if (manu) {
      console.log(manu);
      manu.map((e) => {
        if (e.type != "admin") {
          if (e.password === req.body.password) {
            res.status(200).json({
              email: e.id,
              name: e.id,
              id: e["_id"],
              addedDate: e["addedDate"],
              type: e.type,
            });
          }} else if (e.password === req.body.password) {
            res.status(200).json({
              email: e.id,
              name: e.name,
              id: e["_id"],
              addedDate: e["addedDate"],
              type: e.type,
            });
          } else {
            res.status(400).json({});
          }
      });
    } else {
      res.status(400).json({});
    }
  } catch (error) {
    res.status(500).json({ error: error.message, body: "", success: "false" });
  }
};
