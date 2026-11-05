<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'application' => 'InJob API',
        'version' => '1.0.0',
        'status' => 'running',
    ]);
});
