<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\AvisController;
use App\Http\Controllers\AvisRecruteurCandidatController;
use App\Http\Controllers\AvisRecruteurController;
use App\Http\Controllers\CandidatureController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\MetierController;
use App\Http\Controllers\OffreEmploiController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\AdminContactController;
use App\Http\Controllers\Admin\AdminSettingsController;
use App\Http\Controllers\Admin\AdminStatisticsController;
use App\Http\Controllers\CVController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [PasswordResetController::class, 'forgot']);
Route::post('/reset-password', [PasswordResetController::class, 'reset']);
Route::post('/auth/google', [GoogleAuthController::class, 'login']);
Route::post('/auth/google/code', [GoogleAuthController::class, 'exchangeCode']);
Route::post('/auth/google/register', [GoogleAuthController::class, 'register']);
Route::post('/contact', [ContactController::class, 'store']);
Route::get('/offres', [OffreEmploiController::class, 'index']);
Route::get('/offres/{id}', [OffreEmploiController::class, 'show'])->whereNumber('id');
Route::get('/categories', [OffreEmploiController::class, 'categories']);
Route::get('/metiers', [MetierController::class, 'index']);
Route::get('/stats/landing', [DashboardController::class, 'landingStats']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::delete('/notifications', [NotificationController::class, 'destroyAll']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);

    Route::post('/candidat/candidatures', [CandidatureController::class, 'store']);
    Route::get('/candidat/candidatures', [CandidatureController::class, 'candidatIndex']);
    Route::delete('/candidat/candidatures', [CandidatureController::class, 'candidatDestroyAll']);
    Route::delete('/candidat/candidatures/{id}', [CandidatureController::class, 'candidatDestroy']);
    Route::get('/recruteur/candidatures', [CandidatureController::class, 'recruteurIndex']);
    Route::delete('/recruteur/candidatures', [CandidatureController::class, 'destroyAll']);
    Route::patch('/recruteur/candidatures/{id}', [CandidatureController::class, 'updateStatut']);
    Route::delete('/recruteur/candidatures/{id}', [CandidatureController::class, 'destroy']);
    Route::get('/recruteur/candidats/{id}', [CandidatureController::class, 'showCandidat']);

    Route::get('/candidat/cv', [CVController::class, 'index']);
    Route::post('/candidat/cv', [CVController::class, 'store']);
    Route::delete('/candidat/cv/{id}', [CVController::class, 'destroy']);
    Route::get('/cv/{id}/download', [CVController::class, 'download']);

    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    Route::get('/messages', [MessageController::class, 'index']);
    Route::post('/messages', [MessageController::class, 'store']);
    Route::delete('/messages/inbox', [MessageController::class, 'destroyAll']);
    Route::delete('/messages/conversation/{partnerId}', [MessageController::class, 'destroyConversation']);
    Route::put('/messages/{id}', [MessageController::class, 'update']);
    Route::delete('/messages/{id}', [MessageController::class, 'destroy']);
    Route::post('/messages/read/{partnerId}', [MessageController::class, 'markRead']);
    Route::get('/messages/contacts', [MessageController::class, 'contacts']);

    Route::get('/avis', [AvisController::class, 'index']);
    Route::post('/avis', [AvisController::class, 'store']);
    Route::delete('/avis', [AvisController::class, 'destroyAll']);
    Route::delete('/avis/bulk', [AvisController::class, 'destroyMany']);
    Route::delete('/avis/{id}', [AvisController::class, 'destroy']);

    Route::get('/recruteur/avis-candidats/eligibles', [AvisRecruteurCandidatController::class, 'eligibles']);
    Route::get('/recruteur/avis-candidats/{idCandidat}/offres', [AvisRecruteurCandidatController::class, 'offresForCandidat']);
    Route::get('/recruteur/avis-candidats', [AvisRecruteurCandidatController::class, 'indexRecruteur']);
    Route::post('/recruteur/avis-candidats', [AvisRecruteurCandidatController::class, 'store']);
    Route::put('/recruteur/avis-candidats/{id}', [AvisRecruteurCandidatController::class, 'update']);
    Route::delete('/recruteur/avis-candidats/bulk', [AvisRecruteurCandidatController::class, 'destroyMany']);
    Route::delete('/recruteur/avis-candidats/{id}', [AvisRecruteurCandidatController::class, 'destroy']);
    Route::get('/candidat/avis-recruteurs', [AvisRecruteurCandidatController::class, 'indexCandidat']);
    Route::delete('/candidat/avis-recruteurs-recus/bulk', [AvisRecruteurCandidatController::class, 'destroyCandidatMany']);
    Route::delete('/candidat/avis-recruteurs-recus/{id}', [AvisRecruteurCandidatController::class, 'destroyCandidat']);
    Route::get('/candidat/avis-recruteurs/eligibles', [AvisRecruteurController::class, 'eligibles']);
    Route::get('/candidat/avis-recruteurs/{idRecruteur}/offres', [AvisRecruteurController::class, 'offresForRecruteur']);
    Route::get('/candidat/mes-avis-recruteurs', [AvisRecruteurController::class, 'indexCandidat']);
    Route::post('/candidat/avis-recruteurs', [AvisRecruteurController::class, 'store']);
    Route::put('/candidat/avis-recruteurs/{id}', [AvisRecruteurController::class, 'update']);
    Route::delete('/candidat/avis-recruteurs/bulk', [AvisRecruteurController::class, 'destroyMany']);
    Route::delete('/candidat/avis-recruteurs/{id}', [AvisRecruteurController::class, 'destroy']);
    Route::get('/recruteur/avis-recruteurs-recus', [AvisRecruteurController::class, 'indexRecruteur']);
    Route::delete('/recruteur/avis-recruteurs-recus/bulk', [AvisRecruteurController::class, 'destroyRecruteurMany']);
    Route::delete('/recruteur/avis-recruteurs-recus/{id}', [AvisRecruteurController::class, 'destroyRecruteur']);

    Route::get('/recruteur/offres', [OffreEmploiController::class, 'recruteurOffres']);
    Route::post('/recruteur/offres', [OffreEmploiController::class, 'store']);
    Route::patch('/recruteur/offres/{id}/publish', [OffreEmploiController::class, 'publish']);
    Route::put('/recruteur/offres/{id}', [OffreEmploiController::class, 'update']);
    // POST requis pour modifier une offre avec image (PHP ne parse pas multipart/form-data en PUT).
    Route::post('/recruteur/offres/{id}', [OffreEmploiController::class, 'update']);
    Route::delete('/recruteur/offres/{id}', [OffreEmploiController::class, 'destroy']);

    Route::get('/admin/utilisateurs', [AdminController::class, 'utilisateurs']);
    Route::get('/admin/utilisateurs/{id}', [AdminController::class, 'showUser']);
    Route::patch('/admin/utilisateurs/{id}/suspend', [AdminController::class, 'suspendUser']);
    Route::patch('/admin/utilisateurs/{id}/activate', [AdminController::class, 'activateUser']);
    Route::post('/admin/utilisateurs/{id}/warn', [AdminController::class, 'warnUser']);
    Route::delete('/admin/utilisateurs/{id}', [AdminController::class, 'destroyUser']);

    Route::get('/admin/offres', [AdminController::class, 'offres']);
    Route::get('/admin/offres/{id}', [AdminController::class, 'showOffre']);
    Route::patch('/admin/offres/{id}/suspend', [AdminController::class, 'suspendOffre']);
    Route::patch('/admin/offres/{id}/hide', [AdminController::class, 'hideOffre']);
    Route::patch('/admin/offres/{id}/unhide', [AdminController::class, 'unhideOffre']);
    Route::delete('/admin/offres/{id}', [AdminController::class, 'destroyOffre']);

    Route::get('/admin/categories', [AdminController::class, 'categories']);
    Route::post('/admin/categories', [AdminController::class, 'storeCategorie']);
    Route::put('/admin/categories/{id}', [AdminController::class, 'updateCategorie']);
    Route::delete('/admin/categories/{id}', [AdminController::class, 'destroyCategorie']);
    Route::get('/admin/metiers', [AdminController::class, 'metiers']);
    Route::post('/admin/metiers', [AdminController::class, 'storeMetier']);
    Route::put('/admin/metiers/{id}', [AdminController::class, 'updateMetier']);
    Route::delete('/admin/metiers/{id}', [AdminController::class, 'destroyMetier']);

    Route::get('/admin/contact-messages/unread-count', [AdminContactController::class, 'unreadCount']);
    Route::get('/admin/contact-messages', [AdminContactController::class, 'index']);
    Route::post('/admin/contact-messages/mark-read', [AdminContactController::class, 'markContactRead']);
    Route::delete('/admin/contact-messages/replies', [AdminContactController::class, 'clearAllReplies']);
    Route::delete('/admin/contact-messages/contact-replies', [AdminContactController::class, 'clearContactReplies']);
    Route::get('/admin/contact-messages/{id}', [AdminContactController::class, 'show']);
    Route::post('/admin/contact-messages/{id}/reply', [AdminContactController::class, 'reply']);
    Route::patch('/admin/contact-messages/{id}/reply', [AdminContactController::class, 'updateReply']);
    Route::delete('/admin/contact-messages/{id}/reply', [AdminContactController::class, 'clearReply']);
    Route::delete('/admin/contact-messages', [AdminContactController::class, 'destroyAll']);
    Route::delete('/admin/contact-messages/{id}', [AdminContactController::class, 'destroy']);

    Route::get('/admin/candidatures', [AdminController::class, 'candidatures']);
    Route::delete('/admin/candidatures/{id}', [AdminController::class, 'destroyCandidature']);

    Route::get('/admin/avis', [AdminController::class, 'avis']);
    Route::patch('/admin/avis/hide', [AdminController::class, 'hideAvis']);
    Route::patch('/admin/avis/unhide', [AdminController::class, 'unhideAvis']);
    Route::delete('/admin/avis', [AdminController::class, 'destroyAvis']);
    Route::delete('/admin/avis/all', [AdminController::class, 'destroyAllAvis']);
    Route::patch('/admin/avis/signal', [AdminController::class, 'signalAvis']);

    Route::get('/admin/statistiques', [AdminStatisticsController::class, 'index']);
    Route::get('/admin/settings', [AdminSettingsController::class, 'show']);
    Route::put('/admin/settings', [AdminSettingsController::class, 'update']);

    Route::post('/profile', [ProfileController::class, 'update']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);
});
