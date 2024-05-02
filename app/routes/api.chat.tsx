import { ActionFunctionArgs } from "@remix-run/node";

import { chat } from "~/chat";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { action, availableActions, depth, history, extraction } =
    await request.json();

  return chat({ action, availableActions, depth, history, extraction });
};
