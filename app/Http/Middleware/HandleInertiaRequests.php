<?php

namespace App\Http\Middleware;

use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $generalSetting = SystemSetting::where('key', 'general')->first();
        $generalSettings = $generalSetting?->value ?? [];
        $logoPath = $generalSettings['logoPath'] ?? null;
        $logoUrl = $logoPath ? Storage::disk('public')->url($logoPath) : null;
        

        if ($logoUrl) {
            $logoUrl .= '?v='.urlencode((string) $generalSetting?->updated_at?->timestamp);
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'csrfToken' => csrf_token(),
            'branding' => [
                'systemName' => $generalSettings['systemName'] ?? config('app.name', 'ACCENTRA'),
                'logoUrl' => $logoUrl,
            ],
            'auth' => [
                'user' => $request->user() ?? $request->user('student'),
            ],

            'flash' => [
            'success' => fn () => $request->session()->get('success'),
            'error' => fn () => $request->session()->get('error'),
            ],
        ];
        

    }
}
