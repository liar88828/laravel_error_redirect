import { Head } from '@inertiajs/react';
import { Bell, CheckCircle2, LoaderCircle, RefreshCw, Send, XCircle } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type RecentFirebaseMessage = {
    sent: boolean;
    status: number | null;
    target: Record<string, string> | null;
    title: string | null;
    body: string | null;
    message_name: string | null;
    error: string | null;
    sent_at: string;
};

type FirebaseStatus = {
    enabled: boolean;
    project_id: string | null;
    topic: string | null;
    has_credentials: boolean;
    has_token: boolean;
    total_sent: number;
    total_failed: number;
    recent_messages: RecentFirebaseMessage[];
};

type ApiResult = {
    httpStatus: number;
    durationMs: number;
    body: unknown;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Firebase test',
        href: '/firebase-test',
    },
];

function getXsrfToken(): string {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

export default function FirebaseTest({ initialStatus }: { initialStatus: FirebaseStatus }) {
    const [status, setStatus] = useState<FirebaseStatus>(initialStatus);
    const [targetType, setTargetType] = useState<'topic' | 'token'>('topic');
    const [target, setTarget] = useState<string>(initialStatus.topic ?? 'error-logs');
    const [title, setTitle] = useState<string>('[Laravel] Firebase Test');
    const [message, setMessage] = useState<string>('Test FCM message from Laravel web UI');
    const [statusResult, setStatusResult] = useState<ApiResult | null>(null);
    const [sendResult, setSendResult] = useState<ApiResult | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loadingStatus, setLoadingStatus] = useState(false);
    const [sending, setSending] = useState(false);

    async function refreshStatus() {
        setLoadingStatus(true);
        setErrorMessage(null);
        const startedAt = performance.now();

        try {
            const response = await fetch('/firebase-test/status', {
                method: 'GET',
                headers: { Accept: 'application/json' },
            });
            const body = (await response.json()) as FirebaseStatus;
            setStatus(body);
            setStatusResult({
                httpStatus: response.status,
                durationMs: Math.round(performance.now() - startedAt),
                body,
            });
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to fetch Firebase status.');
        } finally {
            setLoadingStatus(false);
        }
    }

    async function sendTestMessage(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSending(true);
        setSendResult(null);
        setErrorMessage(null);
        const startedAt = performance.now();

        try {
            const payload = {
                ...(targetType === 'topic' ? { topic: target.trim() } : { token: target.trim() }),
                title: title.trim(),
                message: message.trim(),
            };

            const response = await fetch('/firebase-test/send', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': getXsrfToken(),
                },
                body: JSON.stringify(payload),
            });

            const contentType = response.headers.get('content-type') ?? '';
            const body: unknown = contentType.includes('application/json')
                ? await response.json()
                : await response.text();

            setSendResult({
                httpStatus: response.status,
                durationMs: Math.round(performance.now() - startedAt),
                body,
            });
            await refreshStatus();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to send FCM message.');
        } finally {
            setSending(false);
        }
    }

    return (
        <>
            <Head title="Firebase test" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                            <Bell className="size-6" />
                            Firebase Cloud Messaging Test
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Inspect server-side Firebase status (GET) and send live FCM test messages (POST).
                        </p>
                    </div>
                    <Button variant="outline" onClick={refreshStatus} disabled={loadingStatus}>
                        {loadingStatus ? (
                            <LoaderCircle className="mr-2 size-4 animate-spin" />
                        ) : (
                            <RefreshCw className="mr-2 size-4" />
                        )}
                        GET Firebase Status
                    </Button>
                </div>

                {errorMessage && (
                    <Card className="border-destructive/50 bg-destructive/5">
                        <CardContent className="flex items-center gap-2 pt-6 text-sm text-destructive">
                            <XCircle className="size-4 shrink-0" />
                            <span>{errorMessage}</span>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Configuration Status</CardTitle>
                        <CardDescription>
                            Current <code>error-redirect.firebase</code> configuration from Laravel.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            <Badge variant={status.enabled ? 'default' : 'secondary'}>
                                {status.enabled ? (
                                    <CheckCircle2 className="mr-1 size-3" />
                                ) : (
                                    <XCircle className="mr-1 size-3" />
                                )}
                                Enabled: {status.enabled ? 'true' : 'false'}
                            </Badge>
                            <Badge variant={status.has_credentials ? 'default' : 'destructive'}>
                                Credentials: {status.has_credentials ? 'loaded' : 'missing'}
                            </Badge>
                            <Badge variant="outline">Project ID: {status.project_id ?? 'not set'}</Badge>
                            <Badge variant="outline">Default Topic: {status.topic ?? 'not set'}</Badge>
                            <Badge variant="outline">
                                Default Token: {status.has_token ? 'configured' : 'none'}
                            </Badge>
                            <Badge variant="default">Total Sent: {status.total_sent}</Badge>
                            <Badge variant={status.total_failed > 0 ? 'destructive' : 'secondary'}>
                                Total Failed: {status.total_failed}
                            </Badge>
                        </div>

                        {statusResult && (
                            <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
                                {`GET /firebase-test/status -> HTTP ${statusResult.httpStatus} (${statusResult.durationMs} ms)\n`}
                                {JSON.stringify(statusResult.body, null, 2)}
                            </pre>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Send Test FCM Notification (POST)</CardTitle>
                        <CardDescription>
                            Dispatches a real FCM HTTP v1 message using your Laravel Service Account credentials.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={sendTestMessage} className="space-y-4">
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={targetType === 'topic' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => {
                                        setTargetType('topic');
                                        setTarget(status.topic ?? 'error-logs');
                                    }}
                                >
                                    Topic
                                </Button>
                                <Button
                                    type="button"
                                    variant={targetType === 'token' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => {
                                        setTargetType('token');
                                        setTarget('');
                                    }}
                                >
                                    Device Token
                                </Button>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">
                                    {targetType === 'topic' ? 'Topic' : 'Device FCM Token'}
                                </label>
                                <Input
                                    value={target}
                                    onChange={(e) => setTarget(e.target.value)}
                                    placeholder={
                                        targetType === 'topic' ? 'error-logs' : 'Paste Flutter device FCM token'
                                    }
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Title</label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="[Laravel] Firebase Test"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Message</label>
                                <Input
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Test FCM message from Laravel web UI"
                                    required
                                />
                            </div>

                            <Button type="submit" disabled={sending}>
                                {sending ? (
                                    <LoaderCircle className="mr-2 size-4 animate-spin" />
                                ) : (
                                    <Send className="mr-2 size-4" />
                                )}
                                {sending ? 'Sending…' : 'Send FCM (POST)'}
                            </Button>
                        </form>

                        {sendResult && (
                            <pre className="mt-4 overflow-x-auto rounded-md bg-muted p-3 text-xs">
                                {`POST /firebase-test/send -> HTTP ${sendResult.httpStatus} (${sendResult.durationMs} ms)\n`}
                                {JSON.stringify(sendResult.body, null, 2)}
                            </pre>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Sent Messages History ({status.recent_messages.length})</CardTitle>
                        <CardDescription>
                            Recent FCM messages dispatched from this Laravel application (up to 20).
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {status.recent_messages.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No FCM messages sent yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {status.recent_messages.map((item, idx) => (
                                    <div key={`${item.sent_at}-${idx}`} className="rounded-md border p-3 text-sm">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <span className="font-medium">{item.title ?? '(no title)'}</span>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={item.sent ? 'default' : 'destructive'}>
                                                    {item.sent ? `HTTP ${item.status ?? 200}` : item.error ?? 'Failed'}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">{item.sent_at}</span>
                                            </div>
                                        </div>
                                        <p className="mt-1 text-muted-foreground">{item.body}</p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Target: {JSON.stringify(item.target)}
                                            {item.message_name ? ` • ID: ${item.message_name}` : ''}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
FirebaseTest.layout = {
    breadcrumbs
}