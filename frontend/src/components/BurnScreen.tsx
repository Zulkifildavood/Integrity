export default function BurnScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 bg-black text-red-500">
      <h1 className="text-4xl font-bold mb-4 tracking-widest bg-red-500 text-black px-4 py-2 uppercase">Protocol Failed</h1>
      <div className="text-6xl font-mono mb-8 border-b-2 border-red-500 pb-4 mt-8">
        DAY BURNED
      </div>
      <p className="text-sm uppercase tracking-widest max-w-md">
        You missed your window or failed the evaluation. Your streak descends to ash. Discipline is non-negotiable.
      </p>
      <button 
        className="mt-16 border-red-500 text-red-500 hover:bg-red-500 hover:text-black"
        onClick={() => window.location.reload()}
      >
        ACKNOWLEDGE
      </button>
    </div>
  );
}
