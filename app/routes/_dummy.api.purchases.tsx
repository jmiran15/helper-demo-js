import { ActionFunctionArgs, json } from "@remix-run/node";

export const action = async ({ request }: ActionFunctionArgs) => {
  const body = JSON.parse(await request.text());
  return json({
    purchases_for: body.email,
    purchases: [
      {
        id: 1,
        product: "Product 1",
        price: 100,
        date: "2021-01-01",
      },
      {
        id: 2,
        product: "Product 2",
        price: 200,
        date: "2021-02-01",
      },
      {
        id: 3,
        product: "Product 3",
        price: 300,
        date: "2021-03-01",
      },
      {
        id: 4,
        product: "Product 4",
        price: 400,
        date: "2021-04-01",
      },
    ],
  });
};
