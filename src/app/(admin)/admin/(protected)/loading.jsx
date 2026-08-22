import AdminPageLoader from "@/components/admin/AdminPageLoader";

export default function AdminProtectedLoading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <AdminPageLoader
        title="Loading Workspace Telemetry"
        message="Retrieving protected records and system intelligence..."
        badge="Control Center Engine"
      />
    </div>
  );
}
