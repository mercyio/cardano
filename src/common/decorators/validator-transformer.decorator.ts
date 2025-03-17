import { Transform } from 'class-transformer';

export function TransformToType(
  type: 'number' | 'boolean' | 'object' | 'array' | 'date',
) {
  return Transform(({ value }) => {
    if (value === undefined || value === null) {
      return value;
    }

    switch (type) {
      case 'number':
        return Number(value);
      case 'boolean':
        return value === 'true' || value === '1' || value === 1;
      case 'object':
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      case 'array':
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          return value.split(',').map((item) => item.trim());
        }
      case 'date':
        return new Date(value);
      default:
        return value;
    }
  });
}
