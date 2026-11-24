<?php

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

it('seeds the household owner from config, once, without demo data', function () {
    config(['app.owner' => ['name' => 'Owner', 'email' => 'owner@example.com', 'password' => 'secret-pass']]);

    $this->seed();
    $this->seed();

    $owner = User::sole();
    expect($owner->email)->toBe('owner@example.com')
        ->and($owner->email_verified_at)->not->toBeNull()
        ->and(Hash::check('secret-pass', $owner->password))->toBeTrue()
        ->and(Transaction::count())->toBe(0);
});

it('skips the owner when the password is not configured', function () {
    config(['app.owner' => ['name' => 'Owner', 'email' => 'owner@example.com', 'password' => null]]);

    $this->seed();

    expect(User::count())->toBe(0);
});
