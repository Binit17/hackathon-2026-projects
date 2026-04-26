import { AlertTriangle } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div className="bg-amber-50 border-t border-amber-200 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center gap-2 text-amber-700 text-xs">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        <span>For demonstration only. Uses synthetic patient data. Not for clinical use.</span>
      </div>
    </div>
  );
}
