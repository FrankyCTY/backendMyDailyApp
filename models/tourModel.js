const mongoose = require("mongoose");
const slugify = require("slugify");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, "A tour must have a name"],
      trim: true,
      maxLength: [20, "Name can not be longer than 20 characters"],
      minLength: [5, "Name can not be shorter than 5 characters"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty can only be set to easy | medium | difficult",
      },
    },
    price: {
      type: Number,
      require: [true, "A tour must have a price"],
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    slug: String,
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

tourSchema.virtual("priceHKD").get(function () {
  return this.price * 5;
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
