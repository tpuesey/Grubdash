


const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass


function list(req, res) {
    res.json({ data: orders });
  }
  
  function orderIsValid(req, res, next) {
    const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
  
    if (!deliverTo || deliverTo === "") {
      next({
        status: 400,
        message: "Order must include a deliverTo",
      });
    } else if (!mobileNumber || mobileNumber === "") {
      next({
        status: 400,
        message: "Order must include a mobileNumber",
      });
    } else if (!dishes) {
      next({
        status: 400,
        message: "Order must include a dish",
      });
    } else if (!Array.isArray(dishes) || dishes.length === 0) {
      next({
        status: 400,
        message: "Order must include at least one dish",
      });
    } else {
      dishes.forEach((dish) => {
        if (
          !dish.quantity ||
          dish.quantity <= 0 ||
          typeof dish.quantity !== "number"
        ) {
          next({
            status: 400,
            message: `Dish ${dish.id} must have a quantity that is an integer greater than 0`,
          });
        }
      });
    }
    next();
  }
  
  function create(req, res) {
    const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
  
    const newOrder = {
      id: nextId(),
      deliverTo: deliverTo,
      mobileNumber: mobileNumber,
      dishes: dishes,
    };
  
    orders.push(newOrder);
  
    res.status(201).json({ data: newOrder });
  }
  
  function orderExists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);
  
    if (foundOrder) {
      res.locals.order = foundOrder;
      next();
    }
    next({
      status: 404,
      message: `Order id does not exist: ${orderId}`,
    });
  }
  
  function updateValidation(req, res, next) {
    const { data: { id, status } = {} } = req.body;
    const { orderId } = req.params;
    const statuses = ["pending", "preparing", "out-for-delivery", "delivered"];
  
    if (id && id !== orderId) {
      next({
        status: 400,
        message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`,
      });
    } else if (!statuses.includes(status)) {
      next({
        status: 400,
        message:
          "Order must have a status of pending, preparing, out-for-delivery, delivered",
      });
    } else if (status === "delivered") {
      next({
        status: 400,
        message: "A delivered order cannot be changed",
      });
    }
  
    next();
  }
  
  function read(req, res) {
    res.json({ data: res.locals.order });
  }
  
  function update(req, res) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  
    res.locals.order.id = req.params.orderId;
    res.locals.order.deliverTo = deliverTo;
    res.locals.order.mobileNumber = mobileNumber;
    res.locals.order.status = status;
    res.locals.order.dishes = dishes;
  
    res.json({ data: res.locals.order });
  }
  
  function destroy(req, res, next) {
    if (res.locals.order.status !== "pending") {
      next({
        status: 400,
        message: "An order cannot be deleted unless it is pending",
      });
    } else {
      const index = orders.indexOf(res.locals.order);
      orders.splice(index, 1);
  
      res.sendStatus(204);
    }
  }
  
  module.exports = {
    list,
    create: [orderIsValid, create],
    read: [orderExists, read],
    update: [orderExists, orderIsValid, updateValidation, update],
    delete: [orderExists, destroy],
  };