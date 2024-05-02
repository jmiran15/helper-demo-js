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
import { Textarea } from "../ui/textarea";

export default function APIActionForm({
  actions,
  setActions,
}: {
  actions: Action[];
  setActions: (actions: Action[]) => void;
}) {
  const [probe, setProbe] = useState<string>("");
  const [method, setMethod] = useState<HttpMethod>("POST" as HttpMethod);
  const [fetchUrl, setFetchUrl] = useState<string>("");
  const [inputSchema, setInputSchema] = useState<string>("");
  const [outputSchema, setOutputSchema] = useState<string>("");

  async function handleSubmit() {
    const action_ = await fetch("/api/action", {
      method: "POST",
      body: JSON.stringify({
        probe,
        method,
        fetchUrl,
        inputSchema,
        outputSchema,
      }),
    })
      .then((res) => res.json())
      .then((data) => data.action);
    setActions([...actions, action_]);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="shadow-sm">
          Add API call
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add raw data</DialogTitle>
          <DialogDescription>
            Add an API call to the actions list
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
