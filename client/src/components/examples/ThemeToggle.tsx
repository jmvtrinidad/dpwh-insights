import ThemeToggle from '../ThemeToggle';

export default function ThemeToggleExample() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-4">
        <span>Theme Toggle:</span>
        <ThemeToggle />
      </div>
      <div className="mt-4 p-4 bg-card border border-card-border rounded-md">
        <p className="text-card-foreground">
          This card will change appearance when you toggle the theme.
        </p>
      </div>
    </div>
  );
}