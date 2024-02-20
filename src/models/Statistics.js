import mongoose, { SchemaTypes } from "mongoose";

// can be money, weight, or percentage composition
const foodBreakdownSchema = new mongoose.Schema({
  category: { type: String, required: true },
  quantity: { type: String, required: true },
  unit: { type: String, required: true }
});

const statisticSchema = new mongoose.Schema({
// determine what statistic this is
  statisticId: { type: Number, required: true }, 
  ownerId: { type: SchemaTypes.ObjectId, ref: "User" },

  title: { type: String, required: true },
  description: { type: String, required: true },
  foodBreakdown: [foodBreakdownSchema],  
  peakMonth: { type: String },  // some statistics return the month with the highest action completed
  addedValue: { type: Number },  // used in some statistics' description to state total value

  // used in statistics which consist of a food group breakdown
  grainsValue: { type: Number },
  fruitsValue: { type: Number },
  vegetablesValue: { type: Number },
  proteinValue: { type: Number },
  dairyValue: { type: Number },

  // used in statistics with a nutritional composition breakdown
  carbsPercent: { type: Number },
  proteinPercent: { type: Number },
  fatPercent: { type: Number },

  uniqueFoodItems: { type: Number }, // number of different food items added to inventory
  consumerPercentage: { type: Number },  // percentile where current user ranks for a food statistic
});

const Statistic = mongoose.model('InventoryItem', statisticSchema);

const statisticsSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  lastUpdated: { type: Date, default: Date.now },  // to determine whether or not to recalculate
  statistics: [statisticSchema]
});

const Statistics = mongoose.model('UserStatistic', statisticsSchema);

export { Statistic, Statistics };
