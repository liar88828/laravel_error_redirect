import { Head } from '@inertiajs/react';
import {
    Activity,
    Braces,
    CircleAlert,
    CircleCheck,
    KeyRound,
    LoaderCircle,
    Play,
    Terminal,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type Endpoint = 'index' | 'latest-id' | 'new' | 'show';

type ApiResponse = {
    status: number;
    statusText: string;
    durationMs: number;
    body: unknown;
};

const endpoints: { value: Endpoint; label: string }[] = [
    { value: 'index', label: 'List error logs' },
    { value: 'latest-id', label: 'Get latest error log ID' },
    { value: 'new', label: 'Get new logs after an ID' },
    { value: 'show', label: 'Get an error log by ID' },
];

export default function ApiSimulator() {
    const [endpoint, setEndpoint] = useState<Endpoint>('index');
    const [apiKey, setApiKey] = useState('');
    const [errorLogId, setErrorLogId] = useState('1');
    const [afterId, setAfterId] = useState('0');
    const [response, setResponse] = useState<ApiResponse | null>(null);
    const [requestError, setRequestError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const requestPath = (() => {
        switch (endpoint) {
            case 'latest-id':
                return '/api/error-logs/latest-id';
            case 'new':
                return `/api/error-logs/new?after_id=${encodeURIComponent(afterId)}`;
            case 'show':
                return `/api/error-logs/${encodeURIComponent(errorLogId)}`;
            default:
                return '/api/error-logs';
        }
    })();

    async function sendRequest(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setProcessing(true);
        setResponse(null);
        setRequestError(null);

        const startedAt = performance.now();

        try {
            const result = await fetch(requestPath, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    ...(apiKey.trim() ? { 'X-Api-Key': apiKey.trim() } : {}),
                },
            });
            const contentType = result.headers.get('content-type') ?? '';
            const body: unknown = contentType.includes('application/json')
                ? await result.json()
                : await result.text();

            setResponse({
                status: result.status,
                statusText: result.statusText,
                durationMs: Math.round(performance.now() - startedAt),
                body,
            });
        } catch (error) {
            setRequestError(
                error instanceof Error
                    ? error.message
                    : 'The request could not be completed.',
            );
        } finally {
            setProcessing(false);
        }
    }

    return (
        <>
            <Head title="API simulator" />

            <main className="flex flex-col gap-6 p-4 md:p-8">
                <header className="flex flex-col gap-3">
                    <Badge variant="outline" className="w-fit gap-1.5">
                        <Activity data-icon="inline-start" />
                        Error log API
                    </Badge>
                    <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                        API simulator
                    </h1>
                    <p className="max-w-2xl text-sm text-muted-foreground">
                        Send a real GET request to the protected error log API
                        and inspect its status, timing, and JSON response.
                    </p>
                </header>

                <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.9fr)]">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Terminal className="text-primary" />
                                <CardTitle>Configure request</CardTitle>
                            </div>
                            <CardDescription>
                                Requests stay on this application and use the
                                API key only for this request.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={sendRequest}
                                className="flex flex-col gap-5"
                            >
                                <div className="flex flex-col gap-2">
                                    <label
                                        htmlFor="api-endpoint"
                                        className="text-sm font-medium"
                                    >
                                        Endpoint
                                    </label>
                                    <select
                                        id="api-endpoint"
                                        value={endpoint}
                                        onChange={(event) =>
                                            setEndpoint(
                                                event.target.value as Endpoint,
                                            )
                                        }
                                        className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                                    >
                                        {endpoints.map((item) => (
                                            <option
                                                key={item.value}
                                                value={item.value}
                                            >
                                                {item.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {endpoint === 'new' && (
                                    <div className="flex flex-col gap-2">
                                        <label
                                            htmlFor="after-id"
                                            className="text-sm font-medium"
                                        >
                                            After error log ID
                                        </label>
                                        <Input
                                            id="after-id"
                                            type="number"
                                            min="0"
                                            value={afterId}
                                            onChange={(event) =>
                                                setAfterId(event.target.value)
                                            }
                                        />
                                    </div>
                                )}

                                {endpoint === 'show' && (
                                    <div className="flex flex-col gap-2">
                                        <label
                                            htmlFor="error-log-id"
                                            className="text-sm font-medium"
                                        >
                                            Error log ID
                                        </label>
                                        <Input
                                            id="error-log-id"
                                            type="number"
                                            min="1"
                                            value={errorLogId}
                                            onChange={(event) =>
                                                setErrorLogId(
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                )}

                                <div className="flex flex-col gap-2">
                                    <label
                                        htmlFor="api-key"
                                        className="flex items-center gap-2 text-sm font-medium"
                                    >
                                        <KeyRound className="size-4 text-muted-foreground" />
                                        X-Api-Key header
                                    </label>
                                    <Input
                                        id="api-key"
                                        type="password"
                                        autoComplete="off"
                                        value={apiKey}
                                        onChange={(event) =>
                                            setApiKey(event.target.value)
                                        }
                                        placeholder="Enter your configured API key"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Leave blank to see the API’s 401 response.
                                        The key is not saved or displayed.
                                    </p>
                                </div>

                                <div className="rounded-lg border bg-muted/30 p-3">
                                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                                        GET request
                                    </p>
                                    <code className="break-all text-sm">
                                        {requestPath}
                                    </code>
                                </div>

                                <Button type="submit" disabled={processing}>
                                    {processing ? (
                                        <LoaderCircle
                                            className="animate-spin"
                                            data-icon="inline-start"
                                        />
                                    ) : (
                                        <Play data-icon="inline-start" />
                                    )}
                                    {processing
                                        ? 'Sending request…'
                                        : 'Send request'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="min-w-0">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Braces className="text-primary" />
                                <CardTitle>Response</CardTitle>
                            </div>
                            <CardDescription>
                                The raw API response appears here after the
                                request completes.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {response ? (
                                <div className="flex min-w-0 flex-col gap-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge
                                            variant={
                                                response.status >= 200 &&
                                                response.status < 300
                                                    ? 'default'
                                                    : 'destructive'
                                            }
                                            className="gap-1.5"
                                        >
                                            {response.status >= 200 &&
                                            response.status < 300 ? (
                                                <CircleCheck data-icon="inline-start" />
                                            ) : (
                                                <CircleAlert data-icon="inline-start" />
                                            )}
                                            {response.status}{' '}
                                            {response.statusText}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {response.durationMs} ms
                                        </span>
                                    </div>
                                    <pre className="max-h-136 min-w-0 overflow-auto rounded-lg bg-zinc-950 p-4 text-xs leading-relaxed text-zinc-100">
                                        <code>
                                            {typeof response.body === 'string'
                                                ? response.body
                                                : JSON.stringify(
                                                      response.body,
                                                      null,
                                                      2,
                                                  )}
                                        </code>
                                    </pre>
                                </div>
                            ) : requestError ? (
                                <div
                                    role="alert"
                                    className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
                                >
                                    {requestError}
                                </div>
                            ) : (
                                <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 text-center">
                                    <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Braces />
                                    </span>
                                    <p className="text-sm text-muted-foreground">
                                        Choose an endpoint and send a request to
                                        inspect its response.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </section>
            </main>
        </>
    );
}
