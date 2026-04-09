import { createShioriSchema } from "@/app/create/schema";

/** しおり編集フォームのバリデーションスキーマ（passphrase を除いた作成スキーマ） */
export const updateShioriSchema = createShioriSchema.omit({ passphrase: true });
