<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Messaging\WhatsAppBaileysChannel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WhatsAppController extends Controller
{
    public function __construct(
        private WhatsAppBaileysChannel $whatsapp
    ) {}

    public function index()
    {
        $status = $this->whatsapp->getStatus();
        $qrCode = null;

        if (($status['status'] ?? '') === 'qr_ready' && ($status['hasQR'] ?? false)) {
            $qrCode = $this->whatsapp->getQrCode();
        }

        return Inertia::render('admin/whatsapp/Index', [
            'status' => $status,
            'qrCode' => $qrCode,
        ]);
    }

    public function status()
    {
        $status = $this->whatsapp->getStatus();
        $qrCode = null;

        if (($status['status'] ?? '') === 'qr_ready' && ($status['hasQR'] ?? false)) {
            $qrCode = $this->whatsapp->getQrCode();
        }

        return response()->json([
            'status' => $status,
            'qrCode' => $qrCode,
        ]);
    }

    public function logout()
    {
        $success = $this->whatsapp->logout();

        if ($success) {
            return back()->with('success', 'Déconnecté de WhatsApp');
        }

        return back()->with('error', 'Erreur lors de la déconnexion');
    }

    public function reconnect()
    {
        $success = $this->whatsapp->reconnect();

        if ($success) {
            return back()->with('success', 'Reconnexion en cours...');
        }

        return back()->with('error', 'Erreur lors de la reconnexion');
    }
}
