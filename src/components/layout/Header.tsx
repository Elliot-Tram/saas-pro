import { getSession } from "@/lib/auth";

interface HeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export async function Header({ title, description, children }: HeaderProps) {
  const session = await getSession();

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {children}
        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
            {session?.name?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
      </div>
    </div>
  );
}
