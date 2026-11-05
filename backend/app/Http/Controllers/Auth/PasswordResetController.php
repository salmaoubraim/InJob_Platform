<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    public function forgot(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $email = strtolower(trim($validated['email']));
        $user = Utilisateur::whereRaw('LOWER(email) = ?', [$email])->first();

        $payload = [
            'message' => 'Si cet email existe dans InJob, un lien de réinitialisation a été généré.',
        ];

        if (! $user) {
            return response()->json($payload);
        }

        $plainToken = Str::random(64);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            ['token' => Hash::make($plainToken), 'created_at' => now()]
        );

        $frontend = rtrim(config('app.frontend_url', 'http://localhost/injob'), '/');
        $resetUrl = $frontend.'/reinitialiser-mot-de-passe?'.http_build_query([
            'email' => $email,
            'token' => $plainToken,
        ]);

        if (config('app.debug')) {
            $payload['reset_url'] = $resetUrl;
            $payload['hint'] = 'Mode développement : utilisez ce lien (aucun email envoyé).';
        }

        return response()->json($payload);
    }

    public function reset(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
            'mot_de_passe' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $email = strtolower(trim($validated['email']));
        $row = DB::table('password_reset_tokens')->where('email', $email)->first();

        if (! $row || ! Hash::check($validated['token'], $row->token)) {
            return response()->json(['message' => 'Lien invalide ou expiré.'], 422);
        }

        $created = $row->created_at ? strtotime($row->created_at) : 0;
        if ($created && (time() - $created) > 3600) {
            DB::table('password_reset_tokens')->where('email', $email)->delete();

            return response()->json(['message' => 'Le lien a expiré (1 h). Demandez un nouveau lien.'], 422);
        }

        $user = Utilisateur::whereRaw('LOWER(email) = ?', [$email])->first();
        if (! $user) {
            return response()->json(['message' => 'Utilisateur introuvable.'], 404);
        }

        $user->forceFill(['mot_de_passe' => $validated['mot_de_passe']])->save();
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        return response()->json(['message' => 'Mot de passe mis à jour. Vous pouvez vous connecter.']);
    }
}
