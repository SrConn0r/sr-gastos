<?php

use App\Enums\InboundEmailStatus;
use App\Models\InboundEmail;
use App\Services\InboundEmailProcessor;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('inbound-emails:process', function (InboundEmailProcessor $processor) {
    // ponytail: 50 per run keeps a shared-hosting cron under its time limit; raise if a backlog builds up.
    $emails = InboundEmail::where('status', InboundEmailStatus::Pending)->oldest('id')->limit(50)->get();
    $emails->each(fn (InboundEmail $email) => $processor->process($email));

    $this->info("Procesados: {$emails->count()}");
})->purpose('Registra con IA los correos bancarios pendientes');

Schedule::command('inbound-emails:process')->hourly()->withoutOverlapping(55);
