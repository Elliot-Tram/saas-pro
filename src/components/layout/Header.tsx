import { getSession } from "@/lib/auth";
import { UserMenu } from "./UserMenu";

interface HeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export async function Header({ title, description, children }: HeaderProps) {
  const session = await getSession();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        {children}
        <UserMenu
          name={session?.name || "Utilisateur"}
          email={session?.email || ""}
        />
      </div>
    </div>
  );
}
