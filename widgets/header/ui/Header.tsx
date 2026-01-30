interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="p-4 bg-white shadow">
      <h1 className="text-2xl font-bold">{title}</h1>
    </header>
  );
}
