<?php

namespace App\Enums;

enum AccountKind: string
{
    case Deposit = 'deposit';
    case CreditCard = 'credit_card';
}
