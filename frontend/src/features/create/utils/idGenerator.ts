/**
 * 一意のIDを生成する関数
 * crypto.randomUUID() を使用してUUIDを生成
 */
export const generateId = (): string => {
  return crypto.randomUUID()
}
