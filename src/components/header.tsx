import { Search, User } from 'lucide-react';
import Image from 'next/image';

export function Header() {
  return (
    <header className="flex h-16 items-center justify-end border-b bg-white px-4 md:px-8">
      <div className="flex items-center gap-4">
        <div className="relative h-8 w-8 rounded-full overflow-hidden bg-blue-500 ring-2 ring-slate-200">
          <Image
            src="/assets/user-avatar.svg"
            alt="Profile"
            fill
            className="object-cover"
            sizes="32px"
          />
        </div>
      </div>
    </header>
  );
}
