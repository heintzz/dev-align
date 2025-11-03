const { Position } = require('../models');

// Helper to escape user input when building RegExp (prevent invalid regex from names with special chars)
const escapeRegExp = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Create single position
const createPosition = async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Position name must be specified',
    });
  }

  try {
    // Check for duplicate (case-insensitive)
    const existingPosition = await Position.findOne({
      name: { $regex: new RegExp('^' + escapeRegExp(name.trim()) + '$', 'i') }
    });

    if (existingPosition) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: `Position "${name}" already exists`,
      });
    }

    const position = await Position.create({ name: name.trim() });

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

// Create multiple positions at once
const createMultiplePositions = async (req, res) => {
  const { positions } = req.body;

  if (!positions || !Array.isArray(positions) || positions.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Positions array is required and must not be empty',
    });
  }

  try {
    const createdPositions = [];
    const skippedPositions = [];
    const errors = [];

    for (const positionName of positions) {
      if (!positionName || positionName.trim() === '') {
        errors.push({ name: positionName, reason: 'Empty or invalid name' });
        continue;
      }

      // Check for duplicate (case-insensitive)
      const existingPosition = await Position.findOne({
        name: { $regex: new RegExp('^' + escapeRegExp(positionName.trim()) + '$', 'i') }
      });

      if (existingPosition) {
        skippedPositions.push({
          name: positionName,
          reason: 'Already exists'
        });
        continue;
      }

      const position = await Position.create({ name: positionName.trim() });
      createdPositions.push(position);
    }

    return res.status(201).json({
      success: true,
      data: {
        created: createdPositions,
        skipped: skippedPositions,
        errors: errors,
        summary: {
          total: positions.length,
          created: createdPositions.length,
          skipped: skippedPositions.length,
          errors: errors.length,
        },
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

// Delete multiple positions at once
const deleteMultiplePositions = async (req, res) => {
  const { positionIds } = req.body;

  if (!positionIds || !Array.isArray(positionIds) || positionIds.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Position IDs array is required and must not be empty',
    });
  }

  try {
    const result = await Position.deleteMany({ _id: { $in: positionIds } });

    return res.status(200).json({
      success: true,
      data: {
        deletedCount: result.deletedCount,
        message: `${result.deletedCount} position(s) deleted successfully`,
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

module.exports = {
  createPosition,
  createMultiplePositions,
  getPositions,
  updatePosition,
  deletePosition,
  deleteMultiplePositions,
};
