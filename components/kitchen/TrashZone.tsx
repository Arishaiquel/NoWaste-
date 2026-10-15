"use client";

import { useDroppable } from "@dnd-kit/core";

export function TrashZone({ disabled = false }: { disabled?: boolean }) {
  const { isOver, setNodeRef } = useDroppable({ id: "discarded", disabled });
  return <section ref={setNodeRef} className={`kitchen-action-zone trash-zone ${isOver ? "drop-zone-active" : ""}`} aria-label="Discard drop zone">
    <div className="action-copy action-copy-right"><span className="action-kicker">Discard</span><strong>{isOver ? "Release to review" : "Drop food here"}</strong><small>to log food waste</small></div>
    <div className="friendly-bin" aria-hidden="true"><span className="bin-lid"/><span className="bin-body"><i/><b>⌣</b></span></div>
  </section>;
}
