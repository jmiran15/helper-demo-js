import { Action, HttpMethod } from "@prisma/client";
import React, { Suspense, useState } from "react";
const CodeEditor = React.lazy(() => import("@uiw/react-textarea-code-editor"));

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import ActionCard from "./action";

export default function APIActionCard({
  action,
  actions,
  setActions,
}: {
  action: Action;
  actions: Action[];
  setActions: (actions: Action[]) => void;
}) {
  const [probe, setProbe] = useState<string>(action.probe ?? "");
  const [method, setMethod] = useState<HttpMethod>(action.method ?? "POST");
  const [fetchUrl, setFetchUrl] = useState<string>(action.fetchUrl ?? "");
  const [inputSchema, setInputSchema] = useState<string>(
    action.inputSchema ? JSON.stringify(action.inputSchema) : "",
  );

  async function handleSubmit() {
    const action_ = await fetch("/api/action", {
      method: "PUT",
      body: JSON.stringify({
        id: action.id,
        data: { probe, method, fetchUrl, inputSchema },
      }),
    })
      .then((res) => res.json())
      .then((data) => data.action);

    const updatedActions = actions.map((a) =>
      a.id === action_.id ? action_ : a,
    );
    setActions(updatedActions);
  }

  return (
    <Dialog>
      <DialogTrigger>
        <ActionCard action={action} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update API call</DialogTitle>
          <DialogDescription>
            Update an API call in the actions list
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Input
            placeholder="Issue a refund to a user"
            value={probe}
            onChange={(e) => setProbe(e.target.value)}
          />
          <Select
            value={method}
            onValueChange={(value) => setMethod(value as HttpMethod)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an HTTP method" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>HTTP methods</SelectLabel>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Input
            placeholder="URL"
            value={fetchUrl}
            onChange={(e) => setFetchUrl(e.target.value)}
          />
          <Suspense>
            <CodeEditor
              value={inputSchema}
              onChange={(e) => setInputSchema(e.target.value)}
              language="json"
              placeholder="Input Schema"
              padding={15}
              style={{
                backgroundColor: "#f5f5f5",
                fontFamily:
                  "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
              }}
            />
          </Suspense>
        </div>
        <DialogFooter>
          <DialogClose>
            <Button
              type="submit"
              className="shadow-sm"
              size="sm"
              onClick={handleSubmit}
            >
              Confirm
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
