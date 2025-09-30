export default function Home() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <a href="/batches/11" className="card p-6 hover:shadow-md">
        <h2 className="text-xl font-semibold">NEET Class 11</h2>
        <p className="text-sm text-gray-600 mt-1">Physics • Chemistry (Organic / Inorganic / Physical) • Biology (Botany / Zoology)</p>
      </a>
      <a href="/batches/12" className="card p-6 hover:shadow-md">
        <h2 className="text-xl font-semibold">NEET Class 12</h2>
        <p className="text-sm text-gray-600 mt-1">Physics • Chemistry (Organic / Inorganic / Physical) • Biology (Botany / Zoology)</p>
      </a>
      <div className="md:col-span-2 card p-4">
        <h3 className="font-semibold">How it works</h3>
        <ol className="mt-2 text-sm list-disc ml-6 space-y-1">
          <li>Pick your class (11 or 12)</li>
          <li>Open a chapter and watch the lecture (YouTube embedded)</li>
          <li>Ask questions in Q&A, open notes (PDFs)</li>
          <li>Take mini‑mock tests</li>
        </ol>
      </div>
    </div>
  );
}
