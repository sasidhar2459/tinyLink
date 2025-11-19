import { User, Mail, Calendar } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Settings</h1>

      {/* User Info */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-slate-900">User Information</h2>
            <p className="text-sm text-slate-500 mt-1">Your account details</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
            <User className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Name</p>
              <p className="text-sm text-slate-900 font-semibold">John Doe</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
            <Mail className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Email</p>
              <p className="text-sm text-slate-900 font-semibold">john.doe@example.com</p>
            </div>
          </div>

          {/* Member Since */}
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
            <Calendar className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Member Since</p>
              <p className="text-sm text-slate-900 font-semibold">November 2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
