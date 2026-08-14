import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TripListScreen } from "./features/trips/TripListScreen";

const PlannerScreen = lazy(() =>
  import("./features/planner/PlannerScreen").then((m) => ({ default: m.PlannerScreen })),
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading…</div>}>
        <Routes>
          <Route path="/" element={<TripListScreen />} />
          <Route path="/trips/:id" element={<PlannerScreen />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
