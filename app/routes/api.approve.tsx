import { ActionFunctionArgs } from "@remix-run/node";
import WebSocket from "ws";

import { pendingApprovals, wss } from "~/websocket";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { id, schema, extracted, probe } = await request.json();

  return new Promise<boolean>((resolve, reject) => {
    pendingApprovals[id] = { resolve, reject };
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({ type: "approve", id, schema, extracted, probe }),
        );
      }
    });
  });
};
