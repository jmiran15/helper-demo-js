import { WebSocketServer } from "ws";

export const wss = new WebSocketServer({ port: 8081 });
export const pendingQueries: Record<string, (answer: string | null) => void> =
  {};
export const pendingApprovals: Record<
  string,
  { resolve: (approved: boolean) => void; reject: () => void }
> = {};

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const data = JSON.parse(message.toString());

    if (data.id && pendingQueries[data.id]) {
      pendingQueries[data.id](data.answer);
      delete pendingQueries[data.id];
    }

    if (data.id && pendingApprovals[data.id]) {
      if (data.approved) {
        pendingApprovals[data.id].resolve(true);
      } else {
        pendingApprovals[data.id].reject();
      }
      delete pendingApprovals[data.id];
    }
  });
});
