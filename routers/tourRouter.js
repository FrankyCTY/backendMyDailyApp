const express = require("express");
const tourController = require("../controllers/tourController");

const router = express.Router();

// 1) Router Middlewares

// 2) Router routes
router
  .route("/")
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route("/under-200-Tour")
  .get(tourController.aliasUnder200Tour, tourController.getAllTours);

router.route("/get-monthly-stats/:year").get(tourController.getMonthlyPlan);

module.exports = router;
