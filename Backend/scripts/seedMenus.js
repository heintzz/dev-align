const mongoose = require("mongoose");
const Menu = require("../models/schemas/menu.schema");
require("dotenv").config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  // Remove old menus (careful in prod)
  await Menu.deleteMany({});

  const items = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: "ChartArea",
      roles: ["hr", "manager", "staff"],
      order: 1,
    },
    {
      title: "Employees",
      path: "/employees",
      icon: "IdCardLanyard",
      roles: ["hr"],
      order: 2,
    },
    {
      title: "Projects",
      path: "/projects",
      icon: "ClipboardList",
      roles: ["hr", "manager", "staff"],
      order: 3,
    },
    {
      title: "Team",
      path: "/team",
      icon: "UsersRound",
      roles: ["manager", "staff"],
      order: 4,
    },
    {
      title: "Announcement",
      path: "/announcement",
      icon: "Megaphone",
      roles: ["hr"],
      order: 5,
    },
  ];

  // Insert top-level first
  const created = await Menu.insertMany(items.map((i) => ({ ...i })));

  // Example: create children under Admin
  const team = created.find((m) => m.title === "Team");
  if (team) {
    await Menu.create(
      {
        title: "Management",
        path: "/team/management",
        icon: "ContactRound",
        roles: ["manager", "staff"],
        parent: team._id,
        order: 1,
      },
      {
        title: "Request & Approval",
        path: "/announcement",
        icon: "Megaphone",
        roles: ["manager", "staff"],
        parent: team._id,
        order: 2,
      }
    );
  }

  console.log("Seed complete");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
