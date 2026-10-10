import React from "react";
import { C } from "../theme";

/** Valeur non fournie (§ 0) : placeholder rouge visible, jamais de valeur inventée. */
export const Field: React.FC<{ value: string | null; label: string }> = ({ value, label }) =>
  value ? <>{value}</> : <span style={{ color: C.todo }}>[{label} À COMPLÉTER]</span>;
