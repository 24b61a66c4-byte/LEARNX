import { SubjectsPanel } from "@/components/subjects-panel";
import { getSubjects } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";

export default function SubjectsPage() {
  const subjects = getSubjects();

  return (
    <section className="animate-fade-in">
      <SubjectsPanel subjects={subjects} />
    </section>
  );
}
