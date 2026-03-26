"use client";

import { useEffect } from "react";

import { learnerStateGateway } from "@/lib/gateways";

export function ResumeTracker({ topicId }: { topicId: string }) {
  useEffect(() => {
    learnerStateGateway.saveLastVisitedTopic(topicId);
  }, [topicId]);

  return null;
}
