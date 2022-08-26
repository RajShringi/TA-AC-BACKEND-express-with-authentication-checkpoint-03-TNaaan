const express = require("express");
const Income = require("../models/Income");
const Expense = require("../models/Expense");
const auth = require("../middleware/auth");
const moment = require("moment");
const router = express.Router();

router.get("/", async (req, res, next) => {
  console.log(req.query);
  let { start_date, end_date, category, source, months } = req.query;
  let incomes, expenses, thisMonthIncome, thisMonthExpenses, saving;
  try {
    const categories = await Expense.distinct("category");
    const sources = await Income.distinct("source");

    if (start_date && end_date && category === "none" && source === "none") {
      month = null;
      start_date = moment(start_date).toISOString();
      end_date = moment(end_date).toISOString();
      incomes = await Income.find({
        date: { $gte: start_date, $lte: end_date },
        user: req.user._id,
      });

      expenses = await Expense.find({
        date: { $gte: start_date, $lte: end_date },
        user: req.user._id,
      });
      thisMonthIncome = await Income.aggregate([
        {
          $match: {
            date: { $gte: new Date(start_date), $lte: new Date(end_date) },
            user: req.user._id,
          },
        },
        {
          $group: { _id: null, totalAmount: { $sum: "$amount" } },
        },
      ]);
      if (thisMonthIncome.length === 0) {
        thisMonthIncome = [{ _id: null, totalAmount: 0 }];
      }
      thisMonthExpenses = await Expense.aggregate([
        {
          $match: {
            date: { $gte: new Date(start_date), $lte: new Date(end_date) },
            user: req.user._id,
          },
        },
        {
          $group: { _id: null, totalAmount: { $sum: "$amount" } },
        },
      ]);
      if (thisMonthExpenses.length === 0) {
        thisMonthExpenses = [{ _id: "null", totalAmount: 0 }];
      }
      saving =
        thisMonthIncome[0].totalAmount - thisMonthExpenses[0].totalAmount;
      console.log("only show expesnses and income between these dates");
    } else if (start_date && end_date && category && source === "none") {
      month = null;
      start_date = moment(start_date).toISOString();
      end_date = moment(end_date).toISOString();
      expenses = await Expense.find({
        date: { $gte: start_date, $lte: end_date },
        category: category,
      });
      thisMonthExpenses = await Expense.aggregate([
        {
          $match: {
            date: { $gte: new Date(start_date), $lte: new Date(end_date) },
            category,
          },
        },
        {
          $group: { _id: null, totalAmount: { $sum: "$amount" } },
        },
      ]);
      if (thisMonthExpenses.length === 0) {
        thisMonthExpenses = [{ _id: "null", totalAmount: 0 }];
      }
      console.log(thisMonthExpenses);
      console.log("filter by expenses");
    } else if (start_date && end_date && category === "none" && source) {
      month = null;
      start_date = moment(start_date).toISOString();
      end_date = moment(end_date).toISOString();
      incomes = await Income.find({
        date: { $gte: start_date, $lte: end_date },
        source,
      });
      thisMonthIncome = await Income.aggregate([
        {
          $match: {
            date: { $gte: new Date(start_date), $lte: new Date(end_date) },
            source,
          },
        },
        {
          $group: { _id: null, totalAmount: { $sum: "$amount" } },
        },
      ]);
      if (thisMonthIncome.length === 0) {
        thisMonthIncome = [{ _id: null, totalAmount: 0 }];
      }
      console.log(thisMonthIncome);
      console.log("filter by incomes");
    } else if (months) {
      month = Number(req.query.months);
      incomes = await Income.aggregate([
        {
          $project: {
            month: { $month: "$date" },
            source: 1,
            amount: 1,
            date: 1,
            user: 1,
            name: 1,
          },
        },
        { $match: { month: month, user: req.user._id } },
      ]);

      expenses = await Expense.aggregate([
        {
          $project: {
            month: { $month: "$date" },
            category: 1,
            amount: 1,
            date: 1,
            user: 1,
            name: 1,
          },
        },
        { $match: { month: month, user: req.user._id } },
      ]);
      thisMonthIncome = await Income.aggregate([
        {
          $project: {
            month: { $month: "$date" },
            amount: 1,
            user: 1,
          },
        },
        { $match: { month: month, user: req.user._id } },
        { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
      ]);

      if (thisMonthIncome.length === 0) {
        thisMonthIncome = [{ _id: null, totalAmount: 0 }];
      }

      thisMonthExpenses = await Expense.aggregate([
        {
          $project: {
            month: { $month: "$date" },
            amount: 1,
            user: 1,
          },
        },
        { $match: { month: month, user: req.user._id } },
        { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
      ]);

      if (thisMonthExpenses.length === 0) {
        thisMonthExpenses = [{ _id: "null", totalAmount: 0 }];
      }

      saving =
        thisMonthIncome[0].totalAmount - thisMonthExpenses[0].totalAmount;
      console.log("filter by months");
    } else {
      (start_date = null), (end_date = null);
      month = moment(new Date()).format("M");
      incomes = await Income.aggregate([
        {
          $match: {
            $expr: {
              $eq: [{ $month: "$date" }, { $month: new Date() }],
            },
            user: req.user._id,
          },
        },
      ]);
      expenses = await Expense.aggregate([
        {
          $match: {
            $expr: {
              $eq: [{ $month: "$date" }, { $month: new Date() }],
            },
            user: req.user._id,
          },
        },
      ]);
      thisMonthIncome = await Income.aggregate([
        {
          $match: {
            $expr: {
              $eq: [{ $month: "$date" }, { $month: new Date() }],
            },
            user: req.user._id,
          },
        },
        { $group: { _id: "null", totalAmount: { $sum: "$amount" } } },
      ]);
      if (thisMonthIncome.length === 0) {
        thisMonthIncome = [{ _id: null, totalAmount: 0 }];
      }
      thisMonthExpenses = await Expense.aggregate([
        {
          $match: {
            $expr: {
              $eq: [{ $month: "$date" }, { $month: new Date() }],
            },
            user: req.user._id,
          },
        },
        { $group: { _id: "null", totalAmount: { $sum: "$amount" } } },
      ]);
      if (thisMonthExpenses.length === 0) {
        thisMonthExpenses = [{ _id: "null", totalAmount: 0 }];
      }

      saving =
        thisMonthIncome[0].totalAmount - thisMonthExpenses[0].totalAmount;
      console.log("normal");
    }
    res.status(200).render("dashboard", {
      incomes,
      expenses,
      moment,
      thisMonthIncome,
      thisMonthExpenses,
      saving,
      categories,
      sources,
      month,
      start_date,
      end_date,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
