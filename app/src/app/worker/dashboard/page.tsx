import WorkerOverviewClient from "./WorkerOverviewClient";

export default function WorkerOverviewPage({
  searchParams
}: {
  searchParams?: { demo?: string | string[] };
}) {
  const demo = searchParams?.demo;
  const initialDemoMode = demo === "1" || demo === "true";

  return <WorkerOverviewClient initialDemoMode={initialDemoMode} />;
}
