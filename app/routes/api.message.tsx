import { ActionFunctionArgs } from "@remix-run/node";
import WebSocket from "ws";

import { wss } from "~/websocket";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { message, probe } = await request.json();

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "message", message, probe }));
    }
  });

  return null;
};
