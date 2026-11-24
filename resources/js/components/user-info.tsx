import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/types';

export function UserInfo({
    user,
    showEmail = false,
    avatarOnly = false,
}: {
    user: User;
    showEmail?: boolean;
    avatarOnly?: boolean;
}) {
    const getInitials = useInitials();
    const avatar = (
        <Avatar className="size-9 overflow-hidden rounded-full">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-full bg-accent font-semibold text-accent-foreground">
                {getInitials(user.name)}
            </AvatarFallback>
        </Avatar>
    );

    if (avatarOnly) {
        return avatar;
    }

    return (
        <>
            {avatar}
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                {showEmail && (
                    <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                    </span>
                )}
            </div>
        </>
    );
}
