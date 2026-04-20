import { h } from 'vue';

import { Tag } from 'ant-design-vue';

/**
 * Render dict tag
 * @param value dict value
 * @param dictOptions dict options list
 */
export function renderDict(
  value: number | string,
  dictOptions: { color?: string; label: string; value: number | string }[],
) {
  const item = dictOptions.find((d) => d.value === value);
  if (!item) return h('span', {}, value);
  return h(Tag, { color: item.color }, () => item.label);
}
