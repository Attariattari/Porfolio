import GoalEditor from "../GoalEditor";
export default async function EditGoalPage({ params }) { const { id } = await params; return <GoalEditor goalId={id} />; }
