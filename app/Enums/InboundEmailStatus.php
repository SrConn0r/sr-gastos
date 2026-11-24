<?php

namespace App\Enums;

enum InboundEmailStatus: string
{
    case Pending = 'pending';
    case Recorded = 'recorded';
    case InternalTransfer = 'internal_transfer';
    case Ignored = 'ignored';
    case Failed = 'failed';
}
