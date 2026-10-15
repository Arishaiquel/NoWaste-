"use client";

import { useDroppable } from "@dnd-kit/core";

export function ConsumptionZone({ disabled = false }: { disabled?: boolean }) {
  const { isOver, setNodeRef } = useDroppable({ id: "consumed", disabled });
  return <section ref={setNodeRef} className={`kitchen-action-zone consume-zone ${isOver ? "drop-zone-active" : ""}`} aria-label="Ate it drop zone">
    <div className="action-copy"><span className="action-kicker">Ate it</span><strong>{isOver ? "Release to rescue it" : "Drop food here"}</strong><small>when you&apos;ve eaten it</small></div>
    <div className="plate-friend" aria-hidden="true">
      <span className="plate-eye plate-eye-left"/><span className="plate-eye plate-eye-right"/><span className="plate-mouth"/>
      <span className="plate-fork">⋔</span><span className="plate-knife"/>
    </div>
  </section>;
}
