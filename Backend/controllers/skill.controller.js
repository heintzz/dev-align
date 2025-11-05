const { Skill } = require("../models");

const createSkill = async (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() == "") {
    return res.status(400).json({
      success: false,
      error: "Internal Server Error",
      message: "Skill name must be specified",
    });
  }

  try {
    const existingSkill = await Skill.findOne({ name });

    if (existingSkill) {
      return res.status(400).json({
        success: false,
        error: "Bad Request",
        message: "Skill already exists",
      });
    }

    const skill = await Skill.create({ name: name });
    return res.status(201).json({
      success: true,
      data: skill,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: err.message,
    });
  }
};

const getSkills = async (req, res) => {
  // const page = Math.max(1, Number(req.query.page) || 1);
  // const perPage = Math.max(1, Number(req.query.perPage) || 15);
  // const skip = perPage ? (page - 1) * perPage : 0;

  try {
    const [total, skills] = await Promise.all([
      Skill.countDocuments({}),
      Skill.find({}).sort({ name: -1 }),
      // .skip(skip).limit(perPage).select('id name'),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        // perPage,
        total,
        skills,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: err.message,
    });
  }
};

const updateSkill = async (req, res) => {
  try {
    const { skillId } = req.params;

    const currentSkill = await Skill.findOne({ _id: skillId });
    if (!currentSkill)
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Skill not found",
      });

    currentSkill.name = req.body.name || currentSkill.name;
    await currentSkill.save();

    return res.status(200).json({
      success: true,
      data: currentSkill,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: err.message,
    });
  }
};

const deleteSkill = async (req, res) => {
  try {
    const { skillId } = req.params;

    const deletedSkill = await Skill.findOne({ _id: skillId });
    if (!deletedSkill)
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Skill not found",
      });

    await deletedSkill.deleteOne();
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: err.message,
    });
  }
};

module.exports = {
  createSkill,
  getSkills,
  updateSkill,
  deleteSkill,
};
