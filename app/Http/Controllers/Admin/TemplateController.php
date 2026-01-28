<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTemplateRequest;
use App\Http\Requests\Admin\UpdateTemplateRequest;
use App\Models\MessageTemplate;
use Illuminate\Http\RedirectResponse;
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

    public function store(StoreTemplateRequest $request): RedirectResponse
    {
        $validated = $request->validated();

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

    public function update(UpdateTemplateRequest $request, MessageTemplate $template): RedirectResponse
    {
        $template->update($request->validated());

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
