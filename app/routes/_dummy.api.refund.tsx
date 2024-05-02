import { ActionFunctionArgs, json } from "@remix-run/node";

export const action = async ({ request }: ActionFunctionArgs) => {
  const body = JSON.parse(await request.text());
  return json({
    product: body.product,
    email: body.email,
    refund_status: "refunded",
    refund_amount: 300,
  });
};
