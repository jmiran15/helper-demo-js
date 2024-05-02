import { ActionFunctionArgs, json } from "@remix-run/node";

export const action = async ({ request }: ActionFunctionArgs) => {
  const body = JSON.parse(await request.text());
  return json({
    email: body.email ?? "test@test.com",
    accountType: "individual",
    lastDividentAmount: 40,
    minimumDividendSetting: 100,
  });
};
