<?php

namespace App\Enums;

enum RecurringKind: string
{
    case Fixed = 'fixed';
    case Subscription = 'subscription';
}
