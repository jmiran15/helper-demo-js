import { Action } from "@prisma/client";
import { useState } from "react";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

export default function RawActionForm({
  actions,
  setActions,
}: {
  actions: Action[];
  setActions: (actions: Action[]) => void;
}) {
  const [probe, setProbe] = useState<string>("");
  const [content, setContent] = useState<string>("");

  async function handleSubmit() {
    const action_ = await fetch("/api/action", {
      method: "POST",
      body: JSON.stringify({
        probe,
        content,
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
          Add data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add raw data</DialogTitle>
          <DialogDescription>
            Add raw data to the actions list
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Input
            placeholder="Get a information about Gumroad's refund policy"
            value={probe}
            onChange={(e) => setProbe(e.target.value)}
          />
          <Textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
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
