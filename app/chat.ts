import { new_extraction_system, new_extraction_user } from "./prompts";

export interface Action {
  id: string;
  probe: string;
  requiresParams: boolean;
  call: (input?: any) => any;
  schema: any;
}

export interface History {
  role: "query" | "response";
  content: string;
  depth: number;
}

export async function extract({
  actions,
  history,
  action,
}: {
  actions: Action[];
  history: History[];
  action: Action;
}) {
  if (action.requiresParams) {
    const { response: suggestion } = await fetch("/api/claude", {
      method: "POST",
      // send body as json
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: new_extraction_user({
          actions: actions.map((a) => ({ id: a.id, description: a.probe })),
          history,
          pending_schema: action.schema,
        }),
        system: new_extraction_system,
      }),
    }).then((res) => res.json());

    return suggestion;
  } else {
    return JSON.stringify({
      valid: true,
      schema: null,
      extracted: null,
      nextActionId: null,
      reason: null,
    });
  }
}

export async function chat({
  action,
  availableActions,
  depth = 0,
  history = [],
  extraction,
}: {
  action: Action;
  availableActions: Action[];
  depth?: number;
  history?: History[];
  extraction: {
    valid: boolean;
    schema: any | null;
    extracted: any | null;
    nextActionId: string | null;
    reason: string | null;
  };
}): Promise<History[]> {
  // need to add progress check (abort if no progress is made)
  while (!extraction.valid) {
    const nextAction = availableActions.find(
      (a) => a.id === extraction.nextActionId,
    );

    history.push({
      role: "query",
      content: `${nextAction!.probe}\nReason: ${extraction.reason}`,
      depth: depth + 1,
    });

    // a.id === "0" is the "Ask a user ..." action
    availableActions = availableActions.filter(
      (a) => a !== nextAction! || a.id === "0",
    );

    const newExtraction = JSON.parse(
      await extract({
        actions: availableActions,
        history,
        action: nextAction!,
      }),
    );

    history = await chat({
      action: nextAction!,
      availableActions,
      depth: depth + 1,
      history,
      extraction: newExtraction,
    });

    extraction = JSON.parse(
      await extract({
        actions: availableActions,
        history,
        action,
      }),
    );
  }

  // check if requiresParams (if so, request approval to call, o/w send to frontend and call)
  let output;
  if (action.requiresParams) {
    const approved = await fetch("/api/approve", {
      method: "POST",
      body: JSON.stringify({
        id: Date.now().toString(),
        schema: action.schema,
        extracted: extraction.extracted,
        probe: action.probe,
      }),
    });

    if (approved) {
      output = await action.call(extraction.extracted);
    } else {
      return history;
    }
  } else {
    output = await action.call(extraction.extracted);
  }
  await fetch("/api/message", {
    method: "POST",
    body: JSON.stringify({ message: output, probe: action.probe }),
  });

  history.push({
    role: "response",
    content: JSON.stringify(output),
    depth,
  });

  return history;
}
