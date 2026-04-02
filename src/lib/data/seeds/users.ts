import type { User } from "@/lib/data/types/domain";

export const CURRENT_USER_ID = "u-alex";

export const users: User[] = [
  {
    id: "u-alex",
    name: "Alex Rivera",
    email: "alex.rivera@example.com",
    role: "developer",
    isActive: true,
  },
  {
    id: "u-jordan",
    name: "Jordan Kim",
    email: "jordan.kim@example.com",
    role: "developer",
    isActive: true,
  },
  {
    id: "u-priya",
    name: "Priya Patel",
    email: "priya.patel@example.com",
    role: "qa",
    isActive: true,
  },
  {
    id: "u-marcus",
    name: "Marcus Lee",
    email: "marcus.lee@example.com",
    role: "developer",
    isActive: true,
  },
  {
    id: "u-sarah",
    name: "Sarah Chen",
    email: "sarah.chen@example.com",
    role: "admin",
    isActive: true,
  },
  {
    id: "u-tom",
    name: "Tom Walsh",
    email: "tom.walsh@example.com",
    role: "developer",
    isActive: false,
  },
];
