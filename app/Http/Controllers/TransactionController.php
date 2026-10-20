<?php

namespace App\Http\Controllers;

use App\Models\WalletTransaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $search = trim($request->input('search', ''));
        $type = $request->input('type');

        $transactions = WalletTransaction::when($search, function ($query, $search) {
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('user_code', 'like', "%{$search}%");
                })->orWhere('title', 'like', "%{$search}%");
            })
            ->when($type, function ($query, $type) {
                $query->where('type', $type);
            })
            ->with('user')
            ->orderBy('id', 'desc')
            ->paginate(15)
            ->withQueryString();

        return inertia('transactions/index', [
            'transactions' => $transactions,
            'filters' => [
                'search' => $search,
                'type' => $type,
            ],
        ]);
    }
}
