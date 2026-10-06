import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Bug,
    Clock3,
    FileCode2,
    Network,
    UserRound,
} from 'lucide-react';
import ErrorLogController from '@/actions/App/Http/Controllers/ErrorLogController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { Separator } from '@/components/ui/separator';

type ErrorLog = {
    id: number;
    app: string | null;
    class: string;
    message: string;
    file: string;
    line: number;
    trace: string;
    url: string | null;
    method: string | null;
    user_id: number | null;
    ip: string | null;
    count: number;
    context: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
    user: { id: number; name: string } | null;
};

type ErrorLogShowProps = {
    errorLog: ErrorLog;
};

function DetailItem({
    label,
    value,
}: {
    label: string;
    value: string | number | null;
}) {
    return (
        <div className="flex min-w-0 flex-col gap-1">
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {label}
            </dt>
            <dd className="text-sm break-all">{value ?? '—'}</dd>
        </div>
    );
}

export default function ErrorLogShow({ errorLog }: ErrorLogShowProps) {
    return (
        <>
            <Head title={`Error #${errorLog.id}`} />

            <main className="flex flex-col gap-6 p-4 md:p-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-col gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="w-fit"
                        >
                            <Link href={ErrorLogController.index()}>
                                <ArrowLeft data-icon="inline-start" />
                                All error logs
                            </Link>
                        </Button>
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="destructive">
                                {errorLog.class.split('\\').pop()}
                            </Badge>
                            <Badge variant="outline">
                                Error #{errorLog.id}
                            </Badge>
                            <Badge variant="secondary">
                                {errorLog.count}{' '}
                                {errorLog.count === 1
                                    ? 'occurrence'
                                    : 'occurrences'}
                            </Badge>
                            {errorLog.method && (
                                <Badge variant="secondary">
                                    {errorLog.method}
                                </Badge>
                            )}
                        </div>
                        <h1 className="max-w-4xl text-2xl font-semibold tracking-tight md:text-3xl">
                            {errorLog.message}
                        </h1>
                    </div>
                    <p className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
                        <Clock3 className="size-4" />
                        {new Date(errorLog.created_at).toLocaleString()}
                    </p>
                </header>

                <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(17rem,0.35fr)]">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <FileCode2 className="text-primary" />
                                <CardTitle>Stack trace</CardTitle>
                            </div>
                            <CardDescription>
                                Use the first application frame to find where
                                the error originated.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {errorLog.trace ? (
                                <pre className="max-h-[36rem] overflow-auto rounded-lg bg-muted p-4 text-xs leading-relaxed break-all whitespace-pre-wrap">
                                    {errorLog.trace}
                                </pre>
                            ) : (
                                <Empty className="rounded-lg border border-dashed">
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <Bug />
                                        </EmptyMedia>
                                        <EmptyTitle>
                                            No trace available
                                        </EmptyTitle>
                                        <EmptyDescription>
                                            This record does not include a stack
                                            trace.
                                        </EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Error context</CardTitle>
                            <CardDescription>
                                Request and runtime details captured with this
                                exception.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <dl className="flex flex-col gap-4">
                                <DetailItem
                                    label="Application"
                                    value={errorLog.app}
                                />
                                <Separator />
                                <DetailItem
                                    label="Source file"
                                    value={`${errorLog.file}:${errorLog.line}`}
                                />
                                <Separator />
                                <DetailItem label="URL" value={errorLog.url} />
                                <Separator />
                                <DetailItem
                                    label="IP address"
                                    value={errorLog.ip}
                                />
                                <Separator />
                                <DetailItem
                                    label="Reported user"
                                    value={
                                        errorLog.user?.name ??
                                        (errorLog.user_id
                                            ? `User #${errorLog.user_id}`
                                            : null)
                                    }
                                />
                            </dl>
                        </CardContent>
                    </Card>
                </div>

                {errorLog.context && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Network className="text-primary" />
                                <CardTitle>Custom context</CardTitle>
                            </div>
                            <CardDescription>
                                Structured metadata attached by the application.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <pre className="overflow-auto rounded-lg bg-muted p-4 text-xs leading-relaxed break-all whitespace-pre-wrap">
                                {JSON.stringify(errorLog.context, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                )}

                {errorLog.user && (
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                        <UserRound className="size-4" />
                        Logged while signed in as {errorLog.user.name}.
                    </p>
                )}
            </main>
        </>
    );
}

ErrorLogShow.layout = {
    breadcrumbs: [
        {
            title: 'Error logs',
            href: ErrorLogController.index(),
        },
        {
            title: 'Error details',
            href: '#',
        },
    ],
};
