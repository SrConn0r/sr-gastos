<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(fn () => Storage::fake('public'));

test('profile photo can be uploaded and replaces the previous one', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('profile.avatar.update'), ['avatar' => UploadedFile::fake()->image('a.jpg')])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    $first = $user->refresh()->avatar_path;
    Storage::disk('public')->assertExists($first);
    expect($user->avatar)->toEndWith($first);

    $this->actingAs($user)
        ->post(route('profile.avatar.update'), ['avatar' => UploadedFile::fake()->image('b.png')]);

    Storage::disk('public')->assertMissing($first);
    Storage::disk('public')->assertExists($user->refresh()->avatar_path);
});

test('profile photo must be an image', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('profile.avatar.update'), ['avatar' => UploadedFile::fake()->create('doc.pdf', 10, 'application/pdf')])
        ->assertSessionHasErrors('avatar');

    expect($user->refresh()->avatar_path)->toBeNull();
});

test('profile photo can be removed', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post(route('profile.avatar.update'), ['avatar' => UploadedFile::fake()->image('a.jpg')]);
    $path = $user->refresh()->avatar_path;

    $this->actingAs($user)
        ->delete(route('profile.avatar.destroy'))
        ->assertRedirect(route('profile.edit'));

    Storage::disk('public')->assertMissing($path);
    expect($user->refresh()->avatar_path)->toBeNull();
});
