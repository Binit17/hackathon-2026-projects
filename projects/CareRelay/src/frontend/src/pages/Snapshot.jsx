import { LayoutDashboard } from 'lucide-react';

export default function Snapshot() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-teal-50 rounded-lg">
          <LayoutDashboard className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Patient Snapshot</h1>
          <p className="text-sm text-slate-500">Quick clinical overview for a first visit</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {['Patient Info', 'Active Conditions', 'Current Medications', 'Allergies', 'Latest Labs', 'AI Brief'].map(
          (title) => (
            <div
              key={title}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-2"
            >
              <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
              <p className="text-xs text-slate-400">Coming soon — connect to backend data</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
