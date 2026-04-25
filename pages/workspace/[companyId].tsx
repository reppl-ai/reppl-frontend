import Head from "next/head";
import { useRouter } from "next/router";

import { WorkspaceClient } from "../../components/reppl/workspace/WorkspaceClient";

export default function WorkspacePage() {
  const router = useRouter();
  const id = typeof router.query.companyId === "string" ? router.query.companyId : null;

  return (
    <>
      <Head>
        <title>REPPL // WORKSPACE</title>
        <meta content="Intelligence operations center" name="description" />
      </Head>
      {id ? <WorkspaceClient companyId={id} /> : (
        <div className="reppl-shell flex min-h-screen items-center justify-center p-4">
          <p className="font-mono text-sm">[NO COMPANY]</p>
        </div>
      )}
    </>
  );
}
