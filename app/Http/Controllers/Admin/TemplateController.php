<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MessageTemplate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TemplateController extends Controller
{
    public function index(): Response
    {
        $templates = MessageTemplate::with('creator')
            ->latest()
            ->paginate(20);

        return Inertia::render('admin/templates/Index', [
            'templates' => $templates,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/templates/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string', 'max:4096'],
        ]);

        MessageTemplate::create([
            ...$validated,
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('admin.templates.index')
            ->with('success', "Le template {$validated['name']} a été créé.");
    }

    public function edit(MessageTemplate $template): Response
    {
        return Inertia::render('admin/templates/Edit', [
            'template' => $template,
        ]);
    }

    public function update(Request $request, MessageTemplate $template): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string', 'max:4096'],
            'is_active' => ['boolean'],
        ]);

        $template->update($validated);

        return redirect()->route('admin.templates.index')
            ->with('success', "Le template {$template->name} a été mis à jour.");
    }

    public function destroy(MessageTemplate $template): RedirectResponse
    {
        $template->delete();

        return redirect()->route('admin.templates.index')
            ->with('success', 'Le template a été supprimé.');
    }
}
