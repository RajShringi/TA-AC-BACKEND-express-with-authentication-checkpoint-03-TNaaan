const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const auth = require("../middleware/auth");
const moment = require("moment");

router.use(auth.isUserLogged);

router.get("/new", (req, res) => {
  res.render("addExpense");
});

router.post("/", async (req, res, next) => {
  try {
    req.body.user = req.user._id;
    console.log(req.body);
    const expense = await Expense.create(req.body);
    res
      .status(200)
      .redirect(`/dashboards?months=${moment(expense.date).format("M")}`);
  } catch (err) {
    return next(err);
  }
});

router.get("/:id/edit", async (req, res, next) => {
  try {
    const id = req.params.id;
    const expense = await Expense.findById(id);
    res.status(200).render("editExpense", { expense, moment });
  } catch (err) {
    return next(err);
  }
});

router.post("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const findExpense = await Expense.findById(id);
    if (String(findExpense.user) === String(req.user.id)) {
      const expense = await Expense.findByIdAndUpdate(id, req.body);
      res
        .status(200)
        .redirect(`/dashboards?months=${moment(expense.date).format("M")}`);
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    return next(error);
  }
});

router.get("/:id/delete", async (req, res, next) => {
  try {
    const id = req.params.id;
    const findExpense = await Expense.findById(id);
    if (String(findExpense.user) === String(req.user.id)) {
      const expense = await Expense.findByIdAndDelete(id);
      res
        .status(200)
        .redirect(`/dashboards?months=${moment(expense.date).format("M")}`);
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
