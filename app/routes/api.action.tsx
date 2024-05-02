import { ActionFunctionArgs, json } from "@remix-run/node";

import {
  createAction,
  deleteAction,
  updateAction,
} from "~/models/action.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const body = await request.json();
  const method = request.method;

  switch (method) {
    case "POST": {
      if (body.method) {
        body.requiresParams = true;
      }
      console.log("Creating action: ", body);
      const action = await createAction(body);
      return json({ action });
    }
    case "PUT": {
      const action = await updateAction(body.id, body.data);
      return json({ action });
    }
    case "DELETE": {
      const action = await deleteAction(body.id);
      return json({ action });
    }
    default: {
      return json({ error: "Method not allowed" }, { status: 405 });
    }
  }
};
