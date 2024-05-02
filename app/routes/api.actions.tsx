import { json } from "@remix-run/node";

import { getActions } from "~/models/action.server";

export const loader = async () => {
  return json({ actions: await getActions() });
};
