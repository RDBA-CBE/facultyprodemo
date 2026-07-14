"use client";

import * as React from "react";
import {
  AudioWaveform,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  SquareTerminal,
  Ticket,
  User2Icon,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { TeamSwitcher } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Wellness Lounge",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Lounge Session List",
          url: "/wellness-lounge-list",
        },
        {
          title: "Create Lounge Session",
          url: "/create-wellness-lounge",
        },
        {
          title: "Categories",
          url: "/categories-list",
        },
        {
          title: "Calendar",
          url: "/calendar",
        },
      ],
    },

    {
      title: "Orders",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Orders List",
          url: "/order-list",
        },
        {
          title: "Create order",
          url: "/create-order",
        },
        // {
        //   title: "Quantum",
        //   url: "#",
        // },
      ],
    },
    {
      title: "Users",
      url: "/user-list",
      icon: User2Icon,
      items: [
        {
          title: "User List",
          url: "/user-list",
        },
        {
          title: "Create User",
          url: "create-user",
        },
      ],
    },
    {
      title: "Payment Gateways",
      url: "/payment",
      icon: Bot,
      items: [
        {
          title: "Payment Gateway List",
          url: "/payment-gateway-list",
        },
      ],
    },
    {
      title: "Coupons",
      url: "/coupon-list",
      icon: Ticket,
      items: [
        {
          title: "Coupon List",
          url: "/coupon-list",
        },
        {
          title: "Create Coupon",
          url: "create-coupon",
        },
      ],
    },
    // {
    //   title: "Documentation",
    //   url: "#",
    //   icon: BookOpen,
    //   items: [
    //     {
    //       title: "Introduction",
    //       url: "#",
    //     },
    //     {
    //       title: "Get Started",
    //       url: "#",
    //     },
    //     {
    //       title: "Tutorials",
    //       url: "#",
    //     },
    //     {
    //       title: "Changelog",
    //       url: "#",
    //     },
    //   ],
    // },
    // {
    //   title: "Settings",
    //   url: "#",
    //   icon: Settings2,
    //   items: [
    //     {
    //       title: "General",
    //       url: "#",
    //     },
    //     {
    //       title: "Team",
    //       url: "#",
    //     },
    //     {
    //       title: "Billing",
    //       url: "#",
    //     },
    //     {
    //       title: "Limits",
    //       url: "#",
    //     },
    //   ],
    // },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      {/* <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter> */}
      <SidebarRail />
    </Sidebar>
  );
}
