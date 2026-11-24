<?php

use App\Http\Controllers\Api\InboundEmailController;
use Illuminate\Support\Facades\Route;

Route::post('inbound-emails', InboundEmailController::class)
    ->middleware('throttle:30,1')
    ->name('api.inbound-emails.store');
