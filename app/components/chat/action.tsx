import { Action } from "@prisma/client";
const CodeEditor = React.lazy(() => import("@uiw/react-textarea-code-editor"));

import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import React, { Suspense } from "react";

export default function ActionCard({ action }: { action: Action }) {
  return (
    <Card className="w-full p-4 flex flex-col gap-2 items-start">
      <div className="flex items-center justify-between w-full">
        <p className="text-left">{action.probe}</p>
        {action.method && <Badge>{action.method}</Badge>}
      </div>
      {action.fetchUrl && (
        <p className="text-sm text-left">{action.fetchUrl}</p>
      )}
      {action.content && <p className="text-sm text-left">{action.content}</p>}
      {action.inputSchema && <ShowJSON json={action.inputSchema} />}
    </Card>
  );
}

export function ShowJSON({ json }: { json: string }) {
  return (
    <Suspense>
      <CodeEditor
        value={json}
        language="json"
        placeholder="JSON"
        readOnly
        padding={15}
        style={{
          backgroundColor: "#f5f5f5",
          fontFamily:
            "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
          width: "100%",
          borderRadius: "0.375rem",
        }}
      />
    </Suspense>
  );
}
