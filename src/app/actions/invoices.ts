"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { generateNumber } from "@/lib/utils";
import { redirect } from "next/navigation";

export async function createInvoice(_prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const clientId = formData.get("clientId") as string;
  const date = formData.get("date") as string;
  const dueDate = formData.get("dueDate") as string;
  const taxRate = parseFloat(formData.get("taxRate") as string) || 20;

  if (!clientId) {
    return { error: "Veuillez sélectionner un client" };
  }

  // Parse line items
  const items: { description: string; quantity: number; unitPrice: number; total: number }[] = [];
  let index = 0;
  while (formData.has(`item_description_${index}`)) {
    const description = formData.get(`item_description_${index}`) as string;
    const quantity = parseFloat(formData.get(`item_quantity_${index}`) as string) || 0;
    const unitPrice = parseFloat(formData.get(`item_unitPrice_${index}`) as string) || 0;

    if (description && quantity > 0 && unitPrice > 0) {
      items.push({
        description,
        quantity,
        unitPrice,
        total: quantity * unitPrice,
      });
    }
    index++;
  }

  if (items.length === 0) {
    return { error: "Ajoutez au moins une ligne de facturation" };
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  // Generate invoice number
  const count = await prisma.invoice.count({ where: { teamId: session.teamId } });
  const number = generateNumber("FAC", count);

  await prisma.invoice.create({
    data: {
      number,
      status: "draft",
      date: new Date(date),
      dueDate: dueDate ? new Date(dueDate) : null,
      subtotal,
      taxRate,
      tax,
      total,
      clientId,
      teamId: session.teamId,
      items: {
        create: items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
      },
    },
  });

  redirect("/invoices");
}

export async function updateInvoiceStatus(id: string, status: string) {
  const session = await getSession();
  if (!session) redirect("/login");

  await prisma.invoice.update({
    where: { id, teamId: session.teamId },
    data: { status },
  });
}

export async function deleteInvoice(id: string) {
  const session = await getSession();
  if (!session) redirect("/login");

  await prisma.invoice.delete({
    where: { id, teamId: session.teamId },
  });

  redirect("/invoices");
}
