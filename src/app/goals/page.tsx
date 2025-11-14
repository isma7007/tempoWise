import { GoalsList } from "@/components/goals-list";

export default function GoalsPage() {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                 <h1 className="text-3xl font-bold">Goals</h1>
            </div>
            <GoalsList />
        </div>
    )
}
