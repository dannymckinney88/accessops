interface DashboardHeaderProps {
  subtitle: string;
}

const DashboardHeader = ({ subtitle }: DashboardHeaderProps) => {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
};

export default DashboardHeader;
