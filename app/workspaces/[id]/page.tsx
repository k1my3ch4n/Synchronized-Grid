import { WorkspaceDetailPage } from "@views/workspace-detail";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <WorkspaceDetailPage workspaceId={id} />;
}
