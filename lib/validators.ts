export const rules = {
  title: [
    { required: true, message: 'العنوان مطلوب' },
    { min: 5, message: 'العنوان قصير جداً' },
    { max: 120, message: 'العنوان طويل جداً' },
  ],
  slug: [
    { required: true, message: 'الربط (Slug) مطلوب' },
    { pattern: /^[a-z0-9-]+$/, message: 'يمكن استخدام أحرف إنجليزية وأرقام و- فقط' },
  ],
  excerpt: [
    { min: 20, message: 'الملخص قصير جداً' },
    { max: 300, message: 'الملخص طويل جداً' },
  ],
};

export function slugify(input: string) {
  return input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}
