const { Menu } = require("../models");

const getMenu = async (req, res) => {
  try {
    const role = req.user.role;

    const items = await Menu.find({ roles: role })
      .select("-roles -__v")
      .sort({ order: 1 })
      .lean();

    const parentIds = items
      .map((i) => i.parent)
      .filter(Boolean)
      .map((id) => id.toString());

    const parents = parentIds.length
      ? await Menu.find({ _id: { $in: parentIds } }).lean()
      : [];

    const all = [...items, ...parents];

    const map = {};
    all.forEach((item) => {
      map[item._id.toString()] = { ...item, children: [] };
    });

    const menuList = [];
    Object.values(map).forEach((item) => {
      if (item.parent) {
        const parent = map[item.parent.toString()];
        if (parent) parent.children.push(item);
      } else {
        menuList.push(item);
      }
    });

    const sortRecursively = (nodes) => {
      nodes.sort((a, b) => (a.order || 0) - (b.order || 0));
      nodes.forEach((n) => sortRecursively(n.children));
    };
    sortRecursively(menuList);

    res.status(200).json({
      success: 200,
      data: { menuList },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getMenu,
};
