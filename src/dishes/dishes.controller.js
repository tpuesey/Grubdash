const path = require("path");

const dishes = require(path.resolve("src/data/dishes-data"));

const nextId = require("../utils/nextId");

function bodyHasName(req, res, next) {
  const { data: { name } = {} } = req.body;

  if (name) {
    res.locals.name = name;

    return next();
  }

  next({
    status: 400,
    message: `A 'name'property is required.`,
  });
}

function bodyHasImg(req, res, next) {
  const { data: { image_url } = {} } = req.body;

  if (image_url) {
    res.locals.image_url = image_url;
    return next();
  }
  next({
    status: 400,
    message: `A 'image_url' property is required.`,
  });
}

function bodyHasPrice(req, res, next) {
  const {
    data: { price },
  } = ({} = req.body);

  if (price) {
    res.locals.price = price;
    return next();
  }

  next({
    status: 400,
    message: `A 'price' property is required.`,
  });
}

function bodyHasDescription(req, res, next) {
  const { data: { description } = {} } = req.body;

  if (description) {
    res.locals.description = description;

    return next();
  }

  next({
    status: 400,
    message: `A 'description' property is required.`,
  });
}

function bodyHasValidPrice(req, res, next) {
  const { data: { price } = {} } = req.body;

  if (price > 0) {
    res.locals.price = price;

    return next();
  }

  next({
    status: 400,
    message: `price cannot be less than 0`,
  });
}

function bodyHasValidPriceForUpdate(req, res, next) {
  const { data: { price } = {} } = req.body;

  if (typeof res.locals.price !== "number" || res.locals.price <= 0) {
    next({
      status: 400,
      message: `type of price must be number`,
    });
  }

  return next();
}

function dishExists(req, res, next) {
  const { dishId } = req.params;

  const matchingDish = dishes.find((dish) => dish.id === dishId);

  if (matchingDish) {
    res.locals.matchingDish = matchingDish;

    return next();
  }

  next({
    status: 404,
    message: `Dish id not found: ${dishId}`,
  });
}

function dishIdMatchesDataId(req, res, next) {
  const { data: { id } = {} } = req.body;
  const dishId = req.params.dishId;

  if (id !== "" && id !== dishId && id !== null && id !== undefined) {
    next({
      status: 400,
      message: `id ${id} must match dataId provided in parameters`,
    });
  }

  return next();
}

function list(req, res) {
  res.json({ data: dishes });
}

function read(req, res) {
  const dishId = req.params.dishId;

  const matchingDish = dishes.find((dish) => dish.id === dishId);

  res.json({ data: res.locals.matchingDish });
}

function create(req, res) {
  const { data: { name, price, image_url } = {} } = req.body;

  const newDish = {
    id: nextId(),
    name,
    price,
    image_url,
  };

  dishes.push(newDish);

  res.status(201).json({ data: newDish });
}

function update(req, res) {
  const dishId = req.params.dishId;

  const matchingDish = dishes.find((dish) => dish.id === dishId);
  const { data: { name, description, price, image_url } = {} } = req.body;

  matchingDish.description = description;
  matchingDish.name = name;
  matchingDish.price = price;
  matchingDish.image_url = image_url;

  res.json({ data: matchingDish });
}

module.exports = {
  list,
  read: [dishExists, read],
  create: [
    bodyHasName,
    bodyHasDescription,
    bodyHasPrice,
    bodyHasImg,
    bodyHasValidPrice,
    create,
  ],
  update: [
    dishExists,
    dishIdMatchesDataId,
    bodyHasName,
    bodyHasDescription,
    bodyHasPrice,
    bodyHasImg,
    bodyHasValidPriceForUpdate,
    update,
  ],
};
