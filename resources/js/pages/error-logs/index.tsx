import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Bug,
    Check,
    ChevronLeft,
    ChevronRight,
    Clock3,
    ExternalLink,
    FileWarning,
    RotateCcw,
    Trash2,
} from 'lucide-react';
import ErrorLogController, {
    destroy as destroyErrorLog,
    resolve as resolveErrorLog,
} from '@/actions/App/Http/Controllers/ErrorLogController';
import ProductController from '@/actions/App/Http/Controllers/ProductController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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

type ErrorLogRow = {
    id: number;
    app: string | null;
    class: string;
    message: string;
    file: string;
    line: number;
    url: string | null;
    method: string | null;
    ip: string | null;
    count: number;
    resolved_at: string | null;
    created_at: string;
    user: { id: number; name: string } | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type ErrorLogPageProps = {
    errorLogs: {
        data: ErrorLogRow[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
        total: number;
    };
};

function displayPaginationLabel(label: string): string {
    return label.replace('&laquo;', '‹').replace('&raquo;', '›');
}

function resolveErrorLogItem(id: number): void {
    router.patch(resolveErrorLog.url(id), {}, { preserveScroll: true });
}

function deleteErrorLogItem(id: number): void {
    if (!window.confirm('Permanently delete this error log?')) {
        return;
    }

    router.delete(destroyErrorLog.url(id), { preserveScroll: true });
}

export default function ErrorLogsIndex({ errorLogs }: ErrorLogPageProps) {
    return (
        <>
            <Head title="Error logs" />

            <Card>
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                            <Bug className="size-5" />
                        </div>

                        <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-xl">
                                    Error logs
                                </CardTitle>

                                <Badge
                                    variant="secondary"
                                    className="tabular-nums"
                                >
                                    {errorLogs.total}
                                </Badge>
                            </div>

                            <CardDescription>
                                Captured exceptions with source locations and
                                traces.
                            </CardDescription>
                        </div>
                    </div>
                    <Button variant="outline" asChild className="shrink-0">
                        <Link href={ProductController.index()}>
                            <ArrowLeft data-icon="inline-start" />
                            Back to demo
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    {errorLogs.data.length === 0 ? (
                        <Empty className="rounded-lg border border-dashed">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <FileWarning />
                                </EmptyMedia>
                                <EmptyTitle>No errors recorded</EmptyTitle>
                                <EmptyDescription>
                                    Run the simulated error from the product
                                    demo to create a sample log.
                                </EmptyDescription>
                            </EmptyHeader>
                            <Button asChild>
                                <Link href={ProductController.index()}>
                                    Open the demo
                                    <ArrowRight data-icon="inline-end" />
                                </Link>
                            </Button>
                        </Empty>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {errorLogs.data.map((errorLog) => (
                                <div
                                    key={errorLog.id}
                                    className={cn(
                                        'flex flex-col gap-4 rounded-xl border p-4 transition-colors sm:flex-row sm:items-start',
                                        errorLog.resolved_at &&
                                            'border-emerald-500/40 bg-emerald-500/5 dark:border-emerald-400/30 dark:bg-emerald-400/5',
                                    )}
                                >
                                    <Link
                                        href={ErrorLogController.show(
                                            errorLog.id,
                                        )}
                                        className="group min-w-0 flex-1 rounded focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                    >
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="flex min-w-0 flex-col gap-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge variant="destructive">
                                                        {errorLog.class
                                                            .split('\\')
                                                            .pop()}
                                                    </Badge>
                                                    {errorLog.method && (
                                                        <Badge variant="destructive">
                                                            {errorLog.method}
                                                        </Badge>
                                                    )}
                                                    <span className="text-xs text-muted-foreground">
                                                        #{errorLog.id}
                                                    </span>
                                                    <Badge variant="secondary">
                                                        {errorLog.count}{' '}
                                                        {errorLog.count === 1
                                                            ? 'occurrence'
                                                            : 'occurrences'}
                                                        {errorLog.count > 1 &&
                                                            ` (+${errorLog.count - 1} repeats)`}
                                                    </Badge>
                                                </div>
                                                <p className="line-clamp-2 font-medium">
                                                    {errorLog.message}
                                                </p>
                                                <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                                                    <FileWarning className="size-4 shrink-0" />
                                                    <span className="truncate">
                                                        {errorLog.file}:
                                                        {errorLog.line}
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1.5">
                                                    <Clock3 className="size-4" />
                                                    {new Date(
                                                        errorLog.created_at,
                                                    ).toLocaleString()}
                                                </span>
                                                <ExternalLink className="size-4 transition-transform group-hover:translate-x-0.5" />
                                            </div>
                                        </div>
                                        {errorLog.url && (
                                            <p className="mt-3 truncate border-t pt-3 text-xs text-muted-foreground">
                                                {errorLog.url}
                                            </p>
                                        )}
                                    </Link>

                                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                                        {errorLog.resolved_at ? (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                className="border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10 dark:border-emerald-400/30 dark:text-emerald-400"
                                                onClick={() =>
                                                    resolveErrorLogItem(
                                                        errorLog.id,
                                                    )
                                                }
                                            >
                                                <RotateCcw data-icon="inline-start" />
                                                Unresolve
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    resolveErrorLogItem(
                                                        errorLog.id,
                                                    )
                                                }
                                            >
                                                <Check data-icon="inline-start" />
                                                Resolve
                                            </Button>
                                        )}
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="destructive"
                                            onClick={() =>
                                                deleteErrorLogItem(errorLog.id)
                                            }
                                        >
                                            <Trash2 data-icon="inline-start" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {errorLogs.last_page > 1 && (
                        <nav
                            aria-label="Error log pages"
                            className="mt-6 flex flex-wrap items-center justify-center gap-2"
                        >
                            {errorLogs.links.map((link, index) => {
                                const label = displayPaginationLabel(
                                    link.label,
                                );
                                const isPrevious = label.includes('‹');
                                const isNext = label.includes('›');

                                if (!link.url) {
                                    return (
                                        <Button
                                            key={`${label}-${index}`}
                                            variant="outline"
                                            size="sm"
                                            disabled
                                        >
                                            {isPrevious && (
                                                <ChevronLeft data-icon="inline-start" />
                                            )}
                                            {isNext && (
                                                <ChevronRight data-icon="inline-end" />
                                            )}
                                            {!isPrevious && !isNext && label}
                                        </Button>
                                    );
                                }

                                return (
                                    <Button
                                        key={`${label}-${index}`}
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
                                        size="sm"
                                        asChild
                                    >
                                        <Link href={link.url}>
                                            {isPrevious && (
                                                <ChevronLeft data-icon="inline-start" />
                                            )}
                                            {isNext && (
                                                <ChevronRight data-icon="inline-end" />
                                            )}
                                            {!isPrevious && !isNext && label}
                                        </Link>
                                    </Button>
                                );
                            })}
                        </nav>
                    )}
                </CardContent>
            </Card>
        </>
    );
}

ErrorLogsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Error logs',
            href: ErrorLogController.index(),
        },
    ],
};
