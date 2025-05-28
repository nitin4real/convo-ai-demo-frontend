import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

export const MetaDataView = ({
    metaData
}: {
    metaData: any[]
}) => {
    return (
        <Card className="shadow-lg h-full">
            <CardHeader className="border-b">
                <CardTitle className="text-2xl">Meta Data</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="h-[600px] overflow-y-auto">
                    {metaData.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            No meta data yet
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {metaData.map((message, index) => (
                                <div
                                    key={index}
                                    className={`p-3 rounded-lg ${message.speaker === 'user'
                                        ? 'bg-primary/10 ml-4'
                                        : 'bg-muted mr-4'
                                        }`}
                                >
                                    <div className="font-medium mb-1">
                                        <div className="text-sm overflow-x-auto">{JSON.parse(message?.message)?.textToDisplay || ''}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}