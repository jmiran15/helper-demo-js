import { Action } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getActions() {
  return prisma.action.findMany();
}

export async function createAction(action: Partial<Action>) {
  return prisma.action.create({ data: action });
}

export async function deleteAction(id: string) {
  return prisma.action.delete({ where: { id } });
}

export async function updateAction(id: string, action: Partial<Action>) {
  return prisma.action.update({ where: { id }, data: action });
}
