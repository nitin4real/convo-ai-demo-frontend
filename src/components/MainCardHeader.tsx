import { AgentTile } from "@/types/agent.types";
import { AIAgentIcon } from "./AIAgentIcon";
import { CardHeader } from "./ui/card";
import { CardTitle } from "./ui/card";

export const MainCardHeader = ({ agentDetails, isAgentStarted, remainingTime }: { agentDetails: AgentTile | null, isAgentStarted: boolean, remainingTime: number | null }) => {
    return <CardHeader className="border-b">
        <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-2xl">
                <AIAgentIcon size="md" variant="glow" />
                <span>{agentDetails?.title || 'Agent Interface'}</span>
            </CardTitle>
            {isAgentStarted && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span>Active</span>
                    {remainingTime !== null && (
                        <span className="ml-2 text-muted-foreground">
                            {String(Math.floor(remainingTime / 60)).padStart(2, '0')}:{Math.floor(remainingTime % 60).toString().padStart(2, '0')}
                        </span>
                    )}
                </div>
            )}
        </div>
    </CardHeader>;
}