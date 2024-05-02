import { Action } from "@prisma/client";

import APIActionCard from "./api-action-card";
import RawActionCard from "./raw-action-card";

export default function Actions({
  actions,
  setActions,
}: {
  actions: Action[];
  setActions: (actions: Action[]) => void;
}) {
  return (
    <div className="flex flex-col gap-8 h-full overflow-y-auto ">
      {actions.map((action) =>
        action.method ? (
          <APIActionCard
            key={action.id}
            action={action}
            actions={actions}
            setActions={setActions}
          />
        ) : (
          <RawActionCard
            key={action.id}
            action={action}
            actions={actions}
            setActions={setActions}
          />
        ),
      )}
    </div>
  );
}
