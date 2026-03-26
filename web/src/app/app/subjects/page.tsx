import { SubjectCard } from "@/components/subject-card";
import { getSubjects } from "@/lib/data/catalog";

export default function SubjectsPage() {
  const subjects = getSubjects();

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="eyebrow">Subjects</p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-950">Start with one flagship subject</h1>
        <p className="max-w-3xl text-sm leading-7 text-slate-600">
          Keep the launch scope narrow and strong. LearnX starts with DBMS and EDC so the experience stays focused.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {subjects.map((subject) => (
          <SubjectCard key={subject.id} subject={subject} />
        ))}
      </div>
    </section>
  );
}
