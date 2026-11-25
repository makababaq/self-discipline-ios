export function numberOptions(min, max, format = String, step = 1) {
  return Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, index) => {
    const value = min + index * step;
    return { value, label: format(value) };
  });
}

const decimals = numberOptions(0, 9, (value) => `.${value}`);

export function weightPicker(weight, onSelect, { min = 25, max = 250 } = {}) {
  const maxTenths = Math.round(max * 10);
  const maxWhole = Math.floor(maxTenths / 10);
  const tenths = Math.max(min * 10, Math.min(maxTenths, Math.round(weight * 10)));
  const kilograms = numberOptions(min, maxWhole, (value) => `${value} kg`);
  return {
    initialValues: { whole: Math.floor(tenths / 10), decimal: tenths % 10 },
    columns: ({ whole }) => [
      { id: 'whole', label: '公斤', options: kilograms },
      { id: 'decimal', label: '小数', options: whole === maxWhole ? decimals.slice(0, maxTenths % 10 + 1) : decimals }
    ],
    onConfirm: ({ whole, decimal }) => onSelect(whole + decimal / 10)
  };
}
