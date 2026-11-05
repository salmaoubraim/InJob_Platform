<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PlatformSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminSettingsController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }

        return response()->json(['data' => $this->format(PlatformSetting::current())]);
    }

    public function update(Request $request): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }

        $validated = $request->validate([
            'site_name' => ['sometimes', 'string', 'max:120'],
            'default_language' => ['sometimes', 'in:fr'],
            'dark_mode' => ['sometimes', 'boolean'],
            'notify_inscriptions' => ['sometimes', 'boolean'],
            'notify_offres' => ['sometimes', 'boolean'],
            'notify_candidatures' => ['sometimes', 'boolean'],
            'notify_support' => ['sometimes', 'boolean'],
            'notify_avis' => ['sometimes', 'boolean'],
            'notify_security' => ['sometimes', 'boolean'],
            'maintenance_mode' => ['sometimes', 'boolean'],
            'session_timeout_minutes' => ['sometimes', 'nullable', 'integer', 'min:5', 'max:1440'],
        ]);

        $settings = PlatformSetting::current();
        $settings->fill($validated);
        $settings->save();

        return response()->json([
            'message' => 'Paramètres enregistrés.',
            'data' => $this->format($settings->fresh()),
        ]);
    }

    private function ensureAdmin(Request $request): ?JsonResponse
    {
        if ($request->user()?->role !== 'admin') {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        return null;
    }

    private function format(PlatformSetting $s): array
    {
        return [
            'site_name' => $s->site_name ?? 'InJob',
            'default_language' => $s->default_language ?? 'fr',
            'dark_mode' => (bool) ($s->dark_mode ?? false),
            'notify_inscriptions' => (bool) ($s->notify_inscriptions ?? true),
            'notify_offres' => (bool) ($s->notify_offres ?? true),
            'notify_candidatures' => (bool) ($s->notify_candidatures ?? true),
            'notify_support' => (bool) ($s->notify_support ?? true),
            'notify_avis' => (bool) ($s->notify_avis ?? true),
            'notify_security' => (bool) ($s->notify_security ?? true),
            'maintenance_mode' => (bool) ($s->maintenance_mode ?? false),
            'session_timeout_minutes' => $s->session_timeout_minutes,
            'updated_at' => $s->updated_at?->toIso8601String(),
        ];
    }
}
