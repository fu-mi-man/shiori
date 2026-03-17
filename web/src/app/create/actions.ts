"use server";

import { createShioriSchema } from "./schema";

export type CreateShioriState = {
  status: "idle" | "error";
  message: string;
};

export async function createShiori(
  _prevState: CreateShioriState,
  formData: FormData,
): Promise<CreateShioriState> {
  const rawData = {
    title: formData.get("title"),
    passphrase: formData.get("passphrase"),
    overviews: JSON.parse(formData.get("overviews") as string),
    days: JSON.parse(formData.get("days") as string),
    startDate: formData.get("startDate"),
  };

  const result = createShioriSchema.safeParse(rawData);

  if (!result.success) {
    return {
      status: "error",
      message: result.error.issues[0].message,
    };
  }

  // TODO: DB保存
  // TODO: リダイレクト

  return { status: "idle", message: "" };
}
