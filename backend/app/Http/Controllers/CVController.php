<?php



namespace App\Http\Controllers;



use App\Models\Candidat;

use App\Models\Candidature;

use App\Models\CV;

use App\Models\Recruteur;

use Illuminate\Http\JsonResponse;

use Illuminate\Http\Request;

use Symfony\Component\HttpFoundation\BinaryFileResponse;



class CVController extends Controller

{

    public function index(Request $request): JsonResponse

    {

        $candidat = Candidat::where('id_user', $request->user()->id_user)->first();



        if (! $candidat) {

            return response()->json(['data' => []]);

        }



        $cvs = CV::where('id_candidat', $candidat->id_candidat)
            ->orderByDesc('id_cv')
            ->get();



        return response()->json([

            'data' => $cvs->map(fn ($cv) => $this->format($cv)),

        ]);

    }



    public function store(Request $request): JsonResponse

    {

        $candidat = Candidat::where('id_user', $request->user()->id_user)->first();



        if (! $candidat) {

            return response()->json(['message' => 'Profil candidat introuvable.'], 403);

        }



        $request->validate([

            'fichier' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:5120'],

        ], [

            'fichier.mimes' => 'Format accepté : PDF, DOC ou DOCX.',

            'fichier.max' => 'Taille maximale : 5 Mo.',

        ]);



        $dir = public_path('cvs');

        if (! is_dir($dir)) {

            mkdir($dir, 0755, true);

        }



        $file = $request->file('fichier');

        $original = $file->getClientOriginalName();

        $name = 'cv_'.$candidat->id_candidat.'_'.time().'.'.$file->getClientOriginalExtension();

        $file->move($dir, $name);

        $path = '/cvs/'.$name;



        CV::where('id_candidat', $candidat->id_candidat)->delete();



        $cv = CV::create([

            'id_candidat' => $candidat->id_candidat,

            'nom_fichier' => $original,

            'chemin_fichier' => $path,

        ]);



        return response()->json([

            'message' => 'CV téléversé avec succès.',

            'data' => $this->format($cv),

        ], 201);

    }



    public function download(Request $request, int $id): BinaryFileResponse|JsonResponse

    {

        $cv = $this->resolveCv($request, $id);

        $full = $this->ensureCvFileOnDisk($cv);



        return response()->download($full, $cv->nom_fichier);

    }



    public function destroy(Request $request, int $id): JsonResponse

    {

        $cv = $this->resolveCv($request, $id, ownOnly: true);

        $full = public_path(ltrim($cv->chemin_fichier, '/'));

        if (is_file($full)) {

            @unlink($full);

        }

        $cv->delete();



        return response()->json(['message' => 'CV supprimé.']);

    }



    private function resolveCv(Request $request, int $id, bool $ownOnly = false): CV

    {

        $user = $request->user();



        if ($user->role === 'candidat' || $ownOnly) {

            $candidat = Candidat::where('id_user', $user->id_user)->firstOrFail();



            return CV::where('id_candidat', $candidat->id_candidat)->findOrFail($id);

        }



        if ($user->role === 'recruteur') {

            $recruteur = Recruteur::where('id_user', $user->id_user)->firstOrFail();

            $cv = CV::with('candidat')->findOrFail($id);



            $allowed = Candidature::where('id_candidat', $cv->id_candidat)

                ->whereHas('offre', fn ($q) => $q->where('id_recruteur', $recruteur->id_recruteur))

                ->exists();



            if (! $allowed) {

                abort(403, 'Accès au CV non autorisé.');

            }



            return $cv;

        }



        if ($user->role === 'admin') {

            return CV::findOrFail($id);

        }



        abort(403);

    }



    private function ensureCvFileOnDisk(CV $cv): string

    {

        $full = public_path(ltrim($cv->chemin_fichier, '/'));



        if (is_file($full)) {

            return $full;

        }



        $dir = dirname($full);

        if (! is_dir($dir)) {

            mkdir($dir, 0755, true);

        }



        $candidat = $cv->candidat;
        $cv->loadMissing('candidat.utilisateur');
        $cv->loadMissing('candidat.utilisateur');
        $candidat = $cv->candidat;
        $prenom = $candidat?->utilisateur?->prenom ?? 'Candidat';

        $content = "CV InJob — {$cv->nom_fichier}\n\n";

        $content .= "Candidat : {$prenom}\n";

        $content .= "Compétences et expérience disponibles sur le profil InJob.\n";



        file_put_contents($full, $content);



        return $full;

    }



    private function format(CV $cv): array

    {

        return [

            'id_cv' => $cv->id_cv,

            'nom_fichier' => $cv->nom_fichier,

            'chemin_fichier' => $cv->chemin_fichier,

            'url' => url($cv->chemin_fichier),
        ];

    }

}


