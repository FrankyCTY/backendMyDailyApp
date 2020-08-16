const Tour = require("../models/tourModel");
const QueryStringMiddlewares = require("../utils/queryStringUtils");
const catchAsyncError = require("../utils/catchAsyncError");

exports.aliasUnder200Tour = (req, res, next) => {
  req.query.price = { lte: "200" };
  next();
};

exports.getAllTours = catchAsyncError(async (req, res) => {
  const queryStringClass = new QueryStringMiddlewares(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await Tour.find(queryStringClass.query);
  console.log("queryStringClass.queryString", queryStringClass.queryString);
  return res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours: tours,
    },
  });
});

exports.createTour = catchAsyncError(async (req, res) => {
  const newTour = await Tour.create(req.body);

  return res.status(200).json({
    status: "success",
    results: newTour.length,
    data: {
      tour: newTour,
    },
  });
});

// ============ Get Stats with aggregate ===========
exports.getMonthlyPlan = catchAsyncError(async (req, res) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        totalTours: { $sum: 1 },
        tours: { $push: "$name" },
        price: { $sum: "$price" },
      },
    },
    {
      $addFields: { month: "$_id" },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        price: -1,
      },
    },
  ]);

  return res.status(200).json({
    status: "success",
    results: plan.length,
    data: {
      stats: plan,
    },
  });
});
