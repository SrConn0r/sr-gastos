<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('institution');
            $table->string('kind', 20);
            $table->string('currency', 3)->default('COP');
            $table->char('last4', 4)->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->foreignId('account_id')->nullable()->after('category_id')->constrained()->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('account_id');
        });
        Schema::dropIfExists('accounts');
    }
};
