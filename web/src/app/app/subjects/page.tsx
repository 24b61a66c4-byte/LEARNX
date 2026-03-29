import { SubjectsPanel } from "@/components/subjects-panel";
import { getSubjects } from "@/lib/data/catalog";

export default function SubjectsPage() {
  const subjects = getSubjects();

  return <SubjectsPanel subjects={subjects} />;
}
