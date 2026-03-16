"use server";

export type CreateShioriState = {
  message: string;
};

export async function createShiori(
  prevState: CreateShioriState,
  formData: FormData,
): Promise<CreateShioriState> {
  const title = formData.get("title") as string;
  const passphrase = formData.get("passphrase") as string;
  const overviews = JSON.parse(formData.get("overviews") as string);
  const days = JSON.parse(formData.get("days") as string);
  const startDate = formData.get("startDate") as string;

  // TODO: Zodバリデーション
  // TODO: DB保存
  // TODO: リダイレクト
  console.log("Server Action called:", { title, passphrase, overviews, days, startDate });

  return { message: "" };
}
