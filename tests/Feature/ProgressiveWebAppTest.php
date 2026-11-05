<?php

it('includes mobile app installation metadata in the application shell', function () {
    $this->get(route('student.login'))
        ->assertOk()
        ->assertSee('rel="manifest" href="/system/manifest.webmanifest"', false)
        ->assertSee('apple-touch-icon.png', false)
        ->assertSee('name="theme-color"', false);
});

it('provides the install icons and offline page declared by the app manifest', function () {
    $manifest = json_decode(
        file_get_contents(public_path('manifest.webmanifest')),
        true,
        flags: JSON_THROW_ON_ERROR,
    );

    expect($manifest['display'])->toBe('standalone')
        ->and($manifest['icons'])->toHaveCount(3)
        ->and($manifest['shortcuts'])->toContain([
            'name' => 'Admin Portal',
            'short_name' => 'Admin',
            'url' => '/login',
            'icons' => [
                [
                    'src' => '/icons/accentra-192.png',
                    'sizes' => '192x192',
                    'type' => 'image/png',
                ],
            ],
        ]);

    foreach ($manifest['icons'] as $icon) {
        expect(file_exists(public_path(ltrim($icon['src'], '/'))))->toBeTrue();
    }

    expect(file_exists(public_path('offline.html')))->toBeTrue()
        ->and(file_exists(public_path('sw.js')))->toBeTrue();
});

it('caches visited pages for offline viewing and clears private pages on logout', function () {
    $serviceWorker = file_get_contents(public_path('sw.js'));

    expect($serviceWorker)
        ->toContain("request.mode === 'navigate'")
        ->toContain("caches.open(PAGE_CACHE_NAME)")
        ->toContain("await pageCache.match(request)")
        ->toContain("await caches.delete(PAGE_CACHE_NAME)")
        ->toContain("'/student/logout'")
        ->toContain("'/faculty/logout'");
});

it('checks for app updates when the device reconnects and activates them automatically', function () {
    $installComponent = file_get_contents(
        resource_path('js/components/pwa/installAppButton.tsx'),
    );
    $serviceWorker = file_get_contents(public_path('sw.js'));

    expect($installComponent)
        ->toContain("register('/sw.js', { updateViaCache: 'none' })")
        ->toContain("window.addEventListener('online', checkForUpdates)")
        ->toContain('serviceWorkerRegistration')
        ->toContain('.update()')
        ->and($serviceWorker)
        ->toContain("type === 'SKIP_WAITING'")
        ->toContain('self.skipWaiting()');
});

it('shows the app download action across all application pages', function () {
    $appEntry = file_get_contents(resource_path('js/app.tsx'));

    expect($appEntry)
        ->toContain("import InstallAppButton from './components/pwa/installAppButton'")
        ->toContain('<InstallAppButton />');
});

it('shows the app icon startup animation on initial launch', function () {
    $appEntry = file_get_contents(resource_path('js/app.tsx'));
    $startupAnimation = file_get_contents(
        resource_path('js/components/pwa/appStartupAnimation.tsx'),
    );
    $styles = file_get_contents(resource_path('css/app.css'));

    expect($appEntry)
        ->toContain('<AppStartupAnimation />')
        ->and($startupAnimation)
        ->toContain('src="/icons/accentra-192.png"')
        ->toContain("prefers-reduced-motion: reduce")
        ->and($styles)
        ->toContain('@keyframes accentra-startup-icon')
        ->toContain('@keyframes accentra-startup-exit')
        ->toContain('1.35s ease-in 200ms forwards')
        ->toContain('650ms ease-out 350ms both');
});
