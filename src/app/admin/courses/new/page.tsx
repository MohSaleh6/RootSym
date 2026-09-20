import { AdminTitle } from "../../ui";
import CourseForm, { EMPTY_COURSE } from "../CourseForm";

export const metadata = { title: "New workshop" };

export default function NewCoursePage() {
  return (
    <div className="space-y-8">
      <AdminTitle title="New workshop" subtitle="Everything you fill in here appears on the public site." />
      <CourseForm initial={EMPTY_COURSE} />
    </div>
  );
}
