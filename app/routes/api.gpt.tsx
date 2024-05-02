import { ActionFunctionArgs, json } from "@remix-run/node";
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const { user, system } = await request.json();

  const msg = await openai.chat.completions.create({
    model: "gpt-4",
    max_tokens: 3500,
    temperature: 0,
    messages: [
      {
        role: "system",
        content: system,
      },
      {
        role: "user",
        content: user,
      },
    ],
  });

  return json({
    response: msg.choices[0].message.content,
  });
};
