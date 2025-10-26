const { Position } = require('../models');

const createPosition = async (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() == '') {
    return res.status(400).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Position name must be specified',
    });
  }

  try {
    const existingPosition = await Position.findOne({ name });

    if (existingPosition) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Position already exists',
      });
    }

    const position = await Position.create({ name: name });
    return res.status(201).json({
      success: true,
      data: position,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err.message,
    });
  }
};

const getPositions = async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const perPage = Math.max(1, Number(req.query.perPage) || 15);
  const skip = perPage ? (page - 1) * perPage : 0;

  try {
    const [total, positions] = await Promise.all([
      Position.countDocuments({}),
      Position.find({}).sort({ name: -1 }).skip(skip).limit(perPage).select('id name'),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        perPage,
        total,
        positions,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err.message,
    });
  }
};

const updatePosition = async (req, res) => {
  try {
    const { positionId } = req.params;

    const currentPosition = await Position.findOne({ _id: positionId });
    if (!currentPosition)
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Position not found',
      });

    currentPosition.name = req.body.name || currentPosition.name;
    await currentPosition.save();

    return res.status(200).json({
      success: true,
      data: currentPosition,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err.message,
    });
  }
};

const deletePosition = async (req, res) => {
  try {
    const { positionId } = req.params;

    const deletedPosition = await Position.findOne({ _id: positionId });
    if (!deletedPosition)
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Position not found',
      });

    await deletedPosition.deleteOne();
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err.message,
    });
  }
};

module.exports = {
  createPosition,
  getPositions,
  updatePosition,
  deletePosition,
};
