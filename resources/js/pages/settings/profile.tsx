import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import { Camera, LogOut, Palette, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { LinkRow } from '@/components/list-row';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useInitials } from '@/hooks/use-initials';
import { logout } from '@/routes';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import { send } from '@/routes/verification';

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth, errors } = usePage().props;
    const user = auth.user;
    const getInitials = useInitials();
    const [uploading, setUploading] = useState(false);

    const uploadAvatar = (file?: File) => {
        if (!file) {
            return;
        }

        router.post(
            ProfileController.updateAvatar.url(),
            { avatar: file },
            {
                forceFormData: true,
                preserveScroll: true,
                onStart: () => setUploading(true),
                onFinish: () => setUploading(false),
            },
        );
    };

    return (
        <>
            <Head title="Perfil" />
            <h1 className="sr-only">Perfil</h1>

            <section className="flex flex-col items-center gap-3 rounded-xl border border-transparent bg-card p-6 text-center shadow-soft dark:border-border dark:shadow-none">
                <div className="relative">
                    <Avatar className="size-24 text-2xl">
                        <AvatarImage
                            src={user.avatar}
                            alt={user.name}
                            className="object-cover"
                        />
                        <AvatarFallback className="bg-accent font-bold text-accent-foreground">
                            {getInitials(user.name)}
                        </AvatarFallback>
                    </Avatar>
                    <label className="absolute -right-1 -bottom-1 grid size-9 cursor-pointer place-items-center rounded-full border-2 border-card bg-foreground text-background transition-transform focus-within:ring-4 focus-within:ring-ring/25 active:scale-95">
                        {uploading ? (
                            <Spinner className="size-4" />
                        ) : (
                            <Camera className="size-4" />
                        )}
                        <span className="sr-only">Cambiar foto</span>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="sr-only"
                            disabled={uploading}
                            onChange={(event) => {
                                uploadAvatar(event.target.files?.[0]);
                                event.target.value = '';
                            }}
                        />
                    </label>
                </div>
                <div className="min-w-0">
                    <p className="truncate text-xl font-bold">{user.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                        {user.email}
                    </p>
                </div>
                {user.avatar && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            router.delete(
                                ProfileController.destroyAvatar.url(),
                                {
                                    preserveScroll: true,
                                },
                            )
                        }
                    >
                        Quitar foto
                    </Button>
                )}
                <InputError message={errors.avatar} />
            </section>

            <Card>
                <CardHeader>
                    <CardTitle>Información personal</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form
                        {...ProfileController.update.form()}
                        options={{ preserveScroll: true }}
                        className="space-y-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nombre</Label>
                                    <Input
                                        id="name"
                                        defaultValue={user.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Nombre completo"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">
                                        Correo electrónico
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        defaultValue={user.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="correo@ejemplo.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                {mustVerifyEmail &&
                                    user.email_verified_at === null && (
                                        <p className="text-sm text-muted-foreground">
                                            Tu correo no está verificado.{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="font-semibold text-foreground underline underline-offset-4"
                                            >
                                                Reenviar correo de verificación
                                            </Link>
                                            {status ===
                                                'verification-link-sent' && (
                                                <span className="mt-2 block font-medium text-success">
                                                    Te enviamos un nuevo enlace
                                                    de verificación.
                                                </span>
                                            )}
                                        </p>
                                    )}

                                <Button
                                    className="w-full sm:w-auto"
                                    disabled={processing}
                                    data-test="update-profile-button"
                                >
                                    {processing && <Spinner />}
                                    Guardar cambios
                                </Button>
                            </>
                        )}
                    </Form>
                </CardContent>
            </Card>

            <nav aria-label="Ajustes" className="flex flex-col gap-2 md:hidden">
                <LinkRow
                    href={editSecurity()}
                    icon={<ShieldCheck />}
                    title="Seguridad"
                    subtitle="Contraseña, passkeys y 2FA"
                />
                <LinkRow
                    href={editAppearance()}
                    icon={<Palette />}
                    title="Apariencia"
                    subtitle="Tema claro, oscuro o del sistema"
                />
            </nav>

            <Button variant="outline" className="w-full" asChild>
                <Link
                    href={logout()}
                    as="button"
                    onClick={() => router.flushAll()}
                    data-test="logout-button"
                >
                    <LogOut /> Cerrar sesión
                </Link>
            </Button>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [{ title: 'Perfil', href: edit() }],
};
