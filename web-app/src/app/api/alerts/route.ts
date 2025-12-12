import { NextResponse } from "next/server";

export async function GET() {
  const alerts = [
    {
      id: "1",
      type: "critical",
      title: "Temperature Anomaly Detected",
      message: "Heat treatment furnace #3 exceeding safe temperature limits",
      time: "2 min ago",
      source: "Production Line B",
    },
    {
      id: "2",
      type: "warning",
      title: "Material Shortage Predicted",
      message: "Steel coil inventory projected to deplete in 48 hours",
      time: "15 min ago",
      source: "Inventory System",
    },
    {
      id: "3",
      type: "warning",
      title: "Supplier Delivery Delay",
      message: "Shipment from MetalCo delayed by 6 hours",
      time: "1 hour ago",
      source: "Logistics",
    },
    {
      id: "4",
      type: "info",
      title: "Maintenance Scheduled",
      message: "Routine maintenance for Pipe Former #2 at 18:00",
      time: "2 hours ago",
      source: "Maintenance",
    },
  ];
  const counts = {
    critical: alerts.filter((a) => a.type === "critical").length,
    warning: alerts.filter((a) => a.type === "warning").length,
    info: alerts.filter((a) => a.type === "info").length,
  };
  return NextResponse.json({ alerts, counts });
}

export const dynamic = "force-dynamic";
