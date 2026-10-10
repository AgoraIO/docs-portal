// 搜索产品 ID 跟随中文导航；API/FAQ 的历史名称在此统一，文档 URL 保持原样。
const aliases = new Map([
  ['cloud-transcoding', 'transcoding'],
  ['signaling', 'rtm'],
]);

export function normalizeCnProduct(product: string): string {
  return aliases.get(product) ?? product;
}
