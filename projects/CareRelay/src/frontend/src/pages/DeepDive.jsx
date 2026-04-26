import { History } from 'lucide-react';

export default function DeepDive() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-teal-50 rounded-lg">
          <History className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Deep Dive</h1>
          <p className="text-sm text-slate-500">Full history — conditions, labs, encounters, drug warnings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {['Condition Timeline', 'Lab Trends', 'Encounter History', 'Drug Interactions'].map((title) => (
          <div
            key={title}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-2"
          >
            <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
            <p className="text-xs text-slate-400">Coming soon — connect to backend data</p>
          </div>
        ))}
      </div>
    </div>
  );
}
