<?php

namespace App\Policies;

use App\Models\Expense;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ExpensePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Cualquier usuario autenticado puede ver la lista de sus propios gastos
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Expense $expense): bool
    {
        // Solo el propietario puede ver el gasto
        return $user->id === $expense->user_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Cualquier usuario autenticado puede crear gastos
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Expense $expense): bool
    {
        // Solo el propietario puede actualizar el gasto
        return $user->id === $expense->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Expense $expense): bool
    {
        // Solo el propietario puede eliminar el gasto
        return $user->id === $expense->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Expense $expense): bool
    {
        // Solo el propietario puede restaurar el gasto
        return $user->id === $expense->user_id;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Expense $expense): bool
    {
        // Solo el propietario puede eliminar permanentemente el gasto
        return $user->id === $expense->user_id;
    }
}
