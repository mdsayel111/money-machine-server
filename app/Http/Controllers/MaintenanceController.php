<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class MaintenanceController extends Controller
{
    /**
     * Clear application, configuration, route, and view caches.
     */
    public function clearCache(Request $request)
    {
        Artisan::call('optimize:clear');
        Artisan::call('cache:clear');
        Artisan::call('config:clear');
        Artisan::call('route:clear');
        Artisan::call('view:clear');

        $output = Artisan::output();

        return $this->formatResponse($request, 'Caches Cleared Successfully', $output);
    }

    /**
     * Create the symbolic link for storage.
     */
    public function storageLink(Request $request)
    {
        Artisan::call('storage:link');
        $output = Artisan::output();

        return $this->formatResponse($request, 'Storage Link Created Successfully', $output);
    }

    /**
     * Seed default database data.
     */
    public function dbSeed(Request $request)
    {
        Artisan::call('db:seed', ['--force' => true]);
        $output = Artisan::output();

        return $this->formatResponse($request, 'Database Seeded Successfully', $output);
    }

    /**
     * Seed only the Super Admin account.
     */
    public function superAdminSeed(Request $request)
    {
        Artisan::call('db:seed', [
            '--class' => 'SuperAdminSeeder',
            '--force' => true,
        ]);
        $output = Artisan::output();

        return $this->formatResponse($request, 'Super Admin Seeded Successfully', $output);
    }

    /**
     * Run migrations.
     */
    public function migrate(Request $request)
    {
        Artisan::call('migrate', ['--force' => true]);
        $output = Artisan::output();

        return $this->formatResponse($request, 'Migrations Executed Successfully', $output);
    }

    /**
     * Run migrations and seeds together.
     */
    public function migrateSeed(Request $request)
    {
        Artisan::call('migrate', ['--force' => true]);
        Artisan::call('db:seed', ['--force' => true]);
        $output = Artisan::output();

        return $this->formatResponse($request, 'Database Migrated & Seeded Successfully', $output);
    }

    /**
     * Helper to render either JSON or styled HTML response.
     */
    protected function formatResponse(Request $request, string $title, string $output)
    {
        if ($request->wantsJson() || $request->has('json')) {
            return response()->json([
                'status' => 'success',
                'title' => $title,
                'output' => trim($output),
                'timestamp' => now()->toIso8601String(),
            ]);
        }

        $html = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{$title} • Money Machine Maintenance</title>
    <style>
        body {
            margin: 0;
            padding: 24px;
            background: #0b0f19;
            color: #f3f4f6;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 90vh;
        }
        .card {
            width: 100%;
            max-width: 680px;
            background: #111827;
            border: 1px solid #1f2937;
            border-radius: 16px;
            padding: 28px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
        }
        .header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
        }
        .badge {
            display: inline-block;
            background: #059669;
            color: #ffffff;
            font-size: 11px;
            font-weight: 800;
            padding: 4px 10px;
            border-radius: 9999px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        h1 {
            font-size: 20px;
            margin: 0;
            font-weight: 800;
            color: #ffffff;
        }
        pre {
            background: #030712;
            color: #10b981;
            padding: 16px;
            border-radius: 12px;
            font-size: 13px;
            line-height: 1.6;
            overflow-x: auto;
            border: 1px solid #1f2937;
            white-space: pre-wrap;
            margin: 16px 0;
        }
        .nav-links {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 24px;
            padding-top: 20px;
            border-top: 1px solid #1f2937;
        }
        .nav-links a {
            display: inline-flex;
            align-items: center;
            padding: 8px 14px;
            background: #1f2937;
            color: #93c5fd;
            text-decoration: none;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            transition: all 0.2s ease;
        }
        .nav-links a:hover {
            background: #2563eb;
            color: #ffffff;
        }
        .nav-links a.primary {
            background: #10b981;
            color: #ffffff;
        }
        .nav-links a.primary:hover {
            background: #059669;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <span class="badge">SUCCESS</span>
            <h1>{$title}</h1>
        </div>
        <p style="color: #9ca3af; font-size: 13px; margin: 0 0 16px 0;">
            The maintenance command completed execution on Money Machine Core.
        </p>
        <pre>{$output}</pre>
        <div class="nav-links">
            <a href="/clear-cache" class="primary">Clear Cache</a>
            <a href="/storage-link">Storage Link</a>
            <a href="/seed-super-admin">Seed Super Admin</a>
            <a href="/db-seed">Seed Database</a>
            <a href="/login" style="margin-left: auto;">Go to Login &rarr;</a>
            <a href="/dashboard">Dashboard &rarr;</a>
        </div>
    </div>
</body>
</html>
HTML;

        return response($html);
    }
}
