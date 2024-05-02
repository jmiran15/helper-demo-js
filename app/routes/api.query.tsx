import { ActionFunctionArgs } from "@remix-run/node";
import WebSocket from "ws";

import { pendingQueries, wss } from "~/websocket";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { query, suggestion } = await request.json();

  const id = Date.now().toString();

  return new Promise<string>((resolve) => {
    pendingQueries[id] = resolve;
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "query", id, query, suggestion }));
      }
    });
  });
};
