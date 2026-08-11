import raw from './blogs.json';

export type Post = {
  id: string;
  date: string;
  title: string;
  /** Original post markup, carried over verbatim from the hand-written pages. */
  body: string;
};

export type Course = {
  slug: string;
  course: string;
  subtitle: string;
  posts: Post[];
};

export const courses: Course[] = (raw as Omit<Course, 'slug'>[]).map((c) => ({
  ...c,
  slug: c.course.toLowerCase().replace(/\s+/g, '-'),
}));

export function courseBySlug(slug?: string) {
  return courses.find((c) => c.slug === slug);
}
