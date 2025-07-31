import { withDI } from "@/lib/handlers/with.di";

import { DIContainer } from "@/lib/di.container";
import { DITypes } from "@/lib/di.container/types";
import { Queues } from "@/lib/queues";
import { NextResponse } from "next/server";

export const POST = withDI(async (request: Request) => {
  try {
    const body = await request.json();

    const queueManager = DIContainer.getInstance(DITypes.QueueManager);

    // Add job to queue
    queueManager.createQueue(Queues.TEST);
    await queueManager.addJob(Queues.TEST, body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding job to queue:", error);
    return NextResponse.json(
      { error: "Failed to add job to queue" },
      { status: 500 }
    );
  }
});
