<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;

class DocumentationController extends Controller
{
    private array $docs = [
        'readme' => [
            'title' => 'Accueil',
            'file' => 'README.md',
            'icon' => 'home',
        ],
        'installation' => [
            'title' => 'Installation',
            'file' => 'docs/installation.md',
            'icon' => 'download',
        ],
        'telegram' => [
            'title' => 'Configuration Telegram',
            'file' => 'docs/telegram-setup.md',
            'icon' => 'send',
        ],
        'api' => [
            'title' => 'API Reference',
            'file' => 'docs/api.md',
            'icon' => 'code',
        ],
    ];

    public function index(string $page = 'readme')
    {
        if (! isset($this->docs[$page])) {
            $page = 'readme';
        }

        $doc = $this->docs[$page];
        $filePath = base_path($doc['file']);

        $content = File::exists($filePath)
            ? File::get($filePath)
            : '# Documentation non trouvée';

        return Inertia::render('admin/documentation/Index', [
            'content' => $content,
            'currentPage' => $page,
            'pages' => collect($this->docs)->map(fn ($d, $key) => [
                'key' => $key,
                'title' => $d['title'],
                'icon' => $d['icon'],
            ])->values()->all(),
        ]);
    }
}
