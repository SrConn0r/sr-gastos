<?php

use App\Enums\InboundEmailStatus;
use App\Models\InboundEmail;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(fn () => $this->actingAs(User::factory()->create()));

it('lists emails newest first and filters by status', function () {
    InboundEmail::factory()->create(['received_at' => '2026-11-20 10:00']);
    $failed = InboundEmail::factory()->failed()->create(['received_at' => '2026-11-21 10:00']);

    $this->get(route('inbound-emails.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('inbound-emails/index')
            ->has('emails.data', 2)
            ->where('emails.data.0.id', $failed->id)
            ->missing('emails.data.0.body'));

    $this->get(route('inbound-emails.index', ['status' => 'failed']))
        ->assertInertia(fn (Assert $page) => $page->has('emails.data', 1));
});

it('puts a failed email back in the queue', function () {
    $email = InboundEmail::factory()->failed()->create();

    $this->post(route('inbound-emails.retry', $email))->assertRedirect();

    expect($email->fresh())->status->toBe(InboundEmailStatus::Pending)->attempts->toBe(0)->error->toBeNull();
});

it('only retries failed emails', function () {
    $email = InboundEmail::factory()->create(['status' => InboundEmailStatus::Recorded]);

    $this->post(route('inbound-emails.retry', $email));

    expect($email->fresh()->status)->toBe(InboundEmailStatus::Recorded);
});
