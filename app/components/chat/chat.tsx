import { Action } from "@prisma/client";
import cuid from "cuid";
import React, { useEffect, useMemo, useRef, useState } from "react";
const CodeEditor = React.lazy(() => import("@uiw/react-textarea-code-editor"));

import { chat, extract } from "~/chat";
import { useScrollToBottom } from "~/hooks/use-scroll";
import { cn } from "~/lib/utils";

import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";

import ChatInput from "./chat-input";
import { ShowJSON } from "./action";

const CHAT_PAGE_SIZE = 15;

export default function Chat({ actions }: { actions: Action[] }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [queryAnswers, setQueryAnswers] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { scrollRef, setAutoScroll, scrollDomToBottom } = useScrollToBottom();

  const formattedActions = actions.map((action) => ({
    id: action.id,
    probe: action.probe ?? "No probe",
    requiresParams: action.requiresParams ?? false,
    call: action.fetchUrl
      ? async (input: any) => {
          const completion = await fetch(`${action.fetchUrl}`, {
            method: action.method ?? "POST",
            body: action.requiresParams ? JSON.stringify(input) : null,
          });

          return (await completion.json()) || "{ error: 'No response' }";
        }
      : async () => {
          return action.content;
        },
    schema: action.inputSchema,
  }));

  // should probably make this a hook
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8081");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "query") {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "query", id: data.id, query: data.query },
        ]);
        setQueryAnswers((prevAnswers) => ({
          ...prevAnswers,
          [data.id]: data.suggestion,
        }));
      } else if (data.type === "message") {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "message", message: data.message, probe: data.probe },
        ]);
      } else if (data.type === "approve") {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            type: "approve",
            id: data.id,
            schema: data.schema,
            extracted: data.extracted,
            probe: data.probe,
          },
        ]);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue || inputValue === "") return false;

    setMessages((prevMessages) => [
      ...prevMessages,
      { type: "user", message: inputValue },
    ]);
    setInputValue("");

    setIsChatLoading(true);

    const history = [
      {
        role: "query",
        content: inputValue,
        depth: 0,
      },
    ];

    const action = {
      id: cuid(),
      probe: inputValue,
      requiresParams: true,
      call: (input: any) => input.response ?? input,
      schema: {
        $schema: "http://json-schema.org/draft-07/schema#",
        title: "The response schema",
        type: "object",
        properties: {
          response: {
            type: "string",
            description: `A properly formatted customer support email that fulfills the entirety of the user query: ${inputValue}`,
          },
        },
        required: ["response"],
      },
    };

    // initial extraction
    const extraction_ = JSON.parse(
      await extract({
        actions: formattedActions,
        history,
        action,
      }),
    );

    const chatResult = await chat({
      action,
      availableActions: formattedActions,
      depth: 0,
      history,
      extraction: extraction_,
    });

    console.log("Chat result: ", chatResult);

    setIsChatLoading(false);
  };

  const handleQuerySubmit = async (id: string) => {
    const answer = queryAnswers[id];
    const ws = new WebSocket("ws://localhost:8081");
    ws.onopen = () => {
      ws.send(JSON.stringify({ id, answer }));
      setQueryAnswers((prevAnswers) => {
        const { [id]: _, ...rest } = prevAnswers;
        return rest;
      });
      setMessages((prevMessages) =>
        prevMessages.filter((message) => message.id !== id),
      );
      ws.close();
    };
  };

  const handleAbort = (id: string) => {
    const ws = new WebSocket("ws://localhost:8081");
    ws.onopen = () => {
      ws.send(JSON.stringify({ id, answer: null }));
      setMessages((prevMessages) =>
        prevMessages.filter((message) => message.id !== id),
      );
      ws.close();
    };
  };

  const handleApprove = (id: string) => {
    const ws = new WebSocket("ws://localhost:8081");
    ws.onopen = () => {
      ws.send(JSON.stringify({ id, approved: true }));
      setMessages((prevMessages) =>
        prevMessages.filter((message) => message.id !== id),
      );
      ws.close();
    };
  };

  const [msgRenderIndex, _setMsgRenderIndex] = useState(
    Math.max(0, messages.length - CHAT_PAGE_SIZE),
  );

  function setMsgRenderIndex(newIndex: number) {
    newIndex = Math.min(messages.length - CHAT_PAGE_SIZE, newIndex);
    newIndex = Math.max(0, newIndex);
    _setMsgRenderIndex(newIndex);
  }

  const msgs = useMemo(() => {
    const endRenderIndex = Math.min(
      msgRenderIndex + 3 * CHAT_PAGE_SIZE,
      messages.length,
    );
    return messages.slice(msgRenderIndex, endRenderIndex);
  }, [msgRenderIndex, messages]);

  const onChatBodyScroll = (e: HTMLElement) => {
    const bottomHeight = e.scrollTop + e.clientHeight;
    const edgeThreshold = e.clientHeight;

    const isTouchTopEdge = e.scrollTop <= edgeThreshold;
    const isTouchBottomEdge = bottomHeight >= e.scrollHeight - edgeThreshold;
    const isHitBottom = bottomHeight >= e.scrollHeight - 10;

    const prevPageMsgIndex = msgRenderIndex - CHAT_PAGE_SIZE;
    const nextPageMsgIndex = msgRenderIndex + CHAT_PAGE_SIZE;

    if (isTouchTopEdge && !isTouchBottomEdge) {
      setMsgRenderIndex(prevPageMsgIndex);
    } else if (isTouchBottomEdge) {
      setMsgRenderIndex(nextPageMsgIndex);
    }

    setAutoScroll(isHitBottom);
  };

  function scrollToBottom() {
    setMsgRenderIndex(messages.length - CHAT_PAGE_SIZE);
    scrollDomToBottom();
  }

  return (
    <div className="w-full h-full col-span-7 flex flex-col relative grow-0">
      <ScrollArea
        ref={scrollRef}
        className="flex-1 overflow-auto overflow-x-hidden relative overscroll-none p-4"
        onMouseDown={() => inputRef.current?.blur()}
        onScroll={(e) => onChatBodyScroll(e.currentTarget)}
        onTouchStart={() => {
          inputRef.current?.blur();
          setAutoScroll(false);
        }}
      >
        <div className="space-y-5">
          {msgs.map((message, index) => {
            const isUser = message.type === "user";

            return (
              <div className="space-y-5" key={index}>
                <div
                  className={
                    isUser
                      ? "flex flex-row-reverse"
                      : "flex flex-row last:animate-[slide-in_ease_0.3s]"
                  }
                >
                  <div
                    className={cn(
                      "max-w-[80%] flex flex-col items-start",
                      isUser && "items-end",
                    )}
                  >
                    {message.type === "query" && (
                      <QueryMessage
                        message={message}
                        queryAnswers={queryAnswers}
                        setQueryAnswers={setQueryAnswers}
                        handleQuerySubmit={handleQuerySubmit}
                        handleAbort={handleAbort}
                      />
                    )}
                    {message.type === "message" && (
                      <UpdateMessage message={message} />
                    )}
                    {message.type === "approve" && (
                      <ApproveMessage
                        message={message}
                        handleApprove={handleApprove}
                        handleAbort={handleAbort}
                      />
                    )}
                    {message.type === "user" && (
                      <UserMessage message={message.message} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <Separator />

      <div className="relative w-full box-border flex-col p-4 space-y-2 ">
        <ChatInput
          userInput={inputValue}
          setUserInput={setInputValue}
          inputRef={inputRef}
          handleSendMessage={handleSubmit}
          scrollToBottom={scrollToBottom}
          setAutoScroll={setAutoScroll}
          isSubmitting={isChatLoading}
        />
      </div>
    </div>
  );
}

function QueryMessage({
  message,
  queryAnswers,
  setQueryAnswers,
  handleQuerySubmit,
  handleAbort,
}: {
  message: any;
  queryAnswers: Record<string, string>;
  setQueryAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleQuerySubmit: (id: string) => void;
  handleAbort: (id: string) => void;
}) {
  console.log("Query message: ", message);

  return (
    <div className="bg-muted box-border max-w-full text-sm select-text relative break-words px-3 py-2 p-4 rounded-md">
      <p>{message.query}</p>
      <Textarea
        value={queryAnswers[message.id] || ""}
        onChange={(e) =>
          setQueryAnswers((prevAnswers) => ({
            ...prevAnswers,
            [message.id]: e.target.value,
          }))
        }
        rows={3}
      />
      <div className="flex mt-2 gap-2">
        <Button onClick={() => handleQuerySubmit(message.id)}>Submit</Button>
        <Button variant={"destructive"} onClick={() => handleAbort(message.id)}>
          Abort
        </Button>
      </div>
    </div>
  );
}

function UpdateMessage({ message }: { message: any }) {
  console.log("Update message: ", message);
  return (
    <div className="bg-muted box-border max-w-full text-sm select-text relative break-words px-3 py-2 p-4 rounded-md">
      <p>Got response for: {message.probe ?? "No probe provided"}</p>
      <pre className="text-wrap">
        {JSON.stringify(message.message, null, 2)}
      </pre>
    </div>
  );
}

function ApproveMessage({
  message,
  handleApprove,
  handleAbort,
}: {
  message: any;

  handleApprove: (id: string) => void;
  handleAbort: (id: string) => void;
}) {
  console.log("Approve message: ", message);

  return (
    <div className="box-border max-w-full text-sm select-text relative break-words px-3 py-2 p-4 rounded-md bg-yellow-100 ">
      <p>Approval for action: {message.probe ?? "No probe provided"}</p>
      <pre className="text-wrap">
        {JSON.stringify(message.extracted, null, 2)}
      </pre>
      <div className="flex mt-2 gap-2">
        <Button onClick={() => handleApprove(message.id)}>Approve</Button>
        <Button variant={"destructive"} onClick={() => handleAbort(message.id)}>
          Abort
        </Button>
      </div>
    </div>
  );
}

function UserMessage({ message }: { message: string }) {
  console.log("User message: ", message);
  return (
    <div className="box-border max-w-full text-sm select-text relative break-words px-3 py-2 p-4 rounded-md ml-auto bg-primary text-primary-foreground">
      <p>{message}</p>
    </div>
  );
}
