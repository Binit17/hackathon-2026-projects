import { CreditCard } from 'lucide-react';

export default function IDCard() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-teal-50 rounded-lg">
          <CreditCard className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Medical ID Card</h1>
          <p className="text-sm text-slate-500">Printable card with QR code for clinic check-in</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 w-full max-w-md flex flex-col items-center gap-4">
          <div className="w-32 h-32 bg-slate-100 rounded-lg flex items-center justify-center">
            <span className="text-xs text-slate-400">QR code here</span>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700">Patient Name</p>
            <p className="text-xs text-slate-400 mt-1">MRN · DOB · Blood Type</p>
          </div>
          <button className="w-full py-2 px-4 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors">
            Download Card
          </button>
        </div>
      </div>
    </div>
  );
}
