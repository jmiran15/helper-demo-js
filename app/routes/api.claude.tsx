import Anthropic from "@anthropic-ai/sdk";
import { ActionFunctionArgs, json } from "@remix-run/node";

if (!process.env.MODEL || !process.env.ANTHROPIC_API_KEY) {
  throw new Error("Missing required environment variables.");
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const { user, system } = await request.json();

  const msg = await anthropic.messages.create({
    model: process.env.MODEL,
    max_tokens: 3500,
    system,
    messages: [
      {
        role: "user",
        content: user,
      },
    ],
  });

  return json({
    response: msg.content[0].text,
  });
};
