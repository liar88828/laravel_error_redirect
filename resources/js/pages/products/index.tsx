import { Form, Head, Link } from '@inertiajs/react';
import { Fragment } from 'react';
import {
    Activity,
    ArrowRight,
    BugPlay,
    CircleCheck,
    Package,
    PackagePlus,
    TriangleAlert,
} from 'lucide-react';
import ErrorLogController from '@/actions/App/Http/Controllers/ErrorLogController';
import ProductController from '@/actions/App/Http/Controllers/ProductController';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
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
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

type ProductForm = {
    name: string;
    description: string;
    price: string;
};

type Product = {
    id: number;
    name: string;
    description: string | null;
    price: string;
    created_at: string;
};

type ProductPageProps = {
    products: {
        data: Product[];
        current_page: number;
        last_page: number;
    };
    productCount: number;
    errorCount: number;
};

export default function ProductsIndex({
    products,
    productCount,
    errorCount,
}: ProductPageProps) {
    return (
        <>
            <Head title="Product & error demo" />

            <main className="flex flex-col gap-6 p-4 md:p-8">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex flex-col gap-2">
                        <Badge variant="outline" className="w-fit gap-1.5">
                            <Activity data-icon="inline-start" />
                            Reliability sandbox
                        </Badge>
                        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                            Product & error demo
                        </h1>
                        <p className="max-w-2xl text-sm text-muted-foreground">
                            Create a real product record, or deliberately log a
                            caught exception and inspect its trace.
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={ErrorLogController.index()}>
                            View error logs
                            <ArrowRight data-icon="inline-end" />
                        </Link>
                    </Button>
                </header>

                <section className="grid gap-4 sm:grid-cols-2">
                    <Card>
                        <CardContent className="flex items-center gap-4 pt-6">
                            <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Package />
                            </span>
                            <div className="flex flex-col gap-1">
                                <p className="text-sm text-muted-foreground">
                                    Products created
                                </p>
                                <p className="text-2xl font-semibold tabular-nums">
                                    {productCount}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 pt-6">
                            <span className="flex size-11 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                                <TriangleAlert />
                            </span>
                            <div className="flex flex-col gap-1">
                                <p className="text-sm text-muted-foreground">
                                    Errors captured
                                </p>
                                <p className="text-2xl font-semibold tabular-nums">
                                    {errorCount}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <PackagePlus className="text-primary" />
                                <CardTitle>Create a product</CardTitle>
                            </div>
                            <CardDescription>
                                A successful submission validates and saves a
                                product in the database.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form<ProductForm>
                                {...ProductController.store['/products'].form()}
                                options={{ preserveScroll: true }}
                                resetOnSuccess
                                className="flex flex-col gap-5"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <FieldGroup className="gap-4">
                                            <Field
                                                data-invalid={Boolean(
                                                    errors.name,
                                                )}
                                            >
                                                <FieldLabel htmlFor="name">
                                                    Product name
                                                </FieldLabel>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    placeholder="Studio headphones"
                                                    required
                                                    maxLength={150}
                                                    aria-invalid={Boolean(
                                                        errors.name,
                                                    )}
                                                />
                                                <FieldError>
                                                    {errors.name}
                                                </FieldError>
                                            </Field>

                                            <Field
                                                data-invalid={Boolean(
                                                    errors.description,
                                                )}
                                            >
                                                <FieldLabel htmlFor="description">
                                                    Description
                                                </FieldLabel>
                                                <Textarea
                                                    id="description"
                                                    name="description"
                                                    placeholder="Optional product details"
                                                    maxLength={2000}
                                                    rows={3}
                                                    aria-invalid={Boolean(
                                                        errors.description,
                                                    )}
                                                />
                                                <FieldError>
                                                    {errors.description}
                                                </FieldError>
                                            </Field>

                                            <Field
                                                data-invalid={Boolean(
                                                    errors.price,
                                                )}
                                            >
                                                <FieldLabel htmlFor="price">
                                                    Price
                                                </FieldLabel>
                                                <Input
                                                    id="price"
                                                    name="price"
                                                    type="number"
                                                    min="0"
                                                    max="99999999.99"
                                                    step="0.01"
                                                    placeholder="129.00"
                                                    required
                                                    aria-invalid={Boolean(
                                                        errors.price,
                                                    )}
                                                />
                                                <FieldError>
                                                    {errors.price}
                                                </FieldError>
                                            </Field>
                                        </FieldGroup>

                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            <CircleCheck data-icon="inline-start" />
                                            {processing
                                                ? 'Creating product…'
                                                : 'Create successfully'}
                                        </Button>
                                    </>
                                )}
                            </Form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <BugPlay className="text-destructive" />
                                <CardTitle>Simulate an error</CardTitle>
                            </div>
                            <CardDescription>
                                Throws and catches a demo exception, then stores
                                its message, source location, and stack trace in
                                <span className="font-medium text-foreground">
                                    {' '}
                                    error_logs
                                </span>
                                .
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                                This is an intentional, handled exception. It
                                will not take down the page or affect your
                                products. Choose whether repeated errors should
                                be grouped by type, source file, and line.
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <Form
                                    {...ProductController.store['/products-error'].form()}
                                    options={{ preserveScroll: true }}
                                >
                                    {({ processing }) => (
                                        <>
                                            <input
                                                type="hidden"
                                                name="deduplicate"
                                                value="false"
                                            />
                                            <Button
                                                type="submit"
                                                variant="destructive"
                                                disabled={processing}
                                                className="w-full"
                                            >
                                                <BugPlay data-icon="inline-start" />
                                                {processing
                                                    ? 'Creating separate log…'
                                                    : 'Create separate error log'}
                                            </Button>
                                        </>
                                    )}
                                </Form>
                                <Form
                                    {...ProductController.store['/products-error-increment'].form()}
                                    options={{ preserveScroll: true }}
                                >
                                    {({ processing }) => (
                                        <>
                                            <input
                                                type="hidden"
                                                name="deduplicate"
                                                value="true"
                                            />
                                            <Button
                                                type="submit"
                                                variant="outline"
                                                disabled={processing}
                                                className="w-full"
                                            >
                                                <TriangleAlert data-icon="inline-start" />
                                                {processing
                                                    ? 'Counting occurrence…'
                                                    : 'Increment matching error'}
                                            </Button>
                                        </>
                                    )}
                                </Form>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <CardTitle>Recently created products</CardTitle>
                            <CardDescription>
                                Latest successful product records.
                            </CardDescription>
                        </div>
                        <Badge variant="secondary">{productCount} total</Badge>
                    </CardHeader>
                    <CardContent>
                        {products.data.length === 0 ? (
                            <Empty className="rounded-lg border border-dashed">
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <Package />
                                    </EmptyMedia>
                                    <EmptyTitle>No products yet</EmptyTitle>
                                    <EmptyDescription>
                                        Use the form above to create your first
                                        product.
                                    </EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        ) : (
                            <div className="flex flex-col">
                                {products.data.map((product, index) => (
                                    <Fragment key={product.id}>
                                        {index > 0 && <Separator />}
                                        <article className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex min-w-0 flex-col gap-1">
                                                <h2 className="truncate font-medium">
                                                    {product.name}
                                                </h2>
                                                <p className="line-clamp-2 text-sm text-muted-foreground">
                                                    {product.description ||
                                                        'No description provided.'}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-3">
                                                <Badge variant="outline">
                                                    $
                                                    {Number(
                                                        product.price,
                                                    ).toFixed(2)}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(
                                                        product.created_at,
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </article>
                                    </Fragment>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </>
    );
}

ProductsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Product & error demo',
            href: ProductController.index(),
        },
    ],
};
