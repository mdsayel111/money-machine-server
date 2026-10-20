<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $search = trim($request->input('search', ''));
        $category = $request->input('category');
        $platform = $request->input('platform');

        $tasks = Task::when($search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%");
            })
            ->when($category, function ($query, $category) {
                $query->where('category', $category);
            })
            ->when($platform, function ($query, $platform) {
                $query->where('platform', $platform);
            })
            ->withCount('submissions')
            ->orderBy('id', 'desc')
            ->paginate(12)
            ->withQueryString();

        return inertia('tasks/index', [
            'tasks' => $tasks,
            'filters' => [
                'search' => $search,
                'category' => $category,
                'platform' => $platform,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'platform' => 'required|string',
            'category' => 'required|string',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'reward' => 'required|numeric|min:0.5',
            'reward_suffix' => 'nullable|string',
            'time_estimate' => 'required|string',
            'remaining_slots' => 'nullable|string',
            'limit_notice' => 'nullable|string',
            'description' => 'nullable|string',
            'action_url' => 'nullable|string',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ]);

        Task::create($validated);

        return redirect()->back()->with('success', 'Task created successfully.');
    }

    public function show(Task $task)
    {
        return response()->json($task);
    }

    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'platform' => 'required|string',
            'category' => 'required|string',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'reward' => 'required|numeric|min:0.5',
            'reward_suffix' => 'nullable|string',
            'time_estimate' => 'required|string',
            'remaining_slots' => 'nullable|string',
            'limit_notice' => 'nullable|string',
            'description' => 'nullable|string',
            'action_url' => 'nullable|string',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $task->update($validated);

        return redirect()->back()->with('success', 'Task updated successfully.');
    }

    public function destroy(Task $task)
    {
        $task->delete();

        return redirect()->back()->with('success', 'Task deleted successfully.');
    }
}
