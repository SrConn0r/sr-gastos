<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            // Primero eliminamos la restricción de clave foránea
            $table->dropForeign(['user_id']);

            // Luego eliminamos la columna
            $table->dropColumn('user_id');

            // Agregamos unique al nombre
            $table->unique('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            // Eliminamos el índice unique
            $table->dropUnique(['name']);

            // Volvemos a agregar la columna user_id
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
        });
    }
};
