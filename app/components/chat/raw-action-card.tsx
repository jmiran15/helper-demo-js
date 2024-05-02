import { Action } from "@prisma/client";
import { useState } from "react";

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
import { Textarea } from "../ui/textarea";

import ActionCard from "./action";

export default function RawActionCard({
  action,
  actions,
  setActions,
}: {
  action: Action;
  actions: Action[];
  setActions: (actions: Action[]) => void;
}) {
  const [probe, setProbe] = useState<string>(action.probe ?? "");
  const [content, setContent] = useState<string>(action.content ?? "");

  async function handleSubmit() {
    const action_ = await fetch("/api/action", {
      method: "PUT",
      body: JSON.stringify({
        id: action.id,
        data: { probe, content },
      }),
    })
      .then((res) => res.json())
      .then((data) => data.action);

    action.id,
      {
        probe,
        content,
      };

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
          <DialogTitle>Update raw data</DialogTitle>
          <DialogDescription>
            Update raw data in the actions list
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
