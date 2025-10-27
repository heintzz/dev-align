const { Schema } = require("mongoose");

// For running seedMenu
// const mongoose = require("mongoose");
// const { Schema } = mongoose;

const menuSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: false,
      default: null,
    },
    icon: {
      type: String,
      required: false,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Menu",
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
    roles: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = menuSchema;

// For running seedMenu
// const Menu = mongoose.model("Menu", menuSchema);
// module.exports = Menu;
