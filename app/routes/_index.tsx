import { Action } from "@prisma/client";
import type { MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";

import Actions from "~/components/chat/actions";
import APIActionForm from "~/components/chat/api-action-form";
import Chat from "~/components/chat/chat";
import RawActionForm from "~/components/chat/raw-action-form";
import { Card } from "~/components/ui/card";

export const meta: MetaFunction = () => [{ title: "Helper - demo" }];

export default function App() {
  const [actions, setActions] = useState<Action[]>([]);

  useEffect(() => {
    fetch("/api/actions")
      .then((res) => res.json())
      .then((data) => setActions(data.actions));
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden p-4">
      <Card className="w-full h-full">
        <div className="grid grid-cols-10 h-full w-full overflow-y-auto">
          <div className="w-full h-full col-span-3 flex flex-col gap-4 p-4 border-r border-gray-200 overflow-y-auto">
            <div className="flex w-full items-center justify-start gap-2">
              <RawActionForm actions={actions} setActions={setActions} />
              <APIActionForm actions={actions} setActions={setActions} />
            </div>
            <Actions actions={actions} setActions={setActions} />
          </div>
          <Chat actions={actions} />
        </div>
      </Card>
    </div>
  );
}
